/// <reference types="vite/client" />
import { Question } from '../../../types';
import { normalizeQuestion } from '../../lib/utils';
import waecMath2015Json from './mathematics/waec_math_2015.json';
import waecMath2012Json from './mathematics/waec_math_2012.json';
import waecMath2013Json from './mathematics/waec_math_2012.json';


/**
 * WAEC Question Bank Dual Registry (Automatic + Manual)
 * 1. AUTOMATIC: Automatically discovers and registers all *.json question files in this directory.
 * 2. MANUAL: Explicitly imports known past questions so they are guaranteed to load in all environments.
 * Both sources are safely combined, normalized, and deduplicated by question ID.
 */

// 1. Automatic Discovery via Vite glob
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

/**
 * 2. Manual Registration (Fallback / Explicit registration)
 * Statically registered files ensure immediate availability across all tools and runtimes.
 */
export const manualQuestions: Question[] = [
  ...(waecMath2015Json as unknown as Question[]),
  ...(waecMath2012Json as unknown as Question[]),
  ...(waecMath2013Json as unknown as Question[])
];

// Merge both sources and deduplicate by question ID
const questionMap = new Map<string, Question>();
for (const rawQ of [...autoQuestions, ...manualQuestions]) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const waecQuestions: Question[] = Array.from(questionMap.values());



