'use client';

import { useActionState } from 'react';
import { createSkillRevision } from '@/app/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type SkillRevisionFormProps = {
    skill: {
        code: string;
        name: string;
        project?: string | null;
        description?: string | null;
        validityMonths?: number | null;
        recertReminderDays?: number | null;
    };
};

export function SkillRevisionForm({ skill }: SkillRevisionFormProps) {
    const initialState = { message: null, errors: {} };
    // @ts-expect-error Server action typing
    const [state, dispatch] = useActionState(createSkillRevision, initialState);

    return (
        <form action={dispatch} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="skillId" value={skill.code} />

            <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input id="name" name="name" defaultValue={skill.name} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" name="project" defaultValue={skill.project || ''} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={skill.description || ''} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="validityMonths">Validity (Months)</Label>
                    <Input
                        id="validityMonths"
                        name="validityMonths"
                        type="number"
                        min={1}
                        defaultValue={skill.validityMonths ?? ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="recertReminderDays">Reminder Lead Time (Days)</Label>
                    <Input
                        id="recertReminderDays"
                        name="recertReminderDays"
                        type="number"
                        min={1}
                        defaultValue={skill.recertReminderDays ?? ''}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="document">SOP Document (PDF)</Label>
                <Input id="document" name="document" type="file" accept=".pdf" />
            </div>

            {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}

            <div className="flex justify-end">
                <Button type="submit">Publish Revision</Button>
            </div>
        </form>
    );
}
