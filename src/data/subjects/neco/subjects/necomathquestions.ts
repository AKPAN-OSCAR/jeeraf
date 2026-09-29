import { RawQuestion } from '../../../questions';

export const necoMathematicsQuestions: RawQuestion[] = [
  {
    id: 'neco-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Find the quadratic equation whose roots are $-3$ and $\\frac{1}{2}$.',
    options: ['$2x^2 + 5x - 3 = 0$', '$2x^2 - 5x - 3 = 0$', '$2x^2 + 5x + 3 = 0$', '$x^2 + 5x - 6 = 0$'],
    correctAnswer: 0,
    explanation: `Step 1: For roots $\\alpha = -3$ and $\\beta = \\frac{1}{2}$:
   - Sum of roots: $S = -3 + \\frac{1}{2} = -\\frac{5}{2}$
   - Product of roots: $P = (-3) \\times \\frac{1}{2} = -\\frac{3}{2}$
Step 2: Use formula $x^2 - Sx + P = 0$:
   $x^2 - \\left(-\\frac{5}{2}\\right)x + \\left(-\\frac{3}{2}\\right) = 0 \\implies x^2 + \\frac{5}{2}x - \\frac{3}{2} = 0$
Step 3: Multiply through by 2:
   $2x^2 + 5x - 3 = 0$.
Result: $2x^2 + 5x - 3 = 0$.`,
    topic: 'Quadratic Equations',
    allowedExamTypes: ['NECO', 'NECO GCE', 'Personal CBT']
  }
];
