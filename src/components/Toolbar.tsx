'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/resumeStore';
import { exportResume, importResume } from '@/lib/fileIO';
import { Save, Upload, FileText, ChevronDown, Pencil, Copy, Trash2, Plus, Settings2 } from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';
import { AtsScoreModal } from '@/components/AtsScoreModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Resume card used inside the manager dialog
// ---------------------------------------------------------------------------

interface ResumeCardProps {
  title: string;
  isActive: boolean;
  isOnlyOne: boolean;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function ResumeCard({ title, isActive, isOnlyOne, onOpen, onRename, onDuplicate, onDelete }: ResumeCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
        isActive ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/50'
      }`}
    >
      {/* Title / rename input */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setDraft(title); setEditing(false); }
            }}
            className="w-full text-sm bg-background border border-input rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <button
            onClick={onOpen}
            className="text-sm font-medium truncate w-full text-left hover:text-primary"
            title={title}
          >
            {title}
            {isActive && (
              <span className="ml-2 text-xs text-primary font-normal">(active)</span>
            )}
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => { setDraft(title); setEditing(true); }}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Rename"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDuplicate}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          disabled={isOnlyOne}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          title={isOnlyOne ? "Can't delete your only resume" : "Delete"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Resume manager dialog content
// ---------------------------------------------------------------------------

interface ResumeManagerProps {
  onClose: () => void;
}

function ResumeManager({ onClose }: ResumeManagerProps) {
  const { resumeIndex, activeResumeId, openResume, createResume, duplicateResume, deleteResume, renameResume } =
    useResumeStore();

  // Load titles from localStorage for each resume in the index
  const [titles, setTitles] = useState<Record<string, string>>({});

  // Refresh titles whenever index changes (or on open)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const map: Record<string, string> = {};
    for (const id of resumeIndex) {
      const raw = localStorage.getItem(`resume:${id}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { meta?: { title?: string } };
          map[id] = parsed?.meta?.title ?? 'Untitled';
        } catch {
          map[id] = 'Untitled';
        }
      }
    }
    setTitles(map);
  }, [resumeIndex, activeResumeId]);

  // Active resume title is always up-to-date from store
  const { resume } = useResumeStore();
  const mergedTitles = { ...titles, [activeResumeId]: resume.meta.title };

  const handleOpen = (id: string) => {
    openResume(id);
    onClose();
  };

  const handleCreate = () => {
    createResume();
    onClose();
  };

  const handleRename = (id: string, title: string) => {
    renameResume(id, title);
    setTitles((prev) => ({ ...prev, [id]: title }));
  };

  const handleDuplicate = (id: string) => {
    duplicateResume(id);
    // titles will refresh via useEffect when resumeIndex changes
  };

  const handleDelete = (id: string) => {
    deleteResume(id);
  };

  // Filter out orphans silently
  const validIds = resumeIndex.filter(
    (id) => typeof window === 'undefined' || localStorage.getItem(`resume:${id}`) !== null
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {validIds.map((id) => (
          <ResumeCard
            key={id}
            title={mergedTitles[id] ?? 'Untitled'}
            isActive={id === activeResumeId}
            isOnlyOne={validIds.length === 1}
            onOpen={() => handleOpen(id)}
            onRename={(title) => handleRename(id, title)}
            onDuplicate={() => handleDuplicate(id)}
            onDelete={() => handleDelete(id)}
          />
        ))}
      </div>
      <Button variant="outline" className="w-full" onClick={handleCreate}>
        <Plus className="h-4 w-4 mr-2" />
        New Resume
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

export function Toolbar() {
  const { resume, loadResume } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importResume(file);
      loadResume(data);
    } catch {
      alert('Failed to load resume file. Make sure it is a valid .resumejson file.');
    }
    e.target.value = '';
  };

  const truncatedTitle =
    resume.meta.title.length > 20 ? `${resume.meta.title.slice(0, 20)}…` : resume.meta.title;

  return (
    <header className="h-12 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">ResumeBuilder</span>
        <span className="text-xs text-muted-foreground hidden sm:block ml-2">
          — free forever, yours forever
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Resume switcher */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1 max-w-[180px]">
                <span className="truncate text-xs">{truncatedTitle}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>My Resumes</DialogTitle>
            </DialogHeader>
            <ResumeManager onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportResume(resume)}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Save
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".resumejson"
          className="hidden"
          onChange={handleImport}
        />

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setAtsOpen(true)}
        >
          ATS Score
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AtsScoreModal open={atsOpen} onOpenChange={setAtsOpen} />
    </header>
  );
}
