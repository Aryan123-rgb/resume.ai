import ResumeEditor from "./ResumeEditor";

type Params = Promise<{ resumeId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { resumeId } = await params;

  return <ResumeEditor resumeId={resumeId} />;
}
