import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Clock, Layers, Sparkles, BookOpen, 
  ArrowRight, ShieldCheck, Flame, Coffee, FileText, 
  CheckCircle2, Check, AlertCircle, Calendar, Star, HelpCircle
} from 'lucide-react';
import { 
  Subject, ExamType, ExamTimingMode, 
  ExamPaperFormat, ContinuationOrder, ExamSessionConfig 
} from '../types';
import { cn } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';

interface CBTExamConfigPageProps {
  examType: ExamType;
  availableSubjects: Subject[];
  initialSubject?: Subject;
  availableYears?: number[];
  user: any;
  profile?: any;
  onLogout: () => void;
  onNavigateTo: (target: any) => void;
  onBack: () => void;
  onStartExam: (config: ExamSessionConfig) => void;
}

const ALL_COMMON_SUBJECTS: Subject[] = [
  'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'Geography', 'Commerce',
  'Accounting', 'Agricultural Science', 'Civic Education', 'Further Mathematics',
  'History', 'CRK', 'IRK'
];

export const CBTExamConfigPage: React.FC<CBTExamConfigPageProps> = ({
  examType,
  availableSubjects = [],
  initialSubject,
  availableYears = [2024, 2023, 2022, 2021, 2020],
  user,
  profile,
  onLogout,
  onNavigateTo,
  onBack,
  onStartExam
}) => {
  const isJamb = examType === 'JAMB';
  const supportsTheory = examType === 'WAEC' || examType === 'NECO' || examType === 'WAEC GCE' || examType === 'NECO GCE' || examType === 'Personal CBT';

  // Merge provided available subjects with common subjects if list is small
  const subjectPool: Subject[] = useMemo(() => {
    const list: Subject[] = availableSubjects.length > 0 ? [...availableSubjects] : [...ALL_COMMON_SUBJECTS];
    if (isJamb && !list.includes('English')) {
      return ['English', ...list];
    }
    return list;
  }, [availableSubjects, isJamb]);

  // State: Timing Mode
  const [timingMode, setTimingMode] = useState<ExamTimingMode>('merged');

  // State: Subjects Selection
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(() => {
    if (isJamb) {
      const defaults: Subject[] = ['English'];
      if (initialSubject && initialSubject !== 'English') {
        defaults.push(initialSubject);
      }
      // Add electives up to 4 total
      const electives: Subject[] = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics'];
      for (const el of electives) {
        if (defaults.length < 4 && !defaults.includes(el) && subjectPool.includes(el)) {
          defaults.push(el);
        }
      }
      return defaults;
    }
    return initialSubject ? [initialSubject] : [subjectPool[0] || 'Mathematics'];
  });

  // State: Starting Subject for Merged Mode
  const [startingSubject, setStartingSubject] = useState<Subject>(() => {
    return selectedSubjects[0] || 'English';
  });

  // State: Paper Format
  const [paperFormat, setPaperFormat] = useState<ExamPaperFormat>('objective');
  const [continuationOrder, setContinuationOrder] = useState<ContinuationOrder>('obj_first');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(15);

  // State: Duration
  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    if (isJamb) return 120; // Standard 2 hours
    return 60;
  });

  // State: Practice mode & Year
  const [practiceMode, setPracticeMode] = useState<'random' | 'yearly'>('random');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(availableYears[0] || 2024);

  // Handle subject toggle
  const toggleSubject = (s: Subject) => {
    if (timingMode === 'one_by_one') {
      setSelectedSubjects([s]);
      setStartingSubject(s);
      return;
    }

    if (isJamb) {
      if (s === 'English') return; // English is compulsory in JAMB
      if (selectedSubjects.includes(s)) {
        if (selectedSubjects.length > 2) {
          const next = selectedSubjects.filter(x => x !== s);
          setSelectedSubjects(next);
          if (startingSubject === s) {
            setStartingSubject(next[0] || 'English');
          }
        }
      } else {
        if (selectedSubjects.length >= 4) {
          // Replace last non-English subject
          const next = [...selectedSubjects.slice(0, 3), s];
          setSelectedSubjects(next);
        } else {
          setSelectedSubjects([...selectedSubjects, s]);
        }
      }
    } else {
      if (selectedSubjects.includes(s)) {
        if (selectedSubjects.length > 1) {
          const next = selectedSubjects.filter(x => x !== s);
          setSelectedSubjects(next);
          if (startingSubject === s) {
            setStartingSubject(next[0] || 'Mathematics');
          }
        }
      } else {
        setSelectedSubjects([...selectedSubjects, s]);
      }
    }
  };

  const handleLaunch = () => {
    if (isJamb && selectedSubjects.length !== 4) {
      alert(`JAMB requires exactly 4 subjects (English + 3 electives). You have selected ${selectedSubjects.length}/4.`);
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to proceed.");
      return;
    }

    // Ensure startingSubject is in selectedSubjects
    const finalStartingSubject = selectedSubjects.includes(startingSubject)
      ? startingSubject
      : selectedSubjects[0];

    onStartExam({
      examType,
      timingMode,
      subjects: selectedSubjects,
      startingSubject: finalStartingSubject,
      paperFormat,
      continuationOrder: paperFormat === 'both_continuation' ? continuationOrder : undefined,
      breakDurationMinutes: paperFormat === 'both_continuation' ? Math.max(15, breakDurationMinutes) : undefined,
      durationMinutes,
      practiceMode,
      selectedYear: practiceMode === 'yearly' ? selectedYear : undefined
    });
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-theme-card border-b border-theme-border sticky top-0 z-30 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarMenu user={user} profile={profile} onLogout={onLogout} onNavigate={onNavigateTo} />
          
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg hover:bg-theme-border text-theme-muted hover:text-theme-text border border-theme-border text-xs font-bold transition-all"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Change Exam</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                {examType} Examination
              </span>
              <span className="hidden sm:inline text-xs text-theme-muted">• Pre-Exam Setup</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-theme-text leading-tight">
              Configure Your CBT Mode & Schedule
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
            <CheckCircle2 size={14} />
            <span>Ready to Customize</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl space-y-6 sm:space-y-8">
        
        {/* STEP 1: EXAM TIMING MODE */}
        <section className="bg-theme-card rounded-3xl p-5 sm:p-7 border border-theme-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-theme-text leading-tight">
                  Choose Examination Timing Mode
                </h2>
                <p className="text-xs text-theme-muted">
                  Simulate the actual unified national test or focus on one subject at a time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Merged Mode Card */}
            <button
              type="button"
              onClick={() => {
                setTimingMode('merged');
                if (isJamb) setDurationMinutes(120);
                else setDurationMinutes(selectedSubjects.length * 35);
              }}
              className={cn(
                "p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3",
                timingMode === 'merged'
                  ? "border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/10 shadow-md"
                  : "border-theme-border bg-theme-bg hover:border-theme-muted text-theme-muted"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-xl",
                    timingMode === 'merged' ? "bg-amber-500 text-slate-950" : "bg-theme-card text-theme-muted"
                  )}>
                    <Flame size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-theme-text">Merged Time</h3>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      National Simulation
                    </span>
                  </div>
                </div>
                {timingMode === 'merged' && (
                  <CheckCircle2 size={20} className="text-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-theme-muted leading-relaxed">
                All chosen subjects run simultaneously under <strong>one unified countdown timer</strong>. Switch between subjects at any time during the test.
              </p>
            </button>

            {/* One-by-One Mode Card */}
            <button
              type="button"
              onClick={() => {
                setTimingMode('one_by_one');
                setDurationMinutes(40);
                if (selectedSubjects.length > 1) {
                  setSelectedSubjects([selectedSubjects[0]]);
                  setStartingSubject(selectedSubjects[0]);
                }
              }}
              className={cn(
                "p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3",
                timingMode === 'one_by_one'
                  ? "border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10 shadow-md"
                  : "border-theme-border bg-theme-bg hover:border-theme-muted text-theme-muted"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-xl",
                    timingMode === 'one_by_one' ? "bg-blue-500 text-white" : "bg-theme-card text-theme-muted"
                  )}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-theme-text">One-by-One Subject</h3>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Targeted Practice
                    </span>
                  </div>
                </div>
                {timingMode === 'one_by_one' && (
                  <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-theme-muted leading-relaxed">
                Practice <strong>one single subject</strong> with dedicated timing (e.g. 40 minutes for 40 questions). Ideal for mastering specific weak areas.
              </p>
            </button>
          </div>
        </section>

        {/* STEP 2: SUBJECT SELECTION */}
        <section className="bg-theme-card rounded-3xl p-5 sm:p-7 border border-theme-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-theme-text leading-tight">
                  Select Examination Subjects
                </h2>
                <p className="text-xs text-theme-muted">
                  {isJamb 
                    ? "JAMB UTME mandates English Language + exactly 3 elective subjects."
                    : timingMode === 'one_by_one'
                      ? "Choose the single subject you want to practice."
                      : "Choose the subjects included in your merged examination session."}
                </p>
              </div>
            </div>

            {isJamb && (
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto border",
                selectedSubjects.length === 4
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              )}>
                {selectedSubjects.length} / 4 Subjects Chosen
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {subjectPool.map((s) => {
              const isSelected = selectedSubjects.includes(s);
              const isLockedEnglish = isJamb && s === 'English';

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={cn(
                    "p-3 rounded-2xl border-2 text-xs font-bold text-left flex items-center justify-between gap-2 transition-all relative",
                    isSelected
                      ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                      : "bg-theme-bg border-theme-border text-theme-text hover:border-theme-muted",
                    isLockedEnglish && "opacity-95 ring-1 ring-amber-400"
                  )}
                >
                  <div className="truncate flex items-center gap-1.5">
                    {isLockedEnglish && <Star size={12} className="text-amber-300 shrink-0 fill-amber-300" />}
                    <span className="truncate">{s}</span>
                  </div>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* WHICH SUBJECT STARTS FIRST (FOR MERGED MODE) */}
          {timingMode === 'merged' && selectedSubjects.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-theme-border/60 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                  ★ Which Subject Starts First?
                </span>
                <span className="text-[11px] text-theme-muted">
                  (Choose which subject displays on screen when your test begins)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStartingSubject(s)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                      startingSubject === s
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                    )}
                  >
                    <span>{s}</span>
                    {startingSubject === s && <Check size={12} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* STEP 3: PAPER FORMAT (OBJECTIVE VS THEORY VS CONTINUATION) */}
        {supportsTheory && (
          <section className="bg-theme-card rounded-3xl p-5 sm:p-7 border border-theme-border shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-theme-text leading-tight">
                  Paper Format & Essay Continuation
                </h2>
                <p className="text-xs text-theme-muted">
                  Choose between multiple-choice objectives, theory essays, or full continuous exam.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaperFormat('objective')}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  paperFormat === 'objective'
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 ring-2 ring-emerald-500/20"
                    : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-theme-text">Objectives Only</span>
                  {paperFormat === 'objective' && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
                <p className="text-xs text-theme-muted">Paper 1 Multiple Choice questions only.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('theory')}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  paperFormat === 'theory'
                    ? "border-purple-500 bg-purple-500/5 text-purple-400 ring-2 ring-purple-500/20"
                    : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-theme-text">Theory / Essays</span>
                  {paperFormat === 'theory' && <CheckCircle2 size={16} className="text-purple-400" />}
                </div>
                <p className="text-xs text-theme-muted">Paper 2 Essay, calculations, and mathematical proofs.</p>
              </button>

              <button
                type="button"
                onClick={() => setPaperFormat('both_continuation')}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  paperFormat === 'both_continuation'
                    ? "border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/20 shadow-sm"
                    : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    <Coffee size={14} /> Full Continuation
                  </span>
                  {paperFormat === 'both_continuation' && <CheckCircle2 size={16} className="text-amber-400" />}
                </div>
                <p className="text-xs text-theme-muted">Both Papers + minimum 15-minute intermission break.</p>
              </button>
            </div>

            {/* Continuation Settings */}
            {paperFormat === 'both_continuation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-theme-text mb-1.5">
                      Starting Paper Order
                    </label>
                    <select
                      value={continuationOrder}
                      onChange={(e) => setContinuationOrder(e.target.value as ContinuationOrder)}
                      className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:border-amber-500"
                    >
                      <option value="obj_first">Objectives First ➔ 15m Break ➔ Theory</option>
                      <option value="theory_first">Theory First ➔ 15m Break ➔ Objectives</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-theme-text mb-1.5">
                      Intermission Break Duration (Min 15m)
                    </label>
                    <div className="flex gap-2">
                      {[15, 20, 25, 30].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setBreakDurationMinutes(m)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                            breakDurationMinutes === m
                              ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm"
                              : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-theme-muted italic flex items-center gap-1.5">
                  <Coffee size={14} className="text-amber-500 shrink-0" />
                  <span>
                    Between Paper 1 and Paper 2, a Pomofocus countdown timer will let you rest, hydrate, and stretch before tackling the next section.
                  </span>
                </p>
              </motion.div>
            )}
          </section>
        )}

        {/* STEP 4: TIME LIMIT & PRACTICE MODE */}
        <section className="bg-theme-card rounded-3xl p-5 sm:p-7 border border-theme-border shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
              {supportsTheory ? 4 : 3}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-theme-text leading-tight">
                Exam Duration & Year Selection
              </h2>
              <p className="text-xs text-theme-muted">
                Adjust total countdown timer and select whether to run random mock questions or a specific past year.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-theme-muted">
                Exam Countdown Duration
              </label>
              <div className="flex items-center gap-2">
                {[30, 45, 60, 90, 120, 180].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                      durationMinutes === m
                        ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Practice Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-theme-muted">
                Practice Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPracticeMode('random')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                    practiceMode === 'random'
                      ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                      : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
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
                      ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                      : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                  )}
                >
                  Past Year Exam
                </button>
              </div>
            </div>
          </div>

          {/* Past Year Pills */}
          {practiceMode === 'yearly' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-3 border-t border-theme-border/60 space-y-2"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-theme-muted block">
                Select Past Exam Year:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
                      selectedYear === yr
                        ? "bg-theme-accent text-white border-theme-accent shadow-sm"
                        : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text"
                    )}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* BOTTOM ACTION / START CBT BUTTON */}
        <div className="sticky bottom-4 z-20">
          <div className="bg-theme-card/95 backdrop-blur-md border border-theme-border rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-theme-text">Configuration:</span>
                <span className="text-amber-500 font-bold">
                  {examType} • {timingMode === 'merged' ? 'Merged Time' : 'One-by-One'}
                </span>
                <span className="text-theme-muted">• {selectedSubjects.length} Subject(s)</span>
                <span className="text-theme-muted">• {durationMinutes} Mins</span>
              </div>

              {timingMode === 'merged' && (
                <div className="text-xs text-theme-muted">
                  Starts with: <strong className="text-theme-text">{startingSubject}</strong>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/10 transition-all active:scale-98"
            >
              <span>Start {examType} CBT Exam</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
