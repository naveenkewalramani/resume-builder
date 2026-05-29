'use client';

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// ---------------------------------------------------------------------------
// Template thumbnail SVGs — abstract layout sketches, accent-color-aware
// ---------------------------------------------------------------------------

function ClassicThumb({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="54" fill="#f8f8f8" rx="2"/>
      {/* header strip */}
      <rect x="0" y="0" width="80" height="12" fill={accent} rx="2"/>
      <rect x="0" y="10" width="80" height="2" fill={accent}/>
      {/* name line */}
      <rect x="8" y="3" width="30" height="3" fill="white" rx="1"/>
      <rect x="8" y="7.5" width="44" height="1.5" fill="white" opacity="0.7" rx="0.5"/>
      {/* section header */}
      <rect x="8" y="17" width="18" height="2" fill={accent} rx="0.5"/>
      <rect x="8" y="20.5" width="64" height="0.5" fill={accent} opacity="0.4"/>
      {/* content lines */}
      <rect x="8" y="23" width="55" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="8" y="26" width="48" height="1.5" fill="#ddd" rx="0.5"/>
      <rect x="8" y="29" width="52" height="1.5" fill="#ddd" rx="0.5"/>
      {/* section header 2 */}
      <rect x="8" y="34" width="22" height="2" fill={accent} rx="0.5"/>
      <rect x="8" y="37.5" width="64" height="0.5" fill={accent} opacity="0.4"/>
      <rect x="8" y="40" width="50" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="8" y="43" width="44" height="1.5" fill="#ddd" rx="0.5"/>
      <rect x="8" y="46" width="47" height="1.5" fill="#ddd" rx="0.5"/>
    </svg>
  );
}

function ModernThumb({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="54" fill="#f8f8f8" rx="2"/>
      {/* left accent column */}
      <rect x="0" y="0" width="24" height="54" fill={accent} rx="2"/>
      <rect x="22" y="0" width="2" height="54" fill={accent}/>
      {/* left col: name + contact */}
      <rect x="3" y="5" width="16" height="2.5" fill="white" rx="0.5"/>
      <rect x="3" y="9" width="12" height="1.5" fill="white" opacity="0.6" rx="0.5"/>
      <rect x="3" y="12" width="14" height="1.5" fill="white" opacity="0.6" rx="0.5"/>
      {/* left col: skills header */}
      <rect x="3" y="18" width="10" height="1.5" fill="white" opacity="0.8" rx="0.5"/>
      <rect x="3" y="21" width="16" height="1" fill="white" opacity="0.5" rx="0.5"/>
      <rect x="3" y="23.5" width="14" height="1" fill="white" opacity="0.5" rx="0.5"/>
      <rect x="3" y="26" width="15" height="1" fill="white" opacity="0.5" rx="0.5"/>
      {/* right col: section header */}
      <rect x="28" y="7" width="20" height="2" fill={accent} rx="0.5"/>
      <rect x="28" y="10" width="44" height="0.5" fill={accent} opacity="0.4"/>
      {/* right col: content */}
      <rect x="28" y="13" width="40" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="28" y="16" width="35" height="1.5" fill="#ddd" rx="0.5"/>
      <rect x="28" y="19" width="38" height="1.5" fill="#ddd" rx="0.5"/>
      <rect x="28" y="25" width="22" height="2" fill={accent} rx="0.5"/>
      <rect x="28" y="28" width="44" height="0.5" fill={accent} opacity="0.4"/>
      <rect x="28" y="31" width="38" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="28" y="34" width="32" height="1.5" fill="#ddd" rx="0.5"/>
    </svg>
  );
}

function MinimalThumb({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="54" fill="#f8f8f8" rx="2"/>
      {/* centered name */}
      <rect x="22" y="6" width="36" height="3" fill={accent} rx="1"/>
      {/* centered contact dots */}
      <rect x="16" y="11.5" width="48" height="1.5" fill="#bbb" rx="0.5"/>
      {/* section header — no divider */}
      <rect x="12" y="20" width="16" height="1.5" fill={accent} rx="0.5"/>
      {/* accent left-border bullets */}
      <rect x="12" y="24" width="2" height="4" fill={accent} rx="0.5"/>
      <rect x="16" y="24.5" width="42" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="16" y="27" width="36" height="1.5" fill="#ddd" rx="0.5"/>
      <rect x="12" y="31" width="2" height="4" fill={accent} rx="0.5"/>
      <rect x="16" y="31.5" width="38" height="1.5" fill="#ccc" rx="0.5"/>
      <rect x="16" y="34" width="32" height="1.5" fill="#ddd" rx="0.5"/>
      {/* section header 2 */}
      <rect x="12" y="41" width="20" height="1.5" fill={accent} rx="0.5"/>
      <rect x="12" y="45" width="2" height="4" fill={accent} rx="0.5"/>
      <rect x="16" y="45.5" width="40" height="1.5" fill="#ccc" rx="0.5"/>
    </svg>
  );
}

function CustomThumb() {
  return (
    <svg viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="54" fill="#f8f8f8" rx="2"/>
      <rect x="1" y="1" width="78" height="52" rx="2" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 2"/>
      {/* upload arrow */}
      <path d="M40 30 L40 20 M36 24 L40 20 L44 24" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* base line */}
      <rect x="34" y="31" width="12" height="1.5" fill="#d1d5db" rx="0.5"/>
      {/* label */}
      <rect x="24" y="37" width="32" height="2" fill="#e5e7eb" rx="0.5"/>
    </svg>
  );
}
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomTemplatePanel } from './CustomTemplatePanel';
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

const FONT_SIZE_OPTIONS: Array<{ label: string; value: 'small' | 'medium' | 'large' }> = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
];

interface SortableSectionItemProps {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}

function SortableSectionItem({ id, label, visible, onToggle }: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1 px-1 py-1 rounded hover:bg-muted text-sm',
        isDragging && 'opacity-50 ring-1 ring-primary/30 bg-muted'
      )}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </span>
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={visible}
          onChange={onToggle}
          className="rounded accent-primary h-3.5 w-3.5"
        />
        <span className={cn('text-sm', !visible && 'text-muted-foreground')}>
          {label}
        </span>
      </label>
    </div>
  );
}

export function EditorPanel() {
  const [activePanel, setActivePanel] = useState<PanelId>('personal');
  const { resume, updateSection, updateMeta, reorderSections } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // 'personal' is never draggable — always first
  const draggableSections = resume.sections
    .filter((s) => s.id !== 'personal')
    .sort((a, b) => a.order - b.order);

  const getSectionVisible = (id: PanelId): boolean => {
    const sec = resume.sections.find((s) => s.id === id);
    return sec?.visible ?? true;
  };

  const handleToggleSection = (id: PanelId) => {
    const current = getSectionVisible(id);
    updateSection(id, { visible: !current });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = draggableSections.findIndex((s) => s.id === active.id);
    const newIndex = draggableSections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(draggableSections, oldIndex, newIndex);
    const personalSection = resume.sections.find((s) => s.id === 'personal')!;
    reorderSections([
      { ...personalSection, order: 0 },
      ...reordered.map((s, i) => ({ ...s, order: i + 1 })),
    ]);
  };

  return (
    <div className="flex h-full border-r bg-background">
      {/* Left sidebar */}
      <div className="w-[180px] shrink-0 flex flex-col border-r bg-muted/30">
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

          {/* Sections visibility toggles + drag-to-reorder */}
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Sections
            </p>
            <div className="space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={draggableSections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {draggableSections.map((section) => {
                    const navItem = NAV_ITEMS.find((n) => n.id === section.id)!;
                    return (
                      <SortableSectionItem
                        key={section.id}
                        id={section.id}
                        label={navItem.label}
                        visible={section.visible}
                        onToggle={() => handleToggleSection(section.id as PanelId)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Style controls */}
          <div className="px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Style
            </p>
            <div className="space-y-3">
              {/* Template picker */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Template</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { id: 'classic', label: 'Classic' },
                    { id: 'modern', label: 'Modern' },
                    { id: 'minimal', label: 'Minimal' },
                    { id: 'custom', label: 'Custom' },
                  ] as const).map(({ id, label }) => {
                    const isActive = resume.meta.templateId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => updateMeta({ templateId: id })}
                        className={cn(
                          'flex flex-col rounded-md border overflow-hidden transition-all text-left',
                          isActive
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-input hover:border-muted-foreground/50'
                        )}
                        title={label}
                      >
                        <div className="h-[42px] w-full bg-white">
                          {id === 'classic' && <ClassicThumb accent={resume.meta.accentColor} />}
                          {id === 'modern' && <ModernThumb accent={resume.meta.accentColor} />}
                          {id === 'minimal' && <MinimalThumb accent={resume.meta.accentColor} />}
                          {id === 'custom' && <CustomThumb />}
                        </div>
                        <div className={cn(
                          'px-1.5 py-0.5 text-[10px] font-medium text-center w-full',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        )}>
                          {label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {resume.meta.templateId !== 'custom' && (
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
              )}
            </div>
          </div>
          {resume.meta.templateId === 'custom' && <CustomTemplatePanel />}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
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
