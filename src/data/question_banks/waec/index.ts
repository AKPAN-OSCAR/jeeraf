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



import { Question } from '../../../types';

// 1. Import your JSON files
import waecMath2015 from './mathematics/waec_math_2015.json';
import waecMath2012 from './mathematics/waec_math_2012.json'; // <--- NEW IMPORT

/**
 * WAEC Question Bank Registry
 */
export const waecQuestions: Question[] = [
  ...(waecMath2015 as unknown as Question[]),
  ...(waecMath2012 as unknown as Question[])                  // <--- NEW SPREAD
];