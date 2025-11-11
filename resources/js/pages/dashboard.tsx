import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import approvals from '@/routes/approvals';
import borrowers from '@/routes/borrowers';
import periods from '@/routes/periods';
import forms from '@/routes/forms';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { BarChart3, CheckIcon, FileText, TrendingUp, Users } from 'lucide-react';

// Komponen chart ringan berbasis SVG agar tanpa dependensi tambahan
function Sparkline({
    values = [],
    width = 280,
    height = 80,
    color = '#2563eb',
}: { values: number[]; width?: number; height?: number; color?: string }) {
    const count = values.length;
    const denom = Math.max(1, count - 1);
    const max = Math.max(1, ...values);
    const points = values
        .map((v, i) => {
            const x = (i / denom) * width;
            const y = height - (Math.max(0, v) / max) * height;
            return `${x},${y}`;
        })
        .join(' ');

    if (count <= 1) {
        return (
            <div className="text-xs text-muted-foreground">
                Data tren belum tersedia
            </div>
        );
    }

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-primary">
            <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        </svg>
    );
}

function HorizontalBars({
    data,
    barClass = 'bg-emerald-600',
}: {
    data: { label: string; value: number }[];
    barClass?: string;
}) {
    if (!Array.isArray(data) || data.length === 0) {
        return <div className="text-xs text-muted-foreground">Distribusi belum tersedia</div>;
    }
    const max = Math.max(1, ...data.map((d) => Number(d.value) || 0));
    return (
        <div className="space-y-3">
            {data.map((d) => {
                const val = Number(d.value) || 0;
                const pct = Math.round((val / max) * 100);
                return (
                    <div key={d.label} className="flex items-center gap-3">
                        <span className="w-36 text-sm text-muted-foreground">{d.label}</span>
                        <div className="relative h-2 flex-1 rounded bg-muted">
                            <div className={`absolute inset-y-0 left-0 rounded ${barClass}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-xs tabular-nums text-foreground text-right">{val}</span>
                    </div>
                );
            })}
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const page = usePage<SharedData & { dashboardData?: any }>();
    const data = page.props.dashboardData ?? {};
    const title = data.title ?? 'Dashboard';
    const description = data.description ?? 'Pantau metrik dan aktivitas secara real-time';
    const stats: Record<string, number | string> = data.stats ?? {};
    const actionable: Record<string, number> = data.actionable_items ?? {};
    const quickActions: Record<string, boolean> = data.quick_actions ?? {};
    const charts: Record<string, any> = data.charts ?? {};

    // Deteksi role pengguna (selaras dengan sidebar & halaman lain)
    const roles = new Set([
        ...(page.props.auth.user.roles?.map((r) => r.name) ?? []),
        page.props.auth.user.role?.name,
    ].filter(Boolean) as string[]);
    const isAdmin = roles.has('admin');
    const isRM = roles.has('relationship_manager');
    const isRiskAnalyst = roles.has('risk_analyst');
    const isKadeptBisnis = roles.has('kadept_bisnis');
    const isKadeptRisk = roles.has('kadept_risk');

    // Normalisasi data charts dari backend (tanpa dummy fallback)
    const monthlyTrendRaw: any[] = Array.isArray(charts.monthly_report_trend)
        ? charts.monthly_report_trend
        : Array.isArray(charts.approval_trend)
        ? charts.approval_trend
        : [];
    const monthlySeries: number[] = monthlyTrendRaw.map((it: any) => Number(it?.count) || 0);

    const classificationRaw = charts.risk_classification_distribution ?? {};
    const classificationData: { label: string; value: number }[] = Object.keys(classificationRaw).length > 0
        ? Object.entries(classificationRaw).map(([k, v]) => {
            const key = String(k).toLowerCase();
            const label = key === '1' || key === 'safe' ? 'Aman'
                : key === '0' || key === 'watchlist' ? 'Watchlist'
                : 'Lainnya';
            return { label, value: Number(v) || 0 };
        })
        : [];

    const statusRaw = charts.reports_by_status ?? {};
    const statusData: { label: string; value: number }[] = Object.keys(statusRaw).length > 0
        ? Object.entries(statusRaw).map(([k, v]) => ({ label: String(k), value: Number(v) || 0 }))
        : [];

    const pipelineRaw = charts.approval_pipeline ?? {};
    const pipelineData = [
        { label: 'Menunggu', value: Number(pipelineRaw.pending ?? 0) },
        { label: 'Disetujui', value: Number(pipelineRaw.approved ?? 0) },
        { label: 'Ditolak', value: Number(pipelineRaw.rejected ?? 0) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="min-h-screen bg-background">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                    {/* Header Section */}
                    <div className="mb-8 space-y-4 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg shadow-blue-500/25">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {title}
                        </h1>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Stats Cards: nilai inti tanpa sparkline dummy */}
                    <div className="mb-6 grid auto-rows-min gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {Object.entries(stats).map(([label, value], idx) => (
                            <Card key={label} className="relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                                            {idx % 3 === 0 && <Users className="h-5 w-5 text-white" />}
                                            {idx % 3 === 1 && <TrendingUp className="h-5 w-5 text-white" />}
                                            {idx % 3 === 2 && <FileText className="h-5 w-5 text-white" />}
                                        </div>
                                        <h3 className="font-semibold text-foreground">
                                            {label.replaceAll('_', ' ')}
                                        </h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-3xl font-bold text-foreground tabular-nums">
                                        {String(value)}
                                    </p>
                                </CardContent>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-500/10 dark:stroke-emerald-400/10" />
                            </Card>
                        ))}
                    </div>

                    {/* Insights: chart ringan, berbeda sesuai role (metrics dari backend, fallback aman) */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" /> Tren Laporan Bulanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {monthlySeries.length > 1 ? (
                                    <div className="flex items-end justify-between">
                                        <Sparkline values={monthlySeries} />
                                        <Badge variant="secondary" className="ml-4">
                                            Terakhir: {monthlySeries.at(-1)}
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Data tren belum tersedia</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" /> {classificationData.length > 0 ? 'Distribusi Klasifikasi' : 'Status Laporan'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {classificationData.length > 0 ? (
                                    <HorizontalBars data={classificationData} barClass="bg-indigo-600" />
                                ) : statusData.length > 0 ? (
                                    <HorizontalBars data={statusData} barClass="bg-indigo-600" />
                                ) : (
                                    <div className="text-sm text-muted-foreground">Distribusi belum tersedia</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {(isAdmin || isRiskAnalyst || isKadeptBisnis || isKadeptRisk) && (
                        <Card className="mt-6">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckIcon className="h-5 w-5 text-primary" /> Pipeline Persetujuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {pipelineData.some((d) => d.value > 0) ? (
                                    <HorizontalBars data={pipelineData} barClass="bg-emerald-600" />
                                ) : (
                                    <div className="text-sm text-muted-foreground">Data pipeline belum tersedia</div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Badge role ringkas agar pengguna paham konteks */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {isAdmin && <Badge variant="outline">Admin: Akses penuh</Badge>}
                        {isRM && <Badge variant="secondary">RM: Fokus debitur & laporan</Badge>}
                        {isRiskAnalyst && <Badge variant="secondary">Risk Analyst: Review & Watchlist</Badge>}
                        {isKadeptBisnis && <Badge variant="secondary">KADEPT Bisnis: Approval level 3</Badge>}
                        {isKadeptRisk && <Badge variant="secondary">KADEPT Risk: Approval level 4</Badge>}
                    </div>

                    {/* Actionable Items & Quick Actions */}
                    {(Object.keys(actionable).length > 0 || Object.keys(quickActions).length > 0) && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Actionable Items */}
                            {Object.keys(actionable).length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground">Prioritas</h2>
                                    <ul className="space-y-2 text-foreground">
                                        {Object.entries(actionable).map(([k, v]) => (
                                            <li key={k} className="flex items-center justify-between">
                                                <span>{k.replaceAll('_', ' ')}</span>
                                                <span className="rounded bg-secondary px-2 py-0.5 text-sm font-semibold text-secondary-foreground">
                                                    {v}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Quick Actions */}
                            {Object.keys(quickActions).length > 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground">Aksi Cepat</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.create_report && (
                                            <Link href={forms.index().url} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
                                                <FileText className="h-4 w-4" /> Buat Laporan
                                            </Link>
                                        )}
                                        {quickActions.view_borrowers && (
                                            <Link href={borrowers.index().url} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-900">
                                                <Users className="h-4 w-4" /> Lihat Debitur
                                            </Link>
                                        )}
                                        {quickActions.check_periods && (
                                            <Link href={periods.index().url} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
                                                <TrendingUp className="h-4 w-4" /> Periode Aktif
                                            </Link>
                                        )}
                                        {quickActions.review_reports && (
                                            <Link href={approvals.index().url} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
                                                <FileText className="h-4 w-4" /> Review Laporan
                                            </Link>
                                        )}
                                        {quickActions.approve_reports && (
                                            <Link href={approvals.index().url} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">
                                                <CheckIcon className="h-4 w-4" /> Approve Laporan
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content Placeholder */}
                    <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
                        <div className="space-y-4 text-center">
                            <h2 className="text-xl font-semibold text-foreground">Analitik Utama</h2>
                            <p className="text-muted-foreground">Grafik dan tabel spesifik akan ditampilkan sesuai role.</p>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-slate-500/10 dark:stroke-slate-400/10" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
