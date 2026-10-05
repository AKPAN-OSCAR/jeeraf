import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Send, Bot, CheckCircle2, XCircle, 
  CornerUpRight, RefreshCw, HelpCircle, Lightbulb, 
  BookOpen, Brain, Zap, Maximize2
} from 'lucide-react';
import { Question, Subject, ExamType } from '../types';
import { MathRenderer } from './MathRenderer';
import { JeeRafGoldIcon } from './AIAvatar';
import { cn } from '../data/lib/utils';

interface CBTQuestionAISolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  questionIndex: number;
  userAnswer?: {
    selectedAnswer: number | null;
    isCorrect?: boolean;
  };
  subject: Subject;
  examType?: ExamType;
  user: any;
  profile?: any;
  onOpenFullScreenAI?: (initialQuery?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const CBTQuestionAISolutionModal: React.FC<CBTQuestionAISolutionModalProps> = ({
  isOpen,
  onClose,
  question,
  questionIndex,
  userAnswer,
  subject,
  examType,
  user,
  profile,
  onOpenFullScreenAI
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedInitial, setHasGeneratedInitial] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctLetter = String.fromCharCode(65 + question.correctAnswer);
  const correctText = question.options[question.correctAnswer];
  const userSelectedLetter = userAnswer?.selectedAnswer !== null && userAnswer?.selectedAnswer !== undefined
    ? String.fromCharCode(65 + userAnswer.selectedAnswer)
    : 'None';
  const userSelectedText = userAnswer?.selectedAnswer !== null && userAnswer?.selectedAnswer !== undefined
    ? question.options[userAnswer.selectedAnswer]
    : 'Unanswered';
  const isCorrect = userAnswer?.isCorrect;

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Generate initial thorough solution breakdown when modal opens
  useEffect(() => {
    if (isOpen && !hasGeneratedInitial) {
      generateInitialBreakdown();
    }
  }, [isOpen, question.id]);

  const generateInitialBreakdown = async () => {
    setIsLoading(true);
    setHasGeneratedInitial(true);

    const initialAiPrompt = `You are JeeRaf AI, the elite personal CBT study copilot and academic tutor.
The student has just completed an exam and is reviewing Question ${questionIndex + 1} in ${subject} (${examType || 'CBT Practice'}).
They are asking for a deep, crystal-clear explanation on why this solution is solved this way.

QUESTION DETAILS:
- Subject: ${subject}
- Target Examination: ${examType || 'JAMB / WAEC / Secondary Standard'}
- Question Text: "${question.question}"
- Options:
${question.options.map((opt, i) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}
- Correct Answer: Option ${correctLetter} ("${correctText}")
- Student's Answer: Option ${userSelectedLetter} ("${userSelectedText}") ${isCorrect ? '(Correct)' : '(Incorrect)'}
- Built-in Explanation: "${question.explanation}"

INSTRUCTIONS FOR YOUR EXPLANATION:
1. Speak with professional academic warmth, clarity, and precision (like Claude 3.5 Sonnet / Gemini 2.0 Pro).
2. Structure your response into clear BOLD sections (do NOT use markdown hashtags #, ##, ###):
   - **Core Concept & Scientific/Academic Rule:** State the underlying formula, theorem, law, or grammatical rule.
   - **Step-by-Step Derivation:** Walk through the exact mathematical, scientific, or logical steps leading directly to Option ${correctLetter}.
   ${!isCorrect && userSelectedLetter !== 'None' ? `- **Why Option ${userSelectedLetter} is Incorrect:** Explain the common trap or misconception that makes this option wrong.` : ''}
   - **JeeRaf Memory & Speed Tip:** Give a fast mental shortcut or mnemonic so the candidate never misses this question in an exam.
3. Use LaTeX math symbols when showing formulas ($E = mc^2$, $\\frac{a}{b}$).
4. Keep the explanation engaging, concise, and easy to grasp in under 2 minutes of reading.`;

    try {
      const res = await fetch('/api/ai/exam-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          questionIndex,
          userAnswer,
          subject,
          examType
        })
      });

      let responseText = '';
      if (res.ok) {
        const data = await res.json();
        responseText = data.text;
      }

      if (!responseText) {
        // Fallback structured explanation
        responseText = `**Core Concept & Academic Rule:**
The fundamental rule for this problem in ${subject} revolves around established syllabus principles:
${question.explanation}

**Step-by-Step Derivation:**
1. **Identify Given Information:** Examine the question parameters carefully.
2. **Apply the Standard Principle:** Evaluate each option against the core formula or rule.
3. **Verify the Correct Choice:** Option ${correctLetter} ("${correctText}") satisfies all requirements accurately.

${!isCorrect && userSelectedLetter !== 'None' ? `**Why Option ${userSelectedLetter} is Incorrect:**\nOption ${userSelectedLetter} is a common distractor designed to catch calculation or reading oversights.\n\n` : ''}**JeeRaf Memory & Speed Tip:**
Always eliminate obvious outliers first, and check units or sign changes to answer with certainty!`;
      }

      setMessages([
        {
          id: `ai-init-${Date.now()}`,
          sender: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Failed to generate AI solution breakdown:", err);
      setMessages([
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `**Solution Explanation for Question ${questionIndex + 1}:**\n\n${question.explanation}\n\n**Correct Option:** ${correctLetter}. ${correctText}\n\nYou can ask any follow-up question below, and I will walk you through the concept!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFollowUp = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText || userInput).trim();
    if (!query || isLoading) return;

    setUserInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/exam-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          questionIndex,
          userAnswer,
          subject,
          examType,
          customPrompt: query,
          chatHistory: messages
        })
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.text;
      }

      if (!reply) {
        reply = `Regarding **"${query}"**:\n\nIn this ${subject} problem, the critical key is that Option ${correctLetter} adheres to the fundamental principle stated in the syllabus: ${question.explanation}`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Follow-up error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `I encountered an issue processing that follow-up. Please try asking again or click "Open in Full AI Screen" to test with the full workspace!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInFullScreen = () => {
    onClose();
    if (onOpenFullScreenAI) {
      const initialChatQuery = `Explain Question ${questionIndex + 1} in ${subject}:\n"${question.question}"\nCorrect answer is ${correctLetter}: ${correctText}`;
      onOpenFullScreenAI(initialChatQuery);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-theme-card border-2 border-theme-accent/30 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden"
      >
        {/* ===================================================================== */}
        {/* MODAL HEADER                                                          */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-theme-card via-theme-bg to-theme-card px-5 py-4 border-b border-theme-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <JeeRafGoldIcon className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-theme-text tracking-tight">
                  JeeRaf AI Solution Breakdown
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Interactive Copilot
                </span>
              </div>
              <p className="text-xs text-theme-muted font-medium">
                {subject} • Question {questionIndex + 1} of {examType || 'CBT Review'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in full AI screen button */}
            {onOpenFullScreenAI && (
              <button
                type="button"
                onClick={handleOpenInFullScreen}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg hover:bg-theme-accent hover:text-white text-theme-muted text-xs font-bold rounded-xl border border-theme-border transition-all shadow-sm"
                title="Transfer this question to full-screen JeeRaf AI page (/ai)"
              >
                <Maximize2 size={13} />
                <span>Full AI Screen</span>
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-bg rounded-xl transition-colors"
              title="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL BODY (TWO PANELS ON DESKTOP, STACKED ON MOBILE)                 */}
        {/* ===================================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT PANEL: QUESTION CONTEXT SNAPSHOT */}
          <div className="w-full md:w-5/12 bg-theme-bg/60 border-b md:border-b-0 md:border-r border-theme-border p-4 md:p-6 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-theme-accent">
                  Question {questionIndex + 1}
                </span>
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Correct (+1)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <XCircle size={12} /> Missed
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-theme-text leading-relaxed bg-theme-card p-3.5 rounded-2xl border border-theme-border">
                <MathRenderer text={question.question} />
              </div>
            </div>

            {/* Options review */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-theme-muted">
                Options Review:
              </span>
              <div className="space-y-1.5">
                {question.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isCorrectChoice = i === question.correctAnswer;
                  const isUserChoice = userAnswer?.selectedAnswer === i;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all",
                        isCorrectChoice 
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold" 
                          : isUserChoice 
                            ? "bg-rose-500/15 border-rose-500 text-rose-400 font-bold"
                            : "bg-theme-card border-theme-border text-theme-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                          isCorrectChoice ? "bg-emerald-500 text-slate-950" : isUserChoice ? "bg-rose-500 text-white" : "bg-theme-bg text-theme-muted"
                        )}>
                          {letter}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                      {isCorrectChoice && (
                        <span className="text-[10px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                          Official Key
                        </span>
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <span className="text-[10px] font-black bg-rose-500/20 px-2 py-0.5 rounded-full shrink-0">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="pt-2 border-t border-theme-border space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-theme-muted flex items-center gap-1">
                <Lightbulb size={12} className="text-amber-400" /> Fast Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSendFollowUp(undefined, "Why is my selected option incorrect?")}
                  className="text-[11px] bg-theme-card hover:bg-theme-accent hover:text-white px-2.5 py-1 rounded-lg border border-theme-border transition-all text-slate-300 font-medium"
                >
                  Why is my answer wrong?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFollowUp(undefined, "Can you show the exact formula with values plugged in?")}
                  className="text-[11px] bg-theme-card hover:bg-theme-accent hover:text-white px-2.5 py-1 rounded-lg border border-theme-border transition-all text-slate-300 font-medium"
                >
                  Show formula steps
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFollowUp(undefined, "Give me a quick mnemonic or trick to remember this.")}
                  className="text-[11px] bg-theme-card hover:bg-theme-accent hover:text-white px-2.5 py-1 rounded-lg border border-theme-border transition-all text-slate-300 font-medium"
                >
                  Memory trick
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE INTERACTIVE AI DISCUSSION */}
          <div className="w-full md:w-7/12 flex flex-col bg-theme-card/80 overflow-hidden">
            {/* Messages Feed */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col space-y-1.5",
                    msg.sender === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-theme-muted font-bold px-1">
                    {msg.sender === 'ai' ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-amber-500/30">
                          <JeeRafGoldIcon className="w-full h-full object-cover" />
                        </div>
                        <span className="text-amber-400">JeeRaf AI Copilot</span>
                      </>
                    ) : (
                      <span>You</span>
                    )}
                    <span>• {msg.time}</span>
                  </div>

                  <div 
                    className={cn(
                      "p-4 rounded-2xl max-w-[92%] leading-relaxed text-sm shadow-md",
                      msg.sender === 'user'
                        ? "bg-slate-800 text-white rounded-tr-none border border-slate-700"
                        : "bg-slate-950 text-slate-100 rounded-tl-none border border-amber-500/30"
                    )}
                  >
                    <MathRenderer text={msg.text} />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 p-4 bg-slate-950/80 border border-amber-500/20 rounded-2xl text-xs text-amber-300 animate-pulse max-w-sm">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>JeeRaf AI is reasoning through the solution steps...</span>
                </div>
              )}

              <div ref={chatScrollRef} />
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={handleSendFollowUp}
              className="p-3 bg-theme-bg border-t border-theme-border flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask JeeRaf AI why this was solved this way..."
                disabled={isLoading}
                className="flex-1 bg-theme-card border border-theme-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-muted outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="px-4 py-2.5 bg-theme-accent hover:opacity-95 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-theme-accent/20 shrink-0"
              >
                <span>Ask</span>
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-theme-bg/90 border-t border-theme-border flex flex-wrap items-center justify-between gap-2 text-xs text-theme-muted shrink-0 px-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold">Contextual CBT Solution Engine</span>
          </div>
          {onOpenFullScreenAI && (
            <button
              type="button"
              onClick={handleOpenInFullScreen}
              className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <span>Continue in Full AI Studio</span>
              <CornerUpRight size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
