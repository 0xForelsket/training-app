import { NextResponse } from 'next/server';
import { getSkillMatrixData, getSkills } from '@/app/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const departmentParam = searchParams.get('department') || 'all';
    const shiftParam = searchParams.get('shift') || 'all';

    const filters = {
        query,
        department: departmentParam !== 'all' ? departmentParam : undefined,
        shift:
            shiftParam === 'DAY' || shiftParam === 'NIGHT'
                ? (shiftParam as 'DAY' | 'NIGHT')
                : undefined,
    };

    const [matrixData, skills] = await Promise.all([getSkillMatrixData(filters), getSkills()]);

    const header = ['Employee Number', 'Employee Name', ...skills.map((skill) => `${skill.code} (${skill.name})`)];

    const rows = matrixData.map((employee) => {
        const row = [employee.employeeNumber, employee.name];
        skills.forEach((skill) => {
            const training = employee.trainings.find((t) => t.skillId === skill.code);
            row.push(training ? `L${training.level}` : '');
        });
        return row;
    });

    const csv = [header, ...rows]
        .map((row) =>
            row
                .map((value) => {
                    const safe = value?.toString().replace(/"/g, '""') ?? '';
                    return `"${safe}"`;
                })
                .join(','),
        )
        .join('\n');

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="skill-matrix-export.csv"',
        },
    });
}
