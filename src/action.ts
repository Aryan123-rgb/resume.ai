"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import prismaClient from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { resumeSchema } from "./app/(main)/resume-editor/[resumeId]/forms/schema";

const createProjectSchema = z.object({
  templateName: z.string().min(1, "Template Name is required"),
  name: z.string().min(1, "Project Name is required"),
  description: z.string().optional().default(""),
});

export async function createNewProject(payload: any) {

  const validatedData = createProjectSchema.parse(payload);
  const user = await auth();
  const userId = user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const templateDir = path.join(process.cwd(), "templates", validatedData.templateName);

  try {
    await fs.access(templateDir);
  } catch {
    throw new Error("Invalid template name or template not found");
  }

  const texContent = await fs.readFile(path.join(templateDir, "main.tex"), "utf-8");
  const pdfBuffer = await fs.readFile(path.join(templateDir, "main.pdf"));

  const project = await prismaClient.project.create({
    data: {
      userId,
      name: validatedData.name,
      description: validatedData.description,
      latex_code: texContent,
      pdf: pdfBuffer,
      status: "Completed",
      compiler: "pdflatex",
      userData: {},
    },
  });

  return project.id;
}

export async function syncUserData(projectId: string, userData: any) {
  const user = await auth();
  const userId = user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = resumeSchema.parse(userData)

  await prismaClient.project.update({
    where: { id: projectId },
    data: { userData: validatedData },
  });
}
