import { Project } from "@/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getProjectById, checkProjectStatus, generateProjectAndCompileAction } from "@/action";

export type FetchedProject = Project & {
  status: string;
  latex_code: string;
  compiler: string;
  userData: any;
};


const fetchProject = async (projectId: string): Promise<FetchedProject> => {
  try {
    const project = await getProjectById(projectId);
    return project as FetchedProject;
  } catch (error: any) {
    const message =
      error?.message ||
      "An unknown error occurred while loading the project.";
    throw new Error(message);
  }
};

export const useProject = (projectId: string) => {
  return useQuery<FetchedProject, Error>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

const fetchProjectStatus = async (projectId: string): Promise<string> => {
  try {
    const status = await checkProjectStatus(projectId);
    return status;
  } catch (error: any) {
    const message =
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
  const data = await generateProjectAndCompileAction({
    userData: formData,
    projectId,
    latexCode,
  });

  if (!data?.success) {
    throw new Error("Failed to start compilation");
  }

  return data;
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
