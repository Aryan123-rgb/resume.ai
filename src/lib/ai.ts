import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const PROMPT_TEMPLATE = `
You are an expert LaTeX resume editor and formatter.
The user has provided their resume data as a structured JSON object and the current LaTeX template.

YOUR TASK:
Using the provided userData, populate the LaTeX template and return a complete, valid LaTeX document.
Return ONLY the raw LaTeX code. Do not wrap it in markdown, code blocks, or any other formatting.
Preserve all original LaTeX commands and structure. Keep valid LaTeX syntax throughout.

USER DATA:
{userData}

CURRENT LATEX TEMPLATE:
{latexCode}
`;

export async function generateLatexFromUserData(
  userData: Record<string, any>,
  latexCode: string
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const llm = new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  });

  const parser = new StringOutputParser();

  const promptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

  const chain = promptTemplate.pipe(llm).pipe(parser);

  const result = await chain.invoke({
    userData: JSON.stringify(userData, null, 2),
    latexCode,
  });

  return result;
}