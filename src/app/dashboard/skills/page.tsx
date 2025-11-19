import { getSkillProjects, getSkills } from '@/app/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default async function SkillsPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        project?: string;
        shift?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query?.toString() ?? '';
    const currentProject = params?.project?.toString() ?? 'all';
    const currentShift = params?.shift?.toString() ?? 'all';

    const skillFilters = {
        query,
        project: currentProject !== 'all' ? currentProject : undefined,
        shift:
            currentShift === 'DAY' || currentShift === 'NIGHT'
                ? (currentShift as 'DAY' | 'NIGHT')
                : undefined,
    };

    const [skills, projects] = await Promise.all([
        getSkills(skillFilters, { includeEmployees: true }),
        getSkillProjects(),
    ]);
    const hasActiveFilters =
        query.length > 0 || currentProject !== 'all' || currentShift !== 'all';

    return (
        <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Skills & Work Instructions</h1>
                <Link href="/dashboard/skills/create">
                    <Button>Add Skill</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap items-end gap-4" method="GET">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Search</span>
                            <Input
                                name="query"
                                placeholder="Search by code or name"
                                defaultValue={query}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Project</span>
                            <select
                                name="project"
                                defaultValue={currentProject}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All Projects</option>
                                {projects.map((project) => (
                                    <option key={project} value={project}>
                                        {project}
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
                                <option value="all">All Shifts</option>
                                <option value="DAY">Day Shift</option>
                                <option value="NIGHT">Night Shift</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">Apply Filters</Button>
                            {hasActiveFilters && (
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/dashboard/skills">Reset</Link>
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Skill List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Employees & Shift</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No skills match your filters. Try adjusting the search or clear filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                skills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell className="font-medium">{skill.code}</TableCell>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.project || '-'}</TableCell>
                                        <TableCell>{skill.description || '-'}</TableCell>
                                        <TableCell>
                                            {skill.trainings && skill.trainings.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {skill.trainings.map((training) => {
                                                        const employee = training.employee;
                                                        return (
                                                            <Badge key={training.id} variant="secondary" className="gap-1">
                                                                <span>{employee?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                                    {employee?.shift === 'NIGHT' ? 'Night' : 'Day'}
                                                                </span>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No employees assigned</span>
                                            )}
                                        </TableCell>
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
