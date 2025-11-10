import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import periods from '@/routes/periods';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';

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
        title: 'Tambah Periode',
        href: periods.create().url,
    },
];

type Props = {
    status_options: {
        value: number;
        label: string;
    }[];
};

export default function PeriodCreate({ status_options }: Props) {
    const defaultValues = {
        name: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        status: status_options[0].value,
    };

    const { data, setData, post, processing, errors, reset, isDirty } = useForm(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(periods.store().url, {
            onSuccess: () => {
                toast.success('Periode berhasil dibuat');
                reset();
            },
            onError: (errs) => {
                toast.error('Terjadi kesalahan saat membuat periode.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Periode Baru" />

            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold md:text-2xl">Buat Periode Baru</CardTitle>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Periode</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama periode"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    <InputError message={errors.start_time} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                                    <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                    <InputError message={errors.end_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input id="end_time" type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} />
                                    <InputError message={errors.end_time} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Input
                                        id="status"
                                        value={status_options.find((item) => item.value === data.status)?.label || 'draft'}
                                        placeholder="draft"
                                        disabled
                                    />
                                    <InputError message={errors.status} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-4">
                                {isDirty && (
                                    <Button type="button" variant={'outline'} onClick={() => reset()}>
                                        Reset
                                    </Button>
                                )}
                                <Button type="submit" disabled={!isDirty || processing}>
                                    Simpan
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
