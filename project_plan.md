# Resume Builder — Project Plan

## Context

Paid resume builder platforms (Resume.io, Canva, etc.) lock users out of their own resumes after a subscription expires. This project is a free, self-hosted web app where users own their data permanently. Core promise: build once, edit forever.

---

## Confirmed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Storage | Local-first, cloud-ready schema | localStorage now; user IDs in schema enable future sync |
| PDF (built-in templates) | `@react-pdf/renderer` | Crisp vector output, proper page breaks |
| PDF (custom templates) | Browser print dialog + `html2canvas` fallback | Custom templates are arbitrary HTML/CSS from external sites; browser print respects full CSS better than any screenshot approach |
| Device scope | Desktop-first (≥1024px) | Resume editing is keyboard-heavy; mobile notice shown on small screens |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, `output: 'export'`) — static SPA deployable to Vercel/GitHub Pages |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | Zustand (memory + localStorage persistence) |
| Built-in template PDF | `@react-pdf/renderer` |
| Custom template PDF | Browser print (primary), `html2canvas + jsPDF` (in-app button) |
| Custom template interpolation | `mustache` (3KB, browser-safe) |
| Drag-and-drop | `@dnd-kit/core` |
| Fonts (bundled) | Inter + Roboto Mono as local assets (avoids Google Fonts online dependency) |

---

## Architecture

```
Browser (client-side SPA only — no server, no API routes, no database)

┌──────────────────────────────────────────────────────┐
│  Editor UI  (React, Tailwind, shadcn/ui)              │
│  Forms · Section manager · Template picker            │
└──────────────────┬───────────────────────────────────┘
                   │ reads/writes
┌──────────────────▼───────────────────────────────────┐
│  Zustand Store                                        │
│  ResumeData + AppSettings                             │
│  Auto-saves to localStorage; exports .resumejson      │
└──────────────────┬───────────────────────────────────┘
                   │ consumed by
┌──────────────────▼───────────────────────────────────┐
│  Template Engine                                      │
│  Built-in: react-pdf components → PDFViewer preview  │
│  Custom:   Mustache(html) → <iframe srcdoc> preview  │
│            PDF: browser print OR html2canvas blob     │
└──────────────────────────────────────────────────────┘
```

**Routing:** only two pages needed — `/` (editor) and `/templates` (picker). No auth routes in Phase 1.

---

## Resume Data Schema (`src/types/resume.ts`)

```typescript
interface PersonalInfo {
  fullName: string; email: string; phone: string;
  location: string; website?: string; linkedin?: string; github?: string;
  summary: string;
}

interface WorkExperience {
  id: string; company: string; title: string; location: string;
  startDate: string;        // "YYYY-MM"
  endDate: string | null;   // null = "Present"
  current: boolean;
  bullets: string[];
}

interface Education {
  id: string; institution: string; degree: string; field: string;
  location: string; startDate: string; endDate: string | null;
  current: boolean; gpa?: string; highlights?: string[];
}

interface Skill        { id: string; category: string; items: string[]; }
interface Project      { id: string; name: string; description: string; url?: string; technologies: string[]; bullets: string[]; }
interface Certification{ id: string; name: string; issuer: string; date: string; url?: string; }
interface Language     { id: string; language: string; proficiency: 'Native'|'Fluent'|'Intermediate'|'Basic'; }

interface ResumeSection { id: SectionKey; label: string; visible: boolean; order: number; }
type SectionKey = 'personal'|'experience'|'education'|'skills'|'projects'|'certifications'|'languages';

interface ResumeMeta {
  id: string;               // uuid — supports future user ownership field
  title: string;            // user label, e.g. "SWE at Google 2025"
  templateId: string;       // built-in slug or "custom"
  customTemplateHtml?: string;
  accentColor: string;      // hex
  fontSize: 'small'|'medium'|'large';
  createdAt: string; updatedAt: string;
}

interface ResumeData {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  sections: ResumeSection[];  // controls order + visibility
  meta: ResumeMeta;
}
```

---

## Template System

### Built-in Templates

Each template is a React component (`TemplateProps → @react-pdf/renderer JSX`) registered in `src/templates/registry.ts`. Templates read `data.meta.accentColor` for theming. They iterate `data.sections` in `order` to control render sequence.

```
src/templates/
  classic/index.tsx     ← ATS-friendly single-column
  modern/index.tsx      ← two-column with accent sidebar
  minimal/index.tsx     ← ultra-clean whitespace
  registry.ts
  types.ts              ← TemplateProps, BuiltInTemplate interfaces
```

`PDFViewer` is wrapped in `next/dynamic({ ssr: false })` to avoid SSR conflicts with browser-only APIs.

Preview is debounced 300ms (via `useDebouncedValue`) so the form feels instant and the preview catches up.

### Custom Template Upload — Three-phase approach

The challenge: HTML templates downloaded from sites (HTML5 UP, Colorlib, etc.) contain no data placeholders — they're static HTML with hardcoded text like "John Doe". We solve this progressively across phases.

#### Phase 1 — Manual placeholder editing (MVP)
- User edits their downloaded HTML to replace static text with `{{mustache}}` variables before uploading
- On upload, we check for the presence of `{{` — if none found, show a clear warning: *"No data placeholders detected. See our template guide to add them."*
- Ship `sample-custom-template.html` + a `TEMPLATE_GUIDE.md` in the repo as reference
- Render in `<iframe srcdoc="...">` with `sandbox="allow-same-origin"` (no script execution)
- **PDF**: browser print dialog (primary, respects full CSS) + `html2canvas → jsPDF` (in-app button)

#### Phase 2 — In-app placeholder editor (removes HTML editing barrier)
- After upload, show split view:
  - **Left**: CodeMirror/Monaco editor showing the raw HTML source
  - **Right**: live rendered preview of the template
  - **Sidebar**: clickable list of all resume data fields (fullName, email, experience[].title, etc.)
- User clicks a field name → inserts placeholder at cursor position in the HTML editor
- Live preview updates as placeholders are inserted
- "Save template" stores the modified HTML with placeholders in the Zustand store

#### Phase 3 — AI-assisted mapping (optional, user's own API key)
- After upload, use Claude to analyse HTML structure and suggest where to inject each data field
- User reviews and confirms suggestions before applying

**Mustache variable reference** (for Phase 1 manual editing):
```
{{personal.fullName}}, {{personal.email}}, {{personal.phone}}
{{#experience}}{{title}} at {{company}} ({{startDate}}–{{endDate}})
  {{#bullets}}<li>{{.}}</li>{{/bullets}}
{{/experience}}
```

---

## localStorage Key Structure

```
resume:index          → string[]        (array of resume UUIDs)
resume:<uuid>         → ResumeData JSON (full resume)
resume:<uuid>:meta    → lightweight preview (title, updatedAt, templateId)
```

Separating lightweight meta enables a fast resume list view without deserializing all data.

---

## Phase Breakdown

### Phase 1 — MVP (~2 weeks solo) ✅ Complete

- Project scaffold: Next.js 14, TypeScript, Tailwind, shadcn/ui, Zustand
- Full data schema + Zustand store with localStorage persistence
- Editor panels: Personal Info, Work Experience, Education, Skills
- **1 built-in template**: Classic (ATS-friendly, single-column)
- Live PDF preview (`<PDFViewer>`, debounced)
- PDF download button
- Save/load `.resumejson` (export + import)
- Sample data for onboarding (pre-filled example resume)
- Deploy to Vercel (`output: 'export'`)

### Phase 2 — Core Enhancements

- 2 more built-in templates (Modern, Minimal) + template picker with thumbnails
- Accent color picker + font size toggle
- Drag-and-drop section reordering (`@dnd-kit`)
- Show/hide section toggles
- Editor panels: Projects, Certifications, Languages
- Custom template upload (HTML + Mustache) with iframe preview + print PDF
- **In-app placeholder editor**: CodeMirror split view (HTML source ↔ live preview) + clickable data field sidebar so users can inject placeholders without manually editing HTML
- Multiple resume support (list view, per-UUID storage)

### Phase 3 — Nice-to-Haves

- AI bullet point suggestions (user provides own Anthropic API key, stored in localStorage)
- ATS score estimator (keyword density vs. pasted job description)
- LinkedIn data export import (`.zip` parsing)
- Collaborative editing via `yjs` + WebRTC (no server)

---

## Directory Structure

```
resume-builder/
├── public/
│   ├── fonts/                      ← Inter + Roboto Mono bundled locally
│   └── template-thumbnails/        ← classic.png, modern.png, minimal.png
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← "/" editor
│   │   └── templates/page.tsx      ← "/templates" picker
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── PersonalForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   ├── SectionManager.tsx  ← dnd-kit + show/hide
│   │   │   └── BulletEditor.tsx
│   │   ├── preview/
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── PdfPreview.tsx      ← next/dynamic, ssr:false
│   │   │   └── HtmlPreview.tsx     ← iframe + print trigger
│   │   ├── template-picker/
│   │   │   ├── TemplatePicker.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   └── CustomTemplateUpload.tsx
│   │   └── ui/                     ← shadcn/ui components
│   ├── templates/
│   │   ├── classic/index.tsx
│   │   ├── modern/index.tsx
│   │   ├── minimal/index.tsx
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── store/
│   │   ├── resumeStore.ts          ← Zustand + localStorage
│   │   ├── appStore.ts             ← UI state (active tab, panel widths)
│   │   └── persistence.ts
│   ├── types/
│   │   └── resume.ts
│   ├── lib/
│   │   ├── pdf.ts                  ← downloadPdf() helper
│   │   ├── mustache.ts             ← custom template renderer
│   │   ├── fileIO.ts               ← .resumejson save/load
│   │   └── sampleData.ts           ← onboarding pre-fill
│   └── hooks/
│       ├── useAutoSave.ts          ← debounced localStorage write
│       └── useDebouncedValue.ts    ← preview debounce
├── next.config.mjs                 ← output: 'export'
├── tailwind.config.ts
└── tsconfig.json
```

---

## Build Order (Day by Day)

| Days | Work |
|---|---|
| 1–2 | Scaffold (Next.js, Tailwind, shadcn, Zustand), types/resume.ts |
| 3–4 | Zustand store + localStorage persistence + .resumejson IO |
| 5–6 | All Phase 1 editor form panels |
| 7–8 | Classic react-pdf template + live PDFViewer preview |
| 9 | PDF download, debounce, sample data onboarding |
| 10–11 | Editor UX polish (add/remove items, validation, empty states) |
| 12 | Vercel deploy, static export verification, README |
| 13–14 | Buffer / bug fixes |

---

## Verification Checklist

1. `npm run build` — must complete with zero errors (`output: 'export'` validates static compatibility)
2. Open `/` — fill in sample data, confirm live PDF preview updates
3. Click "Download PDF" — verify the downloaded file is a valid, readable PDF
4. Switch templates — confirm preview switches and download still works
5. Export `.resumejson` → refresh page → import file → confirm all data restored
6. Upload `sample-custom-template.html` — confirm preview renders with user data, print dialog opens
7. Deploy to Vercel — confirm all routes work from the static export
