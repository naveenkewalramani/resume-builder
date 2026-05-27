export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa?: string;
  highlights?: string[];
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
}

export type SectionKey =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages';

export interface ResumeSection {
  id: SectionKey;
  label: string;
  visible: boolean;
  order: number;
}

export interface ResumeMeta {
  id: string;
  title: string;
  templateId: string;
  customTemplateHtml?: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  sections: ResumeSection[];
  meta: ResumeMeta;
}
