'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}

export function BulletEditor({ bullets, onChange }: Props) {
  const update = (i: number, val: string) => {
    const next = [...bullets];
    next[i] = val;
    onChange(next);
  };

  const remove = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));

  const add = () => onChange([...bullets, '']);

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <span className="text-muted-foreground text-sm w-3 shrink-0">•</span>
          <Input
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Describe an achievement..."
            className="h-8 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="text-muted-foreground h-7 px-2">
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add bullet
      </Button>
    </div>
  );
}
