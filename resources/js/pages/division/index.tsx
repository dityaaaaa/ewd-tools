import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import divisionRoutes from '@/routes/divisions';
import { type BreadcrumbItem, type Division, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BuildingIcon, EditIcon, EyeIcon, Loader2 as Loader2Icon, PlusIcon, Trash2Icon, SearchIcon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type PageProps = {
    divisions: MaybePaginated<Division>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Divisi',
        href: divisionRoutes.index().url,
    },
];

export default function DivisionIndex() {
    const pageProps = usePage<PageProps>().props;
    const divisions = pageProps.divisions;
    const divisionList: Division[] = Array.isArray(divisions) ? divisions : divisions?.data ?? [];
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search state synced with URL like UserIndex
    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? '';
        } catch {
            return '';
        }
    }, []);
    const [q, setQ] = useState<string>(initialQ);

    const openDeleteModal = (id: number) => {
        setDivisionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDivisionToDelete(null);
    };

    const handleDelete = () => {
        if (!divisionToDelete) return;
        setIsDeleting(true);
        router.delete(divisionRoutes.destroy(divisionToDelete).url, {
            onSuccess: () => {
                toast.success('Divisi berhasil dihapus');
            },
            onError: (errs: any) => {
                Object.values(errs || {}).forEach((error) => {
                    toast.error(String(error));
                });
            },
            onFinish: () => {
                setIsDeleting(false);
                closeDeleteModal();
            },
        });
    };

    const applySearch = () => {
        const options = q ? { q } : undefined;
        router.get(divisionRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get(divisionRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Divisi" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Divisi</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola struktur organisasi dan divisi perusahaan</p>
                                </div>
                                <div className="text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">{(divisions as any)?.total ?? divisionList.length ?? 0}</div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Divisi</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full items-center gap-2">
                                    <Input
                                        placeholder="Cari nama atau kode divisi..."
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        className="min-w-0 flex-1"
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
                                <Link href={divisionRoutes.create().url}>
                                    <Button>
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Divisi
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                {divisionList.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <BuildingIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium">Belum ada divisi</h3>
                                        <p className="text-muted-foreground">Belum ada divisi yang terdaftar. Silahkan tambahkan divisi baru.</p>
                                    </div>
                                ) : (
                                    <Table className="min-w-[720px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {divisionList.map((division) => (
                                                <TableRow key={division.id}>
                                                    <TableCell className="font-medium">{division.code}</TableCell>
                                                    <TableCell>{division.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            <Link href={divisionRoutes.show(division.id).url}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                                                                    aria-label="Lihat"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Lihat</span>
                                                                </Button>
                                                            </Link>
                                                            <Link href={divisionRoutes.edit(division.id).url}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
                                                                    aria-label="Edit"
                                                                >
                                                                    <EditIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Edit</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => openDeleteModal(division.id)}
                                                                aria-label="Hapus"
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
                                )}
                            </CardContent>
                            <CardFooter>{(divisions as any)?.links ? <DataPagination paginationData={divisions as any} /> : null}</CardFooter>
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
                        <DialogTitle>Hapus divisi?</DialogTitle>
                        <DialogDescription>
                            Menghapus divisi terpilih. Tindakan ini permanen dan tidak dapat dibatalkan.
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
