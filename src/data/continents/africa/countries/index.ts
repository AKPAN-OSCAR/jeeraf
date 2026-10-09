import { 
  nigeriaAllQuestions, 
  nigeriaDomesticQuestions, 
  jambQuestions, 
  necoQuestions, 
  necoGceQuestions 
} from './nigeria';
import { 
  ghanaAllQuestions, 
  ghanaDomesticQuestions, 
  beceQuestions 
} from './ghana';
import { 
  kenyaAllQuestions, 
  kenyaDomesticQuestions, 
  kcseQuestions 
} from './kenya';
import { 
  southAfricaAllQuestions, 
  southAfricaDomesticQuestions, 
  nscQuestions 
} from './south_africa';
import { Question } from '../helper';

export {
  // Nigeria
  nigeriaAllQuestions as nigeriaQuestions,
  nigeriaDomesticQuestions,
  jambQuestions,
  necoQuestions,
  necoGceQuestions,
  // Ghana
  ghanaAllQuestions as ghanaQuestions,
  ghanaDomesticQuestions,
  beceQuestions,
  // Kenya
  kenyaAllQuestions as kenyaQuestions,
  kenyaDomesticQuestions,
  kcseQuestions,
  // South Africa
  southAfricaAllQuestions as southAfricaQuestions,
  southAfricaDomesticQuestions,
  nscQuestions
};

export const allAfricanCountriesDomesticQuestions: Question[] = [
  ...nigeriaDomesticQuestions,
  ...ghanaDomesticQuestions,
  ...kenyaDomesticQuestions,
  ...southAfricaDomesticQuestions
];
