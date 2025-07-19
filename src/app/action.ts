'use server';
import path from "path";
import fs from 'fs/promises'
import { requireUser } from "@/lib/hooks";
import { z } from 'zod';
import { projectSchema } from "@/lib/zodSchemaTypes";
import prismaClient from "@/lib/db";
import { generatePDF } from "@/lib/latex";
import { getAIResponse } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function createNewProject(data: z.infer<typeof projectSchema>) {
    try {
        const validatedData = projectSchema.parse(data);

        const filePath = path.join(process.cwd(), 'templates', 'resume.tex');
        const latex_code = await fs.readFile(filePath, 'utf-8');

        const userId = await requireUser();

        const resume = await prismaClient.resume.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                latex_code,
                userId,
                chat: {
                    createMany: {
                        data: [
                            {
                                content: "Hi there! I'm here to help you build your resume. What would you like to add first?",
                                role: 'Bot'
                            },
                            {
                                content: "I can help you with work experience, education, skills, and more. Just let me know!",
                                role: "Bot"
                            }
                        ]
                    }
                }
            }
        });

        return { success: true, resumeId: resume.id };
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: error };
    }
}

export async function generateLatexCode(query: string, resumeId: string, latex_code: string) {
    try {
        const updated_latex_code = await getAIResponse(query, latex_code);

        await prismaClient.$transaction(async (tx) => {
            await tx.resume.update({
                where: {
                    id: resumeId
                },
                data: {
                    latex_code: updated_latex_code
                }
            });

            await tx.chat.createMany({
                data: [
                    {
                        resumeId: resumeId,
                        content: query,
                        role: 'Human',
                    },
                    {
                        resumeId: resumeId,
                        content: "The changes were made successfully",
                        role: 'Bot',
                    }
                ]
            });
        });

        revalidatePath(`/resume-editor/${resumeId}`);
        return { success: true, data: updated_latex_code };
    } catch (error) {
        console.error('Error generating latex code', error);
        return { success: false, error: error };
    }
}