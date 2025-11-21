import { getSkills } from '@/app/lib/data';
import { DeleteSkillButton } from './delete-skill-button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SkillsPage() {
    const skills = await getSkills();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Skill Management</h1>
                <Button asChild>
                    <Link href="/dashboard/skills/create">Add Skill</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Revision</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Validity (mo)</TableHead>
                                <TableHead>Reminder (days)</TableHead>
                                <TableHead>SOP</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skills.map((skill) => (
                                <TableRow key={skill.code}>
                                    <TableCell className="font-medium">{skill.code}</TableCell>
                                    <TableCell>{skill.name}</TableCell>
                                    <TableCell>Rev {skill.currentRevisionNumber || 1}</TableCell>
                                    <TableCell>{skill.project || '-'}</TableCell>
                                    <TableCell>{skill.description}</TableCell>
                                    <TableCell>{skill.validityMonths ?? '—'}</TableCell>
                                    <TableCell>{skill.recertReminderDays ?? '—'}</TableCell>
                                    <TableCell>
                                        {skill.documentUrl ? (
                                            <a
                                                href={skill.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/admin/skills/${skill.code}/revision`}>
                                                    New Revision
                                                </Link>
                                            </Button>
                                            <DeleteSkillButton code={skill.code} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
