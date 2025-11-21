import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { username: 'trainer' },
        update: {},
        create: {
            username: 'trainer',
            password: hashedPassword,
            role: 'TRAINER',
        },
    });

    console.log({ user });

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ admin });

    const hr = await prisma.user.upsert({
        where: { username: 'hr' },
        update: {},
        create: {
            username: 'hr',
            password: hashedPassword,
            role: 'HR',
        },
    });

    const dcc = await prisma.user.upsert({
        where: { username: 'dcc' },
        update: {},
        create: {
            username: 'dcc',
            password: hashedPassword,
            role: 'DCC',
        },
    });

    console.log({ hr, dcc });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
