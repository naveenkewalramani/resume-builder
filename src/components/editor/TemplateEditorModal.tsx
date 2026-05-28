'use client';

import { useRef, useState, useCallback } from 'react';
import Mustache from 'mustache';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/resumeStore';
import { resumeToMustacheVars } from '@/lib/templateVars';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

// ── Field definitions ─────────────────────────────────────────────────────────

const FIELD_GROUPS = [
  {
    label: 'Personal',
    fields: [
      { label: 'fullName', snippet: '{{personal.fullName}}' },
      { label: 'email', snippet: '{{personal.email}}' },
      { label: 'phone', snippet: '{{personal.phone}}' },
      { label: 'location', snippet: '{{personal.location}}' },
      { label: 'website', snippet: '{{personal.website}}' },
      { label: 'linkedin', snippet: '{{personal.linkedin}}' },
      { label: 'github', snippet: '{{personal.github}}' },
      { label: 'summary', snippet: '{{personal.summary}}' },
      { label: 'accentColor', snippet: '{{meta.accentColor}}' },
    ],
  },
  {
    label: 'Experience',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#experience}}\n<div>\n  <h3>{{title}} at {{company}}</h3>\n  <p>{{location}} | {{startDate}}–{{endDateDisplay}}</p>\n  <ul>{{#bullets}}<li>{{.}}</li>{{/bullets}}</ul>\n</div>\n{{/experience}}',
      },
      { label: 'title', snippet: '{{title}}' },
      { label: 'company', snippet: '{{company}}' },
      { label: 'location', snippet: '{{location}}' },
      { label: 'startDate', snippet: '{{startDate}}' },
      { label: 'endDateDisplay', snippet: '{{endDateDisplay}}' },
      { label: '⊞ bullets', snippet: '{{#bullets}}<li>{{.}}</li>{{/bullets}}' },
    ],
  },
  {
    label: 'Education',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#education}}\n<div>\n  <h3>{{degree}} in {{field}}</h3>\n  <p>{{institution}}, {{location}}</p>\n  <p>{{startDate}}–{{endDateDisplay}}</p>\n  {{#gpa}}<p>GPA: {{gpa}}</p>{{/gpa}}\n</div>\n{{/education}}',
      },
      { label: 'degree', snippet: '{{degree}}' },
      { label: 'field', snippet: '{{field}}' },
      { label: 'institution', snippet: '{{institution}}' },
      { label: 'gpa', snippet: '{{gpa}}' },
    ],
  },
  {
    label: 'Skills',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#skills}}\n<div><strong>{{category}}:</strong> {{#items}}{{.}} {{/items}}</div>\n{{/skills}}',
      },
      { label: 'category', snippet: '{{category}}' },
      { label: '⊞ items', snippet: '{{#items}}{{.}} {{/items}}' },
    ],
  },
  {
    label: 'Projects',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#projects}}\n<div>\n  <h3>{{name}}</h3>\n  <p>{{description}}</p>\n  {{#url}}<p><a href="{{url}}">{{url}}</a></p>{{/url}}\n  <ul>{{#bullets}}<li>{{.}}</li>{{/bullets}}</ul>\n</div>\n{{/projects}}',
      },
      { label: 'name', snippet: '{{name}}' },
      { label: 'description', snippet: '{{description}}' },
      { label: 'url', snippet: '{{url}}' },
    ],
  },
  {
    label: 'Certifications',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#certifications}}\n<div>{{name}} — {{issuer}} ({{date}})</div>\n{{/certifications}}',
      },
      { label: 'name', snippet: '{{name}}' },
      { label: 'issuer', snippet: '{{issuer}}' },
      { label: 'date', snippet: '{{date}}' },
    ],
  },
  {
    label: 'Languages',
    fields: [
      {
        label: '⊞ loop',
        snippet:
          '{{#languages}}\n<div>{{language}} — {{proficiency}}</div>\n{{/languages}}',
      },
      { label: 'language', snippet: '{{language}}' },
      { label: 'proficiency', snippet: '{{proficiency}}' },
    ],
  },
];

// ── Preview pane ──────────────────────────────────────────────────────────────

function TemplatePreview({ html, vars }: { html: string; vars: Record<string, unknown> }) {
  let rendered = '';
  let error = '';
  try {
    rendered = Mustache.render(html, vars);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Template render error';
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p className="text-xs text-destructive font-mono">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={rendered}
      sandbox="allow-same-origin"
      className="w-full h-full border-0"
      title="Template preview"
    />
  );
}

// ── Starter scaffold ──────────────────────────────────────────────────────────

const STARTER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: sans-serif; padding: 2rem; color: #1a1a1a; }
  h1 { margin-bottom: 0.25rem; }
  .subtitle { color: #555; margin-top: 0; }
</style>
</head>
<body>
  <h1>{{personal.fullName}}</h1>
  <p class="subtitle">{{personal.email}} · {{personal.phone}} · {{personal.location}}</p>

  {{#experience}}
  <div>
    <h3>{{title}} at {{company}}</h3>
    <p>{{startDate}}–{{endDateDisplay}}</p>
    <ul>{{#bullets}}<li>{{.}}</li>{{/bullets}}</ul>
  </div>
  {{/experience}}
</body>
</html>`;

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateEditorModal({ open, onOpenChange }: Props) {
  const { resume, updateMeta } = useResumeStore();
  const [html, setHtml] = useState(resume.meta.customTemplateHtml ?? '');
  const [activeGroup, setActiveGroup] = useState(0);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debouncedHtml = useDebouncedValue(html, 300);
  const vars = resumeToMustacheVars(resume);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const existing = resume.meta.customTemplateHtml;
      setHtml(existing ? existing : STARTER_HTML);
      onOpenChange(true);
    } else {
      if (html !== (resume.meta.customTemplateHtml ?? '')) {
        if (!window.confirm('You have unsaved changes. Discard them?')) return;
      }
      onOpenChange(false);
    }
  };

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const ta = textareaRef.current;
      if (!ta) {
        setHtml((prev) => prev + snippet);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = html.slice(0, start) + snippet + html.slice(end);
      setHtml(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + snippet.length;
        ta.focus();
      });
    },
    [html]
  );

  const handleSave = () => {
    updateMeta({ customTemplateHtml: html, templateId: 'custom' });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] w-[92vw] h-[88vh] flex flex-col gap-0 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
          <DialogTitle className="text-sm">Edit Template HTML</DialogTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={saved}>
              {saved ? 'Saved!' : 'Save'}
            </Button>
            <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 divide-x">
          {/* Left: HTML editor + field insertion */}
          <div className="flex flex-col min-h-0" style={{ width: '45%' }}>
            <textarea
              ref={textareaRef}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
              placeholder="Paste or type your HTML here…"
              aria-label="HTML template content"
              className="flex-1 resize-none p-3 font-mono text-xs leading-5 bg-muted/10 focus:outline-none border-b focus:bg-muted/20 transition-colors"
            />

            {/* Field insertion panel */}
            <div className="shrink-0">
              {/* Group tabs */}
              <div className="flex overflow-x-auto border-b px-2 pt-1 gap-0.5">
                {FIELD_GROUPS.map((g, i) => (
                  <button
                    key={g.label}
                    onClick={() => setActiveGroup(i)}
                    className={cn(
                      'shrink-0 px-2.5 py-1 text-xs rounded-t whitespace-nowrap transition-colors',
                      activeGroup === i
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Field chips */}
              <div className="flex flex-wrap gap-1.5 p-2 max-h-24 overflow-y-auto">
                {FIELD_GROUPS[activeGroup].fields.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => insertAtCursor(f.snippet)}
                    title={f.snippet}
                    className="px-2 py-0.5 rounded border border-input text-xs font-mono bg-background hover:bg-muted transition-colors"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex-1 min-h-0 bg-muted/5">
            {debouncedHtml ? (
              <TemplatePreview html={debouncedHtml} vars={vars} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Start typing HTML to see the preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
