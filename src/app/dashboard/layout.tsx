import Link from 'next/link';
import Image from 'next/image';
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
            <header className="print:hidden bg-white/95 shadow-sm border-b border-border/60">
                <div className="flex h-16 items-center px-6 gap-5">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-[#002540]"
                        aria-label="Training App home"
                    >
                        <Image src="/logo.png" alt="Training App logo" width={36} height={36} className="h-9 w-9 object-contain" />
                        <span className="font-semibold text-xl md:text-2xl tracking-[0.08em] uppercase">Training App</span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm md:text-base font-semibold text-[#30506f]">
                        <Link href="/dashboard/employees" className="transition-colors hover:text-[#002540]">
                            Employees
                        </Link>
                        <Link href="/dashboard/skills" className="transition-colors hover:text-[#002540]">
                            Skills
                        </Link>
                        <Link href="/dashboard/matrix" className="transition-colors hover:text-[#002540]">
                            Matrix
                        </Link>
                        {session?.user?.role === 'ADMIN' && (
                            <Link href="/dashboard/admin" className="transition-colors hover:text-[#002540]">
                                Admin
                            </Link>
                        )}
                    </nav>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm md:text-base text-[#30506f]">
                            {session?.user?.username || session?.user?.email}
                        </span>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button variant="outline" size="sm">Sign Out</Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1 bg-transparent">
                {children}
            </main>
        </div>
    );
}
