import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import reportRoutes from '@/routes/reports';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangleIcon, CheckIcon, ChevronDownIcon, HomeIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface Report {
    id: number;
    borrower: Borrower;
    creator: User;
    summary: Summary;
    period: Period;
    aspects: Aspect[];
    facilities: BorrowerFacility[];
}

interface User {
    id: number;
    name: string;
    email: string;
    division_id: number;
    created_at: string;
    updated_at: string;
}

interface Borrower {
    id: number;
    name: string;
    division_id: number;
    division: Division;
    detail: BorrowerDetail;
    facilities: BorrowerFacility[];
    created_at: string;
    updated_at: string;
}

interface Division {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
}

interface BorrowerDetail {
    id: number;
    borrower_id: number;
    borrower_group: string;
    borrower_business: string;
    business_field: string;
    collectibility: number;
    economic_sector: string;
    purpose: number;
    restructuring: boolean;
    created_at: string;
    updated_at: string;
}

interface BorrowerFacility {
    id: number;
    facility_name: string;
    limit: number;
    outstanding: number;
    interest_rate: number;
    principal_arrears: number;
    interest_arrears: number;
    pdo_days: number;
    maturity_date: string;
}

interface Aspect {
    id: number;
    aspect_version: AspectVersion;
    classification: number;
    total_score: number;
    created_at: string;
    updated_at: string;
}

interface AspectVersion {
    id: number;
    aspect: {
        code: string;
    };
    name: string;
    version_number: number;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface Summary {
    id: number;
    business_notes?: string;
    final_classification: number;
    indicative_collectibility: number;
    is_override: boolean;
    override_reason?: string;
    override_by?: string;
    report_id: number;
    reviewer_notes?: string;
    created_at: string;
    updated_at: string;
}

interface Period {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    report_id: number;
    created_at: string;
    updated_at: string;
}

interface SummaryProps {
    reportData: Report;
}

const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return '-';
    return value ? 'Ya' : 'Tidak';
};

const getCollectibilityInfo = (coll?: number) => {
    switch (coll) {
        case 1:
            return { label: '1 - Lancar', color: 'text-green-800', bg: 'bg-green-100' };
        case 2:
            return { label: '2 - DPK', color: 'text-yellow-800', bg: 'bg-yellow-100' };
        case 3:
            return { label: '3 - Kurang Lancar', color: 'text-orange-800', bg: 'bg-orange-100' };
        case 4:
            return { label: '4 - Diragukan', color: 'text-red-800', bg: 'bg-red-100' };
        case 5:
            return { label: '5 - Macet', color: 'text-red-800', bg: 'bg-red-200' };
        default:
            return { label: 'N/A', color: 'text-gray-800', bg: 'bg-gray-100' };
    }
};

const getClassificationLabel = (value?: number): string => {
    switch (value) {
        case 1:
            return 'SAFE';
        case 0:
            return 'WATCHLIST';
        default:
            return 'UNKNOWN';
    }
};

const getClassificationColor = (value?: number | string) => {
    if (value === 0 || value === 'WATCHLIST') return 'text-red-800';
    return 'text-green-800';
};

const getClassificationBg = (value?: number | string) => {
    if (value === 0 || value === 'WATCHLIST') return 'bg-red-100';
    return 'bg-green-100';
};

const getClassificationIcon = (value?: number | string) => {
    if (value === 0 || value === 'WATCHLIST') return AlertTriangleIcon;
    return CheckIcon;
};

const getPurposeLabel = (value?: number): string => {
    switch (value) {
        case 1:
            return 'KIE';
        case 2:
            return 'KMKE';
        case 3:
            return 'KIE & KMKE';
        default:
            return '-';
    }
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

export default function Summary({ reportData }: SummaryProps) {
    console.log(reportData);
    const { borrower, creator, period, summary, aspects, facilities, facilitiesTotals } = useMemo(() => {
        const data = reportData;
        const borrower = data.borrower;
        const creator = data.creator;
        const summary = data.summary;
        const period = data.period;
        const aspects = data.aspects || [];
        const facilities = borrower.facilities || [];

        const facilitiesTotals = facilities.reduce(
            (acc, facility) => {
                acc.total_limit += Number(facility.limit) || 0;
                acc.total_outstanding += Number(facility.outstanding) || 0;
                acc.total_principal_arrears += Number(facility.principal_arrears) || 0;
                acc.total_interest_arrears += Number(facility.interest_arrears) || 0;
                return acc;
            },
            { total_limit: 0, total_outstanding: 0, total_principal_arrears: 0, total_interest_arrears: 0 },
        );
        return { borrower, creator, period, summary, aspects, facilities, facilitiesTotals };
    }, [reportData]);

    const [expandedSections, setExpandedSections] = useState({ details: true, facilities: true, aspects: true, summary: true });

    const toggleSection = useCallback((section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const [summaryForm, setSummaryForm] = useState({
        businessNotes: summary?.business_notes || '',
        reviewerNotes: summary?.reviewer_notes || '',
        isOverride: summary?.is_override || false,
        indicativeCollectibility: summary?.indicative_collectibility || 0,
        overrideReason: summary?.override_reason || '',
    });

    const normalizeClassification = (c?: number): string => (c === 0 ? 'WATCHLIST' : 'SAFE');

    const systemClassification = useMemo(() => normalizeClassification(summary?.final_classification), [summary]);

    const finalClassification = useMemo(() => {
        if (summaryForm.isOverride) return systemClassification === 'SAFE' ? 'WATCHLIST' : 'SAFE';
        return systemClassification;
    }, [summaryForm.isOverride, systemClassification]);

    const handleFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setSummaryForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    const handleCheckboxChange = (checked: boolean) => setSummaryForm((prev) => ({ ...prev, isOverride: checked }));

    const [isSaving, setIsSaving] = useState(false);

    const openMonitoringNote = () => {
        window.open(`/watchlist?reportId=${reportData.id}`, '_self');
    };

    const goToHome = () => {
        router.visit(reportRoutes.index().url);
    };

    const handleSave = useCallback(async () => {
        if (summaryForm.isOverride && !summaryForm.overrideReason.trim()) {
            toast.error('Alasan override wajib diisi.');
            return;
        }
        setIsSaving(true);
        try {
            await axios.put(`/summary/${reportData.id}`, { ...summaryForm, finalClassification });
            toast.success('Data ringkasan berhasil disimpan');
            if (finalClassification === 'WATCHLIST') {
                toast.info('Debitur masuk kategori WATCHLIST. Silakan lengkapi NAW.');
                // router.visit(watchlistNote(reportData.id).url);
            } else {
                router.visit(dashboard().url);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setIsSaving(false);
        }
    }, [summaryForm, reportData.id, finalClassification]);
    return (
        <>
            <Head title={`SAW - ${borrower.name}`} />
            <div className="min-h-screen">
                <div className="bg-[#2E3192] p-4 text-white shadow-md dark:bg-[#1A1D68] dark:text-gray-200">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-2xl font-bold">Summary Early Warning</Label>
                        <div className="flex items-center space-x-4">
                            <div>
                                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={goToHome}>
                                    <HomeIcon className="mr-2 h-4 w-4" />
                                    Home
                                </Button>
                            </div>
                            <div>
                                <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={openMonitoringNote}>
                                    📝 Buka NAW
                                </Button>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-100">Dibuat oleh:</p>
                                <p className="font-semibold">{creator.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <div
                            onClick={() => toggleSection('details')}
                            className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4"
                        >
                            <Label className="text-xl font-semibold text-gray-800">Informasi Debitur & Laporan</Label>
                            <div className={`transform transition-transform ${!expandedSections.details ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                        {expandedSections.details && (
                            <div className="grid grid-cols-1 gap-6 px-6 py-4 text-sm lg:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama Debitur</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Periode</Label>
                                    <div className="text-lg font-semibold text-gray-900">{period.name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Divisi</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.division.name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Grup Debitur</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.detail?.borrower_group || 'N/A'}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tujuan Kredit</Label>
                                    <div className="text-lg font-semibold text-gray-900">{getPurposeLabel(borrower.detail.purpose)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Sektor Ekonomi</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.detail.economic_sector}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Bidang Usaha</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.detail.business_field}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Jenis Usaha</Label>
                                    <div className="text-lg font-semibold text-gray-900">{borrower.detail.borrower_business}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Kolektabilitas</Label>
                                    <div>
                                        <Badge
                                            className={`text-md ${getCollectibilityInfo(borrower.detail.collectibility)?.bg} ${getCollectibilityInfo(borrower.detail.collectibility)?.color}`}
                                        >
                                            {getCollectibilityInfo(borrower.detail.collectibility)?.label}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Restrukturisasi</Label>
                                    <div>
                                        <Badge
                                            className={`text-md ${borrower.detail.restructuring ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                        >
                                            {formatBoolean(borrower.detail.restructuring)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <div
                            onClick={() => toggleSection('facilities')}
                            className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4"
                        >
                            <Label className="text-xl font-semibold text-gray-800">Fasilitas Debitur</Label>
                            <div className={`transform transition-transform ${!expandedSections.facilities ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                        {expandedSections.facilities && (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead>Fasilitas</TableHead>
                                            <TableHead className="text-right">Limit</TableHead>
                                            <TableHead className="text-right">Outstanding</TableHead>
                                            <TableHead className="text-center">Suku Bunga</TableHead>
                                            <TableHead className="text-right">Tunggakan Pokok</TableHead>
                                            <TableHead className="text-right">Tunggakan Bunga</TableHead>
                                            <TableHead className="text-center">PDO</TableHead>
                                            <TableHead className="text-center">Jatuh Tempo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facilities.map((facility, index) => (
                                            <TableRow key={facility.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <TableCell>{facility.facility_name}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(facility.limit)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(facility.outstanding)}</TableCell>
                                                <TableCell className="text-center">{facility.interest_rate}%</TableCell>
                                                <TableCell className="text-right">{formatCurrency(facility.principal_arrears)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(facility.interest_arrears)}</TableCell>
                                                <TableCell className="text-center">{facility.pdo_days} hari</TableCell>
                                                <TableCell className="text-center">{formatDate(facility.maturity_date)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="border-t-2 bg-gray-100 font-bold">
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell className="text-right">{formatCurrency(facilitiesTotals.total_limit)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(facilitiesTotals.total_outstanding)}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-right">{formatCurrency(facilitiesTotals.total_principal_arrears)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(facilitiesTotals.total_interest_arrears)}</TableCell>
                                            <TableCell colSpan={2}></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <div
                            onClick={() => toggleSection('aspects')}
                            className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4"
                        >
                            <Label className="text-xl font-semibold text-gray-800">Klasifikasi Aspek</Label>
                            <div className={`transform transition-transform ${!expandedSections.aspects ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                        {expandedSections.aspects && (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama Aspek</TableHead>
                                            <TableHead className="text-right">Klasifikasi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {aspects.map((aspect, index) => {
                                            const Icon = getClassificationIcon(aspect.classification);
                                            const label = getClassificationLabel(aspect.classification);
                                            return (
                                                <TableRow key={aspect.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <TableCell>{aspect.aspect_version.aspect.code}</TableCell>
                                                    <TableCell>{aspect.aspect_version.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant={'outline'}
                                                            className={`border-2 font-bold ${getClassificationColor(aspect.classification)} ${getClassificationBg(aspect.classification)}`}
                                                        >
                                                            {Icon && <Icon className="h-4 w-4" />}
                                                            {label}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <div
                            onClick={() => toggleSection('summary')}
                            className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-6 py-4"
                        >
                            <Label className="text-xl font-semibold text-gray-800">Ringkasan Debitur</Label>
                            <div className={`transform transition-transform ${!expandedSections.summary ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            </div>
                        </div>
                        {expandedSections.summary && (
                            <div className="px-6 py-6">
                                <div className="mb-6">
                                    <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 lg:grid-cols-3">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Klasifikasi Sistem</Label>
                                            <div>
                                                <Badge
                                                    className={`px-3 py-1 text-sm ${getClassificationColor(systemClassification)} ${getClassificationBg(systemClassification)}`}
                                                >
                                                    {systemClassification}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Indikatif Kolektabilitas</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    className={`px-3 py-1 text-sm ${getCollectibilityInfo(summary.indicative_collectibility).color} ${getCollectibilityInfo(summary.indicative_collectibility).bg}`}
                                                >
                                                    {getCollectibilityInfo(summary.indicative_collectibility).label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={`mb-6 rounded-lg border p-4 ${
                                        summaryForm.isOverride
                                            ? finalClassification === 'WATCHLIST'
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-green-300 bg-green-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <h3 className="mb-3 font-semibold text-gray-800">Klasifikasi Final</h3>
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            className={`px-4 py-2 text-lg ${getClassificationColor(finalClassification)} ${getClassificationBg(finalClassification)}`}
                                        >
                                            {finalClassification}
                                        </Badge>
                                        {summaryForm.isOverride && (
                                            <div
                                                className={`text-sm font-semibold ${finalClassification === 'WATCHLIST' ? 'text-red-700' : 'text-green-700'}`}
                                            >
                                                Override: {systemClassification} → {finalClassification}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="override" checked={summaryForm.isOverride} onCheckedChange={handleCheckboxChange} />
                                            <Label htmlFor="override">Override Hasil Sistem</Label>
                                        </div>
                                        {summaryForm.isOverride && (
                                            <div className="mt-4 space-y-4 border-t pt-4">
                                                <div>
                                                    Klasifikasi akan berubah dari <strong>{systemClassification}</strong> menjadi{' '}
                                                    <strong>{finalClassification}</strong>
                                                </div>
                                                <div>
                                                    <Label htmlFor="overrideReason">Alasan Override (Wajib Diisi)</Label>
                                                    <Textarea
                                                        id="overrideReason"
                                                        value={summaryForm.overrideReason}
                                                        onChange={handleFormChange}
                                                        placeholder="Jelaskan alasan melakukan override..."
                                                        rows={3}
                                                        className="mt-1"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Catatan Bisnis</Label>
                                        <Textarea
                                            id="businessNotes"
                                            value={summaryForm.businessNotes}
                                            onChange={handleFormChange}
                                            placeholder="Catatan bisnis terkait debitur..."
                                            rows={4}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Catatan Reviewer</Label>
                                        <Textarea
                                            id="reviewerNotes"
                                            value={summaryForm.reviewerNotes}
                                            onChange={handleFormChange}
                                            placeholder="Catatan reviewer"
                                            rows={4}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Simpan Ringkasan'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
