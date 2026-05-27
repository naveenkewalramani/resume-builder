'use client';

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Upload } from 'lucide-react';
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
                <div className="grid grid-cols-2 gap-1">
                  {(['classic', 'modern', 'minimal', 'custom'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateMeta({ templateId: t })}
                      className={cn(
                        'py-1 rounded text-[10px] font-medium transition-colors border flex items-center justify-center gap-0.5',
                        resume.meta.templateId === t
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-input hover:bg-muted'
                      )}
                    >
                      {t === 'custom' && <Upload className="h-3 w-3" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
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
