# NoteBridge — Design Document v2.0

> An AI-powered note-taking app that bridges the gap between raw thoughts and polished knowledge.

---

## Project Overview

NoteBridge is a web-based note-taking app designed for software engineers who need fast capture during meetings and AI-powered tools to transform raw notes into structured knowledge.

### Core Problem

During onboarding meetings and daily engineering work, you take messy, rapid-fire notes. Later, you need those notes to be clean, structured, and enriched with additional context. Currently this means manually rewriting or searching separately — NoteBridge makes AI do the heavy lifting inline.

### Target User

Software engineer starting a new job. Needs to capture information fast during onboarding, then process and understand it later. Uses notes for meeting minutes, implementation details, task lists, and personal planning. Values synced access and clean organization.

### Key Metrics

- 3 AI interaction modes (selection menu, inline sidebar, chat panel)
- 4 core AI features (rephrase, research, questions, diagrams)
- ~2 week MVP build time

---

## Architecture

### High-Level Architecture

```
Browser (React) ⇄ Convex Cloud (WebSocket) → Claude API
useQuery()      ⇄ Real-time Sync Engine    ⇄ Convex Database
TipTap Editor   ↔ Convex Actions (AI)      ↔ Chat Panel
```

Convex replaces Next.js API routes, Prisma, and the database layer. Queries and mutations are TypeScript functions that run server-side with automatic real-time subscriptions via WebSocket.

### Why Convex?

- **Real-time sync for free** — Notes update across all devices instantly via WebSocket subscriptions. No manual polling or refetching.
- **No API routes to write** — Convex queries/mutations/actions replace all Next.js API routes. Less boilerplate, faster iteration.
- **End-to-end type safety** — Schema → server functions → React hooks are fully typed. Catch errors at compile time.
- **Transactional by default** — Every mutation runs as an ACID transaction. No partial writes to worry about.
- **Built-in AI support** — Actions can call external APIs (Claude). Built-in RAG component and vector search for future features.

### Frontend

- **TipTap** — Rich text editor built on ProseMirror. Extensible, markdown-friendly, great API for custom commands
- **Convex React Client** — useQuery / useMutation hooks with automatic real-time subscriptions
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **Framer Motion** — Smooth transitions for AI panel, command palette, sidebars

### Backend (Convex)

- **Queries** — Read-only functions that auto-subscribe to changes. Power all data fetching.
- **Mutations** — Write functions that run as transactions. Handle all note CRUD.
- **Actions** — Side-effect functions for calling Claude API, web search, and external services.
- **Scheduled Functions** — Cron jobs for background tasks (e.g. auto-save, cleanup).

### Project Structure

```
notebridge/
├── app/
│   ├── page.tsx              ← Main editor view
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx         ← ConvexProvider wrapper
├── convex/                   ← ALL backend logic lives here
│   ├── schema.ts             ← Database schema (typed)
│   ├── notes.ts              ← Queries & mutations for notes
│   ├── folders.ts            ← Queries & mutations for folders
│   ├── tags.ts               ← Queries & mutations for tags
│   ├── chat.ts               ← Chat message queries & mutations
│   ├── ai/
│   │   ├── rephrase.ts       ← Action: calls Claude for rephrase
│   │   ├── research.ts       ← Action: calls Claude for research
│   │   ├── questions.ts      ← Action: calls Claude for questions
│   │   ├── diagram.ts        ← Action: calls Claude for diagrams
│   │   └── chat.ts           ← Action: AI chat with note context
│   └── _generated/           ← Auto-generated types & API
├── components/
│   ├── editor/
│   │   ├── Editor.tsx         ← TipTap wrapper
│   │   ├── Toolbar.tsx
│   │   └── SelectionMenu.tsx  ← AI action popup on text selection
│   ├── ai/
│   │   ├── ChatPanel.tsx      ← Persistent AI chat (right panel)
│   │   ├── InlineSuggestion.tsx
│   │   └── CommandPalette.tsx
│   ├── sidebar/
│   │   ├── NoteList.tsx
│   │   └── FolderTree.tsx
│   └── shared/
└── package.json
```

---

## UI Design

### Layout

Three-panel layout with contextual AI interactions. Dark theme by default, clean and focused.

```
┌──────────────────────────────────────────────────────────┐
│  ● ● ●                                      NoteBridge   │
├────────────┬───────────────────────┬─────────────────────┤
│ SIDEBAR    │ EDITOR                │ AI PANEL            │
│            │                       │                     │
│ Folders    │ Team Intro Meeting    │ ✦ AI Assistant      │
│ 📁 Onboard │                       │                     │
│ 📁 Work    │ [note content...]     │ [chat messages...]  │
│ 📁 Personal│                       │                     │
│            │ ┌─────────────────┐   │                     │
│ Recent     │ │ [selected text] │   │                     │
│ 📝 Team Int│ │ ✨Rephrase 🔍Res│   │                     │
│ 📝 Dev Env │ │ ❓Questions 📊Di│   │                     │
│ 📝 Arch Ov │ └─────────────────┘   │                     │
│            │                       │ [Ask about notes...]│
└────────────┴───────────────────────┴─────────────────────┘
```

### Three AI Interaction Modes

1. **Selection Menu (Command Palette)** — Select text → floating toolbar appears with quick AI actions (Rephrase, Research, Questions, Diagram). Results replace or append inline. Best for quick, targeted transformations.

2. **Inline Sidebar** — After triggering an AI action, a slim sidebar slides in next to the editor showing the AI result with accept/reject/edit options. Content stays contextual to the selected text.

3. **Chat Panel** — Persistent right panel for ongoing conversation about the current note. The AI has the full note as context. Ask follow-up questions, request explanations, explore topics in depth. Each note has its own chat thread.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘+K` | Command palette (search AI actions) |
| `⌘+J` | Toggle AI chat panel |
| `⌘+Shift+R` | Rephrase selection |
| `⌘+Shift+F` | Research selection |
| `⌘+N` | New note |
| `⌘+P` | Quick note switcher |

### Editor Features

- Full Markdown support (headings, lists, code, tables)
- Slash commands (`/`) for blocks
- Checkbox todo lists with state sync
- Code blocks with syntax highlighting
- Drag-and-drop block reordering
- Inline tags for organization

---

## AI Features

Four core AI features, powered by Claude, ordered by priority.

### P0 — Rephrase & Clean Up (HIGHEST PRIORITY)

Select messy meeting notes and transform them into clear, structured text. Multiple rephrase modes:

- **Clean up** — Grammar, punctuation, paragraph structure
- **Make concise** — Compress into bullet points
- **Formalize** — Meeting minutes style
- **Extract action items** — Pull out tasks as checkboxes

```typescript
// System prompt for rephrase
const REPHRASE_PROMPT = `
You are a note-editing assistant. The user will give you
raw meeting notes. Clean them up while preserving all
factual content. Options:
- "clean": Fix grammar, structure into paragraphs
- "concise": Bullet-point summary
- "formal": Professional meeting minutes style
- "action-items": Extract only actionable tasks
`;
```

### P1 — Research & Expand (HIGH PRIORITY)

Select a topic or term from your notes and get an AI-powered deep dive with additional context, definitions, and related concepts.

- **Define** — Quick definition of a term (great for onboarding jargon)
- **Expand** — Add more context and background
- **Relate** — Show how this connects to other concepts in your notes
- **Web research** — Use Claude's web search to find current information

### P2 — Generate Questions (MEDIUM PRIORITY)

Select text and generate smart questions to deepen understanding or prepare for follow-up meetings.

- **Clarification questions** — "What did they mean by...?"
- **Deep dive questions** — Technical follow-ups to ask your team
- **Interview-style** — Questions to test your understanding
- Questions are inserted as a checklist below the selection — check them off as you find answers

### P3 — Create Diagrams (NICE TO HAVE)

Select text describing a process, system, or relationship and generate a visual diagram using Mermaid.js.

- **Flowcharts** — Process flows, deployment pipelines
- **Sequence diagrams** — API call flows, service interactions
- **Entity relationship** — Database schemas, data models
- Diagrams render inline in the note and are editable via Mermaid syntax

### Chat Panel — The Glue

The chat panel ties everything together. It's a persistent conversation that has your full note as context. It can reference any AI action you've performed and lets you have a natural back-and-forth. Think of it as a knowledgeable colleague who's read all your notes.

```typescript
// Chat context injection
const messages = [
  {
    role: "system",
    content: `You are an AI assistant embedded in a note-taking app.
Here is the user's current note:

${currentNote.content}

The user previously used these AI features:
${aiHistory.map(h => h.summary).join('\n')}

Help the user understand and work with their notes.
Be concise and reference specific parts of the note.`
  },
  ...chatHistory
];
```

---

## Data Model

### Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    title: v.string(),
    content: v.string(),        // JSON string (TipTap document)
    plainText: v.string(),      // searchable plain text
    folderId: v.optional(v.id("folders")),
    tagIds: v.array(v.id("tags")),
    isPinned: v.boolean(),
  })
    .index("by_folder", ["folderId"])
    .searchIndex("search_notes", {
      searchField: "plainText",
      filterFields: ["folderId"],
    }),

  folders: defineTable({
    name: v.string(),
    icon: v.optional(v.string()),  // emoji
    parentId: v.optional(v.id("folders")),
  })
    .index("by_parent", ["parentId"]),

  tags: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_name", ["name"]),

  chatMessages: defineTable({
    noteId: v.id("notes"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  })
    .index("by_note", ["noteId"]),

  aiActions: defineTable({
    noteId: v.id("notes"),
    type: v.union(
      v.literal("rephrase"), v.literal("research"),
      v.literal("questions"), v.literal("diagram")
    ),
    inputText: v.string(),
    outputText: v.string(),
    accepted: v.boolean(),
  })
    .index("by_note", ["noteId"]),
});
```

### Example: Query + Mutation + Action

```typescript
// convex/notes.ts — Query (auto-subscribes, real-time)
export const list = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, { folderId }) => {
    if (folderId) {
      return ctx.db.query("notes")
        .withIndex("by_folder", q => q.eq("folderId", folderId))
        .order("desc").collect();
    }
    return ctx.db.query("notes").order("desc").collect();
  },
});

// Mutation (transactional write)
export const update = mutation({
  args: { id: v.id("notes"), content: v.string(), plainText: v.string() },
  handler: async (ctx, { id, content, plainText }) => {
    await ctx.db.patch(id, { content, plainText });
  },
});

// convex/ai/rephrase.ts — Action (calls Claude)
export const rephrase = action({
  args: { text: v.string(), mode: v.string(), noteId: v.id("notes") },
  handler: async (ctx, { text, mode, noteId }) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      messages: [{ role: "user", content: text }],
      system: REPHRASE_PROMPTS[mode],
    });
    // Save result back to DB via mutation
    await ctx.runMutation(internal.aiActions.save, {
      noteId, type: "rephrase", inputText: text,
      outputText: response.content[0].text,
    });
    return response.content[0].text;
  },
});
```

On the frontend, data fetching is just:
```typescript
const notes = useQuery(api.notes.list, { folderId });
// ^ Auto-updates when any note changes. No refetch needed.
```

### Storage Strategy

- **Convex Cloud (default)** — Managed, real-time document database. Zero config, instant setup. Generous free tier.
- **Self-hosted option** — Convex is open-source. Can self-host with Docker + Postgres if needed.
- **Real-time sync** — All connected clients auto-receive updates via WebSocket. Multi-device sync works out of the box.
- **Full-text search** — Built-in search indexes let you search notes without external services.
- **Editor State** — TipTap documents stored as JSON string, with a parallel plainText field powering the search index.
- **AI History** — Every AI action is logged so the chat panel has context of what you've already asked.

---

## Tech Stack

### Frontend

| Package | Purpose |
|---------|---------|
| Next.js 14+ | App router, server components (rendering only — no API routes needed) |
| TipTap | ProseMirror-based rich text editor |
| Convex React (`convex/react`) | useQuery / useMutation / useAction hooks with real-time subscriptions |
| Tailwind CSS | Utility-first with dark theme |
| Framer Motion | Smooth animations |
| Mermaid.js | Diagram rendering |
| cmdk | Command palette component |

### Backend (Convex)

| Package | Purpose |
|---------|---------|
| Convex | Real-time database + server functions + file storage |
| @anthropic-ai/sdk | Claude API via Convex actions |
| Convex Auth | Built-in auth (or Clerk integration) for multi-device |
| Convex Search | Built-in full-text search indexes |
| Convex Scheduler | Background jobs and cron tasks |

### Quick Start Commands

```bash
# Create the project
npx create-next-app@latest notebridge --typescript --tailwind --app
cd notebridge

# Install Convex
npm install convex

# Initialize Convex (creates convex/ folder, links to cloud)
npx convex dev
# ↑ This prompts GitHub login, creates project, and starts
#   syncing your convex/ functions to the cloud in real-time

# Install editor & UI deps
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-code-block-lowlight
npm install framer-motion cmdk mermaid

# Install AI deps (used in Convex actions)
npm install @anthropic-ai/sdk

# Set your API key as a Convex environment variable
npx convex env set ANTHROPIC_API_KEY your-key-here
```

### Deployment

- **Vercel** — Zero-config deployment for the Next.js frontend. Free tier is generous.
- **Convex Cloud** — Backend is already deployed. `npx convex deploy` pushes production functions.
- **Starter Plan** — If you exceed free limits, pay-as-you-go Starter plan scales to zero.
- **Environment variables** — `ANTHROPIC_API_KEY` set via `npx convex env set`. Never exposed client-side.

---

## Build Roadmap

### Days 1-2: Project Setup & Core Editor

Scaffold Next.js project, initialize Convex (`npx convex dev`), define schema, set up TipTap editor with markdown support, implement the three-panel layout (sidebar, editor, AI panel placeholder), build Convex queries and mutations for notes and folders CRUD.

### Days 3-4: P0 — Rephrase & Selection Menu

Build the text selection floating toolbar, implement the rephrase Convex action with Claude, create the inline sidebar for showing AI results with accept/reject, add streaming for real-time response display.

### Days 5-6: P1 — Chat Panel & Research

Build the persistent chat panel with note-aware context injection, implement the research/expand Convex action, add chat history via Convex mutations (auto-syncs to all devices), wire up the ability to send selected text to the chat for discussion.

### Days 7-8: P2 — Questions & Polish

Implement question generation with checklist output, add the command palette (⌘+K), implement keyboard shortcuts, refine the dark theme and micro-interactions, add note search using Convex search indexes.

### Days 9-10: P3 — Diagrams & Deploy

Integrate Mermaid.js for inline diagrams, implement the diagram generation Convex action, deploy frontend to Vercel, run `npx convex deploy` for production backend, add Convex Auth or Clerk for multi-device sync, final bug fixes and UX polish.

### Post-Launch: Future Enhancements

PWA support for mobile access, real-time collaboration, export to Markdown/PDF, note templates for recurring meeting types, smart tagging (AI auto-suggests tags), voice-to-notes for hands-free capture.

### MVP Definition

A working note-taking app where you can create, organize, and edit notes with rich text, and use at least the rephrase + chat features during your first onboarding meetings. Everything else is bonus.

### Risks & Mitigations

- **TipTap complexity** — Start with starter-kit, add extensions incrementally
- **AI latency** — Use streaming everywhere, show typing indicators
- **Convex learning curve** — Document-relational model is different from SQL, but the tutorial takes ~30 min
- **Scope creep** — Stick to P0-P1 for the first weekend
