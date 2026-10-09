import { Question, normalizeQuestion } from '../../../../helper';
import necoGceMath2024Json from './mathematics/neco_gce_math_2024.json';

/**
 * NECO GCE Question Bank Manual Registry
 */
export const manualQuestions: Question[] = [
  ...(necoGceMath2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const rawQ of manualQuestions) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const necoGceQuestions: Question[] = Array.from(questionMap.values());
