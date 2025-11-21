'use client';

import { deleteSkill } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteSkillButton({ code }: { code: string }) {
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
            await deleteSkill(code);
        }
    };

    return (
        <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
