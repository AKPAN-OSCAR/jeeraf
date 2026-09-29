import { RawQuestion } from '../../../questions';

export const necoEnglishQuestions: RawQuestion[] = [
  {
    id: 'neco-eng-1',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Select the option nearest in meaning to the underlined phrase: The manager asked the new recruit to <u>toe the line</u>.',
    options: ['Follow the company rules strictly', 'Run in a straight line', 'Cross the boundary', 'Challenge the policy'],
    correctAnswer: 0,
    explanation: `Step 1: Idiom definition: "To toe the line" means to accept and follow the authority, rules, or standards of a group or organization.
Result: "Follow the company rules strictly".`,
    topic: 'Idioms & Phrases',
    allowedExamTypes: ['NECO', 'NECO GCE', 'Personal CBT']
  }
];
