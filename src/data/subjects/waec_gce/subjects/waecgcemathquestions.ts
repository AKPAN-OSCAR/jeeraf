import { RawQuestion } from '../../../questions';

export const waecGceMathematicsQuestions: RawQuestion[] = [
  {
    id: 'waecgce-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Find the simple interest on $\\mathbb{N}50,000$ for $3\\text{ years}$ at $8\\%$ per annum.',
    options: ['$\\mathbb{N}12,000$', '$\\mathbb{N}10,000$', '$\\mathbb{N}15,000$', '$\\mathbb{N}8,000$'],
    correctAnswer: 0,
    explanation: `Step 1: Formula for Simple Interest: $I = \\frac{P \\times R \\times T}{100}$.
Step 2: Substitute $P = 50000$, $R = 8$, $T = 3$:
   $I = \\frac{50000 \\times 8 \\times 3}{100} = 500 \\times 24 = 12000$.
Result: $\\mathbb{N}12,000$.`,
    topic: 'Commercial Arithmetic',
    allowedExamTypes: ['WAEC GCE', 'Personal CBT']
  }
];
