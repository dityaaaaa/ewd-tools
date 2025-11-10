import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import divisions from '@/routes/divisions';
import { BreadcrumbItem, Division } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, Building2, Hash, Calendar } from 'lucide-react';

interface Props {
    division: Division;
}

export default function DivisionShow({ division }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Divisi',
            href: divisions.index().url,
        },
        {
            title: `${division.name}`,
            href: divisions.show(division.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${division.name}`} />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950">
                <div className="py-8 px-6">
                    {/* Header Section */}
                    <div className="text-center space-y-4 mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">
                            Detail Divisi
                        </h1>
                        <p className="text-orange-600/80 dark:text-orange-300/80 max-w-2xl mx-auto">
                            Informasi lengkap tentang divisi {division.name}
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 shadow-xl shadow-orange-500/10 dark:shadow-orange-500/5">
                            <div className="p-8">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-semibold text-orange-700 dark:text-orange-300">Informasi Divisi</h2>
                                        <p className="text-sm text-orange-600/70 dark:text-orange-300/70 mt-1">Detail lengkap divisi organisasi</p>
                                    </div>
                                    <Link href={divisions.index().url}>
                                        <Button variant={'outline'} className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/50">
                                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                            Kembali
                                        </Button>
                                    </Link>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200/50 dark:border-orange-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                                                <Hash className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Kode Divisi</div>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-10">{division.code}</div>
                                    </div>

                                    <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200/50 dark:border-orange-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                                                <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Nama Divisi</div>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 ml-10">{division.name}</div>
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div className="mt-8 pt-8 border-t border-orange-200/50 dark:border-orange-800/50">
                                    <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-4">Informasi Tambahan</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Tanggal Dibuat</div>
                                            <div className="text-gray-900 dark:text-gray-100">
                                                {new Date(division.created_at).toLocaleDateString('id-ID', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Terakhir Diperbarui</div>
                                            <div className="text-gray-900 dark:text-gray-100">
                                                {new Date(division.updated_at).toLocaleDateString('id-ID', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
