# Database Architecture

This document dictates the core data schemas propelling `resume.ai`. It acts as a comprehensive reference for mapping API responses and designing queries.

## Infrastructure

- **System**: PostgreSQL (hosted on Serverless Neon instances providing rapid cold boot scalings).
- **ORM**: Prisma Client.
- **Blob Handling Strategy**: We sidestep heavy S3 SDK operations. Generated PDFs are ingested directly into PostgreSQL as robust `Bytes` columns (`bytea`), providing streamlined monolithic access tightly coupled with the Project entity.

---

## Schema Reference

The system centers on two deeply intertwined entities configured through a one-to-many relationship: `Project` and `Chat`.

### 1. Project Model (Formerly `Resume`) 

Acts as the atomic configuration core for everything from styling configurations to storing the raw generated LaTeX files. 

**Key Fields:**
- `id` (String | UUID): Primary execution map.
- `userId` (String): Identity context assigned exclusively from an external **Clerk** JWT token lookup. We omit internal user password tables.
- `latex_code` (Json):
    - *Architectural Shift:* Changed from `String` to `Json`.
    - By storing structured JSON mapped components (`{ "experience": "...latex string", "bio": "...latex string", "index": ["bio", "experience"], "main": "{{bio}} \n {{experience}}" }`), the LangChain model precisely modifies only targeted keys without disrupting the delicate core boilerplate `{{header}}` markup structures underlying the overarching layout format. 
    - This creates safer LLM prompt generation vectors. 
- `pdf` (Bytes?): The direct binary result parsed back from the remote E2B `pdflatex` code-interpreter execution. Passed directly via native NextJS Blob URL bridging. 
- `compiler` (Enum - `Compiler` `xelatex | pdflatex`): Defines remote execution bounds dynamically.

### 2. Chat Model

Secures full chronological LLM prompt histories to guarantee robust back-tracing arrays specifically correlated to incremental changes appended to the `latex_code` JSON target.

**Key Fields:**
- `id` (String | UUID)
- `projectId` (String): Replaces legacy `resumeId`. Formats the foreign key mapped directly with a Prisma `Cascade` condition (ensuring no orphaned chat records remain physically stranded post-deletion).
- `role` (Enum - `Role` `Human | Bot`): Identifies the source node in the pipeline tracking mapping format.
- `content` (String): Raw prompt queries (e.g. "Update my experience block to add NextJS 15 optimizations").

---

## System Transaction Safety
Modifications mapped specifically from the Inngest API queue adhere strictly to Prisma `$transaction` routines. 

A standard mutation lifecycle ensures:
1. `tx.project.update`: Intersects the actively stored `latex_code` mapping logic.
2. `tx.chat.createMany`: Dumps the Human execution string alongside the system's Bot acknowledgment.

**Why bundle this synchronously?** By forcing transaction rollbacks if partial interruptions hit, we permanently eradicate the potential for desynced `Chat` logs mapped incorrectly to stalled/broken `Project.latex_code` components. The UI timeline thus represents precisely one holistic source of truth forever.
