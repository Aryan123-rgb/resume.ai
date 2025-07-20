import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const resumeId = req.nextUrl.searchParams.get('resumeId');

    if (!resumeId) {
        return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    const resume = await prismaClient.resume.findUnique({
        where: {
            id: resumeId
        },
        include: {
            chat: true
        }
    })
    if (!resume) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    
    return NextResponse.json(resume);
}