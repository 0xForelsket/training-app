import { getSkillById } from '@/app/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { SkillRevisionForm } from './skill-revision-form';

export default async function SkillRevisionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const skill = await getSkillById(id);

    if (!skill) {
        notFound();
    }

    const sortedRevisions = [...skill.revisions].sort((a, b) => b.revisionNumber - a.revisionNumber);

    return (
        <div className="p-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">{skill.code}</h1>
                <p className="text-muted-foreground">
                    Current Revision: Rev {skill.currentRevisionNumber || 1}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Publish New Revision</CardTitle>
                </CardHeader>
                <CardContent>
                    <SkillRevisionForm skill={skill} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Revision History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sortedRevisions.map((revision) => (
                            <div key={revision.id} className="rounded-md border p-3">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Rev {revision.revisionNumber}</span>
                                    <span>{new Date(revision.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium">{revision.name}</p>
                                {revision.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{revision.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
