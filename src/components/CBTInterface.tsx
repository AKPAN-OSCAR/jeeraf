import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Clock, Send, AlertCircle, 
  Flag, X, Calculator as CalcIcon, CheckCircle2, 
  Bookmark, ArrowRight, ArrowLeft, GripHorizontal, Check, RefreshCw,
  LayoutGrid, ArrowUp, ArrowDown, ChevronDown, ChevronUp
} from 'lucide-react';
import { Question, Subject, ExamType } from '../types';
import { cn } from '../data/lib/utils';
import { Calculator } from './Calculator';
import { MathRenderer } from './MathRenderer';

interface CBTInterfaceProps {
  subject: Subject;
  subjects?: Subject[];
  isMergedMode?: boolean;
  isContinuationSection?: boolean;
  continuationPart?: 1 | 2;
  nextPartTitle?: string;
  examType?: ExamType;
  questions: Question[];
  durationMinutes: number;
  user: any;
  profile?: any;
  onLogout: () => void;
  onFinish: (answers: Record<string, number | null>, timeTaken: number, theoryAnswers?: Record<string, string>) => void;
  onContinuationSectionComplete?: (answers: Record<string, number | null>, timeTaken: number, theoryAnswers?: Record<string, string>) => void;
  onNavigateTo?: (target: any) => void;
}

export const CBTInterface: React.FC<CBTInterfaceProps> = ({
  subject,
  subjects = [],
  isMergedMode = false,
  isContinuationSection = false,
  continuationPart = 1,
  nextPartTitle,
  examType,
  questions,
  durationMinutes,
  user,
  profile,
  onLogout,
  onFinish,
  onContinuationSectionComplete,
  onNavigateTo,
}) => {
  // Partition questions strictly by subject
  const subjectGroups = useMemo(() => {
    const map = new Map<Subject, Question[]>();
    
    // Preserve custom order if subjects prop provided
    if (subjects && subjects.length > 0) {
      subjects.forEach(s => map.set(s, []));
    }

    questions.forEach((q) => {
      const s = q.subject || subject;
      if (!map.has(s)) {
        map.set(s, []);
      }
      map.get(s)!.push(q);
    });

    // Prune subjects that ended up empty unless passed in subjects
    for (const [key, val] of Array.from(map.entries())) {
      if (val.length === 0 && (!subjects || !subjects.includes(key))) {
        map.delete(key);
      }
    }

    return map;
  }, [questions, subject, subjects]);

  const subjectList = useMemo(() => Array.from(subjectGroups.keys()), [subjectGroups]);

  // Current Active Subject (defaults to initial subject or first in list)
  const [activeSubject, setActiveSubject] = useState<Subject>(() => {
    if (subject && subjectList.includes(subject)) return subject;
    return subjectList[0] || subject;
  });

  // Track the current question index inside each subject independently
  const [subjectIndices, setSubjectIndices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    subjectList.forEach(s => { init[s] = 0; });
    return init;
  });

  const activeSubjectQuestions = useMemo(() => {
    return subjectGroups.get(activeSubject) || [];
  }, [subjectGroups, activeSubject]);

  const currentSubIndex = subjectIndices[activeSubject] || 0;
  const currentQuestion = activeSubjectQuestions[currentSubIndex] || activeSubjectQuestions[0] || questions[0];

  const isTheoryQuestion = currentQuestion?.section === 'Theory' || currentQuestion?.type === 'theory' || (!currentQuestion?.options || currentQuestion.options.length === 0);

  // Answers & UI State
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Navigation Modal State
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  // Dock position for Navigator Sheet: 'bottom' or 'top' (Requirement 2)
  const [navDockPosition, setNavDockPosition] = useState<'bottom' | 'top'>('bottom');
  // Selected subject in drilldown Navigator (Requirement 1)
  const [navSelectedSubject, setNavSelectedSubject] = useState<Subject | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([currentQuestion?.id].filter(Boolean)));

  // Mark question visited
  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  }, [currentQuestion]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFast();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fast Submit Handler with Zero Lag (Requirement 4)
  const handleSubmitFast = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitConfirm(false);
    const timeTaken = Math.max(0, durationMinutes * 60 - timeLeft);

    if (isContinuationSection && continuationPart === 1 && onContinuationSectionComplete) {
      onContinuationSectionComplete(answers, timeTaken, theoryAnswers);
    } else {
      onFinish(answers, timeTaken, theoryAnswers);
    }
  }, [answers, theoryAnswers, timeLeft, durationMinutes, onFinish, onContinuationSectionComplete, isSubmitting, isContinuationSection, continuationPart]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showCalcButton = examType === 'Personal CBT' || ['Mathematics', 'Physics', 'Chemistry', 'Further Mathematics', 'Accounting'].includes(currentQuestion?.subject || activeSubject);

  const handleSelectAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  // Switch Active Subject
  const handleSwitchSubject = (s: Subject) => {
    setActiveSubject(s);
  };

  // Navigate strictly within current subject (Requirement 3: CANNOT NEXT TO ANOTHER SUBJECT)
  const handleNextInSubject = () => {
    if (currentSubIndex < activeSubjectQuestions.length - 1) {
      setSubjectIndices(prev => ({
        ...prev,
        [activeSubject]: currentSubIndex + 1
      }));
    }
  };

  const handlePrevInSubject = () => {
    if (currentSubIndex > 0) {
      setSubjectIndices(prev => ({
        ...prev,
        [activeSubject]: currentSubIndex - 1
      }));
    }
  };

  // Jump to specific question in a subject from Navigator
  const handleJumpToQuestion = (targetSub: Subject, subIdx: number) => {
    setActiveSubject(targetSub);
    setSubjectIndices(prev => ({
      ...prev,
      [targetSub]: subIdx
    }));
    setShowQuestionNav(false);
  };

  // Subject Stats Calculation
  const getSubjectStats = (s: Subject) => {
    const subQs = subjectGroups.get(s) || [];
    const answered = subQs.filter(
      q => answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0)
    ).length;
    const total = subQs.length;
    const isFinished = answered === total && total > 0;
    const unanswered = Math.max(0, total - answered);
    return { answered, total, isFinished, unanswered };
  };

  const activeStats = getSubjectStats(activeSubject);
  const isAtEndOfActiveSubject = currentSubIndex === activeSubjectQuestions.length - 1;

  // Next Subject in order for user-initiated switch
  const nextSubjectInOrder = useMemo(() => {
    const curIdx = subjectList.indexOf(activeSubject);
    if (curIdx >= 0 && curIdx < subjectList.length - 1) {
      return subjectList[curIdx + 1];
    }
    return null;
  }, [subjectList, activeSubject]);

  // Total answers across entire exam
  const totalAnsweredAcrossExam = useMemo(() => {
    let count = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0)) {
        count++;
      }
    });
    return count;
  }, [questions, answers, theoryAnswers]);

  // Keyboard navigation within the active subject
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        handleNextInSubject();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        handlePrevInSubject();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFlag();
      } else if (['a', 'b', 'c', 'd', 'e'].includes(e.key.toLowerCase()) && !isTheoryQuestion && currentQuestion?.options) {
        const optIdx = e.key.toLowerCase().charCodeAt(0) - 97;
        if (optIdx < currentQuestion.options.length) {
          handleSelectAnswer(optIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSubIndex, activeSubjectQuestions.length, isTheoryQuestion, currentQuestion]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col transition-colors duration-300 select-none pb-24 sm:pb-12">
      
      {/* TOP HEADER - 3-DASH SIDEBAR MENU IS DISABLED (Requirement 5) */}
      <header className="bg-theme-card border-b border-theme-border px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left: Back / Exit Exam Button with Little Screen Confirm (Requirement 5) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg hover:bg-rose-500/10 text-theme-muted hover:text-rose-500 border border-theme-border rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Exit CBT Exam"
          >
            <ChevronLeft size={16} />
            <span>Exit Exam</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-theme-text leading-tight truncate max-w-[120px] sm:max-w-[200px]">
                {activeSubject}
              </span>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {isMergedMode ? 'Merged Exam' : 'One-by-One'}
              </span>
            </div>
            <p className="text-[11px] text-theme-muted">
              Question <strong className="text-theme-text">{currentSubIndex + 1}</strong> of {activeSubjectQuestions.length} in {activeSubject}
            </p>
          </div>
        </div>

        {/* Center: Live Unified Timer Badge */}
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-black text-xs sm:text-base border shadow-sm transition-colors",
          timeLeft < 300 
            ? "bg-rose-500/15 text-rose-500 border-rose-500/40 animate-pulse" 
            : "bg-theme-bg text-amber-500 border-amber-500/30"
        )}>
          <Clock size={16} className="text-amber-500 shrink-0" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right: Calculator, Navigator Sheet, Submit */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {showCalcButton && (
            <button
              type="button"
              onClick={() => setShowCalculator(true)}
              className="p-2 sm:px-3 sm:py-2 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Open Draggable Calculator"
            >
              <CalcIcon size={16} className="text-amber-500" />
              <span className="hidden md:inline">Calc</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setNavSelectedSubject(activeSubject);
              setShowQuestionNav(true);
            }}
            className="p-2 sm:px-3 sm:py-2 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Open Question Map Navigator"
          >
            <LayoutGrid size={16} className="text-amber-500" />
            <span className="hidden sm:inline">Map</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-theme-card border border-theme-border text-theme-text">
              {totalAnsweredAcrossExam}/{questions.length}
            </span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => setShowSubmitConfirm(true)}
            className="px-3.5 sm:px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* MERGED 4 SUBJECT BUTTONS WITH QUESTION NUMBERS & FINISHED/UNFINISHED STATUS (Requirement 1 & 3) */}
      {isMergedMode && subjectList.length > 1 && (
        <div className="sticky top-14 z-20 bg-theme-card/95 backdrop-blur-md border-b border-theme-border px-3 sm:px-6 py-2 shadow-sm">
          <div className="container mx-auto max-w-6xl flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-2">
              {subjectList.map((s) => {
                const stat = getSubjectStats(s);
                const isActive = activeSubject === s;

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSwitchSubject(s)}
                    className={cn(
                      "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm shrink-0 active:scale-98",
                      isActive
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md ring-2 ring-amber-500/30 scale-102"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-card"
                    )}
                  >
                    <span>{s}</span>
                    <span className="text-[10px] opacity-80">({stat.total} Qs)</span>
                    
                    {/* Finished or Unfinished Badge (Requirement 3) */}
                    <span className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1",
                      isActive
                        ? "bg-slate-950/20 text-slate-950"
                        : stat.isFinished
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : stat.answered > 0
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-theme-card text-theme-muted border border-theme-border"
                    )}>
                      {stat.isFinished ? (
                        <>
                          <Check size={10} />
                          <span>Finished</span>
                        </>
                      ) : (
                        <span>{stat.answered}/{stat.total}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-theme-muted shrink-0">
              <span>Switch subject to change questions</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN EXAM QUESTION DISPLAY (Requirement 3: ISOLATED PER SUBJECT, NO ACCIDENTAL NEXTING) */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-6xl grid lg:grid-cols-4 gap-6 items-start">
        
        {/* Left 3 Columns: Active Subject Question Card */}
        <div className="lg:col-span-3 space-y-4">
          
          <motion.div
            key={`${activeSubject}-${currentSubIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-theme-card rounded-3xl p-5 sm:p-8 shadow-sm border border-theme-border min-h-[400px] flex flex-col justify-between"
          >
            {/* Top Bar of Question Card */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between gap-2 border-b border-theme-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-theme-bg text-amber-500 text-xs font-black rounded-full uppercase tracking-wider border border-theme-border">
                    {activeSubject} • Q {currentSubIndex + 1}
                  </span>
                  <span className="text-xs text-theme-muted">
                    ({currentSubIndex + 1} of {activeSubjectQuestions.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFlag}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                      flaggedQuestions.has(currentQuestion?.id)
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                    )}
                  >
                    <Flag size={13} fill={flaggedQuestions.has(currentQuestion?.id) ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">
                      {flaggedQuestions.has(currentQuestion?.id) ? "Flagged" : "Flag"}
                    </span>
                  </button>

                  {currentQuestion?.section && (
                    <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider bg-theme-bg px-2.5 py-1 rounded-full border border-theme-border hidden sm:inline">
                      {currentQuestion.section}
                    </span>
                  )}
                </div>
              </div>

              {/* Comprehension Passage */}
              {currentQuestion?.passage && (
                <div className="p-4 sm:p-5 bg-theme-bg border-l-4 border-amber-500 rounded-r-2xl max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                  <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Bookmark size={13} />
                    <span>Read Comprehension Passage:</span>
                  </h4>
                  <div className="text-xs sm:text-sm text-theme-text/90 leading-relaxed italic">
                    <MathRenderer text={currentQuestion.passage} />
                  </div>
                </div>
              )}

              {/* Diagram Reference Image */}
              {currentQuestion?.images && currentQuestion.images.length > 0 && (
                <div className="flex flex-wrap gap-3 my-3">
                  {currentQuestion.images.map((img, i) => img && (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Reference diagram ${i + 1}`} 
                      className="max-h-60 sm:max-h-72 rounded-2xl border border-theme-border shadow-sm object-contain bg-white/5"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              {/* Question Stem */}
              <div className="text-base sm:text-lg md:text-xl font-medium text-theme-text leading-relaxed">
                <MathRenderer text={currentQuestion?.question || ''} />
              </div>
            </div>

            {/* Answer Area: Theory Workspace OR Multiple Choice Options */}
            {isTheoryQuestion ? (
              <div className="space-y-4 pt-4 border-t border-theme-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    Theory Solution Area
                  </span>
                  <span className="text-[11px] text-theme-muted font-mono">
                    {(theoryAnswers[currentQuestion?.id] || '').length} chars
                  </span>
                </div>

                {/* Math Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                  <span className="text-[9px] font-bold uppercase text-theme-muted mr-1">Math Tool:</span>
                  {[
                    { label: 'x²', val: '^{2}' },
                    { label: '√x', val: '\\sqrt{}' },
                    { label: 'a/b', val: '\\frac{a}{b}' },
                    { label: 'π', val: '\\pi' },
                    { label: 'θ', val: '\\theta' },
                    { label: '±', val: '\\pm' },
                    { label: '°', val: '^{\\circ}' },
                    { label: '∫', val: '\\int' },
                    { label: 'Σ', val: '\\sum' }
                  ].map(sym => (
                    <button
                      key={sym.label}
                      type="button"
                      onClick={() => {
                        const prev = theoryAnswers[currentQuestion.id] || '';
                        setTheoryAnswers({ ...theoryAnswers, [currentQuestion.id]: prev + ' $' + sym.val + '$ ' });
                      }}
                      className="px-2 py-1 bg-theme-card hover:bg-amber-500/20 hover:text-amber-500 border border-theme-border rounded-lg text-xs font-mono font-bold transition-all"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={7}
                  value={theoryAnswers[currentQuestion?.id] || ''}
                  onChange={(e) => setTheoryAnswers({ ...theoryAnswers, [currentQuestion.id]: e.target.value })}
                  placeholder="Type your complete step-by-step mathematical proof or essay solution here..."
                  className="w-full p-4 bg-theme-bg border-2 border-theme-border rounded-2xl text-sm font-sans focus:outline-none focus:border-amber-500 text-theme-text leading-relaxed"
                />

                {theoryAnswers[currentQuestion?.id]?.includes('$') && (
                  <div className="p-3 bg-theme-bg/40 border border-theme-border/60 rounded-xl">
                    <span className="text-[9px] font-bold text-theme-muted uppercase block mb-1">Formula Preview:</span>
                    <MathRenderer text={theoryAnswers[currentQuestion.id]} />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2.5 sm:gap-3.5 pt-2">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAnswer(idx)}
                      className={cn(
                        "flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all group relative active:scale-99",
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-sm"
                          : "border-theme-border hover:border-amber-500/40 bg-theme-card hover:bg-theme-bg"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 transition-all",
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-black"
                          : "border-theme-border text-theme-muted group-hover:border-amber-500/60"
                      )}>
                        {letter}
                      </div>

                      <div className={cn(
                        "text-sm sm:text-base leading-relaxed transition-colors flex-1",
                        isSelected ? "text-theme-text font-bold" : "text-theme-text/90"
                      )}>
                        <MathRenderer text={option} />
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* SUBJECT COMPLETION OR UNFINISHED STATUS BANNER (Requirement 3) */}
            {isAtEndOfActiveSubject && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-6 p-4 sm:p-5 rounded-2xl border-2 space-y-3",
                  activeStats.isFinished
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-amber-500/10 border-amber-500/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {activeStats.isFinished ? (
                      <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={24} className="text-amber-500 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-black text-sm text-theme-text flex items-center gap-2">
                        <span>End of {activeSubject} Questions</span>
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                          activeStats.isFinished
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        )}>
                          {activeStats.isFinished ? 'Subject Finished ✓' : `Subject Unfinished (${activeStats.unanswered} left)`}
                        </span>
                      </h4>
                      <p className="text-xs text-theme-muted mt-0.5">
                        Answered <strong>{activeStats.answered}</strong> of{' '}
                        <strong>{activeStats.total}</strong> questions in {activeSubject}.
                        {activeStats.unanswered > 0 ? (
                          <span className="text-rose-400 font-bold ml-1">
                            ({activeStats.unanswered} questions unanswered)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold ml-1">
                            (All questions answered!)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons at end of subject */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Button to review unanswered in this subject */}
                  {activeStats.unanswered > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const unIdx = activeSubjectQuestions.findIndex(
                          q => answers[q.id] === undefined && (!theoryAnswers[q.id] || theoryAnswers[q.id].trim().length === 0)
                        );
                        if (unIdx >= 0) {
                          setSubjectIndices(prev => ({ ...prev, [activeSubject]: unIdx }));
                        }
                      }}
                      className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <RefreshCw size={13} />
                      <span>Review Unanswered in {activeSubject} ({activeStats.unanswered} left)</span>
                    </button>
                  )}

                  {/* Switch to next subject button */}
                  {nextSubjectInOrder && (
                    <button
                      type="button"
                      onClick={() => handleSwitchSubject(nextSubjectInOrder)}
                      className="px-4 py-2.5 bg-theme-bg hover:bg-theme-card text-theme-text border border-theme-border font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Switch to {nextSubjectInOrder}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop Navigation Buttons Row */}
          <div className="hidden sm:flex items-center justify-between pt-2">
            <button
              disabled={currentSubIndex === 0}
              onClick={handlePrevInSubject}
              className="flex items-center gap-2 px-6 py-3 bg-theme-card border border-theme-border rounded-2xl font-bold text-sm text-theme-text hover:bg-theme-bg disabled:opacity-30 transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft size={18} />
              <span>Previous Question</span>
            </button>

            <span className="text-xs text-theme-muted font-bold">
              {activeSubject} • Q {currentSubIndex + 1} of {activeSubjectQuestions.length}
            </span>

            {/* Next Button is Strictly Disabled at end of active subject (Requirement 3) */}
            <button
              disabled={isAtEndOfActiveSubject}
              onClick={handleNextInSubject}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md",
                isAtEndOfActiveSubject
                  ? "bg-theme-card border border-theme-border text-theme-muted opacity-40 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20"
              )}
            >
              <span>{isAtEndOfActiveSubject ? 'End of Subject' : 'Next Question'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right 1 Column (Desktop Question Navigator Map) */}
        <aside className="hidden lg:block space-y-4">
          <div className="bg-theme-card rounded-3xl p-5 border border-theme-border shadow-sm sticky top-32 max-h-[calc(100vh-140px)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border/60">
                <div>
                  <h3 className="font-black text-sm text-theme-text">
                    {activeSubject} Map
                  </h3>
                  <span className="text-[10px] text-theme-muted">
                    {activeSubjectQuestions.length} Questions Attached
                  </span>
                </div>
                <span className={cn(
                  "text-xs font-black px-2 py-0.5 rounded-full border",
                  activeStats.isFinished
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-theme-bg text-theme-muted border-theme-border"
                )}>
                  {activeStats.answered} / {activeStats.total}
                </span>
              </div>

              {/* Grid of Numbers in Active Subject */}
              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {activeSubjectQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0);
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = idx === currentSubIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSubjectIndices(prev => ({ ...prev, [activeSubject]: idx }))}
                      className={cn(
                        "w-full aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all relative border active:scale-95",
                        isCurrent
                          ? "bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-500/40 font-black shadow-sm"
                          : isFlagged
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                            : isAnswered
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-theme-bg text-theme-muted border-theme-border hover:bg-theme-card"
                      )}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-theme-border/60 grid grid-cols-2 gap-2 text-[10px] text-theme-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-theme-bg border border-theme-border" />
                  <span>Untouched</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-theme-card/95 backdrop-blur-md border-t border-theme-border px-3 py-2.5 flex items-center justify-between shadow-lg">
        <button
          disabled={currentSubIndex === 0}
          onClick={handlePrevInSubject}
          className="flex items-center gap-1 px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text disabled:opacity-30"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          onClick={toggleFlag}
          className={cn(
            "p-2 rounded-xl border text-xs font-bold flex items-center gap-1",
            flaggedQuestions.has(currentQuestion?.id)
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-theme-bg text-theme-muted border-theme-border"
          )}
        >
          <Flag size={14} fill={flaggedQuestions.has(currentQuestion?.id) ? "currentColor" : "none"} />
          <span>{flaggedQuestions.has(currentQuestion?.id) ? 'Flagged' : 'Flag'}</span>
        </button>

        <span className="text-[11px] font-bold text-theme-muted">
          Q {currentSubIndex + 1}/{activeSubjectQuestions.length}
        </span>

        {/* Disabled on last question of subject to prevent unintended subject jump */}
        <button
          disabled={isAtEndOfActiveSubject}
          onClick={handleNextInSubject}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all",
            isAtEndOfActiveSubject
              ? "bg-theme-bg border border-theme-border text-theme-muted opacity-40 cursor-not-allowed"
              : "bg-amber-500 text-slate-950 font-black"
          )}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* DRAGGABLE FULL-WIDTH QUESTION NAVIGATOR SHEET (Requirements 1 & 2) */}
      <AnimatePresence>
        {showQuestionNav && (
          <div className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center p-0 sm:p-4 transition-all",
            navDockPosition === 'top' ? "items-start" : "items-end sm:items-center"
          )}>
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 200 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                // If user drags up while at bottom, snap to top dock!
                if (info.offset.y < -80 && navDockPosition === 'bottom') {
                  setNavDockPosition('top');
                }
                // If user drags down while at top, snap to bottom dock!
                else if (info.offset.y > 80 && navDockPosition === 'top') {
                  setNavDockPosition('bottom');
                }
                // If user drags down hard while at bottom, close navigator!
                else if (info.offset.y > 120 && navDockPosition === 'bottom') {
                  setShowQuestionNav(false);
                }
              }}
              initial={{ opacity: 0, y: navDockPosition === 'top' ? -100 : 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: navDockPosition === 'top' ? -100 : 100 }}
              className="bg-theme-card border-t sm:border border-theme-border rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-4xl max-h-[88vh] overflow-y-auto p-4 sm:p-7 space-y-4 shadow-2xl relative select-none"
            >
              {/* Thumb Drag Handle Bar with Push Top / Bottom Toggle (Requirement 2) */}
              <div className="flex items-center justify-between pb-1 border-b border-theme-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-1.5 rounded-full bg-theme-muted/40 cursor-grab active:cursor-grabbing touch-none" />
                  <span className="text-[10px] uppercase tracking-wider text-theme-muted font-bold hidden sm:inline">
                    (Push up to dock Top / Push down to dock Bottom)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Push to Top / Bottom toggle button */}
                  <button
                    type="button"
                    onClick={() => setNavDockPosition(prev => prev === 'top' ? 'bottom' : 'top')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-theme-bg hover:bg-theme-card border border-theme-border text-[11px] font-bold text-amber-500 transition-all"
                    title={navDockPosition === 'top' ? 'Push to Bottom' : 'Push to Top'}
                  >
                    {navDockPosition === 'top' ? (
                      <>
                        <ChevronDown size={14} />
                        <span>Dock Bottom</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp size={14} />
                        <span>Dock Top</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuestionNav(false)}
                    className="p-1.5 rounded-xl bg-theme-bg text-theme-muted hover:text-theme-text border border-theme-border"
                    title="Close Navigator"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* NAVIGATOR CONTENT: 4 SUBJECTS ORGANIZED WITH QUESTION NUMBERS (Requirement 1) */}
              <div className="space-y-4">
                
                {/* Header bar of navigator */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Back Arrow back to subjects list if drilldown on mobile */}
                    {navSelectedSubject && (
                      <button
                        type="button"
                        onClick={() => setNavSelectedSubject(null)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-bg hover:bg-theme-card text-theme-text border border-theme-border text-xs font-bold transition-all sm:hidden"
                      >
                        <ArrowLeft size={14} />
                        <span>All Subjects</span>
                      </button>
                    )}
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-theme-text">
                        CBT Question Navigator
                      </h3>
                      <p className="text-xs text-theme-muted">
                        Total Answered: <strong className="text-amber-500 font-bold">{totalAnsweredAcrossExam}</strong> of {questions.length} across {subjectList.length} subjects
                      </p>
                    </div>
                  </div>

                  {/* Horizontal pill switcher for 4 subjects */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    {subjectList.map(s => {
                      const stat = getSubjectStats(s);
                      const isChosen = (navSelectedSubject || activeSubject) === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNavSelectedSubject(s)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5",
                            isChosen
                              ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm"
                              : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                          )}
                        >
                          <span>{s}</span>
                          <span className="text-[10px] opacity-75">({stat.total})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TWO-COLUMN LAYOUT ON DESKTOP / SEAMLESS POPUP ON MOBILE (Requirement 1) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                  
                  {/* Left Column (md: 4 cols): 4 Subjects List with Question Numbers Attached */}
                  <div className={cn(
                    "md:col-span-4 space-y-2.5",
                    navSelectedSubject ? "hidden md:block" : "block"
                  )}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-theme-muted block">
                      Subjects ({subjectList.length}):
                    </span>
                    {subjectList.map((s) => {
                      const stat = getSubjectStats(s);
                      const isChosen = (navSelectedSubject || activeSubject) === s;
                      const isCurrentExam = activeSubject === s;

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNavSelectedSubject(s)}
                          className={cn(
                            "w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 group active:scale-98",
                            isChosen
                              ? "bg-amber-500/10 border-amber-500 shadow-sm"
                              : "bg-theme-bg border-theme-border hover:border-theme-muted"
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <h4 className="font-bold text-sm text-theme-text">{s}</h4>
                              {isCurrentExam && (
                                <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-theme-muted block">
                              {stat.total} Questions Attached
                            </span>
                            <span className={cn(
                              "text-[10px] font-bold mt-1 inline-block",
                              stat.isFinished ? "text-emerald-400" : "text-amber-400"
                            )}>
                              {stat.answered}/{stat.total} Answered {stat.unanswered > 0 ? `(${stat.unanswered} left)` : '✓'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {stat.isFinished ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <ArrowRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column (md: 8 cols): Question Numbers Pop Up by the Side (Requirement 1) */}
                  <div className={cn(
                    "md:col-span-8 bg-theme-bg rounded-2xl p-4 border border-theme-border space-y-3",
                    !navSelectedSubject ? "hidden md:block" : "block"
                  )}>
                    {(() => {
                      const displaySub = navSelectedSubject || activeSubject;
                      const subQs = subjectGroups.get(displaySub) || [];
                      const stat = getSubjectStats(displaySub);

                      return (
                        <>
                          <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
                            <div>
                              <h4 className="font-black text-sm text-theme-text flex items-center gap-2">
                                <span>{displaySub} Question Numbers</span>
                                <span className="text-xs font-bold text-amber-500">
                                  ({subQs.length} Questions)
                                </span>
                              </h4>
                              <p className="text-[11px] text-theme-muted">
                                Tap any question number to jump immediately to that question.
                              </p>
                            </div>

                            <span className={cn(
                              "text-xs font-black px-2 py-0.5 rounded-full border",
                              stat.isFinished
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-theme-card text-theme-muted border-theme-border"
                            )}>
                              {stat.answered}/{stat.total} Answered
                            </span>
                          </div>

                          {/* Number Grid for the chosen subject */}
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                            {subQs.map((q, idx) => {
                              const isAnswered = answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0);
                              const isFlagged = flaggedQuestions.has(q.id);
                              const isCurrent = activeSubject === displaySub && currentSubIndex === idx;

                              return (
                                <button
                                  key={q.id}
                                  type="button"
                                  onClick={() => handleJumpToQuestion(displaySub, idx)}
                                  className={cn(
                                    "w-full aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all relative border active:scale-95",
                                    isCurrent
                                      ? "bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-500/40 shadow-sm font-black"
                                      : isFlagged
                                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                                        : isAnswered
                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                          : "bg-theme-card text-theme-muted border-theme-border hover:bg-theme-bg"
                                  )}
                                >
                                  {idx + 1}
                                  {isFlagged && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Legend on Navigator */}
                          <div className="pt-2 border-t border-theme-border/60 flex flex-wrap items-center gap-4 text-[10px] text-theme-muted">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                              <span>Current</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500" />
                              <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500" />
                              <span>Flagged</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-sm bg-theme-card border border-theme-border" />
                              <span>Untouched</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAGGABLE CORNER-SNAPPING CALCULATOR (Requirement 2) */}
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}

      {/* CONFIRM EXIT EXAM MODAL (Requirement 5) */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertCircle size={28} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-theme-text">Exit CBT Examination?</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Are you sure you want to exit the exam? Your current progress and exam answers will be discarded.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Resume Exam
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onNavigateTo?.('cbt_config');
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  Confirm Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAST SUBMIT CONFIRMATION MODAL (Requirement 4) */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                <Send size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-theme-text">Submit CBT Examination</h3>
                <p className="text-xs text-theme-muted">
                  Total Answered: <strong className="text-emerald-500 font-bold">{totalAnsweredAcrossExam}</strong> of{' '}
                  <strong className="text-theme-text">{questions.length}</strong> questions.
                </p>

                {/* Per-Subject Breakdown for Merged Mode */}
                {isMergedMode && subjectList.length > 1 && (
                  <div className="grid grid-cols-2 gap-2 text-left pt-2">
                    {subjectList.map(s => {
                      const stat = getSubjectStats(s);
                      return (
                        <div key={s} className="p-2.5 rounded-xl bg-theme-bg border border-theme-border text-xs">
                          <span className="font-bold text-theme-text block truncate">{s}</span>
                          <span className={cn(
                            "text-[11px] font-bold block",
                            stat.isFinished ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {stat.answered}/{stat.total} answered {stat.isFinished ? '✓' : `(${stat.unanswered} left)`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {questions.length - totalAnsweredAcrossExam > 0 && (
                  <p className="text-xs text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    ⚠️ You have {questions.length - totalAnsweredAcrossExam} unanswered questions remaining.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Return to Test
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitFast()}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Yes, Submit Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
