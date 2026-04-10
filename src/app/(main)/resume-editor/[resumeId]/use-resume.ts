import { Project } from "@/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

type FetchedProject = Project & {
  status: string;
  latex_code: string;
  compiler: string;
};

type ProjectWithPdf = {
  project: FetchedProject;
  pdfBlob: Blob | null;
};

const fetchProjectPdf = async (projectId: string): Promise<Blob | null> => {
  try {
    const res = await axios.get(
      `/api/get-project-pdf?projectId=${projectId}`,
      {
        responseType: "blob",
      },
    );

    if (res.status !== 200) {
      throw new Error("Failed to load project PDF");
    }

    return res.data as Blob;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    const message =
      error?.response?.data?.error ||
      error?.message ||
      "An unknown error occurred while loading the project PDF.";
    throw new Error(message);
  }
};

const fetchProject = async (projectId: string): Promise<FetchedProject> => {
  try {
    const res = await axios.get(
      `/api/get-project-by-id?projectId=${projectId}`,
    );
    if (res.status !== 200 || !res.data?.success || !res.data.project) {
      throw new Error("Failed to load project data");
    }
    return res.data.project;
  } catch (error: any) {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      "An unknown error occurred while loading the project.";
    throw new Error(message);
  }
};

const fetchProjectWithPdf = async (
  projectId: string,
): Promise<ProjectWithPdf> => {
  const [project, pdfBlob] = await Promise.all([
    fetchProject(projectId),
    fetchProjectPdf(projectId),
  ]);
  return { project, pdfBlob };
};

const fetchProjectStatus = async (projectId: string): Promise<string> => {
  try {
    const res = await axios.get(
      `/api/check-project-status?projectId=${projectId}`,
    );
    if (res.status !== 200 || !res.data?.success || !res.data.project) {
      throw new Error("Failed to load project status");
    }
    return res.data.project.status;
  } catch (error: any) {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      "An unknown error occurred while loading the project status.";
    throw new Error(message);
  }
};

const generateProject = async ({
  formData,
  projectId,
  latexCode,
}: {
  formData: any;
  projectId: string;
  latexCode: string;
}) => {
  const res = await axios.post("/api/generate-latex-and-compile", {
    userData: formData,
    projectId,
    latexCode,
  });

  if (res.status !== 200 || !res.data?.success) {
    throw new Error(res.data?.error || "Failed to start compilation");
  }

  return res.data;
};

export const useProject = (projectId: string) => {
  return useQuery<ProjectWithPdf, Error>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectWithPdf(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useProjectStatus = (projectId: string, enabled: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery<string, Error>({
    queryKey: ["project-status", projectId],
    queryFn: () => fetchProjectStatus(projectId),
    enabled: enabled && !!projectId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data === "Processing" ? 5000 : false;
    },
  });

  // ✅ replace onSuccess with useEffect
  useEffect(() => {
    if (query.data && query.data !== "Processing") {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }
  }, [query.data, projectId, queryClient]);

  return query;
};

export const useGenerateAndCompile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateProject,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-status", variables.projectId],
      });
    },
    onError: (error) => {
      console.error("Generate and compile failed", error);
    },
  });
};
