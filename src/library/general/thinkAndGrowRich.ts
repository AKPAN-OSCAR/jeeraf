/**
 * ============================================================================
 * BOOK FILE: /src/library/general/thinkAndGrowRich.ts
 * ============================================================================
 * DEVELOPER & ADMIN INSTRUCTIONS FOR WRITING FULL BOOKS IN CODE:
 * ----------------------------------------------------------------------------
 * 1. For classic success literature, format chapter summaries and core action items.
 * 2. Export this book object in `generalBooks.ts`.
 * ============================================================================
 */

import { LibraryBook } from '../types';

export const THINK_AND_GROW_RICH_BOOK: LibraryBook = {
  id: 'gen_think_grow_rich',
  title: 'Think and Grow Rich',
  author: 'Napoleon Hill',
  section: 'general',
  subject: 'Success Mindset & Leadership',
  description: 'The classic landmark bestseller on achieving financial independence, mental clarity, goal setting, persistence, and definite purpose.',
  keywords: ['think and grow rich', 'napoleon hill', 'wealth', 'success', 'mindset', 'persistence', 'leadership'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
  pageCount: 380,
  amazonUrl: 'https://www.amazon.com/s?k=Think+and+Grow+Rich+Napoleon+Hill',
  fileName: 'Think_and_Grow_Rich_Principles.pdf',
  fileType: 'pdf',
  fileSize: '9.8 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Think%20and%20Grow%20Rich%20Key%20Principles...',
  pageImages: [
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'tgr_ch1',
      title: 'Chapter 1: Desire - The Starting Point of All Achievement',
      content: `### 1.1 The Six Definite Steps to Turn Desire into Reality
1. Fix in your mind the exact goal or target you desire.
2. Determine exactly what you intend to give in return.
3. Establish a definite date by which you intend to possess it.
4. Create a definite plan for carrying out your desire and begin at once.
5. Write out a clear, concise statement of your plan and deadline.
6. Read your written statement aloud twice daily.`
    }
  ]
};
