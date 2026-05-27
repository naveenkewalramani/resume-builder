'use client';

import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Skill } from '@/types/resume';

function SkillItemEditor({ skill, onUpdate }: { skill: Skill; onUpdate: (items: string[]) => void }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || skill.items.includes(trimmed)) return;
    onUpdate([...skill.items, trimmed]);
    setInput('');
  };

  const remove = (item: string) => onUpdate(skill.items.filter((i) => i !== item));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skill.items.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1 pr-1">
            {item}
            <button onClick={() => remove(item)} className="hover:text-destructive">
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
          placeholder="Add skill, press Enter"
          className="h-8 text-sm"
        />
        <Button variant="ghost" size="sm" onClick={add} className="h-8 px-2">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function SkillsForm() {
  const { resume, addSkillCategory, updateSkill, removeSkill } = useResumeStore();
  const skills = resume.skills;

  return (
    <div className="space-y-4">
      {skills.map((sk: Skill, idx: number) => (
        <div key={sk.id} className="space-y-2">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-2 space-y-1">
              <Label>Category</Label>
              <Input
                value={sk.category}
                onChange={(e) => updateSkill(sk.id, { category: e.target.value })}
                placeholder="Languages, Frameworks, Tools..."
                className="h-8"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 mt-5 text-muted-foreground hover:text-destructive"
              onClick={() => removeSkill(sk.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            <Label>Skills</Label>
            <SkillItemEditor
              skill={sk}
              onUpdate={(items) => updateSkill(sk.id, { items })}
            />
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addSkillCategory} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>
    </div>
  );
}
