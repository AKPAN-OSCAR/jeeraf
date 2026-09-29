/**
 * ============================================================================
 * LIBRARY INDEX MODULE: /src/library/index.ts
 * ============================================================================
 * Central exporter and search engine indexer for the SilverIBOM Library.
 * Combines built-in section books with persistent custom uploaded books from Firestore.
 * ============================================================================
 */

import { LibraryBook, LibrarySectionType } from './types';
import { NATIONAL_BOOKS } from './national/nationalBooks';
import { UNIVERSAL_BOOKS } from './universal/universalBooks';
import { GENERAL_BOOKS } from './general/generalBooks';
import { subjectGuides } from '../data/subjectGuides';

export * from './types';
export * from './storage';
export * from './fileProcessor';
export { NATIONAL_BOOKS } from './national/nationalBooks';
export { UNIVERSAL_BOOKS } from './universal/universalBooks';
export { GENERAL_BOOKS } from './general/generalBooks';

// Convert subjectGuides into LibraryBook entries so all subject guides display in the library
export const GUIDE_BOOKS: LibraryBook[] = Object.entries(subjectGuides).map(([subKey, guide]) => {
  if (!guide) return null;
  const chapters = guide.topics.map((top, idx) => ({
    id: `guide_ch_${idx}`,
    title: top.title,
    content: `${top.content}${top.diagram ? `\n\n[Illustration / Note]: ${top.diagram.caption}` : ''}`
  }));

  const fullTextContent = `SUBJECT GUIDE: ${guide.subject}\nAUTHOR: ZeeRaf Academic Board\nOVERVIEW:\n${guide.overview}\n\n` +
    chapters.map(ch => `=== ${ch.title} ===\n${ch.content}\n`).join('\n');

  return {
    id: `guide_${subKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    title: `${guide.subject} Master Revision & Syllabus Guide`,
    author: 'ZeeRaf Academic Board',
    section: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'].includes(subKey) ? 'universal' : 'national',
    subject: guide.subject,
    description: guide.overview,
    keywords: [guide.subject.toLowerCase(), 'master guide', 'syllabus', 'jamb guide', 'waec guide', 'revision', 'study notes'],
    format: 'both',
    examTarget: 'JAMB / WAEC / NECO Syllabus',
    amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(guide.subject + ' Textbook')}`,
    fileName: `${guide.subject}_Syllabus_Guide.txt`,
    fileType: 'txt',
    fileSize: '1.8 MB',
    fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(fullTextContent)}`,
    chapters
  } as LibraryBook;
}).filter(Boolean) as LibraryBook[];

// Master combined initial books catalog
export const ALL_BUILTIN_BOOKS: LibraryBook[] = [
  ...NATIONAL_BOOKS,
  ...UNIVERSAL_BOOKS,
  ...GENERAL_BOOKS,
  ...GUIDE_BOOKS
];

/**
 * Searches the library catalog for matching books given a query and optional section filter.
 */
export function searchLibrary(
  allBooks: LibraryBook[],
  query: string,
  sectionFilter: LibrarySectionType | 'all' = 'all'
): LibraryBook[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    if (sectionFilter === 'all') return allBooks;
    return allBooks.filter(b => b.section === sectionFilter);
  }

  return allBooks.filter(book => {
    // Check section first if specific
    if (sectionFilter !== 'all' && book.section !== sectionFilter) {
      return false;
    }

    const titleMatch = book.title.toLowerCase().includes(q);
    const authorMatch = book.author.toLowerCase().includes(q);
    const subjectMatch = book.subject.toLowerCase().includes(q);
    const descMatch = book.description.toLowerCase().includes(q);
    const examTargetMatch = book.examTarget ? book.examTarget.toLowerCase().includes(q) : false;
    const keywordsMatch = book.keywords && book.keywords.some(k => k.toLowerCase().includes(q));

    return titleMatch || authorMatch || subjectMatch || descMatch || examTargetMatch || keywordsMatch;
  });
}
