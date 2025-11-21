'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateEmployeeProfile } from '@/app/lib/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EmployeeProfile = {
    id: string;
    name: string;
    employeeNumber: string;
    department?: string | null;
    shift: 'DAY' | 'NIGHT';
    dateHired: string; // ISO string
};

export function EditEmployeeDialog({ employee }: { employee: EmployeeProfile }) {
    const [open, setOpen] = useState(false);
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(updateEmployeeProfile, initialState);

    useEffect(() => {
        if (state?.message === 'Employee updated successfully.') {
            setOpen(false);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>Update profile details and shift assignment.</DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="space-y-4">
                    <input type="hidden" name="id" value={employee.id} />
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={employee.name} required />
                        {state?.errors?.name && (
                            <p className="text-sm text-red-500">{state.errors.name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employeeNumber">Employee Number</Label>
                        <Input
                            id="employeeNumber"
                            name="employeeNumber"
                            defaultValue={employee.employeeNumber}
                            required
                        />
                        {state?.errors?.employeeNumber && (
                            <p className="text-sm text-red-500">{state.errors.employeeNumber}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" name="department" defaultValue={employee.department || ''} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="shift">Shift</Label>
                            <Select name="shift" defaultValue={employee.shift} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAY">Day Shift</SelectItem>
                                    <SelectItem value="NIGHT">Night Shift</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateHired">Date Hired</Label>
                            <Input
                                id="dateHired"
                                name="dateHired"
                                type="date"
                                defaultValue={employee.dateHired}
                                required
                            />
                            {state?.errors?.dateHired && (
                                <p className="text-sm text-red-500">{state.errors.dateHired}</p>
                            )}
                        </div>
                    </div>
                    {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
