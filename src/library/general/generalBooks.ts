/**
 * ============================================================================
 * GENERAL LIBRARY SECTION REGISTRY: /src/library/general/generalBooks.ts
 * ============================================================================
 * HOW DEVELOPERS & ADMINS ADD NEW BOOKS TO THE GENERAL SECTION IN CODE:
 * ----------------------------------------------------------------------------
 * 1. Create a new `.ts` file inside `/src/library/general/` (e.g., `myNewBook.ts`).
 * 2. Define a `LibraryBook` object with title, author, coverImage, and `chapters`
 *    or `pageImages` array for large 100MB+ book PDF content.
 * 3. Import your book file below and add it to the `GENERAL_BOOKS` array.
 * 4. It will automatically be indexed and searchable throughout the library.
 * ============================================================================
 */

import { LibraryBook } from '../types';
import { ATOMIC_HABITS_BOOK } from './atomicHabits';
import { STRAIGHT_A_STUDENT_BOOK } from './straightAStudent';
import { THINK_AND_GROW_RICH_BOOK } from './thinkAndGrowRich';

export const GENERAL_BOOKS: LibraryBook[] = [
  ATOMIC_HABITS_BOOK,
  STRAIGHT_A_STUDENT_BOOK,
  THINK_AND_GROW_RICH_BOOK
];

export { ATOMIC_HABITS_BOOK } from './atomicHabits';
export { STRAIGHT_A_STUDENT_BOOK } from './straightAStudent';
export { THINK_AND_GROW_RICH_BOOK } from './thinkAndGrowRich';
