import { Question } from '../../../../helper';
import beceMath2024 from './mathematics/bece_math_2024.json';

export const beceBank: Record<string, Record<string, Question[]>> = {
  mathematics: {
    '2024': beceMath2024 as Question[]
  }
};

export const beceQuestions: Question[] = [
  ...(beceMath2024 as Question[])
];
