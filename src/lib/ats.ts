import { ResumeData } from '@/types/resume';

export interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
}

const STOPWORDS = new Set([
  'the', 'and', 'or', 'in', 'of', 'to', 'a', 'an', 'is', 'are', 'for', 'with',
  'that', 'this', 'you', 'we', 'our', 'your', 'will', 'be', 'have', 'has', 'on',
  'at', 'by', 'from', 'as', 'it', 'its', 'not', 'but', 'was', 'were', 'been',
  'can', 'should', 'would', 'their',
]);

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

  return Array.from(new Set(tokens));
}

function resumeToText(data: ResumeData): string {
  const parts: string[] = [];

  // Personal summary
  parts.push(data.personal.summary);

  // Experience
  for (const exp of data.experience) {
    parts.push(exp.title, exp.company);
    parts.push(...exp.bullets);
  }

  // Education
  for (const edu of data.education) {
    parts.push(edu.degree, edu.field, edu.institution);
    if (edu.highlights) parts.push(...edu.highlights);
  }

  // Skills
  for (const skill of data.skills) {
    parts.push(skill.category);
    parts.push(...skill.items);
  }

  // Projects
  for (const proj of data.projects) {
    parts.push(proj.name, proj.description);
    parts.push(...proj.bullets);
    parts.push(...proj.technologies);
  }

  // Certifications
  for (const cert of data.certifications) {
    parts.push(cert.name, cert.issuer);
  }

  // Languages
  for (const lang of data.languages) {
    parts.push(lang.language);
  }

  return parts.join(' ');
}

export function scoreResume(data: ResumeData, jobDescription: string): AtsResult {
  const jdKeywords = extractKeywords(jobDescription);

  if (jdKeywords.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const resumeKeywords = new Set(extractKeywords(resumeToText(data)));

  const matched = jdKeywords.filter((k) => resumeKeywords.has(k));
  const missing = jdKeywords.filter((k) => !resumeKeywords.has(k));
  const score = Math.round((matched.length / jdKeywords.length) * 100);

  return {
    score,
    matched: Array.from(new Set(matched)).slice(0, 20),
    missing: Array.from(new Set(missing)).slice(0, 15),
  };
}
