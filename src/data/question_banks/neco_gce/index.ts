import { Question } from '../../../types';
import necoGceMath2024Json from './mathematics/neco_gce_math_2024.json';

export const necoGceQuestions: Question[] = [
  ...(necoGceMath2024Json as unknown as Question[])
];
