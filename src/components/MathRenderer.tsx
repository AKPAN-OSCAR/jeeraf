import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
}

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

interface HeadingBlock {
  type: 'heading';
  level: number;
  text: string;
}

interface ListBlock {
  type: 'list';
  items: string[];
}

interface ParagraphBlock {
  type: 'paragraph';
  lines: string[];
}

type Block = TableBlock | HeadingBlock | ListBlock | ParagraphBlock;

function cleanMathExpression(math: string): string {
  if (!math) return '';
  return math
    // Insert spacing for mixed fractions like 1\frac{1}{2} -> 1\,\frac{1}{2}
    .replace(/([0-9])\\frac/g, '$1\\,\\frac')
    // Convert single digit fractions like \frac12 to \frac{1}{2}
    .replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, '\\frac{$1}{$2}')
    // Convert \frac{1}2 to \frac{1}{2}
    .replace(/\\frac\{([^{}]+)\}([0-9a-zA-Z])/g, '\\frac{$1}{$2}')
    // Convert \frac1{2} to \frac{1}{2}
    .replace(/\\frac([0-9a-zA-Z])\{([^{}]+)\}/g, '\\frac{$1}{$2}')
    .trim();
}

// Split a markdown row by pipe
function splitTableRow(rowStr: string): string[] {
  let cleaned = rowStr.trim();
  if (cleaned.startsWith('|')) cleaned = cleaned.substring(1);
  if (cleaned.endsWith('|')) cleaned = cleaned.substring(0, cleaned.length - 1);
  return cleaned.split('|').map(cell => cell.trim());
}

function parseMarkdownTable(tableLines: string[]): TableBlock | null {
  if (tableLines.length < 1) return null;

  const isSeparatorLine = (str: string) => {
    return /^\|?\s*:?-+:?\s*(\|:?-+:?\s*)+\|?$/.test(str.trim());
  };

  if (tableLines.length >= 2 && isSeparatorLine(tableLines[1])) {
    const headers = splitTableRow(tableLines[0]);
    const dataRows = tableLines.slice(2).map(splitTableRow);
    return {
      type: 'table',
      headers,
      rows: dataRows
    };
  }

  if (tableLines.length >= 2) {
    const parsedRows = tableLines.map(splitTableRow);
    const colCount = parsedRows[0].length;
    const isConsistent = parsedRows.every(r => Math.abs(r.length - colCount) <= 1);
    if (isConsistent && colCount >= 2) {
      return {
        type: 'table',
        headers: parsedRows[0],
        rows: parsedRows.slice(1)
      };
    }
  }

  return null;
}

// Formats text with **bold** and *italic*
function parseFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match bold **...**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, i) => {
    if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
      const inner = bPart.slice(2, -2);
      return <strong key={i} className="font-extrabold text-theme-text">{inner}</strong>;
    }

    // Match italic *...* (only when not empty and at least 2 chars)
    const italicParts = bPart.split(/(\*[^*\n]+?\*)/g);
    return italicParts.map((iPart, j) => {
      if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length >= 2) {
        const inner = iPart.slice(1, -1);
        return <em key={j} className="italic">{inner}</em>;
      }
      return iPart;
    });
  });
}

// Helper to safely render inline tokens including math ($...$ and $$...$$) and newlines
function parseInlineContent(str: string): React.ReactNode[] {
  if (!str) return [];

  // Split string by:
  // 1. $$...$$ (block math)
  // 2. $...$ (inline math)
  // 3. \n (newline inside paragraph)
  const parts = str.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\n)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part === '\n') {
      return <br key={`br-${index}`} />;
    }

    // Block Math $$...$$
    if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
      const rawMath = part.slice(2, -2).trim();
      const math = cleanMathExpression(rawMath);
      try {
        return (
          <span key={index} className="inline-block my-1.5 align-middle max-w-full overflow-x-auto text-theme-text">
            <BlockMath 
              math={math} 
              renderError={() => <span className="font-serif italic text-theme-text px-1">[{rawMath}]</span>} 
            />
          </span>
        );
      } catch {
        return <span key={index} className="font-serif italic text-theme-text px-1">[{rawMath}]</span>;
      }
    }

    // Inline Math $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const rawMath = part.slice(1, -1).trim();
      const math = cleanMathExpression(rawMath);
      try {
        return (
          <span key={index} className="inline-block align-baseline mx-0.5 text-theme-text font-serif">
            <InlineMath 
              math={math} 
              renderError={() => <span className="font-serif italic text-theme-text px-0.5">{rawMath}</span>} 
            />
          </span>
        );
      } catch {
        return <span key={index} className="font-serif italic text-theme-text px-0.5">{rawMath}</span>;
      }
    }

    // Regular inline text with formatting (**bold**, *italic*)
    return <React.Fragment key={index}>{parseFormattedText(part)}</React.Fragment>;
  });
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Clean raw carriage returns
  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Group into blocks: Tables, Headings, Lists, Paragraphs
  const rawLines = sanitized.split('\n');
  const blocks: Block[] = [];
  let currentTableLines: string[] = [];
  let currentListItems: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        lines: [...currentParagraphLines]
      });
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push({
        type: 'list',
        items: [...currentListItems]
      });
      currentListItems = [];
    }
  };

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      const parsedTable = parseMarkdownTable(currentTableLines);
      if (parsedTable) {
        blocks.push(parsedTable);
      } else {
        // Fallback: append table lines to paragraph
        currentParagraphLines.push(...currentTableLines);
        flushParagraph();
      }
      currentTableLines = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check if markdown table row
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2 && !trimmed.startsWith('$$');

    if (isTableRow) {
      flushParagraph();
      flushList();
      currentTableLines.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Check if empty line (marks paragraph break)
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check for Markdown Headings
    if (/^#{1,4}\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      const match = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        blocks.push({
          type: 'heading',
          level: match[1].length,
          text: match[2]
        });
        continue;
      }
    }

    // Check for Markdown Bullet List (- item or * item)
    if (/^[\*\-\+]\s+/.test(trimmed)) {
      flushParagraph();
      currentListItems.push(trimmed.replace(/^[\*\-\+]\s+/, ''));
      continue;
    } else {
      flushList();
    }

    // Normal content line - preserve naturally inside paragraph
    currentParagraphLines.push(line);
  }

  flushTable();
  flushList();
  flushParagraph();

  // If only one simple paragraph, render directly without wrapping margins
  if (blocks.length === 1 && blocks[0].type === 'paragraph') {
    return (
      <div className={`leading-relaxed text-theme-text ${className}`}>
        {parseInlineContent(blocks[0].lines.join('\n'))}
      </div>
    );
  }

  return (
    <div className={`text-theme-text leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          return (
            <div 
              key={`tbl-${idx}`} 
              className="overflow-x-auto my-3 p-1 rounded-2xl border-2 border-theme-border bg-theme-card shadow-xs max-w-full"
            >
              <table className="min-w-full text-xs sm:text-sm text-left border-collapse border border-theme-border">
                {block.headers.length > 0 && (
                  <thead className="bg-theme-bg/90">
                    <tr>
                      {block.headers.map((head, hIdx) => (
                        <th 
                          key={hIdx} 
                          className="px-4 py-2 text-xs font-black uppercase tracking-wider text-theme-text border border-theme-border text-center sm:text-left bg-theme-bg"
                        >
                          {parseInlineContent(head)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {block.rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className="hover:bg-theme-bg/30 transition-colors odd:bg-theme-bg/10"
                    >
                      {row.map((cell, cIdx) => (
                        <td 
                          key={cIdx} 
                          className="px-4 py-1.5 text-theme-text font-medium text-center sm:text-left border border-theme-border whitespace-nowrap"
                        >
                          {parseInlineContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h1 key={`h1-${idx}`} className="text-xl sm:text-2xl font-black mt-3 mb-1 tracking-tight text-theme-text">
                {parseInlineContent(block.text)}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={`h2-${idx}`} className="text-lg sm:text-xl font-extrabold mt-2 mb-1 tracking-tight text-theme-text">
                {parseInlineContent(block.text)}
              </h2>
            );
          }
          if (block.level === 3) {
            return (
              <h3 key={`h3-${idx}`} className="text-base sm:text-lg font-bold text-theme-accent mt-2 mb-0.5 tracking-snug">
                {parseInlineContent(block.text)}
              </h3>
            );
          }
          return (
            <h4 key={`h4-${idx}`} className="text-sm sm:text-base font-bold mt-1.5 mb-0.5 text-theme-text">
              {parseInlineContent(block.text)}
            </h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${idx}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-theme-accent">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-theme-text leading-relaxed">
                  {parseInlineContent(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <div key={`p-${idx}`} className={idx > 0 ? "mt-2" : ""}>
              {parseInlineContent(block.lines.join('\n'))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
