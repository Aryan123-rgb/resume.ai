import { GET } from "./route";
import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";
import prismaClient from "@/lib/db";

vi.mock("@/lib/db", () => ({
  default: {
    project: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/get-project-pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when the project or PDF is missing", async () => {
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/get-project-pdf?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);

    expect(response.status).toBe(404);
  });

  it("streams the PDF when the project exists", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4\n%dummy pdf data\n");
    vi.mocked(prismaClient.project.findUnique).mockResolvedValueOnce({
      pdf: pdfBuffer,
    } as any);

    const req = new NextRequest("http://localhost/api/get-project-pdf?projectId=123e4567-e89b-12d3-a456-426614174000", {
      method: "GET",
    });

    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe("inline; filename=resume.pdf");
    const body = await response.arrayBuffer();
    expect(Buffer.from(body)).toEqual(pdfBuffer);
  });
});
