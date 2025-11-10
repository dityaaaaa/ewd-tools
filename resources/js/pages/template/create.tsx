import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import templates from '@/routes/templates';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, Info, PlusCircle, Trash2Icon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

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
    aspect_versions: Aspect[];
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
    aspects: Aspect[];
}

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
        title: 'Tambah Template',
        href: templates.create().url,
    },
];

const sourceTypeOptions = [
    { value: 'borrower_detail', label: 'Detail Peminjam' },
    { value: 'borrower_facility', label: 'Fasilitas Peminjam' },
    { value: 'answer', label: 'Jawaban' },
];

const operatorOptions = [
    { value: '=', label: 'Sama dengan (=)' },
    { value: '!=', label: 'Tidak sama dengan (!=)' },
    { value: '>', label: 'Lebih besar dari (>)' },
    { value: '<', label: 'Lebih kecil dari (<)' },
    { value: '>=', label: 'Lebih besar atau sama dengan (>=)' },
    { value: '<=', label: 'Lebih kecil atau sama dengan (<=)' },
    { value: 'in', label: 'Termasuk dalam (in)' },
    { value: 'not_in', label: 'Tidak termasuk dalam (not in)' },
];

const borrowerDetailFields = [
    { value: 'borrower_group', label: 'Grup Peminjam' },
    { value: 'purpose', label: 'Tujuan' },
    { value: 'economic_sector', label: 'Sektor Ekonomi' },
    { value: 'business_field', label: 'Bidang Usaha' },
    { value: 'collectibility', label: 'Kolektibilitas' },
    { value: 'restructuring', label: 'Restrukturisasi' },
];

const borrowerFacilityFields = [
    { value: 'facility_name', label: 'Nama Fasilitas' },
    { value: 'limit', label: 'Limit' },
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'interest_rate', label: 'Suku Bunga' },
    { value: 'principal_arrears', label: 'Tunggakan Pokok' },
    { value: 'interest_arrears', label: 'Tunggakan Bunga' },
    { value: 'pdo_days', label: 'Hari PDO' },
];

export default function TemplateCreate({ aspects }: Props) {
    const [selectedAspectIds, setSelectedAspectIds] = useState<number[]>([]);

    const defaultValues = {
        name: '',
        description: '',
        selected_aspects: [] as {
            id: number;
            weight: number;
        }[],
        visibility_rules: [] as VisibilityRule[],
    };
    const { data, setData, post, processing, errors } = useForm(defaultValues);

    useEffect(() => {
        setData(
            'selected_aspects',
            selectedAspectIds
                .map((id) => {
                    const existingAspects = data.selected_aspects.find((a) => a.id === id);
                    return existingAspects || { id, weight: 0 };
                })
                .filter((aspect) => selectedAspectIds.includes(aspect.id)),
        );
    }, [selectedAspectIds, setData]);

    const totalWeight = useMemo(() => {
        return data.selected_aspects.reduce((sum, aspect) => sum + Number(aspect.weight || 0), 0);
    }, [data.selected_aspects]);

    const isWeightValid = useMemo(() => {
        if (data.selected_aspects.length === 0) return false;
        return Math.abs(totalWeight - 100) < 0.1;
    }, [totalWeight, data.selected_aspects]);

    const handleCheckboxChange = (aspectId: number, isChecked: boolean) => {
        setSelectedAspectIds((prevIds) => (isChecked ? [...prevIds, aspectId] : prevIds.filter((id) => id !== aspectId)));
    };

    const updateAspectWeight = (aspectId: number, weight: number) => {
        setData(
            'selected_aspects',
            data.selected_aspects.map((aspect) => (aspect.id === aspectId ? { ...aspect, weight } : aspect)),
        );
    };

    const addVisibilityRule = () => {
        setData('visibility_rules', [
            ...data.visibility_rules,
            {
                description: '',
                source_type: '',
                source_field: '',
                operator: '',
                value: '',
            },
        ]);
    };

    const removeVisibilityRule = (indexToRemove: number) => {
        setData(
            'visibility_rules',
            data.visibility_rules.filter((_, index) => index !== indexToRemove),
        );
    };

    const getFieldOptions = (sourceType: string) => {
        switch (sourceType) {
            case 'borrower_detail':
                return borrowerDetailFields;
            case 'borrower_facility':
                return borrowerFacilityFields;
            default:
                return [];
        }
    };

    const distributeWeightEvenly = () => {
        if (data.selected_aspects.length === 0) return;
        const evenWeight = 100 / data.selected_aspects.length;
        const newAspects = data.selected_aspects.map((aspect) => ({
            ...aspect,
            weight: Math.round(evenWeight * 100) / 100,
        }));

        const currentTotal = newAspects.reduce((sum, aspect) => sum + aspect.weight, 0);
        const diff = 100 - currentTotal;
        if (Math.abs(diff) > 0.01 && newAspects.length > 0) {
            newAspects[0].weight += diff;
            newAspects[0].weight = Math.round(newAspects[0].weight * 100) / 100;
        }
        setData('selected_aspects', newAspects);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.selected_aspects.length === 0) {
            toast.error('Pilih minimal satu aspek.');
            return;
        }

        if (!isWeightValid) {
            toast.error('Total bobot semua aspek yang dipilih harus tepat 100%');
            return;
        }

        post(templates.store().url, {
            onSuccess: () => {
                toast.success('Template berhasil ditambahkan.');
                router.visit(templates.index().url, {
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
            <Head title="Tambah Template" />
            <div className="py-6 md:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <Card>
                        {/* Header */}
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold md:text-2xl">Tambah Template</CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Buat template penilaian baru dengan memilih aspek, menentukan bobot, dan aturan visibilitas
                                </p>
                            </div>
                            <Link href={templates.index().url}>
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
                                            <Label htmlFor="name">Judul Template</Label>
                                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Deskripsi</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                            <InputError message={errors.description} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Pemilihan Aspek & Bobot</span>
                                            <Button
                                                type="button"
                                                variant={'outline'}
                                                size={'sm'}
                                                onClick={distributeWeightEvenly}
                                                disabled={data.selected_aspects.length === 0}
                                            >
                                                Bagi Rata Bobot
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {aspects.length > 0 && (
                                            <div className="space-y-4">
                                                {aspects.map((aspect) => (
                                                    <div key={aspect.id} className="flex items-center justify-between rounded-lg border p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={`aspect-${aspect.id}`}
                                                                checked={selectedAspectIds.includes(aspect.id)}
                                                                onCheckedChange={(isChecked: boolean) => handleCheckboxChange(aspect.id, isChecked)}
                                                            />
                                                            <Label htmlFor={`aspect-${aspect.id}`} className="font-medium">
                                                                {aspect.latest_aspect_version?.name || aspect.code}
                                                            </Label>
                                                        </div>
                                                        {selectedAspectIds.includes(aspect.id) && (
                                                            <div className="flex items-center space-x-2">
                                                                <Label className="text-sm">Bobot (%):</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={data.selected_aspects.find((a) => a.id === aspect.id)?.weight || ''}
                                                                    onChange={(e) => updateAspectWeight(aspect.id, Number(e.target.value))}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    className="w-20"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>Aturan Visibilitas Template</span>
                                            <Button type="button" variant={'outline'} size={'sm'} onClick={addVisibilityRule}>
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Tambah Aturan
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {data.visibility_rules.length === 0 && (
                                            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                                                <p className="text-sm text-gray-500">
                                                    Tidak ada aturan visibilitas. Template akan selalu ditampilkan
                                                </p>
                                            </div>
                                        )}
                                        {data.visibility_rules.map((rule, index) => (
                                            <div key={index} className="space-y-4 rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">Aturan {index + 1}</h4>
                                                    <Button
                                                        type="button"
                                                        variant={'destructive'}
                                                        size={'sm'}
                                                        onClick={() => removeVisibilityRule(index)}
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Deskripsi (Opsional)</Label>
                                                    <Textarea
                                                        value={rule.description}
                                                        onChange={(e) => {
                                                            const newRules = [...data.visibility_rules];
                                                            newRules[index].description = e.target.value;
                                                            setData({ ...data, visibility_rules: newRules });
                                                        }}
                                                        placeholder="Deskripsi aturan"
                                                    />
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label>Tipe Sumber</Label>
                                                        <Select
                                                            value={rule.source_type}
                                                            onValueChange={(value) => {
                                                                const newRules = [...data.visibility_rules];
                                                                newRules[index].source_type = value;
                                                                newRules[index].source_field = '';
                                                                setData({ ...data, visibility_rules: newRules });
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih tipe sumber" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sourceTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Field Sumber</Label>
                                                        <Select
                                                            value={rule.source_field}
                                                            onValueChange={(value) => {
                                                                const newRules = [...data.visibility_rules];
                                                                newRules[index].source_field = value;
                                                                setData({ ...data, visibility_rules: newRules });
                                                            }}
                                                            disabled={!rule.source_type}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih field" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getFieldOptions(rule.source_type).map((field) => (
                                                                    <SelectItem key={field.value} value={field.value}>
                                                                        {field.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Operator</Label>
                                                        <Select
                                                            value={rule.operator}
                                                            onValueChange={(value) => {
                                                                const newRules = [...data.visibility_rules];
                                                                newRules[index].operator = value;
                                                                setData({ ...data, visibility_rules: newRules });
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih operator" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {operatorOptions.map((operator) => (
                                                                    <SelectItem key={operator.value} value={operator.value}>
                                                                        {operator.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nilai</Label>
                                                    <Input
                                                        value={rule.value}
                                                        onChange={(e) => {
                                                            const newRules = [...data.visibility_rules];
                                                            newRules[index].value = e.target.value;
                                                            setData({ ...data, visibility_rules: newRules });
                                                        }}
                                                        placeholder="Masukan nilai untuk perbandingan"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </CardContent>

                            <CardFooter className="flex items-center justify-end gap-3">
                                <Link href={templates.index().url}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={!isWeightValid || processing}>
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
