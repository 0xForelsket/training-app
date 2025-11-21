'use client';

import { useActionState, useState } from 'react';
import { createTrainingAssignment } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SkillOption = {
    id: string;
    code: string;
    name: string;
};

export default function AssignTrainingDialog({
    employeeId,
    skills,
}: {
    employeeId: string;
    skills: SkillOption[];
}) {
    const [open, setOpen] = useState(false);
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(createTrainingAssignment, initialState);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Assignment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Plan Training</DialogTitle>
                    <DialogDescription>Assign upcoming skill goals with a target date.</DialogDescription>
                </DialogHeader>
                <form action={dispatch} onSubmit={() => setOpen(false)} className="space-y-4">
                    <input type="hidden" name="employeeId" value={employeeId} />

                    <div className="space-y-2">
                        <Label htmlFor="skillId">Skill</Label>
                        <Select name="skillId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                                {skills.map((skill) => (
                                    <SelectItem key={skill.id} value={skill.id}>
                                        {skill.code} — {skill.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="targetLevel">Target Level</Label>
                            <Select name="targetLevel" required defaultValue="3">
                                <SelectTrigger>
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Level 1 - Trainee</SelectItem>
                                    <SelectItem value="2">Level 2 - Practitioner</SelectItem>
                                    <SelectItem value="3">Level 3 - Expert</SelectItem>
                                    <SelectItem value="4">Level 4 - Trainer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" name="dueDate" type="date" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Context, audit requirements, or coaching notes"
                        />
                    </div>

                    {state?.message && (
                        <p className="text-sm text-muted-foreground">{state.message}</p>
                    )}

                    <DialogFooter>
                        <Button type="submit">Save Assignment</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
