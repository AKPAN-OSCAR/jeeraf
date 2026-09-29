import { RawQuestion } from '../../../questions';

export const necoGceMathematicsQuestions: RawQuestion[] = [
  {
    id: 'necogce-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Convert the binary number $11011_2$ to base 10 (decimal).',
    options: ['$27$', '$25$', '$29$', '$31$'],
    correctAnswer: 0,
    explanation: `Step 1: Expand $11011_2$ in powers of 2 from right to left:
   $(1 \\times 2^4) + (1 \\times 2^3) + (0 \\times 2^2) + (1 \\times 2^1) + (1 \\times 2^0)$
Step 2: Calculate each term:
   $16 + 8 + 0 + 2 + 1 = 27$.
Result: $27_{10}$.`,
    topic: 'Number Bases',
    allowedExamTypes: ['NECO GCE', 'Personal CBT']
  }
];
