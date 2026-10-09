import { 
  nigeriaQuestions,
  nigeriaDomesticQuestions,
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  ghanaQuestions,
  ghanaDomesticQuestions,
  beceQuestions,
  kenyaQuestions,
  kenyaDomesticQuestions,
  kcseQuestions,
  southAfricaQuestions,
  southAfricaDomesticQuestions,
  nscQuestions,
  allAfricanCountriesDomesticQuestions
} from './countries';
import { 
  waecQuestions, 
  waecGceQuestions, 
  sharedRegionalQuestions 
} from './regional_exams';
import { Question, deduplicateQuestions } from '../helper';

/**
 * All Africa Examination Questions
 * Deduplicated so questions shared by multiple countries (like WAEC)
 * appear exactly once in the master list.
 */
export const africaQuestions: Question[] = deduplicateQuestions([
  allAfricanCountriesDomesticQuestions,
  sharedRegionalQuestions
]);

export {
  // Nigeria
  nigeriaQuestions,
  nigeriaDomesticQuestions,
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  // Ghana
  ghanaQuestions,
  ghanaDomesticQuestions,
  beceQuestions,
  // Kenya
  kenyaQuestions,
  kenyaDomesticQuestions,
  kcseQuestions,
  // South Africa
  southAfricaQuestions,
  southAfricaDomesticQuestions,
  nscQuestions,
  // Shared Regional Bodies
  waecQuestions,
  waecGceQuestions,
  sharedRegionalQuestions
};
