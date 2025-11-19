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

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAction } from './logger';

const CreateEmployeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    employeeNumber: z.string().min(1, 'Employee Number is required'),
    department: z.string().optional(),
    dateHired: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    photo: z.any().optional(),
});

export async function createEmployee(prevState: any, formData: FormData) {
    const validatedFields = CreateEmployeeSchema.safeParse({
        name: formData.get('name'),
        employeeNumber: formData.get('employeeNumber'),
        department: formData.get('department'),
        dateHired: formData.get('dateHired'),
        photo: formData.get('photo'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Employee.',
        };
    }

    const { name, employeeNumber, department, dateHired, photo } = validatedFields.data;
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
                dateHired: new Date(dateHired),
                photoUrl,
            },
        });
        await logAction('CREATE_EMPLOYEE', 'Employee', newEmployee.id, `Created employee ${newEmployee.name} (${newEmployee.employeeNumber})`);
        revalidatePath('/dashboard/employees');
        return { message: 'Created Employee Successfully.' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Employee.',
        };
    }
}

import { writeFile } from 'fs/promises';
import path from 'path';

const CreateSkillSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    document: z.any().optional(), // We'll validate the file manually
});

export async function createSkill(prevState: any, formData: FormData) {
    const validatedFields = CreateSkillSchema.safeParse({
        code: formData.get('code'),
        name: formData.get('name'),
        description: formData.get('description'),
        document: formData.get('document'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Skill.',
        };
    }

    const { code, name, description, document } = validatedFields.data;
    let documentUrl = null;

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
                description,
                documentUrl,
            },
        });
        await logAction('CREATE_SKILL', 'Skill', newSkill.id, `Created skill ${newSkill.code} - ${newSkill.name}`);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Skill.',
        };
    }

    revalidatePath('/dashboard/skills');
    redirect('/dashboard/skills');
}

const ValidateTrainingSchema = z.object({
    employeeId: z.string(),
    skillId: z.string(),
    level: z.coerce.number().min(1).max(4),
});

export async function validateTraining(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'TRAINER') {
        return { message: 'Unauthorized. Only Trainers can validate training.' };
    }

    const validatedFields = ValidateTrainingSchema.safeParse({
        employeeId: formData.get('employeeId'),
        skillId: formData.get('skillId'),
        level: formData.get('level'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Missing Fields. Failed to Validate Training.',
        };
    }

    const { employeeId, skillId, level } = validatedFields.data;

    try {
        const record = await prisma.trainingRecord.create({
            data: {
                employeeId,
                skillId,
                validatorId: session.user.id,
                level: 1, // Default to Level 1
            },
        });
        await logAction('VALIDATE_SKILL', 'TrainingRecord', record.id, `Validated skill ${skillId} for employee ${employeeId}`);
        revalidatePath(`/dashboard/employees/${employeeId}`);
        revalidatePath('/dashboard/matrix');
        return { message: 'Training validated successfully.' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Validate Training. Record might already exist.',
        };
    }
}

const CreateUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['TRAINER', 'ADMIN', 'VIEWER']),
});

import bcrypt from 'bcryptjs';

export async function createUser(prevState: any, formData: FormData) {
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
        return {
            message: 'Database Error: Failed to Create User. Username might already exist.',
        };
    }
}

export async function deleteSkill(id: string) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return { message: 'Unauthorized. Only Admins can delete skills.' };
    }

    try {
        await prisma.skill.delete({
            where: { id },
        });
        await logAction('DELETE_SKILL', 'Skill', id, 'Deleted skill');
        revalidatePath('/dashboard/admin/skills');
        revalidatePath('/dashboard/skills');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Skill. It might be in use.',
        };
    }
}

export async function bulkCreateEmployees(employees: any[]) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return { message: 'Unauthorized.' };
    }

    let count = 0;
    let errors = [];

    for (const emp of employees) {
        try {
            await prisma.employee.create({
                data: {
                    name: emp.name,
                    employeeNumber: emp.employeeNumber,
                    department: emp.department,
                    dateHired: new Date(emp.dateHired),
                },
            });
            count++;
        } catch (error) {
            errors.push(`Failed to create ${emp.name} (${emp.employeeNumber})`);
        }
    }

    await logAction('BULK_UPLOAD_EMPLOYEES', 'Employee', null, `Bulk uploaded ${count} employees`);
    revalidatePath('/dashboard/employees');
    return { count, errors };
}

export async function bulkCreateSkills(skills: any[]) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return { message: 'Unauthorized.' };
    }

    let count = 0;
    let errors = [];

    for (const skill of skills) {
        try {
            await prisma.skill.create({
                data: {
                    code: skill.code,
                    name: skill.name,
                    description: skill.description,
                },
            });
            count++;
        } catch (error) {
            errors.push(`Failed to create ${skill.code}`);
        }
    }

    await logAction('BULK_UPLOAD_SKILLS', 'Skill', null, `Bulk uploaded ${count} skills`);
    revalidatePath('/dashboard/skills');
    return { count, errors };
}
