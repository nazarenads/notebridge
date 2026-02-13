---
name: frontend-design
description: Review and enforce frontend design standards. Use when creating components, reviewing UI code, fixing styling issues, or scaffolding new views.
---

# Frontend Design Skill — NoteBridge

When reviewing or generating frontend code, enforce all of the following rules.

## Theme & Colors

- Dark theme only. Background base: `zinc-950`. Panels/sidebars: `zinc-900`.
- Borders: `zinc-800`. Primary text: `zinc-100`/`zinc-200`. Secondary text: `zinc-400`. Muted: `zinc-500`/`zinc-600`.
- Accent/interactive: `indigo-400`/`violet-400` family (`#818cf8`, `#a78bfa`).
- Never use light theme colors (`white`, `gray-50`, etc.) outside of dark-mode overrides.

## Styling Rules

- **Tailwind only** — no inline styles, no CSS modules, no styled-components.
- Custom CSS is allowed only under `.ProseMirror` in `globals.css` for TipTap editor styling.
- Use Tailwind's `transition-colors` for hover/focus states.
- Avoid `!important`. If specificity is an issue, restructure the component.

## Layout

- Three-panel layout: Sidebar (w-60) | Editor (flex-1) | AI Panel (w-80).
- Sidebar and AI panel are `flex-shrink-0` with `border-r`/`border-l border-zinc-800`.
- AI panel is toggleable (hidden/shown). Sidebar is always visible.
- All panels fill viewport height: `h-screen` on the root flex container.
- Scrolling is per-panel (`overflow-y-auto`), never on the body.

## Component Patterns

- All components are `"use client"` unless they are pure layout with no hooks.
- Use Convex hooks (`useQuery`, `useMutation`, `useAction`) for data — never `fetch()` or API routes.
- Prefer controlled inputs with local state + debounced saves to avoid real-time sync jitter.
- Fonts: `font-sans` (Geist Sans) for UI, `font-mono` (Geist Mono) for code.

## Animations

- Use Framer Motion for panel transitions, modals, AI result reveals, and command palette.
- Keep animations subtle: 150-200ms duration, `ease-out` easing.
- Use `AnimatePresence` for mount/unmount animations (AI panel toggle, modals).
- No animations on text input or editor content — only structural UI changes.

## Component Scaffolding

When creating a new component:

1. Place it in the correct directory:
   - `components/editor/` — TipTap editor, toolbar, selection menu
   - `components/ai/` — Chat panel, inline suggestions, command palette
   - `components/sidebar/` — Note list, folder tree
   - `components/shared/` — Reusable primitives (buttons, modals, tooltips)

2. Use this template:
```tsx
"use client";

// External imports
// Internal imports (convex, components)

interface MyComponentProps {
  // typed props
}

export default function MyComponent({ ...props }: MyComponentProps) {
  // hooks first, then handlers, then render
  return (
    <div className="...">
      {/* content */}
    </div>
  );
}
```

3. Export as default. One component per file. Name the file the same as the component.

## Checklist

When reviewing frontend code, verify:

- [ ] No inline styles — Tailwind classes only
- [ ] Dark theme colors from the zinc palette
- [ ] Correct panel in the three-panel layout
- [ ] Interactive elements have hover/focus states
- [ ] Inputs use local state + debounced saves (not directly bound to server state)
- [ ] Framer Motion for structural animations (not CSS `@keyframes`)
- [ ] Component is in the right directory
- [ ] No `fetch()` calls — Convex hooks only
