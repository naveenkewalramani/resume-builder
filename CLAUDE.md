# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # static export to ./out/ (must pass before shipping)
npm run lint     # ESLint via next lint
```

No test suite exists yet. Verification is manual.

## Architecture

This is a **fully client-side SPA** — Next.js 14 with `output: 'export'`. No API routes, no server components at runtime, no backend. Everything runs in the browser.

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

Custom templates are arbitrary HTML with Mustache placeholders (`{{personal.fullName}}` etc.) rendered via `src/lib/templateVars.ts` in an `<iframe srcdoc>` with `sandbox="allow-same-origin"`.

The preview debounces 300ms via `useDebouncedValue` (`src/hooks/useDebouncedValue.ts`) to avoid re-rendering the PDF on every keystroke.

### localStorage schema (multi-resume, fully implemented)

| Key | Value |
|---|---|
| `resume:index` | JSON array of UUID strings — ordered list of all resume IDs |
| `resume:active` | UUID string — currently open resume |
| `resume:<uuid>` | JSON-serialised `ResumeData` for that resume |
| `resume:is_sample` | `"true"` if the active resume is still the unedited sample |
| `app:anthropicApiKey` | User-provided Anthropic API key (stored by SettingsModal) |

On first load, `initStore()` creates one resume from `sampleResumeData` and sets `is_sample`. On any edit, `persistAndClear()` removes the sample flag. Legacy `resume:current` keys are migrated automatically on first load.

### AI features

`src/lib/ai.ts` calls the Anthropic API directly from the browser (`anthropic-dangerous-direct-browser-access: true`) using a user-supplied key stored in localStorage. The model is `claude-haiku-4-5-20251001`. The key is entered via `SettingsModal` and used in `BulletEditor` for AI-suggested bullet points.

`src/lib/ats.ts` is fully client-side — no AI call. It tokenises the resume and a job description, strips stopwords, and returns a keyword match score.

### PDF export

- Built-in templates: `@react-pdf/renderer` via `src/lib/pdf.ts`
- Custom HTML templates: browser print dialog (primary) or `html2canvas + jsPDF` (fallback)

## Key constraints

- **Desktop-only** (≥1024px). No responsive layout work needed.
- `npm run build` validates static export compatibility — run it before claiming a feature is complete. Dynamic routes and server-side features will break the build.
- `src/components/ui/` contains shadcn/ui primitives — edit these only to fix bugs, not to add app logic.
