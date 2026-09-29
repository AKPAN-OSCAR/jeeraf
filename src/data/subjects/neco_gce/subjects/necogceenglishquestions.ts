import { RawQuestion } from '../../../questions';

export const necoGceEnglishQuestions: RawQuestion[] = [
  {
    id: 'necogce-eng-1',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Select the word that correctly completes the sentence: The committee has reached a ______ on the proposed budget.',
    options: ['consensus', 'concensus', 'consencus', 'concensuz'],
    correctAnswer: 0,
    explanation: `Step 1: Check standard English spelling of the noun meaning general agreement:
   - "consensus" is spelled with 's' throughout (c-o-n-s-e-n-s-u-s).
Result: "consensus".`,
    topic: 'Spelling & Vocabulary',
    allowedExamTypes: ['NECO GCE', 'Personal CBT']
  }
];
