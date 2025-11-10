import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import aspects from '@/routes/aspects';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, CheckCircle2, EyeIcon } from 'lucide-react';

type Aspect = {
    id: number;
    code: string;
    latest_aspect_version: AspectVersion;
    created_at: string;
    updated_at: string;
};

type AspectVersion = {
    id: number;
    name: string;
    version_number: string;
    description?: string;
    question_versions: QuestionVersion[];
};

type QuestionVersion = {
    id: number;
    question_text: string;
    weight: number;
    is_mandatory: boolean;
    question_options: Option[];
    visibility_rules: VisibilityRule[];
};

type Option = {
    id: number;
    option_text: string;
    score: number;
};

type VisibilityRule = {
    description: string;
    source_type: string;
    source_field: string;
    operator: string;
    value: string;
};

interface Props {
    aspect: Aspect;
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

export default function AspectShow({ aspect }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Aspek',
            href: aspects.index().url,
        },
        {
            title: `Aspek ${aspect.latest_aspect_version.name}`,
            href: aspects.show(aspect.id).url,
        },
    ];

    const {
        latest_aspect_version: { name, version_number, description, question_versions },
    } = aspect;

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
                            <Link href={aspects.index().url}>
                                <Button variant={'outline'} size={'sm'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <h2 className="text-xl font-semibold">Daftar Pertanyaan ({question_versions.length})</h2>
                                {question_versions && question_versions.length > 0 ? (
                                    <div className="grid gap-6">
                                        {question_versions.map((question, index) => (
                                            <Card key={question.id} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-lg font-semibold">
                                                            ({index + 1}) {question.question_text}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={'secondary'}>Bobot: {question.weight}</Badge>
                                                        {question.is_mandatory && <Badge variant={'destructive'}>Wajib</Badge>}
                                                    </div>
                                                </div>

                                                <div className="mt-4 border-t pt-4">
                                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Opsi Jawaban ({question.question_options.length})
                                                    </h3>
                                                    <ul className="mt-2 ml-4 list-inside list-disc space-y-1 text-sm">
                                                        {question.question_options.map((option) => (
                                                            <li key={option.id}>
                                                                {option.option_text} <Badge variant={'outline'}>(Skor: {option.score})</Badge>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {question.visibility_rules.length > 0 && (
                                                    <div className="mt-4 border-t pt-4">
                                                        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            <EyeIcon className="h-4 w-4" />
                                                            Aturan Visibilitas ({question.visibility_rules.length})
                                                        </h3>
                                                        <div className="mt-2 space-y-2">
                                                            {question.visibility_rules.map((rule, ruleIndex) => (
                                                                <div
                                                                    key={ruleIndex}
                                                                    className="rounded-md border bg-gray-50 p-3 text-sm dark:bg-gray-800"
                                                                >
                                                                    <p className="font-semibold">Aturan {ruleIndex + 1}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {rule.description || 'Tidak ada deskripsi.'}
                                                                    </p>
                                                                    <p className="mt-1">
                                                                        Jika `<strong>{rule.source_field}</strong>` `
                                                                        <strong>{getOperatorLabel(rule.operator)}</strong>` `
                                                                        <strong>"{rule.value}"</strong>`
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Tidak ada pertanyaan yang terlampir pada aspek ini.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
