import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getDashboardStats, getRecentAuditLogs } from '@/app/lib/data';

export default async function DashboardPage() {
    const session = await auth();
    const [stats, recentLogs] = await Promise.all([
        getDashboardStats(),
        getRecentAuditLogs(5),
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
        <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{role}</p>
                    <h1 className="text-3xl font-bold">Welcome back, {name}</h1>
                    <p className="text-muted-foreground">
                        Track training coverage, manage documentation, and keep your workforce audit-ready.
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

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
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

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump back into your most common workflows.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {quickLinks.map((link) => (
                                <Button
                                    key={link.title}
                                    variant="secondary"
                                    className="h-auto justify-start text-left flex-col items-start gap-1"
                                    asChild
                                >
                                    <Link href={link.href}>
                                        <span className="font-semibold">{link.title}</span>
                                        <span className="text-sm text-muted-foreground">{link.description}</span>
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
