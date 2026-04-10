import { NextResponse, NextRequest } from "next/server";
import prismaClient from "@/lib/db";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const QuerySchema = z.object({
    projectId: z.string().uuid("Invalid project ID"),
});

export const GET = async (req: NextRequest) => {
    try {
        const user = await auth();
        if (!user?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");

        const validatedData = QuerySchema.parse({ projectId });

        const project = await prismaClient.project.findUnique({
            where: {
                id: validatedData.projectId,
            },
            select: {
                status: true
            },
        });

        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, project }, { status: 200 });
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
