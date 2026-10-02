import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, Play, Pause, RotateCcw, Plus, ArrowRight, 
  Coffee, Sparkles, CheckCircle2, Volume2, VolumeX, Eye, HeartHandshake
} from 'lucide-react';
import { cn } from '../data/lib/utils';
import { Subject, ExamType } from '../types';

interface ExamIntermissionBreakProps {
  examType: ExamType;
  subjects: Subject[];
  nextPaperTitle: string; // e.g. "Paper 2: Theory & Essay Questions" or "Paper 1: Objective Questions"
  nextQuestionsCount: number;
  initialMinutes?: number; // Minimum 15 as requested
  onCompleteBreak: () => void;
}

export const ExamIntermissionBreak: React.FC<ExamIntermissionBreakProps> = ({
  examType,
  subjects,
  nextPaperTitle,
  nextQuestionsCount,
  initialMinutes = 15,
  onCompleteBreak
}) => {
  // Enforce minimum 15 minutes as per user requirement
  const sanitizedInitial = Math.max(15, initialMinutes);
  const [totalSeconds, setTotalSeconds] = useState(sanitizedInitial * 60);
  const [secondsLeft, setSecondsLeft] = useState(sanitizedInitial * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Play subtle completion tone if audio context supported
          if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6); // A5
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch (e) {
              // Ignore audio errors
            }
          }
          onCompleteBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onCompleteBreak, soundEnabled]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  const handleAddFiveMinutes = () => {
    setSecondsLeft(prev => prev + 300);
    setTotalSeconds(prev => prev + 300);
  };

  const handleResetTo = (mins: number) => {
    const validMins = Math.max(15, mins);
    setTotalSeconds(validMins * 60);
    setSecondsLeft(validMins * 60);
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Ambient background glow inspired by Pomofocus & JeeRaf dark theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-8 relative z-10"
      >
        {/* Header Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
            <Coffee size={14} className="animate-bounce" />
            <span>National Exam Intermission Break</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Take a Rest & Recharge
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            You completed Part 1! Use this Pomofocus countdown break to relax before starting{' '}
            <strong className="text-amber-400">{nextPaperTitle}</strong> ({nextQuestionsCount} questions).
          </p>
        </div>

        {/* Circular Pomofocus Countdown Timer */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-slate-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-amber-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {isRunning ? 'Break Counting Down' : 'Break Paused'}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95",
              isRunning
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
            )}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause Break' : 'Resume Break'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddFiveMinutes}
            className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Add 5 minutes to break"
          >
            <Plus size={14} />
            <span>+5 Mins</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-2xl transition-all"
            title={soundEnabled ? "Mute completion chime" : "Enable completion chime"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        {/* Quick Break Presets (Enforcing >= 15 Minutes) */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Select Break Duration (Minimum 15 mins)
          </span>
          <div className="flex items-center justify-center gap-2">
            {[15, 20, 25, 30].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => handleResetTo(mins)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  Math.round(totalSeconds / 60) === mins
                    ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Relaxation Prompts */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-left space-y-2.5 w-full">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <HeartHandshake size={14} />
            Quick Rest Checkpoints
          </span>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Drink clean water and stretch your neck & back.</li>
            <li>Look away from the screen into the distance for 20 seconds.</li>
            <li>Take 5 slow, deep breaths to reset your focus for {nextPaperTitle}.</li>
          </ul>
        </div>

        {/* Skip / Continue Early Action */}
        <div className="pt-2 w-full">
          <button
            type="button"
            onClick={onCompleteBreak}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/20 transition-all active:scale-98"
          >
            <span>Skip Remaining Break & Begin {nextPaperTitle} Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
