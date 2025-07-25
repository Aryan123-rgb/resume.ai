import { generateLatexCode } from "@/app/action";
import { Chat, Resume } from "@/generated/prisma";
import { prepareLatexCode } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useCallback, useRef, useEffect } from "react";

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
};


export const useResumeWithPdf = (resumeId: string) => {
    const [pdfUrl, setPdfUrl] = useState('');
    const currentPdfUrlRef = useRef<string>('');

    // fetch resume data
    const resumeData = useQuery({
        queryKey: ["resume", resumeId],
        queryFn: () => fetchResume(resumeId),
        enabled: !!resumeId
    });

    // cache pdf blobs 
    const pdfBlob = useQuery({
        queryKey: ["pdf", resumeData.data?.latex_code],
        queryFn: () => compilePdf(prepareLatexCode(resumeData.data?.latex_code)),
        enabled: !!resumeData.data?.latex_code,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2
    })

    // Update PDF URL when blob changes
    useEffect(() => {
        if (pdfBlob.data) {
            // Cleanup previous URL
            if (currentPdfUrlRef.current) {
                window.URL.revokeObjectURL(currentPdfUrlRef.current);
            }

            // Create new URL
            const url = window.URL.createObjectURL(pdfBlob.data);
            setPdfUrl(url);
            currentPdfUrlRef.current = url;
        }
    }, [pdfBlob.data]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentPdfUrlRef.current) {
                window.URL.revokeObjectURL(currentPdfUrlRef.current);
            }
        };
    }, []);

    return {
        resume: resumeData.data,
        isLoadingResume: resumeData.isLoading,
        resumeError: resumeData.error,
        pdfUrl,
        isCompilingPdf: pdfBlob.isLoading,
        pdfError: pdfBlob.error,
        refetchPdf: pdfBlob.refetch,
        refetchResume: resumeData.refetch
    };
}

// Separate mutations for manual compile and generate & compile
export const useManualCompile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (latexCode: any) => {
            return await compilePdf(prepareLatexCode(latexCode));
        },
        onSuccess: (pdfBlob, latexCode) => {
            // Cache the compiled PDF
            queryClient.setQueryData(['pdf', latexCode], pdfBlob);
        },
        onError: (error) => {
            console.error("Manual compilation failed", error);
        }
    });
};

export const useGenerateAndCompile = (resumeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ queryText, latexCode }: { queryText: string, latexCode: any }) => {
            if (!latexCode) throw new Error("Latex code is missing");

            // Generate new latex code
            const result = await generateLatexCode(queryText, resumeId, latexCode);

            if (!result.success || !result?.data) {
                throw new Error("Failed to generate latex code");
            }

            // Compile the new latex code
            const pdfBlob = await compilePdf(prepareLatexCode(result.data));

            return {
                latexCode: result.data,
                pdfBlob,
                success: true,
                originalQuery: queryText,
            };
        },
        onMutate: async ({ queryText }) => {
            // Cancel outgoing queries to prevent any race conditions
            await queryClient.cancelQueries({
                queryKey: ["resume", resumeId]
            });

            // Get current resume data
            const previousResumeData = queryClient.getQueryData<FullResume>(['resume', resumeId]);

            if (previousResumeData) {
                // create dummy chat messages for optimistic updates
                const userMessage: Chat = {
                    id: `temp-user-${Date.now()}`,
                    content: queryText,
                    role: 'Human',
                    resumeId: resumeId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                const botMessage: Chat = {
                    id: `temp-user-${Date.now() + 1000}`,
                    content: "Making changes......",
                    role: 'Bot',
                    resumeId: resumeId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                queryClient.setQueryData(['resume', resumeId], {
                    ...previousResumeData,
                    chat: [
                        ...previousResumeData.chat,
                        userMessage,
                        botMessage
                    ]
                });

            }

            // Return context for potential rollback
            return { previousResumeData };
        },
        // Error - rollback optimistic updates
        onError: (error, variables, context) => {
            // Rollback to previous state
            if (context?.previousResumeData) {
                queryClient.setQueryData(['resume', resumeId], context.previousResumeData);
            }

            console.error("Generate and compile failed", error);
        },

        // Always runs after success or error
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['resume', resumeId]
            })
        }
    });
};