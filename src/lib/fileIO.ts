import { ResumeData } from '@/types/resume';

export function exportResume(data: ResumeData) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.meta.title.replace(/\s+/g, '-').toLowerCase()}.resumejson`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importResume(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ResumeData;
        if (!data.meta?.id || !data.personal) {
          reject(new Error('Invalid resume file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Failed to parse resume file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
