import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExamType, Subject } from '../../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
