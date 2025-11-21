import { getEmployeeDepartments, getSkillMatrixData, getSkills } from '@/app/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type MatrixSearchParams = Promise<{
    query?: string;
    department?: string;
    shift?: string;
    minLevel?: string;
    coverage?: string;
}>;

export default async function SkillMatrixPage({
    searchParams,
}: {
    searchParams?: MatrixSearchParams;
}) {
    const params = (await searchParams) || {};
    const query = params.query?.toString() ?? '';
    const currentDepartment = params.department?.toString() ?? 'all';
    const currentShift = params.shift?.toString() ?? 'all';
    const minLevel = Math.min(Math.max(parseInt(params.minLevel || '3', 10) || 3, 1), 4);
    const coverageTarget = Math.max(parseInt(params.coverage || '1', 10) || 1, 1);

    const filters = {
        query,
        department: currentDepartment !== 'all' ? currentDepartment : undefined,
        shift:
            currentShift === 'DAY' || currentShift === 'NIGHT'
                ? (currentShift as 'DAY' | 'NIGHT')
                : undefined,
    };

    const [matrixData, skills, departments] = await Promise.all([
        getSkillMatrixData(filters),
        getSkills(),
        getEmployeeDepartments(),
    ]);

    const noEmployees = matrixData.length === 0;
    const noSkills = skills.length === 0;
    const emptyStateMessage = noEmployees && noSkills
        ? 'Add employees and skills to generate the matrix overview.'
        : noEmployees
            ? 'No employees found. Once employees are added, their coverage will appear here.'
            : 'No skills available. Add skills to see coverage per employee.';

    const coverageStats = skills.map((skill) => {
        const proficientCount = matrixData.filter((employee) => {
            const training = employee.trainings.find((t) => t.skillId === skill.code);
            return training && training.level >= minLevel;
        }).length;
        const meetsTarget = proficientCount >= coverageTarget;
        const coveragePercent = matrixData.length
            ? Math.round((proficientCount / matrixData.length) * 100)
            : 0;
        return {
            skill,
            proficientCount,
            coveragePercent,
            meetsTarget,
        };
    });

    const levelColor = (level?: number) => {
        switch (level) {
            case 1:
                return 'bg-red-500 text-white';
            case 2:
                return 'bg-yellow-500 text-white';
            case 3:
                return 'bg-blue-500 text-white';
            case 4:
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-200 text-gray-600';
        }
    };

    const exportUrl = `/api/matrix/export?${new URLSearchParams({
        query,
        department: currentDepartment,
        shift: currentShift,
        minLevel: String(minLevel),
        coverage: String(coverageTarget),
    }).toString()}`;

    return (
        <div className="p-8 space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap items-end gap-4" method="GET">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Search</span>
                            <Input name="query" placeholder="Employee name or #" defaultValue={query} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Department</span>
                            <select
                                name="department"
                                defaultValue={currentDepartment}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Shift</span>
                            <select
                                name="shift"
                                defaultValue={currentShift}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All</option>
                                <option value="DAY">Day</option>
                                <option value="NIGHT">Night</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Min Level</span>
                            <select
                                name="minLevel"
                                defaultValue={String(minLevel)}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {[1, 2, 3, 4].map((level) => (
                                    <option key={level} value={level}>
                                        Level {level}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Coverage Target (# employees)</span>
                            <Input
                                name="coverage"
                                type="number"
                                min={1}
                                defaultValue={coverageTarget}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Apply Filters</Button>
                            {(query || currentDepartment !== 'all' || currentShift !== 'all' || minLevel !== 3 || coverageTarget !== 1) && (
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard/matrix">Reset</Link>
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href={exportUrl}>Export CSV</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Skill Coverage Summary</CardTitle>
                    <CardDescription>
                        Evaluates the number of employees meeting level {minLevel}+ versus the target of {coverageTarget}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Skill</TableHead>
                                <TableHead>Proficient</TableHead>
                                <TableHead>Coverage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coverageStats.map(({ skill, proficientCount, coveragePercent, meetsTarget }) => (
                                <TableRow key={skill.code}>
                                    <TableCell>
                                        <div className="font-medium">{skill.code}</div>
                                        <div className="text-xs text-muted-foreground">{skill.name}</div>
                                    </TableCell>
                                    <TableCell>{proficientCount}</TableCell>
                                    <TableCell>
                                        <Badge variant={meetsTarget ? 'secondary' : 'destructive'}>
                                            {coveragePercent}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="overflow-x-auto">
                <CardHeader>
                    <CardTitle>Skill Matrix</CardTitle>
                    <CardDescription>Levels are color-coded for faster scanning.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table className="min-w-max">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] sticky left-0 bg-background z-10">Employee</TableHead>
                                {skills.map((skill) => (
                                    <TableHead key={skill.code} className="text-center min-w-[100px]">
                                        <div className="flex flex-col items-center">
                                            <span>{skill.code}</span>
                                            <span className="text-xs font-normal text-muted-foreground">{skill.name}</span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {noEmployees || noSkills ? (
                                <TableRow>
                                    <TableCell colSpan={Math.max(skills.length + 1, 1)} className="text-center text-muted-foreground">
                                        {emptyStateMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                matrixData.map((employee) => (
                                    <TableRow key={employee.employeeNumber}>
                                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                                            {employee.name}
                                            <div className="text-xs text-muted-foreground">{employee.employeeNumber}</div>
                                        </TableCell>
                                        {skills.map((skill) => {
                                            const training = employee.trainings.find((t) => t.skillId === skill.code);
                                            return (
                                                <TableCell key={skill.code} className="text-center">
                                                    {training ? (
                                                        <div
                                                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${levelColor(training.level)} ${
                                                                training.level >= minLevel ? 'ring-2 ring-primary/60' : ''
                                                            }`}
                                                        >
                                                            {training.level}
                                                        </div>
                                                    ) : (
                                                        <div className="mx-auto h-3 w-3 rounded-full bg-gray-200" />
                                                    )}
                                                </TableCell>
                                            );
                                        })}
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
