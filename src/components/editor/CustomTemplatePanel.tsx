'use client';

import { useRef, useState } from 'react';
import { Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';

const VARIABLE_REFERENCE = `<!-- Personal info -->
{{personal.fullName}}
{{personal.email}}
{{personal.phone}}
{{personal.location}}
{{personal.website}}
{{personal.linkedin}}
{{personal.github}}
{{personal.summary}}

<!-- Work Experience -->
{{#experience}}
  {{title}} at {{company}}
  {{location}}
  {{startDate}} – {{endDateDisplay}}
  {{#bullets}}
    {{.}}
  {{/bullets}}
{{/experience}}

<!-- Education -->
{{#education}}
  {{degree}} in {{field}}
  {{institution}}, {{location}}
  {{startDate}} – {{endDateDisplay}}
{{/education}}

<!-- Skills -->
{{#skills}}
  {{category}}: {{#items}}{{.}} {{/items}}
{{/skills}}

<!-- Projects -->
{{#projects}}
  {{name}} — {{description}}
  URL: {{url}}
  {{#bullets}}{{.}}{{/bullets}}
  Tech: {{#technologies}}{{.}} {{/technologies}}
{{/projects}}

<!-- Certifications -->
{{#certifications}}
  {{name}} — {{issuer}}  {{date}}
{{/certifications}}

<!-- Languages -->
{{#languages}}
  {{language}} — {{proficiency}}
{{/languages}}

<!-- Accent color -->
{{meta.accentColor}}`;

export function CustomTemplatePanel() {
  const { resume, updateMeta } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refOpen, setRefOpen] = useState(false);

  const hasTemplate = Boolean(resume.meta.customTemplateHtml);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        updateMeta({ customTemplateHtml: text });
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleClear = () => {
    updateMeta({ templateId: 'classic', customTemplateHtml: undefined });
  };

  return (
    <div className="space-y-3 px-3 pb-3">
      {/* Upload section */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">HTML template</p>
        {hasTemplate ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground flex-1 truncate">Template loaded</span>
            <button
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 w-full px-3 py-1.5 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .html file
          </button>
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
            {VARIABLE_REFERENCE}
          </pre>
        )}
      </div>
    </div>
  );
}
