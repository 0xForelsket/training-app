'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyProfileLinkButton({ employeeId }: { employeeId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${origin}/dashboard/employees/${employeeId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? 'Link Copied' : 'Copy Profile Link'}
        </Button>
    );
}
