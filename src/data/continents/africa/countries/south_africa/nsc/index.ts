import { Question } from '../../../../helper';
import nscMath2024 from './mathematics/nsc_math_2024.json';

export const nscBank: Record<string, Record<string, Question[]>> = {
  mathematics: {
    '2024': nscMath2024 as Question[]
  }
};

export const nscQuestions: Question[] = [
  ...(nscMath2024 as Question[])
];
