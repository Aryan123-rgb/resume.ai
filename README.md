# resume.ai

An AI-powered resume builder that generates and compiles professional LaTeX resumes from structured user input — entirely in the browser.

---

## What it does

resume.ai lets you create a resume by filling out a form. Under the hood, a Groq LLM rewrites a LaTeX template using your data, compiles it to PDF inside a remote sandbox, and renders the result live in the editor — no local LaTeX installation required.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 (App Router) | Frontend + API routes |
| Clerk | Authentication |
| Inngest | Background job orchestration |
| Groq + LangChain | LLM-based LaTeX generation |
| E2B Code Interpreter | Remote sandboxed PDF compilation |
| Neon Postgres + Prisma | Database and ORM |
| React Query | Client-side data fetching and caching |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.dev) application
- A [Groq](https://console.groq.com) API key
- An [E2B](https://e2b.dev) API key
- An [Inngest](https://inngest.com) account (or local dev server)

### Installation

```bash
git clone https://github.com/your-username/resume.ai.git
cd resume.ai
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Groq
GROQ_API_KEY=

# E2B
E2B_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Locally

```bash
# Start the Next.js dev server
npm run dev

# In a separate terminal, start the Inngest dev server
npx inngest-cli@latest dev
```

The app will be available at `http://localhost:3000`.

---

## Architecture Overview

The core workflow is fully asynchronous:

```
User submits resume form
        │
        ▼
generateProjectAndCompileAction (Server Action)
        │
        ├── Inngest Step 1: Groq rewrites LaTeX → saved to DB
        └── Inngest Step 2: E2B compiles LaTeX → PDF saved to DB
                │
                ▼
Client polls checkProjectStatus → PDF rendered in editor
```

- **New projects** are seeded from pre-built templates on disk (`/templates/{name}/main.tex` + `main.pdf`).
- **Authentication** is handled entirely by Clerk — no user data is stored in the application database.
- **Project state** is tracked via a `status` field (`pending → Processing → Completed / Failed`).
- **Backend logic** lives in Next.js Server Actions (`src/action.ts`) — no traditional REST API routes except `GET /api/get-project-pdf` for binary PDF serving.

For full architecture documentation and data flow diagrams, see [`docs/architecture.md`](./docs/architecture.md).  
For open issues and contribution opportunities, see [`docs/contribution.md`](./docs/contribution.md).

---

## Contributing

Contributions are welcome. Please open an issue before submitting a pull request for significant changes. See [`docs/contribution.md`](./docs/contribution.md) for a list of known improvements and contribution guidelines.

---

## License

MIT