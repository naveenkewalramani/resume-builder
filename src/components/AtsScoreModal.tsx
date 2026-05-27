'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useResumeStore } from '@/store/resumeStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { scoreResume, AtsResult } from '@/lib/ats';

interface AtsScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AtsScoreModal({ open, onOpenChange }: AtsScoreModalProps) {
  const { resume } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');

  const debouncedJd = useDebouncedValue(jobDescription, 300);

  const result: AtsResult | null =
    debouncedJd.trim().length > 0 ? scoreResume(resume, debouncedJd) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ATS Keyword Score</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Paste the job description to see how well your resume matches its keywords.
        </p>

        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full rounded border border-input p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring mb-4"
        />

        {result && jobDescription.trim() && (
          <>
            {/* Score bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: result.score + '%',
                    backgroundColor:
                      result.score >= 70
                        ? '#22c55e'
                        : result.score >= 40
                          ? '#f59e0b'
                          : '#ef4444',
                  }}
                />
              </div>
              <span className="text-sm font-semibold w-10 text-right">
                {result.score}%
              </span>
            </div>

            {/* Matched keywords */}
            {result.matched.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Matched ({result.matched.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.matched.map((k) => (
                    <span
                      key={k}
                      className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-xs border border-green-200"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missing.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Add to resume ({Math.min(result.missing.length, 10)})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.missing.slice(0, 10).map((k) => (
                    <span
                      key={k}
                      className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-xs border border-red-200"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
