import { ResumeData } from '@/types/resume';

export function resumeToMustacheVars(data: ResumeData): Record<string, unknown> {
  return {
    personal: {
      fullName: data.personal.fullName,
      email: data.personal.email,
      phone: data.personal.phone,
      location: data.personal.location,
      website: data.personal.website ?? '',
      linkedin: data.personal.linkedin ?? '',
      github: data.personal.github ?? '',
      summary: data.personal.summary,
    },
    experience: data.experience.map((e) => ({
      ...e,
      endDateDisplay: e.current ? 'Present' : (e.endDate ?? ''),
    })),
    education: data.education.map((e) => ({
      ...e,
      endDateDisplay: e.current ? 'Present' : (e.endDate ?? ''),
    })),
    skills: data.skills,
    projects: data.projects,
    certifications: data.certifications,
    languages: data.languages,
    meta: { accentColor: data.meta.accentColor },
  };
}
