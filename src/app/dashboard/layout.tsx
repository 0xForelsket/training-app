import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth, signOut } from '@/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b print:hidden">
                <div className="flex h-16 items-center px-4 gap-4">
                    <Link href="/dashboard" className="font-semibold text-lg">
                        Training App
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/dashboard/employees" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Employees
                        </Link>
                        <Link href="/dashboard/skills" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Skills
                        </Link>
                        <Link href="/dashboard/matrix" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Matrix
                        </Link>
                        {session?.user?.role === 'ADMIN' && (
                            <Link href="/dashboard/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                Admin
                            </Link>
                        )}
                    </nav>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {session?.user?.username || session?.user?.email}
                        </span>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button variant="ghost" size="sm">Sign Out</Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1 bg-muted/40">
                {children}
            </main>
        </div>
    );
}
