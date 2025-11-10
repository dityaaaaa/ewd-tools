import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import borrowers from '@/routes/borrowers';
import { Borrower, BreadcrumbItem, Division } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
    borrower: Borrower;
    divisions: Division[];
}

export default function BorrowerEdit({ borrower, divisions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Debitur',
            href: borrowers.index().url,
        },
        {
            title: `Edit - ${borrower.name}`,
            href: borrowers.edit(borrower.id).url,
        },
    ];

    const defaultValues = {
        name: borrower.name || '',
        division_id: borrower.division_id?.toString() || '',
    };

    const { data, setData, put, reset, processing, errors, isDirty } = useForm(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(borrowers.update(borrower.id).url, {
            onSuccess: () => {
                toast.success('Borrower berhasil diperbarui.');
                router.visit(borrowers.index().url, {
                    preserveScroll: true,
                    preserveState: true,
                });
            },
            onError: (errs) => {
                Object.values(errs).forEach((err) => toast.error(err as string));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Debitur" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold md:text-2xl">Edit Borrower</CardTitle>
                            <Link href={borrowers.index().url}>
                                <Button variant="outline">
                                    <ArrowLeftIcon className="mr-1 h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Borrower</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama borrower"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="division_id">Divisi</Label>
                                    <Select
                                        value={data.division_id ? String(data.division_id) : ''}
                                        onValueChange={(value) => setData('division_id', Number(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih divisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {divisions.map((division) => (
                                                <SelectItem key={division.id} value={String(division.id)}>
                                                    {division.code} - {division.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-4">
                                {isDirty && (
                                    <Button type="button" variant="outline" onClick={() => reset()}>
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
