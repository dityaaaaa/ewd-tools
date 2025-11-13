import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3Icon, CheckCircleIcon, ClockIcon, ListChecksIcon, SearchIcon, ShieldAlertIcon, UsersIcon } from 'lucide-react';
import { useMemo } from 'react';

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

    const topStats = useMemo(() => {
        if (role === 'admin') {
            return [
                { label: 'Terkirim', value: data.stats?.sent ?? 0, icon: BarChart3Icon, percent: 78 },
                { label: 'Menunggu Review', value: data.stats?.waiting_review ?? 0, icon: ClockIcon, percent: 60 },
                { label: 'Direview', value: data.stats?.reviewed ?? 0, icon: CheckCircleIcon, percent: 75 },
                { label: 'Tervalidasi', value: data.stats?.validated ?? 0, icon: CheckCircleIcon, percent: 92 },
            ];
        }
        if (role === 'risk_analyst') {
            return [
                { label: 'Menunggu Persetujuan', value: data.stats?.pending_approvals ?? 0, icon: ClockIcon, percent: 60 },
                { label: 'Disetujui Bulan Ini', value: data.stats?.approved_this_month ?? 0, icon: CheckCircleIcon, percent: 75 },
                { label: 'Watchlist', value: data.stats?.watchlist_items ?? 0, icon: ShieldAlertIcon, percent: 30 },
                { label: 'Tugas Aksi', value: data.stats?.action_items ?? 0, icon: ListChecksIcon, percent: 80 },
            ];
        }
        if (role === 'relationship_manager') {
            return [
                { label: 'Laporan Saya', value: data.stats?.my_reports ?? 0, icon: BarChart3Icon, percent: 70 },
                { label: 'Nasabah Saya', value: data.stats?.my_borrowers ?? 0, icon: UsersIcon, percent: 50 },
                { label: 'Tertunda', value: data.stats?.pending_reports ?? 0, icon: ClockIcon, percent: 40 },
                { label: 'Disetujui', value: data.stats?.approved_reports ?? 0, icon: CheckCircleIcon, percent: 80 },
            ];
        }
        if (role === 'kadept_bisnis') {
            return [
                { label: 'Persetujuan Tertunda', value: data.stats?.pending_approvals ?? 0, icon: ClockIcon, percent: 60 },
                { label: 'Laporan Divisi', value: data.stats?.division_reports ?? 0, icon: BarChart3Icon, percent: 70 },
                { label: 'Kinerja Tim', value: data.stats?.team_performance?.reports_completed ?? 0, icon: UsersIcon, percent: 80 },
                { label: 'Pertumbuhan Bisnis', value: data.stats?.business_growth?.new_borrowers_this_month ?? 0, icon: ListChecksIcon, percent: 30 },
            ];
        }
        if (role === 'kadept_risk') {
            return [
                { label: 'Persetujuan Final', value: data.stats?.pending_final_approvals ?? 0, icon: ClockIcon, percent: 50 },
                { label: 'Portofolio Risiko', value: data.stats?.risk_portfolio?.total_exposure ?? 0, icon: ShieldAlertIcon, percent: 80 },
                { label: 'Skor Kepatuhan', value: data.stats?.compliance_score ?? 0, icon: CheckCircleIcon, percent: 92 },
                { label: 'Mitigasi', value: data.stats?.risk_mitigation?.active_mitigations ?? 0, icon: ListChecksIcon, percent: 60 },
            ];
        }
        return [
            { label: 'Laporan', value: data.stats?.total_reports ?? 0, icon: BarChart3Icon, percent: 70 },
            { label: 'Nasabah', value: data.stats?.total_borrowers ?? 0, icon: UsersIcon, percent: 40 },
        ];
    }, [role, data]);

    const chartSeries = useMemo(() => {
        if (role === 'admin') return data.charts?.monthly_report_trend ?? [];
        if (role === 'risk_analyst') return data.charts?.approval_trend ?? [];
        if (role === 'relationship_manager') return data.charts?.my_reports_status ?? [];
        return [];
    }, [role, data]);

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

    function SimpleBar({ items }: { items: { x: string; y: number }[] }) {
        const max = Math.max(1, ...items.map((i) => i.y ?? 0));
        return (
            <div className="h-40 w-full">
                <div className="grid h-full w-full grid-cols-12 items-end gap-2">
                    {items.map((i, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="w-full rounded-sm bg-primary/80" style={{ height: `${(i.y / max) * 90}%` }} />
                            <span className="mt-1 text-xs text-muted-foreground">{i.x}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const normalizedBarItems = useMemo(() => {
        if (Array.isArray(chartSeries)) {
            if (chartSeries.length && chartSeries[0]?.period && chartSeries[0]?.count !== undefined) {
                return chartSeries.map((d: any) => ({ x: d.period, y: Number(d.count) || 0 }));
            }
            return Object.entries(chartSeries).map(([k, v]) => ({ x: String(k), y: Number(v as any) || 0 }));
        }
        return [];
    }, [chartSeries]);

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
                    {topStats.map((s, idx) => (
                        <Card key={idx} className="">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <s.icon className="h-4 w-4" />
                                    {s.label}
                                </CardTitle>
                                <CardDescription>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-2xl font-semibold">{s.value}</span>
                                        <span className="text-xs text-muted-foreground">{s.percent}%</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, s.percent)}%` }} />
                                    </div>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-8">
                        <CardHeader>
                            <CardTitle>Evolusi</CardTitle>
                            <CardDescription>Tahun Ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SimpleBar items={normalizedBarItems} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Departemen</CardTitle>
                            <CardDescription>Ringkasan per divisi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Array.isArray(divisionSummary)
                                    ? divisionSummary.map((d: any, i: number) => (
                                          <div key={i} className="rounded-md border p-3">
                                              <div className="flex items-center justify-between">
                                                  <span className="font-medium">{d.role ?? d.name ?? 'Peran'}</span>
                                                  <span className="text-sm text-muted-foreground">{d.count ?? 0}</span>
                                              </div>
                                              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                                                  <div
                                                      className="h-full bg-primary"
                                                      style={{ width: `${Math.min(100, ((d.count ?? 0) / (topStats[0]?.value || 1)) * 100)}%` }}
                                                  />
                                              </div>
                                          </div>
                                      ))
                                    : Object.entries(divisionSummary).map(([name, count], i) => (
                                          <div key={i} className="rounded-md border p-3">
                                              <div className="flex items-center justify-between">
                                                  <span className="font-medium">{name}</span>
                                                  <span className="text-sm text-muted-foreground">{Number(count) || 0}</span>
                                              </div>
                                              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
                                                  <div
                                                      className="h-full bg-primary"
                                                      style={{ width: `${Math.min(100, ((Number(count) || 0) / (topStats[0]?.value || 1)) * 100)}%` }}
                                                  />
                                              </div>
                                          </div>
                                      ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Klien</CardTitle>
                        <CardDescription>Item terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Perusahaan</TableHead>
                                        <TableHead>Departemen</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tableRows.map((r: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell>{r?.report?.borrower?.name ?? r?.borrower?.name ?? r?.description ?? '-'}</TableCell>
                                            <TableCell>{r?.report?.borrower?.division?.name ?? r?.borrower?.division?.name ?? '-'}</TableCell>
                                            <TableCell>{r?.report?.period?.name ?? r?.period?.name ?? '-'}</TableCell>
                                            <TableCell>{r?.report?.status ?? r?.status ?? '-'}</TableCell>
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
