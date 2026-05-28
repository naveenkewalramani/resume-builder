import { v4 as uuidv4 } from 'uuid';
import type {
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
} from '@/types/resume';
import { createEmptyResume } from '@/lib/sampleData';

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseCSVLine(line);
      return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]));
    });
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

function parseLinkedInDate(raw: string): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  const parts = s.split(' ');
  if (parts.length === 2 && MONTHS[parts[0]] && /^\d{4}$/.test(parts[1])) {
    return `${parts[1]}-${MONTHS[parts[0]]}`;
  }
  if (/^\d{4}$/.test(s)) return `${s}-01`;
  return '';
}

// ── Section parsers ───────────────────────────────────────────────────────────

function parsePositions(csv: string): WorkExperience[] {
  return parseCSV(csv).map((row) => {
    const finished = row['Finished On'] ?? '';
    const isCurrent = !finished;
    const desc = row['Description'] ?? '';
    const bullets = desc
      .split(/\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    return {
      id: uuidv4(),
      company: row['Company Name'] ?? '',
      title: row['Title'] ?? '',
      location: row['Location'] ?? '',
      startDate: parseLinkedInDate(row['Started On'] ?? ''),
      endDate: isCurrent ? null : parseLinkedInDate(finished),
      current: isCurrent,
      bullets: bullets.length ? bullets : [''],
    };
  });
}

function parseEducation(csv: string): Education[] {
  return parseCSV(csv).map((row) => {
    const finished = row['End Date'] ?? '';
    const isCurrent = !finished;
    return {
      id: uuidv4(),
      institution: row['School Name'] ?? '',
      degree: row['Degree Name'] ?? '',
      field: row['Field Of Study'] ?? row['Notes'] ?? '',
      location: '',
      startDate: parseLinkedInDate(row['Start Date'] ?? ''),
      endDate: isCurrent ? null : parseLinkedInDate(finished),
      current: isCurrent,
    };
  });
}

function parseSkills(csv: string): Skill[] {
  const items = parseCSV(csv)
    .map((row) => row['Name'] ?? '')
    .filter(Boolean);
  if (!items.length) return [];
  return [{ id: uuidv4(), category: 'Skills', items }];
}

function parseProjects(csv: string): Project[] {
  return parseCSV(csv).map((row) => ({
    id: uuidv4(),
    name: row['Title'] ?? '',
    description: row['Description'] ?? '',
    url: row['Url'] ?? '',
    technologies: [],
    bullets: [],
  }));
}

function parseCertifications(csv: string): Certification[] {
  return parseCSV(csv).map((row) => ({
    id: uuidv4(),
    name: row['Name'] ?? '',
    issuer: row['Authority'] ?? '',
    date: parseLinkedInDate(row['Started On'] ?? ''),
    url: row['Url'] ?? '',
  }));
}

const PROFICIENCY_MAP: [string, Language['proficiency']][] = [
  ['native', 'Native'],
  ['bilingual', 'Native'],
  ['full professional', 'Fluent'],
  ['professional working', 'Fluent'],
  ['limited working', 'Intermediate'],
  ['elementary', 'Basic'],
];

function mapProficiency(raw: string): Language['proficiency'] {
  const lower = raw.toLowerCase();
  for (const [key, val] of PROFICIENCY_MAP) {
    if (lower.includes(key)) return val;
  }
  return 'Intermediate';
}

function parseLanguages(csv: string): Language[] {
  return parseCSV(csv).map((row) => ({
    id: uuidv4(),
    language: row['Name'] ?? '',
    proficiency: mapProficiency(row['Proficiency'] ?? ''),
  }));
}

// ── ZIP helpers ───────────────────────────────────────────────────────────────

type ZipFile = { async(type: 'text'): Promise<string> };
type ZipFiles = Record<string, ZipFile>;

function findFile(files: ZipFiles, name: string): ZipFile | undefined {
  const lower = name.toLowerCase();
  const key = Object.keys(files).find(
    (k) => k.toLowerCase().endsWith('/' + lower) || k.toLowerCase() === lower
  );
  return key ? files[key] : undefined;
}

async function tryParse<T>(
  files: ZipFiles,
  filename: string,
  parser: (csv: string) => T
): Promise<T | undefined> {
  const entry = findFile(files, filename);
  if (!entry) return undefined;
  try {
    return parser(await entry.async('text'));
  } catch {
    return undefined;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function parseLinkedInZip(file: File): Promise<ResumeData> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  const files = zip.files as ZipFiles;

  const [experience, education, skills, projects, certifications, languages] =
    await Promise.all([
      tryParse(files, 'Positions.csv', parsePositions),
      tryParse(files, 'Education.csv', parseEducation),
      tryParse(files, 'Skills.csv', parseSkills),
      tryParse(files, 'Projects.csv', parseProjects),
      tryParse(files, 'Certifications.csv', parseCertifications),
      tryParse(files, 'Languages.csv', parseLanguages),
    ]);

  // Best-effort personal info from Profile.csv / Basic_Info.csv
  let fullName = '';
  const profileText = await findFile(files, 'Profile.csv')?.async('text').catch(() => '');
  if (profileText) {
    const rows = parseCSV(profileText);
    const first = rows[0]?.['First Name'] ?? '';
    const last = rows[0]?.['Last Name'] ?? '';
    fullName = `${first} ${last}`.trim();
  }

  let email = '';
  const basicFile =
    findFile(files, 'Basic_Info.csv') ?? findFile(files, 'Email_Addresses.csv');
  const basicText = await basicFile?.async('text').catch(() => '');
  if (basicText) {
    const rows = parseCSV(basicText);
    email = rows[0]?.['Email Address'] ?? rows[0]?.['Email address'] ?? '';
  }

  const base = createEmptyResume();
  return {
    ...base,
    meta: {
      ...base.meta,
      title: fullName ? `${fullName} — LinkedIn Import` : 'LinkedIn Import',
    },
    personal: { ...base.personal, fullName, email },
    experience: experience ?? base.experience,
    education: education ?? base.education,
    skills: skills ?? base.skills,
    projects: projects ?? base.projects,
    certifications: certifications ?? base.certifications,
    languages: languages ?? base.languages,
  };
}
