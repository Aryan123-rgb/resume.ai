import { generateLatexCode } from "@/app/action";
import { Chat, Resume } from "@/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios"

export type FullResume = Resume & {
    chat: Chat[];
};

const fetchResume = async (resumeId: string): Promise<FullResume> => {
    try {
        const res = await axios.get(`/api/get-resume?resumeId=${resumeId}`);
        if (res.status !== 200 || !res.data) {
            throw new Error("Failed to load resume: Invalid response");
        }
        return res.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "An unknown error occurred while fetching the resume.";
        throw new Error(message);
    }
};

const compilePdf = async (latexCode: string): Promise<Blob> => {
    const res = await axios.post(
        `/api/compile-resume`,
        { latex_code: latexCode },
        { responseType: "blob" }
    );

    const contentType = res.headers["content-type"];
    if (contentType !== "application/pdf") {
        throw new Error("Invalid content type received");
    }

    if (res.data.size === 0) {
        throw new Error("Empty PDF blob received");
    }

    const arrayBuffer = await res.data.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));

    if (pdfHeader !== "%PDF") {
        const text = new TextDecoder().decode(uint8Array);
        console.error("Non-PDF response:", text);
        throw new Error("Invalid PDF received");
    }

    return new Blob([res.data], { type: "application/pdf" });
}


export const useResume = (resumeId: string) => {
    return useQuery({
        queryKey: ['resume', resumeId],
        queryFn: () => fetchResume(resumeId),
        enabled: !!resumeId
    })
}

export const useGenerateLatex = (resumeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ queryText, latexCode }: { queryText: string, latexCode: string }) => {
            if (!latexCode) throw new Error("Latex code is missing")
            return generateLatexCode(queryText, resumeId, latexCode)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["resume", resumeId]
            })
        },
    })
}

export const useCompilePdf = () => {
    return useMutation({
        mutationFn: compilePdf,
        onError: (error) => {
            console.error("PDF compilation failed", error)
        }
    })
}