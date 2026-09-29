/**
 * ============================================================================
 * BOOK FILE PROCESSOR & CHAPTER EXTRACTOR: /src/library/fileProcessor.ts
 * ============================================================================
 * Automatically extracts real full-text content, chapters, sections, and
 * page counts from uploaded PDF, DOCX, DOC, TXT, and Markdown files.
 * Ensures users read and study the actual textbook contents rather than summaries.
 * ============================================================================
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { LibraryChapter } from './types';

// Configure pdfjs worker source safely for browser environments
if (typeof window !== 'undefined') {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`;
    }
  } catch (e) {
    console.warn('PDF.js worker setup note:', e);
  }
}

export interface ExtractedBookData {
  chapters: LibraryChapter[];
  pageCount: number;
  extractedRawText: string;
  extractedTitle?: string;
  detectedSubject?: string;
}

/**
 * Extracts structured chapters and text from a PDF file page-by-page.
 */
export async function extractPdfContent(file: File | ArrayBuffer): Promise<ExtractedBookData> {
  try {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages || 1;
    const chapters: LibraryChapter[] = [];
    let fullText = '';

    // Extract text from pages
    for (let pageNum = 1; pageNum <= Math.min(pageCount, 150); pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          fullText += `\n--- Page ${pageNum} ---\n` + pageText;
          chapters.push({
            id: `page_${pageNum}`,
            title: `Page ${pageNum}`,
            content: pageText
          });
        }
      } catch (pageErr) {
        console.warn(`Error extracting text from PDF page ${pageNum}:`, pageErr);
      }
    }

    // If PDF text extraction yielded sparse text (e.g. scanned pages)
    if (chapters.length === 0) {
      chapters.push({
        id: 'page_1',
        title: 'Full PDF Document',
        content: 'This textbook has visual pages and diagrams. You can read the full document using the Full PDF View tab or download the original file to view on your device.'
      });
    }

    return {
      chapters,
      pageCount,
      extractedRawText: fullText.trim()
    };
  } catch (err) {
    console.warn('PDF parsing fallback:', err);
    return {
      chapters: [
        {
          id: 'ch_pdf_main',
          title: 'Document Overview',
          content: 'Digital PDF Textbook. Switch to "Full PDF View" or click "Download" to access the complete original file.'
        }
      ],
      pageCount: 1,
      extractedRawText: ''
    };
  }
}

/**
 * Extracts structured chapters and text from a DOCX file using mammoth.
 */
export async function extractDocxContent(file: File | ArrayBuffer): Promise<ExtractedBookData> {
  try {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();

    // Check if the document has chapter/topic delimiters
    const rawSections = text.split(/(?=(?:Chapter|Unit|Topic|Section|MODULE|LESSON)\s+\d+[:.\s])/i).filter(s => s.trim().length > 0);

    if (rawSections.length > 1) {
      const chapters = rawSections.map((sec, idx) => {
        const lines = sec.trim().split('\n').filter(l => l.trim().length > 0);
        const titleLine = lines[0] ? lines[0].substring(0, 75).trim() : `Chapter ${idx + 1}`;
        return {
          id: `docx_ch_${idx + 1}`,
          title: titleLine,
          content: sec.trim()
        };
      });
      return {
        chapters,
        pageCount: Math.max(1, Math.ceil(text.length / 2200)),
        extractedRawText: text
      };
    }

    // Split into readable parts if the document is long
    if (text.length > 3500) {
      const paragraphs = text.split('\n\n');
      const chapters: LibraryChapter[] = [];
      let currentChunk = '';
      let chunkIdx = 1;

      for (const p of paragraphs) {
        if (currentChunk.length + p.length > 3000) {
          chapters.push({
            id: `docx_part_${chunkIdx}`,
            title: `Part ${chunkIdx}`,
            content: currentChunk.trim()
          });
          chunkIdx++;
          currentChunk = p + '\n\n';
        } else {
          currentChunk += p + '\n\n';
        }
      }
      if (currentChunk.trim()) {
        chapters.push({
          id: `docx_part_${chunkIdx}`,
          title: `Part ${chunkIdx}`,
          content: currentChunk.trim()
        });
      }

      return {
        chapters,
        pageCount: Math.max(1, Math.ceil(text.length / 2200)),
        extractedRawText: text
      };
    }

    return {
      chapters: [
        {
          id: 'docx_full',
          title: 'Main Content',
          content: text || 'Document content extracted.'
        }
      ],
      pageCount: Math.max(1, Math.ceil((text.length || 1000) / 2200)),
      extractedRawText: text
    };
  } catch (err) {
    console.warn('DOCX extraction fallback:', err);
    return {
      chapters: [
        {
          id: 'docx_err',
          title: 'Document Content',
          content: 'Document file attached. Download or view online.'
        }
      ],
      pageCount: 1,
      extractedRawText: ''
    };
  }
}

/**
 * Extracts structured chapters and text from plain text or Markdown files.
 */
export async function extractTextContent(file: File): Promise<ExtractedBookData> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const rawSections = text.split(/(?=(?:Chapter|Unit|Topic|Section|MODULE|LESSON|===|#+)\s+\d*[:.\s])/i).filter(s => s.trim().length > 0);

      if (rawSections.length > 1) {
        const chapters = rawSections.map((sec, idx) => {
          const lines = sec.trim().split('\n').filter(l => l.trim().length > 0);
          const titleLine = lines[0] ? lines[0].replace(/^[#= \t]+|[#= \t]+$/g, '').substring(0, 75).trim() : `Section ${idx + 1}`;
          return {
            id: `txt_ch_${idx + 1}`,
            title: titleLine,
            content: sec.trim()
          };
        });
        resolve({
          chapters,
          pageCount: Math.max(1, Math.ceil(text.length / 2200)),
          extractedRawText: text
        });
      } else {
        resolve({
          chapters: [
            {
              id: 'txt_main',
              title: 'Main Content',
              content: text.trim() || 'Textbook content.'
            }
          ],
          pageCount: Math.max(1, Math.ceil(text.length / 2200)),
          extractedRawText: text
        });
      }
    };
    reader.onerror = () => {
      resolve({
        chapters: [{ id: 'txt_err', title: 'Content', content: 'Text reading completed.' }],
        pageCount: 1,
        extractedRawText: ''
      });
    };
    reader.readAsText(file);
  });
}

/**
 * Master dispatcher: Automatically selects the correct extractor for any file.
 */
export async function extractBookContentFromFile(file: File): Promise<ExtractedBookData> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mime = file.type.toLowerCase();

  if (extension === 'pdf' || mime.includes('pdf')) {
    return extractPdfContent(file);
  }

  if (extension === 'docx' || extension === 'doc' || mime.includes('word') || mime.includes('officedocument')) {
    return extractDocxContent(file);
  }

  return extractTextContent(file);
}

/**
 * Compresses and scales book cover images to compact, sharp thumbnails (< 45 KB)
 * preventing Firestore document size limits and ensuring instantaneous saves.
 */
export async function compressCoverImage(input: File | Blob | string): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (typeof input === 'string') {
        if (!input.startsWith('data:image')) {
          // Normal remote HTTP/HTTPS URL
          return resolve(input);
        }
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const handleProcess = () => {
        try {
          const maxDim = 360;
          let w = img.naturalWidth || img.width || 300;
          let h = img.naturalHeight || img.height || 450;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.72);
            resolve(compressed);
          } else {
            resolve(typeof input === 'string' ? input : '');
          }
        } catch (err) {
          resolve(typeof input === 'string' ? input : '');
        }
      };

      img.onload = handleProcess;
      img.onerror = () => resolve(typeof input === 'string' ? input : '');

      if (typeof input === 'string') {
        img.src = input;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(input);
      }
    } catch (e) {
      resolve('');
    }
  });
}
