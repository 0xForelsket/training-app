import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getEmployeeById } from '@/app/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import QuickValidateForm from './quick-validate-form';

type SearchParams = Promise<{ employee?: string }>;

export default async function ValidateMobilePage({ searchParams }: { searchParams?: SearchParams }) {
    const session = await auth();
    if (!session || session.user.role !== 'TRAINER') {
        redirect('/dashboard');
    }

    const params = (await searchParams) || {};
    const employeeNumber = params.employee?.toString().trim();
    const employee = employeeNumber ? await getEmployeeById(employeeNumber) : null;

    const assignments = employee?.assignments.filter((a) => a.status !== 'COMPLETED') ?? [];

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-primary">Trainer Mode</p>
                    <h1 className="text-2xl font-bold">On-the-Floor Validation</h1>
                    <p className="text-sm text-muted-foreground">
                        Scan or enter an employee number to validate skills on the spot.
                    </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    QR-ready
                </Badge>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <form method="GET" className="flex flex-col sm:flex-row gap-3">
                        <Input
                            name="employee"
                            placeholder="Scan or enter employee number"
                            defaultValue={employeeNumber}
                            className="h-11"
                        />
                        <Button type="submit" className="h-11 px-6">Load Employee</Button>
                    </form>
                    <p className="text-xs text-muted-foreground">
                        Tip: Scanning the employee QR code fills this field automatically (format: /dashboard/employees/&lt;employeeNumber&gt;).
                    </p>
                </CardContent>
            </Card>

            {employee && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl">{employee.name}</CardTitle>
                        <CardDescription>
                            #{employee.employeeNumber} · {employee.department || 'No department'} ·{' '}
                            {employee.shift === 'NIGHT' ? 'Night' : 'Day'} Shift
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No pending assignments. You can still validate any skill below if needed.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                                    Pending / In-Progress Assignments
                                </h3>
                                <div className="space-y-3">
                                    {assignments.map((assignment) => {
                                        const skill = assignment.skill;
                                        return (
                                            <QuickValidateForm
                                                key={assignment.id}
                                                employeeNumber={employee.employeeNumber}
                                                skillCode={skill.code}
                                                skillName={skill.name}
                                                targetLevel={assignment.targetLevel}
                                                dueDate={assignment.dueDate}
                                                currentLevel={
                                                    employee.trainings.find((t) => t.skillId === skill.code)?.level
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                                Other Skills
                            </h3>
                            <div className="space-y-3">
                                {employee.trainings.map((record) => (
                                    <QuickValidateForm
                                        key={record.id}
                                        employeeNumber={employee.employeeNumber}
                                        skillCode={record.skill.code}
                                        skillName={record.skill.name}
                                        currentLevel={record.level}
                                        validatorName={record.validator.username}
                                        lastValidated={record.dateValidated}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
