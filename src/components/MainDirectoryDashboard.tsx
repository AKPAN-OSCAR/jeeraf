import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings2, Globe, TrendingUp, ArrowRight, ChevronRight,
  BookOpen, Sparkles, Newspaper, ArrowUpRight, Bot, Library
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { GeneralCBTSettingsModal } from './GeneralCBTSettingsModal';
import { ExamType, Subject, Question } from '../types';

interface MainDirectoryDashboardProps {
  user: any;
  profile: any;
  examType: ExamType | null;
  adminQuestions?: Question[];
  onStartSubject: (subject: Subject) => void;
  onOpenExamTypeSelect: () => void;
  onNavigateTo: (target: 'dashboard' | 'textbooks' | 'exam_select' | 'progress' | 'admin_console' | 'subscription_portal' | 'fun' | 'blog' | 'awards' | 'system_ai' | 'browser') => void;
  onLogout: () => void;
  onViewProgress: () => void;
  onOpenCBTDirectory: (customCategory?: string, customPrompt?: string) => void;
}

// Daily rotating articles for the main dashboard blog preview
const DAILY_BLOG_PREVIEWS = [
  {
    day: 'Today\'s Featured Article',
    title: 'JAMB & WAEC CBT Speed Strategy: How to Solve 40 Questions in 25 Minutes',
    snippet: 'Mastering time allocation, elimination techniques, and handling high-yield calculation shortcuts for secondary & tertiary exams across Africa.',
    readTime: '3 min read',
    tag: 'CBT Mastery'
  },
  {
    day: 'Today\'s Featured Article',
    title: 'Challenge Friends in 1v1 Live CBT Duels & Speed Quizzes!',
    snippet: 'Check out our multiplayer Fun & Games room in the Dash Menu to play live CBT duels, gain ranking points, and earn awards.',
    readTime: '2 min read',
    tag: 'Fun & Games'
  },
  {
    day: 'Today\'s Featured Article',
    title: 'How to Convert Course Audio Lectures into Smart CBT Notes with ZeeRaf AI',
    snippet: 'Learn how university students use ZeeRaf personal CBT to transcribe long recordings into searchable practice questions.',
    readTime: '4 min read',
    tag: 'University & AI'
  }
];

export const MainDirectoryDashboard: React.FC<MainDirectoryDashboardProps> = ({
  user,
  profile,
  onNavigateTo,
  onLogout,
  onViewProgress,
  onOpenCBTDirectory
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  // Choose daily preview based on day of month
  const dayIndex = new Date().getDate() % DAILY_BLOG_PREVIEWS.length;
  const todaysArticle = DAILY_BLOG_PREVIEWS[dayIndex];

  const cbtCategory = currentProfile?.cbtCategory || profile?.cbtCategory || 'national_exams';
  const cbtCountry = currentProfile?.cbtCountry || profile?.cbtCountry || 'Nigeria';
  const customExamName = currentProfile?.customExamName || profile?.customExamName;

  const getCountryFlag = () => {
    switch (cbtCountry) {
      case 'Ghana': return '🇬🇭';
      case 'Kenya': return '🇰🇪';
      case 'South Africa': return '🇿🇦';
      case 'Rwanda': return '🇷🇼';
      case 'General Africa': return '🌍';
      default: return '🇳🇬';
    }
  };

  const getCategoryDisplayLabel = () => {
    if (cbtCategory === 'explore_ai') {
      return customExamName ? `Explore AI (${customExamName.slice(0, 20)}...)` : 'Explore AI Search';
    }
    if (cbtCategory === 'national_exams') return 'National Exams';
    if (cbtCategory === 'university') return 'Universal Personal CBT';
    return 'General CBT & Drills';
  };

  const handleEnterCBTClick = () => {
    // Directs user according to their configured category and prompt preference
    onOpenCBTDirectory(cbtCategory, customExamName);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-300 flex flex-col">
      {/* Top Header */}
      <header className="bg-theme-card border-b border-theme-border px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <SidebarMenu 
            user={user} 
            profile={currentProfile || profile} 
            onLogout={onLogout} 
            onNavigate={onNavigateTo} 
          />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-theme-accent rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              Z
            </div>
            <div>
              <h1 className="text-lg font-black text-theme-text leading-none tracking-tight">ZeeRaf CBT</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-accent bg-theme-accent/10 px-2 py-0.5 rounded-md border border-theme-accent/20">
                  {getCountryFlag()} {cbtCountry}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* General CBT Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2.5 bg-theme-accent text-white hover:opacity-90 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-theme-accent/20"
            title="General CBT Settings"
          >
            <Settings2 size={16} />
            <span>CBT Settings</span>
          </button>

          {/* Progress */}
          <button
            onClick={onViewProgress}
            className="p-2.5 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Progress</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1 space-y-8">
        {/* Animated Hero Welcome Bar - Single clean summary without duplicate button */}
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-theme-accent uppercase tracking-widest bg-theme-accent/10 px-2.5 py-0.5 rounded-full border border-theme-accent/20">
                Main Directory
              </span>
            </div>
            <h2 className="text-2xl font-black text-theme-text">
              Welcome back, {profile?.nickname || user?.email?.split('@')[0]}
            </h2>
            <p className="text-xs text-theme-muted font-medium">
              Region: <strong>{cbtCountry}</strong> • Active CBT Mode: <strong className="text-theme-accent">{getCategoryDisplayLabel()}</strong>
            </p>
          </div>
        </div>

        {/* 5 CORE BACKGROUND FEATURE CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Card 1: ENTER CBT */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={handleEnterCBTClick}
            className="bg-theme-card border-2 border-theme-accent/40 rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-3 sm:space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity z-10">
              <Sparkles className="text-theme-accent" size={50} />
            </div>

            {/* Custom Designed Card Cover Image */}
            <div className="w-full h-28 sm:h-28 lg:h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-theme-accent/30 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop" 
                alt="Enter CBT Practice" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-400/30">
                  CBT Mode
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-theme-text tracking-tight">Enter CBT</h3>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-theme-accent bg-theme-accent/10 px-2.5 py-0.5 rounded-full">
                {cbtCategory === 'university' ? 'Universal CBT' : cbtCategory === 'explore_ai' ? 'AI Router' : 'Exam Simulator'}
              </span>
            </div>

            <button className="w-full bg-theme-accent text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-theme-accent/20 hover:opacity-95 transition-all">
              <span>Start CBT</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Card 2: INTERACT WITH ZEERAF AI */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onNavigateTo('system_ai')}
            className="bg-theme-card border border-theme-border hover:border-indigo-500/50 rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-3 sm:space-y-4 relative overflow-hidden group"
          >
            {/* Custom Designed Card Cover Image */}
            <div className="w-full h-28 sm:h-28 lg:h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-indigo-500/30 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
                alt="ZeeRaf AI Tutor" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/40 to-transparent" />
              <div className="absolute bottom-2 left-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-indigo-400/30">
                  AI Tutor
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-theme-text tracking-tight">ZeeRaf AI</h3>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                Interactive Tutor
              </span>
            </div>

            <button className="w-full bg-theme-accent text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-theme-accent/20 hover:opacity-95 transition-all">
              <span>Interact AI</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>

          {/* Card 3: LIBRARY & TEXTBOOKS */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onNavigateTo('textbooks')}
            className="bg-theme-card border border-theme-border hover:border-theme-accent/50 rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-3 sm:space-y-4 relative overflow-hidden group"
          >
            {/* Custom Designed Card Cover Image */}
            <div className="w-full h-28 sm:h-28 lg:h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-blue-500/30 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop" 
                alt="E-Textbook Library" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-2 left-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-blue-400/30">
                  E-Books & PDFs
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-theme-text tracking-tight">Library</h3>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                E-Textbooks
              </span>
            </div>

            <button className="w-full bg-theme-accent text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-theme-accent/20 hover:opacity-95 transition-all">
              <span>Open Library</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>

          {/* Card 4: WEB BROWSER */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onNavigateTo('browser')}
            className="bg-theme-card border border-theme-border hover:border-theme-accent/50 rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-3 sm:space-y-4 relative overflow-hidden group"
          >
            {/* Custom Designed Card Cover Image */}
            <div className="w-full h-28 sm:h-28 lg:h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-amber-500/30 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" 
                alt="Web Search & Browser" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-2 left-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-400/30">
                  Web Engine
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-theme-text tracking-tight">Web Browser</h3>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                Full Display & Search
              </span>
            </div>

            <button className="w-full bg-theme-accent text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-theme-accent/20 hover:opacity-95 transition-all">
              <span>Open Browser</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>

          {/* Card 5: BLOGS & APP UPDATES */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => onNavigateTo('blog')}
            className="col-span-2 sm:col-span-1 bg-theme-card border border-theme-border hover:border-theme-accent/50 rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-3 sm:space-y-4 relative overflow-hidden group"
          >
            {/* Custom Designed Card Cover Image */}
            <div className="w-full h-28 sm:h-28 lg:h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-emerald-500/30 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop" 
                alt="Blogs & Exam News" 
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-2 left-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-400/30">
                  News & Guides
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-theme-text tracking-tight">Blogs & Updates</h3>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Guides & News
              </span>
            </div>

            <button className="w-full bg-theme-accent text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-theme-accent/20 hover:opacity-95 transition-all">
              <span>Read Blogs</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>

        {/* DAILY FEATURED BLOG & EXAM NEWS BANNER */}
        <div className="bg-theme-card border border-theme-border rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-theme-border pb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="text-emerald-500" size={18} />
              <span className="text-xs font-black uppercase tracking-wider text-theme-text">
                {todaysArticle.day}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                {todaysArticle.tag}
              </span>
            </div>
            <span className="text-[11px] text-theme-muted font-medium">
              {todaysArticle.readTime}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-theme-text leading-snug">
              {todaysArticle.title}
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed max-w-3xl">
              {todaysArticle.snippet}
            </p>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between border-t border-theme-border">
            <span className="text-[11px] text-theme-muted italic">
              Explore daily exam updates & system features
            </span>
            <button
              onClick={() => onNavigateTo('blog')}
              className="px-4 py-2 bg-theme-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore Official Blog</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* General Settings Modal */}
      <GeneralCBTSettingsModal
        user={user}
        profile={currentProfile || profile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(updated) => setCurrentProfile(updated)}
        onNavigateToCBT={(prompt, cat) => {
          setIsSettingsOpen(false);
          onOpenCBTDirectory(cat, prompt);
        }}
      />
    </div>
  );
};
