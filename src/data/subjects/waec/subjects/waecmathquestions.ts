import { RawQuestion } from '../../../questions';

export const waecMathematicsQuestions: RawQuestion[] = [
  {
    id: 'waec-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Solve for $x$ in the inequality: $3(x - 2) < 2(x + 5)$',
    options: ['$x < 16$', '$x < -16$', '$x > 16$', '$x < 4$'],
    correctAnswer: 0,
    explanation: `Step 1: Expand both brackets:
   $3x - 6 < 2x + 10$
Step 2: Group like terms by subtracting $2x$ and adding $6$:
   $3x - 2x < 10 + 6$
Step 3: Simplify:
   $x < 16$
Result: $x < 16$.`,
    topic: 'Linear Inequalities',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-2',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'A bag contains $5$ red balls, $4$ blue balls, and $3$ green balls. If a ball is picked at random, what is the probability that it is NOT red?',
    options: ['$\\frac{7}{12}$', '$\\frac{5}{12}$', '$\\frac{1}{3}$', '$\\frac{3}{4}$'],
    correctAnswer: 0,
    explanation: `Step 1: Total balls in the bag $= 5 + 4 + 3 = 12$.
Step 2: Number of balls that are NOT red (Blue + Green) $= 4 + 3 = 7$.
Step 3: Probability $P(\\text{Not Red}) = \\frac{7}{12}$.
Result: $\\frac{7}{12}$.`,
    topic: 'Probability',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-3',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'Calculate the total surface area of a solid cylinder of radius $7\\text{ cm}$ and height $10\\text{ cm}$. [Take $\\pi = \\frac{22}{7}$]',
    options: ['$748\\text{ cm}^2$', '$440\\text{ cm}^2$', '$308\\text{ cm}^2$', '$1540\\text{ cm}^2$'],
    correctAnswer: 0,
    explanation: `Step 1: Formula for total surface area of a cylinder:
   $A = 2\\pi r(r + h)$
Step 2: Substitute $r = 7\\text{ cm}$, $h = 10\\text{ cm}$, and $\\pi = \\frac{22}{7}$:
   $A = 2 \\times \\frac{22}{7} \\times 7 \\times (7 + 10) = 44 \\times 17 = 748\\text{ cm}^2$.
Result: Total surface area is $748\\text{ cm}^2$.`,
    topic: 'Mensuration',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  }
];
