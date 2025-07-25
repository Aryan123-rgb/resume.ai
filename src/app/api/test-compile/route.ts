import { NextRequest, NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';
import { generatePDF } from "@/lib/latex";
import { getAIResponse } from "@/lib/ai";

export async function GET(req: NextRequest) {
    const folderPath = path.join(process.cwd(), "templates", "Professional");
    const jsonPath = path.join(folderPath, "Professional.json");

    try {
        const jsonData = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(jsonData);

        const query = `Update my contact details: name should be "Rajesh Kumar", email "rajesh.k@outlook.com", phone "+91 9123456789", location "Bangalore, Karnataka"`

        const mainLatexCode = await getAIResponse(query, data);

        // return NextResponse.json('ok');

        const pdfBuffer = await generatePDF(mainLatexCode);

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
    } catch (err) {
        return NextResponse.json({
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}
