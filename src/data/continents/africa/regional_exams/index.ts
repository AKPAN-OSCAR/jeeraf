import { waecQuestions } from './waec';
import { waecGceQuestions } from './waec_gce';
import { Question } from '../helper';

/**
 * Shared Regional & Multinational Examinations in Africa
 * Example: WAEC and WAEC GCE are taken across 5 West African member nations:
 * Nigeria, Ghana, Sierra Leone, Liberia, and The Gambia.
 * Placing them here prevents duplicating question files across each country.
 */
export const sharedRegionalQuestions: Question[] = [
  ...waecQuestions,
  ...waecGceQuestions
];

export {
  waecQuestions,
  waecGceQuestions
};
