import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function logAction(
    action: string,
    entityType: string,
    entityId: string | null,
    details?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.warn('Audit Log: No user session found for action', action);
            return;
        }

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                userId: session.user.id,
                details,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We don't want to fail the main action if logging fails
    }
}
