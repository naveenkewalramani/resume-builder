'use client';

import { useRef, useState } from 'react';
import { Upload, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { TemplateEditorModal } from './TemplateEditorModal';

export function CustomTemplatePanel() {
  const { resume, updateMeta } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refOpen, setRefOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const hasTemplate = Boolean(resume.meta.customTemplateHtml);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        updateMeta({ customTemplateHtml: text });
        // Open the editor so the user can review and add placeholders
        setEditorOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    updateMeta({ templateId: 'classic', customTemplateHtml: undefined });
  };

  return (
    <div className="space-y-3 px-3 pb-3">
      {/* Upload / status row */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">HTML template</p>
        {hasTemplate ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditorOpen(true)}
              className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-input text-xs text-foreground hover:bg-muted transition-colors text-left"
            >
              <Pencil className="h-3 w-3 shrink-0 text-muted-foreground" />
              Edit template
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-1.5 w-full px-3 py-1.5 rounded-md border border-primary/50 text-xs text-primary hover:bg-primary/5 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Create from scratch
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 w-full px-3 py-1.5 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload .html file
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Variable reference (collapsible) */}
      <div>
        <button
          onClick={() => setRefOpen((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {refOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Variable reference
        </button>
        {refOpen && (
          <pre className="mt-1.5 p-2 rounded bg-muted text-xs font-mono overflow-auto max-h-48 text-muted-foreground whitespace-pre-wrap">
            {`{{personal.fullName}}, {{personal.email}}
{{personal.phone}}, {{personal.location}}
{{personal.summary}}

{{#experience}}
  {{title}} at {{company}}
  {{startDate}}–{{endDateDisplay}}
  {{#bullets}}{{.}}{{/bullets}}
{{/experience}}

{{#education}}
  {{degree}} in {{field}}
  {{institution}}
{{/education}}

{{#skills}}
  {{category}}: {{#items}}{{.}} {{/items}}
{{/skills}}

{{#projects}}{{name}}{{/projects}}
{{#certifications}}{{name}}{{/certifications}}
{{#languages}}{{language}}{{/languages}}
{{meta.accentColor}}`}
          </pre>
        )}
      </div>

      <TemplateEditorModal open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
