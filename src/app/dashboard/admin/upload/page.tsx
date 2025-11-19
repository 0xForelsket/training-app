import { UploadEmployeesForm } from './upload-employees-form';
import { UploadSkillsForm } from './upload-skills-form';

export default function UploadPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bulk Upload</h1>
                <p className="text-muted-foreground">Import data from CSV files.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <UploadEmployeesForm />
                <UploadSkillsForm />
            </div>
        </div>
    );
}
