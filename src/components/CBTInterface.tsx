import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Clock, Send, AlertCircle, 
  Menu, Flag, X, Calculator as CalcIcon, CheckCircle2, Bookmark
} from 'lucide-react';
import { Question, Subject, ExamType } from '../types';
import { cn } from '../data/lib/utils';
import { Calculator } from './Calculator';
import { SidebarMenu } from './SidebarMenu';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([questions[0]?.id]));
  const [activeNavigatorSubject, setActiveNavigatorSubject] = useState<Subject | 'all'>('all');

  // Group questions by subject for Merged Mode
  const subjectGroups = useMemo(() => {
    const map = new Map<Subject, { questions: Question[]; startIndex: number }>();
    questions.forEach((q, i) => {
      if (!map.has(q.subject)) {
        map.set(q.subject, { questions: [], startIndex: i });
      }
      map.get(q.subject)!.questions.push(q);
    });
    return map;
  }, [questions]);
  const subjectList = useMemo(() => Array.from(subjectGroups.keys()), [subjectGroups]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const isTheoryQuestion = currentQuestion?.section === 'Theory' || currentQuestion?.type === 'theory' || (!currentQuestion?.options || currentQuestion.options.length === 0);

  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  }, [currentIndex, currentQuestion]);

  // Exam Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeTaken = durationMinutes * 60 - timeLeft;
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

  const showCalcButton = examType === 'Personal CBT' || ['Mathematics', 'Physics', 'Chemistry', 'Further Mathematics', 'Accounting'].includes(currentQuestion?.subject || subject);

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const toggleFlag = () => {
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

  // Total answered calculation
  const totalAnsweredCount = useMemo(() => {
    let count = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0)) {
        count++;
      }
    });
    return count;
  }, [questions, answers, theoryAnswers]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in a textarea or input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
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
  }, [currentIndex, questions.length, isTheoryQuestion, currentQuestion]);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col transition-colors duration-300 select-none pb-20 lg:pb-8">
      
      {/* Top Header - Responsive for Mobile & Desktop */}
      <header className="bg-theme-card border-b border-theme-border px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left Side: Exit + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarMenu user={user} profile={profile} onLogout={onLogout} onNavigate={onNavigateTo} />
          
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to end this exam and return to the dashboard? Your ongoing progress will be lost.")) {
                onNavigateTo?.('dashboard');
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-theme-bg hover:bg-rose-500/10 text-theme-muted hover:text-rose-500 border border-theme-border rounded-xl text-xs font-bold transition-all"
            title="Exit Exam"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-theme-text leading-tight truncate max-w-[120px] sm:max-w-[200px]">
                {currentQuestion?.subject || subject}
              </span>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {isMergedMode ? 'Merged' : 'One-by-One'}
              </span>
            </div>
            <p className="text-[11px] text-theme-muted">
              Q <strong className="text-theme-text">{currentIndex + 1}</strong> of {questions.length}
            </p>
          </div>
        </div>

        {/* Center: Live Timer Badge */}
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono font-black text-sm sm:text-base border shadow-sm transition-colors",
          timeLeft < 300 
            ? "bg-rose-500/15 text-rose-500 border-rose-500/40 animate-pulse" 
            : "bg-theme-bg text-amber-500 border-amber-500/30"
        )}>
          <Clock size={16} className="text-amber-500" />
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Right Side: Calculator, Question Map, Submit */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {showCalcButton && (
            <button
              onClick={() => setShowCalculator(true)}
              className="p-2 sm:px-3 sm:py-2 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Open Calculator"
            >
              <CalcIcon size={16} className="text-amber-500" />
              <span className="hidden md:inline">Calc</span>
            </button>
          )}

          <button
            onClick={() => setShowQuestionNav(true)}
            className="p-2 sm:px-3 sm:py-2 bg-theme-bg hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="View Question Navigator"
          >
            <Menu size={16} className="text-theme-accent" />
            <span className="hidden sm:inline">Map</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-theme-card border border-theme-border text-theme-text">
              {totalAnsweredCount}/{questions.length}
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

      {/* Main Examination Layout */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-6xl grid lg:grid-cols-4 gap-6 items-start">
        
        {/* Left 3 Columns: Active Subject Tabs, Question Card, Options */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Merged Mode Subject Switcher Tabs */}
          {isMergedMode && subjectList.length > 1 && (
            <div className="sticky top-16 z-20 bg-theme-bg/95 backdrop-blur-md pt-1 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {subjectList.map((s) => {
                  const info = subjectGroups.get(s)!;
                  const isCurrentSubject = currentQuestion?.subject === s;
                  const answeredInSub = info.questions.filter(
                    q => answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0)
                  ).length;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCurrentIndex(info.startIndex)}
                      className={cn(
                        "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm shrink-0",
                        isCurrentSubject
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md scale-102"
                          : "bg-theme-card border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg"
                      )}
                    >
                      <span>{s}</span>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                        isCurrentSubject ? "bg-slate-950/20 text-slate-950" : "bg-theme-bg text-theme-muted"
                      )}>
                        {answeredInSub}/{info.questions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Question Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-theme-card rounded-3xl p-5 sm:p-8 shadow-sm border border-theme-border min-h-[380px] flex flex-col justify-between"
          >
            {/* Question Card Top Bar */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between gap-2 border-b border-theme-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-theme-bg text-theme-accent text-xs font-black rounded-full uppercase tracking-wider border border-theme-border">
                    Question {currentIndex + 1}
                  </span>
                  {currentQuestion?.subject && (
                    <span className="text-xs font-bold text-theme-muted truncate">
                      • {currentQuestion.subject}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFlag}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                      flaggedQuestions.has(currentQuestion.id)
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                    )}
                  >
                    <Flag size={13} fill={flaggedQuestions.has(currentQuestion.id) ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">
                      {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}
                    </span>
                  </button>

                  {currentQuestion?.section && (
                    <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider bg-theme-bg px-2.5 py-1 rounded-full border border-theme-border hidden sm:inline">
                      {currentQuestion.section}
                    </span>
                  )}
                </div>
              </div>

              {/* Comprehension Passage Display */}
              {currentQuestion.passage && (
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

              {/* Diagram / Supporting Image Display */}
              {currentQuestion.images && currentQuestion.images.length > 0 && (
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

              {/* Main Question Stem */}
              <div className="text-base sm:text-lg md:text-xl font-medium text-theme-text leading-relaxed">
                <MathRenderer text={currentQuestion.question} />
              </div>
            </div>

            {/* Answer Area: Theory Workspace OR Multiple Choice Options */}
            {isTheoryQuestion ? (
              <div className="space-y-4 pt-4 border-t border-theme-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      Theory / Essay Answer Area
                    </span>
                    {currentQuestion.marks && (
                      <span className="text-xs font-bold text-amber-400">
                        [{currentQuestion.marks} Marks]
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-theme-muted font-mono">
                    {(theoryAnswers[currentQuestion.id] || '').length} chars
                  </span>
                </div>

                {/* Math Symbol Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                  <span className="text-[9px] font-bold uppercase text-theme-muted mr-1">Insert Math:</span>
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
                      className="px-2 py-1 bg-theme-card hover:bg-theme-accent/20 hover:text-theme-accent border border-theme-border rounded-lg text-xs font-mono font-bold transition-all"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={7}
                  value={theoryAnswers[currentQuestion.id] || ''}
                  onChange={(e) => setTheoryAnswers({ ...theoryAnswers, [currentQuestion.id]: e.target.value })}
                  placeholder="Type your complete step-by-step mathematical proof, reasoning, or essay solution here..."
                  className="w-full p-4 bg-theme-bg border-2 border-theme-border rounded-2xl text-sm font-sans focus:outline-none focus:border-theme-accent text-theme-text leading-relaxed"
                />

                {theoryAnswers[currentQuestion.id]?.includes('$') && (
                  <div className="p-3 bg-theme-bg/40 border border-theme-border/60 rounded-xl">
                    <span className="text-[9px] font-bold text-theme-muted uppercase block mb-1">Live Formula Preview:</span>
                    <MathRenderer text={theoryAnswers[currentQuestion.id]} />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2.5 sm:gap-3.5 pt-2">
                {currentQuestion.options.map((option, idx) => {
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
                          ? "border-theme-accent bg-theme-accent/10 ring-2 ring-theme-accent/20 shadow-sm"
                          : "border-theme-border hover:border-theme-accent/40 bg-theme-card hover:bg-theme-bg"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 transition-all",
                        isSelected
                          ? "bg-theme-accent border-theme-accent text-white"
                          : "border-theme-border text-theme-muted group-hover:border-theme-accent/60"
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
                        <CheckCircle2 size={18} className="text-theme-accent shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Desktop Navigation Row (Previous & Next) */}
          <div className="hidden sm:flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 bg-theme-card border border-theme-border rounded-2xl font-bold text-sm text-theme-text hover:bg-theme-bg disabled:opacity-30 transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft size={18} />
              <span>Previous Question</span>
            </button>

            <span className="text-xs text-theme-muted font-bold">
              Question {currentIndex + 1} of {questions.length}
            </span>

            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-theme-accent hover:opacity-90 text-white rounded-2xl font-bold text-sm disabled:opacity-30 transition-all active:scale-95 shadow-md shadow-theme-accent/20"
            >
              <span>Next Question</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right 1 Column (Desktop Question Map Navigator) */}
        <aside className="hidden lg:block space-y-4">
          <div className="bg-theme-card rounded-3xl p-5 border border-theme-border shadow-sm sticky top-20 max-h-[calc(100vh-120px)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border/60">
                <h3 className="font-black text-sm text-theme-text flex items-center gap-2">
                  <span>Question Map</span>
                </h3>
                <span className="text-xs font-bold text-theme-muted">
                  {totalAnsweredCount} / {questions.length}
                </span>
              </div>

              {/* Merged Subject Filter in Map */}
              {isMergedMode && subjectList.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveNavigatorSubject('all')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                      activeNavigatorSubject === 'all'
                        ? "bg-theme-accent text-white border-theme-accent"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                    )}
                  >
                    All
                  </button>
                  {subjectList.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveNavigatorSubject(s)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all truncate max-w-[80px]",
                        activeNavigatorSubject === s
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                      )}
                    >
                      {s.slice(0, 4)}
                    </button>
                  ))}
                </div>
              )}

              {/* Scrollable Questions Grid */}
              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {questions.map((q, idx) => {
                  if (activeNavigatorSubject !== 'all' && q.subject !== activeNavigatorSubject) {
                    return null;
                  }

                  const isAnswered = answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0);
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isVisited = visitedQuestions.has(q.id);
                  const isSkipped = isVisited && !isAnswered;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "w-full aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all relative border",
                        idx === currentIndex
                          ? "bg-theme-accent text-white border-theme-accent ring-2 ring-theme-accent/40 shadow-sm"
                          : isFlagged
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                            : isAnswered
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : isSkipped
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
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

              {/* Map Legend */}
              <div className="pt-3 border-t border-theme-border/60 grid grid-cols-2 gap-2 text-[10px] text-theme-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-theme-accent" />
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
                  <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500" />
                  <span>Skipped</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-theme-card/95 backdrop-blur-md border-t border-theme-border px-3 py-2.5 flex items-center justify-between shadow-lg">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text disabled:opacity-30"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          onClick={toggleFlag}
          className={cn(
            "p-2 rounded-xl border text-xs font-bold flex items-center gap-1",
            flaggedQuestions.has(currentQuestion.id)
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-theme-bg text-theme-muted border-theme-border"
          )}
        >
          <Flag size={14} fill={flaggedQuestions.has(currentQuestion.id) ? "currentColor" : "none"} />
          <span>{flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}</span>
        </button>

        <span className="text-[11px] font-bold text-theme-muted">
          {currentIndex + 1}/{questions.length}
        </span>

        <button
          disabled={currentIndex === questions.length - 1}
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="flex items-center gap-1 px-4 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-30"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Mobile / Drawer Question Navigator Modal */}
      <AnimatePresence>
        {showQuestionNav && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-theme-card border border-theme-border rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <div>
                  <h3 className="text-base font-black text-theme-text">Question Navigator Map</h3>
                  <p className="text-xs text-theme-muted">
                    {totalAnsweredCount} of {questions.length} questions answered
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuestionNav(false)}
                  className="p-2 rounded-xl bg-theme-bg text-theme-muted hover:text-theme-text border border-theme-border"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Merged Subject Tabs inside Modal */}
              {isMergedMode && subjectList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {subjectList.map(s => {
                    const info = subjectGroups.get(s)!;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(info.startIndex);
                          setShowQuestionNav(false);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-theme-bg border border-theme-border text-theme-text whitespace-nowrap hover:border-amber-500"
                      >
                        {s} ({info.questions.length})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Grid of All Questions */}
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined || (theoryAnswers[q.id] && theoryAnswers[q.id].trim().length > 0);
                  const isFlagged = flaggedQuestions.has(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowQuestionNav(false);
                      }}
                      className={cn(
                        "w-full aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all relative border",
                        idx === currentIndex
                          ? "bg-theme-accent text-white border-theme-accent ring-2 ring-theme-accent/40"
                          : isFlagged
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                            : isAnswered
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-theme-bg text-theme-muted border-theme-border"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionNav(false)}
                  className="w-full py-3 bg-theme-bg hover:bg-theme-card border border-theme-border rounded-xl font-bold text-xs uppercase tracking-wider text-theme-text"
                >
                  Close Navigator
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calculator Modal */}
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Final Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl"
            >
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <AlertCircle size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-theme-text">Confirm Exam Submission</h3>
                <p className="text-xs text-theme-muted">
                  You have answered <strong className="text-emerald-500">{totalAnsweredCount}</strong> of{' '}
                  <strong className="text-theme-text">{questions.length}</strong> questions.
                </p>
                {questions.length - totalAnsweredCount > 0 && (
                  <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    ⚠️ You have {questions.length - totalAnsweredCount} unanswered questions remaining.
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
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit();
                  }}
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
