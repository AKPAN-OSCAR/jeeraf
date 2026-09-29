// ============================================================================
// ZEERAF LIBRARY & TEXTBOOKS ARCHITECTURE
// ============================================================================
// This module provides modular categorization and data models for all 
// textbooks, digital files, and electronic reading materials across three sections:
// 1. NATIONAL: Books tailored for National Examinations (JAMB, WAEC, NECO, SSCE).
// 2. UNIVERSAL: Global academic, engineering, mathematics, & science textbooks.
// 3. GENERAL: Self-development, literature, general motivation, & CBT revision.
// ============================================================================

export type LibrarySectionType = 'national' | 'universal' | 'general';
export type BookFormat = 'electronic' | 'file' | 'both';

export interface ChapterFigure {
  id: string;
  title: string;
  url: string;
  caption: string;
}

export interface LibraryChapter {
  id: string;
  title: string;
  content: string; // Markdown or formatted text content for electronic reading
  figures?: ChapterFigure[]; // Illustrative diagrams, formulas, or figure slides
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  section: LibrarySectionType;
  subject: string;
  description: string;
  keywords: string[]; // Standardized keywords for fast search indexing
  format: BookFormat;
  coverImage?: string; // High-resolution real book cover image URL
  pageImages?: string[]; // Array of high-resolution page image scan URLs for image-heavy or 100MB+ books
  pageCount?: number;
  
  // Electronic book reading content
  chapters?: LibraryChapter[];
  
  // Downloadable file attachment details
  fileUrl?: string; // Data URL or storage link for PDF, DOC, TXT, EPUB
  fileName?: string;
  fileSize?: string;
  fileType?: string; // e.g. 'pdf', 'docx', 'txt'

  // Exam Target badge (especially for National books)
  examTarget?: string; // e.g. "JAMB UTME 2026", "WAEC SSCE"
  
  // Direct Amazon fallback search URL
  amazonUrl?: string;

  // Key for IndexedDB large file storage (e.g. for >10MB to 100MB+ files)
  storageKey?: string;

  // Metadata
  addedBy?: string;
  createdAt?: string;
}
