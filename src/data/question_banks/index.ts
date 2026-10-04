import { Question } from '../../types';
import { waecQuestions } from './waec';
import { jambQuestions } from './jamb';
import { necoQuestions } from './neco';
import { waecGceQuestions } from './waec_gce';
import { necoGceQuestions } from './neco_gce';

/**
 * Master Built-In Core Syllabus Questions Registry
 * Clean, structured, verifiable past questions categorized by national CBT exam body, subject, and year.
 */
export const allBuiltinQuestions: Question[] = [
  ...waecQuestions,
  ...jambQuestions,
  ...necoQuestions,
  ...waecGceQuestions,
  ...necoGceQuestions
];

export { waecQuestions, jambQuestions, necoQuestions, waecGceQuestions, necoGceQuestions };
