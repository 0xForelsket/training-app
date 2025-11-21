'use client';

import { sendAssignmentReminder } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';

function ReminderSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {pending ? 'Sending...' : 'Remind Trainer'}
        </Button>
    );
}

export function RemindAssignmentButton({ assignmentId }: { assignmentId: string }) {
    return (
        <form action={sendAssignmentReminder} className="flex items-center gap-2">
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <ReminderSubmitButton />
        </form>
    );
}
