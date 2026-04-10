import { NextResponse, NextRequest } from "next/server";
import prismaClient from "@/lib/db";
import { z } from "zod";

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
      omit: {
        pdf: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, project: project },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
};
