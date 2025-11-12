import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
import AppLogo from './app-logo';
import { Button } from './ui/button';

function buildNavItemsByRole(page: SharedData): NavItem[] {
    const roles = new Set([...(page.auth.user.roles?.map((r) => r.name) ?? []), page.auth.user.role?.name].filter(Boolean) as string[]);

    const isAdmin = roles.has('admin');
    const isRM = roles.has('relationship_manager');
    const isRiskAnalyst = roles.has('risk_analyst');
    const isKadeptBisnis = roles.has('kadept_bisnis');
    const isKadeptRisk = roles.has('kadept_risk');

    const items: NavItem[] = [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];

    // Management menus: admin only
    if (isAdmin) {
        items.push({ title: 'User', href: users.index(), icon: UserIcon });
        items.push({ title: 'Divisi', href: divisions.index(), icon: BuildingIcon });
        items.push({ title: 'Template', href: templates.index(), icon: FileTextIcon });
        items.push({ title: 'Aspek', href: aspects.index(), icon: ClipboardListIcon });
        items.push({ title: 'Periode', href: periods.index(), icon: ClockIcon });
        items.push({ title: 'Audit Logs', href: audits.index(), icon: ClipboardListIcon });
    }

    // Operational menus
    if (isAdmin || isRM) {
        items.push({ title: 'Debitur', href: borrowers.index(), icon: FolderIcon });
    }

    if (isAdmin || isRM || isRiskAnalyst) {
        items.push({ title: 'Laporan', href: reports.index(), icon: PaperclipIcon });
    }

    if (isAdmin || isRiskAnalyst || isKadeptBisnis || isKadeptRisk) {
        items.push({ title: 'Persetujuan', href: approvals.index(), icon: CheckCircleIcon });
    }

    return items;
}

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const mainNavItems = buildNavItemsByRole(page.props);
    const roles = new Set([...(page.props.auth.user.roles?.map((r) => r.name) ?? []), page.props.auth.user.role?.name].filter(Boolean) as string[]);
    const isAdminOrRM = roles.has('admin') || roles.has('relationship_manager');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdminOrRM && (
                    <div className="px-2 py-1">
                        <Link href={forms.index().url}>
                            <Button className="w-full" size={'sm'}>
                                <PlusCircleIcon className="h-5 w-5" />
                                <span>Tambah Report Baru</span>
                            </Button>
                        </Link>
                    </div>
                )}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
