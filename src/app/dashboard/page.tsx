import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Dashboard</CardTitle>
                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <Button variant="outline">Sign Out</Button>
                    </form>
                </CardHeader>
                <CardContent>
                    <p>Welcome, {session?.user?.name || session?.user?.email}!</p>
                    <p>Role: {session?.user?.role || 'User'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
