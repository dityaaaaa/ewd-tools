import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import approvals from '@/routes/approvals';
import aspects from '@/routes/aspects';
import audits from '@/routes/audits';
import borrowers from '@/routes/borrowers';
import divisions from '@/routes/divisions';
import forms from '@/routes/forms';
import periods from '@/routes/periods';
import reports from '@/routes/reports';
import templates from '@/routes/templates';
import users from '@/routes/users';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BuildingIcon,
    CheckCircleIcon,
    ClipboardListIcon,
    ClockIcon,
    FileTextIcon,
    FolderIcon,
    LayoutGrid,
    PaperclipIcon,
    PlusCircleIcon,
    UserIcon,
} from 'lucide-react';
import { Button } from './ui/button';

function buildNavItemsByRole(page: SharedData): NavItem[] {
    const roles = new Set([...(page.auth.user.roles?.map((r) => r.name) ?? []), page.auth.user.role?.name].filter(Boolean) as string[]);

    const isAdmin = roles.has('admin');

    const items: NavItem[] = [{ title: 'Dashboard', href: dashboard().url, icon: LayoutGrid }];

    if (isAdmin) {
        items.push({ title: 'User', href: users.index().url, icon: UserIcon });
        items.push({ title: 'Divisi', href: divisions.index().url, icon: BuildingIcon });
        items.push({ title: 'Template', href: templates.index().url, icon: FileTextIcon });
        items.push({ title: 'Aspek', href: aspects.index().url, icon: ClipboardListIcon });
        items.push({ title: 'Periode', href: periods.index().url, icon: ClockIcon });
        items.push({ title: 'Audit Logs', href: audits.index().url, icon: ClipboardListIcon });
    }

    items.push({ title: 'Debitur', href: borrowers.index().url, icon: FolderIcon });
    items.push({ title: 'Laporan', href: reports.index().url, icon: PaperclipIcon });
    items.push({ title: 'Persetujuan', href: approvals.index().url, icon: CheckCircleIcon });

    return items;
}

export function AppSidebar() {
    const page = usePage<SharedData>();
    const mainNavItems = buildNavItemsByRole(page.props);
    const roles = new Set([...(page.props.auth.user.roles?.map((r) => r.name) ?? []), page.props.auth.user.role?.name].filter(Boolean) as string[]);
    const isRMOnly = roles.has('relationship_manager');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader></SidebarHeader>

            <SidebarContent>
                {isRMOnly && (
                    <div className="px-2 py-1">
                        <Link href={forms.index().url}>
                            <Button className="w-full" size={'sm'}>
                                <PlusCircleIcon className="h-5 w-5" />
                                <span>Buat Laporan</span>
                            </Button>
                        </Link>
                    </div>
                )}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
