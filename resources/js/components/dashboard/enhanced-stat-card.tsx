import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStatCardProps {
    label: string;
    value: number | string;
    previousValue?: number;
    type?: 'neutral' | 'positive-up' | 'negative-up'; // positive-up: naik = baik (safe), negative-up: naik = buruk (watchlist)
    showComparison?: boolean;
}

export function EnhancedStatCard({
    label,
    value,
    previousValue,
    type = 'neutral',
    showComparison = true,
}: EnhancedStatCardProps) {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const numPrevValue = previousValue ?? 0;
    
    const change = numPrevValue > 0 ? numValue - numPrevValue : 0;
    const changePercent = numPrevValue > 0 ? ((change / numPrevValue) * 100) : 0;
    
    const hasIncrease = change > 0;
    const hasDecrease = change < 0;
    const noChange = change === 0;
    
    // Determine if the change is good or bad based on type
    const isGoodChange = type === 'neutral' 
        ? null 
        : type === 'positive-up' 
            ? hasIncrease  // For safe: increase is good
            : hasDecrease; // For watchlist: decrease is good
    
    const isBadChange = type === 'neutral'
        ? null
        : type === 'positive-up'
            ? hasDecrease  // For safe: decrease is bad
            : hasIncrease; // For watchlist: increase is bad
    
    // Color classes based on change type
    const changeColorClass = isGoodChange
        ? 'text-green-600 bg-green-50'
        : isBadChange
            ? 'text-red-600 bg-red-50'
            : 'text-gray-600 bg-gray-50';
    
    const iconColorClass = isGoodChange
        ? 'text-green-600'
        : isBadChange
            ? 'text-red-600'
            : 'text-gray-600';
    
    const borderColorClass = isGoodChange
        ? 'border-l-green-500'
        : isBadChange
            ? 'border-l-red-500'
            : 'border-l-gray-300';

    return (
        <Card className={cn('border-l-4', borderColorClass)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{numValue}</div>
                    {showComparison && numPrevValue > 0 && !noChange && (
                        <div className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            changeColorClass
                        )}>
                            {hasIncrease && <ArrowUpIcon className={cn('h-3 w-3', iconColorClass)} />}
                            {hasDecrease && <ArrowDownIcon className={cn('h-3 w-3', iconColorClass)} />}
                            {noChange && <MinusIcon className={cn('h-3 w-3', iconColorClass)} />}
                            <span>
                                {Math.abs(changePercent).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
                {showComparison && numPrevValue > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        {hasIncrease && (
                            <>
                                <span className="font-medium">+{change}</span> dari periode sebelumnya ({numPrevValue})
                            </>
                        )}
                        {hasDecrease && (
                            <>
                                <span className="font-medium">{change}</span> dari periode sebelumnya ({numPrevValue})
                            </>
                        )}
                        {noChange && (
                            <>Tidak ada perubahan dari periode sebelumnya</>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
