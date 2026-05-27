import { v4 as uuidv4 } from 'uuid';
import { ResumeData } from '@/types/resume';

export const sampleResumeData: ResumeData = {
  personal: {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson',
    summary:
      'Software engineer with 5+ years building scalable web applications. Passionate about developer experience, clean architecture, and shipping products that users love.',
  },
  experience: [
    {
      id: uuidv4(),
      company: 'Acme Corp',
      title: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: null,
      current: true,
      bullets: [
        'Led migration of monolith to microservices, reducing p99 latency by 40%',
        'Mentored 3 junior engineers and conducted bi-weekly architecture reviews',
        'Built internal CI/CD tooling adopted by 12 engineering teams',
      ],
    },
    {
      id: uuidv4(),
      company: 'StartupXYZ',
      title: 'Software Engineer',
      location: 'Remote',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      bullets: [
        'Owned full-stack development of the payments dashboard (React, Node.js)',
        'Implemented real-time analytics pipeline processing 50k events/minute',
      ],
    },
  ],
  education: [
    {
      id: uuidv4(),
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      current: false,
      gpa: '3.8',
    },
  ],
  skills: [
    {
      id: uuidv4(),
      category: 'Languages',
      items: ['TypeScript', 'Go', 'Python', 'SQL'],
    },
    {
      id: uuidv4(),
      category: 'Frameworks',
      items: ['React', 'Next.js', 'Node.js', 'gRPC'],
    },
    {
      id: uuidv4(),
      category: 'Infrastructure',
      items: ['Kubernetes', 'GCP', 'Terraform', 'Kafka'],
    },
  ],
  projects: [],
  certifications: [],
  languages: [],
  sections: [
    { id: 'personal', label: 'Personal Info', visible: true, order: 0 },
    { id: 'experience', label: 'Work Experience', visible: true, order: 1 },
    { id: 'education', label: 'Education', visible: true, order: 2 },
    { id: 'skills', label: 'Skills', visible: true, order: 3 },
    { id: 'projects', label: 'Projects', visible: false, order: 4 },
    { id: 'certifications', label: 'Certifications', visible: false, order: 5 },
    { id: 'languages', label: 'Languages', visible: false, order: 6 },
  ],
  meta: {
    id: uuidv4(),
    title: 'My Resume',
    templateId: 'classic',
    accentColor: '#2563eb',
    fontSize: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export function createEmptyResume(): ResumeData {
  return {
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    sections: [
      { id: 'personal', label: 'Personal Info', visible: true, order: 0 },
      { id: 'experience', label: 'Work Experience', visible: true, order: 1 },
      { id: 'education', label: 'Education', visible: true, order: 2 },
      { id: 'skills', label: 'Skills', visible: true, order: 3 },
      { id: 'projects', label: 'Projects', visible: false, order: 4 },
      { id: 'certifications', label: 'Certifications', visible: false, order: 5 },
      { id: 'languages', label: 'Languages', visible: false, order: 6 },
    ],
    meta: {
      id: uuidv4(),
      title: 'New Resume',
      templateId: 'classic',
      accentColor: '#2563eb',
      fontSize: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
