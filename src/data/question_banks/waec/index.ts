import { Question } from '../../../types';

/**
 * WAEC Question Bank Registry
 * Automatically imports and registers all JSON question files placed inside this directory.
 * When you add a new year (e.g. waec_math_2016.json), it is automatically discovered and loaded!
 */
const jsonModules = import.meta.glob<{ default: Question[] | Question }>('./**/*.json', { eager: true });

export const waecQuestions: Question[] = Object.values(jsonModules).flatMap(mod => {
  const data = mod.default;
  return Array.isArray(data) ? data : [data];
});
