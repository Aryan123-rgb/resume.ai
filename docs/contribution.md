# Contribution Guide

Thank you for your interest in contributing. This document outlines known areas for improvement, open tasks, and guidelines for submitting contributions.

---

## Known Issues & Planned Improvements

### 1. Server-side LaTeX Retrieval
**Location:** `generateProjectAndCompileAction` (Server Action)

`latexCode` is currently fetched on the client and sent with the action payload. Since `projectId` is already included, the server can retrieve it directly from the database — removing the redundant client-to-server data transfer.

**Suggested approach:** Remove `latexCode` from the payload and fetch it inside the Server Action using `projectId` before triggering the Inngest workflow.

---

### 2. Replace Polling with SSE or Webhooks
**Location:** `checkProjectStatus` (Server Action)

The client polls this action on an interval to detect when a background job finishes. This generates unnecessary database reads and adds latency between completion and client notification.

**Suggested approach:** Replace the polling mechanism with a Server-Sent Events (SSE) stream or a webhook callback so the client is notified immediately when the workflow resolves.

---

### 3. E2B Sandbox Cold Starts
**Location:** Inngest Step 2 — PDF Compilation

E2B sandboxes incur a warm-up cost on each invocation. At scale, this adds meaningful latency to every compilation step.

**Suggested approach:** Maintain a pool of pre-warmed E2B sandboxes to reduce Step 2 startup time. Alternatively, investigate E2B's sandbox reuse options if supported.

---


### 4. Template Validation on Project Creation
**Location:** `createNewProject` (Server Action)

Although an `fs.access()` check now guards against missing template directories, there is no explicit allowlist to prevent typos in `templateName` from causing unexpected errors.

**Suggested approach:** Maintain an explicit allowlist of valid template names. Return a clear error message if the provided name is not in the list.

---

### 5. Polling Timeout Handling
**Location:** `checkProjectStatus` (Server Action)

The polling loop has no maximum retry limit. If a background job stalls or fails silently, the client will poll indefinitely.

**Suggested approach:** Add a timeout after N attempts (e.g. 20 retries × 5s = ~100s) and surface a `timeout` error so the client can show an appropriate message to the user.

---

### 6. Granular Workflow Status Updates
**Location:** Inngest workflow + `Status` enum

The current `Status` enum only covers `pending`, `Processing`, `Completed`, and `Failed`. There is no way to distinguish between the two Inngest steps from the client.

**Suggested approach:** Extend the `Status` enum (or add a separate `statusMessage` field) to expose intermediate states such as `GeneratingLatex`, `CompilingPDF`, and `SavingToDB`. This enables more informative progress indicators in the UI.

---

## How to Contribute

1. Fork the repository and create a feature branch from `main`.
2. Pick an item from the list above (or open an issue for something new).
3. Keep changes focused — one improvement per pull request.
4. Update relevant documentation and tests alongside your code changes.
5. Open a pull request with a clear description of what was changed and why.

For significant changes, open an issue first to discuss the approach before writing code.

---