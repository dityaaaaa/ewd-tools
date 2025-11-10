import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import periods from '@/routes/periods';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ClockIcon, EditIcon, EyeIcon, PlayIcon, PlusCircleIcon, StopCircle, Trash2Icon, SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Period = {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: number;
};

type PageProps = {
    periods: Period[];
    status_options: { value: number; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Periode', href: periods.index().url },
];

const getStatusBadgeClass = (status: number) => {
    switch (status) {
        case 1:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 2:
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 3:
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 4:
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function PeriodIndex() {
    const { periods: periodList, status_options } = usePage<PageProps>().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [periodToDelete, setPeriodToDelete] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isStatusUpdateLoading, setIsStatusUpdateLoading] = useState(false);
    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? '';
        } catch {
            return '';
        }
    }, []);
    const [q, setQ] = useState<string>(initialQ);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const latestPeriod = useMemo(() => {
        if (!periodList.length) return null;
        const active = periodList.find((p) => p.status === 1);
        if (active) return active;
        return [...periodList].sort((a, b) => new Date(b.start_date ?? '').getTime() - new Date(a.start_date ?? '').getTime())[0];
    }, [periodList]);

    const filteredPeriods = useMemo(() => {
        if (!q) return periodList;
        const qLower = q.toLowerCase();
        return periodList.filter((p) => {
            const fields = [p.name, p.start_date, p.end_date].filter(Boolean).map((v) => String(v).toLowerCase());
            return fields.some((f) => f.includes(qLower));
        });
    }, [periodList, q]);

    const applySearch = () => {
        const options = q ? { q } : undefined;
        router.get(periods.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get(periods.index().url, {}, { preserveState: true, preserveScroll: true });
    };

    const remainingTime = useMemo(() => {
        if (!latestPeriod || !latestPeriod.end_date) return null;

        const end = new Date(latestPeriod.end_date);
        const now = currentTime;
        const diff = end.getTime() - now.getTime();

        if (Number(latestPeriod.status) === 1) return { status: 'draft', message: 'Periode masih dalam tahap draft' };
        if (Number(latestPeriod.status) === 3) return { status: 'ended', message: 'Waktu telah dihentikan admin' };
        if (diff < 0) return { status: 'expired', message: 'Periode telah selesai' };

        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);

        return { status: 'active', days: d, hours: h % 24, minutes: m % 60, seconds: s % 60 };
    }, [latestPeriod, currentTime]);

    const openDeleteModal = (id: number) => {
        setPeriodToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!periodToDelete) return;
        router.delete(periods.destroy(periodToDelete).url, {
            onSuccess: () => toast.success('Periode berhasil dihapus'),
            onError: (errs) => Object.values(errs).forEach((e) => toast.error(e as string)),
            onFinish: () => setIsDeleteModalOpen(false),
        });
    };

    const startPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.start(id).url,
            {},
            {
                onSuccess: () => toast.success('Periode berhasil dimulai'),
                onError: () => toast.error('Gagal memulai periode'),
                onFinish: () => setIsStatusUpdateLoading(false),
            },
        );
    };

    const endPeriod = (id: number) => {
        setIsStatusUpdateLoading(true);
        router.post(
            periods.stop(id).url,
            {},
            {
                onSuccess: () => toast.success('Periode berhasil diakhiri'),
                onError: () => toast.error('Gagal mengakhiri periode'),
                onFinish: () => setIsStatusUpdateLoading(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Periode" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    {/* Header Section */}
                    <div className='rounded-xl border bg-card p-6 sm:p-8'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='mb-2 text-2xl font-bold sm:text-3xl'>Manajemen Periode</h1>
                            </div>
                        </div>
                    </div>

                    {latestPeriod && (
                        <Card className="mb-8 border bg-background">
                            <CardHeader className="border-b bg-muted/30">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-6 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <ClockIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{latestPeriod.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(latestPeriod.start_date)} - {formatDate(latestPeriod.end_date)}
                                            </p>
                                            <Badge className={`mt-2 ${getStatusBadgeClass(Number(latestPeriod.status))}`}> 
                                                {status_options.find((s) => s.value === Number(latestPeriod.status))?.label ?? '-'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {remainingTime && (
                                        <div className="flex flex-col gap-4">
                                            {remainingTime.status === 'active' ? (
                                                <div className="rounded-md border p-4">
                                                    <div className="flex justify-center gap-6">
                                                        {['Hari', 'Jam', 'Menit', 'Detik'].map((unit, i) => {
                                                            const val = [
                                                                remainingTime.days,
                                                                remainingTime.hours,
                                                                remainingTime.minutes,
                                                                remainingTime.seconds,
                                                            ][i];
                                                            return (
                                                                <div className="text-center" key={unit}>
                                                                    <div className="text-2xl font-semibold text-foreground">{val}</div>
                                                                    <div className="text-xs text-muted-foreground">{unit}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-md border p-4">
                                                    <p className="text-center text-muted-foreground font-medium">{remainingTime.message}</p>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-2">
                                                {Number(latestPeriod.status) === 1 && (
                                                    <Button variant="outline" onClick={() => startPeriod(latestPeriod.id)} disabled={isStatusUpdateLoading}>
                                                        <PlayIcon className="mr-2 h-4 w-4" />
                                                        Mulai
                                                    </Button>
                                                )}
                                                {Number(latestPeriod.status) === 2 && (
                                                    <Button variant="outline" onClick={() => endPeriod(latestPeriod.id)} disabled={isStatusUpdateLoading}>
                                                        <StopCircle className="mr-2 h-4 w-4" />
                                                        Akhiri
                                                    </Button>
                                                )}
                                                {[3, 4].includes(Number(latestPeriod.status)) && (
                                                    <Button variant="outline" disabled>
                                                        Periode Selesai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    )}

                    <Card className="border bg-background">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
                                    <ClockIcon className="h-6 w-6 text-muted-foreground" />
                                    Daftar Periode ({filteredPeriods.length})
                                </CardTitle>
                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <Input
                                        placeholder="Cari nama/tanggal periode..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') applySearch();
                                        }}
                                        className="min-w-0 flex-1 sm:w-80"
                                    />
                                    <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                        <SearchIcon className="h-4 w-4" />
                                    </Button>
                                    {q && (
                                        <Button variant="ghost" onClick={resetSearch} aria-label="Reset pencarian">
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <Link href={periods.create().url}>
                                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                                        <PlusCircleIcon className="mr-2 h-4 w-4" />
                                        Buat Periode Baru
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredPeriods.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <ClockIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">Belum ada periode yang terdaftar.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="min-w-[720px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Periode</TableHead>
                                                    <TableHead>Tanggal Mulai</TableHead>
                                                    <TableHead>Tanggal Selesai</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredPeriods.map((p, index) => (
                                                    <TableRow key={p.id} className="transition-colors">
                                                        <TableCell className="font-medium text-foreground">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                {p.name}
                                                            </div>
                                                        </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(p.start_date)}</TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(p.end_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`${getStatusBadgeClass(Number(p.status))} border-0 shadow-sm`}>
                                                            {status_options.find((s) => s.value === Number(p.status))?.label ?? '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            <Link href={periods.edit(p.id).url} title="Edit">
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EditIcon className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Link href={periods.show(p.id).url} title="Lihat">
                                                                <Button variant="outline" size="sm" className="whitespace-nowrap">
                                                                    <EyeIcon className="mr-1 h-4 w-4" />
                                                                    Lihat
                                                                </Button>
                                                            </Link>
                                                            <Button variant="outline" size="sm" className="whitespace-nowrap" title="Hapus" onClick={() => openDeleteModal(p.id)}>
                                                                <Trash2Icon className="mr-1 h-4 w-4" />
                                                                Hapus
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
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm text-muted-foreground">Total: {periodList.length} periode</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Manajemen Waktu</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <Card className="w-full max-w-sm animate-in fade-in zoom-in">
                        <CardHeader className="items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Trash2Icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Apakah anda yakin ingin menghapus periode ini?
                                <br />
                                Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col-reverse gap-3 px-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Batal
                            </Button>
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={handleDelete}
                            >
                                Ya, Hapus
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
