import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { addMonths } from 'date-fns';

type EmployeeShift = 'DAY' | 'NIGHT';
type FullEmployee = Prisma.EmployeeGetPayload<{
    include: {
        trainings: {
            include: {
                skill: true;
                validator: true;
                skillRevision: true;
            };
            orderBy: { dateValidated: 'desc' };
        };
        assignments: {
            include: {
                skill: true;
                assignedBy: true;
            };
            orderBy: { dueDate: 'asc' };
        };
        notes: {
            include: {
                author: true;
            };
            orderBy: { createdAt: 'desc' };
            take: 10;
        };
    };
}>;

export type EmployeeFilters = {
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

import { unstable_cache } from 'next/cache';

export const getEmployees = unstable_cache(
    async (filters?: EmployeeFilters) => {
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
    },
    ['getEmployees'],
    { tags: ['employees'] }
);

export async function getEmployeeById(id: string): Promise<FullEmployee | null> {
    try {
        const employee = await prisma.employee.findUnique({
            where: { employeeNumber: id },
            include: {
                trainings: {
                    include: {
                        skill: true,
                        validator: true,
                        skillRevision: true,
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

export const getSkills = unstable_cache(
    async (filters?: SkillFilters, options?: SkillQueryOptions) => {
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
    },
    ['getSkills'],
    { tags: ['skills'] }
);

export async function getSkillById(id: string) {
    try {
        const skill = await prisma.skill.findUnique({
            where: { code: id },
            include: {
                revisions: {
                    orderBy: { revisionNumber: 'desc' },
                },
            },
        });
        return skill;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch skill.');
    }
}

export const getSkillProjects = unstable_cache(
    async () => {
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
    },
    ['getSkillProjects'],
    { tags: ['skills'] }
);

export const getDashboardStats = unstable_cache(
    async () => {
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
    },
    ['getDashboardStats'],
    { tags: ['dashboard-stats', 'employees', 'skills'] }
);

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

export const getEmployeeDepartments = unstable_cache(
    async () => {
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
    },
    ['getEmployeeDepartments'],
    { tags: ['employees'] }
);

export type RecertStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE';

export type RecertificationItem = {
    trainingId: string;
    employee: {
        name: string;
        employeeNumber: string;
    };
    skill: {
        code: string;
        name: string;
        validityMonths: number;
        recertReminderDays: number;
    };
    expirationDate: Date;
    status: RecertStatus;
};

type TrainingWithRelations = Prisma.TrainingRecordGetPayload<{
    include: { employee: true; skill: true };
}>;

export function evaluateRecertification(training: TrainingWithRelations): RecertificationItem | null {
    const validityMonths = training.skill.validityMonths;
    if (!validityMonths) {
        return null;
    }

    const reminderDays = training.skill.recertReminderDays ?? 30;
    const expirationDate = addMonths(new Date(training.dateValidated), validityMonths);
    const now = new Date();
    const reminderDate = new Date(expirationDate.getTime() - reminderDays * 24 * 60 * 60 * 1000);

    const currentRevisionId = training.skill.currentRevisionId;
    const trainingRevisionId = training.skillRevisionId ?? currentRevisionId;
    const revisionMismatch =
        currentRevisionId && trainingRevisionId && currentRevisionId !== trainingRevisionId;

    let status: RecertStatus = 'CURRENT';
    if (revisionMismatch) {
        status = 'OVERDUE';
    } else if (now > expirationDate) {
        status = 'OVERDUE';
    } else if (now >= reminderDate) {
        status = 'DUE_SOON';
    }

    return {
        trainingId: training.id,
        employee: {
            name: training.employee.name,
            employeeNumber: training.employee.employeeNumber,
        },
        skill: {
            code: training.skill.code,
            name: training.skill.name,
            validityMonths,
            recertReminderDays: reminderDays,
        },
        expirationDate,
        status,
    };
}

export async function getUpcomingRecertifications(limit = 5) {
    try {
        const trainings = await prisma.trainingRecord.findMany({
            where: {
                skill: {
                    validityMonths: {
                        not: null,
                    },
                },
            },
            include: {
                employee: true,
                skill: true,
            },
        });

        const recerts = trainings
            .map((training) => evaluateRecertification(training))
            .filter((item): item is RecertificationItem => !!item)
            .filter((item) => item.status !== 'CURRENT')
            .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
            .slice(0, limit);

        return recerts;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch upcoming recertifications.');
    }
}

export async function getSkillMatrixData(filters?: EmployeeFilters) {
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
