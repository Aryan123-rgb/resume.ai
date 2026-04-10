"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormStore } from "./useFormStore";
import {
  resumeSchema,
  defaultValues,
  basicDetailsSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  skillSchema,
} from "./schema";

import { BasicDetailsStep } from "./BasicDetailsStep";
import { EducationStep } from "./EducationStep";
import { ExperienceStep } from "./ExperienceStep";
import { ProjectsStep } from "./ProjectsStep";
import { SkillsStep } from "./SkillsStep";
import { AchievementsStep } from "./AchievementsStep";

import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ResumeData = z.infer<typeof resumeSchema>;

interface MultiStepFormProps {
  onReadyToCompile: () => void;
  isSubmitting: boolean;
  isCompileEnabled: boolean;
}

const STEPS = [
  { id: "basics", title: "Basic Details", component: BasicDetailsStep, schema: z.object({ basics: basicDetailsSchema }) },
  { id: "education", title: "Education", component: EducationStep, schema: z.object({ education: z.array(educationSchema) }) },
  { id: "experience", title: "Experience", component: ExperienceStep, schema: z.object({ experience: z.array(experienceSchema) }) },
  { id: "projects", title: "Projects", component: ProjectsStep, schema: z.object({ projects: z.array(projectSchema) }) },
  { id: "skills", title: "Skills", component: SkillsStep, schema: z.object({ skills: z.array(skillSchema) }) },
  { id: "achievements", title: "Achievements", component: AchievementsStep, schema: z.object({ achievements: z.any() }) },
];

export function MultiStepForm({
  onReadyToCompile,
  isSubmitting,
  isCompileEnabled,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const updateFormData = useFormStore((state) => state.updateFormData);

  const methods = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  const { trigger, watch } = methods;

  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<ResumeData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const handleNext = async () => {
    const currentStepConfig = STEPS[currentStep];
    const isStepValid = await trigger(currentStepConfig.id as keyof ResumeData);

    if (isStepValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompileButton = async () => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }

    onReadyToCompile();
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="px-6 mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            {STEPS.map((step, index) => {
              const isCurrent = index === currentStep;
              const isPast = index < currentStep;

              let ItemContent;
              if (isCurrent) {
                ItemContent = <BreadcrumbPage className="font-semibold">{step.title}</BreadcrumbPage>;
              } else if (isPast) {
                ItemContent = (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentStep(index);
                    }}
                  >
                    {step.title}
                  </BreadcrumbLink>
                );
              } else {
                ItemContent = <span className="text-muted-foreground/50">{step.title}</span>;
              }

              return (
                <div key={step.id} className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                  <BreadcrumbItem>{ItemContent}</BreadcrumbItem>
                  {index < STEPS.length - 1 && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <FormProvider {...methods}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <CurrentStepComponent />
          </form>
        </FormProvider>
      </div>

      <div className="border-t bg-background p-4 flex justify-between items-center mt-auto">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button
            disabled={!isCompileEnabled || isSubmitting}
            onClick={handleCompileButton}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            {isSubmitting ? "Compiling..." : "Ready to Compile"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
