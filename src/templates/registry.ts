import { BuiltInTemplate } from './types';
import { ClassicTemplate } from './classic';

export const builtInTemplates: BuiltInTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, single-column layout. ATS-friendly.',
    component: ClassicTemplate,
  },
];

export function getTemplate(id: string): BuiltInTemplate | undefined {
  return builtInTemplates.find((t) => t.id === id);
}
