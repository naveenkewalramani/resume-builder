'use client';

import dynamic from 'next/dynamic';
import { useResumeStore } from '@/store/resumeStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getTemplate } from '@/templates/registry';
import { Button } from '@/components/ui/button';
import { downloadPdf } from '@/lib/pdf';
import { resumeToMustacheVars } from '@/lib/templateVars';
import { Download } from 'lucide-react';
import { useState } from 'react';

const PdfPreview = dynamic(
  () => import('./PdfPreview').then((m) => m.PdfPreview),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

const CustomPreviewDynamic = dynamic(
  () => import('./CustomPreview').then((m) => m.CustomPreview),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

function PreviewSkeleton() {
  return (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <p className="text-sm text-muted-foreground animate-pulse">Rendering preview...</p>
    </div>
  );
}

export function PreviewPanel() {
  const resume = useResumeStore((s) => s.resume);
  const debouncedResume = useDebouncedValue(resume, 300);
  const [downloading, setDownloading] = useState(false);

  const isCustom = debouncedResume.meta.templateId === 'custom';
  const template = !isCustom ? getTemplate(debouncedResume.meta.templateId) : undefined;

  const handleDownload = async () => {
    if (resume.meta.templateId === 'custom') {
      const html = resume.meta.customTemplateHtml;
      if (!html) return;
      const Mustache = (await import('mustache')).default;
      const vars = resumeToMustacheVars(resume);
      const rendered = Mustache.render(html, vars);
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(rendered);
      w.document.close();
      w.focus();
      w.print();
      // Don't close immediately — print dialog needs the window open
      return;
    }
    if (!template) return;
    setDownloading(true);
    try {
      await downloadPdf(template.component, debouncedResume);
    } finally {
      setDownloading(false);
    }
  };

  const downloadDisabled =
    downloading ||
    (isCustom ? !resume.meta.customTemplateHtml : !template);

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h2 className="font-semibold text-sm">Preview</h2>
        <Button size="sm" onClick={handleDownload} disabled={downloadDisabled}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {isCustom ? (
          debouncedResume.meta.customTemplateHtml ? (
            <CustomPreviewDynamic
              data={debouncedResume}
              html={debouncedResume.meta.customTemplateHtml}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Upload an HTML template to see your preview
              </p>
            </div>
          )
        ) : template ? (
          <PdfPreview component={template.component} data={debouncedResume} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No template selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
