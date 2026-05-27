'use client';

import { useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BulletEditor } from './BulletEditor';
import { Trash2, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { Project } from '@/types/resume';
import { getApiKey, suggestBullets } from '@/lib/ai';
import { SettingsModal } from '@/components/SettingsModal';

// ---------------------------------------------------------------------------
// Tech tag editor
// ---------------------------------------------------------------------------

function TechTagEditor({
  technologies,
  onChange,
}: {
  technologies: string[];
  onChange: (technologies: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || technologies.includes(trimmed)) return;
    onChange([...technologies, trimmed]);
    setInput('');
  };

  const remove = (item: string) => onChange(technologies.filter((t) => t !== item));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {technologies.map((tech) => (
          <Badge key={tech} variant="secondary" className="gap-1 pr-1">
            {tech}
            <button onClick={() => remove(tech)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add technology, press Enter"
          className="h-8 text-sm"
        />
        <Button variant="ghost" size="sm" onClick={add} className="h-8 px-2">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-project suggest button
// ---------------------------------------------------------------------------

interface SuggestBulletsButtonProps {
  project: Project;
  onAdd: (bullets: string[]) => void;
}

function SuggestBulletsButton({ project, onAdd }: SuggestBulletsButtonProps) {
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
        title: project.name,
        company: '',
        existingBullets: project.bullets,
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
// ProjectsForm
// ---------------------------------------------------------------------------

export function ProjectsForm() {
  const { resume, addProject, updateProject, removeProject } = useResumeStore();
  const projects = resume.projects;

  return (
    <div className="space-y-4">
      {projects.map((proj: Project, idx: number) => (
        <div key={proj.id} className="space-y-3">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Project {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeProject(proj.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Project Name</Label>
              <Input
                value={proj.name}
                onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                placeholder="My Awesome Project"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <Input
                value={proj.description}
                onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                placeholder="Brief description of the project"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>URL (optional)</Label>
              <Input
                value={proj.url ?? ''}
                onChange={(e) => updateProject(proj.id, { url: e.target.value || undefined })}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Technologies</Label>
            <TechTagEditor
              technologies={proj.technologies}
              onChange={(technologies) => updateProject(proj.id, { technologies })}
            />
          </div>
          <div className="space-y-1">
            <Label>Highlights</Label>
            <BulletEditor
              bullets={proj.bullets}
              onChange={(bullets) => updateProject(proj.id, { bullets })}
            />
            <SuggestBulletsButton
              project={proj}
              onAdd={(newBullets) =>
                updateProject(proj.id, { bullets: [...proj.bullets, ...newBullets] })
              }
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addProject} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
}
