# Backend Architecture Documentation

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | API routes |
| Inngest | Background job orchestration |
| Groq + LangChain | AI text generation + JSON parsing |
| E2B Code Interpreter | Remote sandbox for LaTeX → PDF compilation |
| Neon Postgres + Prisma | Database + ORM |

---

## API Routes

### `POST /api/generate-latex-and-compile`

Triggers an async Inngest workflow to regenerate LaTeX from user data and compile it to PDF.

**Request**
```json
{
  "projectId": "uuid",
  "userData": { ... },
  "latexCode": "..."
}
```

**Response**
```json
{ "success": true, "workflowId": "inngest-workflow-id" }
```

**Architecture**

```
+------------------+        +-----------------------------+        +-----------------+
|                  |        |                             |        |                 |
|     Client       +------->+  /api/generate-latex-and   +------->+    Inngest      |
|                  |        |        -compile             |        |    Trigger      |
| - projectId      |        |                             |        |                 |
| - userData       |        +-----------------------------+        +--------+--------+
| - latexCode      |                                                        |
|                  |<-----------------workflowId----------------------------+
+------------------+
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
                              |  Save new latexCode   |
                              |  to DB                |
                              |                       |
                              +-----------+-----------+
                                          |
                                          | Step 1 complete
                                          | Step 2 is independent
                                          |
                              +-----------v-----------+
                              |                       |
                              |   STEP 2              |
                              |   PDF Compilation     |
                              |                       |
                              |  Fetch latexCode      |
                              |  from DB              |
                              |        |              |
                              |        v              |
                              |  E2B Sandbox          |
                              |  compiles LaTeX       |
                              |        |              |
                              |        v              |
                              |  Save PDF blob        |
                              |  to DB                |
                              |                       |
                              +-----------------------+
```

This route is fully async — Inngest returns a `workflowId` immediately and the client polls it to track completion.

**Steps**
1. **AI Code Generation** — Groq LLM rewrites LaTeX using `userData` + `latexCode`. Saves result to DB.
2. **PDF Compilation** — Fetches updated LaTeX from DB, compiles via E2B sandbox, saves PDF blob to DB.
3. **DB Persistence** — Both steps write their outputs independently to the database.

**Tests** (`npm run test:api:generate`)
- Returns `400` for missing `projectId`, `userData`, or `latexCode`
- Returns `200` immediately after firing `inngest.send({ name: "project.generate", ... })` — does not block on the workflow

**Future Improvements**
- **Server-side LaTeX retrieval:** `latexCode` is currently fetched on the client and sent in the request body. Since `projectId` is already present, the API can fetch it directly from DB, eliminating the redundant transfer.
- **Polling → SSE / Webhooks:** Client currently polls Inngest for completion. Server-sent events or a webhook callback would reduce unnecessary requests and improve completion latency.
- **E2B cold starts:** E2B sandboxes have a warm-up cost. A warm sandbox pool would reduce Step 2 latency at scale.

---

### `GET /api/get-project-by-id`

Fetches project metadata by ID.

**Request**
```
GET /api/get-project-by-id?projectId={uuid}
```

**Response**
```json
{
  "success": true,
  "project": {
    "id": "...",
    "userId": "...",
    "name": "...",
    "description": "...",
    "pdf": "..."
  }
}
```

**Architecture**

```
+------------------+        +-----------------------------+        +-----------------+
|                  |        |                             |        |                 |
|     Client       +------->+   /api/get-project-by-id   +------->+  Zod Validate   |
|                  |        |                             |        |  (UUID check)   |
| - projectId      |        +-----------------------------+        +--------+--------+
|   (query param)  |                                                        |
|                  |                                               +--------v--------+
|                  |                                               |                 |
|                  |                                               |  Prisma Query   |
|                  |                                               |  (Postgres)     |
|                  |                                               |                 |
|                  |<----------{ project } or 404 ----------------+                 |
+------------------+                                              +-----------------+
```

**Notes**
- `projectId` is validated as a UUID via Zod before any DB query is made.

**Tests** (`npm run test:api:get-project`)
- Returns `400` for non-UUID or missing `projectId`
- Returns `404` if project doesn't exist
- Returns `200` with correct project schema on success

**Future Improvements**
- **Field selection:** Currently fetches all project columns. Adding Prisma `select` to return only what the client needs would reduce payload size.
- **Caching:** Frequently accessed projects could be cached (e.g. Redis) to avoid repeated DB reads, especially during polling.

---

### `POST /api/new-project`

Creates a new project from a built-in template.

**Request**
```json
{
  "templateName": "modern",
  "name": "My Resume",
  "description": "Optional"
}
```

**Response**
```json
{ "success": true, "message": "Project creation triggered asynchronously." }
```

**Architecture**

```
+------------------+        +--------------------+        +----------------------+
|                  |        |                    |        |                      |
|     Client       +------->+  /api/new-project  +------->+  Read from disk      |
|                  |        |                    |        |  /templates/         |
| - templateName   |        +--------------------+        |  {templateName}/     |
| - name           |                                      |  main.tex + main.pdf |
| - description    |                                      |                      |
|                  |                                      +----------+-----------+
|                  |                                                 |
|                  |                                      +----------v-----------+
|                  |                                      |                      |
|                  |                                      |  Save latexCode      |
|                  |                                      |  + PDF to DB         |
|                  |                                      |                      |
|                  |<---------{ success } ----------------+                      |
+------------------+                                     +----------------------+
```

**Notes**
- Reads `main.tex` and `main.pdf` from `/templates/{templateName}/` on disk and persists them to the database as the initial project state.

**Future Improvements**
- **Template validation:** No guard exists for invalid `templateName` values — a missing template directory would cause a silent failure. An explicit check with a `400` response would be safer.
- **Async creation:** For larger templates, moving the DB write to a background job (via Inngest) would keep the response time consistent with the rest of the API.

---

### `GET /api/check-project-status`

Polls the database until a project's status resolves to `success` or `failed`.

**Request**
```
GET /api/check-project-status?projectId={uuid}
```

**Response**
```json
{ "success": true, "project": { ... } }
```

**Architecture**

```
+------------------+        +------------------------------+        +-----------------+
|                  |        |                              |        |                 |
|     Client       +------->+  /api/check-project-status  |        |    Postgres     |
|                  |        |                              |        |    (Prisma)     |
| - projectId      |        |  polls DB every 5s           +------->+                 |
|   (query param)  |        |                              |        |  project.status |
|                  |        |  stops on "success"          |        |                 |
|                  |        |  or "failed"                 |<-------+                 |
|                  |<-------+                              |        +-----------------+
|  { project }     |        +------------------------------+
+------------------+
```

**Future Improvements**
- **Replace polling with SSE:** This endpoint exists solely to notify the client when a workflow finishes. A server-sent event stream would give instant feedback with zero wasted DB reads.
- **Timeout handling:** There's currently no max retry limit. A timeout after N attempts should return a `timeout` status to avoid indefinite polling.
- **Updates:** Add more comprehensive state updates like generating latex code, compiling pdf, saving to database etc...