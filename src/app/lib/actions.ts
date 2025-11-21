'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAction } from './logger';

type AllowedRole = 'ADMIN' | 'TRAINER' | 'HR' | 'DCC';

function hasAllowedRole(session: Awaited<ReturnType<typeof auth>> | null, roles: AllowedRole[]) {
    if (!session || !session.user?.role) return false;
    return roles.includes(session.user.role as AllowedRole);
}

const CreateEmployeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    employeeNumber: z.string().min(1, 'Employee Number is required'),
    department: z.string().optional(),
    shift: z.enum(['DAY', 'NIGHT']).default('DAY'),
    dateHired: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    photo: z.any().optional(),
});

const UpdateEmployeeProfileSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, 'Name is required'),
    employeeNumber: z.string().min(1, 'Employee Number is required'),
    department: z.string().optional(),
    shift: z.enum(['DAY', 'NIGHT']),
    dateHired: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
});

const CreateEmployeeNoteSchema = z.object({
    employeeId: z.string().min(1),
    content: z
        .string()
        .min(1, 'Note content is required')
        .max(1000, 'Note is too long'),
});

export async function createEmployee(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'HR'])) {
        return { message: 'Unauthorized. Only HR or Admins can create employees.' };
    }

    const validatedFields = CreateEmployeeSchema.safeParse({
        name: formData.get('name'),
        employeeNumber: formData.get('employeeNumber'),
        department: formData.get('department'),
        shift: formData.get('shift') || 'DAY',
        dateHired: formData.get('dateHired'),
        photo: formData.get('photo'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Employee.',
        };
    }

    const { name, employeeNumber, department, shift, dateHired, photo } = validatedFields.data;
    let photoUrl = null;

    if (photo && photo.size > 0) {
        const file = photo as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `photo_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            photoUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error saving photo:', error);
            // Continue without photo if upload fails
        }
    }

    try {
        const newEmployee = await prisma.employee.create({
            data: {
                name,
                employeeNumber,
                department,
                shift,
                dateHired: new Date(dateHired),
                photoUrl,
            },
        });
        await logAction('CREATE_EMPLOYEE', 'Employee', newEmployee.employeeNumber, `Created employee ${newEmployee.name} (${newEmployee.employeeNumber})`);
        revalidatePath('/dashboard/employees');
        revalidateTag('employees');
        revalidateTag('dashboard-stats');
        return { message: 'Created Employee Successfully.' };
    } catch (error) {
        console.error('Error creating employee:', error);
        return {
            message: 'Database Error: Failed to Create Employee.',
        };
    }
}

export async function updateEmployeeProfile(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return { message: 'Unauthorized. Only Admins can update employee profiles.' };
    }

    const validatedFields = UpdateEmployeeProfileSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        employeeNumber: formData.get('employeeNumber'),
        department: formData.get('department'),
        shift: formData.get('shift'),
        dateHired: formData.get('dateHired'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to update employee.',
        };
    }

    const { id, name, employeeNumber, department, shift, dateHired } = validatedFields.data;

    try {
        const updatedEmployee = await prisma.employee.update({
            where: { employeeNumber: id },
            data: {
                name,
                employeeNumber,
                department,
                shift,
                dateHired: new Date(dateHired),
            },
        });

        await logAction(
            'UPDATE_EMPLOYEE',
            'Employee',
            updatedEmployee.employeeNumber,
            `Updated employee ${updatedEmployee.name} (${updatedEmployee.employeeNumber})`,
        );
        revalidatePath(`/dashboard/employees/${id}`);
        revalidatePath('/dashboard/employees');
        revalidateTag('employees');
        return { message: 'Employee updated successfully.' };
    } catch (error) {
        console.error('Error updating employee:', error);
        return {
            message: 'Database Error: Failed to update employee.',
        };
    }
}

export async function createEmployeeNote(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN')) {
        return { message: 'Unauthorized. Only Trainers or Admins can add notes.' };
    }

    const validatedFields = CreateEmployeeNoteSchema.safeParse({
        employeeId: formData.get('employeeId'),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to add note.',
        };
    }

    const { employeeId, content } = validatedFields.data;

    try {
        const note = await prisma.employeeNote.create({
            data: {
                employeeId,
                content,
                authorId: session.user.id,
            },
        });

        await logAction('CREATE_EMPLOYEE_NOTE', 'EmployeeNote', note.id, `Added note for employee ${employeeId}`);
        revalidatePath(`/dashboard/employees/${employeeId}`);
        return { message: 'Note added successfully.' };
    } catch (error) {
        console.error('Error creating employee note:', error);
        return {
            message: 'Database Error: Failed to add note.',
        };
    }
}

import { writeFile } from 'fs/promises';
import path from 'path';

const CreateSkillSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    project: z.string().optional(),
    description: z.string().optional(),
    validityMonths: z
        .preprocess((value) => (value === '' || value === null ? undefined : value), z.coerce.number().int().positive())
        .optional(),
    recertReminderDays: z
        .preprocess((value) => (value === '' || value === null ? undefined : value), z.coerce.number().int().positive())
        .optional(),
    document: z.any().optional(), // We'll validate the file manually
});

const CreateSkillRevisionSchema = z.object({
    skillId: z.string().min(1),
    name: z.string().min(1, 'Name is required'),
    project: z.string().optional(),
    description: z.string().optional(),
    validityMonths: z
        .preprocess((value) => (value === '' || value === null ? undefined : value), z.coerce.number().int().positive())
        .optional(),
    recertReminderDays: z
        .preprocess((value) => (value === '' || value === null ? undefined : value), z.coerce.number().int().positive())
        .optional(),
    document: z.any().optional(),
});

export async function createSkill(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'DCC'])) {
        return { message: 'Unauthorized. Only DCC owners or Admins can create skills.' };
    }

    const validatedFields = CreateSkillSchema.safeParse({
        code: formData.get('code'),
        name: formData.get('name'),
        project: formData.get('project'),
        description: formData.get('description'),
        document: formData.get('document'),
        validityMonths: formData.get('validityMonths'),
        recertReminderDays: formData.get('recertReminderDays'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Skill.',
        };
    }

    const { code, name, project, description, validityMonths, recertReminderDays, document } = validatedFields.data;
    let documentUrl = null;
    const trimmedProject = project?.toString().trim();

    if (document && document.size > 0) {
        const file = document as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            documentUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error saving file:', error);
            return { message: 'Failed to save uploaded file.' };
        }
    }

    try {
        const newSkill = await prisma.skill.create({
            data: {
                code,
                name,
                project: trimmedProject && trimmedProject.length > 0 ? trimmedProject : null,
                description,
                validityMonths: validityMonths ?? null,
                recertReminderDays: recertReminderDays ?? null,
                documentUrl,
                revisions: {
                    create: {
                        revisionNumber: 1,
                        name,
                        description,
                        documentUrl,
                        validityMonths: validityMonths ?? null,
                        recertReminderDays: recertReminderDays ?? null,
                        createdById: session.user.id,
                    },
                },
            },
            include: {
                revisions: {
                    orderBy: { revisionNumber: 'desc' },
                    take: 1,
                },
            },
        });

        const latestRevision = newSkill.revisions[0];
        await prisma.skill.update({
            where: { code: newSkill.code },
            data: {
                currentRevisionId: latestRevision.id,
                currentRevisionNumber: latestRevision.revisionNumber,
            },
        });
        await logAction(
            'CREATE_SKILL',
            'Skill',
            newSkill.code,
            `Created skill ${newSkill.code} - ${newSkill.name} (Rev ${latestRevision.revisionNumber})`,
        );
        revalidateTag('skills');
        revalidateTag('dashboard-stats');
    } catch (error) {
        console.error('Error creating skill:', error);
        return {
            message: 'Database Error: Failed to Create Skill.',
        };
    }

    revalidatePath('/dashboard/skills');
    redirect('/dashboard/skills');
}

export async function createSkillRevision(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'DCC'])) {
        return { message: 'Unauthorized. Only DCC owners or Admins can create revisions.' };
    }

    const validatedFields = CreateSkillRevisionSchema.safeParse({
        skillId: formData.get('skillId'),
        name: formData.get('name'),
        project: formData.get('project'),
        description: formData.get('description'),
        validityMonths: formData.get('validityMonths'),
        recertReminderDays: formData.get('recertReminderDays'),
        document: formData.get('document'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to create revision.',
        };
    }

    const { skillId, name, project, description, validityMonths, recertReminderDays, document } = validatedFields.data;
    let documentUrl = null;
    const trimmedProject = project?.toString().trim();

    if (document && document.size > 0) {
        const file = document as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            documentUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error saving file:', error);
            return { message: 'Failed to save uploaded file.' };
        }
    }

    const skill = await prisma.skill.findUnique({
        where: { code: skillId },
        include: {
            revisions: {
                orderBy: { revisionNumber: 'desc' },
                take: 1,
            },
        },
    });

    if (!skill) {
        return { message: 'Skill not found.' };
    }

    const nextRevisionNumber = (skill.currentRevisionNumber ?? skill.revisions[0]?.revisionNumber ?? 0) + 1;
    const revisionDocumentUrl = documentUrl ?? skill.documentUrl;

    const revision = await prisma.skillRevision.create({
        data: {
            skillId,
            revisionNumber: nextRevisionNumber,
            name,
            description,
            documentUrl: revisionDocumentUrl,
            validityMonths: validityMonths ?? null,
            recertReminderDays: recertReminderDays ?? null,
            createdById: session.user.id,
        },
    });

    await prisma.skill.update({
        where: { code: skillId },
        data: {
            name,
            project: trimmedProject && trimmedProject.length > 0 ? trimmedProject : null,
            description,
            validityMonths: validityMonths ?? null,
            recertReminderDays: recertReminderDays ?? null,
            documentUrl: revisionDocumentUrl,
            currentRevisionId: revision.id,
            currentRevisionNumber: nextRevisionNumber,
        },
    });

    const existingTrainings = await prisma.trainingRecord.findMany({
        where: { skillId },
        select: { employeeId: true },
    });

    const reminderWindow = recertReminderDays ?? 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + reminderWindow);

    await Promise.all(
        existingTrainings.map(async (record) => {
            const existingAssignment = await prisma.trainingAssignment.findFirst({
                where: { employeeId: record.employeeId, skillId },
            });

            if (existingAssignment) {
                await prisma.trainingAssignment.update({
                    where: { id: existingAssignment.id },
                    data: {
                        status: 'PENDING',
                        dueDate,
                        notes: `Revision ${nextRevisionNumber} requires retraining`,
                        assignedById: session.user.id,
                    },
                });
            } else {
                await prisma.trainingAssignment.create({
                    data: {
                        employeeId: record.employeeId,
                        skillId,
                        targetLevel: 3,
                        dueDate,
                        status: 'PENDING',
                        notes: `Revision ${nextRevisionNumber} requires retraining`,
                        assignedById: session.user.id,
                    },
                });
            }
        }),
    );

    await logAction(
        'CREATE_SKILL_REVISION',
        'SkillRevision',
        revision.id,
        `Created revision ${nextRevisionNumber} for skill ${skill.code}`,
    );

    revalidatePath('/dashboard/admin/skills');
    revalidatePath('/dashboard/skills');
    revalidatePath('/dashboard/matrix');
    revalidatePath('/dashboard/employees');
    revalidateTag('skills');

    return { message: 'Revision created successfully.' };
}

const CreateTrainingAssignmentSchema = z.object({
    employeeId: z.string().min(1, 'Employee is required'),
    skillId: z.string().min(1, 'Skill is required'),
    targetLevel: z.coerce.number().min(1).max(4),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid due date',
    }),
    notes: z
        .string()
        .optional()
        .transform((value) => (value && value.trim().length > 0 ? value.trim() : null)),
});

export async function createTrainingAssignment(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN')) {
        return { message: 'Unauthorized. Only Trainers or Admins can assign training.' };
    }

    const validatedFields = CreateTrainingAssignmentSchema.safeParse({
        employeeId: formData.get('employeeId'),
        skillId: formData.get('skillId'),
        targetLevel: formData.get('targetLevel'),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to create assignment.',
        };
    }

    const { employeeId, skillId, targetLevel, dueDate, notes } = validatedFields.data;

    try {
        const assignment = await prisma.trainingAssignment.create({
            data: {
                employeeId,
                skillId,
                targetLevel,
                dueDate: new Date(dueDate),
                notes,
                assignedById: session.user.id,
            },
            include: {
                skill: true,
                employee: true,
            },
        });

        await logAction(
            'CREATE_TRAINING_ASSIGNMENT',
            'TrainingAssignment',
            assignment.id,
            `Assigned ${assignment.skill.code} to ${assignment.employee.name} (target L${assignment.targetLevel})`,
        );
        revalidatePath(`/dashboard/employees/${employeeId}`);
        return { message: 'Assignment created successfully.' };
    } catch (error) {
        console.error('Error creating assignment:', error);
        return { message: 'Database Error: Failed to create assignment.' };
    }
}

const ValidateTrainingSchema = z.object({
    employeeId: z.string(),
    skillId: z.string(),
    level: z.coerce.number().min(1).max(4),
    notes: z
        .string()
        .max(1000)
        .optional()
        .transform((value) => (value && value.trim().length > 0 ? value.trim() : null)),
});

export async function validateTraining(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'TRAINER') {
        return { message: 'Unauthorized. Only Trainers can validate training.' };
    }

    const validatedFields = ValidateTrainingSchema.safeParse({
        employeeId: formData.get('employeeId'),
        skillId: formData.get('skillId'),
        level: formData.get('level'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Missing Fields. Failed to Validate Training.',
        };
    }

    const { employeeId, skillId, level, notes } = validatedFields.data;
    const validatorNotes = notes ?? null;

    let evidenceUrl: string | null = null;
    const evidence = formData.get('evidence');

    if (evidence instanceof File && evidence.size > 0) {
        const buffer = Buffer.from(await evidence.arrayBuffer());
        const filename = `evidence_${Date.now()}_${evidence.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            evidenceUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error saving evidence file:', error);
            return {
                message: 'Failed to save evidence attachment.',
            };
        }
    }

    try {
        const [skillDetails, employeeDetails] = await Promise.all([
            prisma.skill.findUnique({
                where: { code: skillId },
                select: { code: true, name: true, currentRevisionId: true, currentRevisionNumber: true },
            }),
            prisma.employee.findUnique({
                where: { employeeNumber: employeeId },
                select: { employeeNumber: true, name: true },
            }),
        ]);

        const skillLabel = skillDetails ? `${skillDetails.code} - ${skillDetails.name}` : skillId;
        const employeeLabel = employeeDetails
            ? `${employeeDetails.employeeNumber} - ${employeeDetails.name}`
            : employeeId;
        const skillRevisionId = skillDetails?.currentRevisionId ?? null;

        const existingRecord = await prisma.trainingRecord.findUnique({
            where: {
                employeeId_skillId: {
                    employeeId,
                    skillId,
                },
            },
        });

        if (existingRecord) {
            const updated = await prisma.trainingRecord.update({
                where: { id: existingRecord.id },
                data: {
                    level,
                    validatorId: session.user.id,
                    dateValidated: new Date(),
                    validatorNotes,
                    skillRevisionId,
                    ...(evidenceUrl ? { evidenceUrl } : {}),
                },
            });
            await logAction(
                'UPDATE_TRAINING_VALIDATION',
                'TrainingRecord',
                updated.id,
                `Updated skill ${skillLabel} for employee ${employeeLabel} to level ${level}`,
            );
        } else {
            const created = await prisma.trainingRecord.create({
                data: {
                    employeeId,
                    skillId,
                    validatorId: session.user.id,
                    level,
                    validatorNotes,
                    skillRevisionId,
                    evidenceUrl,
                },
            });
            await logAction(
                'VALIDATE_SKILL',
                'TrainingRecord',
                created.id,
                `Validated skill ${skillLabel} for employee ${employeeLabel} at level ${level}`,
            );
        }

        revalidatePath(`/dashboard/employees/${employeeId}`);
        revalidatePath('/dashboard/matrix');
        revalidateTag('dashboard-stats');
        return { message: 'Training saved successfully.' };
    } catch (error) {
        console.error('Error validating training:', error);
        return {
            message: 'Database Error: Failed to Validate Training.',
        };
    }
}

const CreateUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['TRAINER', 'ADMIN', 'VIEWER', 'HR', 'DCC']),
});

import bcrypt from 'bcryptjs';

export async function createUser(_prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return { message: 'Unauthorized. Only Admins can create users.' };
    }

    const validatedFields = CreateUserSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    }

    const { username, password, role } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
            },
        });
        await logAction('CREATE_USER', 'User', newUser.id, `Created user ${newUser.username} as ${newUser.role}`);
        revalidatePath('/dashboard/admin/users');
        return { message: 'User created successfully.' };
    } catch (error) {
        console.error('Error creating user:', error);
        return {
            message: 'Database Error: Failed to Create User. Username might already exist.',
        };
    }
}

export async function deleteSkill(id: string) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'DCC'])) {
        return { message: 'Unauthorized. Only DCC owners or Admins can delete skills.' };
    }

    try {
        await prisma.skill.delete({
            where: { code: id },
        });
        await logAction('DELETE_SKILL', 'Skill', id, 'Deleted skill');
        revalidatePath('/dashboard/admin/skills');
        revalidatePath('/dashboard/skills');
        revalidateTag('skills');
        revalidateTag('dashboard-stats');
    } catch (error) {
        console.error('Error deleting skill:', error);
        return {
            message: 'Database Error: Failed to Delete Skill. It might be in use.',
        };
    }
}

type BulkUploadRowResult = {
    index: number;
    identifier: string;
    status: 'success' | 'failed';
    message: string;
};

function resolveUploadStatus(successCount: number, failureCount: number) {
    if (failureCount === 0) return 'SUCCESS';
    if (successCount === 0) return 'FAILED';
    return 'PARTIAL';
}

export async function bulkCreateEmployees(employees: Record<string, unknown>[]) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'HR'])) {
        return { message: 'Unauthorized.' };
    }

    const results: BulkUploadRowResult[] = [];
    let successCount = 0;

    for (const [index, emp] of employees.entries()) {
        const identifier = emp.employeeNumber || emp.name || `Row ${index + 2}`;
        try {
            const rawShift = typeof emp.shift === 'string' ? emp.shift.toUpperCase() : '';
            const shift = rawShift === 'NIGHT' ? 'NIGHT' : 'DAY';
            const dateHired = new Date(emp.dateHired);

            if (!emp.name || !emp.employeeNumber || Number.isNaN(dateHired.getTime())) {
                throw new Error('Missing required fields or invalid date.');
            }

            await prisma.employee.create({
                data: {
                    name: emp.name,
                    employeeNumber: emp.employeeNumber,
                    department: emp.department,
                    shift,
                    dateHired,
                },
            });
            successCount++;
            results.push({
                index: index + 1,
                identifier,
                status: 'success',
                message: 'Created employee',
            });
        } catch (error: unknown) {
            results.push({
                index: index + 1,
                identifier,
                status: 'failed',
                message: error instanceof Error ? error.message : 'Failed to create employee',
            });
        }
    }

    const totalRows = results.length;
    const failureCount = totalRows - successCount;
    const status = resolveUploadStatus(successCount, failureCount);

    await prisma.uploadLog.create({
        data: {
            type: 'EMPLOYEE',
            status,
            totalRows,
            successCount,
            failureCount,
            userId: session.user.id,
            details: JSON.stringify(results.slice(0, 50)),
        },
    });

    await logAction(
        'BULK_UPLOAD_EMPLOYEES',
        'Employee',
        null,
        `Bulk uploaded ${successCount} employees with ${failureCount} failures`,
    );
    revalidatePath('/dashboard/employees');
    revalidateTag('employees');
    revalidateTag('dashboard-stats');
    return { totalRows, successCount, failureCount, rows: results };
}

export async function bulkCreateSkills(skills: Record<string, unknown>[]) {
    const session = await auth();
    if (!hasAllowedRole(session, ['ADMIN', 'DCC'])) {
        return { message: 'Unauthorized.' };
    }

    const results: BulkUploadRowResult[] = [];
    let successCount = 0;

    for (const [index, skill] of skills.entries()) {
        const identifier = skill.code || skill.name || `Row ${index + 2}`;
        try {
            if (!skill.code || !skill.name) {
                throw new Error('Missing required columns (code, name).');
            }

            const trimmedProject = typeof skill.project === 'string' ? skill.project.trim() : '';
            const validityMonths = skill.validityMonths
                ? Number(skill.validityMonths)
                : undefined;
            const recertReminderDays = skill.recertReminderDays
                ? Number(skill.recertReminderDays)
                : undefined;

            if (validityMonths !== undefined && (!Number.isFinite(validityMonths) || validityMonths <= 0)) {
                throw new Error('validityMonths must be a positive number.');
            }

            if (recertReminderDays !== undefined && (!Number.isFinite(recertReminderDays) || recertReminderDays <= 0)) {
                throw new Error('recertReminderDays must be a positive number.');
            }

            const createdSkill = await prisma.skill.create({
                data: {
                    code: skill.code,
                    name: skill.name,
                    description: skill.description,
                    project: trimmedProject ? trimmedProject : null,
                    validityMonths: validityMonths ?? null,
                    recertReminderDays: recertReminderDays ?? null,
                    revisions: {
                        create: {
                            revisionNumber: 1,
                            name: skill.name,
                            description: skill.description,
                            documentUrl: null,
                            validityMonths: validityMonths ?? null,
                            recertReminderDays: recertReminderDays ?? null,
                            createdById: session.user.id,
                        },
                    },
                },
                include: {
                    revisions: {
                        orderBy: { revisionNumber: 'desc' },
                        take: 1,
                    },
                },
            });
            const latestRevision = createdSkill.revisions[0];
            await prisma.skill.update({
                where: { code: createdSkill.code },
                data: {
                    currentRevisionId: latestRevision.id,
                    currentRevisionNumber: latestRevision.revisionNumber,
                },
            });
            successCount++;
            results.push({
                index: index + 1,
                identifier,
                status: 'success',
                message: 'Created skill',
            });
        } catch (error: unknown) {
            results.push({
                index: index + 1,
                identifier,
                status: 'failed',
                message: error instanceof Error ? error.message : 'Failed to create skill',
            });
        }
    }

    const totalRows = results.length;
    const failureCount = totalRows - successCount;
    const status = resolveUploadStatus(successCount, failureCount);

    await prisma.uploadLog.create({
        data: {
            type: 'SKILL',
            status,
            totalRows,
            successCount,
            failureCount,
            userId: session.user.id,
            details: JSON.stringify(results.slice(0, 50)),
        },
    });

    await logAction(
        'BULK_UPLOAD_SKILLS',
        'Skill',
        null,
        `Bulk uploaded ${successCount} skills with ${failureCount} failures`,
    );
    revalidatePath('/dashboard/skills');
    revalidateTag('skills');
    revalidateTag('dashboard-stats');
    return { totalRows, successCount, failureCount, rows: results };
}

export async function sendAssignmentReminder(formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== 'TRAINER' && session.user.role !== 'ADMIN')) {
        return { message: 'Unauthorized. Only Trainers or Admins can send reminders.' };
    }

    const assignmentId = formData.get('assignmentId');
    if (!assignmentId || typeof assignmentId !== 'string') {
        return { message: 'Invalid assignment.' };
    }

    try {
        const assignment = await prisma.trainingAssignment.update({
            where: { id: assignmentId },
            data: {
                lastReminderSentAt: new Date(),
            },
            include: {
                employee: true,
                skill: true,
            },
        });

        await logAction(
            'SEND_ASSIGNMENT_REMINDER',
            'TrainingAssignment',
            assignment.id,
            `Reminder sent for ${assignment.skill.code} to ${assignment.employee.name}`,
        );

        revalidatePath(`/dashboard/employees/${assignment.employeeId}`);
        return { message: 'Reminder sent.' };
    } catch (error) {
        console.error('Error sending reminder:', error);
        return { message: 'Database Error: Failed to send reminder.' };
    }
}
