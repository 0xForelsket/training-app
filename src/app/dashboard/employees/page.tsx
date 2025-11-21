import { getEmployeeDepartments, getEmployees } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default async function EmployeesPage({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        department?: string;
        shift?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query?.toString() ?? '';
    const currentDepartment = params?.department?.toString() ?? 'all';
    const currentShift = params?.shift?.toString() ?? 'all';

    const employeeFilters = {
        query,
        department: currentDepartment !== 'all' ? currentDepartment : undefined,
        shift:
            currentShift === 'DAY' || currentShift === 'NIGHT'
                ? (currentShift as 'DAY' | 'NIGHT')
                : undefined,
    };

    const [employees, departments] = await Promise.all([
        getEmployees(employeeFilters),
        getEmployeeDepartments(),
    ]);
    const hasActiveFilters = query.length > 0 || currentDepartment !== 'all' || currentShift !== 'all';

    return (
        <div className="p-8 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Employees</h1>
                <Link href="/dashboard/employees/create">
                    <Button>Add Employee</Button>
                </Link>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form className="flex flex-wrap items-end gap-4" method="GET">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Search</span>
                            <Input
                                name="query"
                                placeholder="Search by name or #"
                                defaultValue={query}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Department</span>
                            <select
                                name="department"
                                defaultValue={currentDepartment}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Shift</span>
                            <select
                                name="shift"
                                defaultValue={currentShift}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="all">All</option>
                                <option value="DAY">Day Shift</option>
                                <option value="NIGHT">Night Shift</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Apply Filters</Button>
                            {hasActiveFilters && (
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/dashboard/employees">Reset</Link>
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Date Hired</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No employees match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.employeeNumber}</TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell>{employee.department || '-'}</TableCell>
                                        <TableCell>
                                            {employee.shift === 'NIGHT' ? 'Night Shift' : 'Day Shift'}
                                        </TableCell>
                                        <TableCell>{employee.dateHired.toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/employees/${employee.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
