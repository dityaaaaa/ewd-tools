import { Clock } from 'lucide-react';

interface ActionableItemProps {
    title: string;
    value: string | number;
    onClick?: () => void;
}

export function ActionableItem({ title, value, onClick }: ActionableItemProps) {
    return (
        <div 
            className={`p-4 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-orange-200/50 dark:border-orange-800/50 shadow-lg ${
                onClick ? 'cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                        {title.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
            </div>
        </div>
    );
}