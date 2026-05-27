'use client';

import dynamic from 'next/dynamic';
import { useResumeStore } from '@/store/resumeStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getTemplate } from '@/templates/registry';
import { Button } from '@/components/ui/button';
import { downloadPdf } from '@/lib/pdf';
import { Download } from 'lucide-react';
import { useState } from 'react';

const PdfPreview = dynamic(
  () => import('./PdfPreview').then((m) => m.PdfPreview),
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

  const template = getTemplate(debouncedResume.meta.templateId);

  const handleDownload = async () => {
    if (!template) return;
    setDownloading(true);
    try {
      await downloadPdf(template.component, debouncedResume);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h2 className="font-semibold text-sm">Preview</h2>
        <Button size="sm" onClick={handleDownload} disabled={downloading || !template}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {template ? (
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
