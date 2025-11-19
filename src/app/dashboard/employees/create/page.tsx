import CreateForm from '@/app/dashboard/employees/create-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateEmployeePage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Employee</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateForm />
                </CardContent>
            </Card>
        </div>
    );
}
