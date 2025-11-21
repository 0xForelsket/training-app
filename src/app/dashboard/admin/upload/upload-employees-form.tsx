'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bulkCreateEmployees } from '@/app/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type EmployeeCsvRow = {
    name: string;
    employeeNumber: string;
    department?: string;
    dateHired: string;
    shift: string;
};

type PreviewRow<T> = {
    index: number;
    data: Partial<T>;
    valid: boolean;
    errors: string[];
};

type BulkUploadResult = {
    totalRows: number;
    successCount: number;
    failureCount: number;
    rows: {
        index: number;
        identifier: string;
        status: 'success' | 'failed';
        message: string;
    }[];
};

const EmployeeCsvSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    employeeNumber: z.string().min(1, 'Employee Number is required'),
    department: z.string().optional(),
    dateHired: z
        .string()
        .min(1, 'Date Hired is required')
        .refine((value) => !Number.isNaN(new Date(value).getTime()), {
            message: 'Date must be YYYY-MM-DD',
        }),
    shift: z
        .string()
        .optional()
        .transform((value) => (value ? value.toUpperCase().trim() : 'DAY'))
        .refine((value) => value === 'DAY' || value === 'NIGHT', {
            message: 'Shift must be DAY or NIGHT',
        }),
});

const isEmptyRow = (row: Record<string, unknown>) =>
    Object.values(row).every((value) => (value === null || value === undefined || `${value}`.trim().length === 0));

export function UploadEmployeesForm() {
    const [previewRows, setPreviewRows] = useState<PreviewRow<EmployeeCsvRow>[]>([]);
    const [validRows, setValidRows] = useState<EmployeeCsvRow[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [result, setResult] = useState<BulkUploadResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);
        setResult(null);

        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (parseResult) => {
                const rows: PreviewRow<EmployeeCsvRow>[] = [];
                const valid: EmployeeCsvRow[] = [];

                parseResult.data.forEach((rawRow, idx) => {
                    if (isEmptyRow(rawRow)) {
                        return;
                    }

                    const normalizedRow = Object.fromEntries(
                        Object.entries(rawRow).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
                    );

                    const validation = EmployeeCsvSchema.safeParse(normalizedRow);
                    if (validation.success) {
                        valid.push(validation.data as EmployeeCsvRow);
                    }
                    rows.push({
                        index: idx + 2, // account for header row
                        data: normalizedRow as Partial<EmployeeCsvRow>,
                        valid: validation.success,
                        errors: validation.success ? [] : validation.error.errors.map((err) => err.message),
                    });
                });

                setPreviewRows(rows);
                setValidRows(valid);
            },
            error: (error) => {
                console.error(error);
                setUploadError('Failed to parse CSV file.');
            },
        });
    };

    const handleUpload = async () => {
        if (validRows.length === 0) {
            setUploadError('No valid rows to upload.');
            return;
        }
        setUploading(true);
        setUploadError(null);

        try {
            const response = await bulkCreateEmployees(validRows);
            if (!('rows' in response)) {
                setUploadError(response.message || 'Upload failed.');
                setResult(null);
            } else {
                setResult(response as BulkUploadResult);
            }
        } catch (error) {
            console.error(error);
            setUploadError('Unexpected error during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-2">
                    <div>
                        <CardTitle>Upload Employees</CardTitle>
                        <CardDescription>
                            CSV Headers: name, employeeNumber, department, dateHired, shift (DAY or NIGHT)
                        </CardDescription>
                    </div>
                    <a
                        href="/templates/employee-upload-template.csv"
                        download
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Download CSV template
                    </a>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="employee-file">CSV File</Label>
                    <Input id="employee-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleUpload} disabled={validRows.length === 0 || uploading}>
                        {uploading
                            ? 'Uploading...'
                            : validRows.length > 0
                                ? `Upload ${validRows.length} Employees`
                                : 'Upload Employees'}
                    </Button>
                    {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                </div>

                {previewRows.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Preview ({validRows.length} valid / {previewRows.length} rows)</span>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Row</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Employee #</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Date Hired</TableHead>
                                        <TableHead>Shift</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewRows.map((row) => (
                                        <TableRow key={row.index}>
                                            <TableCell>Row {row.index}</TableCell>
                                            <TableCell>{row.data.name || '-'}</TableCell>
                                            <TableCell>{row.data.employeeNumber || '-'}</TableCell>
                                            <TableCell>{row.data.department || '-'}</TableCell>
                                            <TableCell>{row.data.dateHired || '-'}</TableCell>
                                            <TableCell>{row.data.shift || '-'}</TableCell>
                                            <TableCell>
                                                {row.valid ? (
                                                    <Badge variant="secondary">Ready</Badge>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <Badge variant="destructive">Needs fixes</Badge>
                                                        {row.errors.map((error, i) => (
                                                            <p key={i} className="text-xs text-muted-foreground">
                                                                {error}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium">
                                Upload result: {result.successCount} succeeded / {result.failureCount} failed
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Total rows processed: {result.totalRows}
                            </p>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Row</TableHead>
                                        <TableHead>Identifier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.rows.map((row, index) => (
                                        <TableRow key={`${row.identifier}-${index}`}>
                                            <TableCell>{row.index}</TableCell>
                                            <TableCell>{row.identifier}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={row.status === 'success' ? 'secondary' : 'destructive'}
                                                >
                                                    {row.status === 'success' ? 'Imported' : 'Failed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {row.message}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
