import { Question } from '../../../types';
import { normalizeQuestion } from '../../lib/utils';

// Explicit Manual Imports of JAMB Past Question Files
import jambMath2024Json from './mathematics/jamb_math_2024.json';
import jambEnglish2024Json from './english/jamb_english_2024.json';
import jambPhysics2024Json from './physics/jamb_physics_2024.json';
import jambChemistry2024Json from './chemistry/jamb_chemistry_2024.json';
import jambBiology2024Json from './biology/jamb_biology_2024.json';

/**
 * JAMB Question Bank Manual Registry
 */
export const manualQuestions: Question[] = [
  ...(jambMath2024Json as unknown as Question[]),
  ...(jambEnglish2024Json as unknown as Question[]),
  ...(jambPhysics2024Json as unknown as Question[]),
  ...(jambChemistry2024Json as unknown as Question[]),
  ...(jambBiology2024Json as unknown as Question[])
];

const questionMap = new Map<string, Question>();
for (const rawQ of manualQuestions) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const jambQuestions: Question[] = Array.from(questionMap.values());
