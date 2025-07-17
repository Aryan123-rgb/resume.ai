'use server';
import path from "path";
import fs from 'fs/promises'
import { requireUser } from "@/lib/hooks";
import { z } from 'zod';
import { projectSchema } from "@/lib/zodSchemaTypes";
import prismaClient from "@/lib/db";
import { generatePDF } from "@/lib/latex";
import { getAIResponse } from "@/lib/ai";

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
                userId
            }
        });

        return { success: true, resumeId: resume.id };
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: error };
    }
}

export async function generateLatexCode(query: string, resumeId: string) {
    try {
        const latex_code = await getAIResponse(query);

        console.log("code", latex_code);

        await prismaClient.resume.update({
            where: {
                id: resumeId
            },
            data: {
                latex_code: latex_code
            }
        });

        return { success: true, data: latex_code };
    } catch (error) {
        console.error('Error generating latex code', error);
        return { success: false, error: error };
    }
}