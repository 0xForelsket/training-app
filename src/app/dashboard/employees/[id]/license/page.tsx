import { getEmployeeById } from '@/app/lib/data';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import PrintButton from './print-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export default async function LicensePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const employee = await getEmployeeById(id);

    if (!employee) {
        notFound();
    }

    const qrValue = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/employees/${employee.id}`;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            <div className="mb-8 print:hidden flex gap-4">
                <Link href={`/dashboard/employees/${employee.id}`}>
                    <Button variant="outline">Back to Profile</Button>
                </Link>
                <PrintButton />
            </div>

            {/* Card Container - Standard CR80 Size Aspect Ratio */}
            <div className="w-[3.375in] h-[2.125in] bg-white rounded-xl shadow-xl overflow-hidden relative flex flex-col print:shadow-none print:border border-gray-200">
                {/* Logo - Top Right */}
                <div className="absolute top-3 right-3 w-20 h-6">
                    <Image
                        src="/logo.png"
                        alt="Company Logo"
                        fill
                        className="object-contain"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex gap-4 mt-2">
                    {/* Left: Photo & QR */}
                    <div className="flex flex-col items-center justify-between w-1/3 h-full">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50 shrink-0">
                            {employee.photoUrl ? (
                                <Image
                                    src={employee.photoUrl}
                                    alt={employee.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="shrink-0">
                            <QRCodeSVG value={qrValue} size={56} level="M" />
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col justify-center space-y-2 pt-4">
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                            <p className="font-bold text-gray-900 leading-tight text-sm">{employee.name}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Employee ID</p>
                            <p className="font-mono text-xs text-gray-900">{employee.employeeNumber}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Department</p>
                            <p className="text-xs text-gray-900">{employee.department || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="h-1.5 bg-[#0f172a] w-full mt-auto"></div>
            </div>
        </div>
    );
}
