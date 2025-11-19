import { prisma } from '@/lib/prisma';

export async function getEmployees(query?: string) {
    try {
        const employees = await prisma.employee.findMany({
            where: {
                OR: [
                    { name: { contains: query || '' } },
                    { employeeNumber: { contains: query || '' } },
                ],
            },
            orderBy: { name: 'asc' },
        });
        return employees;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch employees.');
    }
}

export async function getEmployeeById(id: string) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                trainings: {
                    include: {
                        skill: true,
                        validator: true,
                    },
                },
            },
        });
        return employee;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch employee.');
    }
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { username: 'asc' },
        });
        return users;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function getAuditLogs() {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
        return logs;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch audit logs.');
    }
}

export async function getSkills(query?: string) {
    try {
        const skills = await prisma.skill.findMany({
            where: {
                OR: [
                    { name: { contains: query || '' } },
                    { code: { contains: query || '' } },
                ],
            },
            orderBy: { code: 'asc' },
        });
        return skills;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch skills.');
    }
}
