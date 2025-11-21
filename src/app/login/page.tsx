'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#002540] via-[#0b2f4c] to-[#e07c00] px-4">
            <div
                className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
                style={{
                    background:
                        'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12), transparent 30%)',
                }}
            />
            <Card className="relative w-full max-w-md border border-border/60 shadow-[0_24px_70px_-40px_rgba(0,82,140,0.7)]">
                <CardHeader>
                    <div className="flex justify-center">
                        <Image src="/logo.png" alt="Training App" width={72} height={72} className="h-14 w-14 object-contain" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">Payer-inspired</p>
                    <CardTitle className="text-2xl">Training App</CardTitle>
                    <CardDescription className="text-sm">
                        Sign in to manage workforce validation and keep your teams audit-ready.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" type="text" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <LoginButton />
                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {errorMessage && (
                                <p className="text-sm text-destructive">{errorMessage}</p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full" aria-disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}
