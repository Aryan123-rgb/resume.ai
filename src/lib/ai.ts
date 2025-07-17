import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs/promises";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const response_model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export const getAIResponse = async (instructions: string) => {
    const template_path = path.join(process.cwd(), "templates", "resume.tex");
    const latex_template = await fs.readFile(template_path, "utf-8");

    const prompt = `You are a precise LaTeX code editor. Your task is to update specific personal information in a LaTeX resume template while preserving ALL other content, formatting, structure, and styling exactly as provided.

CRITICAL INSTRUCTIONS:
1. You MUST return the COMPLETE LaTeX document - do not truncate or summarize any part
2. You MUST preserve ALL existing formatting, spacing, indentation, and line breaks exactly as they appear
3. You MUST preserve ALL existing commands, packages, styling, and document structure
4. You MUST preserve ALL existing content except for the specific changes requested below
5. You MUST only modify the exact lines that contain the information being changed
6. Do NOT add any explanations, comments, or additional text outside the LaTeX code
7. Do NOT modify any other personal information, skills, experience, or content unless explicitly requested

SPECIFIC CHANGES TO MAKE:
${instructions}

WHAT TO PRESERVE:
- All document structure and LaTeX commands
- All formatting and styling
- All spacing and indentation
- All other contact information (phone, address, LinkedIn, etc.)
- All sections (Education, Experience, Skills, Projects, etc.)
- All content within those sections
- All dates, descriptions, and details
- All LaTeX packages and document setup

TEMPLATE PROCESSING RULES:
- If you see a name field like \\name{...}, replace only the content inside the braces
- If you see an email field like \\email{...}, replace only the content inside the braces
- If the name appears in a different format (like \\textbf{Name} or \\Large{Name}), replace only the name text
- If the email appears in a different format (like \\href{mailto:...} or plain text), replace only the email address
- Maintain the exact same LaTeX command structure around these fields

CURRENT LATEX TEMPLATE:
"""
${latex_template}
"""

Return ONLY the complete, updated LaTeX code with the specified changes. Ensure every single line from the original template is included in your response, with only the requested modifications applied.`;

    // Generate new LaTeX code
    const { response } = await response_model.generateContent(prompt);
    const responseText = response.text();

    console.log("response", response);
    console.log('response text', responseText);

    // const latexMatch = responseText.match(/```latex\s*([\s\S]*?)\s*```/);
    // const updatedLatex = latexMatch ? latexMatch[1].trim() : '';

    return responseText;
};
