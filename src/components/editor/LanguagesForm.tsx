'use client';

import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { Language } from '@/types/resume';

const PROFICIENCY_OPTIONS: Language['proficiency'][] = ['Native', 'Fluent', 'Intermediate', 'Basic'];

export function LanguagesForm() {
  const { resume, addLanguage, updateLanguage, removeLanguage } = useResumeStore();
  const languages = resume.languages;

  return (
    <div className="space-y-4">
      {languages.map((lang: Language, idx: number) => (
        <div key={lang.id} className="space-y-3">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Language {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeLanguage(lang.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Language</Label>
              <Input
                value={lang.language}
                onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                placeholder="English"
              />
            </div>
            <div className="space-y-1">
              <Label>Proficiency</Label>
              <select
                value={lang.proficiency}
                onChange={(e) =>
                  updateLanguage(lang.id, { proficiency: e.target.value as Language['proficiency'] })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PROFICIENCY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addLanguage} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Language
      </Button>
    </div>
  );
}
