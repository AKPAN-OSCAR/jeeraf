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
  content: string;
}

type Block = TableBlock | HeadingBlock | ListBlock | ParagraphBlock;

function cleanMathExpression(math: string): string {
  if (!math) return '';
  return math
    // Fix known common typos from transcription
    .replace(/\\textxt/g, '\\text')
    .replace(/\\triangleia\\angle/g, '\\triangle ')
    .replace(/\\triangleia/g, '\\triangle ')
    .replace(/\\\$/g, '')
    // Handle currency inside math: \text{₦}
    .replace(/₦/g, '\\text{₦}')
    // Convert single digit fractions like \frac12 to \frac{1}{2}
    .replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, '\\frac{$1}{$2}')
    // Convert \frac{1}2 to \frac{1}{2}
    .replace(/\\frac\{([^{}]+)\}([0-9a-zA-Z])/g, '\\frac{$1}{$2}')
    // Convert \frac1{2} to \frac{1}{2}
    .replace(/\\frac([0-9a-zA-Z])\{([^{}]+)\}/g, '\\frac{$1}{$2}')
    .trim();
}

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

// Safely parses inline math, HTML underline, bold, italic, and soft linebreaks
function renderInlineContent(str: string): React.ReactNode[] {
  if (!str) return [];

  // Match:
  // 1. $$...$$ (block math)
  // 2. $...$ (inline math)
  // 3. <u>...</u> (underline tag e.g. JAMB English antonym/synonym questions)
  // 4. **...** (bold markdown)
  // 5. *...* (italic markdown)
  // 6. \n (soft newline)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|<u>[\s\S]*?<\/u>|\*\*[\s\S]*?\*\*|\*[^*\n]+?\*|\n)/g;
  const tokens = str.split(regex);

  return tokens.map((token, index) => {
    if (!token) return null;

    if (token === '\n') {
      return <br key={`br-${index}`} />;
    }

    // Block math $$...$$
    if (token.startsWith('$$') && token.endsWith('$$') && token.length >= 4) {
      const rawMath = token.slice(2, -2).trim();
      const math = cleanMathExpression(rawMath);
      try {
        return (
          <div key={`bm-${index}`} className="my-2.5 text-center max-w-full overflow-x-auto text-theme-text">
            <BlockMath 
              math={math} 
              renderError={() => <span className="italic text-theme-text px-1">[{rawMath}]</span>} 
            />
          </div>
        );
      } catch {
        return <span key={`bm-err-${index}`} className="italic text-theme-text px-1">[{rawMath}]</span>;
      }
    }

    // Inline math $...$
    if (token.startsWith('$') && token.endsWith('$') && token.length >= 2) {
      const rawMath = token.slice(1, -1).trim();
      const math = cleanMathExpression(rawMath);
      try {
        return (
          <InlineMath 
            key={`im-${index}`}
            math={math} 
            renderError={() => <span className="italic text-theme-text">{rawMath}</span>} 
          />
        );
      } catch {
        return <span key={`im-err-${index}`} className="italic text-theme-text">{rawMath}</span>;
      }
    }

    // Underline <u>...</u>
    if (token.startsWith('<u>') && token.endsWith('</u>') && token.length >= 7) {
      const inner = token.slice(3, -4);
      return (
        <u key={`u-${index}`} className="underline decoration-theme-accent underline-offset-4 font-semibold text-theme-text">
          {inner}
        </u>
      );
    }

    // Bold **...**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const inner = token.slice(2, -2);
      return <strong key={`b-${index}`} className="font-bold text-theme-text">{inner}</strong>;
    }

    // Italic *...*
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      const inner = token.slice(1, -1);
      return <em key={`i-${index}`} className="italic">{inner}</em>;
    }

    // Plain text token - return as-is to preserve natural word spacing
    return <React.Fragment key={`txt-${index}`}>{token}</React.Fragment>;
  });
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Clean raw carriage returns
  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If text does not contain tables, headings, or lists, render directly without block overhead
  const hasMarkdownStructure = /\|.*\||^(#{1,4}\s+|[\*\-\+]\s+)/m.test(sanitized);

  if (!hasMarkdownStructure) {
    // Check if there are double newlines (multiple paragraphs)
    const paragraphs = sanitized.split(/\n\s*\n/);
    if (paragraphs.length <= 1) {
      return (
        <div className={`text-theme-text leading-relaxed tracking-normal ${className}`}>
          {renderInlineContent(sanitized)}
        </div>
      );
    }

    return (
      <div className={`text-theme-text leading-relaxed tracking-normal ${className}`}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className={idx > 0 ? "mt-3" : ""}>
            {renderInlineContent(p)}
          </p>
        ))}
      </div>
    );
  }

  // Parse structured blocks: Tables, Headings, Lists, Paragraphs
  const rawLines = sanitized.split('\n');
  const blocks: Block[] = [];
  let currentTableLines: string[] = [];
  let currentListItems: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: currentParagraphLines.join('\n')
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
        currentParagraphLines.push(...currentTableLines);
        flushParagraph();
      }
      currentTableLines = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Markdown table row
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2 && !trimmed.startsWith('$$');
    if (isTableRow) {
      flushParagraph();
      flushList();
      currentTableLines.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Empty line (paragraph boundary)
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Markdown Headings
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

    // Markdown Bullet List
    if (/^[\*\-\+]\s+/.test(trimmed)) {
      flushParagraph();
      currentListItems.push(trimmed.replace(/^[\*\-\+]\s+/, ''));
      continue;
    } else {
      flushList();
    }

    // Normal line inside paragraph
    currentParagraphLines.push(line);
  }

  flushTable();
  flushList();
  flushParagraph();

  return (
    <div className={`text-theme-text leading-relaxed tracking-normal ${className}`}>
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
                          {renderInlineContent(head)}
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
                          {renderInlineContent(cell)}
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
                {renderInlineContent(block.text)}
              </h1>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={`h2-${idx}`} className="text-lg sm:text-xl font-extrabold mt-2.5 mb-1 tracking-tight text-theme-text">
                {renderInlineContent(block.text)}
              </h2>
            );
          }
          if (block.level === 3) {
            return (
              <h3 key={`h3-${idx}`} className="text-base sm:text-lg font-bold text-theme-accent mt-2 mb-0.5 tracking-snug">
                {renderInlineContent(block.text)}
              </h3>
            );
          }
          return (
            <h4 key={`h4-${idx}`} className="text-sm sm:text-base font-bold mt-1.5 mb-0.5 text-theme-text">
              {renderInlineContent(block.text)}
            </h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${idx}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-theme-accent">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-theme-text leading-relaxed">
                  {renderInlineContent(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <div key={`p-${idx}`} className={idx > 0 ? "mt-2.5" : ""}>
              {renderInlineContent(block.content)}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
