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
  },
  {
    id: 'neco-math-theory-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    section: 'Theory',
    type: 'theory',
    marks: 10,
    question: `Two positive numbers are in the ratio $3:5$. If $8$ is added to each number, the new ratio becomes $2:3$.

Find:
(a) the original two numbers.
(b) the sum of their squares.`,
    options: [],
    correctAnswer: -1,
    explanation: `**Solution:**
Let the common ratio multiplier be $k$.
Then the two numbers are $3k$ and $5k$.

1. Form the equation when $8$ is added:
   $$\\frac{3k + 8}{5k + 8} = \\frac{2}{3}$$
2. Cross multiply:
   $$3(3k + 8) = 2(5k + 8)$$
   $$9k + 24 = 10k + 16$$
   $$10k - 9k = 24 - 16 \\implies k = 8$$
3. (a) Original numbers:
   - First number $= 3(8) = 24$
   - Second number $= 5(8) = 40$.
4. (b) Sum of their squares:
   $$24^2 + 40^2 = 576 + 1600 = 2176$$.`,
    modelAnswer: `(a) The numbers are 24 and 40. (b) Sum of their squares = 2176.`,
    topic: 'Ratio & Word Problems',
    allowedExamTypes: ['NECO', 'NECO GCE', 'Personal CBT']
  }
];
