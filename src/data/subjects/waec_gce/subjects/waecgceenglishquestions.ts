import { RawQuestion } from '../../../questions';

export const waecGceEnglishQuestions: RawQuestion[] = [
  {
    id: 'waecgce-eng-1',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Identify the part of speech of the capitalized word in the sentence: The train arrived EARLY.',
    options: ['Adverb', 'Adjective', 'Noun', 'Preposition'],
    correctAnswer: 0,
    explanation: `Step 1: The word "EARLY" modifies the verb "arrived", indicating the time of arrival.
Step 2: Words that modify verbs are adverbs.
Result: Adverb.`,
    topic: 'Parts of Speech',
    allowedExamTypes: ['WAEC GCE', 'Personal CBT']
  }
];
