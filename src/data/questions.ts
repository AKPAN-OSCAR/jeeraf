import { Question, ExamType } from '../types';
import { allBuiltinQuestions } from './question_banks';

export interface RawQuestion extends Omit<Question, 'examType' | 'id'> {
  id: string;
  allowedExamTypes?: ExamType[];
}

export const rawQuestions: RawQuestion[] = [];

/**
 * Clean Built-in Core Syllabus Question Bank
 * Sourced directly from verified past questions in src/data/question_banks/
 */
export const questions: Question[] = allBuiltinQuestions;
