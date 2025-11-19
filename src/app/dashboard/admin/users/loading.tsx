import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const skeletonRows = Array.from({ length: 5 });

export default function AdminUsersLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
                    <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="h-6 w-40 rounded bg-muted animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                            <div className="h-4 rounded bg-muted animate-pulse" />
                            <div className="h-4 rounded bg-muted animate-pulse" />
                            <div className="h-4 rounded bg-muted animate-pulse" />
                        </div>
                        {skeletonRows.map((_, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4">
                                <div className="h-5 rounded bg-muted animate-pulse" />
                                <div className="h-5 rounded bg-muted animate-pulse" />
                                <div className="h-5 rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
