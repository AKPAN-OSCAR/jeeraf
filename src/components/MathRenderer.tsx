import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by double newlines or single newlines to process paragraphs and lines
  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, lineIdx) => {
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
            <h1 key={lineIdx} className="text-2xl sm:text-3xl font-black mt-4 mb-2 tracking-tight">
              {inlineParsed}
            </h1>
          );
        }
        if (headingLevel === 2) {
          return (
            <h2 key={lineIdx} className="text-xl sm:text-2xl font-extrabold mt-3 mb-2 tracking-tight">
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
            <h4 key={lineIdx} className="text-base font-bold mt-2 mb-1">
              {inlineParsed}
            </h4>
          );
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <div className="flex-1">{inlineParsed}</div>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-2">
              <span className="font-bold text-amber-500 text-sm shrink-0">{listPrefix}</span>
              <div className="flex-1">{inlineParsed}</div>
            </div>
          );
        }

        return (
          <div key={lineIdx} className="leading-relaxed">
            {inlineParsed}
          </div>
        );
      })}
    </div>
  );
};

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

