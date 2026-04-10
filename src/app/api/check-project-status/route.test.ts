import { GET } from "./route";
import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";
import prismaClient from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// Mock @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock prismaClient
vi.mock("@/lib/db", () => ({
  default: {
    project: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/check-project-status", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);

    const req = new NextRequest("http://localhost/api/check-project-status?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it("should return 400 if validation fails (invalid uuid)", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "mock-user-id" } as any);
    const req = new NextRequest("http://localhost/api/check-project-status?projectId=invalid-uuid", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 404 if project is not found", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "mock-user-id" } as any);
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/check-project-status?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 200 and project status if found", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "mock-user-id" } as any);
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce({
      status: "Completed",
    } as any);

    const req = new NextRequest("http://localhost/api/check-project-status?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.project.status).toBe("Completed");
  });
});
