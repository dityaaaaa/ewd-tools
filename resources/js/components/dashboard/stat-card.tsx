import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
    subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, colorClass, subtitle }: StatCardProps) {
    return (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-blue-200/50 bg-white/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/70 dark:shadow-blue-500/5">
            <div className="flex h-full items-center justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <div className={`rounded-lg bg-gradient-to-br p-2 ${colorClass}`}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-700 capitalize dark:text-slate-300">{title}</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            </div>
            <PlaceholderPattern
                className={`absolute inset-0 size-full stroke-${colorClass.split('-')[1]}-500/10 dark:stroke-${colorClass.split('-')[1]}-400/10`}
            />
        </div>
    );
}
