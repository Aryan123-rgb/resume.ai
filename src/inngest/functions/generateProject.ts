import { generateLatexFromUserData } from "@/lib/ai";
import { inngest } from "../client";
import prismaClient from "@/lib/db";
import { generatePDF } from "@/lib/latex";

export const generateProjectFunction = inngest.createFunction(
  {
    id: "generate-project",
    triggers: { event: "project.generate" },
  },
  async ({ event, step }: { event: { data: any }; step: any }) => {
    const { userData, latexCode, projectId } = event.data;

    await step.run("update-step", async () => {
      await prismaClient.project.update({
        where: { id: projectId },
        data: { status: "Processing" },
      });
    });

    // ==========================================
    // STEP 1: AI Code Generation
    // ==========================================
    const updatedLatexCode = await step.run("generate-ai-latex", async () => {
      return await generateLatexFromUserData(userData, latexCode);
    });

    // ==========================================
    // STEP 2: Compile LaTeX to PDF via E2B sandbox
    // ==========================================
    await step.run("generate-and-save-pdf", async () => {
      const buffer = await generatePDF(updatedLatexCode, "pdflatex");
      
      await prismaClient.project.update({
        where: { id: projectId },
        data: { pdf: buffer, latex_code: updatedLatexCode },
      });
    });

    await step.run("update-step", async () => {
      await prismaClient.project.update({
        where: { id: projectId },
        data: { status: "Completed" },
      });
    });

    return { success: true, projectId };
  },
);
