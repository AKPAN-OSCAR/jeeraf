import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExamType, Subject, Question } from '../../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUBJECT_MAP: Record<string, Subject> = {
  'mathematics': 'Mathematics',
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'english': 'English',
  'english language': 'English',
  'physics': 'Physics',
  'chemistry': 'Chemistry',
  'biology': 'Biology',
  'economics': 'Economics',
  'government': 'Government',
  'literature': 'Literature',
  'literature in english': 'Literature',
  'geography': 'Geography',
  'commerce': 'Commerce',
  'accounting': 'Accounting',
  'financial accounting': 'Accounting',
  'agricultural science': 'Agricultural Science',
  'agric': 'Agricultural Science',
  'civic education': 'Civic Education',
  'further mathematics': 'Further Mathematics',
  'history': 'History',
  'crk': 'CRK',
  'christian religious knowledge': 'CRK',
  'irk': 'IRK',
  'islamic religious knowledge': 'IRK',
  'yoruba': 'Yoruba',
  'hausa': 'Hausa',
  'igbo': 'Igbo',
  'french': 'French',
  'general': 'General'
};

export function normalizeSubject(raw: any): Subject {
  if (!raw) return 'General';
  const clean = String(raw).trim().toLowerCase();
  return SUBJECT_MAP[clean] || (raw as Subject);
}

export function sanitizeMathText(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Replace ASCII control character artifacts (form-feed \x0c and bell \x07) from OCR/PDF extraction
    .replace(/\x0crac/g, '\\frac')
    .replace(/\x0c/g, '\\')
    .replace(/\x07pprox/g, '\\approx')
    .replace(/\x07ngle/g, '\\angle')
    .replace(/\x07/g, '')
    // Clean any accidental prefixed letters on standard LaTeX commands
    .replace(/\\a\\angle/g, '\\angle')
    .replace(/\\r\\right/g, '\\right')
    .replace(/\\t\\triangle/g, '\\triangle');
}

export function sanitizeDiagramSvg(rawSvg?: string | null): string {
  if (!rawSvg || typeof rawSvg !== 'string') return '';
  return rawSvg
    // Replace restrictive inline max-width:240px so the diagram can scale comfortably to container
    .replace(/style="[^"]*max-width\s*:\s*\d+px[^"]*"/gi, 'style="max-width:100%;margin:auto;display:block;"')
    .replace(/width="\d+px"/gi, 'width="100%"');
}

export function normalizeQuestion(q: any): Question {
  if (!q) return q;
  return {
    ...q,
    question: sanitizeMathText(q.question),
    options: Array.isArray(q.options) ? q.options.map((opt: string) => sanitizeMathText(opt)) : [],
    explanation: sanitizeMathText(q.explanation),
    passage: q.passage ? sanitizeMathText(q.passage) : null,
    subject: normalizeSubject(q.subject),
    year: Number(q.year) || q.year,
    examType: String(q.examType || '').trim().toUpperCase() as ExamType,
    diagram: q.diagram ? sanitizeDiagramSvg(q.diagram) : null
  };
}

export const getStandardLimit = (examType: ExamType | null | undefined, subject: Subject | null | undefined): number => {
  if (!examType || !subject) return 50;
  
  if (examType === 'JAMB') {
    return subject === 'English' ? 60 : 40;
  }
  
  if (['WAEC', 'NECO', 'WAEC GCE', 'NECO GCE'].includes(examType)) {
    return subject === 'English' ? 80 : 50;
  }
  
  return 50; // Default fallback
};

/**
 * Standard National CBT Historical Examination Years
 * Full archive from 2025 down to 1990 (36 continuous exam years)
 */
export const STANDARD_NATIONAL_EXAM_YEARS: number[] = Array.from(
  { length: 36 },
  (_, i) => 2025 - i
);
