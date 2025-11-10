import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import periods from '@/routes/periods';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';

type Period = {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: string;
};

type Props = {
    period: Period;
    status_options: {
        value: number;
        label: string;
    }[];
};

export default function PeriodEdit({ period, status_options }: Props) {
    console.log(period);

    const getDate = (iso: string) => (iso ? iso.split('T')[0] : '');
    const getTime = (iso: string) => {
        if (!iso) return '';
        const t = iso.split('T')[1];
        return t ? t.slice(0, 5) : '';
    };

    const defaultValues = {
        name: period.name,
        start_date: getDate(period.start_date),
        start_time: getTime(period.start_date),
        end_date: getDate(period.end_date),
        end_time: getTime(period.end_date),
        status: period.status,
    };

    const { data, setData, put, processing, errors, isDirty, reset } = useForm(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(periods.update(period.id).url, {
            onSuccess: () => {
                toast.success('Periode berhasil diperbarui.');
                router.visit('/periods');
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
            },
        });
    };
    return (
        <AppLayout>
            <Head title={`Edit Periode ${period.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-4 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold md:text-2xl">Edit Periode</CardTitle>
                        </CardHeader>
                        <form onSubmit={submit}>
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
                                    <Select value={String(data.status)} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger id="status" className="w-full">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {status_options.map((opt) => (
                                                <SelectItem key={opt.value} value={String(opt.value)}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
