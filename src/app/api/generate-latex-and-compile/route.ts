import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { resumeSchema } from "@/app/(main)/resume-editor/[resumeId]/forms/schema";

export const generateLatexSchema = z.object({
  userData: resumeSchema,
  projectId: z.string().uuid(),
  latexCode: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = generateLatexSchema.parse(await req.json());

    const workflowId = await inngest.send({
      name: "project.generate",
      data: {
        userData: data.userData,
        latexCode: data.latexCode,
        projectId: data.projectId,
      },
    });

    return NextResponse.json({
      success: true,
      workflowId: workflowId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    console.error("Error dispatching latex generation task", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}