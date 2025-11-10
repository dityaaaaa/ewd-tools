import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, User as UserIcon, Mail, Building2 } from 'lucide-react';

type User = {
    id: number;
    name: string;
    email: string;
    division_id: number | null;
    division: Division;
    password: string;
    password_confirmation: string;
    created_at: string;
    updated_at: string;
};

type Division = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    user: User;
    division: Division;
}

export default function UserShow({ user }: Props) {
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
            title: `${user.name}`,
            href: users.show(user.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name}`} />
            <div className="py-8 px-6">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 rounded-2xl border bg-muted">
                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">
                        Detail User
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Informasi lengkap tentang pengguna {user.name}
                    </p>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Card className="rounded-2xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-semibold">Informasi User</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Detail lengkap pengguna sistem</p>
                                </div>
                                <Link href={users.index().url}>
                                    <Button variant={'outline'}>
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Kembali
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-3 p-6 rounded-xl border bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="text-sm font-medium">Nama Lengkap</div>
                                    </div>
                                    <div className="text-lg font-semibold ml-10">{user.name}</div>
                                </div>

                                <div className="space-y-3 p-6 rounded-xl border bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="text-sm font-medium">Email</div>
                                    </div>
                                    <div className="text-lg font-semibold ml-10">{user.email}</div>
                                </div>

                                <div className="space-y-3 p-6 rounded-xl border bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="text-sm font-medium">Divisi</div>
                                    </div>
                                    <div className="text-lg font-semibold ml-10">{user.division?.name || 'Tidak ada divisi'}</div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="text-lg font-semibold mb-4">Informasi Tambahan</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</div>
                                        <div>
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</div>
                                        <div>
                                            {new Date(user.updated_at).toLocaleDateString('id-ID', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
