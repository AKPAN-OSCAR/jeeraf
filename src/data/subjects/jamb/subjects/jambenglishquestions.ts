import { RawQuestion } from '../../../questions';

export const jambEnglishQuestions: RawQuestion[] = [
  {
    id: 'jamb-eng-1',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Choose the option nearest in meaning to the underlined word: The minister decided to <u>repeal</u> the controversial edict.',
    options: ['Abrogate', 'Enforce', 'Amend', 'Prolong'],
    correctAnswer: 0,
    explanation: `Step 1: Understand the definition of "repeal": To formally revoke or annul a law or congressional decree.
Step 2: Evaluate synonym candidates:
   - "Abrogate": To repeal or do away with a formal law (Exact synonym).
   - "Enforce": To compel observance.
   - "Amend": To modify without revoking.
Result: "Abrogate" is the nearest in meaning.`,
    topic: 'Synonyms',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-eng-2',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Choose the option opposite in meaning to the underlined word: The witness gave a <u>lucid</u> account of what transpired at the scene.',
    options: ['Obscure', 'Clear', 'Coherent', 'Intelligible'],
    correctAnswer: 0,
    explanation: `Step 1: Define the target word "lucid": Clear, easy to understand, transparent.
Step 2: Identify the direct antonym:
   - "Obscure": Unclear, vague, difficult to perceive or understand.
Result: "Obscure" is opposite in meaning to "lucid".`,
    topic: 'Antonyms',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-eng-3',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Fill in the blank with the most appropriate option: Neither the teacher nor the students ______ present at the assembly yesterday.',
    options: ['were', 'was', 'is', 'are'],
    correctAnswer: 0,
    explanation: `Step 1: Apply the grammatical Rule of Proximity for correlative conjunctions ("Neither ... nor"):
   - The verb agrees in number with the subject closer to it.
Step 2: Here, the closer subject is "the students" (plural).
Step 3: Past tense plural requires "were".
Result: "were".`,
    topic: 'Concord & Grammar',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-eng-4',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Choose the option that has the same vowel sound as the one represented by the underlined letter: b<u>i</u>rd',
    options: ['learn', 'bead', 'bad', 'bed'],
    correctAnswer: 0,
    explanation: `Step 1: The vowel sound in "bird" is the central open-mid vowel /ɜː/.
Step 2: In "learn", the "ea" also produces the sound /ɜː/ (/lɜːn/).
Result: "learn" contains the same vowel sound as "bird".`,
    topic: 'Oral Forms & Phonetics',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-eng-5',
    subject: 'English',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'Choose the most appropriate interpretation: To "burn the midnight oil" means to:',
    options: ['Work or study late into the night', 'Waste fuel recklessly', 'Cause an accidental fire', 'Be unable to sleep due to anxiety'],
    correctAnswer: 0,
    explanation: `Step 1: Idiomatic usage: "To burn the midnight oil" originates from using an oil lamp to work or study late past midnight.
Result: It means to work or study late into the night.`,
    topic: 'Idioms & Figures of Speech',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  }
];
