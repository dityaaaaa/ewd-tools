import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import borrowerRoutes from '@/routes/borrowers';
import { type Borrower, type BreadcrumbItem, type Division, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArchiveIcon, EditIcon, EyeIcon, Loader2 as Loader2Icon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type PageProps = {
    borrowers: MaybePaginated<Borrower>;
    divisions?: Division[];
    filters?: { q?: string | null; division_id?: number | string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Debitur',
        href: borrowerRoutes.index().url,
    },
];

export default function BorrowerIndex() {
    const pageProps = usePage<PageProps>().props as any;
    const borrowers = pageProps.borrowers as MaybePaginated<Borrower>;
    const divisions = (pageProps.divisions ?? []) as Division[];
    const borrowerList: Borrower[] = Array.isArray(borrowers) ? borrowers : (borrowers?.data ?? []);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [borrowerToDelete, setBorrowerToDelete] = useState<number | null>(null);
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

    const [q, setQ] = useState<string>(initialQ);
    const [divisionId, setDivisionId] = useState<string | undefined>(initialDivisionId);

    const openDeleteModal = (id: number) => {
        setBorrowerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBorrowerToDelete(null);
    };

    const handleDelete = () => {
        if (!borrowerToDelete) return;
        setIsDeleting(true);
        router.delete(borrowerRoutes.destroy(borrowerToDelete).url, {
            onSuccess: () => {
                toast.success('Debitur berhasil dihapus');
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
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
        router.get(borrowerRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        setDivisionId(undefined);
        router.get(borrowerRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Debitur" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Debitur</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola data debitur dan informasi divisi terkait</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">
                                            {(!Array.isArray(borrowers) && (borrowers as any)?.total) ?? borrowerList.length ?? 0}
                                        </div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Debitur</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="flex w-full items-center gap-2">
                                        <Input
                                            placeholder="Cari nama debitur atau divisi..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            className="min-w-0 flex-1"
                                        />
                                        <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                            <SearchIcon className="h-4 w-4" />
                                        </Button>
                                        {(q || divisionId) && (
                                            <Button variant="ghost" onClick={resetSearch} aria-label="Reset filter">
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Link href={borrowerRoutes.create().url}>
                                    <Button>
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Debitur
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                {borrowerList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <ArchiveIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium">Belum ada debitur</h3>
                                        <p className="text-muted-foreground">Belum ada debitur yang terdaftar. Silahkan tambahkan debitur baru.</p>
                                    </div>
                                ) : (
                                    <Table className="min-w-[720px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama Debitur</TableHead>
                                                <TableHead>Divisi</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {borrowerList.map((borrower) => (
                                                <TableRow key={borrower.id}>
                                                    <TableCell className="font-medium">{borrower.name}</TableCell>
                                                    <TableCell>{borrower.division.code}</TableCell>
                                                    <TableCell className="flex justify-end space-x-2 text-right">
                                                        <Link
                                                            href={borrowerRoutes.edit(borrower.id).url}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Edit Debitur"
                                                        >
                                                            <EditIcon className="h-5 w-5" />
                                                        </Link>
                                                        <Link
                                                            href={borrowerRoutes.show(borrower.id).url}
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Lihat Debitur"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(borrower.id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Hapus Debitur"
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
                                {!Array.isArray(borrowers) && borrowers?.links ? <DataPagination paginationData={borrowers as any} /> : null}
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
                        <DialogTitle>Hapus debitur?</DialogTitle>
                        <DialogDescription>Menghapus debitur terpilih. Tindakan ini permanen dan tidak dapat dibatalkan.</DialogDescription>
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
