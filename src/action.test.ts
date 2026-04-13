import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkProjectStatus,
  createNewProject,
  syncUserData,
  getProjectById,
  generateProjectAndCompileAction,
} from "./action";

// Mock @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";

// Mock @/lib/db
vi.mock("@/lib/db", () => ({
  default: {
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prismaClient from "@/lib/db";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}));

import fs from "fs/promises";

// Mock inngest
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: vi.fn(),
  },
}));

import { inngest } from "@/inngest/client";

describe("Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkProjectStatus", () => {
    it("throws Unauthorized if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      await expect(checkProjectStatus("some-id")).rejects.toThrow("Unauthorized");
    });

    it("throws error if project is not found", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(prismaClient.project.findUnique).mockResolvedValue(null);
      
      await expect(checkProjectStatus("some-id")).rejects.toThrow("Project not found");
    });

    it("returns project status successfully", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(prismaClient.project.findUnique).mockResolvedValue({ status: "Completed" } as any);
      
      const status = await checkProjectStatus("some-id");
      expect(status).toBe("Completed");
    });
  });

  describe("createNewProject", () => {
    const payload = {
      templateName: "modern",
      name: "My Resume",
      description: "A modern resume",
    };

    it("throws Unauthorized if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      await expect(createNewProject(payload)).rejects.toThrow("Unauthorized");
    });

    it("throws error if template name is invalid or not found", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(fs.access).mockRejectedValue(new Error("Not found"));
      
      await expect(createNewProject(payload)).rejects.toThrow("Invalid template name or template not found");
    });

    it("creates project successfully", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(fs.access).mockResolvedValue(undefined as any);
      vi.mocked(fs.readFile).mockResolvedValueOnce("latex content" as any); // main.tex
      vi.mocked(fs.readFile).mockResolvedValueOnce(Buffer.from("pdf content") as any); // main.pdf
      vi.mocked(prismaClient.project.create).mockResolvedValue({ id: "proj_123" } as any);
      
      const result = await createNewProject(payload);
      
      expect(result).toBe("proj_123");
      expect(prismaClient.project.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          name: payload.name,
          description: payload.description,
          latex_code: "latex content",
          pdf: Buffer.from("pdf content"),
          status: "Completed",
          compiler: "pdflatex",
        },
      });
    });
  });

  describe("syncUserData", () => {
    const userData = {
      basics: { name: "John Doe", email: "john@example.com", phone: "", location: "", website: "" },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      achievements: { achievements: "" },
    };

    it("throws Unauthorized if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      await expect(syncUserData("proj_123", userData)).rejects.toThrow("Unauthorized");
    });

    it("updates project and syncs user data successfully", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(prismaClient.project.update).mockResolvedValue({} as any);

      await syncUserData("proj_123", userData);

      expect(prismaClient.project.update).toHaveBeenCalledWith({
        where: { id: "proj_123" },
        data: expect.objectContaining({
          basics: expect.objectContaining({
            name: "John Doe",
            email: "john@example.com",
          }),
        }),
      });
    });
  });

  describe("getProjectById", () => {
    it("throws Unauthorized if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      await expect(getProjectById("some-id")).rejects.toThrow("Unexpected error occured");
    });

    it("throws Project Not Found if project does not exist", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(prismaClient.project.findUnique).mockResolvedValue(null);

      await expect(getProjectById("some-id")).rejects.toThrow("Unexpected error occured");
    });

    it("returns reshaped project successfully", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(prismaClient.project.findUnique).mockResolvedValue({
        id: "some-id",
        basics: { name: "John" },
      } as any);

      const result = await getProjectById("some-id") as {
        id: string;
        userData: {
          basics: unknown;
          education: unknown[];
          experience: unknown[];
          projects: unknown[];
          skills: unknown[];
          achievements: unknown;
        };
      };
      expect(result.id).toBe("some-id");
      expect((result.userData.basics as { name?: string })?.name).toBe("John");
      expect(result.userData.education).toEqual([]);
    });
  });

  describe("generateProjectAndCompileAction", () => {
    const payload = {
      userData: {
        basics: { name: "John Doe", email: "john@example.com", phone: "", location: "", website: "" },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        achievements: { achievements: "" },
      },
      projectId: "123e4567-e89b-12d3-a456-426614174000",
      latexCode: "some latex code"
    };

    it("throws Unauthorized if user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      await expect(generateProjectAndCompileAction(payload)).rejects.toThrow("Unauthorized");
    });

    it("sends workflow to inngest successfully", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
      vi.mocked(inngest.send).mockResolvedValue({ ids: ["workflow_123"] } as any);

      const result = await generateProjectAndCompileAction(payload);
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: "project.generate",
        data: expect.objectContaining({
          projectId: payload.projectId,
        }),
      });
      expect(result.success).toBe(true);
    });
  });
});
