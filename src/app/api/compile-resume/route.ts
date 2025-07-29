import { NextRequest, NextResponse } from 'next/server'
import { generatePDF } from '@/lib/latex';
import { requireUser } from '@/lib/hooks';
import { z } from 'zod';

const compileResumeSchema = z.object({
    latex_code: z.string(),
    compiler: z.string(),
})

export async function POST(req: NextRequest) {
    try {
        const { data, success } = compileResumeSchema.safeParse(await req.json());

        if (!success) {
            return NextResponse.json({ error: "Invalid data recieved" }, { status: 500 });
        }

        await requireUser();

        const pdfBuffer = await generatePDF(data.latex_code, data.compiler);

        // Double-check the buffer before sending
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("Generated PDF is empty");
        }

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="resume.pdf"',
            }
        })

    } catch (e) {
        console.log("error while generating resume", e);
        return NextResponse.json("Error while generating resume");
    }
}