'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/resumeStore';
import { createEmptyResume } from '@/lib/sampleData';

export function SampleDataBanner() {
  const isSampleData = useResumeStore((s) => s.isSampleData);
  const clearSampleFlag = useResumeStore((s) => s.clearSampleFlag);
  const loadResume = useResumeStore((s) => s.loadResume);

  if (!isSampleData) return null;

  const handleStartFresh = () => {
    loadResume(createEmptyResume());
    // clearSampleFlag is called inside loadResume, but be explicit for clarity
    clearSampleFlag();
  };

  const handleDismiss = () => {
    clearSampleFlag();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800">
      <span className="flex-1 text-xs">
        You&apos;re viewing sample data — replace it with yours, or start fresh.
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-amber-800 hover:bg-amber-100 hover:text-amber-900 shrink-0"
        onClick={handleStartFresh}
      >
        Start fresh
      </Button>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-amber-600 hover:bg-amber-100 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        onClick={handleDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
