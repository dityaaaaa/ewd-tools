import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3Icon, ClockIcon, SearchIcon, ShieldAlertIcon, TrendingUp, UsersIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const page = usePage<{ dashboardData: any }>();
    const data = page.props.dashboardData ?? {};
    const role: string = data.role ?? 'default';

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const remainingTime = useMemo(() => {
        const endDateStr = data.stats?.period_end_date;
        if (!endDateStr && typeof data.stats?.period_days_left !== 'number') return { status: 'no_period', message: 'Tidak ada periode' };
        const end = endDateStr ? new Date(endDateStr) : new Date(currentTime.getTime() + (data.stats?.period_days_left ?? 0) * 24 * 60 * 60 * 1000);
        const diff = end.getTime() - currentTime.getTime();
        if (diff <= 0) return { status: 'expired', message: 'Periode telah selesai' };
        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        return { status: 'active', days: d, hours: h % 24, minutes: m % 60, seconds: s % 60 };
    }, [data.stats?.period_end_date, data.stats?.period_days_left, currentTime]);

    const otherStats = useMemo(() => {
        const borrowersTotal = Object.values(data.charts?.borrowers_by_division ?? {}).reduce((a: number, b: any) => a + Number(b ?? 0), 0);
        return [
            { label: 'Watchlist Keseluruhan', value: data.stats?.watchlist_total ?? 0, icon: ShieldAlertIcon, percent: 100, showPercent: true },
            { label: 'Laporan Keseluruhan', value: data.stats?.reports_total ?? 0, icon: BarChart3Icon, percent: 100, showPercent: true },
            { label: 'Debitur Keseluruhan', value: borrowersTotal, icon: UsersIcon, percent: 100, showPercent: true },
        ];
    }, [data]);

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

    const divisionSummary = useMemo(() => {
        if (role === 'admin') return data.charts?.watchlist_by_division ?? data.charts?.reports_by_division ?? {};
        if (role === 'kadept_bisnis' || role === 'kadept_risk') return data.team_overview ?? [];
        return {};
    }, [role, data]);

    const tableRows = useMemo(() => {
        if (role === 'risk_analyst') return data.pending_approvals_list ?? [];
        if (role === 'relationship_manager') return data.recent_reports ?? [];
        if (role === 'admin') return data.recent_activities ?? [];
        return [];
    }, [role, data]);

    function StatCard({ icon: Icon, label, value, percent = 100, showPercent = true }: { icon: any; label: string; value: number | string; percent?: number; showPercent?: boolean }) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                    </CardTitle>
                    <CardDescription>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-2xl font-semibold">{value}</span>
                            {showPercent && (
                                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{Math.min(100, percent)}%</span>
                            )}
                        </div>
                        {showPercent && (
                            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                                <div className="h-full bg-primary" style={{ width: `${Math.min(100, percent)}%` }} />
                            </div>
                        )}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const GroupedBar = memo(function GroupedBar({ items }: { items: { name: string; watch: number; safe: number }[] }) {
        if (!items?.length) {
            return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Tidak ada data untuk ditampilkan</div>;
        }
        const chartConfig: ChartConfig = {
            watch: { label: 'Watchlist', color: 'var(--chart-1)' },
            safe: { label: 'Aman', color: 'var(--chart-2)' },
        };
        return (
            <div className="h-64 w-full">
                <ChartContainer config={chartConfig} className="h-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={300}>
                        <BarChart data={items} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="watch" stackId="a" fill="var(--color-watch)" radius={[0, 0, 4, 4]} isAnimationActive={false} />
                            <Bar dataKey="safe" stackId="a" fill="var(--color-safe)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    }, (prev, next) => prev.items === next.items);

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
                <div className="flex items-center justify-between px-2 sm:px-0">
                    <h1 className="text-xl font-semibold">Panel Manajemen</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Input placeholder="Cari" className="pl-9" />
                            <SearchIcon className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.reload({ only: ['dashboardData'] })}>
                            Segarkan
                        </Button>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4" />
                                Sisa Periode
                            </CardTitle>
                            <CardDescription>
                                {remainingTime.status === 'active' ? (
                                    <div className="mt-2 flex items-end gap-4">
                                        {[
                                            { label: 'Hari', value: remainingTime.days },
                                            { label: 'Jam', value: remainingTime.hours },
                                            { label: 'Menit', value: remainingTime.minutes },
                                            { label: 'Detik', value: remainingTime.seconds },
                                        ].map((t) => (
                                            <div key={t.label} className="flex flex-col items-center">
                                                <div className="font-mono text-2xl font-semibold md:text-3xl">{t.value}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{t.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-2 text-sm">{(remainingTime as any).message ?? '-'}</div>
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    {otherStats.map((s, idx) => (
                        <StatCard key={idx} icon={s.icon} label={s.label} value={s.value} percent={s.percent} showPercent={s.showPercent} />
                    ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader>
                            <CardTitle>Komparasi Per Divisi</CardTitle>
                            <CardDescription>Watchlist vs Aman</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GroupedBar items={comparisonData} />
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 leading-none font-medium">
                                Tren positif bulan ini <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="leading-none text-muted-foreground">Ringkasan komparatif per divisi</div>
                        </CardFooter>
                    </Card>

                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Kelengkapan</CardTitle>
                            <CardDescription>Persentase per divisi</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80 overflow-y-auto">
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
                        <CardTitle>Daftar Laporan Masuk</CardTitle>
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
                                    {(data.incoming_reports ?? []).map((r: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell>{r?.borrower?.name ?? '-'}</TableCell>
                                            <TableCell>{r?.borrower?.division?.name ?? '-'}</TableCell>
                                            <TableCell>{r?.period?.name ?? '-'}</TableCell>
                                            <TableCell>{r?.status ?? '-'}</TableCell>
                                            <TableCell>{r?.created_at ?? '-'}</TableCell>
                                            <TableCell>{r?.creator?.name ?? '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
