import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface QuickActionProps {
    title: string;
    href: string;
    description?: string;
}

export function QuickAction({ title, href, description = 'Click to proceed' }: QuickActionProps) {
    return (
        <Link
            href={href}
            className="p-4 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {title.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}