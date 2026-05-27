'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  ResumeData,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  ResumeSection,
} from '@/types/resume';
import { sampleResumeData, createEmptyResume } from '@/lib/sampleData';

const SAMPLE_FLAG_KEY = 'resume:is_sample';
const INDEX_KEY = 'resume:index';
const ACTIVE_KEY = 'resume:active';
const LEGACY_KEY = 'resume:current';

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function migrateStorage(): void {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  const hasIndex = localStorage.getItem(INDEX_KEY) !== null;
  if (legacy && !hasIndex) {
    const id = uuidv4();
    localStorage.setItem(`resume:${id}`, legacy);
    localStorage.setItem(INDEX_KEY, JSON.stringify([id]));
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.removeItem(LEGACY_KEY);
  }
}

function loadIndex(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // corrupted
  }
  return [];
}

function persistIndex(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

function loadResumeById(id: string): ResumeData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`resume:${id}`);
    if (raw) return JSON.parse(raw) as ResumeData;
  } catch {
    // corrupted
  }
  return null;
}

function saveResumeById(id: string, data: ResumeData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`resume:${id}`, JSON.stringify(data));
}

function deleteResumeById(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`resume:${id}`);
}

function initStore(): { resume: ResumeData; activeResumeId: string; resumeIndex: string[]; isSampleData: boolean } {
  if (typeof window === 'undefined') {
    // SSR: return sample data with a temporary id
    return { resume: sampleResumeData, activeResumeId: '', resumeIndex: [], isSampleData: false };
  }

  migrateStorage();

  let index = loadIndex();

  if (index.length === 0) {
    // Brand new user — create first resume from sample data and mark as sample
    const id = uuidv4();
    saveResumeById(id, sampleResumeData);
    index = [id];
    persistIndex(index);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.setItem(SAMPLE_FLAG_KEY, 'true');
    return { resume: sampleResumeData, activeResumeId: id, resumeIndex: index, isSampleData: true };
  }

  // Determine active resume
  let activeId = localStorage.getItem(ACTIVE_KEY) ?? index[0];
  if (!index.includes(activeId)) activeId = index[0];

  // Clean orphans in index
  const cleanIndex = index.filter((id) => localStorage.getItem(`resume:${id}`) !== null);
  if (cleanIndex.length !== index.length) {
    persistIndex(cleanIndex);
    if (!cleanIndex.includes(activeId)) activeId = cleanIndex[0] ?? '';
  }

  if (!activeId || cleanIndex.length === 0) {
    // All resumes were orphaned — recreate
    const id = uuidv4();
    saveResumeById(id, sampleResumeData);
    const newIndex = [id];
    persistIndex(newIndex);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.setItem(SAMPLE_FLAG_KEY, 'true');
    return { resume: sampleResumeData, activeResumeId: id, resumeIndex: newIndex, isSampleData: true };
  }

  const resume = loadResumeById(activeId) ?? sampleResumeData;
  const isSampleData = localStorage.getItem(SAMPLE_FLAG_KEY) === 'true';

  return { resume, activeResumeId: activeId, resumeIndex: cleanIndex, isSampleData };
}

function readSampleFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SAMPLE_FLAG_KEY) === 'true';
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface ResumeStore {
  resume: ResumeData;
  isSampleData: boolean;
  activeResumeId: string;
  resumeIndex: string[];

  // sample data banner
  clearSampleFlag: () => void;

  // personal
  updatePersonal: (personal: Partial<PersonalInfo>) => void;

  // experience
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;

  // education
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  // skills
  addSkillCategory: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  // projects
  addProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // certifications
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // languages
  addLanguage: () => void;
  updateLanguage: (id: string, data: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  // sections
  updateSection: (id: string, data: Partial<ResumeSection>) => void;
  reorderSections: (sections: ResumeSection[]) => void;

  // meta
  updateMeta: (meta: Partial<ResumeData['meta']>) => void;

  // bulk
  loadResume: (data: ResumeData) => void;

  // multi-resume
  createResume: () => void;
  openResume: (id: string) => void;
  duplicateResume: (id?: string) => void;
  deleteResume: (id: string) => void;
  renameResume: (id: string, title: string) => void;
}

// ---------------------------------------------------------------------------
// touch helper
// ---------------------------------------------------------------------------

function touch(resume: ResumeData): ResumeData {
  return { ...resume, meta: { ...resume.meta, updatedAt: new Date().toISOString() } };
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

const initial = typeof window !== 'undefined' ? initStore() : {
  resume: sampleResumeData,
  activeResumeId: '',
  resumeIndex: [] as string[],
  isSampleData: false,
};

export const useResumeStore = create<ResumeStore>((set, get) => {
  // Save current resume to its own key
  const saveActive = (data: ResumeData, activeId: string) => {
    saveResumeById(activeId, data);
  };

  const persist = (updater: (state: ResumeStore) => Partial<ResumeStore>) =>
    set((state) => {
      const next = updater(state);
      if (next.resume) saveActive(next.resume, next.activeResumeId ?? state.activeResumeId);
      return next;
    });

  const clearSampleFlag = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAMPLE_FLAG_KEY);
    }
    set({ isSampleData: false });
  };

  const persistAndClear = (updater: (state: ResumeStore) => Partial<ResumeStore>) => {
    persist(updater);
    clearSampleFlag();
  };

  return {
    resume: initial.resume,
    isSampleData: typeof window !== 'undefined' ? readSampleFlag() : false,
    activeResumeId: initial.activeResumeId,
    resumeIndex: initial.resumeIndex,

    clearSampleFlag,

    updatePersonal: (personal) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, personal: { ...s.resume.personal, ...personal } }),
      })),

    addExperience: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          experience: [
            ...s.resume.experience,
            {
              id: uuidv4(),
              company: '',
              title: '',
              location: '',
              startDate: '',
              endDate: null,
              current: true,
              bullets: [''],
            },
          ],
        }),
      })),

    updateExperience: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          experience: s.resume.experience.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }),
      })),

    removeExperience: (id) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, experience: s.resume.experience.filter((e) => e.id !== id) }),
      })),

    addEducation: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          education: [
            ...s.resume.education,
            {
              id: uuidv4(),
              institution: '',
              degree: '',
              field: '',
              location: '',
              startDate: '',
              endDate: null,
              current: false,
            },
          ],
        }),
      })),

    updateEducation: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          education: s.resume.education.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }),
      })),

    removeEducation: (id) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, education: s.resume.education.filter((e) => e.id !== id) }),
      })),

    addSkillCategory: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          skills: [...s.resume.skills, { id: uuidv4(), category: 'New Category', items: [] }],
        }),
      })),

    updateSkill: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          skills: s.resume.skills.map((sk) => (sk.id === id ? { ...sk, ...data } : sk)),
        }),
      })),

    removeSkill: (id) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, skills: s.resume.skills.filter((sk) => sk.id !== id) }),
      })),

    addProject: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          projects: [
            ...s.resume.projects,
            {
              id: uuidv4(),
              name: '',
              description: '',
              url: '',
              technologies: [],
              bullets: [''],
            },
          ],
        }),
      })),

    updateProject: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          projects: s.resume.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }),
      })),

    removeProject: (id) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, projects: s.resume.projects.filter((p) => p.id !== id) }),
      })),

    addCertification: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          certifications: [
            ...s.resume.certifications,
            {
              id: uuidv4(),
              name: '',
              issuer: '',
              date: '',
              url: '',
            },
          ],
        }),
      })),

    updateCertification: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          certifications: s.resume.certifications.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }),
      })),

    removeCertification: (id) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          certifications: s.resume.certifications.filter((c) => c.id !== id),
        }),
      })),

    addLanguage: () =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          languages: [
            ...s.resume.languages,
            {
              id: uuidv4(),
              language: '',
              proficiency: 'Intermediate' as Language['proficiency'],
            },
          ],
        }),
      })),

    updateLanguage: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          languages: s.resume.languages.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }),
      })),

    removeLanguage: (id) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          languages: s.resume.languages.filter((l) => l.id !== id),
        }),
      })),

    updateSection: (id, data) =>
      persistAndClear((s) => ({
        resume: touch({
          ...s.resume,
          sections: s.resume.sections.map((sec) =>
            sec.id === id ? { ...sec, ...data } : sec
          ),
        }),
      })),

    reorderSections: (sections) =>
      persistAndClear((s) => ({
        resume: touch({ ...s.resume, sections }),
      })),

    updateMeta: (meta) =>
      persist((s) => ({
        resume: { ...s.resume, meta: { ...s.resume.meta, ...meta } },
      })),

    loadResume: (data) => {
      const state = get();
      saveActive(data, state.activeResumeId);
      set({ resume: data });
      clearSampleFlag();
    },

    // Multi-resume actions

    createResume: () => {
      const state = get();
      const newId = uuidv4();
      const newResume = createEmptyResume();
      try {
        saveResumeById(newId, newResume);
        const newIndex = [...state.resumeIndex, newId];
        persistIndex(newIndex);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_KEY, newId);
        }
        set({ resume: newResume, activeResumeId: newId, resumeIndex: newIndex, isSampleData: false });
      } catch {
        // quota exceeded — rollback
        deleteResumeById(newId);
        console.error('Storage quota exceeded — could not create resume');
      }
    },

    openResume: (id) => {
      const state = get();
      const data = loadResumeById(id);
      if (!data) {
        // Stale UUID — remove from index
        const newIndex = state.resumeIndex.filter((i) => i !== id);
        persistIndex(newIndex);
        set({ resumeIndex: newIndex });
        console.error(`Resume ${id} not found in storage`);
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_KEY, id);
      }
      set({ resume: data, activeResumeId: id });
    },

    duplicateResume: (id?) => {
      const state = get();
      const sourceId = id ?? state.activeResumeId;
      const source = sourceId === state.activeResumeId ? state.resume : loadResumeById(sourceId);
      if (!source) return;

      const newId = uuidv4();
      const copy: ResumeData = {
        ...JSON.parse(JSON.stringify(source)) as ResumeData,
        meta: {
          ...source.meta,
          id: newId,
          title: `${source.meta.title} (copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      try {
        saveResumeById(newId, copy);
        const newIndex = [...state.resumeIndex, newId];
        persistIndex(newIndex);
        set({ resumeIndex: newIndex });
      } catch {
        deleteResumeById(newId);
        console.error('Storage quota exceeded — could not duplicate resume');
      }
    },

    deleteResume: (id) => {
      const state = get();
      if (state.resumeIndex.length <= 1) {
        // Cannot delete last resume
        return;
      }
      const newIndex = state.resumeIndex.filter((i) => i !== id);
      deleteResumeById(id);
      persistIndex(newIndex);

      if (state.activeResumeId === id) {
        // Switch to first remaining
        const nextId = newIndex[0];
        const nextResume = loadResumeById(nextId) ?? createEmptyResume();
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_KEY, nextId);
        }
        set({ resume: nextResume, activeResumeId: nextId, resumeIndex: newIndex });
      } else {
        set({ resumeIndex: newIndex });
      }
    },

    renameResume: (id, title) => {
      const state = get();
      // Update stored resume
      const stored = loadResumeById(id);
      if (stored) {
        const updated = { ...stored, meta: { ...stored.meta, title } };
        saveResumeById(id, updated);
      }
      // If active, also update in-memory
      if (id === state.activeResumeId) {
        set((s) => ({
          resume: { ...s.resume, meta: { ...s.resume.meta, title } },
        }));
      }
    },
  };
});
