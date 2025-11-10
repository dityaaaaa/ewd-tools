import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import routeAspect from '@/routes/aspects'; // routing untuk show aspect
import templates from '@/routes/templates';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, ClipboardListIcon, EyeIcon } from 'lucide-react';

type Template = {
    id: number;
    latest_template_version: TemplateVersion;
    created_at: string;
    updated_at: string;
};

type TemplateVersion = {
    id: number;
    name: string;
    version_number: number;
    description: string | null;
    aspects: Aspect[];
    visibility_rules: VisibilityRule[];
};

type Aspect = {
    id: number;
    code: string;
    latest_aspect_version: AspectVersion;
    pivot: {
        weight: number;
    };
    created_at: string;
    updated_at: string;
};

type AspectVersion = {
    id: number;
    name: string;
    version_number: string;
    description?: string;
};

type VisibilityRule = {
    description: string;
    source_type: string;
    source_field: string;
    operator: string;
    value: string;
};

interface Props {
    template: Template;
}

const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
        '=': 'Sama dengan',
        '!=': 'Tidak sama dengan',
        '>': 'Lebih besar dari',
        '<': 'Lebih kecil dari',
        '>=': 'Lebih besar atau sama dengan',
        '<=': 'Lebih kecil atau sama dengan',
        in: 'Termasuk dalam',
        not_in: 'Tidak termasuk dalam',
    };
    return labels[operator] || operator;
};

export default function TemplateShow({ template }: Props) {
    console.log(template);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Template',
            href: templates.index().url,
        },
        {
            title: `Template ${template.latest_template_version.name}`,
            href: templates.show(template.id).url,
        },
    ];

    const {
        latest_template_version: { name, version_number, description, aspects, visibility_rules },
    } = template;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${name}`} />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold md:text-2xl">
                                    <span>{name}</span>
                                    <Badge variant="secondary">V{version_number}</Badge>
                                </CardTitle>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description || 'Tidak ada deskripsi.'}</p>
                            </div>
                            <Link href={templates.index().url}>
                                <Button variant={'outline'} size={'sm'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <ClipboardListIcon className="h-4 w-4" />
                                    Daftar Aspek ({aspects.length})
                                </h3>
                                {aspects && aspects.length > 0 ? (
                                    <div className="grid gap-6">
                                        {aspects.map((aspect, index) => (
                                            <Card key={aspect.id} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-lg font-semibold">
                                                            ({index + 1}) {aspect.code} - {aspect.latest_aspect_version?.name || 'Tidak ada nama'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={'secondary'}>Bobot: {aspect.pivot.weight}</Badge>
                                                        <Link href={routeAspect.show(aspect.id).url}>
                                                            <Button variant={'outline'} size={'icon'}>
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p></p>
                                )}

                                {visibility_rules && visibility_rules.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <EyeIcon className="h-4 w-4" />
                                            Aturan Visibilitas ({visibility_rules.length})
                                        </h3>
                                        <div className="mt-4 space-y-2">
                                            {visibility_rules.map((rule, ruleIndex) => (
                                                <div key={ruleIndex} className="rounded-md border bg-gray-50 p-3 text-sm dark:bg-gray-400">
                                                    <p className="font-semibold">Aturan {ruleIndex + 1}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {rule.description || 'Tidak ada deskripsi.'}
                                                    </p>
                                                    <p className="mt-1">
                                                        Jika `<strong>{rule.source_field}</strong>` `
                                                        <strong>{getOperatorLabel(rule.operator)}</strong>` `<strong>"{rule.value}"</strong>`
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
