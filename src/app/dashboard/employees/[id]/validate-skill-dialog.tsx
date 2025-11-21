'use client';

import { validateTraining } from '@/app/lib/actions';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useActionState } from 'react';
import { useState } from 'react';

export default function ValidateSkillDialog({
    employeeId,
    skills,
}: {
    employeeId: string;
    skills: {
        code: string;
        name: string;
        currentRevisionNumber?: number | null;
        documentUrl?: string | null;
    }[];
}) {
    const [open, setOpen] = useState(false);
    const [selectedSkillId, setSelectedSkillId] = useState<string>('');
    const initialState = { message: null, errors: {} };
    // @ts-expect-error Server action typing
    const [state, dispatch] = useActionState(validateTraining, initialState);

    const selectedSkill = skills.find(s => s.code === selectedSkillId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Validate New Skill</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Validate Skill</DialogTitle>
                    <DialogDescription>
                        Select a skill to validate for this employee.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} onSubmit={() => setOpen(false)} encType="multipart/form-data">
                    <input type="hidden" name="employeeId" value={employeeId} />
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="skillId">Select Skill</Label>
                            <Select name="skillId" required onValueChange={setSelectedSkillId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a skill" />
                                </SelectTrigger>
                                <SelectContent>
                                    {skills.map((skill) => (
                                        <SelectItem key={skill.code} value={skill.code}>
                                            {skill.code} - {skill.name} (Rev {skill.currentRevisionNumber || 1})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedSkill?.documentUrl && (
                                <div className="mt-2">
                                    <a
                                        href={selectedSkill.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View SOP/Document
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Skill Level (TPS)</Label>
                            <Select name="level" required defaultValue="1">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level..." />
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
                            <Label htmlFor="notes">Validator Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="Document observations, readiness, or evidence references..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence">Evidence Attachment</Label>
                            <Input id="evidence" name="evidence" type="file" accept="image/*,application/pdf" />
                            <p className="text-xs text-muted-foreground">
                                Optional: upload supporting photos or signed checklists.
                            </p>
                        </div>
                    </div>
                    {state?.message && (
                        <p className="text-sm text-muted-foreground mt-2">{state.message}</p>
                    )}
                    <DialogFooter>
                        <Button type="submit">Validate</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
