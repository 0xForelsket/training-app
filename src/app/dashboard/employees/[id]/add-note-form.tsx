'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createEmployeeNote } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function AddEmployeeNoteForm({ employeeId }: { employeeId: string }) {
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(createEmployeeNote, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message === 'Note added successfully.') {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={dispatch} className="space-y-3">
            <input type="hidden" name="employeeId" value={employeeId} />
            <Textarea name="content" placeholder="Add a coaching note" required minLength={3} />
            {state?.errors?.content && (
                <p className="text-sm text-red-500">{state.errors.content}</p>
            )}
            {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
            <div className="flex justify-end">
                <Button type="submit">Add Note</Button>
            </div>
        </form>
    );
}
