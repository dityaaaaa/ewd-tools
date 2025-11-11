import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import approvals from '@/routes/approvals';
import { BreadcrumbItem, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircleIcon, CheckIcon, ClockIcon, EyeIcon, SearchIcon, UserIcon, XIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Borrower = {
    id: number;
    name: string;
    division?: {
        id: number;
        name: string;
        code: string;
    };
};

type Period = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
};

type Creator = {
    id: number;
    name: string;
};

type Approval = {
    id: number;
    level: number | string;
    status: number | 'pending' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewer?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    notes?: string;
};

type Report = {
    id: number;
    borrower: Borrower;
    period: Period;
    creator: Creator;
    status: number;
    approvals: Approval[];
};

type PageProps = {
    reports: Report[];
    user: User & {
        division?: {
            id: number;
            name: string;
            code: string;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Persetujuan Laporan',
        href: approvals.index().url,
    },
];

const getApprovalLevelLabel = (level: string | number): string => {
    const levelStr =
        typeof level === 'number'
            ? level === 1
                ? 'RM'
                : level === 2
                  ? 'ERO'
                  : level === 3
                    ? 'KADEPT_BISNIS'
                    : level === 4
                      ? 'KADIV_ERO'
                      : level.toString()
            : level;

    switch (levelStr) {
        case 'RM':
            return 'Relationship Manager';
        case 'ERO':
            return 'Risk Analyst (ERO)';
        case 'KADEPT_BISNIS':
            return 'Kadept Bisnis';
        case 'KADIV_ERO':
            return 'Kadiv Risk';
        default:
            return levelStr.toString();
    }
};

const getApprovalStatusLabel = (status: string | number): string => {
    // Convert number to string if needed
    const statusStr =
        typeof status === 'number' ? (status === 0 ? 'pending' : status === 1 ? 'approved' : status === 2 ? 'rejected' : status.toString()) : status;

    switch (statusStr) {
        case 'pending':
            return 'Menunggu';
        case 'approved':
            return 'Disetujui';
        case 'rejected':
            return 'Ditolak';
        default:
            return statusStr.toString();
    }
};

const getReportStatusLabel = (status: string): string => {
    switch (status) {
        case 'SUBMITTED':
            return 'Disubmit';
        case 'APPROVED':
            return 'Disetujui';
        case 'REJECTED':
            return 'Ditolak';
        case 'DONE':
            return 'Selesai';
        default:
            return status;
    }
};

const getApprovalStatusBadge = (status: string | number) => {
    // Convert number to string if needed
    const statusStr =
        typeof status === 'number' ? (status === 0 ? 'pending' : status === 1 ? 'approved' : status === 2 ? 'rejected' : status.toString()) : status;

    switch (statusStr) {
        case 'pending':
            return (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 font-medium text-amber-700">
                    <ClockIcon className="mr-1 h-3 w-3" />
                    Menunggu
                </Badge>
            );
        case 'approved':
            return (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700">
                    <CheckIcon className="mr-1 h-3 w-3" />
                    Disetujui
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant="outline" className="border-red-200 bg-red-50 font-medium text-red-700">
                    <XIcon className="mr-1 h-3 w-3" />
                    Ditolak
                </Badge>
            );
        default:
            return <Badge variant="outline">{statusStr}</Badge>;
    }
};

const getReportStatusBadge = (status: number) => {
    switch (status) {
        case 1:
            return (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 font-medium text-blue-700">
                    Disubmit
                </Badge>
            );
        case 2:
            return (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700">
                    Disetujui
                </Badge>
            );
        case 3:
            return (
                <Badge variant="outline" className="border-red-200 bg-red-50 font-medium text-red-700">
                    Ditolak
                </Badge>
            );
        case 5:
            return (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 font-medium text-slate-700">
                    Selesai
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ApprovalIndex({ reports, user }: PageProps) {
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const initialQ = useMemo(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('q') ?? '';
        } catch {
            return '';
        }
    }, []);
    const [q, setQ] = useState<string>(initialQ);

    const filteredReports = useMemo(() => {
        if (!q) return reports || [];
        const qLower = q.toLowerCase();
        return (reports || []).filter((r) => {
            const fields = [r?.borrower?.name, r?.borrower?.division?.name, r?.borrower?.division?.code, r?.period?.name, r?.creator?.name]
                .filter(Boolean)
                .map((v) => String(v).toLowerCase());
            return fields.some((f) => f.includes(qLower));
        });
    }, [reports, q]);

    const applySearch = () => {
        const options = q ? { q } : undefined;
        router.get('/approvals', options as any, { preserveState: true, preserveScroll: true });
    };

    const resetSearch = () => {
        setQ('');
        router.get('/approvals', {}, { preserveState: true, preserveScroll: true });
    };

    // Get user's approval level
    const userApprovalLevel = useMemo(() => {
        if (user.roles?.some((role) => role.name === 'risk_analyst')) return 2; // ERO
        if (user.roles?.some((role) => role.name === 'kadept_bisnis')) return 3; // KADEPT_BISNIS
        if (user.roles?.some((role) => role.name === 'kadept_risk')) return 4; // KADIV_ERO
        return null;
    }, [user.roles]);

    const handleApprove = useCallback(async () => {
        if (!selectedApproval) {
            toast.error('Tidak ada approval yang dipilih');
            return;
        }

        setIsProcessing(true);
        try {
            await router.post(
                `/approvals/${selectedApproval.id}/approve`,
                {
                    notes: approvalNotes.trim() || null,
                },
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Laporan berhasil disetujui');
                        setIsApproveDialogOpen(false);
                        setApprovalNotes('');
                        setSelectedApproval(null);
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Gagal menyetujui laporan');
                    },
                },
            );
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyetujui laporan');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedApproval, approvalNotes]);

    const handleReject = useCallback(async () => {
        if (!selectedApproval || !rejectionReason.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }

        setIsProcessing(true);
        try {
            await router.post(
                `/approvals/${selectedApproval.id}/reject`,
                {
                    notes: rejectionReason,
                },
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Laporan berhasil ditolak');
                        setIsRejectDialogOpen(false);
                        setRejectionReason('');
                        setSelectedApproval(null);
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Gagal menolak laporan');
                    },
                },
            );
        } catch (error) {
            toast.error('Terjadi kesalahan saat menolak laporan');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedApproval, rejectionReason]);

    const openApproveDialog = useCallback((approval: Approval) => {
        setSelectedApproval(approval);
        setApprovalNotes('');
        setIsApproveDialogOpen(true);
    }, []);

    const openRejectDialog = useCallback((approval: Approval) => {
        setSelectedApproval(approval);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    }, []);

    const canUserApprove = useCallback(
        (approval: Approval) => {
            // Handle both number and string status
            const status =
                typeof approval.status === 'number'
                    ? approval.status === 0
                        ? 'pending'
                        : approval.status === 1
                          ? 'approved'
                          : approval.status === 2
                            ? 'rejected'
                            : approval.status.toString()
                    : approval.status;

            // Convert approval level to number for comparison
            const approvalLevel =
                typeof approval.level === 'number'
                    ? approval.level
                    : approval.level === 'RM'
                      ? 1
                      : approval.level === 'ERO'
                        ? 2
                        : approval.level === 'KADEPT_BISNIS'
                          ? 3
                          : approval.level === 'KADIV_ERO'
                            ? 4
                            : parseInt(approval.level.toString());

            return status === 'pending' && approvalLevel === userApprovalLevel;
        },
        [userApprovalLevel],
    );

    const pendingCount = useMemo(() => {
        // Hanya hitung laporan yang menunggu persetujuan di level user,
        // dan (jika user punya divisi) hanya yang berasal dari divisi user tersebut.
        return reports.reduce((count, report) => {
            const sameDivision = user?.division?.id ? report?.borrower?.division?.id === user.division.id : true;
            if (!sameDivision) return count;

            const pendingForUserLevel = (report.approvals || []).filter((approval) => {
                // Gunakan logika yang sama dengan canUserApprove untuk status & level
                const status =
                    typeof approval.status === 'number'
                        ? approval.status === 0
                            ? 'pending'
                            : approval.status === 1
                              ? 'approved'
                              : approval.status === 2
                                ? 'rejected'
                                : approval.status.toString()
                        : approval.status;

                const approvalLevel =
                    typeof approval.level === 'number'
                        ? approval.level
                        : approval.level === 'RM'
                          ? 1
                          : approval.level === 'ERO'
                            ? 2
                            : approval.level === 'KADEPT_BISNIS'
                              ? 3
                              : approval.level === 'KADIV_ERO'
                                ? 4
                                : parseInt(approval.level.toString());

                return status === 'pending' && approvalLevel === userApprovalLevel;
            });
            return count + pendingForUserLevel.length;
        }, 0);
    }, [reports, userApprovalLevel, user?.division?.id]);

    const userActionableReports = useMemo(() => {
        return filteredReports.filter((report) => {
            return report.approvals?.some((approval) => {
                const status =
                    typeof approval.status === 'number'
                        ? approval.status === 0
                            ? 'pending'
                            : approval.status === 1
                              ? 'approved'
                              : approval.status === 2
                                ? 'rejected'
                                : approval.status.toString()
                        : approval.status;

                const approvalLevel =
                    typeof approval.level === 'number'
                        ? approval.level
                        : approval.level === 'RM'
                          ? 2
                          : approval.level === 'ERO'
                            ? 3
                            : approval.level === 'KADEPT_BISNIS'
                              ? 4
                              : approval.level === 'KADIV_ERO'
                                ? 5
                                : parseInt(approval.level.toString());

                return status === 'pending' && approvalLevel === userApprovalLevel;
            });
        });
    }, [filteredReports, userApprovalLevel]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Persetujuan Laporan" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="space-y-6">
                        {/* Header Section (mirrors Borrower page) */}
                        <div className="rounded-xl border bg-card p-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Manajemen Persetujuan</h1>
                                    <p className="text-sm text-muted-foreground sm:text-base">Kelola persetujuan laporan sesuai workflow</p>
                                </div>
                                <div className="grid gap-2 sm:gap-3 sm:text-right">
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">{reports.length}</div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Total Laporan</div>
                                    </div>
                                    <div className="rounded-lg border p-3 sm:p-4">
                                        <div className="text-xl font-bold sm:text-2xl">{pendingCount}</div>
                                        <div className="text-xs text-muted-foreground sm:text-sm">Menunggu Persetujuan</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info cards (standardized tone) */}
                        {pendingCount > 0 && (
                            <Card className="border bg-background">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircleIcon className="h-5 w-5 text-amber-600" />
                                        <span className="text-sm text-muted-foreground">
                                            Anda memiliki <span className="font-semibold text-foreground">{pendingCount}</span> laporan yang menunggu
                                            persetujuan Anda
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {userApprovalLevel && (
                            <Card className="border bg-background">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm text-muted-foreground">
                                            Level persetujuan Anda:{' '}
                                            <span className="font-semibold text-foreground">{getApprovalLevelLabel(userApprovalLevel)}</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reports Table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                                    {q && (
                                        <Button variant="ghost" onClick={resetSearch} aria-label="Reset filter">
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-x-auto p-0">
                                {filteredReports.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <ClockIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-muted-foreground">Tidak ada laporan</h3>
                                        <p className="text-muted-foreground">Tidak ada laporan yang menunggu persetujuan saat ini</p>
                                    </div>
                                ) : (
                                    <Table className="min-w-[800px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Debitur</TableHead>
                                                <TableHead>Divisi</TableHead>
                                                <TableHead>Periode</TableHead>
                                                <TableHead>Status Persetujuan</TableHead>
                                                <TableHead>Catatan</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredReports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-medium">{report.borrower?.name || 'N/A'}</TableCell>
                                                    <TableCell>{report.borrower?.division?.name || 'N/A'}</TableCell>
                                                    <TableCell>{report.period?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const current = report.approvals?.find((a) => canUserApprove(a));
                                                            if (current) {
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline">{getApprovalLevelLabel(current.level)}</Badge>
                                                                        {getApprovalStatusBadge(current.status)}
                                                                    </div>
                                                                );
                                                            }
                                                            const latest = (report.approvals || []).slice().reverse()[0];
                                                            return latest ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline">{getApprovalLevelLabel(latest.level)}</Badge>
                                                                    {getApprovalStatusBadge(latest.status)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">-</span>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const approvals = report.approvals || [];
                                                            const latestWithNotes = [...approvals]
                                                                .reverse()
                                                                .find((a) => typeof a.notes === 'string' && a.notes.trim().length > 0);
                                                            const text = latestWithNotes?.notes || '';
                                                            return text ? (
                                                                <div className="max-w-[320px] truncate text-sm text-muted-foreground" title={text}>
                                                                    {text}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">-</span>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            <Link
                                                                href={`/reports/${report.id}`}
                                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                                title="Lihat Laporan"
                                                            >
                                                                <EyeIcon className="h-5 w-5" />
                                                            </Link>
                                                            {report.approvals?.map(
                                                                (approval) =>
                                                                    canUserApprove(approval) && (
                                                                        <div key={approval.id} className="flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => openApproveDialog(approval)}
                                                                                disabled={isProcessing}
                                                                                aria-label="Setujui"
                                                                            >
                                                                                <CheckIcon className="mr-1 h-4 w-4" />
                                                                                Setujui
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => openRejectDialog(approval)}
                                                                                disabled={isProcessing}
                                                                                aria-label="Tolak"
                                                                            >
                                                                                <XIcon className="mr-1 h-4 w-4" />
                                                                                Tolak
                                                                            </Button>
                                                                        </div>
                                                                    ),
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <CheckIcon className="h-5 w-5" />
                            Setujui Laporan
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Anda akan menyetujui laporan ini. Anda dapat menambahkan catatan persetujuan (opsional).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approval-notes" className="text-sm font-medium text-slate-700">
                                Catatan Persetujuan (Opsional)
                            </Label>
                            <Textarea
                                id="approval-notes"
                                placeholder="Masukkan catatan persetujuan..."
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isProcessing}>
                            Batal
                        </Button>
                        <Button onClick={handleApprove} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                            {isProcessing ? 'Memproses...' : 'Setujui'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XIcon className="h-5 w-5" />
                            Tolak Laporan
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Anda akan menolak laporan ini. Harap berikan alasan penolakan yang jelas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason" className="text-sm font-medium text-slate-700">
                                Alasan Penolakan <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Masukkan alasan penolakan..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px] resize-none"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
                            {isProcessing ? 'Memproses...' : 'Tolak'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
