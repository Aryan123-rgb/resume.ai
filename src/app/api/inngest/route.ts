import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateProjectFunction } from "@/inngest/functions/generateProject";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateProjectFunction],
});
