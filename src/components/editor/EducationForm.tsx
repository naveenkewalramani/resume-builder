'use client';

import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { Education } from '@/types/resume';

export function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const entries = resume.education;

  return (
    <div className="space-y-4">
      {entries.map((edu: Education, idx: number) => (
        <div key={edu.id} className="space-y-3">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Education {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeEducation(edu.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label>Institution</Label>
              <Input
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                placeholder="University of California"
              />
            </div>
            <div className="space-y-1">
              <Label>Degree</Label>
              <Input
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="Bachelor of Science"
              />
            </div>
            <div className="space-y-1">
              <Label>Field of Study</Label>
              <Input
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                placeholder="Berkeley, CA"
              />
            </div>
            <div className="space-y-1">
              <Label>GPA (optional)</Label>
              <Input
                value={edu.gpa ?? ''}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                placeholder="3.8"
              />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                placeholder="YYYY-MM"
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                value={edu.endDate ?? ''}
                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value || null })}
                placeholder="YYYY-MM"
                disabled={edu.current}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={edu.current}
                  onChange={(e) =>
                    updateEducation(edu.id, { current: e.target.checked, endDate: e.target.checked ? null : edu.endDate })
                  }
                  className="rounded"
                />
                Currently studying
              </label>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addEducation} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
