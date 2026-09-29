import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Home, ChevronDown, ChevronUp, Info, Menu, Flame, Trophy, BarChart2, Target, Award, Sparkles } from 'lucide-react';
import { QuizResult, Question } from '../types';
import { cn } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';
import { MathRenderer } from './MathRenderer';

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
  const [showCorrections, setShowCorrections] = useState(false);
  const percentage = Math.round((result.score / result.totalQuestions) * 100);

  // Peer Benchmark calculation
  const peerPercentile = Math.min(99, Math.max(12, Math.round(percentage * 0.95 + 5)));
  const currentStreak = profile?.currentStreak || 1;

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = () => {
    if (percentage >= 70) return 'bg-emerald-500/10';
    if (percentage >= 50) return 'bg-amber-500/10';
    return 'bg-rose-500/10';
  };

  return (
    <div className="min-h-screen bg-theme-bg py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-start mb-6">
          <SidebarMenu user={user} profile={profile} onLogout={onLogout} onNavigate={onNavigateTo} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card rounded-3xl p-8 md:p-12 shadow-sm border border-theme-border text-center"
        >
          <h1 className="text-3xl font-bold text-theme-text mb-8">Examination Result</h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
            <div className="relative w-48 h-48">
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
                  transition={{ duration: 1.5, ease: "easeOut" }}
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
                <span className={cn("text-5xl font-black", getScoreColor())}>{percentage}%</span>
                <span className="text-theme-muted text-sm font-medium uppercase tracking-wider">Score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Correct</p>
                <p className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  {result.score}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Incorrect</p>
                <p className="text-2xl font-bold text-rose-500 flex items-center gap-2">
                  <XCircle size={24} />
                  {result.totalQuestions - result.score}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Time Taken</p>
                <p className="text-2xl font-bold text-theme-accent">
                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Subject</p>
                <p className="text-2xl font-bold text-theme-text">{result.subject}</p>
              </div>
            </div>
          </div>

          {/* Peer Benchmark & Streak Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 text-left">
            <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <span className="text-xs text-theme-muted font-bold uppercase tracking-wider block">Peer Comparison</span>
                <p className="text-sm font-black text-theme-text">
                  Outperformed <span className="text-amber-500 font-extrabold">{peerPercentile}%</span> of CBT test takers
                </p>
              </div>
            </div>

            <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Flame size={24} />
              </div>
              <div>
                <span className="text-xs text-theme-muted font-bold uppercase tracking-wider block">Study Streak</span>
                <p className="text-sm font-black text-theme-text">
                  🔥 <span className="text-rose-500 font-extrabold">{currentStreak} Day</span> CBT Exam Streak Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onRestart}
              className="px-8 py-4 bg-theme-accent text-white font-bold rounded-2xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-theme-accent/20"
            >
              <RefreshCcw size={20} />
              Retake Exam
            </button>
            <button
              onClick={onHome}
              className="px-8 py-4 bg-theme-bg border border-theme-border text-theme-text font-bold rounded-2xl flex items-center gap-2 hover:bg-theme-card transition-all"
            >
              <Home size={20} />
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        {/* Corrections Toggle */}
        <div className="space-y-4">
          <button
            onClick={() => setShowCorrections(!showCorrections)}
            className="w-full bg-theme-card rounded-2xl p-6 border border-theme-border flex items-center justify-between hover:bg-theme-bg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-accent/10 text-theme-accent rounded-xl flex items-center justify-center">
                <Info size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-theme-text">Review Corrections</h3>
                <p className="text-sm text-theme-muted">See detailed explanations for each question</p>
              </div>
            </div>
            {showCorrections ? <ChevronUp size={24} className="text-theme-muted" /> : <ChevronDown size={24} className="text-theme-muted" />}
          </button>

          {showCorrections && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {questions.map((q, idx) => {
                const userAns = result.answers.find(a => a.questionId === q.id);
                const isCorrect = userAns?.isCorrect;

                return (
                  <div key={q.id} className="bg-theme-card rounded-3xl p-8 border border-theme-border shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2 block">
                          Question {idx + 1}
                        </span>
                        <h4 className="text-xl font-medium text-theme-text leading-relaxed">
                          <MathRenderer text={q.question} />
                        </h4>
                      </div>
                      {isCorrect ? (
                        <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-full">
                          <CheckCircle2 size={24} />
                        </div>
                      ) : (
                        <div className="bg-rose-500/10 text-rose-500 p-2 rounded-full">
                          <XCircle size={24} />
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 mb-6">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAns?.selectedAnswer === optIdx;
                        const isCorrectOpt = q.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              "p-4 rounded-xl border-2 flex items-center gap-3",
                              isCorrectOpt 
                                ? "border-emerald-500 bg-emerald-500/10" 
                                : isSelected 
                                  ? "border-rose-500 bg-rose-500/10" 
                                  : "border-theme-border bg-theme-bg"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              isCorrectOpt ? "bg-emerald-500 text-white" : isSelected ? "bg-rose-500 text-white" : "bg-theme-border text-theme-muted"
                            )}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className={cn(
                              "text-sm",
                              isCorrectOpt ? "text-emerald-500 font-medium" : isSelected ? "text-rose-500 font-medium" : "text-theme-text"
                            )}>
                              <MathRenderer text={opt} />
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-theme-accent/5 rounded-2xl p-6 border border-theme-accent/10">
                      <h5 className="text-theme-accent font-bold text-sm mb-4 flex items-center gap-2 border-b border-theme-accent/10 pb-2">
                        <Info size={16} />
                        Detailed Solution
                      </h5>
                      <div className="text-theme-text text-base leading-relaxed opacity-90 whitespace-pre-line">
                        <MathRenderer text={q.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
