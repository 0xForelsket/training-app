import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type EmployeeShift = 'DAY' | 'NIGHT';

type EmployeeFilters = {
    query?: string;
    department?: string;
    shift?: EmployeeShift;
};

type SkillFilters = {
    query?: string;
    project?: string;
    shift?: EmployeeShift;
};

type SkillQueryOptions = {
    includeEmployees?: boolean;
};

export async function getEmployees(filters?: EmployeeFilters) {
    try {
        const where: Prisma.EmployeeWhereInput = {};
        const searchTerm = filters?.query?.trim();

        if (searchTerm && searchTerm.length > 0) {
            where.OR = [
                { name: { contains: searchTerm } },
                { employeeNumber: { contains: searchTerm } },
            ];
        }

        const departmentFilter = filters?.department?.trim();
        if (departmentFilter) {
            where.department = departmentFilter;
        }

        if (filters?.shift) {
            where.shift = filters.shift;
        }

        const employees = await prisma.employee.findMany({
            where,
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
                    orderBy: { dateValidated: 'desc' },
                },
                assignments: {
                    include: {
                        skill: true,
                        assignedBy: true,
                    },
                    orderBy: { dueDate: 'asc' },
                },
                notes: {
                    include: {
                        author: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
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

export async function getSkills(filters?: SkillFilters, options?: SkillQueryOptions) {
    try {
        const where: Prisma.SkillWhereInput = {};
        const searchTerm = filters?.query?.trim();

        if (searchTerm && searchTerm.length > 0) {
            where.OR = [
                { name: { contains: searchTerm } },
                { code: { contains: searchTerm } },
            ];
        }

        const projectFilter = filters?.project?.trim();
        if (projectFilter) {
            where.project = projectFilter;
        }

        if (filters?.shift) {
            where.trainings = {
                some: {
                    employee: {
                        shift: filters.shift,
                    },
                },
            };
        }

        const include = options?.includeEmployees
            ? {
                  trainings: {
                      include: { employee: true },
                  },
              }
            : undefined;

        const skills = await prisma.skill.findMany({
            where,
            orderBy: { code: 'asc' },
            include,
        });
        return skills;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch skills.');
    }
}

export async function getSkillProjects() {
    try {
        const projects = await prisma.skill.findMany({
            where: { project: { not: null } },
            select: { project: true },
            distinct: ['project'],
        });

        return projects
            .map((entry) => entry.project)
            .filter((project): project is string => !!project && project.trim().length > 0)
            .sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch project filters.');
    }
}

export async function getDashboardStats() {
    try {
        const [employeeCount, skillCount, trainingCount, trainerCount] = await Promise.all([
            prisma.employee.count(),
            prisma.skill.count(),
            prisma.trainingRecord.count(),
            prisma.user.count({ where: { role: 'TRAINER' } }),
        ]);

        return {
            employeeCount,
            skillCount,
            trainingCount,
            trainerCount,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch dashboard stats.');
    }
}

export async function getRecentAuditLogs(limit = 5) {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { user: true },
        });
        return logs;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch recent audit logs.');
    }
}

export async function getUploadHistory(limit = 10) {
    try {
        const logs = await prisma.uploadLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: true,
            },
        });
        return logs;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch upload history.');
    }
}

export async function getEmployeeDepartments() {
    try {
        const departments = await prisma.employee.findMany({
            where: { department: { not: null } },
            select: { department: true },
            distinct: ['department'],
        });

        return departments
            .map((entry) => entry.department)
            .filter((dept): dept is string => !!dept && dept.trim().length > 0)
            .sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch departments.');
    }
}
