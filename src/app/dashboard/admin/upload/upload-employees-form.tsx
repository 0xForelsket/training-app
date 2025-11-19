'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bulkCreateEmployees } from '@/app/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UploadEmployeesForm() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ count: number; errors: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const res = await bulkCreateEmployees(results.data);
                setResult(res);
                setLoading(false);
            },
            error: (error) => {
                console.error(error);
                setLoading(false);
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Employees</CardTitle>
                <CardDescription>CSV Headers: name, employeeNumber, department, dateHired</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="employee-file">CSV File</Label>
                    <Input id="employee-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <Button onClick={handleUpload} disabled={!file || loading}>
                    {loading ? 'Uploading...' : 'Upload Employees'}
                </Button>
                {result && (
                    <div className="mt-4 text-sm">
                        <p className="text-green-600">Successfully imported {result.count} employees.</p>
                        {result.errors.length > 0 && (
                            <div className="mt-2 text-red-600">
                                <p className="font-bold">Errors:</p>
                                <ul className="list-disc list-inside">
                                    {result.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
