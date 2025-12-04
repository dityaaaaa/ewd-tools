import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonStatsCardProps {
    label: string;
    period1Value: number;
    period2Value: number;
    changePercentage: number;
    changeDirection: 'up' | 'down' | 'neutral';
    period1Label?: string;
    period2Label?: string;
}

export function ComparisonStatsCard({
    label,
    period1Value,
    period2Value,
    changePercentage,
    changeDirection,
    period1Label = 'Periode 1',
    period2Label = 'Periode 2',
}: ComparisonStatsCardProps) {
    const getChangeStyles = () => {
        if (changeDirection === 'up') {
            return {
                textColor: 'text-emerald-600 dark:text-emerald-400',
                bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
                borderColor: 'border-emerald-200 dark:border-emerald-800',
                icon: <TrendingUp className="h-5 w-5" />,
                label: 'Naik',
            };
        }
        if (changeDirection === 'down') {
            return {
                textColor: 'text-rose-600 dark:text-rose-400',
                bgColor: 'bg-rose-50 dark:bg-rose-950/30',
                borderColor: 'border-rose-200 dark:border-rose-800',
                icon: <TrendingDown className="h-5 w-5" />,
                label: 'Turun',
            };
        }
        return {
            textColor: 'text-slate-600 dark:text-slate-400',
            bgColor: 'bg-slate-50 dark:bg-slate-950/30',
            borderColor: 'border-slate-200 dark:border-slate-800',
            icon: <Minus className="h-5 w-5" />,
            label: 'Tidak berubah',
        };
    };

    const styles = getChangeStyles();

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{label}</CardTitle>
                <CardDescription className="text-xs">Perbandingan antar periode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">{period1Label}</div>
                        <div className="text-2xl font-bold tracking-tight">{period1Value.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">{period2Label}</div>
                        <div className="text-2xl font-bold tracking-tight">{period2Value.toLocaleString('id-ID')}</div>
                    </div>
                </div>
                
                <div className={`flex items-center justify-between rounded-lg border p-3 ${styles.bgColor} ${styles.borderColor}`}>
                    <div className={`flex items-center gap-2 ${styles.textColor}`}>
                        {styles.icon}
                        <div className="flex flex-col">
                            <span className="text-lg font-bold">{Math.abs(changePercentage).toFixed(2)}%</span>
                            <span className="text-xs font-medium">{styles.label}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Selisih</div>
                        <div className={`text-sm font-semibold ${styles.textColor}`}>
                            {period2Value - period1Value > 0 ? '+' : ''}{(period2Value - period1Value).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
