import { ResumeData } from '@/types/resume';

export interface TemplateProps {
  data: ResumeData;
}

export interface BuiltInTemplate {
  id: string;
  name: string;
  description: string;
  component: React.FC<TemplateProps>;
}
