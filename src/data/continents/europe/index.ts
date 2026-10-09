import { Question } from '../helper';
import { europeCountryQuestions } from './countries';
import { europeRegionalQuestions } from './regional_exams';

export const europeQuestions: Question[] = [
  ...europeCountryQuestions,
  ...europeRegionalQuestions
];
