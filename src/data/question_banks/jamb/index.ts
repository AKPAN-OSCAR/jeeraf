/// <reference types="vite/client" />
import { Question } from '../../../types';
import jambMath2024Json from './mathematics/jamb_math_2024.json';
import jambEnglish2024Json from './english/jamb_english_2024.json';
import jambPhysics2024Json from './physics/jamb_physics_2024.json';
import jambChemistry2024Json from './chemistry/jamb_chemistry_2024.json';
import jambBiology2024Json from './biology/jamb_biology_2024.json';

/**
 * JAMB Question Bank Dual Registry (Automatic + Manual)
 * 1. AUTOMATIC: Automatically discovers and registers all *.json question files in this directory.
 * 2. MANUAL: Explicitly imports known past questions so they are guaranteed to load in all environments.
 * Both sources are safely combined and deduplicated by question ID.
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
  ...(jambMath2024Json as unknown as Question[]),
  ...(jambEnglish2024Json as unknown as Question[]),
  ...(jambPhysics2024Json as unknown as Question[]),
  ...(jambChemistry2024Json as unknown as Question[]),
  ...(jambBiology2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const q of [...autoQuestions, ...manualQuestions]) {
  if (q && q.id) {
    questionMap.set(String(q.id), q);
  }
}

export const jambQuestions: Question[] = Array.from(questionMap.values());


