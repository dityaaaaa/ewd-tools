import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import aspects from '@/routes/aspects';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeftIcon, CircleMinusIcon, HelpCircle, Info, PlusCircle, Trash2Icon } from 'lucide-react';
import React, { useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

type Question = {
    question_text: string;
    weight: number;
    is_mandatory: boolean;
    options: Option[];
    visibility_rules: VisibilityRule[];
};

type Option = {
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Divisi',
        href: aspects.index().url,
    },
    {
        title: 'Tambah Aspek',
        href: aspects.create().url,
    },
];

export default function AspectCreate() {
    const defaultValues = {
        code: '',
        name: '',
        description: '',
        questions: [
            {
                question_text: '',
                weight: 100,
                is_mandatory: false,
                options: [
                    {
                        option_text: '',
                        score: 0,
                    },
                ],
                visibility_rules: [],
            },
        ] as Question[],
    };

    const { data, setData, post, reset, processing, errors, isDirty } = useForm(defaultValues);

    const totalWeight = useMemo(() => data.questions.reduce((sum, q) => sum + Number(q.weight), 0), [data.questions]);

    const isWeightValid = Math.abs(totalWeight - 100) <= 0.01;
    const weightStatus = totalWeight < 100 ? 'kurang' : totalWeight > 100 ? 'lebih' : 'sesuai';

    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const sourceTypeOptions = [
        { value: 'borrower_detail', label: 'Informasi Debitur' },
        { value: 'borrower_facility', label: 'Fasilitas Debitur' },
        { value: 'answer', label: 'Jawaban' },
    ];

    const sourceFieldsMap: Record<string, string[]> = {
        borrower_detail: [
            'borrower_id',
            'borrower_group',
            'purpose',
            'economic_sector',
            'business_field',
            'borrower_business',
            'collectibility',
            'restructuring',
        ],
        borrower_facility: [
            'borrower_id',
            'facility_name',
            'facility_type',
            'limit',
            'outstanding',
            'interest_rate',
            'principal_arrears',
            'interest_arrears',
            'pdo_days',
            'maturity_date',
        ],
        answer: [],
    };

    const addQuestions = () => {
        setData('questions', [
            ...data.questions,
            {
                question_text: '',
                weight: 1,
                is_mandatory: false,
                options: [{ option_text: '', score: 0 }],
                visibility_rules: [],
            },
        ]);

        setTimeout(() => {
            const lastIndex = data.questions.length;
            questionRefs.current[lastIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            const input = questionRefs.current[lastIndex]?.querySelector('input');
            input?.focus();
        }, 100);
    };

    const removeQuestions = (index: number) => {
        if (data.questions.length > 1) {
            setData(
                'questions',
                data.questions.filter((_, i) => i !== index),
            );
        }
    };

    const addQuestionOptions = (qIndex: number) => {
        const updated = [...data.questions];
        updated[qIndex].options.push({ option_text: '', score: 0 });
        setData('questions', updated);
    };

    const removeQuestionOptions = (qIndex: number, oIndex: number) => {
        const updated = [...data.questions];
        if (updated[qIndex].options.length > 1) {
            updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
            setData('questions', updated);
        }
    };

    const addVisibilityRule = (qIndex: number) => {
        const updated = [...data.questions];
        updated[qIndex].visibility_rules.push({
            description: '',
            source_type: '',
            source_field: '',
            operator: '',
            value: '',
        });
        setData('questions', updated);
    };

    const removeVisibilityRule = (qIndex: number, rIndex: number) => {
        const updated = [...data.questions];
        updated[qIndex].visibility_rules = updated[qIndex].visibility_rules.filter((_, i) => i !== rIndex);
        setData('questions', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isWeightValid) {
            toast.error('Total bobot pertanyaan harus 100%');
            return;
        }

        console.log(data);
        post(aspects.store().url, {
            onSuccess: () => {
                toast.success('Aspek berhasil ditambahkan.');
                router.visit(aspects.index().url, {
                    preserveScroll: true,
                });
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(error as string);
                });
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Aspek" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold md:text-2xl">Tambah Aspek</CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Buat aspek penilaian baru dengan pertanyaan dan aturan visibilitas
                                </p>
                            </div>
                            <Link href={aspects.index().url}>
                                <Button variant={'outline'}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Button>
                            </Link>
                        </CardHeader>
                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-lg">
                                            <Info className="mr-2 h-5 w-5" />
                                            Informasi Dasar
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label htmlFor="code">Kode</Label>
                                            <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} maxLength={50} />
                                            <InputError message={errors.code} />
                                        </div>
                                        <div>
                                            <Label htmlFor="name">Nama</Label>
                                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={255} />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Deskripsi</Label>
                                            <Input
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                            <InputError message={errors.description} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle className="flex items-center text-lg">
                                            <HelpCircle className="mr-2 h-5 w-5" />
                                            Jumlah Pertanyaan: {data.questions.length}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {!isWeightValid && (
                                            <Alert variant="destructive" className="mb-6">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Total bobot pertanyaan {totalWeight.toFixed(1)}% dari 100%. Sisa {''}
                                                    {Math.abs(100 - totalWeight).toFixed(1)}% {weightStatus === 'kurang' ? 'lagi' : 'berlebih'}.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <Badge variant={isWeightValid ? 'default' : 'destructive'} className="mb-4 text-xs">
                                            Total Bobot: {totalWeight.toFixed(1)}%
                                        </Badge>

                                        {data.questions.map((question, qIndex) => (
                                            <div
                                                key={qIndex}
                                                ref={(el) => {
                                                    questionRefs.current[qIndex] = el;
                                                }}
                                                className="mb-4 space-y-4 rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-semibold">Pertanyaan {qIndex + 1}</Label>
                                                    {data.questions.length > 1 && (
                                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestions(qIndex)}>
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Pertanyaan</Label>
                                                    <Input
                                                        value={question.question_text}
                                                        onChange={(e) => {
                                                            const updated = [...data.questions];
                                                            updated[qIndex].question_text = e.target.value;
                                                            setData('questions', updated);
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Label>Bobot (%)</Label>
                                                        <Input
                                                            type="number"
                                                            value={question.weight}
                                                            onChange={(e) => {
                                                                const updated = [...data.questions];
                                                                updated[qIndex].weight = Number(e.target.value);
                                                                setData('questions', updated);
                                                            }}
                                                            max={100}
                                                            min={1}
                                                        />
                                                    </div>
                                                    <div className="mt-6 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={question.is_mandatory}
                                                            onChange={(e) => {
                                                                const updated = [...data.questions];
                                                                updated[qIndex].is_mandatory = e.target.checked;
                                                                setData('questions', updated);
                                                            }}
                                                        />
                                                        <Label>Mandatory</Label>
                                                    </div>
                                                </div>

                                                {/* Opsi Jawaban */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Opsi Jawaban</Label>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => addQuestionOptions(qIndex)}>
                                                            <PlusCircle className="mr-1 h-4 w-4" />
                                                            Tambah Opsi
                                                        </Button>
                                                    </div>

                                                    {question.options.map((option, oIndex) => (
                                                        <div
                                                            key={oIndex}
                                                            className="flex items-center gap-2 rounded-lg border bg-gray-50 p-2 dark:bg-gray-800"
                                                        >
                                                            <Input
                                                                className="flex-1"
                                                                placeholder="Masukkan jawaban pertanyaan"
                                                                value={option.option_text}
                                                                onChange={(e) => {
                                                                    const updated = [...data.questions];
                                                                    updated[qIndex].options[oIndex].option_text = e.target.value;
                                                                    setData('questions', updated);
                                                                }}
                                                                maxLength={255}
                                                            />
                                                            <Input
                                                                type="number"
                                                                className="w-24"
                                                                placeholder="Masukkan skor jawaban"
                                                                value={option.score}
                                                                onChange={(e) => {
                                                                    const updated = [...data.questions];
                                                                    updated[qIndex].options[oIndex].score = Number(e.target.value);
                                                                    setData('questions', updated);
                                                                }}
                                                                max={100}
                                                            />
                                                            {question.options.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => removeQuestionOptions(qIndex, oIndex)}
                                                                >
                                                                    <CircleMinusIcon className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Visibility Rules */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Visibility Rules</Label>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => addVisibilityRule(qIndex)}>
                                                            <PlusCircle className="mr-1 h-4 w-4" />
                                                            Tambah Rule
                                                        </Button>
                                                    </div>

                                                    {question.visibility_rules.length > 0 &&
                                                        question.visibility_rules.map((rule, rIndex) => (
                                                            <div
                                                                key={rIndex}
                                                                className="space-y-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-sm font-medium">Rule {rIndex + 1}</Label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeVisibilityRule(qIndex, rIndex)}
                                                                    >
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                <div>
                                                                    <Label>Deskripsi</Label>
                                                                    <Input
                                                                        placeholder="Contoh: tampil jika jawaban A dipilih"
                                                                        value={rule.description}
                                                                        onChange={(e) => {
                                                                            const updated = [...data.questions];
                                                                            updated[qIndex].visibility_rules[rIndex].description = e.target.value;
                                                                            setData('questions', updated);
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label>Source Type</Label>
                                                                        <Select
                                                                            value={rule.source_type}
                                                                            onValueChange={(value) => {
                                                                                const updated = [...data.questions];
                                                                                updated[qIndex].visibility_rules[rIndex].source_type = value;
                                                                                updated[qIndex].visibility_rules[rIndex].source_field = '';
                                                                                setData('questions', updated);
                                                                            }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Pilih Source Type" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {sourceTypeOptions.map((opt) => (
                                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                                        {opt.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <Label>Source Field</Label>
                                                                        <Select
                                                                            value={rule.source_field}
                                                                            onValueChange={(value) => {
                                                                                const updated = [...data.questions];
                                                                                updated[qIndex].visibility_rules[rIndex].source_field = value;
                                                                                setData('questions', updated);
                                                                            }}
                                                                            disabled={!rule.source_type}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Pilih Source Field" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {sourceFieldsMap[rule.source_type]?.map((field) => (
                                                                                    <SelectItem key={field} value={field}>
                                                                                        {field}
                                                                                    </SelectItem>
                                                                                ))}
                                                                                {rule.source_type === 'answer' &&
                                                                                    data.questions.map((otherQuestion, otherQIndex) => {
                                                                                        if (qIndex === otherQIndex) {
                                                                                            return null;
                                                                                        }
                                                                                        return (
                                                                                            <SelectItem
                                                                                                key={`q-opt-${otherQIndex}`}
                                                                                                value={`question_${otherQIndex + 1}`}
                                                                                            >
                                                                                                Pertanyaan {otherQIndex + 1}:{' '}
                                                                                                {otherQuestion.question_text || '(Belum diisi)'}
                                                                                            </SelectItem>
                                                                                        );
                                                                                    })}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label>Operator</Label>
                                                                        <Input
                                                                            placeholder="=, !=, >, <"
                                                                            value={rule.operator}
                                                                            onChange={(e) => {
                                                                                const updated = [...data.questions];
                                                                                updated[qIndex].visibility_rules[rIndex].operator = e.target.value;
                                                                                setData('questions', updated);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label>Value</Label>
                                                                        <Input
                                                                            placeholder="nilai yang dibandingkan"
                                                                            value={rule.value}
                                                                            onChange={(e) => {
                                                                                const updated = [...data.questions];
                                                                                updated[qIndex].visibility_rules[rIndex].value = e.target.value;
                                                                                setData('questions', updated);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-6 flex justify-end">
                                            <Button type="button" onClick={addQuestions} variant={'outline'} size={'sm'}>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Tambah Pertanyaan
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>

                            <CardFooter className="flex items-center justify-end gap-3 px-6 pb-6">
                                <Link href={aspects.index().url}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={!isDirty || !isWeightValid || processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
