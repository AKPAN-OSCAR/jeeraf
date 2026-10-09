import { Question, normalizeQuestion } from '../../../helper';
import waecGceMath2024Json from './mathematics/waec_gce_math_2024.json';

/**
 * WAEC GCE Question Bank Manual Registry
 */
export const manualQuestions: Question[] = [
  ...(waecGceMath2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const rawQ of manualQuestions) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const waecGceQuestions: Question[] = Array.from(questionMap.values());
