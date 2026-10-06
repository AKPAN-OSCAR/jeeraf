/// <reference types="vite/client" />
import { Question } from '../../../types';
import necoGceMath2024Json from './mathematics/neco_gce_math_2024.json';

/**
 * NECO GCE Question Bank Dual Registry (Automatic + Manual)
 */
interface JsonQuestionModule {
  default?: Question[] | Question;
  [key: string]: any;
}

const jsonModules: Record<string, JsonQuestionModule> = 
  typeof import.meta !== 'undefined' && (import.meta as any).glob 
    ? (import.meta as any).glob('./**/*.json', { eager: true }) 
    : {};

const autoQuestions: Question[] = Object.values(jsonModules).flatMap((mod: any) => {
  if (!mod) return [];
  const raw = mod.default !== undefined ? mod.default : mod;
  return Array.isArray(raw) ? raw : [raw];
});

export const manualQuestions: Question[] = [
  ...(necoGceMath2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const q of [...autoQuestions, ...manualQuestions]) {
  if (q && q.id) {
    questionMap.set(String(q.id), q);
  }
}

export const necoGceQuestions: Question[] = Array.from(questionMap.values());


