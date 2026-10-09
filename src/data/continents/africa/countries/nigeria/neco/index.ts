import { Question, normalizeQuestion } from '../../../../helper';
import necoMath2024Json from './mathematics/neco_math_2024.json';

/**
 * NECO Question Bank Manual Registry
 */
export const manualQuestions: Question[] = [
  ...(necoMath2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const rawQ of manualQuestions) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const necoQuestions: Question[] = Array.from(questionMap.values());
