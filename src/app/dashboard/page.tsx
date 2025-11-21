import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getDashboardStats, getRecentAuditLogs, getUpcomingRecertifications } from '@/app/lib/data';
import { ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
    const session = await auth();
    const [stats, recentLogs, upcomingRecerts] = await Promise.all([
        getDashboardStats(),
        getRecentAuditLogs(5),
        getUpcomingRecertifications(5),
    ]);

    const name = session?.user?.name || session?.user?.email || 'there';
    const role = session?.user?.role || 'User';

    const statCards = [
        {
            label: 'Employees',
            value: stats.employeeCount,
            description: 'Active employees in the roster',
            href: '/dashboard/employees',
        },
        {
            label: 'Skills',
            value: stats.skillCount,
            description: 'Documented work instructions',
            href: '/dashboard/skills',
        },
        {
            label: 'Validations',
            value: stats.trainingCount,
            description: 'Training records captured',
            href: '/dashboard/matrix',
        },
        {
            label: 'Trainers',
            value: stats.trainerCount,
            description: 'Active trainers available',
            href: '/dashboard/admin/users',
        },
    ];

    const quickLinks = [
        {
            title: 'Employees',
            description: 'Browse employee profiles & licenses',
            href: '/dashboard/employees',
        },
        {
            title: 'Skill Matrix',
            description: 'Check coverage & readiness at a glance',
            href: '/dashboard/matrix',
        },
        {
            title: 'Skills Library',
            description: 'Manage SOPs and work instructions',
            href: '/dashboard/skills',
        },
    ];

    if (role === 'TRAINER') {
        quickLinks.push({
            title: 'Validate Skills',
            description: 'Record new training validations',
            href: '/dashboard/employees',
        });
    }

    if (role === 'ADMIN') {
        quickLinks.push(
            {
                title: 'Admin Panel',
                description: 'Manage users, skills, and uploads',
                href: '/dashboard/admin',
            },
            {
                title: 'Audit Logs',
                description: 'Review recent system activity',
                href: '/dashboard/admin/audit',
            },
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
            <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-[0_30px_90px_-50px_rgba(6,24,44,0.6)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Role: {role}</p>
                        <h1 className="text-3xl md:text-4xl text-[#0f2a40]">Welcome back, {name}</h1>
                        <p className="text-muted-foreground md:text-lg">
                            Track coverage, keep documentation current, and stay audit-ready across every line.
                        </p>
                    </div>
                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <Button variant="outline">Sign Out</Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="space-y-1">
                            <CardDescription>{stat.label}</CardDescription>
                            <CardTitle className="text-3xl">{stat.value}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{stat.description}</p>
                            <Link href={stat.href} className="text-sm font-medium text-primary">
                                View
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest audits and validations across the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLogs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No recent activity yet. Actions such as creating employees or validating skills will appear here.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>When</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.action}</TableCell>
                                            <TableCell>{log.user.username}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {log.details || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Jump back into your most common workflows.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        className="group rounded-xl border border-border/60 bg-white/95 p-3 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_20px_40px_-30px_rgba(15,42,64,0.8)]"
                                    >
                                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#0f2a40]">
                                            {link.title}
                                            <ArrowRight className="size-4 text-primary transition group-hover:translate-x-1" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {link.description}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Recertifications</CardTitle>
                            <CardDescription>Stay ahead of expiring qualifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingRecerts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming recertifications.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Skill</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {upcomingRecerts.map((item) => (
                                            <TableRow key={item.trainingId}>
                                                <TableCell>
                                                    <Link
                                                        href={`/dashboard/employees/${item.employee.employeeNumber}`}
                                                        className="font-medium text-primary hover:underline"
                                                    >
                                                        {item.employee.name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.employee.employeeNumber}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{item.skill.code}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.skill.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.expirationDate.toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            item.status === 'OVERDUE'
                                                                ? 'destructive'
                                                                : item.status === 'DUE_SOON'
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                        }
                                                    >
                                                        {item.status === 'OVERDUE'
                                                            ? 'Overdue'
                                                            : item.status === 'DUE_SOON'
                                                                ? 'Due Soon'
                                                                : 'Current'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
