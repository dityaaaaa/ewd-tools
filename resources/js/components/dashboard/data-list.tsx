import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { LucideIcon } from 'lucide-react';

interface DataListProps {
    title: string;
    icon: LucideIcon;
    iconColor: string;
    data: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    maxItems?: number;
    emptyMessage?: string;
}

export function DataList({ 
    title, 
    icon: Icon, 
    iconColor, 
    data, 
    renderItem, 
    maxItems = 5,
    emptyMessage = 'No data available'
}: DataListProps) {
    const displayData = data.slice(0, maxItems);
    
    return (
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-blue-200/50 dark:border-blue-800/50 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5 p-6">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${iconColor}`} />
                {title}
            </h3>
            
            {displayData.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {displayData.map(renderItem)}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {emptyMessage}
                    </p>
                </div>
            )}
            
            <PlaceholderPattern className={`absolute inset-0 size-full stroke-${iconColor.split('-')[1]}-500/10 dark:stroke-${iconColor.split('-')[1]}-400/10`} />
        </div>
    );
}