import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Clock, Play, TrendingUp, Atom, FlaskConical, 
  Calculator, Brain, Globe, Landmark, ScrollText, Wallet, Boxes, 
  Heart, Star, BookText, Wheat, ShieldCheck, Sigma, History as HistoryIcon, 
  Languages, MessageSquare, Book, FileText, ChevronLeft, ArrowRight,
  Calendar, Sliders
} from 'lucide-react';
import { Subject, ExamType, Question, ExamSessionConfig } from '../types';
import { cn, getStandardLimit, STANDARD_NATIONAL_EXAM_YEARS } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';
import { SubjectGuide } from './SubjectGuide';
import { ExamSetupModal } from './ExamSetupModal';
import { subjectGuides } from '../data/subjectGuides';
import { questions as staticQuestions } from '../data/questions';
import { JeeRafHeadIcon } from './AIAvatar';

interface DashboardProps {
  user: any;
  profile?: any;
  examType: ExamType | null;
  defaultDuration?: number;
  availableQuestions?: Question[];
  adminQuestions?: Question[];
  onStart: (subject: Subject, time: number, practiceMode: 'yearly' | 'random', selectedYear?: number) => void;
  onStartAdvanced?: (config: ExamSessionConfig) => void;
  onLogout: () => void;
  onViewProgress: () => void;
  onNavigateTo: (target: 'dashboard' | 'textbooks' | 'exam_select' | 'cbt_config' | 'progress' | 'admin_console' | 'subscription_portal' | 'fun' | 'blog' | 'awards' | 'system_ai' | 'browser') => void;
  onChangeExamType: () => void;
}

const subjectMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  'English': { icon: <BookOpen />, color: 'bg-blue-500' },
  'Mathematics': { icon: <Calculator />, color: 'bg-red-500' },
  'Physics': { icon: <Atom />, color: 'bg-purple-500' },
  'Chemistry': { icon: <FlaskConical />, color: 'bg-green-500' },
  'Biology': { icon: <Brain />, color: 'bg-emerald-500' },
  'Geography': { icon: <Globe />, color: 'bg-indigo-500' },
  'Government': { icon: <Landmark />, color: 'bg-slate-500' },
  'Economics': { icon: <TrendingUp />, color: 'bg-orange-500' },
  'Literature': { icon: <ScrollText />, color: 'bg-pink-500' },
  'Commerce': { icon: <Wallet />, color: 'bg-cyan-500' },
  'Accounting': { icon: <Boxes />, color: 'bg-stone-500' },
  'Agricultural Science': { icon: <Wheat />, color: 'bg-green-600' },
  'Civic Education': { icon: <ShieldCheck />, color: 'bg-blue-700' },
  'Further Mathematics': { icon: <Sigma />, color: 'bg-red-700' },
  'History': { icon: <HistoryIcon />, color: 'bg-brown-500' },
  'CRK': { icon: <Heart />, color: 'bg-amber-500' },
  'IRK': { icon: <Star />, color: 'bg-yellow-500' },
  'Yoruba': { icon: <Languages />, color: 'bg-orange-600' },
  'Hausa': { icon: <Languages />, color: 'bg-red-400' },
  'Igbo': { icon: <Languages />, color: 'bg-emerald-400' },
  'French': { icon: <MessageSquare />, color: 'bg-blue-300' },
  'General': { icon: <BookText />, color: 'bg-gray-500' },
};

const timeOptions = [
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes', value: 60 },
  { label: '90 Minutes', value: 90 },
  { label: '120 Minutes', value: 120 },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, profile, examType, defaultDuration = 60, availableQuestions = [], adminQuestions = [], onStart, onStartAdvanced, onLogout, onViewProgress, onNavigateTo, onChangeExamType }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTime, setSelectedTime] = useState<number>(defaultDuration);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'yearly' | 'random'>('random');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Dynamically extract available years for the selected subject and examType
  const subjectQuestionsForYears = React.useMemo(() => {
    const set = new Set<number>();
    if (!selectedSubject || !examType) return set;
    const combined = [...staticQuestions, ...adminQuestions];
    combined.forEach(q => {
      if (q.subject === selectedSubject && q.examType === examType && q.year) {
        set.add(q.year);
      }
    });
    return set;
  }, [selectedSubject, examType, adminQuestions]);

  const availableYears = React.useMemo(() => {
    const combined = [...staticQuestions, ...adminQuestions];
    const subjectQs = selectedSubject && examType 
      ? combined.filter(q => q.subject === selectedSubject && q.examType === examType)
      : [];
    const loadedYears = Array.from(new Set(subjectQs.map(q => q.year).filter(Boolean))) as number[];
    if (loadedYears.length > 0) {
      return loadedYears.sort((a, b) => b - a); // Return only years with real questions
    }
    // If no specific past year is loaded for this subject, provide default fallback
    return [];
  }, [selectedSubject, examType, adminQuestions]);

  // Sync default selected year
  useEffect(() => {
    if (availableYears.length > 0) {
      // Prioritize the latest loaded year if one exists, otherwise top year
      const firstLoaded = availableYears.find(y => subjectQuestionsForYears.has(y));
      setSelectedYear(firstLoaded || availableYears[0]);
    } else {
      setSelectedYear(null);
    }
  }, [availableYears, subjectQuestionsForYears]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const trialDaysLeft = React.useMemo(() => {
    if (!profile?.trialExpiresAt || profile?.isPremium) return null;
    const expires = new Date(profile.trialExpiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [profile]);

  // Determine which subjects to show
  const filteredSubjects = React.useMemo(() => {
    if (examType === 'Personal CBT' && availableQuestions.length > 0) {
      const distinctSubjects = Array.from(new Set(availableQuestions.map(q => q.subject)));
      return distinctSubjects.map(name => ({
        name,
        ...(subjectMeta[name] || subjectMeta['General']),
        count: availableQuestions.filter(q => q.subject === name).length
      }));
    }
    
    // All standard subjects for JAMB, WAEC, NECO, etc.
    const allSubjects: Subject[] = [
      'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'Economics', 'Government', 'Literature', 'Geography', 'Commerce', 
      'Accounting', 'Agricultural Science', 'Civic Education', 'Further Mathematics', 
      'History', 'CRK', 'IRK', 'Yoruba', 'Hausa', 'Igbo', 'French'
    ];

    return allSubjects.map(name => {
      const staticCount = staticQuestions.filter(q => q.subject === name && q.examType === examType).length;
      const dynamicCount = adminQuestions.filter(q => q.subject === name && q.examType === examType).length;
      return {
        name,
        ...(subjectMeta[name] || subjectMeta['General']),
        count: staticCount + dynamicCount
      };
    });
  }, [examType, availableQuestions, adminQuestions]);

  const handleStartFinal = () => {
    if (selectedSubject) {
      onStart(selectedSubject, selectedTime, practiceMode, selectedYear || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col text-theme-text transition-colors duration-300">
      <header className="bg-theme-card border-b border-theme-border px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <SidebarMenu 
            user={user} 
            profile={profile}
            onLogout={onLogout} 
            onNavigate={(target) => {
              onNavigateTo(target);
            }}
          />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center shadow-sm shrink-0">
              <JeeRafHeadIcon className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-theme-text leading-tight tracking-tight">JeeRaf CBT</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent bg-theme-accent/10 px-2 py-1 rounded-md border border-theme-accent/20 shadow-sm">
                  {examType || 'Practice'}
                </span>
                <button 
                  onClick={onChangeExamType}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-theme-accent rounded-md shadow-md hover:opacity-90 transition-all flex items-center gap-1"
                >
                  Change Type
                </button>
                <button 
                  onClick={() => onNavigateTo('dashboard')}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-theme-text bg-theme-bg border border-theme-border rounded-md hover:border-theme-accent transition-all"
                >
                  Main Directory
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onViewProgress}
            className="flex items-center gap-2 px-4 py-2 bg-theme-accent/10 text-theme-accent rounded-xl font-semibold hover:bg-theme-accent/20 transition-colors"
          >
            <TrendingUp size={18} />
            <span className="hidden sm:inline">My Progress</span>
          </button>
          <div className="text-right hidden sm:block">
            <div className="flex flex-col items-end">
              <p className="text-sm font-bold text-theme-text leading-none mb-1.5">{profile?.nickname || user.email}</p>
              {profile?.isPremium ? (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-500">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                    Premium Active
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
                    profile?.subscriptionStatus === 'pending' 
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse" 
                      : profile?.subscriptionStatus === 'rejected'
                        ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                        : "text-orange-500 bg-orange-500/10 border-orange-500/20"
                  )}>
                    {profile?.subscriptionStatus === 'pending' 
                      ? 'Verification Pending' 
                      : profile?.subscriptionStatus === 'rejected'
                        ? 'Payment Rejected'
                        : 'Free Trial Mode'}
                  </span>
                  {trialDaysLeft !== null && (
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md",
                      trialDaysLeft <= 3 ? "text-rose-500 bg-rose-500/10 border border-rose-500/20" : "text-theme-muted bg-theme-bg border border-theme-border"
                    )}>
                      {trialDaysLeft <= 0 ? 'Trial Expired' : `${trialDaysLeft} days remaining`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <AnimatePresence mode="wait">
          {!selectedSubject ? (
            <motion.div
              key="subject-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
            {!profile?.isPremium && (
                <div className="mb-8 p-6 bg-theme-accent/5 rounded-3xl border border-theme-accent/10 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-theme-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-theme-accent/10 transition-all duration-700" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-theme-accent/10 rounded-2xl flex items-center justify-center text-theme-accent">
                      <Star size={32} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-theme-text leading-tight">
                        {profile?.subscriptionStatus === 'pending' ? 'Verification in Progress' : 'JeeRaf Premium Trial'}
                      </h3>
                      <p className="text-sm text-theme-muted">
                        {profile?.subscriptionStatus === 'pending' 
                          ? 'We are verifying your payment receipt. You will be upgraded soon.' 
                          : 'Get unlimited access to all subjects, textbook guides, and mock exams.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
                    <div className="text-center sm:text-right px-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-0.5">Status</p>
                      <p className="text-xl font-black text-theme-accent leading-none">
                        {profile?.subscriptionStatus === 'pending' ? 'PENDING' : (trialDaysLeft ?? 0)}
                      </p>
                      {profile?.subscriptionStatus !== 'pending' && <p className="text-[9px] text-theme-muted font-bold">DAYS LEFT</p>}
                    </div>
                    {profile?.subscriptionStatus !== 'pending' && (
                      <button 
                        onClick={() => onNavigateTo('subscription_portal')}
                        className="w-full sm:w-auto px-8 py-4 bg-theme-accent text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-theme-accent/20 active:scale-95 whitespace-nowrap"
                      >
                        Upgrade Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* National Exam Merged Timing & Continuation Simulation Card */}
              {examType && examType !== 'Personal CBT' && (
                <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                        National Exam Simulator
                      </span>
                      <span className="text-xs text-theme-muted font-bold">
                        {examType === 'JAMB' ? 'Strict 4-Subject Merged CBT' : 'Merged / Theory Continuation'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-theme-text">
                      {examType === 'JAMB' ? 'JAMB 4-Subject Merged CBT Mock' : `${examType} Merged Timing & Theory Continuation Mock`}
                    </h3>
                    <p className="text-xs text-theme-muted max-w-xl">
                      {examType === 'JAMB'
                        ? 'Simulate the authentic JAMB hall: All 4 subjects running simultaneously under one combined master timer with instant subject switcher tabs.'
                        : 'Choose between Objectives only, Theory only, or the full Continuation session with an authentic 15-minute Pomofocus break between papers.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateTo('cbt_config')}
                    className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all shrink-0 active:scale-95"
                  >
                    <span>Configure Merged / Continuation Exam</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-3xl font-black text-theme-text leading-tight mb-2 tracking-tight">
                  Welcome, <span className="text-theme-accent">{profile?.nickname || 'Scholar'}</span>
                </h2>
                <p className="text-theme-muted font-medium">Select a subject to begin your <span className="text-theme-accent font-bold">{examType}</span> practice.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredSubjects.map((sub) => {
                  const isAdmin = profile?.role === 'admin' || user?.email === 'eemmpatech@gmail.com';
                  return (
                    <button
                      key={sub.name}
                      onClick={() => handleSubjectSelect(sub.name as Subject)}
                      className="relative p-6 rounded-[2.5rem] bg-theme-card border border-theme-border shadow-xl shadow-theme-accent/5 hover:shadow-2xl transition-all text-center group overflow-hidden"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-4 mx-auto transition-transform group-hover:scale-110 shadow-lg",
                        sub.color
                      )}>
                        {sub.icon && React.cloneElement(sub.icon as any, { size: 28, className: "text-white" })}
                      </div>
                      <h4 className="font-bold text-theme-text text-sm leading-tight mb-1">{sub.name}</h4>
                      {isAdmin && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="text-[10px] font-black text-theme-accent bg-theme-bg px-2 py-1 rounded-md border border-theme-border">
                            {sub.count} Qs
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                        <ArrowRight size={16} className="text-theme-accent" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exam-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-2 text-theme-muted font-bold text-sm mb-8 hover:text-theme-text transition-colors"
              >
                <ChevronLeft size={20} />
                Back to Subjects
              </button>

              <div className="bg-theme-card rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-theme-accent/5 border border-theme-border overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-theme-bg/50 rounded-full -mr-32 -mt-32 z-0" />
                
                <div className="relative z-10 text-theme-text">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl",
                        subjectMeta[selectedSubject]?.color || 'bg-theme-accent'
                      )}>
                        {selectedSubject[0]}
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-accent mb-1">Subject Selected</div>
                        <h2 className="text-4xl font-black text-theme-text tracking-tight">{selectedSubject}</h2>
                      </div>
                    </div>

                    {subjectGuides[selectedSubject] && (
                      <button
                        onClick={() => setIsGuideOpen(true)}
                        className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-sm hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                      >
                        <BookOpen size={20} />
                        Read {selectedSubject} Textbook
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Setup Options Column */}
                    <div className="space-y-10">
                      <section className="space-y-6">
                        <h3 className="text-lg font-black text-theme-text flex items-center gap-2">
                          <Clock size={20} className="text-theme-accent" />
                          Setup Duration
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3">
                          {timeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setSelectedTime(opt.value)}
                              className={cn(
                                "p-4 rounded-2xl border-2 font-black transition-all text-left flex items-center justify-between group text-sm",
                                selectedTime === opt.value
                                  ? "border-theme-accent bg-theme-accent/10 text-theme-accent"
                                  : "border-theme-bg bg-theme-bg text-theme-muted hover:border-theme-border"
                              )}
                            >
                              <span>{opt.label}</span>
                              {selectedTime === opt.value && <div className="w-2 h-2 bg-theme-accent rounded-full" />}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h3 className="text-lg font-black text-theme-text flex items-center gap-2">
                          <FileText size={20} className="text-theme-accent" />
                          Exam Instructions
                        </h3>
                        <div className="bg-theme-bg/50 rounded-3xl p-6 border border-theme-border">
                          <ul className="space-y-4 text-sm font-medium text-theme-muted">
                            <li className="flex gap-3">
                              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
                              <span>Total of <strong className="text-theme-text">{examType === 'Personal CBT' 
                                ? (filteredSubjects.find(s => s.name === selectedSubject)?.count || 0) 
                                : getStandardLimit(examType, selectedSubject)} questions</strong> will be presented.</span>
                            </li>
                            <li className="flex gap-3">
                              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
                              <span>Timer starts immediately upon clicking start.</span>
                            </li>
                            <li className="flex gap-3">
                              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
                              <span>System auto-submits when time expires.</span>
                            </li>
                          </ul>
                        </div>
                      </section>
                    </div>

                    {/* Practice Mode Column */}
                    {examType !== 'Personal CBT' && (
                      <div className="space-y-8 border-t md:border-t-0 md:border-l border-theme-border/30 pt-8 md:pt-0 md:pl-8">
                        <section className="space-y-6">
                          <h3 className="text-lg font-black text-theme-text flex items-center gap-2">
                            <Sliders size={20} className="text-theme-accent" />
                            Select Practice Mode
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <button
                              type="button"
                              onClick={() => setPracticeMode('random')}
                              className={cn(
                                "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                                practiceMode === 'random'
                                  ? "border-theme-accent bg-theme-accent/5"
                                  : "border-theme-border hover:border-theme-accent/30 bg-theme-bg"
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-theme-text text-sm">Random Practice (Curriculum Based)</h4>
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                  practiceMode === 'random' ? "border-theme-accent" : "border-theme-border"
                                )}>
                                  {practiceMode === 'random' && <div className="w-2.5 h-2.5 bg-theme-accent rounded-full" />}
                                </div>
                              </div>
                              <p className="text-xs text-theme-muted leading-relaxed">
                                Randomly shuffles and selects questions across different years following the approved syllabus/curriculum.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPracticeMode('yearly')}
                              className={cn(
                                "p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                                practiceMode === 'yearly'
                                  ? "border-theme-accent bg-theme-accent/5"
                                  : "border-theme-border hover:border-theme-accent/30 bg-theme-bg"
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-theme-text text-sm">Yearly Exam (Past Questions)</h4>
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                  practiceMode === 'yearly' ? "border-theme-accent" : "border-theme-border"
                                )}>
                                  {practiceMode === 'yearly' && <div className="w-2.5 h-2.5 bg-theme-accent rounded-full" />}
                                </div>
                              </div>
                              <p className="text-xs text-theme-muted leading-relaxed">
                                Practice real exam papers exactly as they were operated yearly in past national examinations.
                              </p>
                            </button>
                          </div>
                        </section>

                        <AnimatePresence mode="wait">
                          {practiceMode === 'yearly' && (
                            <motion.section
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4 overflow-hidden"
                            >
                              <h4 className="text-sm font-black text-theme-text flex items-center gap-2">
                                <Calendar size={16} className="text-theme-accent" />
                                Select Past Year Exam
                              </h4>
                              {availableYears.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                                  {availableYears.map((year) => {
                                    const isReady = subjectQuestionsForYears.has(year);
                                    return (
                                      <button
                                        key={year}
                                        type="button"
                                        onClick={() => setSelectedYear(year)}
                                        className={cn(
                                          "py-2.5 px-2 rounded-xl border-2 font-black transition-all text-center text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5",
                                          selectedYear === year
                                            ? "border-theme-accent bg-theme-accent text-white shadow-sm"
                                            : "border-theme-border bg-theme-bg text-theme-muted hover:border-theme-muted hover:text-theme-text"
                                        )}
                                      >
                                        <span>{year}</span>
                                        {isReady && (
                                          <span className={cn(
                                            "text-[9px] px-1.5 py-0.2 rounded-full font-bold",
                                            selectedYear === year ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          )}>
                                            Ready
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 rounded-2xl border border-dashed border-theme-border text-center text-xs text-theme-muted font-bold bg-theme-bg/30">
                                  No past years are currently loaded for this subject. Defaulting to curriculum practice.
                                </div>
                              )}
                            </motion.section>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-8 border-t border-theme-border flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartFinal}
                      className="flex-1 bg-theme-accent text-white rounded-[2rem] py-5 font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-theme-accent/20 flex items-center justify-center gap-3 group"
                    >
                      <Play size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                      Start {selectedSubject} (One-by-One)
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTo('cbt_config')}
                      className="px-6 py-5 bg-theme-bg hover:bg-theme-card border-2 border-theme-border hover:border-theme-accent text-theme-text rounded-[2rem] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <span>Configure Full Exam & Merged Timing</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {selectedSubject && (
        <SubjectGuide 
          subject={selectedSubject} 
          isOpen={isGuideOpen} 
          onClose={() => setIsGuideOpen(false)} 
        />
      )}

      {/* Advanced Pre-Exam Options & Merged / Continuation Setup Modal */}
      {examType && isSetupModalOpen && (
        <ExamSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          examType={examType}
          availableSubjects={filteredSubjects.map(s => s.name as Subject)}
          initialSubject={selectedSubject || undefined}
          availableYears={availableYears}
          onStartExam={(config) => {
            setIsSetupModalOpen(false);
            if (onStartAdvanced) {
              onStartAdvanced(config);
            } else {
              onStart(config.subjects[0], config.durationMinutes, config.practiceMode, config.selectedYear);
            }
          }}
        />
      )}
    </div>
  );
};
