import { RawQuestion } from '../../../questions';

export const waecEnglishQuestions: RawQuestion[] = [
  {
    id: 'waec-eng-1',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'From the words provided, choose the one that is most nearly opposite in meaning to the underlined word: The doctor was commended for his <u>meticulous</u> attention to patient hygiene.',
    options: ['Careless', 'Accurate', 'Diligent', 'Cautious'],
    correctAnswer: 0,
    explanation: `Step 1: Understand "meticulous": Showing great attention to detail; very careful and precise.
Step 2: Antonym: "Careless" is the direct opposite.
Result: "Careless".`,
    topic: 'Antonyms',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-eng-2',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Choose the correct form to complete the sentence: She insisted ______ paying for the meal.',
    options: ['on', 'in', 'at', 'for'],
    correctAnswer: 0,
    explanation: `Step 1: The verb "insist" collocates with the preposition "on" (or "upon") followed by a gerund.
Result: "on".`,
    topic: 'Prepositions',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  }
];
