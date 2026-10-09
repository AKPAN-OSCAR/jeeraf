import { Question } from '../helper';
import { asiaCountryQuestions } from './countries';
import { asiaRegionalQuestions } from './regional_exams';

export const asiaQuestions: Question[] = [
  ...asiaCountryQuestions,
  ...asiaRegionalQuestions
];
