import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from 'recharts';

interface ComparisonChartProps {
    title: string;
    description: string;
    period1Data: Record<string, number>;
    period2Data: Record<string, number>;
    period1Label: string;
    period2Label: string;
}

export function ComparisonChart({ title, description, period1Data, period2Data, period1Label, period2Label }: ComparisonChartProps) {
    const chartData = useMemo(() => {
        const divisions = Array.from(new Set([...Object.keys(period1Data), ...Object.keys(period2Data)]));

        return divisions.map((division) => ({
            division,
            period1: period1Data[division] || 0,
            period2: period2Data[division] || 0,
        }));
    }, [period1Data, period2Data]);

    const chartConfig: ChartConfig = {
        period1: {
            label: period1Label,
            color: 'hsl(217, 91%, 60%)', // Blue
        },
        period2: {
            label: period2Label,
            color: 'hsl(142, 76%, 36%)', // Green
        },
    };

    if (!chartData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Tidak ada data untuk ditampilkan</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis 
                                dataKey="division" 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis 
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar 
                                dataKey="period1" 
                                fill="var(--color-period1)" 
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                            />
                            <Bar 
                                dataKey="period2" 
                                fill="var(--color-period2)" 
                                radius={[4, 4, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
