# JEERAF DIGITAL LIBRARY DEVELOPER & ADMIN GUIDE
## Writing & Structuring Full Textbooks & 100MB+ Books in Code

This document outlines how developers and administrators can write full books, textbooks, literature novels, and study guides directly into the codebase (`/src/library/`).

---

### 1. Architectural Overview & Folder Structure

All library books are modularized inside `/src/library/`:

```
/src/library/
├── types.ts                    <- Central TypeScript interfaces (LibraryBook, LibraryChapter)
├── storage.ts                  <- IndexedDB manager for browser offline storage of large files (>10MB to 100MB+)
├── index.ts                    <- Central search engine indexer & combined catalog registry
├── DEVELOPER_GUIDE.md          <- Developer instructions (this file)
│
├── national/                   <- Section 1: JAMB, WAEC, NECO National Exam Books
│   ├── ababioChemistry.ts      <- Individual book file
│   ├── okekePhysics.ts         <- Individual book file
│   ├── lifeChangerNovel.ts     <- Individual book file
│   ├── furtherMaths.ts         <- Individual book file
│   └── nationalBooks.ts        <- Aggregator registry for National section
│
├── universal/                  <- Section 2: Global Higher-Ed, STEM & Academic Textbooks
│   ├── hallidayPhysics.ts      <- Individual book file
│   ├── thomasCalculus.ts       <- Individual book file
│   ├── campbellBiology.ts      <- Individual book file
│   └── universalBooks.ts       <- Aggregator registry for Universal section
│
└── general/                    <- Section 3: Personal Development, Literature & Productivity
    ├── atomicHabits.ts         <- Individual book file
    ├── straightAStudent.ts     <- Individual book file
    ├── thinkAndGrowRich.ts     <- Individual book file
    └── generalBooks.ts         <- Aggregator registry for General section
```

---

### 2. How to Add a New Book as a Code File

To add a new book (e.g. `NewBookName`):

1. **Create the Book File**:
   Create a new file in the appropriate section folder, e.g., `/src/library/national/myNewTextbook.ts`.

2. **Define the `LibraryBook` Export**:
   ```typescript
   import { LibraryBook } from '../types';

   export const MY_NEW_TEXTBOOK: LibraryBook = {
     id: 'nat_my_new_textbook',
     title: 'Title of the Textbook',
     author: 'Author Name',
     section: 'national', // 'national' | 'universal' | 'general'
     subject: 'Physics / Mathematics / Literature',
     description: 'Detailed description of the book...',
     keywords: ['keyword1', 'keyword2', 'exam target', 'subject'],
     format: 'both', // 'electronic' | 'file' | 'both'
     examTarget: 'JAMB UTME / WAEC SSCE',
     coverImage: 'https://images.unsplash.com/photo-...', // Real high-res cover image URL
     pageCount: 450,
     amazonUrl: 'https://www.amazon.com/s?k=...',
     fileName: 'My_New_Textbook.pdf',
     fileType: 'pdf',
     fileSize: '25.4 MB',
     
     // OPTIONAL: Scanned Page Images (for image-heavy or 100MB+ visual PDF books)
     pageImages: [
       'https://images.unsplash.com/photo-page1...',
       'https://images.unsplash.com/photo-page2...'
     ],

     // CHAPTER BREAKDOWNS (for E-Reader Online Text)
     chapters: [
       {
         id: 'ch1',
         title: 'Chapter 1: Introduction to the Core Concept',
         content: `### 1.1 Overview\nDetailed markdown formatted chapter text, formulas, and examples...`
       },
       {
         id: 'ch2',
         title: 'Chapter 2: Advanced Applications & Solved Examples',
         content: `### 2.1 Problem Set\nKey questions and solutions...`
       }
     ]
   };
   ```

3. **Export in the Section Registry**:
   In `/src/library/national/nationalBooks.ts` (or `universalBooks.ts` / `generalBooks.ts`):
   ```typescript
   import { MY_NEW_TEXTBOOK } from './myNewTextbook';

   export const NATIONAL_BOOKS: LibraryBook[] = [
     LIFE_CHANGER_BOOK,
     OKEKE_PHYSICS_BOOK,
     ABABIO_CHEMISTRY_BOOK,
     FURTHER_MATHS_BOOK,
     MY_NEW_TEXTBOOK // <- Added here!
   ];
   ```

4. **Verify Live Search & Reader**:
   Once added, the book will instantly appear in search results, category tabs, admin console management, and the `BookReaderModal` reader canvas!

---

### 3. Handling Large 100MB+ PDF Books

When dealing with massive 100MB+ PDF files:
- **Text / Markdown Chapters**: Break down the text by chapters or modules as demonstrated in `okekePhysics.ts` or `hallidayPhysics.ts`.
- **IndexedDB Client Storage**: For uploaded 100MB+ PDF attachments, the app uses `/src/library/storage.ts` (IndexedDB) to store high-volume blobs locally on the user's browser, bypassing 1MB document size limits in cloud databases while keeping previewing instantaneous.
- **Page Image Scans**: If page images are available, populate `pageImages: string[]` to render page flip readers.
