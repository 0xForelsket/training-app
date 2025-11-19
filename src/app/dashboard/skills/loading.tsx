import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const skeletonRows = Array.from({ length: 6 });

export default function SkillsLoading() {
    return (
        <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-8 w-52 rounded bg-muted animate-pulse" />
                <Button disabled className="pointer-events-none opacity-50">
                    <span className="h-4 w-20 rounded bg-muted animate-pulse" />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="h-6 w-32 rounded bg-muted animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-muted-foreground">
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
