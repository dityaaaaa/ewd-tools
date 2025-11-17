import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import { BreadcrumbItem, Report, Template, Watchlist } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import {
    AlertTriangleIcon,
    ArrowLeftIcon,
    BuildingIcon,
    CalendarIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FileTextIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    UserIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Approval = {
    id: number;
    level: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewer?: {
        id: number;
        name: string;
    };
    // Catatan persetujuan/penolakan jika ada
    notes?: string;
    created_at: string;
    updated_at: string;
};

type Answer = {
    id: number;
    question_version_id: number;
    question_option_id: number;
    notes: string;
    question_option: { id: number; option_text: string };
    question_version: { id: number; question_text: string };
};

type QuestionVersion = {
    id: number;
    question_text: string;
};

type AspectVersion = {
    id: number;
    name: string;
    question_versions: QuestionVersion[];
};

type ReportAspect = {
    id: number;
    classification: number;
    aspect_version: AspectVersion;
};

type PageProps = {
    report: Report & {
        approvals?: Approval[];
        aspects?: ReportAspect[];
        answers?: Answer[];
    };
    template: Template;
    watchlist?: Watchlist;
};

const formatCurrency = (value: number | string | undefined | null) => {
    const num = Number(value);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return '-';
    }
};

const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return '-';
    return value ? 'Ya' : 'Tidak';
};

const getClassificationBg = (c?: number) => (c === 0 ? 'bg-red-100' : 'bg-green-100');

export default function ReportShow({ report, template, watchlist }: PageProps) {
    const page = usePage<SharedData>().props;
    const roles = useMemo(() => {
        const names = [
            ...(page.auth.user.roles?.map((r) => r.name) ?? []),
            page.auth.user.role?.name,
        ].filter(Boolean) as string[];
        return new Set(names);
    }, [page.auth.user]);

    const userApprovalLevel = useMemo(() => {
        if (roles.has('risk_analyst')) return 2; // ERO
        if (roles.has('kadept_bisnis')) return 3; // KADEPT_BISNIS
        if (roles.has('kadept_risk')) return 4; // KADIV_ERO
        return null;
    }, [roles]);
    const { borrower, creator, period, summary, answers, aspects, facilities, approvals } = useMemo(() => {
        const borrower = report.borrower;
        const creator = report.creator;
        const summary = report.summary;
        const period = report.period;
        const aspects = report.aspects || [];
        const facilities = borrower.facilities || [];
        const approvals = report.approvals || [];
        const answers = report.answers || [];

        return { borrower, creator, period, summary, answers, aspects, facilities, approvals };
    }, [report]);
    console.log(aspects);

    const answerMap = useMemo(() => {
        const map = new Map<number, Answer>();
        (answers || []).forEach((answer: any) => {
            const qvId = (answer as any)?.question_version_id || answer?.question_version?.id;
            if (qvId) {
                map.set(qvId, answer);
            }
        });
        return map;
    }, [answers]);

    const facilitiesTotals = useMemo(() => {
        return facilities.reduce(
            (acc, facility) => {
                acc.total_limit += Number(facility.limit) || 0;
                acc.total_outstanding += Number(facility.outstanding) || 0;
                acc.total_principal_arrears += Number(facility.principal_arrears) || 0;
                acc.total_interest_arrears += Number(facility.interest_arrears) || 0;
                return acc;
            },
            { total_limit: 0, total_outstanding: 0, total_principal_arrears: 0, total_interest_arrears: 0 },
        );
    }, [facilities]);

    const [expandedSections, setExpandedSections] = useState({
        borrower: true,
        facilities: true,
        aspects: true,
        summary: true,
        approvals: true,
        audits: true,
        debug: true,
    });

    const [expandedAspects, setExpandedAspects] = useState<Record<number, boolean>>({});

    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleSection = useCallback((section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const toggleAspectDetail = useCallback((aspectId: number) => {
        setExpandedAspects((prev) => ({ ...prev, [aspectId]: !prev[aspectId] }));
    }, []);

    const handleApprove = useCallback(async (approvalId: number) => {
        setIsProcessing(true);
        try {
            await router.post(
                `/approvals/${approvalId}/approve`,
                {},
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Laporan berhasil disetujui');
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
    }, []);

    const handleReject = useCallback(
        async (approvalId: number) => {
            if (!rejectionReason.trim()) {
                toast.error('Alasan penolakan harus diisi');
                return;
            }

            setIsProcessing(true);
            try {
                await router.post(
                    `/approvals/${approvalId}/reject`,
                    {
                        notes: rejectionReason,
                    },
                    {
                        preserveState: false,
                        onSuccess: () => {
                            toast.success('Laporan berhasil ditolak');
                            setRejectionReason('');
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
        },
        [rejectionReason],
    );

    // Normalize approval status coming as number (0/1/2) or string
    const normalizeApprovalStatus = (status: string | number) => {
        if (typeof status === 'number') {
            return status === 0 ? 'pending' : status === 1 ? 'approved' : status === 2 ? 'rejected' : status.toString();
        }
        return status;
    };

    const getApprovalStatusBadge = (status: string | number) => {
        const statusStr = normalizeApprovalStatus(status);
        switch (statusStr) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
        }
    };

    const getApprovalLevelLabel = (level: string) => {
        switch (level) {
            case 'RM':
                return 'Relationship Manager';
            case 'ERO':
                return 'ERO (Risk Analyst)';
            case 'KADEPT_BISNIS':
                return 'Kepala Departemen Bisnis';
            case 'KADIV_ERO':
                return 'Kepala Divisi ERO';
            default:
                return level;
        }
    };

    const normalizeApprovalLevelToNumber = (level: string | number) => {
        if (typeof level === 'number') return level;
        switch (level) {
            case 'RM':
                return 1;
            case 'ERO':
                return 2;
            case 'KADEPT_BISNIS':
                return 3;
            case 'KADIV_ERO':
                return 4;
            default: {
                const parsed = parseInt(level.toString());
                return Number.isNaN(parsed) ? -1 : parsed;
            }
        }
    };

    const canUserApprove = useCallback(
        (approval: Approval) => {
            const status = normalizeApprovalStatus(approval.status);
            const levelNum = normalizeApprovalLevelToNumber(approval.level);

            // Harus pending dan level user sesuai
            if (!(status === 'pending' && userApprovalLevel !== null && levelNum === userApprovalLevel)) {
                return false;
            }

            // Gate tambahan: pastikan status laporan sudah mencapai tahapan yang benar untuk level ini
            // Mapping ReportStatus (int) berdasarkan ApprovalLevel (int):
            // 2 (ERO) -> 1 (SUBMITTED)
            // 3 (KADEPT_BISNIS) -> 2 (REVIEWED)
            // 4 (KADIV_ERO) -> 3 (APPROVED)
            const expectedReportStatusByLevel: Record<number, number> = {
                2: 1,
                3: 2,
                4: 3,
            };
            const expectedStatus = expectedReportStatusByLevel[levelNum];
            return expectedStatus !== undefined && report.status === expectedStatus;
        },
        [userApprovalLevel, report.status],
    );

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Laporan',
            href: reports.index().url,
        },
        {
            title: `${report.borrower.name}`,
            href: reports.show(report.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laporan ${report.borrower.name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card className="mb-6">
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold md:text-2xl">Laporan {report.borrower.name}</CardTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>
                                            {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" />
                                        <span>{creator.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BuildingIcon className="h-4 w-4" />
                                        <span>{borrower.division.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {approvals && approvals.some((approval) => canUserApprove(approval)) && (
                                    <div className="flex gap-2">
                                        {approvals
                                            .filter((approval) => canUserApprove(approval))
                                            .map((approval) => (
                                                <div key={approval.id} className="flex gap-1">
                                                    <Button
                                                        onClick={() => handleApprove(approval.id)}
                                                        disabled={isProcessing}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <ThumbsUpIcon className="h-4 w-4" />
                                                        Setujui {getApprovalLevelLabel(approval.level)}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(approval.id)}
                                                        disabled={isProcessing || !rejectionReason.trim()}
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        <ThumbsDownIcon className="h-4 w-4" />
                                                        Tolak {getApprovalLevelLabel(approval.level)}
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {summary?.final_classification === 0 && (
                                    <Button variant={'default'} size={'sm'} onClick={() => window.open(`/watchlist?reportId=${report.id}`, '_self')}>
                                        <FileTextIcon className="h-4 w-4" />
                                        Lihat NAW
                                    </Button>
                                )}
                                <Link href={reports.index().url}>
                                    <Button variant={'outline'} size={'sm'}>
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        Kembali
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Rejection Reason Input - Only show when there are pending approvals */}
                    {approvals && approvals.some((approval) => canUserApprove(approval)) && (
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Alasan Penolakan (jika menolak)</Label>
                                    <Textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Masukkan alasan penolakan jika Anda akan menolak laporan ini..."
                                        rows={3}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Alasan penolakan diperlukan untuk menolak laporan. Kosongkan jika Anda akan menyetujui.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Informasi Debitur */}
                    <Card className="mb-6">
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection('borrower')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BuildingIcon className="h-5 w-5" />
                                    Informasi Debitur
                                </CardTitle>
                                {expandedSections.borrower ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        {expandedSections.borrower && (
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Nama Debitur</Label>
                                        <p className="mt-1 text-sm">{borrower.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Divisi</Label>
                                        <p className="mt-1 text-sm">{borrower.division.name}</p>
                                    </div>
                                    {borrower.detail && (
                                        <>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Grup Debitur</Label>
                                                <p className="mt-1 text-sm">{borrower.detail.borrower_group || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Tujuan</Label>
                                                <p className="mt-1 text-sm">{borrower.detail.purpose || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Sektor Ekonomi</Label>
                                                <p className="mt-1 text-sm">{borrower.detail.economic_sector || '-'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Bidang Usaha</Label>
                                                <p className="mt-1 text-sm">{borrower.detail.business_field || '-'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Fasilitas */}
                    <Card className="mb-6">
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection('facilities')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Fasilitas ({facilities.length})
                                </CardTitle>
                                {expandedSections.facilities ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        {expandedSections.facilities && (
                            <CardContent>
                                <div className="space-y-4">
                                    {facilities.map((facility) => (
                                        <div key={facility.id} className="rounded-lg border p-4">
                                            <h4 className="mb-3 font-medium">
                                                {facility.facility_name}
                                            </h4>
                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Limit</Label>
                                                    <p className="mt-1 text-sm">{formatCurrency(facility.limit)}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Outstanding</Label>
                                                    <p className="mt-1 text-sm">{formatCurrency(facility.outstanding)}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Tunggakan Pokok</Label>
                                                    <p className="mt-1 text-sm">{formatCurrency(facility.principal_arrears)}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Tunggakan Bunga</Label>
                                                    <p className="mt-1 text-sm">{formatCurrency(facility.interest_arrears)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {facilities.length > 1 && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <h4 className="mb-3 font-medium text-blue-800">Total Semua Fasilitas</h4>
                                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-blue-600">Total Limit</Label>
                                                    <p className="mt-1 text-sm font-semibold text-blue-800">
                                                        {formatCurrency(facilitiesTotals.total_limit)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-blue-600">Total Outstanding</Label>
                                                    <p className="mt-1 text-sm font-semibold text-blue-800">
                                                        {formatCurrency(facilitiesTotals.total_outstanding)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-blue-600">Total Tunggakan Pokok</Label>
                                                    <p className="mt-1 text-sm font-semibold text-blue-800">
                                                        {formatCurrency(facilitiesTotals.total_principal_arrears)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-blue-600">Total Tunggakan Bunga</Label>
                                                    <p className="mt-1 text-sm font-semibold text-blue-800">
                                                        {formatCurrency(facilitiesTotals.total_interest_arrears)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Aspek Penilaian */}
                    <Card className="mb-6">
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection('aspects')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckIcon className="h-5 w-5" />
                                    Aspek Penilaian ({aspects.length})
                                </CardTitle>
                                {expandedSections.aspects ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        {expandedSections.aspects && (
                            <CardContent>
                                <div className="space-y-4">
                                    {aspects.length === 0 ? (
                                        <p className="text-center text-gray-500">Tidak ada aspek penilaian</p>
                                    ) : (
                                        aspects.map((aspect, index) => {
                                            // Cek apakah dropdown aspek ini terbuka
                                            const isAspectExpanded = !!expandedAspects[aspect.id];
                                            // Ambil semua question versions dari aspect version
                                            const qVersions = (aspect as any)?.aspect_version?.question_versions || [];

                                            return (
                                                <div key={aspect.id} className="rounded-lg border">
                                                    {/* Ini adalah Trigger untuk dropdown per aspek */}
                                                    <button
                                                        type="button"
                                                        className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
                                                        onClick={() => toggleAspectDetail(aspect.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-medium">
                                                                {aspect.aspect_version.name || `Aspek ${index + 1}`}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                className={`${
                                                                    aspect.classification === 0
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                } text-xs`}
                                                            >
                                                                {aspect.classification === 0 ? 'WATCHLIST' : 'SAFE'}
                                                            </Badge>
                                                            {isAspectExpanded ? (
                                                                <ChevronUpIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDownIcon className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {/* Ini adalah Konten Dropdown yang berisi Q&A */}
                                                    {isAspectExpanded && (
                                                        <div className="border-t bg-gray-50 p-4">
                                                            {qVersions.length === 0 ? (
                                                                <p className="text-sm text-gray-500">
                                                                    Tidak ada pertanyaan untuk aspek ini.
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {qVersions.map((qVersion: any) => {
                                                                        // Cari jawaban di answerMap
                                                                        const answer = answerMap.get(qVersion.id);
                                                                        const optionText =
                                                                            (answer as any)?.questionOption?.option_text ||
                                                                            (answer as any)?.question_option?.option_text ||
                                                                            'Tidak Dijawab';
                                                                        const notes = (answer as any)?.notes;

                                                                        return (
                                                                            <div key={qVersion.id} className="rounded border bg-white p-3 shadow-sm">
                                                                                <h5 className="font-medium text-sm text-gray-800">
                                                                                    {qVersion.question_text}
                                                                                </h5>
                                                                                <div className="my-2">
                                                                                    <Badge variant="secondary">{optionText}</Badge>
                                                                                </div>
                                                                                {notes && (
                                                                                    <div className="mt-2 border-t pt-2">
                                                                                        <Label className="text-xs font-medium text-gray-500">
                                                                                            Catatan:
                                                                                        </Label>
                                                                                        <p className="mt-1 text-sm whitespace-pre-wrap text-gray-700">
                                                                                            {notes}
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Ringkasan */}
                    {summary && (
                        <Card className="mb-6">
                            <CardHeader className="cursor-pointer" onClick={() => toggleSection('summary')}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangleIcon className="h-5 w-5" />
                                        Ringkasan
                                    </CardTitle>
                                    {expandedSections.summary ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </div>
                            </CardHeader>
                            {expandedSections.summary && (
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Klasifikasi Akhir</Label>
                                                <div className="mt-1">
                                                    <Badge className={`${getClassificationBg(summary.final_classification)} text-gray-800`}>
                                                        {summary.final_classification === 0
                                                            ? 'WATCHLIST'
                                                            : summary.final_classification === 1
                                                              ? 'SAFE'
                                                              : 'BELUM DITENTUKAN'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Override</Label>
                                                <p className="mt-1 text-sm">{formatBoolean(summary.is_override)}</p>
                                            </div>
                                        </div>

                                        {summary.override_reason && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Alasan Override</Label>
                                                <p className="mt-1 rounded border bg-yellow-50 p-3 text-sm">{summary.override_reason}</p>
                                            </div>
                                        )}

                                        {summary.business_notes && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Catatan Bisnis</Label>
                                                <p className="mt-1 rounded border bg-gray-50 p-3 text-sm">{summary.business_notes}</p>
                                            </div>
                                        )}

                                        {summary.reviewer_notes && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Catatan Reviewer</Label>
                                                <p className="mt-1 rounded border bg-gray-50 p-3 text-sm">{summary.reviewer_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )}

                    {/* Approval Section */}
                    {approvals && approvals.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader className="cursor-pointer" onClick={() => toggleSection('approvals')}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <ThumbsUpIcon className="h-5 w-5" />
                                        Status Persetujuan
                                    </CardTitle>
                                    {expandedSections.approvals ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                </div>
                            </CardHeader>
                            {expandedSections.approvals && (
                                <CardContent>
                                    <div className="space-y-4">
                                        {approvals.map((approval) => (
                                            <div key={approval.id} className="rounded-lg border p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-medium">{getApprovalLevelLabel(approval.level)}</h4>
                                                        {getApprovalStatusBadge(approval.status)}
                                                    </div>
                                                    {approval.reviewer && <div className="text-sm text-gray-500">oleh: {approval.reviewer.name}</div>}
                                                </div>

                                                {normalizeApprovalStatus(approval.status) === 'pending' && canUserApprove(approval) && (
                                                    <div className="mt-4 space-y-3">
                                                        <Separator />
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-medium">Alasan Penolakan (jika menolak)</Label>
                                                            <Textarea
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                placeholder="Masukkan alasan penolakan..."
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => handleApprove(approval.id)}
                                                                disabled={isProcessing}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <ThumbsUpIcon className="mr-2 h-4 w-4" />
                                                                {isProcessing ? 'Memproses...' : 'Setujui'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleReject(approval.id)}
                                                                disabled={isProcessing || !rejectionReason.trim()}
                                                                variant="destructive"
                                                            >
                                                                <ThumbsDownIcon className="mr-2 h-4 w-4" />
                                                                {isProcessing ? 'Memproses...' : 'Tolak'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                    {approval.notes && (
                        <div className="mt-3">
                            <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                            <p className="mt-1 rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{approval.notes}</p>
                        </div>
                    )}

                                                <div className="mt-2 text-xs text-gray-500">
                                                    Dibuat: {formatDate(approval.created_at)} | Diperbarui: {formatDate(approval.updated_at)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Log Audit */}
            <Card className="mb-6">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('audits')}>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5" />
                            Log Audit
                        </CardTitle>
                        {expandedSections.audits ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </div>
                </CardHeader>
                {expandedSections.audits && (
                    <CardContent>
                        {report.audits && report.audits.length > 0 ? (
                            <div className="space-y-4">
                                {report.audits.map((audit) => (
                                    <div key={audit.id} className="rounded border p-3">
                                        <div className="mb-1 flex items-center gap-2 text-xs">
                                            {audit.action === 'created' && (
                                                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">Dibuat</span>
                                            )}
                                            {audit.action === 'updated' && (
                                                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">Diperbarui</span>
                                            )}
                                            {audit.action === 'deleted' && (
                                                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-700">Dihapus</span>
                                            )}
                                            {!['created', 'updated', 'deleted'].includes(audit.action) && (
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">{audit.action}</span>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {audit.readable_message}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {formatDate(audit.created_at)}
                                            {audit.user?.name ? ` • oleh ${audit.user.name}` : ' • oleh Sistem'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">Belum ada aktivitas audit untuk laporan ini.</div>
                        )}
                    </CardContent>
                )}
            </Card>

                    {/* Semua Data (JSON) */}
                    {/* <Card className="mb-6">
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection('debug')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Semua Data (JSON)
                                </CardTitle>
                                {expandedSections.debug ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        {expandedSections.debug && (
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Report</Label>
                                        <pre className="mt-1 max-h-[500px] overflow-auto rounded bg-gray-100 p-4 text-xs">{JSON.stringify(report, null, 2)}</pre>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Template</Label>
                                        <pre className="mt-1 max-h-[500px] overflow-auto rounded bg-gray-100 p-4 text-xs">{JSON.stringify(template, null, 2)}</pre>
                                    </div>
                                    {watchlist && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Watchlist</Label>
                                            <pre className="mt-1 max-h-[500px] overflow-auto rounded bg-gray-100 p-4 text-xs">{JSON.stringify(watchlist, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card> */}
                </div>
            </div>
        </AppLayout>
    );
}
