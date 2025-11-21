import { evaluateRecertification, getEmployeeById, getSkills } from '@/app/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ValidateSkillDialog from './validate-skill-dialog';
import AssignTrainingDialog from './assign-training-dialog';
import { RemindAssignmentButton } from './remind-assignment-button';
import { EditEmployeeDialog } from './edit-employee-dialog';
import { AddEmployeeNoteForm } from './add-note-form';
import { CopyProfileLinkButton } from './copy-profile-link-button';

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const employee = await getEmployeeById(id);
    const skills = await getSkills();

    if (!employee) {
        notFound();
    }

    const assignments = employee.assignments || [];
    const trainings = employee.trainings || [];
    const notes = employee.notes || [];
    const now = new Date().getTime();
    const openAssignments = assignments.filter((assignment) => assignment.status !== 'COMPLETED');
    const overdueAssignments = openAssignments.filter((assignment) =>
        assignment.dueDate.getTime() < now,
    );
    const recentTrainings = trainings.slice(0, 5);
    const shiftLabel = employee.shift === 'NIGHT' ? 'Night Shift' : 'Day Shift';
    const csvExportUrl = `/api/employees/${employee.employeeNumber}/training`;

    const recertifications = trainings
        .map((record) =>
            evaluateRecertification({
                ...record,
                employee: {
                    id: employee.employeeNumber,
                    name: employee.name,
                    employeeNumber: employee.employeeNumber,
                },
            }),
        )
        .filter((item): item is NonNullable<ReturnType<typeof evaluateRecertification>> => !!item);

    const actionableRecerts = recertifications
        .filter((item) => item.status !== 'CURRENT')
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
    const expiringSoonCount = actionableRecerts.length;

    const editEmployeePayload = {
        id: employee.employeeNumber,
        name: employee.name,
        employeeNumber: employee.employeeNumber,
        department: employee.department,
        shift: employee.shift,
        dateHired: employee.dateHired.toISOString().split('T')[0],
    };

    const getAssignmentStatus = (assignment: (typeof assignments)[number]) => {
        const dueDate = assignment.dueDate as Date;
        const isOverdue =
            assignment.status !== 'COMPLETED' && dueDate.getTime() < new Date().getTime();

        if (isOverdue) {
            return { label: 'Overdue', variant: 'destructive' as const };
        }

        if (assignment.status === 'IN_PROGRESS') {
            return { label: 'In Progress', variant: 'secondary' as const };
        }

        if (assignment.status === 'COMPLETED') {
            return { label: 'Completed', variant: 'default' as const };
        }

        return { label: 'Pending', variant: 'outline' as const };
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{employee.name}</h1>
                    <p className="text-muted-foreground">
                        {employee.department || 'No department'} • {employee.employeeNumber}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <EditEmployeeDialog employee={editEmployeePayload} />
                    <ValidateSkillDialog
                        employeeId={employee.employeeNumber}
                        skills={skills}
                        trainings={employee.trainings}
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-28 w-28 overflow-hidden rounded-full bg-muted shadow-inner">
                                {employee.photoUrl ? (
                                    <Image
                                        src={employee.photoUrl}
                                        alt={employee.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                                        {employee.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-muted-foreground">{shiftLabel}</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-lg font-semibold">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    #{employee.employeeNumber} • {employee.department || 'Unassigned department'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Hired on {employee.dateHired.toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link href={`/dashboard/employees/${employee.employeeNumber}/license`}>
                                    <Button variant="outline">Print License</Button>
                                </Link>
                                <Button asChild variant="outline">
                                    <a href={csvExportUrl}>Download CSV</a>
                                </Button>
                                <CopyProfileLinkButton employeeId={employee.employeeNumber} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Validated Skills</p>
                            <p className="text-2xl font-semibold">{trainings.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Open Assignments</p>
                            <p className="text-2xl font-semibold">{openAssignments.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Overdue Assignments</p>
                            <p className="text-2xl font-semibold text-destructive">{overdueAssignments.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Expiring Skills</p>
                            <p className={`text-2xl font-semibold ${expiringSoonCount > 0 ? 'text-amber-600' : ''}`}>
                                {expiringSoonCount}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-lg">{employee.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Employee Number</p>
                        <p className="text-lg">{employee.employeeNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="text-lg">{employee.department || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Shift</p>
                        <p className="text-lg">{shiftLabel}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Date Hired</p>
                        <p className="text-lg">{employee.dateHired.toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Training Assignments</CardTitle>
                    <AssignTrainingDialog employeeId={employee.employeeNumber} skills={skills} />
                </CardHeader>
                <CardContent>
                    {assignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No planned assignments yet. Use “Add Assignment” to schedule future training goals.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Skill</TableHead>
                                    <TableHead>Target Level</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Assigned By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map((assignment) => {
                                    const status = getAssignmentStatus(assignment);
                                    return (
                                        <TableRow key={assignment.id}>
                                            <TableCell>
                                                {assignment.skill.documentUrl ? (
                                                    <a
                                                        href={assignment.skill.documentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {assignment.skill.code} — {assignment.skill.name}
                                                    </a>
                                                ) : (
                                                    <span>
                                                        {assignment.skill.code} — {assignment.skill.name}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>L{assignment.targetLevel}</TableCell>
                                            <TableCell>{assignment.dueDate.toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {assignment.assignedBy?.username || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs text-sm">
                                                {assignment.notes || (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-y-1">
                                                <RemindAssignmentButton assignmentId={assignment.id} />
                                                {assignment.lastReminderSentAt && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Last reminded{' '}
                                                        {assignment.lastReminderSentAt.toLocaleDateString()}
                                                    </p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Training Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTrainings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No validations yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentTrainings.map((record) => (
                                    <div key={record.id} className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                            L{record.level}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{record.skill.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Validated by {record.validator.username} on{' '}
                                                {record.dateValidated.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes & Coaching Log</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AddEmployeeNoteForm employeeId={employee.employeeNumber} />
                        <div className="space-y-4">
                            {notes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No notes yet.</p>
                            ) : (
                                notes.map((note) => (
                                    <div key={note.id} className="rounded-md border p-3">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{note.author?.username || 'System'}</span>
                                            <span>{note.createdAt.toLocaleString()}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-foreground whitespace-pre-line">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recertification Status</CardTitle>
                    <CardDescription>Tracks skills that require renewal based on validity rules.</CardDescription>
                </CardHeader>
                <CardContent>
                    {actionableRecerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            All skills are current. Recertification reminders will appear here when a skill is due.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Skill</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {actionableRecerts.map((item) => (
                                    <TableRow key={item.trainingId}>
                                        <TableCell>
                                            <div className="font-medium">{item.skill.code}</div>
                                            <div className="text-sm text-muted-foreground">{item.skill.name}</div>
                                        </TableCell>
                                        <TableCell>{item.expirationDate.toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.status === 'OVERDUE'
                                                        ? 'destructive'
                                                        : item.status === 'DUE_SOON'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {item.status === 'OVERDUE'
                                                    ? 'Overdue'
                                                    : item.status === 'DUE_SOON'
                                                        ? 'Due Soon'
                                                        : 'Current'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
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
                                <TableHead>Revision</TableHead>
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
                                employee.trainings.map((record) => {
                                    const revisionNumber =
                                        record.skillRevision?.revisionNumber ??
                                        record.skill.currentRevisionNumber ??
                                        1;
                                    const revisionOutdated =
                                        record.skillRevision?.revisionNumber &&
                                        record.skill.currentRevisionNumber &&
                                        record.skillRevision.revisionNumber !== record.skill.currentRevisionNumber;

                                    return (
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
                                <Badge variant={revisionOutdated ? 'destructive' : 'secondary'}>
                                    Rev {revisionNumber}
                                </Badge>
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
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
