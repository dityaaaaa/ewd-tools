import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const CountdownTimer = memo(function CountdownTimer({ endDate }: { endDate: string | Date | null }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    });

    const remainingTime = useMemo(() => {
        if (!endDate) {
            return { status: 'no_period', message: 'Tidak ada periode' };
        }

        const end = new Date(endDate);
        const endTime = end.getTime();

        if (Number.isNaN(endTime)) {
            return { status: 'no_period', message: 'Tidak ada periode' };
        }

        const diff = endTime - currentTime.getTime();

        if (diff <= 0) {
            return { status: 'expired', message: 'Periode telah selesai' };
        }

        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);

        return { status: 'active', days: d, hours: h % 24, minutes: m % 60, seconds: s % 60 };
    }, [endDate, currentTime]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Countdown</CardTitle>
                <CardDescription>
                    {remainingTime.status === 'active' ? (
                        <div className="flex items-end gap-2 sm:gap-4">
                            {[
                                { label: 'Hari', value: remainingTime.days },
                                { label: 'Jam', value: remainingTime.hours },
                                { label: 'Menit', value: remainingTime.minutes },
                                { label: 'Detik', value: remainingTime.seconds },
                            ].map((t) => (
                                <div key={t.label} className="flex w-full flex-col items-center">
                                    <div className="font-mono text-3xl font-semibold md:text-3xl">{String(t.value).padStart(2, '0')}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">{t.label}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-16 items-center justify-center text-sm font-medium">{remainingTime.message ?? '-'}</div>
                    )}
                </CardDescription>
            </CardHeader>
        </Card>
    );
});

export default function Dashboard() {
    const page = usePage<{ dashboardData: any }>();
    const data = page.props.dashboardData ?? {};
    const role: string = data.role ?? 'admin';
    console.log(data);

    const statsItems = useMemo(() => {
        const borrowersByDivision = data.charts?.borrowers_by_division ?? {};
        const borrowersTotal = Object.values(borrowersByDivision).reduce((acc: number, v) => acc + (Number(v) || 0), 0);
        const s = data.stats ?? {};

        if (role === 'relationship_manager') {
            return [
                { label: 'Laporan Saya', value: Number(s.my_reports ?? 0) },
                { label: 'Debitur Saya', value: Number(s.my_borrowers ?? 0) },
                { label: 'Pending', value: Number(s.pending_reports ?? 0) },
                { label: 'Disetujui', value: Number(s.approved_reports ?? 0) },
            ];
        }

        if (role === 'risk_analyst') {
            return [
                { label: 'Menunggu Persetujuan', value: Number(s.pending_approvals ?? 0) },
                { label: 'Disetujui Bulan Ini', value: Number(s.approved_this_month ?? 0) },
                { label: 'Watchlist Divisi', value: Number(s.watchlist_items ?? 0) },
                { label: 'Action Items Divisi', value: Number(s.action_items ?? 0) },
            ];
        }

        if (role === 'kadept_bisnis') {
            const tp = s.team_performance ?? {};
            const bg = s.business_growth ?? {};
            return [
                { label: 'Menunggu Persetujuan', value: Number(s.pending_approvals ?? 0) },
                { label: 'Laporan Divisi', value: Number(s.division_reports ?? 0) },
                { label: 'Laporan Selesai Tim', value: Number(tp.reports_completed ?? 0) },
                { label: 'Debitur Baru Bulan Ini', value: Number(bg.new_borrowers_this_month ?? 0) },
            ];
        }

        if (role === 'kadept_risk') {
            const rm = s.risk_mitigation ?? {};
            return [
                { label: 'Pending Final Approvals', value: Number(s.pending_final_approvals ?? 0) },
                { label: 'Compliance Score', value: Number(s.compliance_score ?? 0) },
                { label: 'Active Mitigations', value: Number(rm.active_mitigations ?? 0) },
                { label: 'Resolved Bulan Ini', value: Number(rm.resolved_this_month ?? 0) },
            ];
        }

        if (role === 'admin') {
            return [
                { label: 'Total Laporan', value: Number(s.total_reports ?? s.reports_total ?? 0) },
                { label: 'Total Debitur', value: Number(s.total_borrowers ?? borrowersTotal) },
                { label: 'Total Watchlist', value: Number(s.watchlist_total ?? 0) },
            ];
        }

        return [
            { label: 'Total Watchlist', value: Number(s.watchlist_total ?? 0) },
            { label: 'Total Laporan', value: Number(s.reports_total ?? 0) },
            { label: 'Total Debitur', value: borrowersTotal },
        ];
    }, [role, data.stats, data.charts?.borrowers_by_division]);

    const comparisonData = useMemo(() => {
        const reports = data.charts?.reports_by_division ?? {};
        const watchlist = data.charts?.watchlist_by_division ?? {};
        const divisions = Array.from(new Set([...Object.keys(reports), ...Object.keys(watchlist)]));
        return divisions.map((name) => {
            const total = Number((reports as any)[name] ?? 0);
            const wl = Number((watchlist as any)[name] ?? 0);
            const safe = Math.max(0, total - wl);
            return { name, watch: wl, safe, total };
        });
    }, [data]);

    const formatDate = (value?: string) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const normalizeStatus = (s: number | string | undefined) => {
        if (s === undefined || s === null) return 'Tidak diketahui';
        if (typeof s === 'number') {
            switch (s) {
                case 0:
                    return 'Draf';
                case 1:
                    return 'Diajukan';
                case 2:
                    return 'Disetujui';
                case 3:
                    return 'Ditolak';
                default:
                    return 'Tidak diketahui';
            }
        }
        const v = String(s).toLowerCase();
        if (v.includes('pending')) return 'Menunggu';
        if (v.includes('approve')) return 'Disetujui';
        if (v.includes('reject')) return 'Ditolak';
        if (v.includes('submit')) return 'Diajukan';
        if (v.includes('draft')) return 'Draf';
        return v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const statusVariant = (label: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        const l = label.toLowerCase();
        if (l.includes('disetujui')) return 'default';
        if (l.includes('ditolak')) return 'destructive';
        if (l.includes('menunggu')) return 'outline';
        if (l.includes('diajukan') || l.includes('draf')) return 'secondary';
        return 'outline';
    };

    function StatCard({ label, value }: { label: string; value: number | string }) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">{label}</CardTitle>
                    <CardDescription>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-4xl font-semibold">{value}</span>
                        </div>
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const GroupedBar = memo(
        function GroupedBar({ items }: { items: { name: string; watch: number; safe: number; total?: number }[] }) {
            if (!items?.length) {
                return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Tidak ada data untuk ditampilkan</div>;
            }
            const chartConfig: ChartConfig = {
                watch: { label: 'Watchlist', color: 'var(--chart-1)' },
                safe: { label: 'Safe', color: 'var(--chart-2)' },
            };
            return (
                <div className="h-full w-full">
                    <ChartContainer config={chartConfig} className="h-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={300}>
                            <BarChart data={items} margin={{ top: 24, right: 16, left: 8, bottom: 8 }} barSize={28} barGap={8} barCategoryGap="40%">
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="watch" stackId="a" fill="var(--color-watch)" radius={[0, 0, 4, 4]} isAnimationActive={false} />
                                <Bar dataKey="safe" stackId="a" fill="var(--color-safe)" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                    <LabelList dataKey="total" position="top" offset={8} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            );
        },
        (prev, next) => prev.items === next.items,
    );

    const completeness = useMemo(() => {
        const borrowers = data.charts?.borrowers_by_division ?? {};
        const reports = data.charts?.reports_by_division ?? {};
        return Object.entries(borrowers).map(([name, b]) => {
            const totalBorrowers = Number(b as any) || 0;
            const totalReports = Number((reports as any)[name] ?? 0);
            const percent = totalBorrowers ? Math.min(100, Math.round((totalReports / totalBorrowers) * 100)) : 0;
            return { name, percent, totalBorrowers, totalReports };
        });
    }, [data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-screen max-w-3xl bg-background px-4 py-6 sm:px-6 md:py-12 lg:max-w-7xl lg:px-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <CountdownTimer endDate={data.stats.period_end_date} />
                    {statsItems.map((s, idx) => (
                        <StatCard key={idx} label={s.label} value={s.value} />
                    ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader>
                            <CardTitle>Chart Laporan</CardTitle>
                            <CardDescription>Perbandingan Klasifikasi Laporan per divisi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GroupedBar items={comparisonData} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>% Laporan</CardTitle>
                            <CardDescription>Persentase per divisi</CardDescription>
                        </CardHeader>
                        <CardContent className="h-96 overflow-y-auto">
                            <div className="space-y-3">
                                {completeness.map((d, i) => (
                                    <div key={i} className="rounded-md border p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{d.name}</span>
                                            <span className="text-sm text-muted-foreground">{d.percent}%</span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                                            <div className="h-full bg-primary" style={{ width: `${d.percent}%` }} />
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {d.totalReports} laporan / {d.totalBorrowers} debitur
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>
                            {(() => {
                                if (role === 'risk_analyst') return 'Persetujuan Pending';
                                if (role === 'kadept_bisnis') return 'Persetujuan Pending';
                                if (role === 'kadept_risk') return 'Persetujuan Pending';
                                if (role === 'relationship_manager') return 'Laporan Saya Terbaru';
                                return 'Daftar Laporan Masuk';
                            })()}
                        </CardTitle>
                        <CardDescription>Terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Debitur</TableHead>
                                        <TableHead>Divisi</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Masuk</TableHead>
                                        <TableHead>Dibuat Oleh</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                        const rows = (() => {
                                            if (role === 'risk_analyst')
                                                return (data.pending_approvals_list ?? []).map((a: any) => a?.report).filter(Boolean);
                                            if (role === 'kadept_bisnis')
                                                return (data.pending_approvals_list ?? []).map((a: any) => a?.report).filter(Boolean);
                                            if (role === 'kadept_risk')
                                                return (data.pending_approvals_list ?? []).map((a: any) => a?.report).filter(Boolean);
                                            if (role === 'relationship_manager') return data.recent_reports ?? [];
                                            return data.incoming_reports ?? [];
                                        })();
                                        return rows.map((r: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{r?.borrower?.name ?? '-'}</TableCell>
                                                <TableCell>{r?.borrower?.division?.name ?? '-'}</TableCell>
                                                <TableCell>{r?.period?.name ?? '-'}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const label = normalizeStatus(r?.status);
                                                        return <Badge variant={statusVariant(label)}>{label}</Badge>;
                                                    })()}
                                                </TableCell>
                                                <TableCell>{formatDate(r?.created_at)}</TableCell>
                                                <TableCell>{r?.creator?.name ?? '-'}</TableCell>
                                            </TableRow>
                                        ));
                                    })()}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
