import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
            <Card>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 py-6">
                    <div className="space-y-3 max-w-2xl">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-full" />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-7 w-16" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                        </CardTitle>
                        <Skeleton className="h-3 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="grid grid-cols-4 gap-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-6 w-28" />
                        </CardTitle>
                        <Skeleton className="h-3 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
