'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [value, setValue] = useState('');

  // Load existing key whenever the modal opens
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      setValue(localStorage.getItem('app:anthropicApiKey') ?? '');
    }
  }, [open]);

  const hasKey = value.trim().length > 0;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app:anthropicApiKey', value.trim());
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app:anthropicApiKey');
    }
    setValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">AI Features (Optional)</p>
            <p className="text-xs text-muted-foreground mb-3">
              Enter your Anthropic API key to enable bullet writing suggestions.
              Your key is stored in your browser only — it is never sent to any
              server other than Anthropic.
            </p>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            {hasKey && (
              <button
                onClick={handleClear}
                className="rounded border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
