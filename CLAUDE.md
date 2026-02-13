# NoteBridge

AI-powered note-taking app for software engineers. Built with Next.js + Convex + TipTap + Claude API.

## Quick Reference

- **Design doc**: `docs/DESIGN.md` — Full architecture, data model, UI spec, and AI feature details. Read this first before implementing any feature.
- **Backend**: All backend logic lives in `convex/`. No Next.js API routes.
- **Database**: Convex (real-time, document-relational). Schema defined in `convex/schema.ts`.
- **Editor**: TipTap (ProseMirror-based). Rich text stored as JSON in Convex.
- **AI**: Claude API called via Convex actions in `convex/ai/`.

## Tech Stack

- Next.js 14+ (App Router) — frontend only, no API routes
- Convex — database, server functions, real-time sync, auth
- TipTap — rich text editor
- @anthropic-ai/sdk — Claude API (used in Convex actions)
- Tailwind CSS — styling (dark theme)
- Framer Motion — animations
- cmdk — command palette
- Mermaid.js — diagram rendering

## Project Structure

```
app/              → Next.js pages and layout (frontend only)
convex/           → ALL backend: schema, queries, mutations, actions
convex/ai/        → Claude API integration (actions)
components/       → React components
  editor/         → TipTap editor, toolbar, selection menu
  ai/             → Chat panel, inline suggestions, command palette
  sidebar/        → Note list, folder tree
```

## Convex Conventions

### Function Types
- **Queries** (`query()`) — Read-only, auto-subscribe to changes. Use for all data fetching.
- **Mutations** (`mutation()`) — Write operations, run as ACID transactions. Use for all CRUD.
- **Actions** (`action()`) — Side effects (Claude API calls, external services). Cannot directly read/write DB — must call mutations/queries via `ctx.runMutation()` / `ctx.runQuery()`.
- **Internal functions** (`internalMutation()`, etc.) — Not exposed to client. Use for action→mutation calls.

### Patterns
```typescript
// Frontend data fetching (auto-updates in real-time)
const notes = useQuery(api.notes.list, { folderId });
const createNote = useMutation(api.notes.create);
const rephrase = useAction(api.ai.rephrase.run);

// Backend query
export const list = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => { ... },
});

// Backend action (AI call)
export const run = action({
  args: { text: v.string(), noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const result = await anthropic.messages.create({ ... });
    await ctx.runMutation(internal.aiActions.save, { ... });
    return result;
  },
});
```

### Environment Variables
Set via `npx convex env set KEY value` (NOT .env files for Convex backend).
- `ANTHROPIC_API_KEY` — Required for AI features.

## Schema Overview

Five tables: `notes`, `folders`, `tags`, `chatMessages`, `aiActions`.
Full schema with indexes is in `convex/schema.ts` and documented in `docs/DESIGN.md`.

Key relationships:
- Notes belong to optional Folder (via `folderId`)
- Notes have many Tags (via `tagIds` array)
- Notes have many ChatMessages (via `noteId` on chatMessages)
- Notes have many AIActions (via `noteId` on aiActions)

## AI Features (Priority Order)

1. **P0 — Rephrase/Clean Up**: Select text → clean/concise/formal/action-items modes
2. **P1 — Research/Expand**: Select text → define/expand/relate/web-research
3. **P2 — Generate Questions**: Select text → clarification/deep-dive/interview questions as checklist
4. **P3 — Create Diagrams**: Select text → Mermaid.js flowchart/sequence/ER diagrams

All AI features follow this flow:
1. User selects text in TipTap editor
2. Selection menu appears with action buttons
3. Frontend calls Convex action (e.g., `useAction(api.ai.rephrase.run)`)
4. Action calls Claude API, saves result via internal mutation
5. Result displayed in inline sidebar with accept/reject
6. Chat panel has full note context for follow-up discussion

## UI Layout

Three-panel layout: Sidebar (folders/notes) | Editor (TipTap) | AI Panel (chat)

### Key Keyboard Shortcuts
- `⌘+K` — Command palette
- `⌘+J` — Toggle AI chat panel
- `⌘+Shift+R` — Rephrase selection
- `⌘+Shift+F` — Research selection
- `⌘+N` — New note
- `⌘+P` — Quick note switcher

## Style Guide

- Dark theme by default
- Use Tailwind utility classes
- Animations via Framer Motion (panels, modals, AI results)
- TipTap content styling scoped under `.ProseMirror` class
- No inline styles — Tailwind only

## Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev sync (run in separate terminal)
npx convex deploy    # Deploy Convex functions to production
```

## Implementation Order

Follow the roadmap in `docs/DESIGN.md`:
1. Days 1-2: Schema + TipTap editor + three-panel layout + CRUD
2. Days 3-4: Selection menu + rephrase action + inline results
3. Days 5-6: Chat panel + research action + chat history
4. Days 7-8: Question generation + command palette + keyboard shortcuts
5. Days 9-10: Mermaid diagrams + deploy + auth
