"use client";

import { useEffect, useState } from "react";
import { Eye, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/lib/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGenerateAndCompile,
  useProject,
  useProjectStatus,
} from "./use-resume";
import { MultiStepForm } from "./forms/MultiStepForm";
import { useFormStore } from "./forms/useFormStore";
import { useAutoSave } from "./useAutoSave";

export default function ResumeEditor({ resumeId }: { resumeId: string }) {
  const { showError, showSuccess } = useToast();
  const formData = useFormStore((state) => state.formData);
  useAutoSave(resumeId, formData);

  const {
    data,
    isLoading: isLoadingProject,
    isFetching: isFetchingProject,
    error: projectError,
    refetch: refetchProject,
  } = useProject(resumeId);

  const project = data?.project;
  const isLoadingProjectData = (isLoadingProject || isFetchingProject) && !project;

  const [polling, setPolling] = useState(false);

  const {
    data: projectStatus,
    error: statusError,
  } = useProjectStatus(resumeId, polling);

  const { mutate: generateAndCompile, isPending: isCompilePending } =
    useGenerateAndCompile();

  const pdfUrl = project?.id && project?.status === "Completed"
  ? `/api/get-project-pdf?projectId=${project.id}`
  : "";

  useEffect(() => {
    if (projectStatus && projectStatus !== "Processing") {
      setPolling(false);
      refetchProject();
    }
  }, [projectStatus, refetchProject]);

  const handleReadyToCompile = async () => {
    if (!project?.latex_code) {
      showError("Could not start compilation. Missing project LaTeX code.");
      return;
    }

    generateAndCompile(
      {
        formData,
        projectId: resumeId,
        latexCode: project.latex_code,
      },
      {
        onSuccess: () => {
          setPolling(true);
          showSuccess("Compilation started in background");
        },
        onError: () => {
          showError("Failed to start compilation");
          setPolling(false);
        },
      },
    );
  };

  const isCompiling = polling || isCompilePending;
  const errorMessage = projectError?.message || statusError?.message;

  return (
    <main className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700 bg-background overflow-hidden relative">
        <MultiStepForm
          onReadyToCompile={handleReadyToCompile}
          isSubmitting={isCompilePending}
          isCompileEnabled={!!project?.latex_code}
        />
      </div>

      <div className="w-1/2 h-full overflow-auto">
        <div className="w-full h-full bg-secondary/30">
          <div className="h-full flex flex-col">
            <div className="border-b border-border p-4 bg-background flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Resume Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    {project?.status
                      ? `Status: ${project.status}`
                      : "See how your resume will look"}
                  </p>
                </div>
              </div>
              {projectStatus && projectStatus !== "Processing" && (
                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {projectStatus}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              <div className="h-full w-full p-6">
                {isLoadingProjectData ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium text-foreground">
                      Loading project...
                    </p>
                    <Skeleton className="mt-4 h-4 w-48" />
                  </div>
                ) : errorMessage ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <p className="text-lg font-semibold text-foreground">
                      Error loading project
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      {errorMessage}
                    </p>
                  </div>
                ) : isCompiling ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="space-y-2 text-center">
                      <p className="text-lg font-medium text-foreground">
                        Generating & Compiling PDF
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This may take a moment...
                      </p>
                    </div>
                    <Skeleton className="mt-4 h-4 w-48" />
                  </div>
                ) : pdfUrl ? (
                  <div className="h-full w-full">
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="100%"
                      title="resume.pdf"
                      className="min-h-[calc(100vh-12rem)] w-full border-0"
                      onError={() => showError("Failed to display PDF")}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-muted-foreground">
                          Resume Preview
                        </h3>
                        <p className="text-muted-foreground">
                          Your resume preview will appear here once your project
                          has a compiled PDF.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
