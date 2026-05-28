# Resume Builder

A fully client-side resume editor. No account, no backend, no data leaves your browser.

## Features

- **Multiple resumes** — create, rename, duplicate, and delete resumes; switch between them from the toolbar
- **Built-in templates** — Classic (ATS-friendly single-column), Modern (two-column with accent sidebar), Minimal (whitespace-heavy)
- **Custom HTML templates** — paste any HTML with Mustache placeholders (`{{personal.fullName}}`, `{{#experience}}…{{/experience}}`) for full layout control
- **PDF export** — built-in templates export via `@react-pdf/renderer`; custom templates use the browser print dialog
- **Import / Export** — save and load resumes as `.resumejson` files
- **ATS Score** — paste a job description to get a keyword match score and gap analysis (runs entirely in-browser)
- **AI bullet suggestions** — generates three impact-focused bullet points per role using Claude (requires your own Anthropic API key)
- **Auto-save** — every edit persists to `localStorage` instantly; no save button needed
- **Section reordering** — drag sections into any order; toggle visibility per section

## Getting Started

```bash
npm install
npm run dev   # http://localhost:3000
```

Requires Node.js ≥18. Desktop browsers only (≥1024px viewport).

## AI Bullet Suggestions

Click the ✨ button inside any experience entry. You will be prompted to enter an Anthropic API key on first use — it is stored in `localStorage` and never sent anywhere except the Anthropic API.

To get a key: https://console.anthropic.com

## Build & Deploy

```bash
npm run build   # static export → ./out/
```

The output is a plain static site. Serve `./out/` from any CDN (Vercel, Netlify, GitHub Pages, S3) — no server required.

```bash
npm run lint    # ESLint
```

## Custom Template Placeholders

| Placeholder | Value |
|---|---|
| `{{personal.fullName}}` | Full name |
| `{{personal.email}}` | Email |
| `{{personal.phone}}` | Phone |
| `{{personal.location}}` | Location |
| `{{personal.website}}` | Website URL |
| `{{personal.linkedin}}` | LinkedIn URL |
| `{{personal.github}}` | GitHub URL |
| `{{personal.summary}}` | Professional summary |
| `{{#experience}}…{{/experience}}` | Loops over work experience entries |
| `{{#education}}…{{/education}}` | Loops over education entries |
| `{{#skills}}…{{/skills}}` | Loops over skill categories |
| `{{#projects}}…{{/projects}}` | Loops over projects |
| `{{#certifications}}…{{/certifications}}` | Loops over certifications |
| `{{#languages}}…{{/languages}}` | Loops over languages |
| `{{meta.accentColor}}` | Hex accent color from settings |

Within each loop, fields match the section's type (e.g., `{{title}}`, `{{company}}`, `{{startDate}}`, `{{endDateDisplay}}`). `endDateDisplay` resolves to `"Present"` when a role is current.

## Data Storage

All data lives in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `resume:index` | Ordered list of resume UUIDs |
| `resume:active` | UUID of the currently open resume |
| `resume:<uuid>` | Full `ResumeData` JSON for that resume |
| `app:anthropicApiKey` | Your Anthropic API key (if set) |

Clearing site data in your browser will erase all resumes. Use **Save** (toolbar) to export a backup `.resumejson` before clearing.
