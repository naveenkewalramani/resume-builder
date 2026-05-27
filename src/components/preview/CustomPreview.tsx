'use client';

import Mustache from 'mustache';
import { ResumeData } from '@/types/resume';
import { resumeToMustacheVars } from '@/lib/templateVars';

interface Props {
  data: ResumeData;
  html: string;
}

export function CustomPreview({ data, html }: Props) {
  let rendered = '';
  let error = '';
  try {
    rendered = Mustache.render(html, resumeToMustacheVars(data));
  } catch (e) {
    error = e instanceof Error ? e.message : 'Template render error';
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <p className="text-sm font-medium text-destructive mb-1">Template error</p>
          <p className="text-xs text-muted-foreground font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={rendered}
      sandbox="allow-same-origin"
      className="w-full h-full border-0"
      title="Custom template preview"
    />
  );
}
