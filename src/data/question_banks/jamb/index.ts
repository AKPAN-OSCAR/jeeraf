import { Question } from '../../../types';

/**
 * JAMB Question Bank Registry
 * Automatically imports and registers all JSON question files placed inside this directory.
 */
const jsonModules = import.meta.glob<{ default: Question[] | Question }>('./**/*.json', { eager: true });

export const jambQuestions: Question[] = Object.values(jsonModules).flatMap(mod => {
  const data = mod.default;
  return Array.isArray(data) ? data : [data];
});

