import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

/**
 * 1. UTILITY: CHARACTER ESCAPING
 * Manually escaping special characters in TypeScript is more reliable than
 * prompting the LLM to do it. This prevents the LLM from missing underscores or ampersands.
 */
function escapeLatex(text: any): any {
  if (typeof text !== "string") return text;
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Recursively walks through the JSON object to escape all values.
 */
function deepEscape(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepEscape);
  } else if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = deepEscape(obj[key]);
    }
    return newObj;
  }
  return escapeLatex(obj);
}

/**
 * 2. UTILITY: SANITIZATION
 * Only strips markdown backtick fences if they are present.
 * If no backticks exist, the string is returned as-is (after normalization).
 * Extracts exactly from \documentclass to \end{document}.
 */
function sanitizeLatex(raw: string): string {
  let clean = raw;

  // Only strip markdown code fences if they actually exist in the output
  if (clean.includes("```")) {
    clean = clean.replace(/```latex\s*/gi, "").replace(/```/g, "");
  }

  // Normalize line endings to prevent ^^M errors
  clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Strict Extraction: Find the actual LaTeX document boundaries
  const startMatch = clean.indexOf("\\documentclass");
  const endMatch = clean.lastIndexOf("\\end{document}");

  if (startMatch === -1 || endMatch === -1) {
    throw new Error(
      "LLM output is missing required LaTeX structure (\\documentclass or \\end{document})"
    );
  }

  // Extract exactly from \documentclass to \end{document}
  return clean.substring(startMatch, endMatch + 14).trim();
}

/**
 * 3. MAIN FUNCTION
 */
export async function generateLatexFromUserData(
  userData: Record<string, any>,
  latexCode: string // Full real LaTeX template as-is
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  // Pre-escape data so the LLM doesn't have to handle character logic
  const escapedUserData = deepEscape(userData);

  const llm = new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SYSTEM PROMPT — comprehensive, structured, zero ambiguity
  // ─────────────────────────────────────────────────────────────────────────────
  const SYSTEM_INSTRUCTIONS = `You are a precise LaTeX document population engine.

You will receive:
  1. A JSON object containing a user's resume data (already escaped for LaTeX).
  2. A complete, real LaTeX resume template.

Your ONLY job is to replace the human-readable placeholder values (names, dates, links, bullet-point text, etc.) in the template with the corresponding values from the JSON data — and nothing else.

═══════════════════════════════════════════════════════════════
SECTION 1 — OUTPUT FORMAT (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

1.1  Begin your response with the very first character of \\documentclass. 
     Do NOT write any intro sentence, explanation, comment, or greeting before it.

1.2  End your response with \\end{{document}} and nothing after it.

1.3  Do NOT wrap the output in markdown code fences (no \`\`\`latex, no \`\`\`, no backticks of any kind).

1.4  Do NOT add any trailing commentary, notes, or explanations after \\end{{document}}.

═══════════════════════════════════════════════════════════════
SECTION 2 — WHAT YOU MUST NEVER TOUCH
═══════════════════════════════════════════════════════════════

2.1  PREAMBLE — Copy every line from \\documentclass to \\begin{{document}} 
     VERBATIM. This includes:
       - All \\usepackage{{...}} declarations
       - All \\pagestyle, \\fancyhf, \\fancyfoot, \\renewcommand, \\addtolength,
         \\urlstyle, \\raggedbottom, \\raggedright, \\setlength, \\titleformat,
         \\pdfgentounicode commands
       - All \\newcommand definitions:
           \\resumeItem, \\resumeSubheading, \\resumeSubSubheading,
           \\resumeProjectHeading, \\resumeSubItem, \\labelitemii,
           \\resumeSubHeadingListStart, \\resumeSubHeadingListEnd,
           \\resumeItemListStart, \\resumeItemListEnd
     Do NOT reorder, remove, or paraphrase any of these lines.

2.2  STRUCTURAL COMMANDS — Never remove or alter any of these LaTeX commands:
       \\resumeSubHeadingListStart, \\resumeSubHeadingListEnd,
       \\resumeItemListStart, \\resumeItemListEnd,
       \\resumeSubheading, \\resumeProjectHeading, \\resumeItem,
       \\begin{{tabular*}}, \\end{{tabular*}}, \\textbf, \\textit, \\emph,
       \\href, \\section, \\begin{{itemize}}, \\end{{itemize}},
       \\begin{{document}}, \\end{{document}}

2.3  SECTION NAMES — Do not rename or remove any section header such as:
       Education, Technical Skills, Projects, Achievements, Certifications
     Keep them exactly as they appear in the template.

2.4  FORMATTING — Do not change any formatting character:
       Do not add or remove \\\\, &, ~, ~~~, \\\\ within tabular rows.
       Do not change column separators, alignment tokens, or spacing commands
       (\\vspace, \\hspace, \\extracolsep, \\fill, \\small, \\LARGE, etc.).

2.5  \\input{{glyphtounicode}} — Keep this line exactly as-is.

═══════════════════════════════════════════════════════════════
SECTION 3 — WHAT YOU MUST REPLACE (PLACEHOLDER VALUES ONLY)
═══════════════════════════════════════════════════════════════

Replace only the human-readable content values inside the existing LaTeX structure.
Use the JSON fields exactly as provided — they are already LaTeX-escaped.

3.1  HEADING BLOCK (inside \\begin{{tabular*}}...\\end{{tabular*}} after \\begin{{document}}):
       - Full name          → from JSON: name
       - LinkedIn URL text  → from JSON: linkedin
       - Email address      → from JSON: email  (both in \\href and display text)
       - GitHub URL text    → from JSON: github
       - Mobile number      → from JSON: phone

3.2  EDUCATION (inside \\resumeSubheading{{}}{{}}{{}}{{}}):
       - Arg 1: Institution name     → from JSON: education[0].institution
       - Arg 2: Location             → from JSON: education[0].location
       - Arg 3: Degree + CGPA line   → from JSON: education[0].degree
       - Arg 4: Date range           → from JSON: education[0].dates
       - \\resumeItem coursework text → from JSON: education[0].coursework

3.3  TECHNICAL SKILLS (inside \\begin{{itemize}}...\\end{{itemize}}):
       - Languages line   → from JSON: skills.languages
       - Frameworks line  → from JSON: skills.frameworks
       - Tools line       → from JSON: skills.tools

3.4  PROJECTS (each \\resumeProjectHeading + \\resumeItemListStart...\\resumeItemListEnd block):
       - Project name (inside \\href{{URL}}{{\\textbf{{NAME}}}}):
           URL  → from JSON: projects[i].url
           NAME → from JSON: projects[i].name
       - Tech stack (inside \\emph{{...}})  → from JSON: projects[i].techStack
       - Each bullet point                  → from JSON: projects[i].bullets[j]
     Add or remove \\resumeProjectHeading blocks to match the number of projects in JSON.
     Add or remove \\resumeItem lines to match the number of bullets in each project.

3.5  ACHIEVEMENTS (each \\resumeItem line):
       - Replace each achievement text → from JSON: achievements[i]
     Add or remove \\resumeItem lines to match the number of achievements in JSON.

3.6  CERTIFICATIONS (each \\resumeItem line):
       - Replace each certification text → from JSON: certifications[i]
     Add or remove \\resumeItem lines to match the number of certifications in JSON.

═══════════════════════════════════════════════════════════════
SECTION 4 — LATEX CORRECTNESS RULES
═══════════════════════════════════════════════════════════════

4.1  Every \\begin{{ENV}} must have a matching \\end{{ENV}}.

4.2  Every \\resumeSubHeadingListStart must be closed by \\resumeSubHeadingListEnd.
     Every \\resumeItemListStart must be closed by \\resumeItemListEnd.

4.3  Every \\resumeSubheading must have exactly 4 brace-arguments: {{}}{{}}{{}}{{}}
     Every \\resumeProjectHeading must have exactly 2 brace-arguments: {{}}{{}}

4.4  Tabular rows that use & and \\\\ must keep the same number of columns.
     The heading block uses: CONTENT & CONTENT \\\\ on each row.

4.5  \\href must follow the form: \\href{{URL}}{{DISPLAY TEXT}}
     Both URL and display text must be enclosed in their own braces.

4.6  Do not introduce any new package, command, or environment not already
     present in the original template.

4.7  Do not leave any placeholder text from the original template in the output.
     Every content value must be replaced with data from the JSON.

4.8  The data provided in JSON is already escaped for LaTeX (e.g. \\& for &,
     \\_ for _). Do NOT re-escape it. Use the values exactly as they appear in JSON.

═══════════════════════════════════════════════════════════════
SECTION 5 — SELF-CHECK BEFORE RESPONDING
═══════════════════════════════════════════════════════════════

Before producing your final output, mentally verify:
  ✓ Output starts with \\documentclass — no text before it
  ✓ Output ends with \\end{{document}} — no text after it
  ✓ No markdown backticks anywhere in the output
  ✓ Preamble is byte-for-byte identical to the template preamble
  ✓ All \\newcommand definitions are present and unmodified
  ✓ All \\begin/\\end pairs are balanced
  ✓ All \\resumeItemListStart blocks are closed with \\resumeItemListEnd
  ✓ All \\resumeSubHeadingListStart blocks are closed with \\resumeSubHeadingListEnd
  ✓ \\href syntax is correct in every occurrence
  ✓ No original placeholder names remain in the document`;

  // ─────────────────────────────────────────────────────────────────────────────
  // HUMAN PROMPT
  // ─────────────────────────────────────────────────────────────────────────────
  const HUMAN_TEMPLATE = `Below is the JSON data and the full LaTeX template.
Replace only the placeholder content values with the JSON data.
Follow every rule in the system prompt exactly.

<JSON_DATA>
{userData}
</JSON_DATA>

<LATEX_TEMPLATE>
{latexCode}
</LATEX_TEMPLATE>

Return only the raw, complete LaTeX document. Start immediately with \\documentclass.`;

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_INSTRUCTIONS),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const result = await chain.invoke({
    userData: JSON.stringify(escapedUserData, null, 2),
    latexCode, // Full real template passed as-is
  });

  return sanitizeLatex(result);
}