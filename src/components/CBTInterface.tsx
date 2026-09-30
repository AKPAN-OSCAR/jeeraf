import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, Send, AlertCircle, Menu, Flag, X, Sparkles } from 'lucide-react';
import { Question, Subject, ExamType } from '../types';
import { cn } from '../data/lib/utils';
import { Calculator } from './Calculator';
import { SidebarMenu } from './SidebarMenu';
import { MathRenderer } from './MathRenderer';
import { CBTQuestionAISolutionModal } from './CBTQuestionAISolutionModal';

interface CBTInterfaceProps {
  subject: Subject;
  examType?: ExamType;
  questions: Question[];
  durationMinutes: number;
  user: any;
  profile?: any;
  onLogout: () => void;
  onFinish: (answers: Record<string, number | null>, timeTaken: number) => void;
  onNavigateTo?: (target: any) => void;
}

export const CBTInterface: React.FC<CBTInterfaceProps> = ({
  subject,
  examType,
  questions,
  durationMinutes,
  user,
  profile,
  onLogout,
  onFinish,
  onNavigateTo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set([questions[0]?.id]));
  const [showAiModal, setShowAiModal] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  }, [currentIndex, currentQuestion]);

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
    onFinish(answers, timeTaken);
  }, [answers, timeLeft, durationMinutes, onFinish, isSubmitting]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showCalcButton = examType === 'Personal CBT' || ['Mathematics', 'Physics', 'Chemistry'].includes(subject);

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

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-theme-card border-b border-theme-border px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SidebarMenu user={user} profile={profile} onLogout={onLogout} onNavigate={onNavigateTo} />
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to end this exam and return to the subjects dashboard? Your current progress will not be saved.")) {
                onNavigateTo?.('dashboard');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg hover:bg-theme-border text-theme-muted hover:text-rose-500 border border-theme-border rounded-xl text-xs font-bold transition-all"
            title="Exit to Subjects Dashboard"
          >
            <ChevronLeft size={16} /> Exit
          </button>
          <div className="hidden sm:flex w-10 h-10 bg-theme-accent rounded-lg items-center justify-center text-white font-bold">
            {subject[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-text leading-tight">{subject} Examination</h1>
            <p className="text-xs text-theme-muted">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg transition-colors",
          timeLeft < 300 ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-theme-bg/50 text-theme-accent border border-theme-border"
        )}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuestionNav(true)}
            className="p-2 bg-theme-card hover:bg-theme-bg text-theme-muted rounded-xl transition-all flex items-center gap-2 border border-theme-border"
            title="Question Navigator"
          >
            <Menu size={20} />
            <span className="hidden sm:inline text-sm font-bold text-theme-accent">Navigator</span>
          </button>

          {showCalcButton && (
            <button
              onClick={() => setShowCalculator(true)}
              className="p-2 bg-theme-card hover:bg-theme-bg text-theme-muted rounded-xl transition-all flex items-center gap-2 border border-theme-border"
              title="Open Calculator"
            >
              <div className="bg-theme-accent text-white w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold">
                +/-
              </div>
              <span className="hidden md:inline text-sm font-bold text-theme-text transition-colors">Calc</span>
            </button>
          )}

          {/* JeeRaf AI Study Helper Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Ask JeeRaf AI for guidance or concept clarity on this question"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span className="hidden sm:inline text-xs font-black text-amber-500">AI Help</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-theme-accent hover:opacity-90 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-theme-accent/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl grid lg:grid-cols-4 gap-8">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-theme-card rounded-3xl p-8 shadow-sm border border-theme-border min-h-[400px] flex flex-col transition-colors duration-300"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 bg-theme-bg text-theme-accent text-xs font-bold rounded-full uppercase tracking-wider border border-theme-border">
                    Question {currentIndex + 1}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleFlag}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all",
                      flaggedQuestions.has(currentQuestion.id)
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-theme-bg text-theme-muted hover:text-theme-text border border-theme-border"
                    )}
                  >
                    <Flag size={14} fill={flaggedQuestions.has(currentQuestion.id) ? "currentColor" : "none"} />
                    {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag for Review"}
                  </button>
                  {currentQuestion.section && (
                    <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">
                      {currentQuestion.section}
                    </span>
                  )}
                </div>
              </div>

              {currentQuestion.passage && (
                <div className="mb-6 p-6 bg-theme-bg border-l-4 border-theme-accent rounded-r-2xl">
                  <h4 className="text-xs font-bold text-theme-accent mb-2 uppercase tracking-widest">Read the passage below:</h4>
                  <div className="text-theme-text leading-relaxed italic opacity-90">
                    <MathRenderer text={currentQuestion.passage} />
                  </div>
                </div>
              )}

              {currentQuestion.images && currentQuestion.images.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-4">
                  {currentQuestion.images.map((img, i) => img && (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Reference diagram ${i + 1}`} 
                      className="max-h-64 rounded-xl border border-theme-border shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              <div className="text-xl md:text-2xl font-medium text-theme-text leading-relaxed transition-colors">
                <MathRenderer text={currentQuestion.question} />
              </div>
            </div>

            <div className="grid gap-4 mt-auto">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                    answers[currentQuestion.id] === idx
                      ? "border-theme-accent bg-theme-accent/5"
                      : "border-theme-border hover:border-theme-accent/30 hover:bg-theme-bg"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold shrink-0 transition-all",
                    answers[currentQuestion.id] === idx
                      ? "bg-theme-accent border-theme-accent text-white"
                      : "border-theme-border text-theme-muted group-hover:border-theme-accent/50"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={cn(
                    "text-lg transition-colors",
                    answers[currentQuestion.id] === idx ? "text-theme-text font-medium" : "text-theme-text/80"
                  )}>
                    <MathRenderer text={option} />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 bg-theme-card border border-theme-border rounded-xl font-bold text-theme-muted hover:bg-theme-bg disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            
            <div className="hidden sm:flex gap-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentIndex 
                      ? "w-8 bg-theme-accent" 
                      : answers[questions[idx].id] !== undefined 
                        ? "bg-theme-accent/30" 
                        : "bg-theme-border"
                  )}
                />
              ))}
            </div>

            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-theme-card border border-theme-border rounded-xl font-bold text-theme-muted hover:bg-theme-bg disabled:opacity-30 transition-all"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-theme-card rounded-3xl p-6 shadow-sm border border-theme-border sticky top-28 transition-colors duration-300">
            <h3 className="font-bold text-theme-text mb-4 flex items-center justify-between">
              Question Map
              <span className="text-xs font-normal text-theme-muted">
                {Object.keys(answers).length} / {questions.length} Answered
              </span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flaggedQuestions.has(q.id);
                const isVisited = visitedQuestions.has(q.id);
                const isSkipped = isVisited && !isAnswered;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all relative",
                      idx === currentIndex 
                        ? "bg-theme-accent text-white ring-4 ring-theme-accent/20" 
                        : isFlagged 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : isSkipped
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : isAnswered 
                              ? "bg-theme-accent/10 text-theme-accent border border-theme-accent/20" 
                              : "bg-theme-bg text-theme-muted hover:bg-theme-border border border-theme-border"
                    )}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <div className="absolute -top-1 -right-1">
                        <Flag size={10} fill="currentColor" className="text-amber-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-theme-border space-y-2">
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <div className="w-3 h-3 bg-theme-accent rounded-sm" /> Current
              </div>
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <div className="w-3 h-3 bg-theme-accent/30 rounded-sm border border-theme-accent/40" /> Answered
              </div>
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <div className="w-3 h-3 bg-rose-500/10 border border-rose-500/20 rounded-sm" /> Skipped
              </div>
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <div className="w-3 h-3 bg-amber-500/10 border border-amber-500/20 rounded-sm" /> Flagged
              </div>
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <div className="w-3 h-3 bg-theme-bg border border-theme-border rounded-sm" /> Untouched
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-theme-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-theme-border"
            >
              <div className="w-16 h-16 bg-theme-accent/10 text-theme-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-theme-text text-center mb-2">Submit Examination?</h3>
              <p className="text-theme-muted text-center mb-8">
                You have answered {Object.keys(answers).length} out of {questions.length} questions. Are you sure you want to end the exam?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="py-3 px-6 border border-theme-border rounded-xl font-bold text-theme-muted hover:bg-theme-bg transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="py-3 px-6 bg-theme-accent text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCalculator(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-grayscale-[0.5]"
            />
            <div className="relative z-[70]">
              <Calculator onClose={() => setShowCalculator(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Navigator Modal (Mobile/Tablet) */}
      <AnimatePresence>
        {showQuestionNav && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuestionNav(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-theme-card rounded-3xl p-6 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-theme-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-theme-text">Question Map</h3>
                  <p className="text-sm text-theme-muted">
                    {Object.keys(answers).length} of {questions.length} Answered
                  </p>
                </div>
                <button 
                  onClick={() => setShowQuestionNav(false)}
                  className="p-2 hover:bg-theme-bg rounded-full transition-colors text-theme-muted"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 content-start">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isVisited = visitedQuestions.has(q.id);
                  const isSkipped = isVisited && !isAnswered;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowQuestionNav(false);
                      }}
                      className={cn(
                        "aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all gap-1 relative",
                        idx === currentIndex 
                          ? "bg-theme-accent text-white ring-4 ring-theme-accent/10 shadow-lg shadow-theme-accent/20" 
                          : isFlagged 
                            ? "bg-amber-500 text-white border border-amber-600 shadow-sm"
                            : isSkipped
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : isAnswered 
                                ? "bg-theme-accent/20 text-theme-accent border border-theme-accent/30" 
                                : "bg-theme-bg text-theme-muted border border-theme-border hover:border-theme-muted"
                      )}
                    >
                      <span>{idx + 1}</span>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        idx === currentIndex 
                          ? "bg-white/50" 
                          : isFlagged
                            ? "bg-amber-400"
                            : isSkipped
                              ? "bg-rose-500/40"
                              : isAnswered 
                                ? "bg-theme-accent/50" 
                                : "bg-theme-muted/30"
                      )} />
                      {isFlagged && (
                        <div className="absolute top-1 right-1">
                          <Flag size={8} fill="currentColor" className="text-amber-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-theme-border grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-theme-accent rounded-lg" />
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Current</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-theme-accent/20 border border-theme-accent/30 rounded-lg" />
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Answered</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg" />
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Skipped</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-amber-500 border border-amber-600 rounded-lg" />
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Flagged</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-theme-bg border border-theme-border rounded-lg" />
                  <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Untouched</span>
                </div>
              </div>

              <button
                onClick={() => setShowQuestionNav(false)}
                className="mt-6 w-full py-4 bg-theme-accent text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-theme-accent/20"
              >
                Back to Exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-Exam Contextual JeeRaf AI Guidance Modal */}
      {showAiModal && currentQuestion && (
        <CBTQuestionAISolutionModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          question={currentQuestion}
          questionIndex={currentIndex}
          userAnswer={{
            selectedAnswer: answers[currentQuestion.id] ?? null
          }}
          subject={subject}
          examType={examType}
          user={user}
          profile={profile}
          onOpenFullScreenAI={() => {
            setShowAiModal(false);
            if (onNavigateTo) onNavigateTo('system_ai');
          }}
        />
      )}
    </div>
  );
};
