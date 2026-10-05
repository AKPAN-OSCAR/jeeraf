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

interface NormalBlock {
  type: 'line';
  line: string;
  lineIdx: number;
}

type ContentBlock = TableBlock | NormalBlock;

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks: ContentBlock[] = [];
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length === 0) return;

    const parsedTable = parseMarkdownTable(currentTableLines);
    if (parsedTable) {
      blocks.push(parsedTable);
    } else {
      // If table parsing failed, push as normal lines
      currentTableLines.forEach((l, idx) => {
        blocks.push({ type: 'line', line: l, lineIdx: idx });
      });
    }
    currentTableLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this line looks like part of a markdown table (e.g., contains |)
    const isTableRow = trimmed.length > 0 && (
      (trimmed.startsWith('|') && trimmed.endsWith('|')) ||
      (trimmed.split('|').length >= 3)
    );

    if (isTableRow) {
      currentTableLines.push(trimmed);
    } else {
      flushTable();
      blocks.push({ type: 'line', line, lineIdx: i });
    }
  }
  flushTable();

  return (
    <div className={`space-y-1.5 ${className}`}>
      {blocks.map((block, blockIdx) => {
        if (block.type === 'table') {
          return (
            <div 
              key={`tbl-${blockIdx}`} 
              className="overflow-x-auto my-3.5 p-1 rounded-2xl border border-theme-border bg-theme-card/60 shadow-sm max-w-full"
            >
              <table className="min-w-full divide-y divide-theme-border text-xs sm:text-sm text-left border-collapse">
                {block.headers.length > 0 && (
                  <thead className="bg-theme-bg/90">
                    <tr>
                      {block.headers.map((head, hIdx) => (
                        <th 
                          key={hIdx} 
                          className="px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-theme-text border-b border-theme-border text-center sm:text-left"
                        >
                          {parseInlineContent(head)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-theme-border/60">
                  {block.rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className="hover:bg-theme-bg/50 transition-colors odd:bg-theme-bg/20"
                    >
                      {row.map((cell, cIdx) => (
                        <td 
                          key={cIdx} 
                          className="px-3.5 py-2.5 text-theme-text font-medium text-center sm:text-left whitespace-nowrap"
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

        const { line, lineIdx } = block;
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-2" />;

        // Check for Markdown Headings
        let headingLevel = 0;
        let contentLine = line;

        if (/^####\s+/.test(line)) {
          headingLevel = 4;
          contentLine = line.replace(/^####\s+/, '');
        } else if (/^###\s+/.test(line)) {
          headingLevel = 3;
          contentLine = line.replace(/^###\s+/, '');
        } else if (/^##\s+/.test(line)) {
          headingLevel = 2;
          contentLine = line.replace(/^##\s+/, '');
        } else if (/^#\s+/.test(line)) {
          headingLevel = 1;
          contentLine = line.replace(/^#\s+/, '');
        }

        // Check for Bullet or List Items
        let isBullet = false;
        let isNumbered = false;
        let listPrefix = '';

        if (/^[\*\-\+]\s+/.test(contentLine)) {
          isBullet = true;
          contentLine = contentLine.replace(/^[\*\-\+]\s+/, '');
        } else if (/^\d+[\.\)]\s+/.test(contentLine)) {
          isNumbered = true;
          const match = contentLine.match(/^(\d+[\.\)])\s+/);
          if (match) {
            listPrefix = match[1];
            contentLine = contentLine.replace(/^(\d+[\.\)])\s+/, '');
          }
        }

        const inlineParsed = parseInlineContent(contentLine);

        if (headingLevel === 1) {
          return (
            <h1 key={lineIdx} className="text-2xl sm:text-3xl font-black mt-4 mb-2 tracking-tight text-theme-text">
              {inlineParsed}
            </h1>
          );
        }
        if (headingLevel === 2) {
          return (
            <h2 key={lineIdx} className="text-xl sm:text-2xl font-extrabold mt-3 mb-2 tracking-tight text-theme-text">
              {inlineParsed}
            </h2>
          );
        }
        if (headingLevel === 3) {
          return (
            <h3 key={lineIdx} className="text-lg sm:text-xl font-bold text-amber-500 mt-2.5 mb-1.5 tracking-snug">
              {inlineParsed}
            </h3>
          );
        }
        if (headingLevel === 4) {
          return (
            <h4 key={lineIdx} className="text-base font-bold mt-2 mb-1 text-theme-text">
              {inlineParsed}
            </h4>
          );
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <div className="flex-1 text-theme-text leading-relaxed">{inlineParsed}</div>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
              <span className="font-bold text-amber-500 text-sm shrink-0">{listPrefix}</span>
              <div className="flex-1 text-theme-text leading-relaxed">{inlineParsed}</div>
            </div>
          );
        }

        return (
          <div key={lineIdx} className="leading-relaxed text-theme-text">
            {inlineParsed}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to split a markdown row by pipe while respecting escaping
function splitTableRow(rowStr: string): string[] {
  let cleaned = rowStr.trim();
  if (cleaned.startsWith('|')) cleaned = cleaned.substring(1);
  if (cleaned.endsWith('|')) cleaned = cleaned.substring(0, cleaned.length - 1);
  return cleaned.split('|').map(cell => cell.trim());
}

// Parses raw consecutive lines into a TableBlock if valid
function parseMarkdownTable(tableLines: string[]): TableBlock | null {
  if (tableLines.length < 1) return null;

  // Check if second line is a separator like |---|---|
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

  // If there's no separator, but multiple lines with same column count
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

// Helper function to parse inline text, math ($...$ and $$...$$), bold (**...**), italics (*...*), and LaTeX symbols
function parseInlineContent(str: string): React.ReactNode[] {
  if (!str) return [];

  // Pre-process raw LaTeX commands outside dollars
  let processed = autoWrapLatexCommands(str);

  // Split by math blocks
  const parts = processed.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    // Block Math $$...$$
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      try {
        return <BlockMath key={index} math={math} />;
      } catch (e) {
        return <code key={index} className="text-xs bg-theme-bg px-1.5 py-0.5 rounded text-amber-400 font-mono">{math}</code>;
      }
    }

    // Inline Math $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1).trim();
      try {
        return <InlineMath key={index} math={math} />;
      } catch (e) {
        return <code key={index} className="text-xs bg-theme-bg px-1.5 py-0.5 rounded text-amber-400 font-mono">{math}</code>;
      }
    }

    // Text parsing for **bold** and *italic*
    return <React.Fragment key={index}>{parseFormattedText(part)}</React.Fragment>;
  });
}

function autoWrapLatexCommands(text: string): string {
  // If string contains LaTeX commands outside $, wrap them
  if (!text.includes('$')) {
    if (/\\(frac|sqrt|theta|pi|times|rightarrow|leftarrow|Rightarrow|Leftarrow|pm|approx|neq|cdot|le|ge|circ|int|sum|alpha|beta|gamma|delta|matrix|begin)/.test(text)) {
      return `$${text}$`;
    }
  }
  return text;
}

function parseFormattedText(text: string): React.ReactNode[] {
  // Split by ** for bold
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, i) => {
    if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length >= 4) {
      const inner = bPart.slice(2, -2);
      return <strong key={i} className="font-extrabold">{inner}</strong>;
    }

    // Split by * for italics
    const italicParts = bPart.split(/(\*.*?\*)/g);
    return italicParts.map((iPart, j) => {
      if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length >= 2) {
        const inner = iPart.slice(1, -1);
        return <em key={j} className="italic">{inner}</em>;
      }
      return iPart;
    });
  });
}
