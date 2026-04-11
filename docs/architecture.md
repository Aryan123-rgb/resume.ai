# Architecture Documentation

This document describes the core architecture of the application — covering the tech stack, server actions, data flow, and database schema.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | Frontend + server actions |
| Clerk | Authentication |
| Inngest | Background job orchestration |
| Groq + LangChain | LLM-based LaTeX generation |
| E2B Code Interpreter | Remote sandboxed LaTeX → PDF compilation |
| Neon Postgres + Prisma | Database and ORM |
| React Query | Client-side data fetching and caching |

---

## Database Schema

User data is managed externally via **Clerk**. The application owns a single primary model: `Project`.

### `Project`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String (UUID)` | Primary key, auto-generated |
| `userId` | `String` | Clerk user ID — owner of the project |
| `name` | `String` | Project display name |
| `description` | `String` | Short project description |
| `latex_code` | `Json` | Current LaTeX source stored as JSON |
| `pdf` | `Bytes?` | Compiled PDF binary (nullable until first compile) |
| `status` | `Status` | Workflow status (see enum below) |
| `compiler` | `Compiler` | LaTeX compiler to use (see enum below) |
| `basics` | `Json?` | Resume basics section (name, contact, etc.) |
| `education` | `Json?` | Education entries |
| `experience` | `Json?` | Work experience entries |
| `projectsData` | `Json?` | Projects section data |
| `skills` | `Json?` | Skills section data |
| `achievements` | `Json?` | Achievements section data |
| `createdAt` | `DateTime` | Auto-set on creation |
| `updatedAt` | `DateTime` | Auto-updated on every write |

### Enums

**`Status`**
| Value | Meaning |
|-------|---------|
| `pending` | Project created, no processing started |
| `Processing` | Background job is actively running |
| `Completed` | PDF successfully compiled and saved |
| `Failed` | Workflow encountered an error |

**`Compiler`**
| Value | Meaning |
|-------|---------|
| `xelatex` | XeLaTeX compiler (recommended for Unicode/font support) |
| `pdflatex` | Standard pdfLaTeX compiler |

> **Note:** User profile data (name, email, etc.) is not stored in this database — it is managed entirely by Clerk.

---

## Server Actions

All core backend operations are implemented as **Next.js Server Actions** in `src/action.ts`. This eliminates the need for traditional REST API routes for most operations — Clerk auth, Zod validation, and Prisma queries all run server-side without an HTTP round-trip.

The one remaining REST API route is `GET /api/get-project-pdf`, which serves binary PDF data that cannot be returned through a Server Action.

---

### `generateProjectAndCompileAction`

Triggers an async Inngest workflow to regenerate LaTeX from user data and compile it to PDF.

**Input**
```ts
{
  projectId: string; // UUID
  userData: ResumeSchema;
  latexCode: string;
}
```

**Returns**
```ts
{ success: true; workflowId: string }
```

**Architecture**

```
+------------------+        +------------------------------+        +-----------------+
|                  |        |                              |        |                 |
|     Client       +------->  generateProjectAndCompile   +------->   Inngest Trigger |
|                  |        |        Action               |        |                 |
| - projectId      |        |                              |        +-------+---------+
| - userData       |        |  1. Clerk auth               |                |
| - latexCode      |        |  2. Zod validate             |<-- workflowId -+
|                  |        |  3. inngest.send()           |
+------------------+        +------------------------------+
                                                                            |
                                          +---------------------------------+
                                          |
                              +-----------v-----------+
                              |                       |
                              |   STEP 1              |
                              |   AI Code Generation  |
                              |                       |
                              |  LangChain + Groq     |
                              |  (userData +          |
                              |   latexCode)          |
                              |        |              |
                              |        v              |
                              |  Returns updated      |
                              |  latexCode string     |
                              |                       |
                              +-----------+-----------+
                                          |
                                          | Step 1 complete
                                          |
                              +-----------v-----------+
                              |                       |
                              |   STEP 2              |
                              |   PDF Compilation     |
                              |                       |
                              |  E2B Sandbox          |
                              |  compiles LaTeX       |
                              |  (pdflatex)           |
                              |        |              |
                              |        v              |
                              |  Save PDF blob        |
                              |  + latexCode to DB    |
                              |  status = Completed   |
                              |                       |
                              +-----------------------+
```

**Inngest Steps**
1. **`update-step` (initial)** — Sets project `status` to `Processing`.
2. **`generate-ai-latex`** — Groq LLM (via LangChain) rewrites the LaTeX using `userData` and the existing `latexCode`. Returns the updated LaTeX string.
3. **`generate-and-save-pdf`** — Compiles the updated LaTeX inside an E2B sandbox using `pdflatex`. Saves both the compiled PDF binary and the new `latex_code` to the `Project` record.
4. **`update-step` (final)** — Sets project `status` to `Completed`.

**Future Improvements**
- **Server-side LaTeX retrieval:** `latexCode` is currently fetched on the client and passed in the request. Since `projectId` is already present, the server can fetch it directly from the database — removing the redundant data transfer.
- **Polling → SSE / Webhooks:** The client currently polls for completion. Switching to server-sent events (SSE) or webhook callbacks would eliminate unnecessary requests and reduce perceived latency.
- **E2B cold starts:** E2B sandboxes have a non-trivial warm-up cost. A pre-warmed sandbox pool would reduce Step 2 latency at scale.

---

### `createNewProject`

Creates a new project from a built-in template.

**Input**
```ts
{
  templateName: string;
  name: string;
  description?: string;
}
```

**Returns**
```ts
projectId: string // UUID of the newly created project
```

**Architecture**

```
+------------------+        +--------------------+        +----------------------+
|                  |        |                    |        |                      |
|     Client       +------->  createNewProject   +------->  Read from disk       |
|                  |        |    Action          |        |  /templates/         |
| - templateName   |        |                    |        |  {templateName}/     |
| - name           |        |  1. Clerk auth     |        |  main.tex + main.pdf |
| - description    |        |  2. Zod validate   |        |                      |
|                  |        |  3. fs.access()    |        +----------+-----------+
|                  |        |     guard          |                   |
|                  |        +--------------------+        +----------v-----------+
|                  |                                      |                      |
|                  |                                      |  prisma.project      |
|                  |                                      |  .create()           |
|                  |                                      |  status: Completed   |
|                  |<---------{ projectId } --------------+                      |
+------------------+                                     +----------------------+
```

**Notes**
- Reads `main.tex` and `main.pdf` from `/templates/{templateName}/` on disk and writes them to the database as the initial project state.
- An explicit `fs.access()` check is performed before reading — an invalid `templateName` throws an error that is surfaced to the client.
- The `status` is set to `Completed` on creation since the template PDF is pre-compiled.

**Future Improvements**
- **Async creation:** For larger templates, moving the DB write to a background job via Inngest would keep response times consistent.

---

### `getProjectById`

Fetches a project record by its ID (excludes the `pdf` binary field to avoid transferring large blobs).

**Input**
```ts
projectId: string // UUID
```

**Returns**
```ts
{
  id, userId, name, description, status, compiler,
  latex_code, createdAt, updatedAt,
  // Reshaped convenience field:
  userData: {
    basics, education, experience, projects, skills, achievements
  }
}
```

**Architecture**

```
+------------------+        +-----------------------------+        +-----------------+
|                  |        |                             |        |                 |
|     Client       +------->  getProjectById Action       +------->  Prisma Query    |
|                  |        |                             |        |  (Postgres)     |
| - projectId      |        |  1. Clerk auth              |        |  omit: { pdf }  |
|                  |        |  2. findUnique              |        |                 |
|                  |        |  3. reshape userData        |<-------+                 |
|                  |<-------+     field                   |        +-----------------+
+------------------+        +-----------------------------+
```

---

### `checkProjectStatus`

Returns the current `status` of a project. Called by the client on an interval to detect when a background job finishes.

**Input**
```ts
projectId: string
```

**Returns**
```ts
status: "pending" | "Processing" | "Completed" | "Failed"
```

**Future Improvements**
- **Replace polling with SSE:** A server-sent event stream would give instant feedback with zero wasted database reads.
- **Timeout handling:** There is no maximum retry limit on the client. A timeout after N attempts should surface an appropriate error to the user.
- **Granular status updates:** Status transitions could be extended to include intermediate states such as `GeneratingLatex` and `CompilingPDF` for finer-grained progress reporting.

---

### `syncUserData`

Persists the current form state (all resume sections) to the database without triggering a recompile. Called automatically as the user edits the form.

**Input**
```ts
projectId: string
userData: ResumeSchema
```

---

## REST API Routes

Only one traditional REST API route exists — used to serve binary PDF data, which cannot be returned via a Server Action.

### `GET /api/get-project-pdf`

Serves the compiled PDF binary for a project.

**Request**
```
GET /api/get-project-pdf?projectId={uuid}
```

**Response**

Returns the PDF file with `Content-Type: application/pdf`. Returns `404` if no compiled PDF exists yet.

**Architecture**

```
+------------------+        +-----------------------------+        +-----------------+
|                  |        |                             |        |                 |
|     Client       +------->  /api/get-project-pdf        +------->  Zod Validate    |
|  (iframe src)    |        |                             |        |  (UUID check)   |
| - projectId      |        +-----------------------------+        +--------+--------+
|   (query param)  |                                                        |
|                  |                                               +--------v--------+
|                  |                                               |                 |
|                  |                                               |  Prisma Query   |
|                  |                                               |  select: { pdf }|
|                  |<----------  PDF binary (application/pdf) ----+                 |
+------------------+                                              +-----------------+
```

---

## End-to-End Flow

```
User signs up / logs in
        │
        ▼ (Clerk authentication)
Dashboard — browse and create projects
        │
        ▼ createNewProject (Server Action)
Project created from template (LaTeX + PDF seeded from disk)
        │
        ▼ (redirect to editor)
Resume Editor page loads
        │
        ├── getProjectById (Server Action)  →  project metadata
        ├── GET /api/get-project-pdf        →  PDF rendered in <iframe>
        │
        ▼ (User fills form)
syncUserData (Server Action) — form state auto-persisted to DB
        │
        ▼ (User clicks "Compile")
generateProjectAndCompileAction (Server Action)
        │
        ├── Inngest Step 1: Groq rewrites LaTeX → saved to DB
        └── Inngest Step 2: E2B compiles LaTeX → PDF saved to DB
                │
                ▼ (client polls checkProjectStatus)
Project refetched → updated PDF rendered in editor
```

---