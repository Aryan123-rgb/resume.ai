import { GET } from "./route";
import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";
import prismaClient from "@/lib/db";

// Mock prismaClient
vi.mock("@/lib/db", () => ({
  default: {
    project: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/get-project-by-id", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it("should return 400 if validation fails (invalid uuid)", async () => {
    const req = new NextRequest("http://localhost/api/get-project-by-id?projectId=invalid-uuid", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 404 if project is not found", async () => {
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/get-project-by-id?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("should return 200 and project if found", async () => {
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce({
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "user_123",
      name: "My Project",
    } as any);

    const req = new NextRequest("http://localhost/api/get-project-by-id?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.project.name).toBe("My Project");
  });
});
