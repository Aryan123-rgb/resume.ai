import { POST } from "./route";
import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "mock-user-id" }),
}));

// Mock @/lib/db before importing generateProjectFunction or inngest client
vi.mock("@/lib/db", () => {
  return {
    default: {
      project: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },

      $transaction: vi.fn(async (callback) => {
        // mock tx object based on mocked db
        const tx = {
          project: { update: vi.fn() },
        };
        await callback(tx);
      }),
    },
  };
});

// Mock @/lib/latex
vi.mock("@/lib/latex", () => ({
  generatePDF: vi.fn(),
}));

// Mock the Langchain modules
vi.mock("@langchain/groq", () => ({
  ChatGroq: class MockChatGroq {}
}));

vi.mock("@langchain/core/prompts", () => ({
  PromptTemplate: {
    fromTemplate: vi.fn().mockReturnValue({
      pipe: vi.fn().mockReturnValue({
        pipe: vi.fn().mockReturnValue({
          invoke: vi.fn(),
        })
      })
    })
  }
}));

vi.mock("@langchain/core/output_parsers", () => ({
  JsonOutputParser: class MockJsonOutputParser {
    getFormatInstructions() {
      return "JSON FORMAT INSTRUCTIONS";
    }
  },
  StringOutputParser: class MockStringOutputParser {}
}));

// Mock the inngest client to return the handler when createFunction is called
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: vi.fn(),
    createFunction: vi.fn((config, handler) => handler), // returns handler to test it directly
  },
}));

import { inngest } from "@/inngest/client";
import { generateProjectFunction } from "@/inngest/functions/generateProject";
import prismaClient from "@/lib/db";
import { generatePDF } from "@/lib/latex";
import { PromptTemplate } from "@langchain/core/prompts";
import { defaultValues } from "@/app/(main)/resume-editor/[resumeId]/forms/schema";

describe("POST /api/generate-latex-and-compile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if validation fails (missing formData)", async () => {
    const req = new NextRequest("http://localhost/api/generate-latex-and-compile", {
      method: "POST",
      body: JSON.stringify({ projectId: "123e4567-e89b-12d3-a456-426614174000" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("should return 400 if validation fails (missing projectId)", async () => {
    const req = new NextRequest("http://localhost/api/generate-latex-and-compile", {
      method: "POST",
      body: JSON.stringify({ formData: defaultValues }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should dispatch to inngest and return 200 on success", async () => {
    // We add a valid name to basics to pass non-empty validation
    const validFormData = { ...defaultValues, basics: { ...defaultValues.basics, name: "John Doe", email: "john@example.com" }, education: [{ institute: "MIT", branch: "CS", startDate: "2020", endDate: "2024" }], experience: [{ company: "Google", role: "SWE", startDate: "2020", endDate: "2024", description: "Hello" }], projects: [{ name: "Project", startDate: "2020", endDate: "2024", description: "Hello" }], skills: [{ heading: "Languages", skills: "JS" }] };
    
    const req = new NextRequest("http://localhost/api/generate-latex-and-compile", {
      method: "POST",
      body: JSON.stringify({ 
        userData: validFormData, 
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        latexCode: "old latex code"
      }),
    });

    const response = await POST(req);
    
    // Verify that the background job was dispatched correctly
    expect(inngest.send).toHaveBeenCalledWith({
      name: "project.generate",
      data: { 
        userData: validFormData,
        latexCode: "old latex code",
        projectId: "123e4567-e89b-12d3-a456-426614174000" 
      },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

describe("Inngest Background Workflow: generateProjectFunction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide GROQ_API_KEY for the test
    process.env.GROQ_API_KEY = "test-sk-key";
  });

  it("should execute the full workflow successfully (fetch DB, AI generation, store updated latex, generate PDF, store PDF)", async () => {
    // 1. Setup mock returns
    const mockProjectId = "mock-uuid-123";
    const mockQuery = "Change job title to Senior Developer";
    const mockProjectLatexCode = { main: "Old content", header: "Old header" };
    const mockUpdatedLatexCode = { main: "New content", header: "New header" };
    const mockPdfBuffer = Buffer.from("fake-pdf-data");

    // Mock DB responses
    (prismaClient.project.findUnique as any)
      .mockResolvedValueOnce({
        id: mockProjectId,
        latex_code: mockProjectLatexCode,
      })
      .mockResolvedValueOnce({
        id: mockProjectId,
        latex_code: mockUpdatedLatexCode,
      });

    // Mock LangChain AI response
    const mockInvoke = vi.fn().mockResolvedValue(mockUpdatedLatexCode);
    const mockPipe2 = vi.fn().mockReturnValue({ invoke: mockInvoke });
    const mockPipe1 = vi.fn().mockReturnValue({ pipe: mockPipe2 });
    (PromptTemplate.fromTemplate as any).mockReturnValue({ pipe: mockPipe1 });

    // Mock PDF compilation
    (generatePDF as any).mockResolvedValue(mockPdfBuffer);

    // 2. Setup Inngest step mock
    const step = {
      run: vi.fn(async (stepId, callback) => {
        return await callback();
      })
    };

    // 3. Execute the function
    const handler = generateProjectFunction as any;
    const result = await handler({
      event: { data: { query: mockQuery, projectId: mockProjectId } },
      step
    });

    // 4. Assertions
    expect(result).toEqual({ success: true, projectId: mockProjectId });

    // Check step.run was called for all steps
    expect(step.run).toHaveBeenCalledWith("update-step-1", expect.any(Function));
    expect(step.run).toHaveBeenCalledWith("generate-ai-latex", expect.any(Function));
    expect(step.run).toHaveBeenCalledWith("generate-pdf", expect.any(Function));
    expect(step.run).toHaveBeenCalledWith("save-pdf-to-db", expect.any(Function));

    // Check latex compilation call
    expect(generatePDF).toHaveBeenCalledWith(mockUpdatedLatexCode, "pdflatex");

    // Check the final Prisma update was called with PDF blob
    expect(prismaClient.project.update).toHaveBeenCalledWith({
      where: { id: mockProjectId },
      data: { pdf: mockPdfBuffer, latex_code: mockUpdatedLatexCode },
    });
  });
});
