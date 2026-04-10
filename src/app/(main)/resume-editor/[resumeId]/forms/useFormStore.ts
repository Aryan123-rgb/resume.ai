import { create } from 'zustand';
import { z } from 'zod';
import { resumeSchema } from './schema';

type ResumeData = z.infer<typeof resumeSchema>;

interface FormStore {
    formData: Partial<ResumeData>;
    updateFormData: (data: Partial<ResumeData>) => void;
    logFormData: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
    formData: {},
    updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
    logFormData: () => {
        console.log("=== MULTI-STEP FORM SUBMITTED DATA ===");
        console.log(JSON.stringify(get().formData, null, 2));
    }
}));
