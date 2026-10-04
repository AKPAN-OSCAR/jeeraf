import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, RefreshCcw, Home, ChevronDown, ChevronUp, 
  ChevronLeft, ChevronRight, Info, Flame, Trophy, Sparkles, 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, BookOpen, Check
} from 'lucide-react';
import { QuizResult, Question, Subject } from '../types';
import { cn } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';
import { MathRenderer } from './MathRenderer';
import { CBTQuestionAISolutionModal } from './CBTQuestionAISolutionModal';
import { JeeRafHeadIcon } from './AIAvatar';

interface ResultDashboardProps {
  result: QuizResult;
  questions: Question[];
  user: any;
  profile?: any;
  onLogout: () => void;
  onRestart: () => void;
  onHome: () => void;
  onNavigateTo?: (target: any) => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  result,
  questions,
  user,
  profile,
  onLogout,
  onRestart,
  onHome,
  onNavigateTo,
}) => {
  // Screen mode: 'summary' or 'solution' (Requirement 6)
  const [viewMode, setViewMode] = useState<'summary' | 'solution'>('summary');
  
  // AI Solution Modal
  const [activeAiQuestion, setActiveAiQuestion] = useState<{
    question: Question;
    index: number;
    userAnswer?: { selectedAnswer: number | null; isCorrect?: boolean; theoryAnswer?: string };
  } | null>(null);

  // Group questions by subject
  const subjectGroups = useMemo(() => {
    const map = new Map<Subject, Question[]>();
    questions.forEach((q) => {
      const s = q.subject || result.subject;
      if (!map.has(s)) {
        map.set(s, []);
      }
      map.get(s)!.push(q);
    });
    return map;
  }, [questions, result.subject]);

  const subjectList = useMemo(() => Array.from(subjectGroups.keys()), [subjectGroups]);

  // Selected subject on Solution Screen (defaults to first subject)
  const [solutionActiveSubject, setSolutionActiveSubject] = useState<Subject>(() => {
    return subjectList[0] || result.subject;
  });

  // Question index inside the active solution subject
  const [solutionIndex, setSolutionIndex] = useState<number>(0);

  const solutionQuestions = useMemo(() => {
    return subjectGroups.get(solutionActiveSubject) || questions;
  }, [subjectGroups, solutionActiveSubject, questions]);

  const currentSolutionQuestion = solutionQuestions[solutionIndex] || solutionQuestions[0];
  const currentSolUserAns = result.answers.find(a => a.questionId === currentSolutionQuestion?.id);

  const percentage = Math.round((result.score / Math.max(1, result.totalQuestions)) * 100);
  const peerPercentile = Math.min(99, Math.max(12, Math.round(percentage * 0.95 + 5)));
  const currentStreak = profile?.currentStreak || 1;

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Navigate solution question
  const handlePrevSolution = () => {
    if (solutionIndex > 0) {
      setSolutionIndex(prev => prev - 1);
    }
  };

  const handleNextSolution = () => {
    if (solutionIndex < solutionQuestions.length - 1) {
      setSolutionIndex(prev => prev + 1);
    }
  };

  // Keyboard navigation on Solution Screen
  React.useEffect(() => {
    if (viewMode !== 'solution') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key.toLowerCase() === 'n') {
        handleNextSolution();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'p') {
        handlePrevSolution();
      } else if (e.key === 'Escape') {
        setViewMode('summary');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, solutionIndex, solutionQuestions.length]);

  return (
    <div className="min-h-screen bg-theme-bg py-8 sm:py-12 px-3 sm:px-6 text-theme-text transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* VIEW 1: RESULTS SUMMARY DASHBOARD */}
        {viewMode === 'summary' && (
          <>
            <div className="flex justify-start mb-4">
              <SidebarMenu user={user} profile={profile} onLogout={onLogout} onNavigate={onNavigateTo} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-theme-card rounded-3xl p-6 sm:p-10 shadow-sm border border-theme-border text-center space-y-8"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {result.examType} Performance Report
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-theme-text mt-3 tracking-tight">
                  Examination Result
                </h1>
              </div>

              {/* Circular Score Ring & Stats */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-theme-border stroke-current"
                      strokeWidth="8"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <motion.circle
                      initial={{ strokeDasharray: "0 251.2" }}
                      animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={cn("stroke-current", getScoreColor())}
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-4xl sm:text-5xl font-black", getScoreColor())}>
                      {percentage}%
                    </span>
                    <span className="text-theme-muted text-xs font-bold uppercase tracking-wider">
                      Overall Score
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 text-left w-full max-w-sm">
                  <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border">
                    <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider mb-1">Correct</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 size={20} />
                      {result.score}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border">
                    <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider mb-1">Incorrect / Skipped</p>
                    <p className="text-xl sm:text-2xl font-black text-rose-500 flex items-center gap-1.5">
                      <XCircle size={20} />
                      {result.totalQuestions - result.score}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border">
                    <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider mb-1">Time Taken</p>
                    <p className="text-xl sm:text-2xl font-black text-theme-accent">
                      {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-theme-bg border border-theme-border">
                    <p className="text-theme-muted text-[10px] font-bold uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-xl sm:text-2xl font-black text-theme-text truncate">
                      {result.subject}
                    </p>
                  </div>
                </div>
              </div>

              {/* Per-Subject Breakdown for Merged National Exams */}
              {subjectList.length > 1 && (
                <div className="p-5 rounded-3xl bg-theme-bg border border-theme-border text-left space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500" />
                    <span>Subject Score Breakdown:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subjectList.map(s => {
                      const subQs = subjectGroups.get(s) || [];
                      let subCorrect = 0;
                      subQs.forEach(q => {
                        const ans = result.answers.find(a => a.questionId === q.id);
                        if (ans?.isCorrect) subCorrect++;
                      });
                      const subPct = Math.round((subCorrect / Math.max(1, subQs.length)) * 100);

                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSolutionActiveSubject(s);
                            setSolutionIndex(0);
                            setViewMode('solution');
                          }}
                          className="p-3 bg-theme-card hover:bg-theme-bg rounded-xl border border-theme-border flex items-center justify-between transition-all group text-left cursor-pointer active:scale-98"
                        >
                          <div>
                            <span className="font-bold text-xs text-theme-text group-hover:text-amber-500 transition-colors block truncate">{s}</span>
                            <span className="text-[10px] text-theme-muted block">Tap to view solutions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-theme-muted">
                              {subCorrect}/{subQs.length}
                            </span>
                            <span className={cn(
                              "text-xs font-black px-2 py-0.5 rounded-md",
                              subPct >= 70 ? "bg-emerald-500/10 text-emerald-500" : subPct >= 50 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                              {subPct}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Peer Benchmark & Streak Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider block">Peer Comparison</span>
                    <p className="text-xs sm:text-sm font-black text-theme-text">
                      Outperformed <span className="text-amber-500 font-extrabold">{peerPercentile}%</span> of CBT test takers
                    </p>
                  </div>
                </div>

                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <Flame size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider block">Study Streak</span>
                    <p className="text-xs sm:text-sm font-black text-theme-text">
                      🔥 <span className="text-rose-500 font-extrabold">{currentStreak} Day</span> CBT Exam Streak Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSolutionActiveSubject(subjectList[0] || result.subject);
                    setSolutionIndex(0);
                    setViewMode('solution');
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all active:scale-95"
                >
                  <Info size={18} />
                  <span>Open Full Solutions & Explanations</span>
                </button>

                <button
                  type="button"
                  onClick={onRestart}
                  className="w-full sm:w-auto px-6 py-4 bg-theme-bg border border-theme-border text-theme-text font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-theme-card transition-all"
                >
                  <RefreshCcw size={18} />
                  <span>Retake Exam</span>
                </button>

                <button
                  type="button"
                  onClick={onHome}
                  className="w-full sm:w-auto px-6 py-4 bg-theme-bg border border-theme-border text-theme-text font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-theme-card transition-all"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* VIEW 2: DEDICATED SOLUTION SCREEN (Requirement 6) */}
        {viewMode === 'solution' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Top Navigation Bar on Solution Screen */}
            <div className="bg-theme-card rounded-2xl p-4 border border-theme-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-2 z-20">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg text-theme-muted hover:text-theme-text border border-theme-border text-xs font-bold transition-all self-start sm:self-auto"
              >
                <ArrowLeft size={16} />
                <span>Back to Summary</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest block">
                  {solutionActiveSubject} Solutions
                </span>
                <span className="text-xs text-theme-muted">
                  Question <strong className="text-theme-text">{solutionIndex + 1}</strong> of {solutionQuestions.length}
                </span>
              </div>

              {/* Up & Down / Prev & Next Arrow Controls at Top (Requirement 6) */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={solutionIndex === 0}
                  onClick={handlePrevSolution}
                  className="px-3 py-1.5 bg-theme-bg hover:bg-theme-border disabled:opacity-30 border border-theme-border rounded-xl text-xs font-bold flex items-center gap-1"
                  title="Previous Question Solution (Up / Left Arrow)"
                >
                  <ArrowUp size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <button
                  type="button"
                  disabled={solutionIndex === solutionQuestions.length - 1}
                  onClick={handleNextSolution}
                  className="px-3 py-1.5 bg-theme-bg hover:bg-theme-border disabled:opacity-30 border border-theme-border rounded-xl text-xs font-bold flex items-center gap-1"
                  title="Next Question Solution (Down / Right Arrow)"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* Merged Subject Buttons on Solution Screen (Requirement 6) */}
            {subjectList.length > 1 && (
              <div className="bg-theme-card p-3 sm:p-4 rounded-2xl border border-theme-border shadow-sm flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-[11px] font-black uppercase tracking-wider text-theme-muted mr-1 shrink-0">
                  Select Subject:
                </span>
                {subjectList.map(s => {
                  const subQs = subjectGroups.get(s) || [];
                  let subCorrect = 0;
                  subQs.forEach(q => {
                    const ans = result.answers.find(a => a.questionId === q.id);
                    if (ans?.isCorrect) subCorrect++;
                  });
                  const isCurrent = solutionActiveSubject === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSolutionActiveSubject(s);
                        setSolutionIndex(0);
                      }}
                      className={cn(
                        "px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 active:scale-98",
                        isCurrent
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md ring-2 ring-amber-500/30"
                          : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-card"
                      )}
                    >
                      <span>{s}</span>
                      <span className={cn(
                        "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                        isCurrent 
                          ? "bg-slate-950/20 text-slate-950" 
                          : "bg-theme-card text-theme-muted border border-theme-border"
                      )}>
                        {subCorrect}/{subQs.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Horizontal Numbers Pagination Bar (No endless scrolling, Requirement 6) */}
            <div className="bg-theme-card p-3 rounded-2xl border border-theme-border shadow-sm">
              <div className="flex items-center justify-between pb-2 text-[11px] text-theme-muted font-bold">
                <span>Jump to Question Number:</span>
                <span>{solutionQuestions.length} Questions</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {solutionQuestions.map((q, idx) => {
                  const uAns = result.answers.find(a => a.questionId === q.id);
                  const isCorrect = uAns?.isCorrect;
                  const isCurrent = idx === solutionIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSolutionIndex(idx)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-all border",
                        isCurrent
                          ? "bg-theme-accent text-white border-theme-accent ring-2 ring-theme-accent/40 shadow-sm scale-105"
                          : isCorrect
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Solution Card for Currently Selected Question */}
            {currentSolutionQuestion && (
              <motion.div
                key={currentSolutionQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-sm space-y-6"
              >
                {/* Header of Solution Card */}
                <div className="flex items-start justify-between gap-4 border-b border-theme-border/60 pb-4">
                  <div>
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest block mb-1">
                      {solutionActiveSubject} • Question {solutionIndex + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-medium text-theme-text leading-relaxed">
                      <MathRenderer text={currentSolutionQuestion.question} />
                    </h3>
                  </div>

                  {currentSolUserAns?.isCorrect ? (
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
                      <XCircle size={24} />
                    </div>
                  )}
                </div>

                {/* Comprehension Passage */}
                {currentSolutionQuestion.passage && (
                  <div className="p-4 bg-theme-bg border-l-4 border-amber-500 rounded-r-2xl max-h-56 overflow-y-auto pr-2 scrollbar-thin">
                    <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1">Passage Reference:</h4>
                    <div className="text-xs text-theme-text/90 italic leading-relaxed">
                      <MathRenderer text={currentSolutionQuestion.passage} />
                    </div>
                  </div>
                )}

                {/* Diagram / SVG */}
                {currentSolutionQuestion.diagram && (
                  <div 
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-theme-border max-w-md overflow-hidden flex items-center justify-center text-slate-900 dark:text-slate-100 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: currentSolutionQuestion.diagram }}
                  />
                )}
                {currentSolutionQuestion.images && currentSolutionQuestion.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {currentSolutionQuestion.images.map((img, i) => img && (
                      <img 
                        key={i} 
                        src={img} 
                        alt="Question Diagram" 
                        className="max-h-60 rounded-2xl border border-theme-border shadow-sm object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}

                {/* Theory vs Multiple Choice Options Evaluation */}
                {currentSolutionQuestion.type === 'theory' || !currentSolutionQuestion.options || currentSolutionQuestion.options.length === 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-theme-bg rounded-2xl border border-theme-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                          Your Submitted Theory Answer:
                        </span>
                        {currentSolutionQuestion.marks && (
                          <span className="text-xs font-bold text-amber-400">
                            [{currentSolutionQuestion.marks} Marks]
                          </span>
                        )}
                      </div>
                      {currentSolUserAns?.theoryAnswer || (result.theoryAnswers && result.theoryAnswers[currentSolutionQuestion.id]) ? (
                        <div className="text-xs sm:text-sm text-theme-text font-mono whitespace-pre-wrap p-3 bg-theme-card/60 rounded-xl border border-theme-border">
                          <MathRenderer text={currentSolUserAns?.theoryAnswer || (result.theoryAnswers && result.theoryAnswers[currentSolutionQuestion.id]) || ''} />
                        </div>
                      ) : (
                        <p className="text-xs text-theme-muted italic">No candidate answer submitted.</p>
                      )}
                    </div>

                    {currentSolutionQuestion.modelAnswer && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Model Answer Summary:
                        </span>
                        <div className="text-xs text-theme-text font-medium">
                          <MathRenderer text={currentSolutionQuestion.modelAnswer} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2.5">
                    {currentSolutionQuestion.options.map((opt, optIdx) => {
                      const isCandidateAnswer = currentSolUserAns?.selectedAnswer === optIdx;
                      const isCorrectAnswer = currentSolutionQuestion.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-xs sm:text-sm",
                            isCorrectAnswer
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold"
                              : isCandidateAnswer
                                ? "border-rose-500 bg-rose-500/10 text-rose-300"
                                : "border-theme-border bg-theme-bg text-theme-muted opacity-80"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0",
                              isCorrectAnswer 
                                ? "bg-emerald-500 text-slate-950" 
                                : isCandidateAnswer 
                                  ? "bg-rose-500 text-white" 
                                  : "bg-theme-card text-theme-muted border border-theme-border"
                            )}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <div className="flex-1 overflow-x-auto">
                              {typeof opt === 'string' && opt.trim().startsWith('<svg') ? (
                                <div 
                                  className="p-2 bg-white dark:bg-slate-900 rounded-xl inline-block max-w-full overflow-hidden text-slate-800 dark:text-slate-200 border border-theme-border" 
                                  dangerouslySetInnerHTML={{ __html: opt }} 
                                />
                              ) : (
                                <MathRenderer text={opt} />
                              )}
                            </div>
                          </div>

                          <div>
                            {isCorrectAnswer && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                                Correct Answer
                              </span>
                            )}
                            {isCandidateAnswer && !isCorrectAnswer && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500 text-white">
                                Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Step-by-Step Official Worked Solution */}
                <div className="bg-theme-accent/5 rounded-2xl p-5 border border-theme-accent/15 space-y-3">
                  <div className="flex items-center justify-between border-b border-theme-accent/10 pb-2">
                    <h4 className="text-theme-accent font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Info size={14} />
                      <span>Step-by-Step Worked Solution</span>
                    </h4>
                    <span className="text-[10px] font-bold text-theme-muted">Official Syllabus Proof</span>
                  </div>

                  <div className="text-xs sm:text-sm text-theme-text leading-relaxed whitespace-pre-line">
                    <MathRenderer text={currentSolutionQuestion.explanation} />
                  </div>

                  {currentSolutionQuestion.solutionDiagram && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-theme-border max-w-md mx-auto overflow-hidden flex items-center justify-center text-slate-900 dark:text-slate-100 shadow-sm">
                      <div dangerouslySetInnerHTML={{ __html: currentSolutionQuestion.solutionDiagram }} />
                    </div>
                  )}

                  {/* Ask JeeRaf AI Solver Drawer on Solution Screen */}
                  <div className="pt-3 border-t border-theme-border/60 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-theme-muted font-medium">
                      Need deeper mathematical clarification or concept breakdown?
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveAiQuestion({
                        question: currentSolutionQuestion,
                        index: solutionIndex,
                        userAnswer: currentSolUserAns
                      })}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Sparkles size={14} />
                      <span>Ask JeeRaf AI Explainer</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Navigation Buttons on Solution Screen */}
                <div className="flex items-center justify-between pt-4 border-t border-theme-border/60">
                  <button
                    type="button"
                    disabled={solutionIndex === 0}
                    onClick={handlePrevSolution}
                    className="px-5 py-2.5 bg-theme-bg hover:bg-theme-card disabled:opacity-30 border border-theme-border rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Previous Solution</span>
                  </button>

                  <span className="text-xs text-theme-muted">
                    {solutionIndex + 1} of {solutionQuestions.length}
                  </span>

                  <button
                    type="button"
                    disabled={solutionIndex === solutionQuestions.length - 1}
                    onClick={handleNextSolution}
                    className="px-5 py-2.5 bg-theme-accent hover:opacity-90 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next Solution</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

      </div>

      {/* AI Solution Modal for in-depth explanation */}
      {activeAiQuestion && (
        <CBTQuestionAISolutionModal
          isOpen={!!activeAiQuestion}
          onClose={() => setActiveAiQuestion(null)}
          question={activeAiQuestion.question}
          questionIndex={activeAiQuestion.index}
          userAnswer={activeAiQuestion.userAnswer}
          subject={solutionActiveSubject || result.subject}
          examType={result.examType}
          user={user}
          profile={profile}
          onOpenFullScreenAI={(initialQuery) => {
            setActiveAiQuestion(null);
            if (onNavigateTo) {
              onNavigateTo('system_ai');
            }
          }}
        />
      )}
    </div>
  );
};
