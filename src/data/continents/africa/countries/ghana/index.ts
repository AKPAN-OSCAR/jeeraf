import { beceQuestions, beceBank } from './bece';
// Linked shared regional bodies written by Ghana
import { waecQuestions } from '../../regional_exams';
import { Question } from '../../../helper';

/**
 * Ghana Examinations Registry
 * Combines Ghana national exams (BECE) and shared West African exams (WAEC WASSCE).
 */
export const ghanaDomesticQuestions: Question[] = [
  ...beceQuestions
];

export const ghanaAllQuestions: Question[] = [
  ...beceQuestions,
  ...waecQuestions
];

export {
  beceQuestions,
  beceBank,
  waecQuestions as ghanaWaecQuestions
};
