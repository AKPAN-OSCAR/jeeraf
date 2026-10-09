import { Question } from '../helper';
import { americasCountryQuestions } from './countries';
import { americasRegionalQuestions } from './regional_exams';

export const americasQuestions: Question[] = [
  ...americasCountryQuestions,
  ...americasRegionalQuestions
];
