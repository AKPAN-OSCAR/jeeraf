import { jambQuestions } from './jamb';
import { necoQuestions } from './neco';
import { necoGceQuestions } from './neco_gce';
// Linked shared regional bodies written by Nigeria across West Africa
import { waecQuestions, waecGceQuestions } from '../../regional_exams';
import { Question } from '../../../helper';

/**
 * Nigeria Examinations Registry
 * Combines Nigerian domestic exams (JAMB, NECO, NECO GCE)
 * and shared multinational exams taken in Nigeria (WAEC, WAEC GCE).
 */
export const nigeriaDomesticQuestions: Question[] = [
  ...jambQuestions,
  ...necoQuestions,
  ...necoGceQuestions
];

export const nigeriaAllQuestions: Question[] = [
  ...nigeriaDomesticQuestions,
  ...waecQuestions,
  ...waecGceQuestions
];

export {
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  waecQuestions as nigeriaWaecQuestions,
  waecGceQuestions as nigeriaWaecGceQuestions
};
