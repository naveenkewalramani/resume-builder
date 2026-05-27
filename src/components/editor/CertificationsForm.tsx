'use client';

import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { Certification } from '@/types/resume';

export function CertificationsForm() {
  const { resume, addCertification, updateCertification, removeCertification } = useResumeStore();
  const certifications = resume.certifications;

  return (
    <div className="space-y-4">
      {certifications.map((cert: Certification, idx: number) => (
        <div key={cert.id} className="space-y-3">
          {idx > 0 && <Separator />}
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Certification {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeCertification(cert.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Certification Name</Label>
              <Input
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                placeholder="AWS Solutions Architect"
              />
            </div>
            <div className="space-y-1">
              <Label>Issuer</Label>
              <Input
                value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                placeholder="Amazon Web Services"
              />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                value={cert.date}
                onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                placeholder="YYYY-MM"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>URL (optional)</Label>
              <Input
                value={cert.url ?? ''}
                onChange={(e) => updateCertification(cert.id, { url: e.target.value || undefined })}
                placeholder="https://credential.link/..."
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addCertification} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Certification
      </Button>
    </div>
  );
}
