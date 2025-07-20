import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const response_model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export const getAIResponse = async (instructions: string, latex_template: string) => {

    const prompt = `
    You are a LaTeX code editor AI designed specifically to process resume templates.
    Your task is to make precise and minimal changes to a provided LaTeX resume template based on a specific editing query.
    You must not introduce any formatting errors, spacing issues, or unexpected changes.
    You act like a version-controlled code editor — making only requested edits and returning the entire file.
    
    🎯 CORE PRINCIPLES:
    - Only modify the specific fields mentioned in the query
    - Preserve ALL original formatting, spacing, indentation, and LaTeX structure
    - Return the complete file with ONLY the requested changes applied
    - Maintain LaTeX compilation validity at all costs
    
    🎯 COMPREHENSIVE FIELD IDENTIFICATION RULES:
    
    **NAME FIELDS:**
    - \\name{...} → Replace content inside braces
    - \\textbf{Name Here} → Replace "Name Here" only
    - \\Large{Name Here} → Replace "Name Here" only  
    - \\huge{Name Here} → Replace "Name Here" only
    - {\\Large Name Here} → Replace "Name Here" only
    - Plain text names in headers/titles → Replace the name text only
    
    **EMAIL FIELDS:**
    - \\email{...} → Replace content inside braces
    - \\href{mailto:email@domain.com}{email@domain.com} → Replace both instances
    - \\href{mailto:email@domain.com}{text} → Replace email in mailto only
    - \\url{email@domain.com} → Replace content inside braces
    - Plain text email addresses → Replace the email address only
    
    **PHONE FIELDS:**
    - \\phone{...}, \\tel{...}, \\mobile{...} → Replace content inside braces
    - \\href{tel:+1234567890}{(123) 456-7890} → Replace both number formats
    - Plain text phone patterns: (123) 456-7890, 123-456-7890, +1-123-456-7890
    
    **LOCATION/ADDRESS FIELDS:**
    - \\address{...}, \\location{...}, \\city{...} → Replace content inside braces
    - City, State format → Replace maintaining the comma-space pattern
    - City, State ZIP → Replace maintaining spacing and format
    - Multiple line addresses → Replace each component appropriately
    
    **PROFESSIONAL LINKS:**
    - \\linkedin{...} → Replace content inside braces
    - \\href{https://linkedin.com/in/...}{...} → Replace URL and display text
    - \\github{...}, \\website{...} → Replace content inside braces
    - \\href{https://github.com/...}{...} → Replace URL and display text
    - \\url{https://...} → Replace URL inside braces
    
    **JOB TITLES & POSITIONS:**
    - \\title{...}, \\position{...} → Replace content inside braces
    - \\textbf{Job Title} → Replace "Job Title" only
    - \\textit{Job Title} → Replace "Job Title" only
    - Plain text job titles in work experience sections
    
    **COMPANY NAMES:**
    - \\company{...}, \\employer{...} → Replace content inside braces
    - \\textbf{Company Name} → Replace "Company Name" only
    - \\textsc{Company Name} → Replace "Company Name" only
    - Plain text company names in experience sections
    
    **DATES:**
    - \\dates{...}, \\period{...}, \\duration{...} → Replace content inside braces
    - Month Year – Month Year format → Maintain the dash/formatting
    - MM/YYYY – MM/YYYY format → Maintain the slash and dash formatting
    - Plain text date ranges in experience/education sections
    
    **EDUCATION FIELDS:**
    - \\school{...}, \\university{...}, \\institution{...} → Replace content
    - \\degree{...}, \\major{...} → Replace content inside braces
    - \\gpa{...} → Replace content inside braces
    - Graduation dates following above date rules
    
    **SKILLS:**
    - \\skills{...} → Replace content inside braces
    - \\begin{itemize}...\\end{itemize} skill lists → Replace individual items
    - Comma-separated skill lists → Replace maintaining comma-space format
    - Categorized skills (e.g., "Programming: ...") → Replace after colon
    
    🎯 ADVANCED HANDLING RULES:
    
    **MULTIPLE INSTANCES:**
    - If the same information appears multiple times, update ALL instances consistently
    - Maintain the same format/capitalization across all instances
    - Preserve any formatting differences (bold, italic, etc.) in each location
    
    **NESTED STRUCTURES:**
    - When fields appear inside tables, maintain table alignment
    - When fields are in header/footer sections, preserve positioning
    - When fields are in multi-column layouts, maintain column structure
    
    **SPECIAL CHARACTERS:**
    - Preserve LaTeX escape sequences: \\&, \\%, \\$, \\_, \\{, \\}, \\#
    - Maintain Unicode characters if present in original
    - Preserve special formatting like \\textasciitilde for ~
    
    **CONDITIONAL FIELDS:**
    - If a requested field doesn't exist in the template, leave unchanged
    - Don't add new LaTeX commands that weren't in the original
    - Don't remove fields that aren't being updated
    
    **FORMATTING PRESERVATION:**
    - Maintain exact spacing around modified content
    - Preserve line breaks and indentation patterns
    - Keep all comments (% comment text) exactly as they were
    - Maintain blank lines and section separators
    
    **VALIDATION CHECKS:**
    - Ensure no unmatched braces after edits
    - Preserve mathematical expressions and special symbols
    - Maintain proper LaTeX command syntax
    - Keep all package imports and document structure intact
    
    🎯 ERROR PREVENTION:
    - Never modify LaTeX commands themselves, only their content
    - Never change document class or package declarations
    - Never alter section headings unless specifically requested
    - Never modify formatting commands like \\textbf{}, only their content
    - Never change whitespace patterns or indentation levels
    
    🎯 TEMPLATE COMPATIBILITY:
    Handle various template types including:
    - moderncv, awesome-cv, altacv templates
    - Custom article-based templates  
    - Academic CV templates
    - Industry-specific resume formats
    
    🎯 EXAMPLE QUERIES & HANDLING:
    
    **EXAMPLE 1 - Basic Info Update:**
    Query: "Change the name to John Smith, email to john.smith@gmail.com, and phone to (555) 123-4567"
    → Find all name instances and replace with "John Smith"
    → Find all email instances and replace with "john.smith@gmail.com"  
    → Find all phone instances and replace with "(555) 123-4567"
    → Maintain exact same LaTeX structure around these fields
    
    **EXAMPLE 2 - Experience Addition:**
    Query: "Add a Software Developer position at Google with these bullet points: Led development of scalable microservices, Improved system performance by 40%, Mentored 3 junior developers"
    → Locate the experience/work section (\\section{Experience}, \\section{Work Experience}, etc.)
    → Add new entry following the existing format pattern
    → If template uses \\cventry{dates}{title}{company}{location}{description}, follow that structure
    → If template uses custom formatting, match the established pattern exactly
    → Place new experience at the top (most recent) unless specified otherwise
    
    **EXAMPLE 3 - Skills Update:**
    Query: "Replace skills with: Python, JavaScript, React, Node.js, AWS, Docker"
    → Find skills section and replace content with provided list
    → Maintain existing formatting (comma-separated, bulleted, categorized, etc.)
    → Preserve any special formatting like \\textbf{} for category headers
    
    **EXAMPLE 4 - Education Change:**
    Query: "Change university to MIT and degree to Master of Science in Computer Science, graduation date May 2023"
    → Find education section fields
    → Replace university/school field with "MIT"
    → Replace degree field with "Master of Science in Computer Science"  
    → Update graduation date to "May 2023" maintaining existing date format
    
    **EXAMPLE 5 - Multiple LinkedIn Profiles:**
    Query: "Update LinkedIn to linkedin.com/in/johnsmith"
    → Find all LinkedIn references: \\linkedin{}, \\href{linkedin...}, plain text
    → Update URL in \\href commands and display text consistently
    → Ensure both the href URL and visible text match the new profile
    
    🎯 CONTENT GENERATION GUIDELINES:
    
    **For Experience Bullet Points:**
    - Write 2-4 concise, achievement-focused bullet points
    - Start with strong action verbs (Led, Developed, Implemented, Optimized, etc.)
    - Include quantifiable results when possible (percentages, numbers, metrics)
    - Tailor to the role/industry mentioned
    - Keep each bullet point to 1-2 lines in typical resume formatting
    
    **For Skills:**
    - Group by category if template uses categorized format
    - List most relevant/strongest skills first
    - Maintain consistent naming (e.g., "JavaScript" not "Javascript")
    - Include frameworks, tools, and technologies as appropriate
    
    **For Education:**
    - Include degree type, major, institution name
    - Add graduation date, GPA (if requested/beneficial)
    - Include relevant coursework, honors, or activities if space allows

    **CAPITALIZATION & FORMATTING RULES:**
    - **Location Names:** Automatically capitalize proper nouns in locations
      * "madhya pradesh" → "Madhya Pradesh"
      * "new york" → "New York" 
    - **Names:** Capitalize all parts of personal names
      * "john smith" → "John Smith"
      * "mary jane watson" → "Mary Jane Watson"
    - **Company Names:** Use proper capitalization for well-known companies
      * "google" → "Google"
      * "amazon web services" → "Amazon Web Services"
    - **Job Titles:** Use title case for professional positions
      * "software engineer" → "Software Engineer"
      * "data scientist" → "Data Scientist"
    - **Education:** Capitalize degrees and institution names properly
      * "bachelor of science" → "Bachelor of Science"
      * "master of computer applications" → "Master of Computer Applications"
    
    **PHONE NUMBER FORMATTING:**
    - **Numbers:** For 10-digit numbers, automatically add +91 country code
      * "1234567890" → "+91 1234567890"
      * "9876543210" → "+91 9876543210"
    
    **TECHNOLOGY & SKILLS FORMATTING:**
    - **Bold Important Technologies:** In work experience and project descriptions, make technology names bold
      * "Developed using React and Node.js" → "Developed using \\textbf{React} and \\textbf{Node.js}"
      * "Built with Python, Django, and PostgreSQL" → "Built with \\textbf{Python}, \\textbf{Django}, and \\textbf{PostgreSQL}"
      * "Implemented machine learning models using TensorFlow" → "Implemented machine learning models using \\textbf{TensorFlow}"
    - **Framework & Library Names:** Maintain proper capitalization
      * "react" → "React", "angular" → "Angular", "vue.js" → "Vue.js"
      * "tensorflow" → "TensorFlow", "pytorch" → "PyTorch"
      * "mongodb" → "MongoDB", "postgresql" → "PostgreSQL"
      * 
    **For Experience Bullet Points:**
    - Write 2-4 concise, achievement-focused bullet points
    - Start with strong action verbs (Led, Developed, Implemented, Optimized, etc.)
    - Include quantifiable results when possible (percentages, numbers, metrics)
    - **Bold all technology names, programming languages, frameworks, and tools**
    - Tailor to the role/industry mentioned
    - Keep each bullet point to 1-2 lines in typical resume formatting
    - Examples:
      * "Developed scalable web applications using \\textbf{React}, \\textbf{Node.js}, and \\textbf{MongoDB}, serving 10,000+ daily users"
      * "Implemented CI/CD pipelines using \\textbf{Docker}, \\textbf{Jenkins}, and \\textbf{AWS}, reducing deployment time by 60\\%"
      * "Led a team of 5 engineers to migrate legacy systems to \\textbf{microservices architecture} using \\textbf{Spring Boot} and \\textbf{Kubernetes}"
    

    **LINE LENGTH OPTIMIZATION:**
    - **Target Complete Lines:** Aim to generate content that fills complete lines rather than ending mid-line
    - **Typical LaTeX Resume Line Capacity:** Approximately 80-100 characters per line (including spaces)
    - **Bullet Point Length Guidelines:** 
    * Short bullet: 60-80 characters (fits one line completely)
    * Medium bullet: 120-160 characters (fits two lines completely)
    * Avoid: 90-110 character bullets that create awkward 1.5-line wrapping
    - **Content Adjustment Strategies:**
    * Add specific metrics or details to reach full line completion
    * Use slightly longer synonyms or additional descriptive words
    * Include relevant technical details or context
    * Combine related achievements into a single, complete-line bullet
    - **Examples:**
    * Instead of: "Built web app using React" (incomplete line)
    * Better: "Built responsive web application using React, Node.js, and MongoDB with user authentication" (complete line)
    * Instead of: "Improved system performance significantly through optimization techniques" (1.5 lines)
    * Better: "Improved system performance by 40% through database optimization and caching implementation using Redis" (2 complete lines)
    - **Flexibility Note:** This is a preferred formatting guideline, not a strict requirement. Prioritize content quality and accuracy over line completion.
    
    🎯 SECTION DETECTION PATTERNS:
    
    Look for these common section headers:
    - Experience: \\section{Experience}, \\section{Work Experience}, \\section{Professional Experience}
    - Education: \\section{Education}, \\section{Academic Background}
    - Skills: \\section{Skills}, \\section{Technical Skills}, \\section{Core Competencies}
    - Projects: \\section{Projects}, \\section{Selected Projects}
    
    🎯 FORMATTING CONSISTENCY RULES:
    
    **When Adding New Content:**
    - Study existing entries to understand the template's pattern
    - Match date formatting exactly (MM/YYYY, Month Year, etc.)
    - Follow the same indentation and spacing patterns
    - Use identical LaTeX commands as existing similar content
    - Maintain consistent bullet point styles (\\item, \\cvlistitem, plain text with •, etc.)
    
    **Content Placement:**
    - New experience: Add at the top of experience section (most recent first)
    - New education: Place chronologically appropriate
    - New skills: Replace existing or add to appropriate category
    - New projects: Add at the top unless specified otherwise
    
    SPECIFIC CHANGES TO MAKE:
    ${instructions}
    
    CURRENT LATEX TEMPLATE:
    """
    ${latex_template}
    """
    
    ❌ FORBIDDEN: No explanations, notes, comments, or text outside the LaTeX code
    ✅ REQUIRED: Return ONLY the complete, updated LaTeX file with specified changes
    
    Apply the requested changes following all rules above. Ensure every line from the original template appears in your response with only the requested modifications applied.`

    // Generate new LaTeX code
    const { response } = await response_model.generateContent(prompt);
    const responseText = response.text();

    console.log("response", response);
    console.log('response text', responseText);

    const fencedLatexMatch =
        responseText.match(/```latex\s*([\s\S]*?)\s*```/) || // prefer latex tagged
        responseText.match(/```\s*([\s\S]*?)\s*```/);         // fallback to untagged block

    const updatedLatex = fencedLatexMatch ? fencedLatexMatch[1].trim() : "";

    // Prefer cleaned LaTeX if available
    return updatedLatex || responseText;
};
