import { Question, deduplicateQuestions } from './helper';
import { 
  africaQuestions,
  nigeriaQuestions,
  ghanaQuestions,
  kenyaQuestions,
  southAfricaQuestions,
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  beceQuestions,
  kcseQuestions,
  nscQuestions,
  waecQuestions,
  waecGceQuestions,
  sharedRegionalQuestions
} from './africa';
import { europeQuestions } from './europe';
import { americasQuestions } from './americas';
import { asiaQuestions } from './asia';

/**
 * Master Global Continental Question Registry
 * Combines questions from all operational and active continents.
 */
export const allBuiltinQuestions: Question[] = deduplicateQuestions([
  africaQuestions,
  europeQuestions,
  americasQuestions,
  asiaQuestions
]);

export {
  // Continents
  africaQuestions,
  europeQuestions,
  americasQuestions,
  asiaQuestions,
  // African Countries
  nigeriaQuestions,
  ghanaQuestions,
  kenyaQuestions,
  southAfricaQuestions,
  // Individual Exams
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  beceQuestions,
  kcseQuestions,
  nscQuestions,
  waecQuestions,
  waecGceQuestions,
  sharedRegionalQuestions
};
