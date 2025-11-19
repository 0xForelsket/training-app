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
                                <TableHead>Project</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>SOP</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell className="font-medium">{skill.code}</TableCell>
                                    <TableCell>{skill.name}</TableCell>
                                    <TableCell>{skill.project || '-'}</TableCell>
                                    <TableCell>{skill.description}</TableCell>
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
                                        <DeleteSkillButton id={skill.id} />
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
