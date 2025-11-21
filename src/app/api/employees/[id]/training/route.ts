import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const escapeCsv = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
};

export async function GET(
    _request: Request,
    { params }: { params: { id: string } },
) {
    const { id } = params;

    const employee = await prisma.employee.findUnique({
        where: { employeeNumber: id },
        include: {
            trainings: {
                include: {
                    skill: true,
                    validator: true,
                },
                orderBy: { dateValidated: 'desc' },
            },
        },
    });

    if (!employee) {
        return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    const header = [
        'Employee Number',
        'Employee Name',
        'Skill Code',
        'Skill Name',
        'Level',
        'Validator',
        'Date Validated',
        'Notes',
    ];

    const rows = employee.trainings.map((record) => [
        escapeCsv(employee.employeeNumber),
        escapeCsv(employee.name),
        escapeCsv(record.skill.code),
        escapeCsv(record.skill.name),
        escapeCsv(record.level),
        escapeCsv(record.validator.username),
        escapeCsv(record.dateValidated.toISOString()),
        escapeCsv(record.validatorNotes ?? ''),
    ]);

    const csv = [header.map(escapeCsv).join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${employee.employeeNumber || 'employee'}-training.csv"`,
        },
    });
}
