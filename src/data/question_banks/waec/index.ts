import { Question } from '../../../types';
import waecMath2015Json from './mathematics/waec_math_2015.json';

/**
 * WAEC Question Bank Registry
 * Imports structured JSON question files directly without requiring manual TypeScript conversions.
 */
export const waecQuestions: Question[] = [
  ...(waecMath2015Json as unknown as Question[])
];
