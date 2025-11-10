import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import periods from '@/routes/periods';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

type Period = {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: string;
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
};

interface Props {
    period: Period;
}

function formatDateTime(iso: string) {
    if (!iso) return '-';
    const [date, time] = iso.split('T');
    return `${date} ${time ? time.slice(0, 5) : ''}`;
}

export default function PeriodShow({ period }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Periode',
            href: periods.index().url,
        },
        {
            title: `${period.name}`,
            href: periods.show(period.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${period.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-xl font-bold md:text-2xl">{period.name}</CardTitle>
                            <Link href={periods.index().url}>
                                <Button variant={'outline'} size={'sm'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Tanggal Mulai</div>
                                    <div className="flex items-center font-medium">{formatDateTime(period.start_date)}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Tanggal Selesai</div>
                                    <div className="flex items-center font-medium">{formatDateTime(period.end_date)}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="flex items-center font-medium">{period.status}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-500">Dibuat oleh</div>
                                    <div className="flex items-center font-medium">
                                        {period.created_by ? `${period.created_by.name} (${period.created_by.email})` : '-'}
                                    </div>
                                </div>
                            </div>
                            {/* <div className="mt-6 text-xs text-gray-400">
                                Dibuat: {formatDateTime(period.created_at)}
                                <br />
                                Diperbarui: {formatDateTime(period.updated_at)}
                            </div> */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
