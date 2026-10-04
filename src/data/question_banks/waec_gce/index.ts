import { Question } from '../../../types';
import waecGceMath2024Json from './mathematics/waec_gce_math_2024.json';

export const waecGceQuestions: Question[] = [
  ...(waecGceMath2024Json as unknown as Question[])
];
