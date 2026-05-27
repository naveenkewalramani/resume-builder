'use client';

import { FileText } from 'lucide-react';

export function MobileNotice() {
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-background p-8">
      <div className="max-w-sm text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-xl font-semibold">Desktop recommended</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Resume Builder is designed for keyboard-heavy editing on larger screens.
          Open it on a laptop or desktop for the full experience.
        </p>
        <p className="text-xs text-muted-foreground">
          Minimum width: 1024px
        </p>
      </div>
    </div>
  );
}
