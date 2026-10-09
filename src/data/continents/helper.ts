import { Question, ExamType, Subject } from '../../types';
import { normalizeQuestion } from '../lib/utils';

export type { Question, ExamType, Subject };
export { normalizeQuestion };

/**
 * Normalizes an array of raw question objects, ensuring required fields and formatting are valid.
 */
export function normalizeQuestionArray(rawQuestions: any[]): Question[] {
  const validList: Question[] = [];
  for (const raw of rawQuestions) {
    if (raw && raw.id) {
      validList.push(normalizeQuestion(raw));
    }
  }
  return validList;
}

/**
 * Deduplicates questions by unique ID
 */
export function deduplicateQuestions(questionArrays: Question[][]): Question[] {
  const map = new Map<string, Question>();
  for (const list of questionArrays) {
    for (const q of list) {
      if (q && q.id) {
        map.set(String(q.id), q);
      }
    }
  }
  return Array.from(map.values());
}
