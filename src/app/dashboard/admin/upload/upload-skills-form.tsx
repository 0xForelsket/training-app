'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bulkCreateSkills } from '@/app/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type SkillCsvRow = {
    code: string;
    name: string;
    description?: string;
    project?: string;
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

const SkillCsvSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    project: z.string().optional(),
});

const isEmptyRow = (row: Record<string, unknown>) =>
    Object.values(row).every((value) => (value === null || value === undefined || `${value}`.trim().length === 0));

export function UploadSkillsForm() {
    const [previewRows, setPreviewRows] = useState<PreviewRow<SkillCsvRow>[]>([]);
    const [validRows, setValidRows] = useState<SkillCsvRow[]>([]);
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
                const rows: PreviewRow<SkillCsvRow>[] = [];
                const valid: SkillCsvRow[] = [];

                parseResult.data.forEach((rawRow, idx) => {
                    if (isEmptyRow(rawRow)) {
                        return;
                    }

                    const normalizedRow = Object.fromEntries(
                        Object.entries(rawRow).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
                    );

                    const validation = SkillCsvSchema.safeParse(normalizedRow);
                    if (validation.success) {
                        valid.push(validation.data as SkillCsvRow);
                    }
                    rows.push({
                        index: idx + 2,
                        data: normalizedRow as Partial<SkillCsvRow>,
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
            const response = await bulkCreateSkills(validRows);
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
                        <CardTitle>Upload Skills</CardTitle>
                        <CardDescription>CSV Headers: code, name, description, project</CardDescription>
                    </div>
                    <a
                        href="/templates/skill-upload-template.csv"
                        download
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Download CSV template
                    </a>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="skill-file">CSV File</Label>
                    <Input id="skill-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleUpload} disabled={validRows.length === 0 || uploading}>
                        {uploading
                            ? 'Uploading...'
                            : validRows.length > 0
                                ? `Upload ${validRows.length} Skills`
                                : 'Upload Skills'}
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
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewRows.map((row) => (
                                        <TableRow key={row.index}>
                                            <TableCell>Row {row.index}</TableCell>
                                            <TableCell>{row.data.code || '-'}</TableCell>
                                            <TableCell>{row.data.name || '-'}</TableCell>
                                            <TableCell>{row.data.description || '-'}</TableCell>
                                            <TableCell>{row.data.project || '-'}</TableCell>
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
