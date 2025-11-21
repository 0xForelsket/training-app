import { getUploadHistory } from '@/app/lib/data';
import { UploadEmployeesForm } from './upload-employees-form';
import { UploadSkillsForm } from './upload-skills-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function UploadPage() {
    const uploadLogs = await getUploadHistory(10);

    const statusVariant = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'secondary';
            case 'FAILED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Upload</h1>
                <p className="text-muted-foreground">Import data from CSV files.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <UploadEmployeesForm />
                <UploadSkillsForm />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>Audit trail for the last 10 bulk uploads.</CardDescription>
                </CardHeader>
                <CardContent>
                    {uploadLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No uploads recorded yet.</p>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Success</TableHead>
                                        <TableHead>Failures</TableHead>
                                        <TableHead>Requested By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.createdAt.toLocaleString()}</TableCell>
                                            <TableCell>{log.type}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {log.successCount} / {log.totalRows}
                                            </TableCell>
                                            <TableCell>{log.failureCount}</TableCell>
                                            <TableCell>{log.user?.username || 'System'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
