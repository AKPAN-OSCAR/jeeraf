import { Question } from '../../../types';

const jsonModules = import.meta.glob<{ default: Question[] | Question }>('./**/*.json', { eager: true });

export const necoQuestions: Question[] = Object.values(jsonModules).flatMap(mod => {
  const data = mod.default;
  return Array.isArray(data) ? data : [data];
});

