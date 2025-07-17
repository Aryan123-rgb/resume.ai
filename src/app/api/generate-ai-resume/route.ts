import { generateLatexCode } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const generateAIResumeSchema = z.object({
    instructions: z.string(),
})

export async function POST(req: NextRequest) {
    try {
        const data = generateAIResumeSchema.parse(await req.json());
        await generateLatexCode(data.instructions);
        return NextResponse.json('ok');
    } catch (e) {
        console.log("error while generating ai resume", e);
        return NextResponse.json("Error while generating ai resume", { status: 500 });
    }
}