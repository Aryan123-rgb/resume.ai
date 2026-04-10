import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import prismaClient from "@/lib/db";

const getProjectSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const validatedData = getProjectSchema.parse({ projectId });

    const project = await prismaClient.project.findUnique({
      where: {
        id: validatedData.projectId,
      },
      select: {
        pdf: true,
      },
    });

    if (!project?.pdf) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(Buffer.from(project.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=resume.pdf",
        "Content-Length": Buffer.byteLength(project.pdf).toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};
