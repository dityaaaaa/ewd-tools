import DataPagination from '@/components/data-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reportRoutes from '@/routes/reports';
import { type BreadcrumbItem, type Division, type MaybePaginated, type Period, type Report } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, Loader2 as Loader2Icon, PaperclipIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type PageProps = {
    reports: MaybePaginated<Report>;
    divisions?: Division[];
    periods?: Period[];
    filters?: {
        q?: string | null;
        division_id?: number | string | null;
        period_id?: number | string | null;
    };
};

const formatDate = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getReportStatusBadge = (status?: number | string | null) => {
    if (status === undefined || status === null || status === '') return <Badge variant="secondary">-</Badge>;
    const sNum = typeof status === 'number' ? status : undefined;
    const sStr = typeof status === 'string' ? status.toLowerCase() : undefined;
    const labelFromNum: Record<number, string> = {
        0: 'Draf',
        1: 'Diajukan',
        2: 'Ditinjau',
        3: 'Disetujui',
        4: 'Ditolak',
        5: 'Selesai',
    };
    const variantFromNum: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        0: 'outline',
        1: 'secondary',
        2: 'secondary',
        3: 'default',
        4: 'destructive',
        5: 'default',
    };
    const labelFromStr: Record<string, string> = {
        draft: 'Draf',
        submitted: 'Diajukan',
        reviewed: 'Ditinjau',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        done: 'Selesai',
    };
    const variantFromStr: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        draft: 'outline',
        submitted: 'secondary',
        reviewed: 'secondary',
        approved: 'default',
        rejected: 'destructive',
        done: 'default',
    };
    const label = sNum !== undefined ? labelFromNum[sNum] : sStr ? labelFromStr[sStr] : String(status);
    const variant = sNum !== undefined ? (variantFromNum[sNum] ?? 'outline') : sStr ? (variantFromStr[sStr] ?? 'outline') : 'outline';
    return <Badge variant={variant}>{label}</Badge>;
};

const getClassificationBadge = (classification?: number | string | null) => {
    if (classification === undefined || classification === null || classification === '') return <Badge variant="secondary">-</Badge>;
    const cNum = typeof classification === 'number' ? classification : undefined;
    const cStr = typeof classification === 'string' ? classification.toLowerCase() : undefined;
    const labelFromNum: Record<number, string> = {
        0: 'Watchlist',
        1: 'Aman',
    };
    const variantFromNum: Record<number, 'default' | 'secondary' | 'outline'> = {
        0: 'secondary',
        1: 'default',
    };
    const labelFromStr: Record<string, string> = {
        watchlist: 'Watchlist',
        safe: 'Aman',
    };
    const variantFromStr: Record<string, 'default' | 'secondary' | 'outline'> = {
        watchlist: 'secondary',
        safe: 'default',
    };
    const label = cNum !== undefined ? labelFromNum[cNum] : cStr ? labelFromStr[cStr] : String(classification);
    const variant = cNum !== undefined ? (variantFromNum[cNum] ?? 'outline') : cStr ? (variantFromStr[cStr] ?? 'outline') : 'outline';
    return <Badge variant={variant}>{label}</Badge>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Laporan',
        href: reportRoutes.index().url,
    },
];

export default function ReportIndex() {
    const pageProps = usePage<PageProps>().props as any;
    const reports = pageProps.reports as MaybePaginated<Report>;
    const divisions = (pageProps.divisions ?? []) as Division[];
    const periods = (pageProps.periods ?? []) as Period[];
    const reportList: Report[] = Array.isArray(reports) ? reports : (reports?.data ?? []);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? '';
        } catch {
            return '';
        }
    }, []);
    const initialDivisionId = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const val = params.get('division_id');
            return val ?? undefined;
        } catch {
            return undefined;
        }
    }, []);
    const initialPeriodId = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const val = params.get('period_id');
            return val ?? undefined;
        } catch {
            return undefined;
        }
    }, []);

    const [q, setQ] = useState<string>(initialQ);
    const [divisionId, setDivisionId] = useState<string | undefined>(initialDivisionId);
    const [periodId, setPeriodId] = useState<string | undefined>(initialPeriodId);

    const openDeleteModal = (id: number) => {
        setReportToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
    };

    const handleDelete = () => {
        if (!reportToDelete) return;
        setIsDeleting(true);
        router.delete(reportRoutes.destroy(reportToDelete).url, {
            onSuccess: () => {
                toast.success('Laporan berhasil dihapus');
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => toast.error(error as string));
            },
            onFinish: () => {
                setIsDeleting(false);
                closeDeleteModal();
            },
        });
    };

    const applySearch = () => {
        const options: Record<string, string> = {};
        if (q) options.q = q;
        if (divisionId) options.division_id = divisionId;
        if (periodId) options.period_id = periodId;
        router.get(reportRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        setDivisionId(undefined);
        setPeriodId(undefined);
        router.get(reportRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Laporan" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Laporan</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola data laporan dan informasi periode/divisi</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">
                                            {(!Array.isArray(reports) && (reports as any)?.total) ?? reportList.length ?? 0}
                                        </div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Laporan</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Content Section */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="flex w-full items-center gap-2">
                                        <Input
                                            placeholder="Cari debitur/divisi/periode/pembuat..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            className="min-w-0 flex-1"
                                        />
                                        <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                            <SearchIcon className="h-4 w-4" />
                                        </Button>
                                        {(q || divisionId || periodId) && (
                                            <Button variant="ghost" onClick={resetSearch} aria-label="Reset filter">
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {reportList.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <PaperclipIcon className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-base font-medium text-foreground">Belum ada laporan</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada laporan yang terdaftar. Silahkan tambahkan laporan baru.
                                        </p>
                                    </div>
                                ) : (
                                    <Table className="w-full overflow-x-auto">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Debitur</TableHead>
                                                <TableHead>Divisi</TableHead>
                                                <TableHead>Periode</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Pengajuan</TableHead>
                                                <TableHead>Pembuat</TableHead>
                                                <TableHead>Klasifikasi</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportList.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell>{report.borrower.name}</TableCell>
                                                    <TableCell>
                                                        {report.borrower.division?.code}
                                                        {report.borrower.division?.name ? ` — ${report.borrower.division.name}` : ''}
                                                    </TableCell>
                                                    <TableCell>{report.period?.name ?? '-'}</TableCell>
                                                    <TableCell>{getReportStatusBadge(report.status)}</TableCell>
                                                    <TableCell>{formatDate(report.submitted_at)}</TableCell>
                                                    <TableCell>{report.creator?.name ?? '-'}</TableCell>
                                                    <TableCell>{getClassificationBadge(report.summary?.final_classification)}</TableCell>
                                                    <TableCell className="flex justify-end space-x-2 text-right">
                                                        <Link
                                                            href={reportRoutes.edit(report.id).url}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Edit Laporan"
                                                        >
                                                            <EditIcon className="h-5 w-5" />
                                                        </Link>
                                                        <Link
                                                            href={reportRoutes.show(report.id).url}
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Lihat Laporan"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(report.id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Hapus Laporan"
                                                        >
                                                            <Trash2Icon className="h-5 w-5" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter>
                                {!Array.isArray(reports) && reports?.links ? <DataPagination paginationData={reports as any} /> : null}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent
                    className="sm:max-w-md"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleDelete();
                        }
                    }}
                >
                    <DialogHeader className="items-center text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2Icon className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle>Hapus laporan?</DialogTitle>
                        <DialogDescription>Menghapus laporan terpilih. Tindakan ini permanen dan tidak dapat dibatalkan.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={closeDeleteModal} disabled={isDeleting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} aria-busy={isDeleting}>
                            {isDeleting ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Trash2Icon className="mr-2 h-4 w-4" />}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
