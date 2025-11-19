'use client';

import { createSkill } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Need to add textarea component or use Input
import Link from 'next/link';
import { useActionState } from 'react';

export default function CreateSkillForm() {
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(createSkill, initialState);

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" placeholder="WI-001" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Assembly Process A" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" name="project" placeholder="e.g., Launch Prep" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Enter skill description" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="document">SOP Document (PDF)</Label>
                <Input id="document" name="document" type="file" accept=".pdf" />
                {state.errors?.document && (
                    <p className="text-sm text-red-500">{state.errors.document}</p>
                )}
            </div>

            <div className="flex justify-end gap-4">
                <Link href="/dashboard/skills">
                    <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">Save Skill</Button>
            </div>
        </form>
    );
}
