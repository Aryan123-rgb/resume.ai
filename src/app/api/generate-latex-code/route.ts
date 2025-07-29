import { getAIResponse } from "@/lib/ai";
import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const generateLatexSchema = z.object({
    query: z.string(),
    latex_code: z.any(),
    resumeId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const data = generateLatexSchema.parse(await req.json());
        const { query, latex_code, resumeId } = data;
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

        return NextResponse.json({ success: true, data: updated_latex_code });
    } catch (error) {
        console.error('Error generating latex code', error);
        return NextResponse.json({ success: false, error: error }, { status: 500 });
    }
}