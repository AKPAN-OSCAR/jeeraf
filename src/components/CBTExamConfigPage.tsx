import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Clock, Layers, Sparkles, BookOpen, 
  ArrowRight, ShieldCheck, Flame, Coffee, FileText, 
  CheckCircle2, Check, AlertCircle, Calendar, Star, HelpCircle,
  ArrowLeft, Upload, Camera, HelpCircleIcon
} from 'lucide-react';
import { 
  Subject, ExamType, ExamTimingMode, 
  ExamPaperFormat, ContinuationOrder, ExamSessionConfig,
  Question 
} from '../types';
import { cn, STANDARD_NATIONAL_EXAM_YEARS } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';

interface CBTExamConfigPageProps {
  examType: ExamType;
  availableSubjects: Subject[];
  initialSubject?: Subject;
  availableYears?: number[];
  questions?: Question[];
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
  availableYears = STANDARD_NATIONAL_EXAM_YEARS,
  questions = [],
  user,
  profile,
  onLogout,
  onNavigateTo,
  onBack,
  onStartExam
}) => {
  const isJamb = examType === 'JAMB';
  const supportsTheory = examType === 'WAEC' || examType === 'NECO' || examType === 'WAEC GCE' || examType === 'NECO GCE' || examType === 'Personal CBT';

  // Step Wizard State (Requirement 1: Split into distinct steps)
  // Step 1: Mode (Merged vs One-by-One)
  // Step 2: Subject Selection (One subject for One-by-One, 4 for JAMB, or custom for Merged)
  // Step 3: Exam Duration
  // Step 4: Practice Mode (Random vs Past Year) & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Subject pool
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
    return selectedSubjects[0] || (isJamb ? 'English' : 'Mathematics');
  });

  // State: Paper Format
  const [paperFormat, setPaperFormat] = useState<ExamPaperFormat>('objective');
  const [continuationOrder, setContinuationOrder] = useState<ContinuationOrder>('obj_first');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(5);

  // State: Duration
  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    if (isJamb) return 120; // 2 hours for standard JAMB
    return 60;
  });

  // Dynamically derive loaded past exam years with actual questions from the database
  const loadedExamYears = useMemo(() => {
    if (!questions || questions.length === 0) return availableYears;
    const targetSubjects = new Set(selectedSubjects.length > 0 ? selectedSubjects : (initialSubject ? [initialSubject] : []));
    const yearCounts = new Map<number, number>();
    
    questions.forEach(q => {
      if (q.examType === examType && q.year && (targetSubjects.size === 0 || (q.subject && targetSubjects.has(q.subject)))) {
        yearCounts.set(q.year, (yearCounts.get(q.year) || 0) + 1);
      }
    });

    const activeYears = Array.from(yearCounts.keys()).sort((a, b) => b - a);
    return activeYears.length > 0 ? activeYears : availableYears;
  }, [questions, examType, selectedSubjects, initialSubject, availableYears]);

  // State: Practice mode & Year
  const [practiceMode, setPracticeMode] = useState<'random' | 'yearly'>('random');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(() => loadedExamYears[0] || 2024);

  // Keep selectedYear synced when loadedExamYears updates
  useEffect(() => {
    if (loadedExamYears.length > 0 && (!selectedYear || !loadedExamYears.includes(selectedYear))) {
      setSelectedYear(loadedExamYears[0]);
    }
  }, [loadedExamYears]);

  // When switching timingMode, adjust default duration and selected subject
  const handleSelectTimingMode = (mode: ExamTimingMode) => {
    setTimingMode(mode);
    if (mode === 'one_by_one') {
      setDurationMinutes(40);
      // For one-by-one, select a single subject
      if (selectedSubjects.length > 1) {
        setSelectedSubjects([selectedSubjects[0]]);
        setStartingSubject(selectedSubjects[0]);
      } else if (selectedSubjects.length === 0) {
        setSelectedSubjects([subjectPool[0] || 'Mathematics']);
        setStartingSubject(subjectPool[0] || 'Mathematics');
      }
    } else {
      // Merged mode
      if (isJamb) {
        setDurationMinutes(120);
        // Ensure 4 subjects
        if (selectedSubjects.length < 4) {
          const defaults: Subject[] = ['English'];
          const electives: Subject[] = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics'];
          for (const el of electives) {
            if (defaults.length < 4 && !defaults.includes(el) && subjectPool.includes(el)) {
              defaults.push(el);
            }
          }
          setSelectedSubjects(defaults);
        }
      } else {
        setDurationMinutes(selectedSubjects.length * 35 || 60);
      }
    }
  };

  // Toggle subject in Step 2
  const handleToggleSubject = (s: Subject) => {
    if (timingMode === 'one_by_one') {
      // Single subject selection: replaces previous choice
      setSelectedSubjects([s]);
      setStartingSubject(s);
      return;
    }

    // Merged mode selection
    if (isJamb) {
      if (s === 'English') return; // English is compulsory
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
          // Replace last non-English elective
          const next = [...selectedSubjects.slice(0, 3), s];
          setSelectedSubjects(next);
        } else {
          setSelectedSubjects([...selectedSubjects, s]);
        }
      }
    } else {
      // WAEC / NECO Merged
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

  // Step 1 Validation & Next
  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleStep2Next = () => {
    if (timingMode === 'one_by_one') {
      if (selectedSubjects.length !== 1) {
        alert("Please select one subject to practice.");
        return;
      }
    } else {
      if (isJamb && selectedSubjects.length !== 4) {
        alert(`JAMB UTME mandates exactly 4 subjects (English + 3 electives). You have selected ${selectedSubjects.length}/4.`);
        return;
      }
      if (selectedSubjects.length === 0) {
        alert("Please select at least one subject.");
        return;
      }
    }
    setCurrentStep(3);
  };

  // Step 3 Validation & Next
  const handleStep3Next = () => {
    if (durationMinutes <= 0) {
      alert("Please select a valid exam duration.");
      return;
    }
    setCurrentStep(4);
  };

  // Step 4 Final Launch
  const handleLaunchExam = () => {
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
      breakDurationMinutes: paperFormat === 'both_continuation' ? Math.max(5, breakDurationMinutes) : undefined,
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
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-bg hover:bg-theme-border text-theme-muted hover:text-theme-text border border-theme-border text-xs font-bold transition-all active:scale-95"
          >
            <ChevronLeft size={16} />
            <span>{currentStep === 1 ? 'Change Exam' : 'Back'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                {examType} Examination
              </span>
              <span className="hidden sm:inline text-xs text-theme-muted">• Configuration Wizard</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-theme-text leading-tight">
              {currentStep === 1 && "Step 1: Choose CBT Timing Mode"}
              {currentStep === 2 && "Step 2: Choose Subject(s)"}
              {currentStep === 3 && "Step 3: Set Exam Duration"}
              {currentStep === 4 && "Step 4: Practice Mode & Launch"}
            </h1>
          </div>
        </div>

        {/* Wizard Step Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {[
            { num: 1, label: 'Mode' },
            { num: 2, label: 'Subjects' },
            { num: 3, label: 'Duration' },
            { num: 4, label: 'Start' }
          ].map(s => (
            <div 
              key={s.num}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-black transition-all",
                currentStep === s.num
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                  : currentStep > s.num
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-theme-bg text-theme-muted border-theme-border opacity-50"
              )}
            >
              <span>{s.num}</span>
              <span className="hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Wizard Flow Container */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-3xl space-y-6 sm:space-y-8 flex flex-col justify-between">
        
        {/* ========================================================================= */}
        {/* STEP 1: CONFIGURE CBT MODE ONLY (Merged vs One-by-One) with Next Button */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="space-y-6"
          >
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-sm space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Step 1 of 4: Examination Mode
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-theme-text">
                  Choose Examination Timing Mode
                </h2>
                <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                  Select whether you want to simulate the unified national examination with all subjects combined, or focus exclusively on one subject at a time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Merged Mode Card */}
                <button
                  type="button"
                  onClick={() => handleSelectTimingMode('merged')}
                  className={cn(
                    "p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between gap-4 active:scale-99",
                    timingMode === 'merged'
                      ? "border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/15 shadow-md"
                      : "border-theme-border bg-theme-bg hover:border-theme-muted text-theme-muted"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-2xl shadow-sm",
                        timingMode === 'merged' ? "bg-amber-500 text-slate-950 font-black" : "bg-theme-card text-theme-muted"
                      )}>
                        <Flame size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-theme-text">Merged Time</h3>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          National Simulation
                        </span>
                      </div>
                    </div>
                    {timingMode === 'merged' && (
                      <CheckCircle2 size={24} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Runs all {isJamb ? '4 JAMB subjects' : 'chosen subjects'} under <strong>one unified countdown clock</strong>. Switch between subjects whenever you want during the test.
                  </p>
                </button>

                {/* One-by-One Subject Card */}
                <button
                  type="button"
                  onClick={() => handleSelectTimingMode('one_by_one')}
                  className={cn(
                    "p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between gap-4 active:scale-99",
                    timingMode === 'one_by_one'
                      ? "border-blue-500 bg-blue-500/10 ring-4 ring-blue-500/15 shadow-md"
                      : "border-theme-border bg-theme-bg hover:border-theme-muted text-theme-muted"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-2xl shadow-sm",
                        timingMode === 'one_by_one' ? "bg-blue-500 text-white font-black" : "bg-theme-card text-theme-muted"
                      )}>
                        <Layers size={22} />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-theme-text">One-by-One</h3>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          Single Subject Practice
                        </span>
                      </div>
                    </div>
                    {timingMode === 'one_by_one' && (
                      <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Practice <strong>only one selected subject</strong> with independent timing (e.g. 40 minutes for 40 questions). Ideal for mastering specific subject topics.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 1 Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStep1Next}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition-all active:scale-98"
              >
                <span>Next: Choose Subject(s)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SUBJECT SELECTION SCREEN (1 for One-by-One, 4 for JAMB / Merged) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-border/60">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Step 2 of 4: Subject Selection
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-theme-text">
                    {timingMode === 'one_by_one' ? 'Select Single Subject' : 'Select Examination Subjects'}
                  </h2>
                  <p className="text-xs sm:text-sm text-theme-muted">
                    {timingMode === 'one_by_one'
                      ? 'Select the single subject you want to practice for this session.'
                      : isJamb
                        ? 'JAMB UTME mandates English Language + 3 elective subjects (4 total).'
                        : 'Select the subjects included in your merged examination session.'}
                  </p>
                </div>

                <div className="self-start sm:self-auto">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5",
                    timingMode === 'one_by_one'
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : selectedSubjects.length === (isJamb ? 4 : selectedSubjects.length)
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                  )}>
                    {timingMode === 'one_by_one' ? (
                      <span>1 Subject Selected: {selectedSubjects[0] || 'None'}</span>
                    ) : (
                      <span>{selectedSubjects.length} / {isJamb ? 4 : 'Any'} Chosen</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Subject Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {subjectPool.map((s) => {
                  const isSelected = selectedSubjects.includes(s);
                  const isLockedEnglish = isJamb && s === 'English' && timingMode === 'merged';

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleToggleSubject(s)}
                      className={cn(
                        "p-3.5 rounded-2xl border-2 text-xs font-bold text-left flex items-center justify-between gap-2 transition-all relative active:scale-98",
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md ring-2 ring-amber-500/30"
                          : "bg-theme-bg border-theme-border text-theme-text hover:border-theme-muted",
                        isLockedEnglish && "ring-1 ring-amber-400"
                      )}
                    >
                      <div className="truncate flex items-center gap-1.5">
                        {isLockedEnglish && <Star size={12} className="text-slate-950 shrink-0 fill-slate-950" />}
                        <span className="truncate">{s}</span>
                      </div>
                      {isSelected && <Check size={16} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* WHICH STARTS FIRST SELECTOR (FOR MERGED MODE) */}
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
                      (Choose which subject displays on screen when your live test begins)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStartingSubject(s)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95",
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

              {/* Paper Format (Objectives vs Theory vs Both with Break) for WAEC/NECO */}
              {supportsTheory && (
                <div className="pt-4 border-t border-theme-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 block">
                      Paper Format Selection:
                    </span>
                    <span className="text-[10px] text-theme-muted font-bold">
                      National Exam Standard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaperFormat('objective')}
                      className={cn(
                        "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 active:scale-98",
                        paperFormat === 'objective'
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20"
                          : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-theme-text">Objectives Only</span>
                        {paperFormat === 'objective' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      <span className="text-[11px] text-theme-muted">Paper 1 Multiple Choice questions only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaperFormat('theory')}
                      className={cn(
                        "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 active:scale-98",
                        paperFormat === 'theory'
                          ? "border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/20"
                          : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-theme-text">Theory / Essays</span>
                        {paperFormat === 'theory' && <CheckCircle2 size={16} className="text-purple-400" />}
                      </div>
                      <span className="text-[11px] text-theme-muted">Paper 2 Essay questions, answer inbox & rough sheet uploads</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaperFormat('both_continuation')}
                      className={cn(
                        "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 active:scale-98",
                        paperFormat === 'both_continuation'
                          ? "border-amber-500 bg-amber-500/15 text-amber-400 ring-2 ring-amber-500/30 shadow-sm"
                          : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-400 flex items-center gap-1">
                          <Coffee size={14} />
                          <span>Both Obj & Theory</span>
                        </span>
                        {paperFormat === 'both_continuation' && <CheckCircle2 size={16} className="text-amber-400" />}
                      </div>
                      <span className="text-[11px] text-theme-muted">Write both with at least 5-minute break in between</span>
                    </button>
                  </div>

                  {/* Both Objectives & Theory Break Configuration (Requirement 4) */}
                  {paperFormat === 'both_continuation' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 pt-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-theme-text mb-1.5">
                            Order of Papers:
                          </label>
                          <select
                            value={continuationOrder}
                            onChange={(e) => setContinuationOrder(e.target.value as ContinuationOrder)}
                            className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:border-amber-500"
                          >
                            <option value="obj_first">Objectives First ➔ Break ➔ Theory</option>
                            <option value="theory_first">Theory First ➔ Break ➔ Objectives</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-theme-text mb-1.5">
                            Intermission Break Duration (Min 5 Mins):
                          </label>
                          <div className="flex gap-1.5">
                            {[5, 10, 15, 20, 30].map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setBreakDurationMinutes(m)}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95",
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
                          After completing whichever section was written first, a relaxed {breakDurationMinutes}-minute intermission timer allows you to refresh before starting the second section.
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons for Step 2 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-4 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition-all active:scale-98"
              >
                <span>Next: Exam Duration</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: EXAM DURATION SCREEN (Countdown timer setting) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-sm space-y-6">
              <div className="space-y-1.5 pb-3 border-b border-theme-border/60">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Step 3 of 4: Exam Duration
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-theme-text">
                  Set Examination Countdown Timer
                </h2>
                <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                  Choose how much time you want for this examination session. The unified timer counts down live on screen.
                </p>
              </div>

              {/* Duration Presets */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-theme-muted block">
                  Select Timer Duration:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {(timingMode === 'one_by_one' 
                    ? [20, 30, 40, 50, 60, 90]
                    : [60, 90, 120, 150, 180, 210]
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={cn(
                        "py-3.5 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 active:scale-95",
                        durationMinutes === m
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-500/30"
                          : "bg-theme-bg border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-card"
                      )}
                    >
                      <span className="text-base sm:text-lg">{m}</span>
                      <span className="text-[10px] uppercase opacity-75">Mins</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informational Callout */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <Clock size={22} className="text-amber-500 shrink-0" />
                <p className="text-xs text-theme-muted leading-relaxed">
                  {timingMode === 'merged' && isJamb && durationMinutes === 120 ? (
                    <span><strong>Official JAMB UTME Standard:</strong> 120 minutes (2 Hours) for 4 subjects.</span>
                  ) : (
                    <span>Timer will start counting down as soon as you enter the live CBT exam page.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Navigation Buttons for Step 3 */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-4 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleStep3Next}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition-all active:scale-98"
              >
                <span>Next: Practice Mode</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PRACTICE MODE (Random Mock vs Past Year) & FINAL START BUTTON */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-sm space-y-6">
              <div className="space-y-1.5 pb-3 border-b border-theme-border/60">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Step 4 of 4: Practice Mode & Final Verification
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-theme-text">
                  Choose Question Practice Mode
                </h2>
                <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                  Select whether to generate a random syllabus mock exam or practice questions from a specific past year series.
                </p>
              </div>

              {/* Random vs Past Year Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPracticeMode('random')}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 active:scale-98",
                    practiceMode === 'random'
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-sm"
                      : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-theme-text">Random Mock Exam</span>
                    {practiceMode === 'random' && <CheckCircle2 size={20} className="text-amber-500" />}
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Pulls authentic questions randomly across topics to test overall readiness.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPracticeMode('yearly')}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 active:scale-98",
                    practiceMode === 'yearly'
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-sm"
                      : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-theme-text">Past Year Exam</span>
                    {practiceMode === 'yearly' && <CheckCircle2 size={20} className="text-amber-500" />}
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Practice the exact series of questions from a specific historical year.
                  </p>
                </button>
              </div>

              {/* Past Year Selection Pills */}
              {practiceMode === 'yearly' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-2xl bg-theme-bg border border-theme-border space-y-2.5"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 block">
                    Select Exam Year:
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {loadedExamYears.map(yr => {
                      const qsCount = questions ? questions.filter(q => 
                        q.examType === examType && 
                        q.year === yr && 
                        (selectedSubjects.length === 0 || selectedSubjects.includes(q.subject))
                      ).length : 0;

                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setSelectedYear(yr)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black border transition-all active:scale-95 flex items-center gap-1.5",
                            selectedYear === yr
                              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                              : "bg-theme-card border-theme-border text-theme-muted hover:text-theme-text"
                          )}
                        >
                          <span>{yr}</span>
                          {qsCount > 0 && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                              selectedYear === yr ? "bg-slate-950/20 text-slate-950" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            )}>
                              {qsCount} Qs
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Final Summary Card Before Launch */}
              <div className="p-4 sm:p-5 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted block">
                  Exam Summary Configuration:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-theme-muted block">Exam:</span>
                    <strong className="text-theme-text font-black">{examType}</strong>
                  </div>
                  <div>
                    <span className="text-theme-muted block">Mode:</span>
                    <strong className="text-amber-500 font-bold">{timingMode === 'merged' ? 'Merged Time' : 'One-by-One'}</strong>
                  </div>
                  <div>
                    <span className="text-theme-muted block">Subjects:</span>
                    <strong className="text-theme-text font-bold">{selectedSubjects.length} Subject(s)</strong>
                  </div>
                  <div>
                    <span className="text-theme-muted block">Duration:</span>
                    <strong className="text-theme-text font-bold">{durationMinutes} Mins</strong>
                  </div>
                </div>

                {timingMode === 'merged' && (
                  <div className="text-xs text-theme-muted pt-2 border-t border-theme-border/60">
                    First subject displayed: <strong className="text-theme-text">{startingSubject}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons for Step 4 (Back & START EXAM BUTTON) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-4 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleLaunchExam}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 shadow-2xl shadow-amber-500/20 transition-all active:scale-98"
              >
                <span>Start {examType} CBT Exam</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};
