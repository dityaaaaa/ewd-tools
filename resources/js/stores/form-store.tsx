import { create } from 'zustand';

export interface InformationBorrower {
    borrowerId: number | null;
    borrowerGroup: string;
    purpose: number;
    economicSector: string;
    businessField: string;
    borrowerBusiness: string;
    collectibility: number;
    restructuring: boolean;
}

export interface Facility {
    id: number | null;
    name: string;
    limit: number;
    outstanding: number;
    interestRate: number;
    principalArrears: number;
    interestArrears: number;
    pdo: number;
    maturityDate: Date | string;
}

export interface Aspect {
    questionId: number;
    selectedOptionId: number | null;
    notes: string;
    aspectName?: string;
}

export interface ReportMeta {
    template_id: number | null;
    period_id: number | null;
}

export interface FormStoreState {
    activeStep: number;
    totalSteps: number;
    informationBorrower: InformationBorrower;
    facilitiesBorrower: Facility[];
    aspectsBorrower: Aspect[];
    reportMeta: ReportMeta;
    aspectGroups: any[];

    setActiveStep: (step: number) => void;
    updateInformationBorrower: (payload: Partial<InformationBorrower>) => void;
    updateFacilitiesBorrower: (payload: Facility[]) => void;
    setAspectsBorrower: (answer: Aspect) => void;
    updateAspectsBorrower: (aspects: Aspect[]) => void;
    updateReportMeta: (payload: Partial<ReportMeta>) => void;
    setAspectGroups: (groups: any[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetForm: () => void;
    hydrate: (data: Partial<FormStoreState>) => void;
    getAsSubmitData: () => {
        informationBorrower: InformationBorrower;
        facilitiesBorrower: Facility[];
        aspectsBorrower: Aspect[];
        reportMeta: ReportMeta;
    };
}

export const initialFormState: Omit<
    FormStoreState,
    | 'setActiveStep'
    | 'updateInformationBorrower'
    | 'updateFacilitiesBorrower'
    | 'setAspectsBorrower'
    | 'updateAspectsBorrower'
    | 'updateReportMeta'
    | 'setAspectGroups'
    | 'nextStep'
    | 'prevStep'
    | 'resetForm'
    | 'hydrate'
    | 'getAsSubmitData'
> = {
    activeStep: 1,
    totalSteps: 3,
    informationBorrower: {
        borrowerId: null,
        borrowerGroup: '',
        purpose: 1, // Pastikan tipe awal cocok
        economicSector: '',
        businessField: '',
        borrowerBusiness: '',
        collectibility: 1,
        restructuring: false,
    },
    facilitiesBorrower: [],
    aspectsBorrower: [],
    reportMeta: {
        template_id: null,
        period_id: null,
    },
    aspectGroups: [],
};

export const useFormStore = create<FormStoreState>((set, get) => ({
    ...initialFormState,

    setActiveStep: (step) => set({ activeStep: step }),

    updateInformationBorrower: (payload) =>
        set((state) => ({
            informationBorrower: { ...state.informationBorrower, ...payload },
        })),

    updateFacilitiesBorrower: (payload) => set({ facilitiesBorrower: payload }),

    setAspectsBorrower: (answer) =>
        set((state) => ({
            aspectsBorrower: [
                ...state.aspectsBorrower.filter((a) => a.questionId !== answer.questionId),
                answer,
                { questionId: answer.questionId, selectedOptionId: answer.selectedOptionId, notes: answer.notes ?? '' },
            ],
        })),

    updateAspectsBorrower: (aspects) => set({ aspectsBorrower: aspects }),

    updateReportMeta: (payload) =>
        set((state) => ({
            reportMeta: { ...state.reportMeta, ...payload },
        })),

    setAspectGroups: (groups) => set({ aspectGroups: groups }),

    nextStep: () =>
        set((state) => ({
            activeStep: state.activeStep < state.totalSteps ? state.activeStep + 1 : state.activeStep,
        })),

    prevStep: () =>
        set((state) => ({
            activeStep: state.activeStep > 1 ? state.activeStep - 1 : state.activeStep,
        })),

    resetForm: () => set(initialFormState),

    hydrate: (data: any) => set(data),

    getAsSubmitData: () => {
        const state = get();
        return {
            informationBorrower: state.informationBorrower,
            facilitiesBorrower: state.facilitiesBorrower.map((f) => ({
                ...f,
                limit: Number(f.limit) || 0,
                outstanding: Number(f.outstanding) || 0,
                interestRate: Number(f.interestRate) || 0,
                principalArrears: Number(f.principalArrears) || 0,
                interestArrears: Number(f.interestArrears) || 0,
                pdo: Number(f.pdo) || 0,
            })),
            aspectsBorrower: state.aspectsBorrower,
            reportMeta: state.reportMeta,
        };
    },
}));
