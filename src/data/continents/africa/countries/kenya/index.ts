import { kcseQuestions, kcseBank } from './kcse';
import { Question } from '../../../helper';

/**
 * Kenya Examinations Registry
 * Administered by Kenya National Examinations Council (KNEC)
 */
export const kenyaDomesticQuestions: Question[] = [
  ...kcseQuestions
];

export const kenyaAllQuestions: Question[] = [
  ...kcseQuestions
];

export {
  kcseQuestions,
  kcseBank
};
