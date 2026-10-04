import { Question } from '../../../types';
import necoMath2024Json from './mathematics/neco_math_2024.json';

export const necoQuestions: Question[] = [
  ...(necoMath2024Json as unknown as Question[])
];
