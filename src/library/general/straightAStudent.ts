/**
 * ============================================================================
 * BOOK FILE: /src/library/general/straightAStudent.ts
 * ============================================================================
 * DEVELOPER & ADMIN INSTRUCTIONS FOR WRITING FULL BOOKS IN CODE:
 * ----------------------------------------------------------------------------
 * 1. For student mastery & study skill books, format chapters detailing active recall,
 *    time management, and exam preparation systems.
 * 2. Save and export this book object in `generalBooks.ts`.
 * ============================================================================
 */

import { LibraryBook } from '../types';

export const STRAIGHT_A_STUDENT_BOOK: LibraryBook = {
  id: 'gen_student_success',
  title: 'How to Become a Straight-A Student',
  author: 'Cal Newport',
  section: 'general',
  subject: 'Study Techniques & Exam Mastery',
  description: 'Unconventional strategies used by real top-performing university and secondary students to study less, retain information faster, and score top marks in competitive examinations.',
  keywords: ['straight a student', 'cal newport', 'study tips', 'exam mastery', 'time management', 'focus', 'active recall', 'active learning'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop',
  pageCount: 280,
  amazonUrl: 'https://www.amazon.com/s?k=How+to+Become+a+Straight-A+Student+Cal+Newport',
  fileName: 'Straight_A_Student_Study_System.pdf',
  fileType: 'pdf',
  fileSize: '6.5 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Straight%20A%20Student%20System...',
  pageImages: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'ss_ch1',
      title: 'Part 1: Study Basics - Active Recall over Passive Reading',
      content: `### 1.1 The Formula for Work Accomplished
$$\\text{Work Accomplished} = \\text{Time Spent} \\times \\text{Intensity of Focus}$$

When focus intensity is maximized, time spent studying drops dramatically while recall increases.

### 1.2 Active Recall Method
Never passively re-read highlighting or class notes. Close your textbook or lecture material and attempt to explain the concept aloud or write it out from memory without looking.`
    },
    {
      id: 'ss_ch2',
      title: 'Part 2: Quizzing Yourself & Question-Based Outlines',
      content: `Transform raw study notes into a series of core questions. Reviewing consists of answering those questions aloud until you can answer every question smoothly.`
    }
  ]
};
