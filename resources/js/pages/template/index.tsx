import DataPagination from '@/components/data-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templateRoutes from '@/routes/templates';
import { type BreadcrumbItem, type MaybePaginated } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { EditIcon, EyeIcon, Loader2 as Loader2Icon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Aspect = {
    id: number;
    code: number;
    latest_aspect_version: {
        name: string;
    };
};

type TemplateVersion = {
    id: number;
    name: string;
    description: string;
    version_number: number;
    aspects: Aspect[];
};

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
};

type PageProps = {
    templates: MaybePaginated<Template>;
    filters?: { q?: string | null };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Template',
        href: templateRoutes.index().url,
    },
];

export default function TemplateIndex() {
    const { templates } = usePage<PageProps>().props;
    const templateList: Template[] = Array.isArray(templates) ? templates : (templates?.data ?? []);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize search from URL
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
        setTemplateToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTemplateToDelete(null);
    };

    const handleDelete = () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        router.delete(templateRoutes.destroy(templateToDelete).url, {
            onSuccess: () => {
                toast.success('Template berhasil dihapus');
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
        const options = q ? { q } : undefined;
        router.get(templateRoutes.index(options as any).url, {}, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get(templateRoutes.index().url, {}, { preserveState: true, preserveScroll: true });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List Template" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className='rounded-xl border bg-card p-6 sm:p-8'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h1 className='mb-2 text-2xl font-bold sm:text-3xl'>Manajemen Template</h1>
                                    <p className='text-sm text-muted-foreground sm:text-base'>Kelola template laporan dan aspek terkait</p>
                                </div>
                                <div className='text-right'>
                                    <div className='rounded-lg border p-3 sm:p-4'>
                                        <div className='text-xl font-bold sm:text-2xl'>{(!Array.isArray(templates) && (templates as any)?.total) ?? templateList.length ?? 0}</div>
                                        <div className='text-xs text-muted-foreground sm:text-sm'>Total Template</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Data Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex w-full items-center gap-2">
                                        <Input
                                            placeholder="Cari template..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            className="min-w-0 flex-1"
                                        />
                                        <Button variant="secondary" onClick={applySearch} aria-label="Cari">
                                            <SearchIcon className="h-4 w-4" />
                                        </Button>
                                        {q && (
                                            <Button variant="ghost" onClick={resetSearch} aria-label="Reset filter">
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Link href={templateRoutes.create().url}>
                                        <Button>
                                            <PlusIcon className="h-4 w-4" />
                                            Tambah Template
                                        </Button>
                                    </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {templateList.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <PlusIcon className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-base font-medium text-foreground">Belum ada template</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada template yang terdaftar. Silakan tambahkan template baru.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <div className="min-w-[720px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Judul</TableHead>
                                                        <TableHead>Jumlah Aspek</TableHead>
                                                        <TableHead>Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {templateList.map((template) => (
                                                        <TableRow key={template.id}>
                                                            <TableCell className="font-medium">{template.latest_template_version.name}</TableCell>
                                                            <TableCell>{template.latest_template_version.aspects.length}</TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Link href={templateRoutes.show(template.id).url}>
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
                                                                    <Link href={templateRoutes.edit(template.id).url}>
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
                                                                        onClick={() => openDeleteModal(template.id)}
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
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {!Array.isArray(templates) && templates?.links ? <DataPagination paginationData={templates as any} /> : null}
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
                        <DialogTitle>Hapus template?</DialogTitle>
                        <DialogDescription>
                            Menghapus template terpilih. Tindakan ini permanen dan tidak dapat dibatalkan.
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
