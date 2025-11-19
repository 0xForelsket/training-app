import { getEmployeeById, getSkills } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ValidateSkillDialog from './validate-skill-dialog';

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const employee = await getEmployeeById(id);
    const skills = await getSkills();

    if (!employee) {
        notFound();
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{employee.name}</h1>
                    <p className="text-muted-foreground">
                        {employee.department} • {employee.employeeNumber}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/employees/${employee.id}/license`}>
                        <Button variant="outline">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            License Card
                        </Button>
                    </Link>
                    <ValidateSkillDialog
                        employeeId={employee.id}
                        skills={skills}
                        trainings={employee.trainings}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-lg">{employee.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Company Number</p>
                        <p className="text-lg">{employee.employeeNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-lg">{employee.department || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Date Hired</p>
                        <p className="text-lg">{employee.dateHired.toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Training Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Skill Code</TableHead>
                                <TableHead>Skill Name</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Evidence</TableHead>
                                <TableHead>Date Validated</TableHead>
                                <TableHead>Validator</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employee.trainings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-500">
                                        No training records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employee.trainings.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{record.skill.code}</TableCell>
                                        <TableCell>
                                            {record.skill.documentUrl ? (
                                                <a
                                                    href={record.skill.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {record.skill.name}
                                                </a>
                                            ) : (
                                                record.skill.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                {record.level}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                                            {record.validatorNotes ? (
                                                record.validatorNotes
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {record.evidenceUrl ? (
                                                <a
                                                    href={record.evidenceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{record.dateValidated.toLocaleDateString()}</TableCell>
                                        <TableCell>{record.validator.username}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
