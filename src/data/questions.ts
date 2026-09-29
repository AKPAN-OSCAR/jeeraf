import { Question, ExamType } from '../types';

// Import subject-specific template files from subfolders
import { jambMathQuestions } from './subjects/jamb/subjects/jambmathquestions';
import { jambEnglishQuestions } from './subjects/jamb/subjects/jambenglishquestions';
import { jambPhysicsQuestions } from './subjects/jamb/subjects/jambphysicsquestions';
import { jambChemistryQuestions } from './subjects/jamb/subjects/jambchemistryquestions';
import { jambBiologyQuestions } from './subjects/jamb/subjects/jambbiologyquestions';

import { waecEnglishQuestions } from './subjects/waec/subjects/waecenglishquestions';
import { waecMathematicsQuestions } from './subjects/waec/subjects/waecmathquestions';

import { necoEnglishQuestions } from './subjects/neco/subjects/necoenglishquestions';
import { necoMathematicsQuestions } from './subjects/neco/subjects/necomathquestions';

import { waecGceMathematicsQuestions } from './subjects/waec_gce/subjects/waecgcemathquestions';
import { waecGceEnglishQuestions } from './subjects/waec_gce/subjects/waecgceenglishquestions';

import { necoGceMathematicsQuestions } from './subjects/neco_gce/subjects/necogcemathquestions';
import { necoGceEnglishQuestions } from './subjects/neco_gce/subjects/necogceenglishquestions';

/**
 * Standard format for raw question input.
 * Allows defining which exam types a question is valid for.
 */
export interface RawQuestion extends Omit<Question, 'examType' | 'id'> {
  id: string; // Base ID
  allowedExamTypes?: ExamType[]; // Defaults to all if not specified
}

/**
 * Main Raw Questions Array (Now Emptied as requested)
 * All non-relevant preloaded static questions are emptied so they do not interfere with 
 * your preferred actual questions. Only the preferred JAMB Math questions are preserved.
 */
export const rawQuestions: RawQuestion[] = [
  // Static rawQuestions is kept empty.
  // Newly added questions from separate files or Admin Console will populate the system.
];

// Combine all defined subject files
const combinedStaticQuestions: RawQuestion[] = [
  ...jambMathQuestions,
  ...jambEnglishQuestions,
  ...jambPhysicsQuestions,
  ...jambChemistryQuestions,
  ...jambBiologyQuestions,
  ...waecEnglishQuestions,
  ...waecMathematicsQuestions,
  ...necoEnglishQuestions,
  ...necoMathematicsQuestions,
  ...waecGceMathematicsQuestions,
  ...waecGceEnglishQuestions,
  ...necoGceMathematicsQuestions,
  ...necoGceEnglishQuestions
  
];

const examTypes: ExamType[] = ['JAMB', 'WAEC', 'NECO', 'WAEC GCE', 'NECO GCE', 'Personal CBT'];

/**
 * Finalized questions array in standard CBT format.
 * Dynamically maps and prefixes the questions so that they load for the selected exam types.
 */
export const questions: Question[] = examTypes.flatMap(type => 
  combinedStaticQuestions
    .filter(q => !q.allowedExamTypes || q.allowedExamTypes.includes(type))
    .map(q => ({
      ...q,
      id: `${type.toLowerCase().replace(' ', '-')}-${q.id}`,
      examType: type,
      set: q.set || 1,
      year: q.year || 2024,
      difficulty: q.difficulty || 'Medium',
      images: q.images || [],
      tags: q.tags || []
    })) as Question[]
);
