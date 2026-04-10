"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import prismaClient from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { resumeSchema } from "./app/(main)/resume-editor/[resumeId]/forms/schema";
import { inngest } from "@/inngest/client";

export const generateLatexSchema = z.object({
  userData: resumeSchema,
  projectId: z.string().uuid(),
  latexCode: z.string().min(1),
});

const createProjectSchema = z.object({
  templateName: z.string().min(1, "Template Name is required"),
  name: z.string().min(1, "Project Name is required"),
  description: z.string().optional().default(""),
});

export async function checkProjectStatus(projectId: string) {
  try {
    const user = await auth();
    if (!user?.userId) {
      throw new Error("Unauthorized");
    }

    const project = await prismaClient.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project.status;
  } catch (error) {
    console.error("Error in checkProjectStatus:", error);
    throw error;
  }
}

export async function createNewProject(payload: any) {
  try {
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
      },
    });

    return project.id;
  } catch (error) {
    console.error("Error in createNewProject:", error);
    throw error;
  }
}

export async function syncUserData(projectId: string, userData: any) {
  try {
    const user = await auth();
    const userId = user?.userId;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedData = resumeSchema.parse(userData)

    await prismaClient.project.update({
      where: { id: projectId },
      data: { 
        basics: validatedData.basics,
        education: validatedData.education,
        experience: validatedData.experience,
        projectsData: validatedData.projects,
        skills: validatedData.skills,
        achievements: validatedData.achievements,
      },
    });
  } catch (error) {
    console.error("Error in syncUserData:", error);
    throw error;
  }
}

export async function getProjectById(projectId: string) {
  try{
    const user = await auth();
    if (!user?.userId) {
      throw new Error("Unauthorized");
    }

    const project = await prismaClient.project.findUnique({
      where:{
        id: projectId
      },
      omit: {
        pdf: true 
      }
    })

    if (!project) {
      throw new Error("Project Not Found")
    }

    const reshapedProject = {
      ...project,
      userData: {
        basics: project.basics || {},
        education: project.education || [],
        experience: project.experience || [],
        projects: project.projectsData || [],
        skills: project.skills || [],
        achievements: project.achievements || {}
      }
    };

    return reshapedProject; 
  } catch(error) {
    console.error("Error in getProjectById:", error);
    throw new Error("Unexpected error occured")
  }
}

export async function generateProjectAndCompileAction(payload: any) {
  try {
    const user = await auth();
    if (!user?.userId) {
      throw new Error("Unauthorized");
    }

    const data = generateLatexSchema.parse(payload);

    const workflowId = await inngest.send({
      name: "project.generate",
      data: {
        userData: data.userData,
        latexCode: data.latexCode,
        projectId: data.projectId,
      },
    });

    return { success: true, workflowId };
  } catch (error) {
    console.error("Error in generateProjectAndCompileAction:", error);
    throw error;
  }
}