import { Question } from '../../../../helper';
import kcseMath2024 from './mathematics/kcse_math_2024.json';

export const kcseBank: Record<string, Record<string, Question[]>> = {
  mathematics: {
    '2024': kcseMath2024 as Question[]
  }
};

export const kcseQuestions: Question[] = [
  ...(kcseMath2024 as Question[])
];
