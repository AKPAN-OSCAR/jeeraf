/**
 * @file IbomAIPage.tsx
 * @description Highly Interactive, Multimodal & Personalized JeeRaf AI Page.
 *
 * DEVELOPER FRIENDLY DOCUMENTATION:
 * 1. Visual Styling Rules:
 *    - AI Replies: Real Gold text (`#F59E0B`, `#EAB308`, `text-amber-300`, `font-extrabold text-sm md:text-base`) inside a rich dark-gold container.
 *    - User Messages: Real Thick Silver text (`#C0C0C0`, `#CBD5E1`, `text-slate-100`, `font-black text-sm md:text-base`) inside a metallic silver container.
 * 2. Preview vs Normal Chat Mechanism:
 *    - Toggle between "💬 Chat View" and "👁️ Live Preview Panel" to inspect User Progress, Library Catalog, System Themes, or Fun Games.
 * 3. Personalized User Context:
 *    - Fully aware of user's display name, email, subscription plan, active CBT mode, total exams taken, and average score.
 * 4. In-Chat Visual Previews & Actions:
 *    - Renders visual progress cards, textbook library cards, fun games arena, system feature links, and live theme switchers.
 * 5. Safety Guardrails & Admin Isolation:
 *    - Strictly blocks sexually explicit / NSFW content.
 *    - Has ZERO access to Admin Console or admin AI (Admin AI is completely isolated).
 *    - Never exposes backend API keys or database infrastructure secrets.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Send, Edit3, Volume2, VolumeX, ArrowLeft, ArrowRight,
  Bot, User, Lock, Palette, ExternalLink, ShieldAlert,
  BookOpen, Compass, Trophy, Gamepad2, Layers, Check,
  Eye, MessageSquare, BarChart2, Book, Star, Zap, Flame, Award,
  Download, Share2, FileText, Copy, Clock, Trash2, CheckCircle2,
  Share, X, Printer, RefreshCw, RotateCw, Camera, Paperclip, Image as ImageIcon, UploadCloud,
  Maximize2, Minimize2, ZapOff, Timer, Globe, CornerUpRight, Search, Home
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AIAvatar } from './AIAvatar';
import { GoogleGenAI } from '@google/genai';
import { 
  buildJeeRafSystemPrompt, 
  checkSafetyViolation, 
  detectThemeIntent, 
  detectNavigationIntent,
  searchKnowledgeBase, 
  SYSTEM_AVAILABLE_THEMES,
  LIBRARY_BOOKS,
  FUN_GAMES_LIST,
  SYSTEM_FEATURE_LINKS
} from '../data/ai_knowledge';
import { getActiveApiKey, logSystemAlert } from '../services/aiQuestions';

interface IbomAIPageProps {
  user: any;
  profile?: any;
  onBack: () => void;
  onNavigateToSubscription: () => void;
  onNavigate?: (state: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  attachment?: {
    dataUrl: string;
    name: string;
    mimeType: string;
    textContent?: string;
  };
  showThemeSelector?: boolean;
  activeThemeId?: string;
  showProgressCard?: boolean;
  showLibraryCard?: boolean;
  showGamesCard?: boolean;
  actionButton?: {
    label: string;
    targetState: string;
  };
  knowMoreSource?: string;
  isViolation?: boolean;
}

/**
 * Clean Formatted Message Renderer with Markdown table support, bullet/number parsing,
 * hashtag removal, bold highlights, and real-time TTS word-by-word highlighting.
 */
interface FormattedMessageTextProps {
  text: string;
  isSpeaking?: boolean;
  speakingCharIndex?: number;
  speakingCharLength?: number;
  onOpenBrowserUrl?: (url: string) => void;
}

const CodeBlockItem: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl border border-amber-500/30 overflow-hidden bg-slate-950 shadow-xl font-mono text-left">
      <div className="bg-slate-900/90 border-b border-amber-500/20 px-3.5 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <span className="font-extrabold uppercase text-[10px] tracking-widest text-amber-400">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 font-extrabold text-[11px] transition-all"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs md:text-sm text-slate-100 overflow-x-auto leading-relaxed font-semibold">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedMessageText: React.FC<FormattedMessageTextProps> = ({
  text,
  isSpeaking,
  speakingCharIndex = 0,
  speakingCharLength = 6,
  onOpenBrowserUrl
}) => {
  // Strip raw hash tags (#, ##, ###) at start of lines
  const cleanedText = text
    .split('\n')
    .map(line => line.replace(/^#{1,6}\s*/, ''))
    .join('\n');

  // Split text into code blocks vs standard text
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const contentParts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(cleanedText)) !== null) {
    if (match.index > lastIndex) {
      contentParts.push({ type: 'text', content: cleanedText.slice(lastIndex, match.index) });
    }
    contentParts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleanedText.length) {
    contentParts.push({ type: 'text', content: cleanedText.slice(lastIndex) });
  }

  const isTableLine = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');

  const renderInlineFormatted = (str: string, baseCharOffset: number = 0) => {
    if (isSpeaking && speakingCharIndex >= 0) {
      const start = Math.max(0, speakingCharIndex - baseCharOffset);
      const end = start + Math.max(5, speakingCharLength);

      if (start < str.length && start >= 0) {
        const before = str.slice(0, start);
        const highlighted = str.slice(start, end);
        const after = str.slice(end);

        return (
          <>
            {renderMarkdownBold(before)}
            <mark className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md shadow-md ring-2 ring-amber-300 inline-block transition-all transform scale-105">
              {highlighted}
            </mark>
            {renderMarkdownBold(after)}
          </>
        );
      }
    }

    return renderMarkdownBold(str);
  };

  const renderMarkdownBold = (str: string) => {
    // Matches markdown links [title](url), raw URLs http(s):// or www., bold **text**, italic *text*, code `code`
    const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|https?:\/\/[^\s<>\(\)]+|www\.[^\s<>\(\)]+|\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g;
    const tokens: React.ReactNode[] = [];
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = tokenRegex.exec(str)) !== null) {
      if (m.index > lastIdx) {
        tokens.push(str.slice(lastIdx, m.index));
      }

      const fullMatch = m[0];

      // Markdown Link: [Title](https://...)
      if (m[1] && m[2] && m[3]) {
        const title = m[2];
        const rawUrl = m[3];
        tokens.push(
          <span key={`mdlink-${m.index}`} className="inline-flex items-center my-0.5 mx-1 align-baseline shadow-md rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 text-slate-100 group">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenBrowserUrl) onOpenBrowserUrl(rawUrl);
              }}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-slate-950 bg-amber-500/15 hover:bg-amber-400 px-2.5 py-1 font-black text-xs transition-all cursor-pointer"
              title={`View link in JeeRaf Web Browser: ${rawUrl}`}
            >
              <Globe size={13} className="text-amber-400 group-hover:text-slate-950 shrink-0" />
              <span className="underline decoration-amber-400/60 underline-offset-2">{title}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(rawUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-amber-400 text-slate-300 hover:text-slate-950 transition-all border-l border-amber-500/30 flex items-center gap-1 text-[10px] font-black"
              title={`Open ${rawUrl} directly in Device Default Browser (Chrome)`}
            >
              <CornerUpRight size={12} className="shrink-0 text-amber-400 hover:text-slate-950" />
              <span className="hidden sm:inline">Device</span>
            </button>
          </span>
        );
      }
      // Raw URL: https://... or www....
      else if (fullMatch.startsWith('http://') || fullMatch.startsWith('https://') || fullMatch.startsWith('www.')) {
        const targetUrl = fullMatch.startsWith('www.') ? `https://${fullMatch}` : fullMatch;
        const displayUrl = fullMatch.length > 30 ? fullMatch.slice(0, 28) + '...' : fullMatch;
        tokens.push(
          <span key={`url-${m.index}`} className="inline-flex items-center my-0.5 mx-1 align-baseline shadow-md rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 text-slate-100 group">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpenBrowserUrl) onOpenBrowserUrl(targetUrl);
              }}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-slate-950 bg-amber-500/15 hover:bg-amber-400 px-2.5 py-1 font-black text-xs transition-all cursor-pointer"
              title={`View link in JeeRaf Web Browser: ${targetUrl}`}
            >
              <Globe size={13} className="text-amber-400 group-hover:text-slate-950 shrink-0" />
              <span className="underline decoration-amber-400/60 underline-offset-2">{displayUrl}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-amber-400 text-slate-300 hover:text-slate-950 transition-all border-l border-amber-500/30 flex items-center gap-1 text-[10px] font-black"
              title={`Open ${targetUrl} directly in Device Default Browser (Chrome)`}
            >
              <CornerUpRight size={12} className="shrink-0 text-amber-400 hover:text-slate-950" />
              <span className="hidden sm:inline">Device</span>
            </button>
          </span>
        );
      }
      // Bold **bold**
      else if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
        tokens.push(
          <strong key={`bold-${m.index}`} className="font-extrabold text-amber-300">
            {fullMatch.slice(2, -2)}
          </strong>
        );
      }
      // Italic *italic*
      else if (fullMatch.startsWith('*') && fullMatch.endsWith('*')) {
        tokens.push(
          <em key={`italic-${m.index}`} className="italic text-slate-200">
            {fullMatch.slice(1, -1)}
          </em>
        );
      }
      // Code `code`
      else if (fullMatch.startsWith('`') && fullMatch.endsWith('`') && fullMatch.length > 2) {
        tokens.push(
          <code key={`code-${m.index}`} className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-xs px-1.5 py-0.5 rounded-md">
            {fullMatch.slice(1, -1)}
          </code>
        );
      } else {
        tokens.push(fullMatch);
      }

      lastIdx = m.index + fullMatch.length;
    }

    if (lastIdx < str.length) {
      tokens.push(str.slice(lastIdx));
    }

    return tokens;
  };

  const renderTableBlock = (tableLines: string[], key: string) => {
    const cleanRows = tableLines
      .map(row => row.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1))
      .filter(row => row.length > 0 && !row.every(cell => cell.match(/^[-:]+$/)));

    if (cleanRows.length === 0) return null;

    const header = cleanRows[0];
    const bodyRows = cleanRows.slice(1);

    return (
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-amber-500/30 shadow-md bg-slate-950/80 p-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 font-black">
              {header.map((col, idx) => (
                <th key={idx} className="p-2.5 font-black uppercase text-[11px] tracking-wider border-r border-amber-500/20 last:border-r-0">
                  {col.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/20">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-900 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 font-extrabold text-slate-100 border-r border-amber-500/20 last:border-r-0">
                    {cell.replace(/\*\*/g, '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTextSegment = (segmentText: string, segmentIdx: number) => {
    const lines = segmentText.split('\n');
    const blocks: React.ReactNode[] = [];
    let currentTableLines: string[] = [];
    let lineOffset = 0;

    lines.forEach((line, lineIdx) => {
      const lineLen = line.length + 1;
      const currentOffset = lineOffset;
      lineOffset += lineLen;

      if (isTableLine(line)) {
        currentTableLines.push(line);
        return;
      } else if (currentTableLines.length > 0) {
        blocks.push(renderTableBlock(currentTableLines, `table-${segmentIdx}-${lineIdx}`));
        currentTableLines = [];
      }

      const trimmed = line.trim();
      if (!trimmed) {
        blocks.push(<div key={`sp-${segmentIdx}-${lineIdx}`} className="h-1.5" />);
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        blocks.push(
          <div key={`num-${segmentIdx}-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 text-sm leading-relaxed font-bold">
              {renderInlineFormatted(numMatch[2], currentOffset)}
            </div>
          </div>
        );
        return;
      }

      const bulletMatch = trimmed.match(/^([-*•])\s+(.*)/);
      if (bulletMatch) {
        blocks.push(
          <div key={`bullet-${segmentIdx}-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm" />
            <div className="flex-1 text-sm leading-relaxed font-bold">
              {renderInlineFormatted(bulletMatch[2], currentOffset)}
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        blocks.push(
          <div key={`heading-${segmentIdx}-${lineIdx}`} className="font-black text-amber-300 text-sm md:text-base border-b border-amber-500/20 pb-1 mt-3 mb-1">
            {renderInlineFormatted(trimmed.slice(2, -2), currentOffset)}
          </div>
        );
        return;
      }

      blocks.push(
        <p key={`p-${segmentIdx}-${lineIdx}`} className="leading-relaxed font-bold">
          {renderInlineFormatted(line, currentOffset)}
        </p>
      );
    });

    if (currentTableLines.length > 0) {
      blocks.push(renderTableBlock(currentTableLines, `table-end-${segmentIdx}`));
    }

    return <div key={`seg-${segmentIdx}`} className="space-y-1">{blocks}</div>;
  };

  return (
    <div className="space-y-2">
      {contentParts.map((part, idx) => {
        if (part.type === 'code') {
          return <CodeBlockItem key={`code-${idx}`} code={part.content} language={part.language} />;
        }
        return renderTextSegment(part.content, idx);
      })}
    </div>
  );
};

export const IbomAIPage: React.FC<IbomAIPageProps> = ({ 
  user, 
  profile, 
  onBack, 
  onNavigateToSubscription,
  onNavigate,
  onOpenBrowserUrl
}) => {
  const [aiName, setAiName] = useState('JeeRaf');
  const [nameChangesRemaining, setNameChangesRemaining] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>(profile?.theme || 'white');

  // Real-time TTS Voice Tracking for Highlighting Spoken Words
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number>(0);
  const [speakingCharLength, setSpeakingCharLength] = useState<number>(6);

  const handleSpeak = (msgId: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      setSpeakingCharIndex(0);
      return;
    }

    const cleanText = textToSpeak.replace(/[*#_~`|]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.onboundary = (e) => {
      if (e.charIndex !== undefined) {
        setSpeakingCharIndex(e.charIndex);
        setSpeakingCharLength(e.charLength || 6);
      }
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
      setSpeakingCharIndex(0);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
      setSpeakingCharIndex(0);
    };

    setSpeakingMsgId(msgId);
    setSpeakingCharIndex(0);
    window.speechSynthesis.speak(utterance);
  };
  
  // 24-Hour Expiry Session & Export Management
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Assignment File Attachment & Camera Capture State
  const [attachedMedia, setAttachedMedia] = useState<{ dataUrl: string; name: string; mimeType: string; textContent?: string } | null>(null);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraViewMode, setCameraViewMode] = useState<'compact' | 'fullscreen'>('compact');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [autoSnap, setAutoSnap] = useState<boolean>(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Rich Workspace Preview Modal State
  const [showRichPreviewModal, setShowRichPreviewModal] = useState<boolean>(false);
  const [selectedPreviewMessage, setSelectedPreviewMessage] = useState<Message | null>(null);
  const [previewTab, setPreviewTab] = useState<'all' | 'assignments' | 'tables' | 'code'>('all');
  const [previewFontSize, setPreviewFontSize] = useState<number>(15);

  // Start Live Camera Viewfinder
  const handleStartCamera = async () => {
    setCameraViewMode('compact');
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera permission denied or unavailable, opening file picker:", err);
      setShowCameraModal(false);
      fileInputRef.current?.click();
    }
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setTorchOn(false);
    setAutoSnap(false);
    setAutoCountdown(null);
  };

  // Toggle Torch/Flash light
  const handleToggleTorch = async () => {
    if (cameraStream) {
      const track = cameraStream.getVideoTracks()[0];
      if (track) {
        try {
          const nextState = !torchOn;
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          if (capabilities.torch) {
            await (track as any).applyConstraints({
              advanced: [{ torch: nextState }]
            });
          }
          setTorchOn(nextState);
        } catch (err) {
          console.warn("Torch control failed or unhandled:", err);
          setTorchOn(!torchOn);
        }
      }
    }
  };

  // Auto Snap Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (autoSnap && showCameraModal) {
      if (autoCountdown === null) {
        setAutoCountdown(3);
      } else if (autoCountdown > 0) {
        timer = setTimeout(() => {
          setAutoCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
        }, 1000);
      } else if (autoCountdown === 0) {
        handleCapturePhoto();
      }
    } else {
      setAutoCountdown(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoSnap, autoCountdown, showCameraModal]);

  // Capture Frame from Camera
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAttachedMedia({
          dataUrl,
          name: `Assignment_Snap_${new Date().toISOString().slice(11,19).replace(/:/g,'-')}.jpg`,
          mimeType: 'image/jpeg'
        });
      }
    }
    handleStopCamera();
  };

  // Handle File / Image / Code / Document Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTextOrCode = file.type.startsWith('text/') || 
      file.type === 'application/json' || 
      file.type === 'application/javascript' ||
      /\.(txt|md|js|jsx|ts|tsx|py|java|cpp|c|h|cs|json|csv|html|css|sql|xml|yaml|yml|sh|doc|docx)$/i.test(file.name);

    if (isTextOrCode) {
      const textReader = new FileReader();
      textReader.onload = (txtEvent) => {
        const textContent = txtEvent.target?.result as string;
        const dataReader = new FileReader();
        dataReader.onload = (dataEvent) => {
          setAttachedMedia({
            dataUrl: dataEvent.target?.result as string,
            name: file.name,
            mimeType: file.type || 'text/plain',
            textContent: textContent
          });
        };
        dataReader.readAsDataURL(file);
      };
      textReader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachedMedia({
          dataUrl,
          name: file.name,
          mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const userName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const totalExams = profile?.totalExamsTaken || 0;
  const avgAccuracy = profile?.averageScore || 0;
  const subPlan = profile?.subscriptionStatus === 'paid' ? (profile?.plan === 'claxy_pro' ? 'Claxy Pro Mode' : 'Claxy Mode') : 'Free Trial Mode';

  // Check 24-hour auto-reset on mount
  useEffect(() => {
    const savedStart = localStorage.getItem('ibom_ai_session_start');
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (savedStart) {
      const parsed = parseInt(savedStart, 10);
      if (!isNaN(parsed) && now - parsed > ONE_DAY_MS) {
        localStorage.setItem('ibom_ai_session_start', now.toString());
        setSessionStartTime(now);
        setMessages([
          {
            id: `welcome-24h-${now}`,
            sender: 'ai',
            text: `⏱️ **24-Hour Session Refresh**: Welcome to your fresh daily session, **${userName}**!\n\nYour previous temporary conversation automatically cleared after 24 hours to keep your chat interface fast and secure. You can ask any new questions, solve assignments, or search for information anytime!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (!isNaN(parsed)) {
        setSessionStartTime(parsed);
      }
    } else {
      localStorage.setItem('ibom_ai_session_start', now.toString());
      setSessionStartTime(now);
    }
  }, [userName]);

  // Calculate remaining hours and minutes in current 24h session
  const getRemainingSessionTime = () => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - sessionStartTime;
    const remaining = Math.max(0, ONE_DAY_MS - elapsed);
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Reset 24h Chat Session manually
  const handleReset24hSession = () => {
    const now = Date.now();
    localStorage.setItem('ibom_ai_session_start', now.toString());
    setSessionStartTime(now);
    setMessages([
      {
        id: `welcome-reset-${now}`,
        sender: 'ai',
        text: `✨ **New 24-Hour Session Started**: Your chat session has been cleared and renewed!\n\nAsk me any question, search for study topics, solve math or science problems, or explore CBT features!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowExportModal(false);
    setExportNotice("Fresh 24-hour session started!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Copy Single Message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Copy Entire Chat Transcript
  const handleCopyTranscript = () => {
    const transcript = messages.map(m => `[${m.time}] ${m.sender === 'user' ? userName : aiName + ' AI'}:\n${m.text}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(transcript);
    setExportNotice("Full chat transcript copied to clipboard!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Export / Download Chat as Text File (.txt)
  const handleDownloadChatText = () => {
    const header = `===========================================\n${aiName} AI - JeeRaf Conversation Export\nUser: ${userName} (${user?.email || 'Scholar'})\nDate: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n===========================================\n\n`;
    const transcript = messages.map(m => `[${m.time}] ${m.sender === 'user' ? userName : aiName + ' AI'}:\n${m.text}\n`).join('\n-------------------------------------------\n\n');
    
    const blob = new Blob([header + transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JeeRaf_AI_Chat_Export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice("Chat exported as downloadable text file!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (customText?: string) => {
    let textToShare = customText;
    if (!textToShare) {
      const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
      textToShare = lastAiMsg ? `*Answer from ${aiName} AI on JeeRaf:*\n\n${lastAiMsg.text}` : `Studying on JeeRaf CBT with ${aiName} AI!`;
    }
    const cleanText = textToShare.replace(/[*#]/g, ' ').slice(0, 1500);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanText)}`;
    window.open(url, '_blank');
  };

  // Native Web Share (Transfer to Drive, Docs, Apps)
  const handleShareNative = async () => {
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
    const shareData = {
      title: `${aiName} AI Study Insights`,
      text: lastAiMsg ? lastAiMsg.text.slice(0, 1000) : `JeeRaf CBT Study Session`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Native share canceled:", err);
      }
    } else {
      handleCopyTranscript();
    }
  };

  // Dual Mode: Chat View vs Live Preview Panel
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [previewContent, setPreviewContent] = useState<'progress' | 'library' | 'themes' | 'games' | 'features' | 'browser'>('browser');

  // Embedded Web Browser State
  const [browserUrl, setBrowserUrl] = useState<string>('https://www.bing.com');
  const [browserInputUrl, setBrowserInputUrl] = useState<string>('https://www.bing.com');
  const [browserHistory, setBrowserHistory] = useState<string[]>(['https://www.bing.com']);
  const [browserHistoryIndex, setBrowserHistoryIndex] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Open URL inside Standalone JeeRaf Web Browser
  const handleOpenBrowserUrl = (url: string) => {
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    if (onOpenBrowserUrl) {
      onOpenBrowserUrl(target);
    } else if (onNavigate) {
      onNavigate('browser');
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello **${userName}**! Welcome to **${profile?.ibomCustomName || 'JeeRaf'} AI**, your intelligent assistant for the JeeRaf CBT platform.\n\nI am here to assist you with everything on the system — from answering general assignment & academic questions, explaining formulas, and helping you solve study problems, to guiding you through system tools, showing your progress, recommending textbooks, launching educational games, and changing theme colors.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isClaxyPro = profile?.subscriptionStatus === 'paid' && profile?.plan === 'claxy_pro';
  const isClaxy = profile?.subscriptionStatus === 'paid' && profile?.plan !== 'claxy_pro';

  // Load AI Customization & Current System Theme
  useEffect(() => {
    if (user && db) {
      const loadAiProfile = async () => {
        try {
          const docRef = doc(db, 'sib_profiles', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.ibomCustomName) {
              setAiName(data.ibomCustomName);
            }
            if (data.theme) {
              setCurrentTheme(data.theme);
            }
            if (data.nameChangesRemaining !== undefined) {
              setNameChangesRemaining(data.nameChangesRemaining);
            } else {
              const initialChanges = isClaxyPro ? 8 : (isClaxy ? 2 : 0);
              setNameChangesRemaining(initialChanges);
            }
          }
        } catch (err) {
          console.error("Failed to load AI profile:", err);
        }
      };
      loadAiProfile();
    }
  }, [user, profile, isClaxy, isClaxyPro]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Applies system theme live in DOM and persists choice to Firestore profile.
   */
  const handleApplyTheme = async (themeId: string, themeName: string) => {
    try {
      setCurrentTheme(themeId);
      localStorage.setItem('jeeraf_theme', themeId);
      localStorage.setItem('zeeraf_theme', themeId);
      document.documentElement.className = themeId === 'white' ? '' : `theme-${themeId}`;
      window.dispatchEvent(new CustomEvent('jeeraf-theme-change', { detail: themeId }));
      window.dispatchEvent(new CustomEvent('zeeraf-theme-change', { detail: themeId }));

      if (user && db) {
        const docRef = doc(db, 'sib_profiles', user.uid);
        await updateDoc(docRef, {
          theme: themeId,
          updatedAt: serverTimestamp()
        });
      }

      setMessages(prev => [
        ...prev,
        {
          id: `theme-msg-${Date.now()}`,
          sender: 'ai',
          text: `🎉 System theme color changed to **${themeName}**! Your account preference is updated.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          activeThemeId: themeId,
          knowMoreSource: 'JeeRaf Theme Engine'
        }
      ]);
    } catch (err) {
      console.error("Failed to update theme from chat:", err);
    }
  };

  /**
   * Saves custom assistant name.
   */
  const handleSaveAiName = async () => {
    const trimmed = newNameInput.trim();
    if (!trimmed) {
      setNameError("Name cannot be empty.");
      return;
    }

    if (nameChangesRemaining <= 0) {
      setNameError("No remaining name changes. Upgrade your plan for more edits!");
      return;
    }

    try {
      const updatedRemaining = nameChangesRemaining - 1;
      setAiName(trimmed);
      setNameChangesRemaining(updatedRemaining);
      setIsEditingName(false);
      setNewNameInput('');
      setNameError(null);

      if (user && db) {
        const docRef = doc(db, 'sib_profiles', user.uid);
        await updateDoc(docRef, {
          ibomCustomName: trimmed,
          nameChangesRemaining: updatedRemaining
        });
      }

      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'ai',
          text: `My assistant name is now updated to **${trimmed}**. (${updatedRemaining} edits remaining)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Failed to save AI name:", err);
      setNameError("Failed to update name. Please try again.");
    }
  };

  /**
   * Primary Message Handler with Safety Checks, Multimodal Assignment Solver, Theme Execution & Gemini AI.
   */
  const handleSendMessage = async (textToSend: string) => {
    if ((!textToSend.trim() && !attachedMedia) || isTyping) return;

    const currentAttachment = attachedMedia;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim() || `Solve assignment question in attached file (${currentAttachment?.name || 'Image'})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAttachedMedia(null);
    setIsTyping(true);

    const lowerInput = textToSend.toLowerCase();

    // 1. SECURITY & SAFETY GUARDRAIL CHECK
    const safetyDenial = checkSafetyViolation(textToSend);
    if (safetyDenial) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-safe-${Date.now()}`,
            sender: 'ai',
            text: safetyDenial,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isViolation: true
          }
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // 2. THEME COLOR INTENT DETECTION & LIVE TASK EXECUTION
    const themeIntent = detectThemeIntent(textToSend);
    if (themeIntent) {
      const { themeId, themeName } = themeIntent;
      
      localStorage.setItem('jeeraf_theme', themeId);
      localStorage.setItem('zeeraf_theme', themeId);
      document.documentElement.className = themeId === 'white' ? '' : `theme-${themeId}`;
      window.dispatchEvent(new CustomEvent('jeeraf-theme-change', { detail: themeId }));
      window.dispatchEvent(new CustomEvent('zeeraf-theme-change', { detail: themeId }));
      setCurrentTheme(themeId);

      if (user && db) {
        try {
          const docRef = doc(db, 'sib_profiles', user.uid);
          await updateDoc(docRef, { theme: themeId, updatedAt: serverTimestamp() });
        } catch (e) {
          console.error("Theme sync error:", e);
        }
      }

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-theme-${Date.now()}`,
            sender: 'ai',
            text: `I have updated your system theme to **${themeName}**! Check out the palette below or switch to another color anytime:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showThemeSelector: true,
            activeThemeId: themeId,
            knowMoreSource: 'JeeRaf Theme Engine'
          }
        ]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // 3. DETECT NAVIGATION & IN-CHAT VISUAL CARDS
    let navAction: { label: string; targetState: string } | undefined = undefined;
    let showThemePalette = false;
    let showProgress = false;
    let showLibrary = false;
    let showGames = false;

    if (lowerInput.includes('progress') || lowerInput.includes('score') || lowerInput.includes('my stats') || lowerInput.includes('performance')) {
      showProgress = true;
      navAction = { label: 'Open Detailed Progress Analytics', targetState: 'progress' };
      setPreviewContent('progress');
    } else if (lowerInput.includes('book') || lowerInput.includes('library') || lowerInput.includes('read') || lowerInput.includes('textbook')) {
      showLibrary = true;
      navAction = { label: 'Explore Textbook Library', targetState: 'textbook' };
      setPreviewContent('library');
    } else if (lowerInput.includes('game') || lowerInput.includes('fun') || lowerInput.includes('trivia') || lowerInput.includes('duel')) {
      showGames = true;
      navAction = { label: 'Launch Fun Games Arena', targetState: 'fun' };
      setPreviewContent('games');
    } else if (lowerInput.includes('theme') || lowerInput.includes('color')) {
      showThemePalette = true;
      setPreviewContent('themes');
    } else {
      const navIntent = detectNavigationIntent(textToSend);
      if (navIntent) {
        navAction = { label: `Go to ${navIntent.name}`, targetState: navIntent.targetState };
      }
    }

    // 4. REAL-TIME AI SEARCH ENGINE & MULTI-TURN CONVERSATION EXECUTION
    const kbContext = searchKnowledgeBase(textToSend);
    let aiReplyText = '';

    try {
      const systemPrompt = buildJeeRafSystemPrompt(aiName, {
        displayName: userName,
        email: user?.email,
        cbtCategory: profile?.cbtCategory,
        subscriptionStatus: profile?.subscriptionStatus,
        plan: profile?.plan,
        theme: currentTheme,
        totalExamsTaken: totalExams,
        averageScore: avgAccuracy
      });

      // Maintain last 8 conversation turns for continuous contextual chat (filtering out welcome banners)
      const recentHistory = messages
        .filter(m => m.id !== 'welcome-1')
        .slice(-8)
        .map(m => `${m.sender === 'user' ? 'User' : aiName + ' AI'}: ${m.text.slice(0, 1000)}`)
        .join('\n\n');

      const documentTextContent = currentAttachment?.textContent 
        ? `\n\nATTACHED DOCUMENT / CODE FILE CONTENT ("${currentAttachment.name}"):\n\`\`\`\n${currentAttachment.textContent}\n\`\`\`\n`
        : '';

      const isFollowUp = messages.length > 1;

      const combinedPrompt = `${systemPrompt}

RECENT CONVERSATION HISTORY:
${recentHistory || 'Start of conversation.'}

${kbContext ? `LOCAL KNOWLEDGE BASE SEARCH GROUNDING:\n${kbContext}\n` : ''}
USER QUERY / ASSIGNMENT / SEARCH QUESTION:
${textToSend || 'Analyze the attached file/image and solve all problems step-by-step.'}
${documentTextContent}

${currentAttachment ? `IMPORTANT INSTRUCTION: The user uploaded an attachment ("${currentAttachment.name}"). Examine all text, questions, code, or images carefully and provide accurate, thorough, step-by-step answers and calculations.` : ''}

${isFollowUp ? 'CRITICAL RULE: This is an ongoing conversation. DO NOT REPEAT greetings, welcomes, or self-introductions. Jump straight into answering the query directly, articulately, and accurately.' : ''}

FORMATTING INSTRUCTIONS:
- DO NOT USE HASHTAG MARKDOWN SYMBOLS (#, ##, ###).
- Use BOLD titles on their own lines (e.g. **Step-by-Step Solution:** or **Key Concepts:**).
- Use clean numbered lists (1., 2., 3.) for procedures, steps, or calculations.
- Use bullet points (•) for options or features.
- Use clean markdown tables (| Header 1 | Header 2 |) for comparative facts, formulas, or schedules.
- Use clean markdown code blocks (\`\`\`language ... \`\`\`) for programming code.
- Bold important keywords, final answers, and values naturally.
- Provide a clear, thorough, articulate, and highly intelligent answer.`;

      const activeApiKey = getActiveApiKey('ibom_ai');
      if (activeApiKey) {
        const ai = new GoogleGenAI({ apiKey: activeApiKey });

        let contentsParts: any[] = [combinedPrompt];

        if (currentAttachment && currentAttachment.dataUrl.startsWith('data:')) {
          const mime = currentAttachment.mimeType || 'image/jpeg';
          if (mime.startsWith('image/') || mime === 'application/pdf') {
            const base64Data = currentAttachment.dataUrl.split(',')[1] || currentAttachment.dataUrl;
            const mediaPart = {
              inlineData: {
                data: base64Data,
                mimeType: mime
              }
            };
            contentsParts = [mediaPart, combinedPrompt];
          }
        }

        const preferredModel = (typeof localStorage !== 'undefined' ? localStorage.getItem('sib_ibom_ai_model') : null) || 'gemini-2.0-flash';
        const candidateModels = Array.from(new Set([preferredModel, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']));

        let lastModelErr: any = null;
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: contentsParts,
            });
            if (response?.text) {
              aiReplyText = response.text;
              break;
            }
          } catch (modelErr) {
            lastModelErr = modelErr;
            console.warn(`Model ${modelName} failed or denied:`, modelErr);
          }
        }

        if (!aiReplyText && lastModelErr) {
          await logSystemAlert('Ibom AI', 'Gemini API Failure', `Failed to generate response using active key. ${lastModelErr?.message || String(lastModelErr)}`, lastModelErr);
        }
      } else {
        console.warn("No active Gemini API key found in system settings or environment.");
      }
    } catch (err) {
      console.warn("Gemini API execution error:", err);
      await logSystemAlert('Ibom AI', 'Runtime Error', String(err), err);
    }

    // Fast Fallback if Gemini not available or offline
    if (!aiReplyText) {
      if (showProgress) {
        aiReplyText = `Here is your account performance summary, **${userName}**:\n\n- **Completed Exams**: ${totalExams}\n- **Average Accuracy**: ${avgAccuracy}%\n- **Active Plan**: ${subPlan}\n\nYou are making great progress! You can review your weak topics or take another practice test anytime.`;
      } else if (showLibrary) {
        aiReplyText = `Here are top recommended textbooks for your studies, **${userName}**:\n\n- **Physics**: Senior Secondary Physics by P. N. Okeke & Anyakoha\n- **Chemistry**: New School Chemistry by Osei Yaw Ababio\n- **Mathematics**: New General Mathematics by Macrae et al.\n- **English**: Use of English by Nwachukwu-Agbada\n\nYou can click below to explore the full interactive Textbook Library!`;
      } else if (showGames) {
        aiReplyText = `Ready for a break, **${userName}**? Try our **CBT Speed Trivia Arena** or challenge other scholars in a **1v1 Online CBT Duel Match**!`;
      } else if (kbContext) {
        aiReplyText = `${kbContext}`;
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        aiReplyText = `Greetings, **${userName}**! I am **${aiName} AI**, your general-purpose smart model and search engine. I am ready to answer any questions on education, assignments, mathematics, science, literature, programming, or general knowledge. How can I assist you today?`;
      } else {
        aiReplyText = `Regarding **${textToSend}**:\n\nAs your AI assistant and search engine on the JeeRaf CBT Platform, I can help answer homework questions, break down complex concepts step-by-step, explain formulas, or search for information across any domain! Let me know if you would like a detailed explanation on this topic.`;
      }
    }

    setTimeout(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: navAction,
        showThemeSelector: showThemePalette,
        showProgressCard: showProgress,
        showLibraryCard: showLibrary,
        showGamesCard: showGames
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (ttsEnabled) {
        handleSpeak(aiMsg.id, aiReplyText);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-3 md:p-6 flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-3 border-b border-theme-border max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} onNavigate={onNavigate} />
          <button onClick={onBack} className="p-2 bg-theme-card rounded-xl border border-theme-border hover:bg-theme-bg transition-colors" title="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2 text-theme-text tracking-tight">
              <Sparkles className="text-amber-400 animate-pulse" size={22} /> {aiName} AI Studio
            </h1>
            <p className="text-[11px] text-theme-muted font-bold">
              Account: <span className="text-amber-400">{userName}</span> ({subPlan})
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenBrowserUrl('https://www.bing.com')}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
            title="Open Web Browser Page"
          >
            <Globe size={15} /> <span className="hidden sm:inline">Web Browser</span>
          </button>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              ttsEnabled ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-theme-card border-theme-border text-theme-muted'
            }`}
            title="Toggle Voice Reader"
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-4">
        {/* AI Name Customization Bar */}
        <div className="bg-theme-card border border-theme-border p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <span className="font-extrabold text-theme-text">Assistant: <span className="text-amber-400">{aiName}</span></span>
              <span className="ml-2 text-[10px] bg-theme-bg border border-theme-border px-2 py-0.5 rounded-full font-extrabold text-theme-muted">
                {nameChangesRemaining} Edits Left
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {!isEditingName ? (
              <button 
                onClick={() => setIsEditingName(true)}
                disabled={nameChangesRemaining <= 0}
                className="w-full sm:w-auto px-3 py-1.5 bg-theme-bg border border-theme-border hover:border-amber-400 text-theme-text font-black rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all text-xs"
              >
                {nameChangesRemaining > 0 ? <Edit3 size={14} /> : <Lock size={14} />}
                Rename AI
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <input 
                  type="text" 
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  placeholder="New AI Name..."
                  className="bg-theme-bg border border-theme-border rounded-xl px-3 py-1 text-xs font-bold text-theme-text focus:outline-none focus:ring-1 focus:ring-amber-400/50 w-full"
                />
                <button onClick={handleSaveAiName} className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shrink-0">
                  Save
                </button>
                <button onClick={() => setIsEditingName(false)} className="px-3 py-1 bg-theme-bg border border-theme-border text-theme-muted font-bold text-xs rounded-xl shrink-0">
                  Cancel
                </button>
              </div>
            )}
            {nameChangesRemaining <= 0 && (
              <button onClick={onNavigateToSubscription} className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold text-xs rounded-xl hover:bg-amber-500/20 transition-all shrink-0">
                Get Edits
              </button>
            )}
          </div>
        </div>

        {nameError && (
          <p className="text-rose-500 text-xs font-extrabold text-center bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
            {nameError}
          </p>
        )}

        {/* 24-Hour Temporary Session Banner */}
        <div className="bg-theme-card/80 border border-theme-border p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold shadow-sm">
          <div className="flex items-center gap-2 text-theme-text">
            <Clock size={15} className="text-amber-400 shrink-0 animate-pulse" />
            <span>
              ⏱️ <strong className="text-amber-400">24-Hour Session Active</strong> — Temporary chat automatically resets in <strong className="text-amber-400 font-extrabold">{getRemainingSessionTime()}</strong> for maximum security & performance.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai') || null;
                setSelectedPreviewMessage(lastAiMsg);
                setShowRichPreviewModal(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/50 text-amber-300 rounded-xl flex items-center gap-1.5 font-black transition-all shadow-md shrink-0"
            >
              <Eye size={14} className="text-amber-400" /> Rich Workspace Preview
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl flex items-center gap-1.5 font-extrabold transition-all shrink-0"
            >
              <Share2 size={13} /> Export & Transfer
            </button>
            <button
              onClick={handleReset24hSession}
              className="px-2.5 py-1.5 bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text rounded-xl flex items-center gap-1 font-bold transition-all shrink-0"
              title="Start fresh 24h session now"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black rounded-xl text-center flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={16} /> {exportNotice}
          </motion.div>
        )}

        {/* Ibom AI Full-Fitted Chat Workspace */}
        <div className="bg-theme-card border border-theme-border rounded-2xl p-4 md:p-6 shadow-md flex-1 flex flex-col justify-between space-y-4 min-h-[620px]">
            {/* Messages Scroll Area */}
            <div className="space-y-4 overflow-y-auto flex-1 min-h-[420px] max-h-[72vh] pr-2 scroll-smooth">
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && <AIAvatar size="xs" />}
                    
                    <div className={`max-w-[88%] md:max-w-[80%] p-4 rounded-2xl leading-relaxed space-y-3 shadow-md transition-all ${
                      msg.isViolation
                        ? 'bg-rose-950/80 border-2 border-rose-500/50 text-rose-200 font-extrabold text-sm'
                        : isAI 
                          ? 'bg-theme-card border-2 border-theme-border text-theme-text font-bold text-sm md:text-base tracking-wide shadow-md' 
                          : 'bg-slate-900/95 border-2 border-slate-400/50 text-slate-100 font-black text-sm md:text-base tracking-wide shadow-slate-500/10'
                    }`}>
                      {msg.isViolation && (
                        <div className="flex items-center gap-1.5 font-black text-rose-400 text-xs mb-1">
                          <ShieldAlert size={16} /> Safety Guardrail Enforcement
                        </div>
                      )}

                      {/* Header Badge */}
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pb-1 border-b border-theme-border">
                        <span className={isAI ? 'text-amber-400 flex items-center gap-2' : 'text-slate-300'}>
                          {isAI ? `✨ ${aiName} AI` : `👤 ${userName}`}
                          {isAI && speakingMsgId === msg.id && (
                            <span className="flex items-center gap-1 text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse shadow-sm">
                              <Volume2 size={10} /> Reading Aloud...
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-theme-muted font-bold">{msg.time}</span>
                          {isAI && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedPreviewMessage(msg);
                                  setShowRichPreviewModal(true);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-[10px] border border-amber-500/40 transition-all flex items-center gap-1 shadow-sm"
                                title="Open in Rich Preview Workspace"
                              >
                                <Eye size={12} className="text-amber-400" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                className="p-1 rounded hover:bg-theme-bg/60 text-theme-muted hover:text-amber-400 transition-colors"
                                title="Copy response text"
                              >
                                {copiedMsgId === msg.id ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                              <button
                                onClick={() => handleShareWhatsApp(`*Answer from ${aiName} AI:*\n\n${msg.text}`)}
                                className="p-1 rounded hover:bg-theme-bg/60 text-theme-muted hover:text-emerald-400 transition-colors"
                                title="Share response to WhatsApp"
                              >
                                <Share2 size={13} />
                              </button>
                              <button
                                onClick={() => handleSpeak(msg.id, msg.text)}
                                className={`p-1 rounded hover:bg-theme-bg/60 transition-colors ${speakingMsgId === msg.id ? 'text-amber-400 font-bold' : 'text-theme-muted hover:text-theme-text'}`}
                                title={speakingMsgId === msg.id ? "Stop Reading" : "Read Aloud"}
                              >
                                {speakingMsgId === msg.id ? <Volume2 size={13} className="animate-bounce" /> : <VolumeX size={13} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Text Content with Formatted Table, Lists, Bold, and TTS Highlighting */}
                      <FormattedMessageText
                        text={msg.text}
                        isSpeaking={speakingMsgId === msg.id}
                        speakingCharIndex={speakingCharIndex}
                        speakingCharLength={speakingCharLength}
                        onOpenBrowserUrl={handleOpenBrowserUrl}
                      />

                      {/* Attached Question Image or Document Preview */}
                      {msg.attachment && (
                        <div className="mt-2 mb-2 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950/90 p-2 space-y-2 shadow-lg max-w-sm">
                          {msg.attachment.dataUrl.startsWith('data:image') ? (
                            <img
                              src={msg.attachment.dataUrl}
                              alt={msg.attachment.name}
                              className="max-h-64 w-full object-contain rounded-xl bg-black/40 mx-auto"
                            />
                          ) : (
                            <div className="p-3 bg-amber-500/10 rounded-xl flex items-center gap-2 text-amber-300 font-bold text-xs">
                              <FileText size={20} className="text-amber-400 shrink-0" />
                              <span className="truncate">{msg.attachment.name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-amber-400 font-extrabold px-1">
                            <span className="truncate">📄 {msg.attachment.name}</span>
                            <a
                              href={msg.attachment.dataUrl}
                              download={msg.attachment.name}
                              className="hover:underline flex items-center gap-1 shrink-0 ml-2"
                            >
                              <Download size={11} /> Save
                            </a>
                          </div>
                        </div>
                      )}

                      {/* In-Chat Visual Card: Progress Analytics */}
                      {msg.showProgressCard && (
                        <div className="mt-3 p-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-black text-amber-400 border-b border-amber-500/20 pb-1.5">
                            <span className="flex items-center gap-1"><BarChart2 size={14} /> Performance Card</span>
                            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">{subPlan}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center pt-1">
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="block text-[10px] text-slate-400 font-bold">Exams Taken</span>
                              <span className="text-base font-black text-amber-400">{totalExams}</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="block text-[10px] text-slate-400 font-bold">Avg Accuracy</span>
                              <span className="text-base font-black text-emerald-400">{avgAccuracy}%</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                              <span className="block text-[10px] text-slate-400 font-bold">Active Theme</span>
                              <span className="text-xs font-black text-amber-300 capitalize">{currentTheme}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* In-Chat Visual Card: Recommended Library Books */}
                      {msg.showLibraryCard && (
                        <div className="mt-3 p-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-black text-amber-400 border-b border-amber-500/20 pb-1.5">
                            <span className="flex items-center gap-1"><Book size={14} /> Recommended Textbooks</span>
                            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">6 Books</span>
                          </div>
                          <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                            {LIBRARY_BOOKS.slice(0, 3).map((book) => (
                              <div key={book.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                                <div>
                                  <span className="font-black text-amber-300 block">{book.title}</span>
                                  <span className="text-[10px] text-slate-400">{book.author} ({book.subject})</span>
                                </div>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold">{book.examTarget.split(',')[0]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* In-Chat Visual Card: Fun Games Arena */}
                      {msg.showGamesCard && (
                        <div className="mt-3 p-3 bg-slate-950/80 border border-amber-500/30 rounded-xl text-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-black text-amber-400 border-b border-amber-500/20 pb-1.5">
                            <span className="flex items-center gap-1"><Gamepad2 size={14} /> Fun & Games Hub</span>
                            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">Play & Learn</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2 pt-1">
                            {FUN_GAMES_LIST.map((game) => (
                              <div key={game.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                                <span className="font-black text-amber-300 block">{game.name}</span>
                                <span className="text-[10px] text-slate-400 block">{game.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Theme Selector in Chat */}
                      {msg.showThemeSelector && (
                        <div className="mt-3 pt-3 border-t border-amber-500/30">
                          <p className="font-black text-xs mb-2 text-amber-300 flex items-center gap-1.5">
                            <Palette size={14} className="text-amber-400" /> Select System Theme Color:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {SYSTEM_AVAILABLE_THEMES.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => handleApplyTheme(t.id, t.name)}
                                className={`p-2 rounded-xl border text-[10px] font-black flex items-center justify-between transition-all ${
                                  currentTheme === t.id
                                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30'
                                    : 'border-slate-800 bg-slate-900 hover:border-amber-400 text-slate-200'
                                }`}
                              >
                                <span className="truncate">{t.name.split(' ')[0]}</span>
                                {currentTheme === t.id && <Check size={12} className="text-amber-400 shrink-0 ml-1" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Navigation Action Trigger Button */}
                      {msg.actionButton && onNavigate && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => onNavigate(msg.actionButton!.targetState)}
                            className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-md"
                          >
                            <ExternalLink size={14} /> {msg.actionButton.label}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isAI && (
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-100 flex items-center justify-center shrink-0 border border-slate-500 shadow-sm font-black text-xs">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <AIAvatar size="xs" isLoading={true} />
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-black animate-pulse flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400 animate-spin" /> {aiName} is analyzing context and formulating response...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Area */}
            <div className="pt-3 border-t border-theme-border space-y-2 shrink-0">

              {/* Attached Media Badge Preview */}
              {attachedMedia && (
                <div className="p-2.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {attachedMedia.dataUrl.startsWith('data:image') ? (
                      <img src={attachedMedia.dataUrl} alt="Preview" className="w-10 h-10 object-cover rounded-xl border border-amber-500/50 shrink-0 bg-black" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        <FileText size={20} />
                      </div>
                    )}
                    <div className="truncate">
                      <span className="block text-xs font-black text-amber-300 truncate">{attachedMedia.name}</span>
                      <span className="block text-[10px] text-emerald-400 font-extrabold">📸 Attached — {aiName} AI ready to solve assignment</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedMedia(null)}
                    className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl transition-all shrink-0"
                    title="Remove attachment"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
                className="flex items-center gap-2 bg-theme-bg border-2 border-theme-border rounded-2xl p-2 focus-within:border-amber-400 transition-all shadow-inner"
              >
                {/* Hidden File Upload Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*,.pdf,.doc,.docx,.txt" 
                  className="hidden" 
                />

                {/* Camera Snap Button */}
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-xl transition-all shrink-0 flex items-center gap-1 font-extrabold text-xs"
                  title="Snap photo of assignment question with camera"
                >
                  <Camera size={18} />
                  <span className="hidden md:inline">Snap</span>
                </button>

                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-theme-bg hover:bg-theme-card border border-theme-border hover:border-amber-400 text-theme-muted hover:text-amber-400 rounded-xl transition-all shrink-0 flex items-center gap-1 font-extrabold text-xs"
                  title="Upload question image or file from device"
                >
                  <Paperclip size={18} />
                  <span className="hidden md:inline">Upload</span>
                </button>

                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={attachedMedia ? "Type extra details or press Solve..." : "Ask or snap assignment photo..."}
                  className="flex-1 bg-transparent px-2 py-1.5 border-none outline-none text-xs md:text-sm font-extrabold text-theme-text placeholder:text-theme-muted"
                />

                <button 
                  type="submit"
                  disabled={(!inputMessage.trim() && !attachedMedia) || isTyping}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md"
                  title="Send or Solve"
                >
                  <Send size={15} /> <span className="hidden sm:inline text-xs font-black">Solve</span>
                </button>
              </form>
            </div>
          </div>
      </div>

      {/* Live Camera Capture Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col transition-all overflow-hidden ${
                cameraViewMode === 'fullscreen'
                  ? 'fixed inset-2 md:inset-4 w-auto h-auto p-4 md:p-6 z-50 justify-between'
                  : 'max-w-md w-full p-5 space-y-4 text-center'
              }`}
            >
              {/* Header Controls & Selective View Options */}
              <div className="flex flex-col gap-2.5 border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-amber-400 text-sm">
                    <Camera size={18} />
                    <span>Snap Assignment Question</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-xl transition-all"
                    title="Close Camera"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Toolbar Controls: Camera View Size Selector, Torch Toggle, Auto Snap Toggle */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* View Mode Selector Option */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCameraViewMode('compact')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        cameraViewMode === 'compact'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Minimize2 size={12} /> Small View
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraViewMode('fullscreen')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        cameraViewMode === 'fullscreen'
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Maximize2 size={12} /> Full Screen
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Torch Flashlight Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleTorch}
                      className={`px-2.5 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                        torchOn 
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-300'
                      }`}
                      title="Torch / Flashlight On/Off"
                    >
                      {torchOn ? <Zap size={13} className="fill-slate-950" /> : <ZapOff size={13} />}
                      <span>{torchOn ? 'Torch: ON' : 'Torch: OFF'}</span>
                    </button>

                    {/* Auto Snap Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setAutoSnap(!autoSnap);
                        setAutoCountdown(null);
                      }}
                      className={`px-2.5 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 transition-all ${
                        autoSnap 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black shadow' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-300'
                      }`}
                      title="Auto Snap 3-Second Countdown"
                    >
                      <Timer size={13} className={autoSnap ? 'animate-spin text-amber-400' : ''} />
                      <span>{autoSnap ? 'Auto: ON' : 'Auto: OFF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-bold text-center">
                Position textbook or handwritten assignment question inside viewfinder:
              </p>

              {/* Viewfinder Canvas / Video Frame */}
              <div className={`relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black flex items-center justify-center ${
                cameraViewMode === 'fullscreen' ? 'flex-1 my-2 min-h-[300px]' : 'aspect-video'
              }`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Alignment Box Overlay */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-amber-400/50 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-slate-950/80 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/30">
                    Align Assignment Question Here
                  </span>
                </div>

                {/* Auto Snap Countdown Overlay Badge */}
                {autoSnap && autoCountdown !== null && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-10">
                    <span className="text-amber-400 font-black text-5xl animate-bounce">{autoCountdown}</span>
                    <span className="text-amber-300 text-xs font-bold">Auto Snapping Photo...</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <Camera size={20} /> Snap Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleStopCamera();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-all"
                >
                  <UploadCloud size={16} /> Upload File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border-2 border-theme-border p-5 md:p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-theme-border pb-3">
                <div className="flex items-center gap-2">
                  <Share2 size={20} className="text-amber-400" />
                  <h3 className="font-extrabold text-base text-theme-text">Export & Transfer Chat Log</h3>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-xl hover:bg-theme-bg text-theme-muted hover:text-theme-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-theme-text font-bold">
                  Transfer or save your temporary 24-hour chat history before auto-refresh:
                </p>
                <p className="text-[11px] text-theme-muted">
                  Chats automatically reset after 24 hours to ensure your sessions stay lightweight and confidential. Choose an option below to preserve your answers:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleShareWhatsApp();
                    setShowExportModal(false);
                  }}
                  className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 font-extrabold text-xs transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-emerald-300">WhatsApp</span>
                    <span className="text-[10px] text-emerald-400/80">Send response to WhatsApp</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleDownloadChatText();
                    setShowExportModal(false);
                  }}
                  className="p-3.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-2xl flex items-center gap-3 text-sky-400 font-extrabold text-xs transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                    <Download size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-sky-300">Download Text / PDF</span>
                    <span className="text-[10px] text-sky-400/80">Save transcript as .txt document</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleShareNative();
                    setShowExportModal(false);
                  }}
                  className="p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-400 font-extrabold text-xs transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <ExternalLink size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-amber-300">Google Drive & Apps</span>
                    <span className="text-[10px] text-amber-400/80">Transfer to Drive, Docs, or Mail</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleCopyTranscript();
                    setShowExportModal(false);
                  }}
                  className="p-3.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center gap-3 text-purple-400 font-extrabold text-xs transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Copy size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-purple-300">Copy Transcript</span>
                    <span className="text-[10px] text-purple-400/80">Copy full chat to clipboard</span>
                  </div>
                </button>
              </div>

              <div className="pt-3 border-t border-theme-border flex items-center justify-between text-xs">
                <span className="text-theme-muted font-bold flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" /> Auto-resets in {getRemainingSessionTime()}
                </span>
                <button
                  onClick={handleReset24hSession}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Clear Chat & Reset Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Rich Preview Workspace Modal */}
        {showRichPreviewModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
            >
              {/* Modal Top Toolbar */}
              <div className="p-4 sm:p-5 bg-slate-950 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Eye size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-amber-400">Ibom AI Solution & Rich Preview Workspace</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        {selectedPreviewMessage ? 'Single Answer' : 'Full Session'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Formatted layout optimized for assignments, mathematical steps, comparative tables, and documents.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Font Size Scaler */}
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs gap-1 font-mono">
                    <button
                      onClick={() => setPreviewFontSize(Math.max(12, previewFontSize - 1))}
                      className="px-1.5 hover:text-amber-400 font-bold"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <span className="text-[11px] text-amber-300 font-bold px-1">{previewFontSize}px</span>
                    <button
                      onClick={() => setPreviewFontSize(Math.min(24, previewFontSize + 1))}
                      className="px-1.5 hover:text-amber-400 font-bold"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>

                  {/* Copy Workspace Button */}
                  <button
                    onClick={() => {
                      const textToCopy = selectedPreviewMessage 
                        ? selectedPreviewMessage.text 
                        : messages.map(m => `[${m.sender.toUpperCase()} - ${m.time}]:\n${m.text}`).join('\n\n---\n\n');
                      navigator.clipboard.writeText(textToCopy);
                      setExportNotice("Copied workspace output to clipboard!");
                      setTimeout(() => setExportNotice(""), 3000);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    title="Copy Workspace Text"
                  >
                    <Copy size={14} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>

                  {/* Print / Save PDF Button */}
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    title="Print / Save PDF"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Print / PDF</span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    onClick={() => setShowRichPreviewModal(false)}
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* View Category Tabs */}
              <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
                {[
                  { id: 'all', label: '📑 All Content', icon: Layers },
                  { id: 'assignments', label: '📝 Assignments & Math Steps', icon: FileText },
                  { id: 'tables', label: '📊 Tables & Schedules', icon: BarChart2 },
                  { id: 'code', label: '💻 Code & Algorithms', icon: Zap },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        previewTab === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Workspace Content Display Canvas */}
              <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6 bg-slate-900/90 font-sans" style={{ fontSize: `${previewFontSize}px` }}>
                {(() => {
                  const targetText = selectedPreviewMessage 
                    ? selectedPreviewMessage.text 
                    : messages.filter(m => m.sender === 'ai').map(m => m.text).join('\n\n---\n\n') || "No AI responses generated yet in this session.";

                  if (previewTab === 'tables') {
                    // Extract table markdown lines (| ... |)
                    const tableLines = targetText.split('\n').filter(line => line.trim().startsWith('|'));
                    if (tableLines.length < 2) {
                      return (
                        <div className="p-8 text-center text-slate-400 space-y-3">
                          <BarChart2 size={40} className="mx-auto text-amber-500/50" />
                          <p className="font-extrabold text-amber-300 text-base">No Structured Tables Detected in Response</p>
                          <p className="text-xs max-w-md mx-auto text-slate-400">
                            When Ibom AI generates comparative lists, data matrices, or financial schedules, they will be formatted automatically into styled tables here.
                          </p>
                        </div>
                      );
                    }
                  }

                  if (previewTab === 'code') {
                    // Extract code blocks
                    const codeBlockMatches = targetText.match(/```[\s\S]*?```/g);
                    if (!codeBlockMatches || codeBlockMatches.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 space-y-3">
                          <Zap size={40} className="mx-auto text-amber-500/50" />
                          <p className="font-extrabold text-amber-300 text-base">No Programming Code Blocks Detected</p>
                          <p className="text-xs max-w-md mx-auto text-slate-400">
                            Ask Ibom AI to write code in Python, C++, JavaScript, SQL, or HTML to view clean syntax highlighted previews here.
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {codeBlockMatches.map((block, idx) => {
                          const codeText = block.replace(/```[a-zA-Z]*/, '').replace(/```$/, '').trim();
                          return (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-amber-400">
                                <span>Snippet #{idx + 1}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(codeText);
                                    setExportNotice("Code snippet copied!");
                                    setTimeout(() => setExportNotice(""), 2000);
                                  }}
                                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1"
                                >
                                  <Copy size={12} /> Copy Code
                                </button>
                              </div>
                              <pre className="p-4 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                {codeText}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Document Card Container */}
                      <div className="bg-slate-950/80 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-amber-400" size={20} />
                            <span className="font-black text-amber-300 text-sm tracking-wide">
                              {selectedPreviewMessage ? `Solution generated at ${selectedPreviewMessage.time}` : 'Full Practice Workspace Transcript'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                            Student Edition • JeeRaf CBT
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="leading-relaxed text-slate-200 font-medium">
                          <FormattedMessageText text={targetText} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" /> Real-time active output formatted for exams & homework
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = selectedPreviewMessage ? selectedPreviewMessage.text : messages.map(m => m.text).join('\n\n');
                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Ibom_AI_Workspace_${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download size={14} /> Download File (.txt)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
