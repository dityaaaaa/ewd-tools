import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reportRoutes from '@/routes/reports';
import { type BreadcrumbItem, type MaybePaginated, type Report, type Division, type Period } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, Loader2 as Loader2Icon, Trash2Icon, SearchIcon, XIcon, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type PageProps = {
    reports: MaybePaginated<Report>;
    divisions?: Division[];
    periods?: Period[];
    filters?: { q?: string | null; division_id?: number | string | null; period_id?: number | string | null };
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

    // Initialize search and filter state from URL
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
                        {/* Content Section */}
                        <Card className="border bg-background">
                            <CardHeader className="flex flex-col gap-3 border-b bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
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
                                    <div className="w-full sm:w-56">
                                        <Select
                                            value={divisionId ?? undefined}
                                            onValueChange={(value) => {
                                                if (value === '__all') {
                                                    setDivisionId(undefined);
                                                } else {
                                                    setDivisionId(value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua Divisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all">Semua Divisi</SelectItem>
                                                {divisions.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.code} — {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-full sm:w-56">
                                        <Select
                                            value={periodId ?? undefined}
                                            onValueChange={(value) => {
                                                if (value === '__all') {
                                                    setPeriodId(undefined);
                                                } else {
                                                    setPeriodId(value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua Periode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all">Semua Periode</SelectItem>
                                                {periods.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Link href={reportRoutes.create().url}>
                                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Buat Laporan
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {reportList.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <EyeIcon className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-base font-medium text-foreground">Belum ada laporan</h3>
                                        <p className="text-sm text-muted-foreground">Belum ada laporan yang terdaftar.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <div className="min-w-[720px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Debitur</TableHead>
                                                        <TableHead>Divisi</TableHead>
                                                        <TableHead>Periode</TableHead>
                                                        <TableHead className="text-right">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {reportList.map((report) => (
                                                        <TableRow key={report.id}>
                                                            <TableCell>{report.borrower.name}</TableCell>
                                                            <TableCell>{report.borrower.division.code}</TableCell>
                                                            <TableCell>{report.period.name}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                                                                    <Link href={'#'}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
                                                                            aria-label="Edit Laporan"
                                                                            title="Edit Laporan"
                                                                        >
                                                                            <EditIcon className="h-4 w-4" />
                                                                            <span className="sr-only">Edit</span>
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={reportRoutes.show(report.id).url}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                                                                            aria-label="Detail Laporan"
                                                                            title="Detail Laporan"
                                                                        >
                                                                            <EyeIcon className="h-4 w-4" />
                                                                            <span className="sr-only">Lihat</span>
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        title="Hapus Laporan"
                                                                        onClick={() => openDeleteModal(report.id)}
                                                                        aria-label="Hapus Laporan"
                                                                    >
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                        <span className="sr-only">Hapus</span>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
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
                        <DialogDescription>
                            Menghapus laporan terpilih. Tindakan ini permanen dan tidak dapat dibatalkan.
                        </DialogDescription>
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
