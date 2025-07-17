import prismaClient from "@/lib/db";
import ResumeEditor from "./ResumeEditor";
import { notFound } from "next/navigation";

type Params = Promise<{ resumeId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { resumeId } = await params;

  const resume = await prismaClient.resume.findUnique({
    where: {
      id: resumeId,
    },
  });

  if (!resume) {
    return notFound();
  }

  return <ResumeEditor {...resume} />;
}
