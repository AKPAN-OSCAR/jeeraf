import { jsPDF } from 'jspdf';
import { LibraryBook } from './types';

/**
 * Checks if a Blob, Uint8Array, or string is a valid binary PDF.
 */
export async function isBinaryPdf(source: Blob | Uint8Array | string): Promise<boolean> {
  try {
    if (typeof source === 'string') {
      if (source.startsWith('data:application/pdf')) return true;
      if (source.startsWith('data:text/')) return false;
      if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('blob:')) {
        const headRes = await fetch(source, { method: 'GET' });
        const buf = await headRes.arrayBuffer();
        const u8 = new Uint8Array(buf.slice(0, 1024));
        const text = new TextDecoder('ascii', { fatal: false }).decode(u8);
        return text.includes('%PDF');
      }
      return false;
    }

    if (source instanceof Blob) {
      if (source.type === 'application/pdf') return true;
      const slice = source.slice(0, 1024);
      const buf = await slice.arrayBuffer();
      const u8 = new Uint8Array(buf);
      const text = new TextDecoder('ascii', { fatal: false }).decode(u8);
      return text.includes('%PDF');
    }

    if (source instanceof Uint8Array) {
      const text = new TextDecoder('ascii', { fatal: false }).decode(source.slice(0, 1024));
      return text.includes('%PDF');
    }
  } catch (e) {
    console.warn('PDF header verification note:', e);
  }
  return false;
}

/**
 * Dynamically synthesizes a high-fidelity academic textbook PDF document 
 * with cover page, table of contents, headers, footers, and typeset chapters.
 */
export function generateBookPdfBlob(book: LibraryBook): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // ----------------------------------------------------
  // Page 1: Premium Academic Cover Page
  // ----------------------------------------------------
  // Background Header Block
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 220, 'F');

  // Accent Line
  doc.setFillColor(245, 158, 11); // Amber-500
  doc.rect(0, 218, pageWidth, 4, 'F');

  // Institution / Library Badge
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ZEERAF DIGITAL ACADEMIC REPOSITORY', margin, 50);

  // Category / Exam target pill text
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const sectionLabel = (book.section === 'national' 
    ? 'NATIONAL CURRICULA & EXAMS' 
    : book.section === 'universal' 
      ? 'HIGHER EDUCATION, STEM & GLOBAL STANDARDS' 
      : 'GENERAL ACADEMIC LITERATURE').toUpperCase();
  doc.text(`${sectionLabel} • ${book.subject?.toUpperCase() || 'GENERAL EDUCATION'}`, margin, 70);

  // Textbook Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(book.title || 'Academic Textbook', contentWidth);
  doc.text(titleLines, margin, 110);

  // Author & Metadata
  doc.setFontSize(12);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.setFont('helvetica', 'normal');
  doc.text(`Author: ${book.author || 'ZeeRaf Faculty & Contributors'}`, margin, 165);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Document Reference: ${book.fileName || `${book.title}.pdf`} | Standard Grade: ${book.examTarget || 'University & General'}`, margin, 185);

  // Cover Page Body - Synopsis & Abstract
  let currentY = 260;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SYNOPSIS & STUDY OVERVIEW', margin, currentY);
  currentY += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // Slate-700
  const descText = book.description || `${book.title} provides comprehensive study material, theoretical foundations, practice problems, and detailed explanations for students preparing for academic and professional examinations.`;
  const descLines = doc.splitTextToSize(descText, contentWidth);
  doc.text(descLines, margin, currentY);
  currentY += descLines.length * 15 + 25;

  // Key Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 100, 8, 8, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DOCUMENT SPECIFICATIONS', margin + 15, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Subject Category: ${book.subject || 'General Education'}`, margin + 15, currentY + 42);
  doc.text(`• Examination Target: ${book.examTarget || 'Higher Education / CBT Practice'}`, margin + 15, currentY + 58);
  doc.text(`• Total Study Sections: ${book.chapters?.length || 1} Chapter Modules`, margin + 15, currentY + 74);
  doc.text(`• Publication Engine: ZeeRaf Digital Reader v2.6 (LaTeX Enabled)`, margin + 15, currentY + 90);

  // Cover Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Official Study Material • Approved for Academic Use • ZeeRaf Educational System', margin, pageHeight - 30);

  // ----------------------------------------------------
  // Subsequent Pages: Table of Contents & Chapter Content
  // ----------------------------------------------------
  const chapters = (book.chapters && book.chapters.length > 0)
    ? book.chapters
    : [{
        id: 'ch1',
        title: `${book.title} - Full Study Notes`,
        content: book.description || `${book.title} comprehensive academic material.`
      }];

  // Helper for adding new page with header & footer
  const addHeaderAndFooter = (pageNo: number, chapterTitle?: string) => {
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(book.title.toUpperCase().slice(0, 45), margin, 25);
    if (chapterTitle) {
      doc.setFont('helvetica', 'normal');
      doc.text(chapterTitle.slice(0, 35), pageWidth - margin, 25, { align: 'right' });
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 30, pageWidth - margin, 30);

    // Footer
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('ZeeRaf Academic E-Library', margin, pageHeight - 12);
    doc.text(`Page ${pageNo}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  };

  let pageCounter = 2;

  // Add Chapters
  chapters.forEach((chapter, chIdx) => {
    doc.addPage();
    addHeaderAndFooter(pageCounter, chapter.title);

    let y = 60;

    // Chapter Header Banner
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 36, 6, 6, 'F');

    doc.setTextColor(180, 83, 9); // Amber-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`CHAPTER / SECTION ${chIdx + 1}`, margin + 12, y + 14);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(chapter.title || `Section ${chIdx + 1}`, margin + 12, y + 28);

    y += 55;

    // Chapter Text Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const paragraphs = (chapter.content || 'Content not available.').split('\n');

    for (let p of paragraphs) {
      p = p.trim();
      if (!p) {
        y += 8;
        continue;
      }

      // Detect sub-headings (e.g. # or bold markers)
      if (p.startsWith('#') || p.startsWith('**') && p.endsWith('**')) {
        const headingText = p.replace(/^[#*\s]+|[#*\s]+$/g, '');
        if (y > pageHeight - 80) {
          doc.addPage();
          pageCounter++;
          addHeaderAndFooter(pageCounter, chapter.title);
          y = 55;
        }
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(headingText, margin, y);
        y += 18;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        continue;
      }

      const lines = doc.splitTextToSize(p, contentWidth);
      for (const line of lines) {
        if (y > pageHeight - 50) {
          doc.addPage();
          pageCounter++;
          addHeaderAndFooter(pageCounter, chapter.title);
          y = 55;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
        }
        doc.text(line, margin, y);
        y += 14;
      }
      y += 6; // Paragraph gap
    }

    pageCounter++;
  });

  return doc.output('blob');
}
