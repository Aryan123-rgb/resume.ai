import prismaClient from "@/lib/db";
import ResumeEditor from "./ResumeEditor";
import { notFound } from "next/navigation";

type Params = Promise<{ resumeId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { resumeId } = await params;

  return <ResumeEditor resumeId={resumeId} />;
}
