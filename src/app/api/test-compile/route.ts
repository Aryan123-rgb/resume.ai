import { NextRequest, NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';
import { generatePDF } from "@/lib/latex";
import { getAIResponse } from "@/lib/ai";

export async function GET(req: NextRequest) {
    const folderPath = path.join(process.cwd(), "templates", "Creative");
    const jsonPath = path.join(folderPath, "Creative.json");
    const latexPath = path.join(folderPath, "Creative.tex");

    try {
        const jsonData = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(jsonData);

        // const query = `Update my contact details: name should be "Rajesh Kumar", email "rajesh.k@outlook.com", phone "+91 9123456789", location "Bangalore, Karnataka"`

        // const mainLatexCode = await getAIResponse(query, data);

        // return NextResponse.json('ok');

        // let mainLatexCode = await fs.readFile(latexPath, 'utf-8');
        let mainLatexCode = data.main;

        Object.entries(data).forEach(([key, value]) => {
            mainLatexCode = mainLatexCode.replaceAll(`{{${key}}}`, String(value));
        })

        const pdfBuffer = await generatePDF(mainLatexCode, "xelatex");

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
