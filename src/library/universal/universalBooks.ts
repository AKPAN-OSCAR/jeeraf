/**
 * ============================================================================
 * UNIVERSAL LIBRARY SECTION REGISTRY: /src/library/universal/universalBooks.ts
 * ============================================================================
 * HOW DEVELOPERS & ADMINS ADD NEW BOOKS TO THE UNIVERSAL SECTION IN CODE:
 * ----------------------------------------------------------------------------
 * 1. Create a new `.ts` file inside `/src/library/universal/` (e.g., `myGlobalBook.ts`).
 * 2. Define a `LibraryBook` object with title, author, coverImage, and `chapters`
 *    or `pageImages` array for large 100MB+ textbook PDF content.
 * 3. Import your book file below and add it to the `UNIVERSAL_BOOKS` array.
 * 4. It will automatically be indexed and searchable throughout the library.
 * ============================================================================
 */

import { LibraryBook } from '../types';
import { HALLIDAY_PHYSICS_BOOK } from './hallidayPhysics';
import { THOMAS_CALCULUS_BOOK } from './thomasCalculus';
import { CAMPBELL_BIOLOGY_BOOK } from './campbellBiology';

export const UNIVERSAL_BOOKS: LibraryBook[] = [
  HALLIDAY_PHYSICS_BOOK,
  THOMAS_CALCULUS_BOOK,
  CAMPBELL_BIOLOGY_BOOK
];

export { HALLIDAY_PHYSICS_BOOK } from './hallidayPhysics';
export { THOMAS_CALCULUS_BOOK } from './thomasCalculus';
export { CAMPBELL_BIOLOGY_BOOK } from './campbellBiology';
