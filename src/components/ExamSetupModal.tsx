import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, Clock, Layers, Sparkles, BookOpen, 
  HelpCircle, ArrowRight, ShieldCheck, Flame, Coffee, FileText, CheckCircle2
} from 'lucide-react';
import { 
  Subject, ExamType, ExamTimingMode, 
  ExamPaperFormat, ContinuationOrder, ExamSessionConfig 
} from '../types';
import { cn, STANDARD_NATIONAL_EXAM_YEARS } from '../data/lib/utils';

interface ExamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: ExamType;
  availableSubjects: Subject[];
  initialSubject?: Subject;
  availableYears?: number[];
  onStartExam: (config: ExamSessionConfig) => void;
}

export const ExamSetupModal: React.FC<ExamSetupModalProps> = ({
  isOpen,
  onClose,
  examType,
  availableSubjects,
  initialSubject,
  availableYears = STANDARD_NATIONAL_EXAM_YEARS,
  onStartExam
}) => {
  if (!isOpen) return null;

  const isJamb = examType === 'JAMB';
  const supportsTheory = examType === 'WAEC' || examType === 'NECO' || examType === 'WAEC GCE' || examType === 'NECO GCE' || examType === 'Personal CBT';

  // State
  // For JAMB: English is compulsory and locked + 3 chosen electives = 4 total
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(() => {
    if (isJamb) {
      const list: Subject[] = ['English'];
      if (initialSubject && initialSubject !== 'English') {
        list.push(initialSubject);
      }
      return list;
    }
    return initialSubject ? [initialSubject] : [availableSubjects[0] || 'Mathematics'];
  });

  const [timingMode, setTimingMode] = useState<ExamTimingMode>('merged');
  const [paperFormat, setPaperFormat] = useState<ExamPaperFormat>('objective');
  const [continuationOrder, setContinuationOrder] = useState<ContinuationOrder>('obj_first');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(15); // Minimum 15 as requested
  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    if (isJamb) return 120; // Default 2 hours for merged JAMB
    return 60;
  });
  const [practiceMode, setPracticeMode] = useState<'yearly' | 'random'>('random');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(availableYears[0]);

  // Handle subject toggle
  const toggleSubject = (s: Subject) => {
    if (isJamb) {
      if (s === 'English') return; // English is compulsory in JAMB
      if (selectedSubjects.includes(s)) {
        setSelectedSubjects(prev => prev.filter(x => x !== s));
      } else {
        if (selectedSubjects.length >= 4) {
          alert("JAMB requires exactly 4 subjects. Please uncheck another subject first.");
          return;
        }
        setSelectedSubjects(prev => [...prev, s]);
      }
    } else {
      if (timingMode === 'one_by_one') {
        setSelectedSubjects([s]);
      } else {
        if (selectedSubjects.includes(s)) {
          if (selectedSubjects.length > 1) {
            setSelectedSubjects(prev => prev.filter(x => x !== s));
          }
        } else {
          setSelectedSubjects(prev => [...prev, s]);
        }
      }
    }
  };

  const handleLaunch = () => {
    if (isJamb && selectedSubjects.length !== 4) {
      alert(`JAMB requires exactly 4 subjects. You currently have selected ${selectedSubjects.length}/4 subjects.`);
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to start.");
      return;
    }

    onStartExam({
      examType,
      timingMode,
      subjects: selectedSubjects,
      paperFormat,
      continuationOrder: paperFormat === 'both_continuation' ? continuationOrder : undefined,
      breakDurationMinutes: paperFormat === 'both_continuation' ? Math.max(15, breakDurationMinutes) : undefined,
      durationMinutes,
      practiceMode,
      selectedYear: practiceMode === 'yearly' ? selectedYear : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-theme-card border border-theme-border rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative scrollbar-thin"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme-border pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} />
              <span>National CBT Setup</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-text tracking-tight">
              Configure {examType} Examination
            </h2>
            <p className="text-xs text-theme-muted">
              Choose your subjects, timing mode, and paper continuation settings before beginning.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-theme-bg hover:bg-theme-border text-theme-muted hover:text-theme-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION 1: TIMING MODE SELECTION */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <span>1. Exam Timing Mode</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTimingMode('merged');
                if (isJamb) setDurationMinutes(120);
                else setDurationMinutes(selectedSubjects.length * 30);
              }}
              className={cn(
                "p-4 rounded-2xl border text-left space-y-2 transition-all relative overflow-hidden",
                timingMode === 'merged'
                  ? "bg-theme-accent/10 border-theme-accent ring-2 ring-theme-accent/30 shadow-md"
                  : "bg-theme-bg border-theme-border hover:border-theme-muted text-theme-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  Merged Time (National Simulation)
                </span>
                {timingMode === 'merged' && <CheckCircle2 size={16} className="text-theme-accent" />}
              </div>
              <p className="text-[11px] text-theme-muted leading-relaxed">
                All selected subjects run simultaneously under <strong>one unified countdown timer</strong>. Switch between subjects at any time during the test.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimingMode('one_by_one');
                setDurationMinutes(40);
              }}
              className={cn(
                "p-4 rounded-2xl border text-left space-y-2 transition-all relative overflow-hidden",
                timingMode === 'one_by_one'
                  ? "bg-theme-accent/10 border-theme-accent ring-2 ring-theme-accent/30 shadow-md"
                  : "bg-theme-bg border-theme-border hover:border-theme-muted text-theme-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-400" />
                  One-by-One Subject Practice
                </span>
                {timingMode === 'one_by_one' && <CheckCircle2 size={16} className="text-theme-accent" />}
              </div>
              <p className="text-[11px] text-theme-muted leading-relaxed">
                Practice <strong>one single subject at a time</strong> with dedicated subject timing (e.g. 40 minutes for 40 questions).
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: SUBJECT SELECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
              <BookOpen size={16} className="text-theme-accent" />
              <span>
                2. Select Subjects {isJamb ? `(${selectedSubjects.length}/4 Selected)` : `(${selectedSubjects.length} Selected)`}
              </span>
            </label>
            {isJamb && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                English is compulsory + pick 3 electives
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {availableSubjects.map((s) => {
              const isSelected = selectedSubjects.includes(s);
              const isLockedEnglish = isJamb && s === 'English';

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between gap-2 transition-all",
                    isSelected
                      ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                      : "bg-theme-bg border-theme-border text-theme-text hover:border-theme-muted",
                    isLockedEnglish && "opacity-90 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">{s}</span>
                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: PAPER FORMAT & CONTINUATION (FOR WAEC/NECO/GCE) */}
        {supportsTheory && (
          <div className="space-y-3 pt-2 border-t border-theme-border">
            <label className="block text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" />
              <span>3. Paper Format (Objectives vs. Theory)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaperFormat('objective')}
                className={cn(
                  "p-3 rounded-xl border text-left text-xs font-bold transition-all",
                  paperFormat === 'objective'
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-theme-bg border-theme-border text-theme-muted"
                )}
              >
                <span className="block font-black text-theme-text mb-0.5">Objectives Only</span>
                <span className="text-[10px] text-theme-muted">Paper 1 Multiple-Choice</span>
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('theory')}
                className={cn(
                  "p-3 rounded-xl border text-left text-xs font-bold transition-all",
                  paperFormat === 'theory'
                    ? "bg-purple-500/10 border-purple-500 text-purple-400"
                    : "bg-theme-bg border-theme-border text-theme-muted"
                )}
              >
                <span className="block font-black text-theme-text mb-0.5">Theory Only</span>
                <span className="text-[10px] text-theme-muted">Paper 2 Essay & Calculations</span>
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('both_continuation')}
                className={cn(
                  "p-3 rounded-xl border text-left text-xs font-bold transition-all",
                  paperFormat === 'both_continuation'
                    ? "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
                    : "bg-theme-bg border-theme-border text-theme-muted"
                )}
              >
                <span className="block font-black text-amber-400 mb-0.5 flex items-center gap-1">
                  <Coffee size={12} /> Full Continuation
                </span>
                <span className="text-[10px] text-theme-muted">Both Papers + 15m Break</span>
              </button>
            </div>

            {/* Continuation Settings (Order & Break Duration) */}
            {paperFormat === 'both_continuation' && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                      Starting Order
                    </label>
                    <select
                      value={continuationOrder}
                      onChange={(e) => setContinuationOrder(e.target.value as ContinuationOrder)}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
                    >
                      <option value="obj_first">Objectives First ➔ 15m Break ➔ Theory</option>
                      <option value="theory_first">Theory First ➔ 15m Break ➔ Objectives</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                      Intermission Break Duration (Min 15m)
                    </label>
                    <div className="flex gap-2">
                      {[15, 20, 25, 30].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setBreakDurationMinutes(m)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            breakDurationMinutes === m
                              ? "bg-amber-500 text-slate-950 border-amber-500 font-black"
                              : "bg-theme-bg border-theme-border text-theme-muted"
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-theme-muted italic">
                  💡 Just like Pomofocus, a countdown break of {breakDurationMinutes} minutes will trigger automatically between papers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: TIME LIMIT & PRACTICE MODE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-theme-border">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-theme-muted mb-1.5">
              Total Exam Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                className="w-24 px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text"
              />
              <span className="text-xs text-theme-muted">Minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-theme-muted mb-1.5">
              Practice Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPracticeMode('random')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  practiceMode === 'random'
                    ? "bg-theme-accent text-white border-theme-accent"
                    : "bg-theme-bg border-theme-border text-theme-muted"
                )}
              >
                Random Mock
              </button>

              <button
                type="button"
                onClick={() => setPracticeMode('yearly')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  practiceMode === 'yearly'
                    ? "bg-theme-accent text-white border-theme-accent"
                    : "bg-theme-bg border-theme-border text-theme-muted"
                )}
              >
                Past Year
              </button>
            </div>

            {/* Past Year Selection Pills */}
            {practiceMode === 'yearly' && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-theme-accent block">
                  Select Exam Year:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(availableYears && availableYears.length > 0 ? availableYears : STANDARD_NATIONAL_EXAM_YEARS).map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setSelectedYear(yr)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95",
                        selectedYear === yr
                          ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                          : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-theme-border">
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-98"
          >
            <span>Launch {examType} CBT Examination</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
