'use server';

import path from "path";
import fs from 'fs/promises'
import { requireUser } from "@/lib/hooks";
import { z } from 'zod';
import prismaClient from "@/lib/db";
import { getAIResponse } from "@/lib/ai";

const projectSchema = z.object({
    name: z.string(),
    description: z.string(),
    resumeType: z.string(),
})

export async function createNewProject(data: z.infer<typeof projectSchema>) {
    try {
        const validatedData = projectSchema.parse(data);
        const { resumeType } = validatedData;

        const filePath = path.join(process.cwd(), 'templates', resumeType, `${resumeType}.json`);
        const latex_code = await fs.readFile(filePath, 'utf-8');

        const userId = await requireUser();

        const resume = await prismaClient.resume.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                latex_code: JSON.parse(latex_code),
                userId,
                chat: {
                    createMany: {
                        data: [
                            {
                                content: "Hi there! I'm your AI assistant for building the perfect resume. Just tell me what you'd like to add or update.",
                                role: "Bot"
                            },
                            {
                                content: "You can share details like your name, contact info, or ask me to generate sections like work experience or education. I'm here to help!",
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

export async function generateLatexCode(query: string, resumeId: string, latex_code: any) {
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

        return { success: true, data: updated_latex_code };
    } catch (error) {
        console.error('Error generating latex code', error);
        return { success: false, error: error };
    }
}