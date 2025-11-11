import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { FormStoreState, initialFormState, useFormStore } from '@/stores/form-store';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Building2, Calculator, ListChecks } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import FormAspect from './aspect-form';
import FormFacility from './facility-form';
import FormInformation from './information-form';

interface FormProps {
    borrowers: { id: number; name: string }[];
    borrower_id?: number | null;
    period: any;
    aspect_groups: any[];
    template_id?: number | null;
    borrower_data?: any;
    facility_data?: any;
    purpose_options?: any[];
    submit_url?: string;
    answers?: { questionId: number; selectedOptionId: number | null; notes: string }[];
}

interface StepperStep {
    id: number;
    title: string;
    component: React.ComponentType<any>;
    icon: React.ElementType;
    required: boolean;
    props: any;
}

export default function FormIndex({
    borrowers = [],
    borrower_id = null,
    period,
    aspect_groups,
    template_id = null,
    borrower_data = {},
    facility_data = {},
    purpose_options = [],
    submit_url,
    answers = [],
}: FormProps) {
    const [isSavingStep, setIsSavingStep] = useState(false);

    const {
        activeStep,
        totalSteps,
        prevStep,
        nextStep: storeNextStep,
        informationBorrower,
        facilitiesBorrower,
        setAspectGroups,
        updateReportMeta,
        hydrate,
        getAsSubmitData,
        resetForm,
        aspectGroups: storeAspectGroups,
    } = useFormStore();

    useEffect(() => {
        hydrate({
            informationBorrower: borrower_data || initialFormState.informationBorrower,
            facilitiesBorrower: facility_data || [],
            aspectGroups: aspect_groups || [],
            aspectsBorrower: answers || [],
            reportMeta: {
                template_id: template_id,
                period_id: period?.id,
            },
            activeStep: initialFormState.activeStep,
        } as Partial<FormStoreState>);
    }, [hydrate, borrower_data, facility_data, aspect_groups, template_id, period, answers]);

    const handleNextStep = async () => {
        if (activeStep >= totalSteps) return;

        setIsSavingStep(true);
        const toastId = toast.loading('Memuat data...');

        try {
            const response = await axios.post('/forms/save-step', {
                informationBorrower,
                facilitiesBorrower,
            });

            setAspectGroups(response.data.aspect_groups);
            updateReportMeta({ template_id: response.data.template_id });

            toast.update(toastId, { render: 'Berhasil!', type: 'success', isLoading: false, autoClose: 1500 });
            storeNextStep();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal memuat data!';
            toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 3000 });
        } finally {
            setIsSavingStep(false);
        }
    };

    const { post, put, processing, errors, data, setData } = useForm({
        ...getAsSubmitData(),
    });

    useEffect(() => {
        setData(getAsSubmitData());
    }, [
        informationBorrower,
        facilitiesBorrower,
        useFormStore.getState().aspectsBorrower,
        useFormStore.getState().reportMeta,
        setData,
        getAsSubmitData,
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const targetUrl = submit_url ?? '/forms';
        const submitFn = submit_url ? put : post;

        submitFn(targetUrl, {
            onSuccess: () => {
                resetForm();
                toast.success('Data berhasil disimpan!');
            },
            onError: (errs) => {
                console.error('Validation Errors:', errs);
                const generalError = Object.values(errs).find(
                    (msg) => !msg.startsWith('informationBorrower.') && !msg.startsWith('facilitiesBorrower.') && !msg.startsWith('aspectsBorrower.'),
                );
                if (generalError) {
                    toast.error(generalError, { theme: 'colored' });
                } else {
                    toast.error('Periksa kembali isian formulir Anda.', { theme: 'colored' });
                }
            },
            preserveScroll: true,
        });
    };

    const steps: StepperStep[] = [
        {
            id: 1,
            title: 'Informasi Debitur',
            component: FormInformation,
            icon: Building2,
            required: true,
            props: { borrowers, purpose_options, errors },
        },
        {
            id: 2,
            title: 'Fasilitas Debitur',
            component: FormFacility,
            icon: Calculator,
            required: true,
            props: { errors },
        },
        {
            id: 3,
            title: 'Penilaian Aspek',
            component: FormAspect,
            icon: ListChecks,
            required: true,
            props: { aspect_groups: storeAspectGroups, errors },
        },
    ];

    const currentStepData = steps[activeStep - 1];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="bg-[#2E3192] p-4 text-white shadow-md dark:bg-[#1A1D68] dark:text-gray-200">
                <Label className="pl-2 text-2xl font-bold">Form Penilaian Debitur</Label>
            </div>

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Stepper steps={steps} currentStep={activeStep - 1} />
            </div>

            {currentStepData && (
                <div className="container mx-auto mb-4 sm:mb-6">
                    <currentStepData.component {...currentStepData.props} />
                </div>
            )}

            <div className="mx-auto mt-6 flex max-w-4xl flex-col justify-end gap-4 sm:flex-row lg:max-w-6xl lg:gap-6 lg:px-8">
                {activeStep > 1 && (
                    <Button
                        variant={'outline'}
                        className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3"
                        onClick={prevStep}
                        disabled={processing || isSavingStep}
                    >
                        Kembali
                    </Button>
                )}
                {activeStep < totalSteps && (
                    <Button
                        className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3"
                        onClick={handleNextStep}
                        disabled={isSavingStep || processing}
                    >
                        {isSavingStep ? 'Memuat...' : 'Lanjut'}
                    </Button>
                )}
                {activeStep === totalSteps && (
                    <Button
                        className="w-full min-w-24 sm:w-auto lg:min-w-32 lg:px-8 lg:py-3"
                        onClick={handleSubmit}
                        disabled={isSavingStep || processing}
                    >
                        {processing ? 'Mengirim...' : 'Submit'}
                    </Button>
                )}
            </div>
        </div>
    );
}
