import { Question } from '../../../types';
import { normalizeQuestion } from '../../lib/utils';

// Explicit Manual Imports of Past Question Files
import waecMath2011Json from './mathematics/waec_math_2011.json';
import waecMath2012Json from './mathematics/waec_math_2012.json';
import waecMath2013Json from './mathematics/waec_math_2013.json';
import waecMath2015Json from './mathematics/waec_math_2015.json';

/**
 * WAEC Question Bank Manual Registry
 * Statically registered past exam questions.
 * 
 * TO REGISTER A NEW YEAR / SUBJECT:
 * 1. Place the JSON file in its subject folder (e.g. ./mathematics/waec_math_2014.json)
 * 2. Add an import above:
 *    import waecMath2014Json from './mathematics/waec_math_2014.json';
 * 3. Add it to the manualQuestions array below:
 *    ...(waecMath2014Json as unknown as Question[]),
 */
export const manualQuestions: Question[] = [
  ...(waecMath2011Json as unknown as Question[]),
  ...(waecMath2012Json as unknown as Question[]),
  ...(waecMath2013Json as unknown as Question[]),
  ...(waecMath2015Json as unknown as Question[])
];

// Deduplicate questions by ID and normalize subject, year, LaTeX math formatting
const questionMap = new Map<string, Question>();
for (const rawQ of manualQuestions) {
  if (rawQ && rawQ.id) {
    const q = normalizeQuestion(rawQ);
    questionMap.set(String(q.id), q);
  }
}

export const waecQuestions: Question[] = Array.from(questionMap.values());
