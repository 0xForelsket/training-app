import { getEmployees, getSkills } from '@/app/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function SkillMatrixPage() {
    // Fetch all employees with their trainings
    // We need a new data function or modify getEmployees to include trainings always?
    // getEmployees already fetches employees, but maybe not trainings.
    // Let's modify getEmployees or create getSkillMatrixData.
    // For now, let's assume we can fetch all.

    // Actually, getEmployees in data.ts doesn't include trainings by default.
    // I should add a function to fetch matrix data.
    const matrixData = await getSkillMatrixData();
    const skills = await getSkills();

    return (
        <div className="p-8 overflow-x-auto">
            <Card className="min-w-max">
                <CardHeader>
                    <CardTitle>Skill Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] sticky left-0 bg-background z-10">Employee</TableHead>
                                {skills.map((skill) => (
                                    <TableHead key={skill.id} className="text-center min-w-[100px]">
                                        <div className="flex flex-col items-center">
                                            <span>{skill.code}</span>
                                            <span className="text-xs font-normal text-muted-foreground">{skill.name}</span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matrixData.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                                        {employee.name}
                                        <div className="text-xs text-muted-foreground">{employee.employeeNumber}</div>
                                    </TableCell>
                                    {skills.map((skill) => {
                                        const training = employee.trainings.find((t) => t.skillId === skill.id);
                                        return (
                                            <TableCell key={skill.id} className="text-center">
                                                {training ? (
                                                    <div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white
                                                        ${training.level === 1 ? 'bg-red-500' : ''}
                                                        ${training.level === 2 ? 'bg-yellow-500' : ''}
                                                        ${training.level === 3 ? 'bg-blue-500' : ''}
                                                        ${training.level === 4 ? 'bg-green-500' : ''}
                                                    `}>
                                                        {training.level}
                                                    </div>
                                                ) : (
                                                    <div className="mx-auto h-2 w-2 rounded-full bg-gray-200" />
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

import { prisma } from '@/lib/prisma';

async function getSkillMatrixData() {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                trainings: true,
            },
            orderBy: { name: 'asc' },
        });
        return employees;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch matrix data.');
    }
}
