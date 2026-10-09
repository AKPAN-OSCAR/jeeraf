import { nscQuestions, nscBank } from './nsc';
import { Question } from '../../../helper';

/**
 * South Africa Examinations Registry
 * Administered by Department of Basic Education (DBE)
 */
export const southAfricaDomesticQuestions: Question[] = [
  ...nscQuestions
];

export const southAfricaAllQuestions: Question[] = [
  ...nscQuestions
];

export {
  nscQuestions,
  nscBank
};
