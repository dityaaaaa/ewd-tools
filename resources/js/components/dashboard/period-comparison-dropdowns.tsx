import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { dashboard } from '@/routes';

interface PeriodOption {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: number;
}

interface PeriodComparisonDropdownsProps {
    availablePeriods: PeriodOption[];
    selectedPeriod1?: number | null;
    selectedPeriod2?: number | null;
}

export function PeriodComparisonDropdowns({ availablePeriods, selectedPeriod1, selectedPeriod2 }: PeriodComparisonDropdownsProps) {
    const [period1, setPeriod1] = useState<string>(selectedPeriod1?.toString() || '');
    const [period2, setPeriod2] = useState<string>(selectedPeriod2?.toString() || '');
    const [isLoading, setIsLoading] = useState(false);

    // Update state when props change
    useEffect(() => {
        if (selectedPeriod1) setPeriod1(selectedPeriod1.toString());
        if (selectedPeriod2) setPeriod2(selectedPeriod2.toString());
    }, [selectedPeriod1, selectedPeriod2]);

    const handlePeriod1Change = (value: string) => {
        if (value === period2) {
            toast.error('Periode yang dipilih tidak boleh sama');
            return;
        }
        setPeriod1(value);
        
        if (value && period2) {
            setIsLoading(true);
            router.get(
                dashboard().url,
                { period1: value, period2: period2 },
                { 
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false)
                }
            );
        }
    };

    const handlePeriod2Change = (value: string) => {
        if (value === period1) {
            toast.error('Periode yang dipilih tidak boleh sama');
            return;
        }
        setPeriod2(value);
        
        if (period1 && value) {
            setIsLoading(true);
            router.get(
                dashboard().url,
                { period1: period1, period2: value },
                { 
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false)
                }
            );
        }
    };

    return (
        <div className="space-y-4">
            {isLoading && (
                <div className="text-sm text-muted-foreground">Memuat data perbandingan...</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="period1">Periode 1</Label>
                    <Select value={period1} onValueChange={handlePeriod1Change} disabled={isLoading}>
                        <SelectTrigger id="period1">
                            <SelectValue placeholder="Pilih periode pertama" />
                        </SelectTrigger>
                        <SelectContent>
                            {availablePeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id.toString()}>
                                    {period.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="period2">Periode 2</Label>
                    <Select value={period2} onValueChange={handlePeriod2Change} disabled={isLoading}>
                        <SelectTrigger id="period2">
                            <SelectValue placeholder="Pilih periode kedua" />
                        </SelectTrigger>
                        <SelectContent>
                            {availablePeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id.toString()}>
                                    {period.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
