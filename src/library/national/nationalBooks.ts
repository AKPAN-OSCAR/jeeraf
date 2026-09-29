/**
 * ============================================================================
 * NATIONAL LIBRARY SECTION REGISTRY: /src/library/national/nationalBooks.ts
 * ============================================================================
 * HOW DEVELOPERS & ADMINS ADD NEW BOOKS TO THE NATIONAL SECTION IN CODE:
 * ----------------------------------------------------------------------------
 * 1. Create a new `.ts` file inside `/src/library/national/` (e.g., `myNewBook.ts`).
 * 2. Define a `LibraryBook` object containing title, author, coverImage, and
 *    `chapters` array or `pageImages` array for large 100MB+ book PDF content.
 * 3. Import your book file below and add it to the `NATIONAL_BOOKS` array.
 * 4. It will automatically be indexed and searchable throughout the library.
 * ============================================================================
 */

import { LibraryBook } from '../types';
import { LIFE_CHANGER_BOOK } from './lifeChangerNovel';
import { OKEKE_PHYSICS_BOOK } from './okekePhysics';
import { ABABIO_CHEMISTRY_BOOK } from './ababioChemistry';
import { FURTHER_MATHS_BOOK } from './furtherMaths';

export const NATIONAL_BOOKS: LibraryBook[] = [
  LIFE_CHANGER_BOOK,
  OKEKE_PHYSICS_BOOK,
  ABABIO_CHEMISTRY_BOOK,
  FURTHER_MATHS_BOOK
];

export { LIFE_CHANGER_BOOK } from './lifeChangerNovel';
export { OKEKE_PHYSICS_BOOK } from './okekePhysics';
export { ABABIO_CHEMISTRY_BOOK } from './ababioChemistry';
export { FURTHER_MATHS_BOOK } from './furtherMaths';
