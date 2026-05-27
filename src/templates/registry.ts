import { BuiltInTemplate } from './types';
import { ClassicTemplate } from './classic';
import { ModernTemplate } from './modern';
import { MinimalTemplate } from './minimal';

export const builtInTemplates: BuiltInTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, single-column layout. ATS-friendly.',
    component: ClassicTemplate,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with accent sidebar.',
    component: ModernTemplate,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Whitespace-heavy, elegant.',
    component: MinimalTemplate,
  },
];

export function getTemplate(id: string): BuiltInTemplate | undefined {
  return builtInTemplates.find((t) => t.id === id);
}
