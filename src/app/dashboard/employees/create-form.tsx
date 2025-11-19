'use client';

import { createEmployee } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useActionState } from 'react';

export default function CreateForm() {
    const initialState = { message: null, errors: {} };
    // @ts-ignore
    const [state, dispatch] = useActionState(createEmployee, initialState);

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="employeeNumber">Employee Number</Label>
                <Input id="employeeNumber" name="employeeNumber" placeholder="EMP123" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="Assembly" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="dateHired">Date Hired</Label>
                <Input id="dateHired" name="dateHired" type="date" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="photo">Profile Picture</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" />
            </div>

            <div className="flex justify-end gap-4">
                <Link href="/dashboard/employees">
                    <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit">Save Employee</Button>
            </div>
        </form>
    );
}
