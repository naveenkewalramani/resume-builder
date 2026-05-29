'use client';

import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BulletEditor } from './BulletEditor';
import { Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { WorkExperience } from '@/types/resume';
import { getApiKey, suggestBullets } from '@/lib/ai';
import { SettingsModal } from '@/components/SettingsModal';

// ---------------------------------------------------------------------------
// Per-entry suggest button (needs its own state)
// ---------------------------------------------------------------------------

interface SuggestBulletsButtonProps {
  entry: WorkExperience;
  onAdd: (bullets: string[]) => void;
}

function SuggestBulletsButton({ entry, onAdd }: SuggestBulletsButtonProps) {
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSuggest = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    setSuggesting(true);
    setError(null);

    try {
      const newBullets = await suggestBullets(apiKey, {
        title: entry.title,
        company: entry.company,
        existingBullets: entry.bullets,
      });
      onAdd(newBullets);
    } catch (e) {
      console.error('AI suggestion failed:', e);
      setError('Suggestion failed. Check your API key.');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <>
      <div className="mt-1">
        <button
          onClick={handleSuggest}
          disabled={suggesting}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {suggesting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {suggesting ? 'Suggesting...' : 'Suggest bullets'}
        </button>
        {error && (
          <p className="text-xs text-destructive mt-0.5">{error}</p>
        )}
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

// ---------------------------------------------------------------------------
// ExperienceForm
// ---------------------------------------------------------------------------

export function ExperienceForm() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const entries = resume.experience;

  return (
    <div className="space-y-4">
      {entries.map((exp: WorkExperience, idx: number) => (
        <div key={exp.id} className="space-y-3">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Position {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeExperience(exp.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Job Title</Label>
              <Input
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                placeholder="YYYY-MM"
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                value={exp.endDate ?? ''}
                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value || null })}
                placeholder="YYYY-MM"
                disabled={exp.current}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) =>
                    updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? null : exp.endDate })
                  }
                  className="rounded"
                />
                Currently working here
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Achievements</Label>
            <BulletEditor
              bullets={exp.bullets}
              onChange={(bullets) => updateExperience(exp.id, { bullets })}
            />
            <SuggestBulletsButton
              entry={exp}
              onAdd={(newBullets) =>
                updateExperience(exp.id, { bullets: [...exp.bullets, ...newBullets] })
              }
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addExperience} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Position
      </Button>
    </div>
  );
}
