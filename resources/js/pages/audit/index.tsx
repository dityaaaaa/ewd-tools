import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import DataPagination from '@/components/data-pagination';
import { dashboard } from '@/routes';
import audits from '@/routes/audits';
import { BreadcrumbItem, PaginationData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { HistoryIcon, SearchIcon, EyeIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type AuditRow = {
    id: number;
    auditable_id: number;
    auditable_type: string;
    report_id: number;
    user?: { id: number; name: string } | null;
    action: 'created' | 'updated' | 'deleted' | string;
    before?: Record<string, any> | null;
    after?: Record<string, any> | null;
    source: string;
    created_at: string;
    readable_message?: string;
};

type PageProps = {
    audits: PaginationData & { data: AuditRow[] };
    filters: {
        q?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Audit Logs', href: audits.index().url },
];

function shortType(type: string): string {
    try {
        const parts = type.split('\\');
        return parts[parts.length - 1] || type;
    } catch {
        return type;
    }
}

function pretty(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
}

export default function AuditIndex({ audits: pagination, filters }: PageProps) {
    console.log(pagination);
    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? filters.q ?? '';
        } catch {
            return filters.q ?? '';
        }
    }, [filters.q]);
    const [q, setQ] = useState<string>(initialQ);

    const applySearch = () => {
        const url = new URL(window.location.href);
        if (q) {
            url.searchParams.set('q', q);
        } else {
            url.searchParams.delete('q');
        }
        url.searchParams.delete('page');
        router.get(url.toString(), {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <div className="mx-auto max-w-7xl space-y-4 p-4">
                <Card className="border bg-background">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <HistoryIcon className="h-5 w-5" />
                            Audit Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Cari action, model, atau source..."
                                    className="pl-8"
                                />
                            </div>
                            <Button onClick={applySearch} variant="default">
                                Terapkan
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>Pengguna</TableHead>
                                        <TableHead>Aksi</TableHead>
                                        <TableHead>Ringkasan</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Report</TableHead>
                                        <TableHead>Sumber</TableHead>
                                        <TableHead>Perubahan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagination?.data?.length ? (
                                        pagination.data.map((row) => {
                                            const changedKeys = Object.keys(row.after || {});
                                            return (
                                                <TableRow key={row.id}>
                                                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        {row.user?.name ? row.user.name : <span className="text-muted-foreground">Sistem</span>}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {row.action === 'created' && (
                                                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Dibuat</Badge>
                                                        )}
                                                        {row.action === 'updated' && (
                                                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Diperbarui</Badge>
                                                        )}
                                                        {row.action === 'deleted' && (
                                                            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Dihapus</Badge>
                                                        )}
                                                        {!['created', 'updated', 'deleted'].includes(row.action) && <Badge variant="outline">{row.action}</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[28rem] truncate" title={row.readable_message || ''}>
                                                        {row.readable_message || '-'}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">{shortType(row.auditable_type)}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {row.report_id ? (
                                                            <Link href={`/reports/${row.report_id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat Report
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">{row.source}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {changedKeys.length ? (
                                                            <div className="space-y-1">
                                                                {changedKeys.map((k) => (
                                                                    <div key={k} className="flex gap-2">
                                                                        <span className="min-w-28 text-muted-foreground">{k}</span>
                                                                        <span className="text-red-600 line-through">{pretty(row.before?.[k])}</span>
                                                                        <span className="text-emerald-700">{pretty(row.after?.[k])}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                                                Tidak ada data audit
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <DataPagination paginationData={pagination as unknown as PaginationData} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}