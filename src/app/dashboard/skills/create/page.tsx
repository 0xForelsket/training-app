import CreateSkillForm from '@/app/dashboard/skills/create-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateSkillPage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Skill</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateSkillForm />
                </CardContent>
            </Card>
        </div>
    );
}
