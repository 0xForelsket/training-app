import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const skeletonRows = Array.from({ length: 4 });
const skeletonCols = Array.from({ length: 6 });

export default function SkillMatrixLoading() {
    return (
        <div className="p-8 overflow-x-auto">
            <Card className="min-w-max">
                <CardHeader>
                    <CardTitle className="h-6 w-32 rounded bg-muted animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex gap-4">
                            <div className="w-48 h-4 rounded bg-muted animate-pulse" />
                            {skeletonCols.map((_, index) => (
                                <div key={index} className="w-24 h-4 rounded bg-muted animate-pulse" />
                            ))}
                        </div>
                        <div className="space-y-2">
                            {skeletonRows.map((_, rowIndex) => (
                                <div key={rowIndex} className="flex gap-4 items-center">
                                    <div className="w-48">
                                        <div className="h-5 rounded bg-muted animate-pulse" />
                                        <div className="mt-1 h-3 w-32 rounded bg-muted animate-pulse" />
                                    </div>
                                    {skeletonCols.map((_, colIndex) => (
                                        <div key={colIndex} className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
