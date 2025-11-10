import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import { BreadcrumbItem, Role, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    user: User;
    divisions: Division[];
    roles: Role[];
}

export default function UserEdit({ user, divisions, roles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'User',
            href: users.index().url,
        },
        {
            title: `Edit - ${user.name}`,
            href: users.edit(user.id).url,
        },
    ];

    const defaultValues = {
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role_id: user.role_id || 0,
        division_id: user.division_id || null,
    };
    const { data, setData, put, reset, processing, errors, isDirty } = useForm(defaultValues);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(users.update(user.id).url, {
            onSuccess: () => {
                toast.success('User berhasil diperbarui.');
                router.visit(users.index().url, {
                    preserveScroll: true,
                    preserveState: true,
                });
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-bold text-foreground md:text-2xl">Edit User</CardTitle>
                            <Link href={users.index().url}>
                                <Button variant={'outline'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password baru (opsional)"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Masukkan konfirmasi password baru"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="role_id">Role</Label>
                                        <Select
                                            value={data.role_id ? String(data.role_id) : ''}
                                            onValueChange={(value) => setData('role_id', Number(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={String(role.id)}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="division">Divisi</Label>
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
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-4">
                                {isDirty && (
                                    <Button type="button" variant={'outline'} onClick={() => reset()}>
                                        Reset
                                    </Button>
                                )}
                                <Button type="submit" disabled={!isDirty || processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
