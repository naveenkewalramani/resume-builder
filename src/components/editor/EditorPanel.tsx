'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PersonalForm } from './PersonalForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { ProjectsForm } from './ProjectsForm';
import { CertificationsForm } from './CertificationsForm';
import { LanguagesForm } from './LanguagesForm';
import { SampleDataBanner } from './SampleDataBanner';
import { useResumeStore } from '@/store/resumeStore';
import { cn } from '@/lib/utils';

type PanelId = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages';

const NAV_ITEMS: { id: PanelId; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'languages', label: 'Languages' },
];

// Sections that can be toggled (personal is always visible)
const TOGGLEABLE_SECTIONS: PanelId[] = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages'];

const FONT_SIZE_OPTIONS: Array<{ label: string; value: 'small' | 'medium' | 'large' }> = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

export function EditorPanel() {
  const [activePanel, setActivePanel] = useState<PanelId>('personal');
  const { resume, updateSection, updateMeta } = useResumeStore();

  const getSectionVisible = (id: PanelId): boolean => {
    const sec = resume.sections.find((s) => s.id === id);
    return sec?.visible ?? true;
  };

  const handleToggleSection = (id: PanelId) => {
    const current = getSectionVisible(id);
    updateSection(id, { visible: !current });
  };

  return (
    <div className="flex h-full border-r bg-background">
      {/* Left sidebar */}
      <div className="w-[220px] shrink-0 flex flex-col border-r bg-muted/30">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Resume Editor</h2>
        </div>
        <SampleDataBanner />

        <div className="flex-1 overflow-y-auto py-2">
          {/* Panel nav */}
          <div className="px-2 mb-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                  activePanel === item.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sections visibility toggles */}
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Sections
            </p>
            <div className="space-y-1">
              {TOGGLEABLE_SECTIONS.map((id) => {
                const item = NAV_ITEMS.find((n) => n.id === id)!;
                const visible = getSectionVisible(id);
                return (
                  <label
                    key={id}
                    className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-muted text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => handleToggleSection(id)}
                      className="rounded accent-primary h-3.5 w-3.5"
                    />
                    <span className={cn('text-sm', !visible && 'text-muted-foreground')}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Style controls */}
          <div className="px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Style
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Accent color</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={resume.meta.accentColor}
                    onChange={(e) => updateMeta({ accentColor: e.target.value })}
                    className="h-7 w-10 rounded border border-input cursor-pointer bg-background p-0.5"
                    title="Choose accent color"
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {resume.meta.accentColor}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Font size</p>
                <div className="flex gap-1">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateMeta({ fontSize: opt.value })}
                      className={cn(
                        'flex-1 py-1 rounded text-xs font-medium transition-colors border',
                        resume.meta.fontSize === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-input hover:bg-muted'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {activePanel === 'personal' && <PersonalForm />}
            {activePanel === 'experience' && <ExperienceForm />}
            {activePanel === 'education' && <EducationForm />}
            {activePanel === 'skills' && <SkillsForm />}
            {activePanel === 'projects' && <ProjectsForm />}
            {activePanel === 'certifications' && <CertificationsForm />}
            {activePanel === 'languages' && <LanguagesForm />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
