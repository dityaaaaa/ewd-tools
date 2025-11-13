import AppLogoIcon from './app-logo-icon';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;
    const { state, isMobile } = useSidebar();
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            {state !== 'collapsed' && !isMobile && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">{name}</span>
                </div>
            )}
        </>
    );
}
