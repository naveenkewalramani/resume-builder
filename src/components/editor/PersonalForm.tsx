'use client';

import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function PersonalForm() {
  const { resume, updatePersonal } = useResumeStore();
  const p = resume.personal;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <Label>Full Name</Label>
          <Input
            value={p.fullName}
            onChange={(e) => updatePersonal({ fullName: e.target.value })}
            placeholder="Alex Johnson"
          />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            value={p.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="alex@email.com"
            type="email"
          />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input
            value={p.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Location</Label>
          <Input
            value={p.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>LinkedIn</Label>
          <Input
            value={p.linkedin ?? ''}
            onChange={(e) => updatePersonal({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/yourname"
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>GitHub</Label>
          <Input
            value={p.github ?? ''}
            onChange={(e) => updatePersonal({ github: e.target.value })}
            placeholder="github.com/yourname"
          />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Website</Label>
          <Input
            value={p.website ?? ''}
            onChange={(e) => updatePersonal({ website: e.target.value })}
            placeholder="yourwebsite.com"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Professional Summary</Label>
        <Textarea
          value={p.summary}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
          placeholder="Brief overview of your experience and goals..."
          rows={4}
        />
      </div>
    </div>
  );
}
