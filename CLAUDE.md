# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # static export to ./out/ (must pass before shipping)
npm run lint     # ESLint via next lint
```

No test suite exists yet. Verification is manual — see the checklist in `project_plan.md`.

## Architecture

This is a **fully client-side SPA** — Next.js 14 with `output: 'export'`. There are no API routes, no server components that run at runtime, and no backend. Everything runs in the browser.

### Data flow

```
Editor forms → useResumeStore (Zustand) → localStorage (auto-persist)
                     ↓
             Template components → PDFViewer (built-in) or iframe srcdoc (custom)
```

`useResumeStore` (`src/store/resumeStore.ts`) is the single source of truth. Every write calls `saveToStorage` immediately — there is no explicit save step. The `touch()` helper bumps `meta.updatedAt` on every mutation.

### SSR constraint

`@react-pdf/renderer` is browser-only. The entire `<Editor>` component tree is loaded via `next/dynamic({ ssr: false })` in `src/app/page.tsx`. Any new component that uses PDFViewer, `window`, or `localStorage` must either be inside this dynamic boundary or wrapped in its own `dynamic(..., { ssr: false })`.

### Template system

Built-in templates live in `src/templates/<name>/index.tsx` and are `@react-pdf/renderer` React components that accept `TemplateProps` (`{ data: ResumeData }`). Register new templates in `src/templates/registry.ts`. Templates read `data.meta.accentColor` for theming and iterate `data.sections` (sorted by `order`) to control section rendering order.

Custom templates are arbitrary HTML with Mustache placeholders rendered in `<iframe srcdoc>` with `sandbox="allow-same-origin"`.

The preview debounces 300ms via `useDebouncedValue` (`src/hooks/useDebouncedValue.ts`) to avoid re-rendering the PDF on every keystroke.

### localStorage schema

Single resume stored at key `resume:current`. The multi-resume key structure (`resume:index`, `resume:<uuid>`) described in `project_plan.md` is planned for Phase 2 but not yet implemented — the store currently uses `STORAGE_KEY = 'resume:current'`.

## Key constraints

- **Desktop-only** (≥1024px). No responsive layout work needed.
- `npm run build` validates static export compatibility — run it before claiming a feature is complete. Dynamic routes and server-side features will break the build.
- PDF export for built-in templates uses `@react-pdf/renderer`; for custom HTML templates it uses the browser print dialog (primary) or `html2canvas + jsPDF` (fallback).
