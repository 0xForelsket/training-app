import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeesLoading() {
    return (
        <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-48" />
                            </div>
                        ))}
                        <Skeleton className="h-10 w-28 rounded-full" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-8 w-16 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
