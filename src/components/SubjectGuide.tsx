import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, ChevronRight, Bookmark, Maximize2, Minimize2, Lightbulb, Search, GraduationCap, Menu } from 'lucide-react';
import { subjectGuides } from '../data/subjectGuides';
import { Subject } from '../types';
import { cn } from '../data/lib/utils';
import { MathRenderer } from './MathRenderer';

interface SubjectGuideProps {
  subject: Subject;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectGuide: React.FC<SubjectGuideProps> = ({ subject, isOpen, onClose }) => {
  const guide = subjectGuides[subject];
  const [activeTopic, setActiveTopic] = React.useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  if (!guide) return null;

  const filteredTopics = guide.topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-collapse sidebar on mobile when topic is selected
  const handleTopicSelect = (idx: number) => {
    setActiveTopic(idx);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300",
          isFullScreen ? "p-0" : "p-4 sm:p-6 lg:p-8"
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative bg-theme-bg text-theme-text shadow-2xl overflow-hidden flex flex-col transition-all duration-500",
              isFullScreen ? "w-full h-full rounded-0" : "w-full max-w-6xl rounded-[2.5rem] max-h-[90vh] border border-theme-border"
            )}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-theme-border flex items-center justify-between bg-theme-card sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-theme-bg rounded-xl transition-colors text-theme-muted md:flex hidden"
                  title="Toggle Sidebar"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-theme-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-theme-accent/20">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-theme-text tracking-tight leading-none">
                      {subject} <span className="text-theme-accent">Mastery</span>
                    </h2>
                    <span className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">Interactive Textbook</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2.5 text-theme-muted hover:text-theme-accent hover:bg-theme-bg rounded-xl transition-all"
                  title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
              {/* Enhanced Sidebar */}
              <motion.div 
                initial={false}
                animate={{ 
                  width: sidebarOpen ? (window.innerWidth < 768 ? '100%' : '320px') : '0px',
                  opacity: sidebarOpen ? 1 : 0,
                  x: sidebarOpen ? 0 : -20
                }}
                className={cn(
                  "bg-theme-card border-r border-theme-border flex flex-col shrink-0 overflow-hidden z-20 absolute md:relative inset-y-0 left-0",
                  !sidebarOpen && "border-r-0"
                )}
              >
                <div className="p-6 pb-2 w-80 md:w-full shrink-0">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={14} />
                    <input 
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent transition-all font-medium text-theme-text"
                    />
                  </div>
                  <h3 className="text-[9px] font-black text-theme-muted uppercase tracking-[0.2em] mb-4">Course Curriculum</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar w-80 md:w-full">
                  <button
                    onClick={() => { setActiveTopic(null); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left group",
                      activeTopic === null
                        ? "bg-theme-bg text-theme-accent shadow-lg shadow-theme-accent/5 border border-theme-accent/20"
                        : "text-theme-muted hover:bg-theme-bg/60"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      activeTopic === null ? "bg-theme-accent text-white" : "bg-theme-border text-theme-muted"
                    )}>
                      <Book size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-none">Course Overview</span>
                    </div>
                  </button>

                  <div className="pt-3 space-y-1">
                    {filteredTopics.map((topic, idx) => {
                      const originalIdx = guide.topics.indexOf(topic);
                      return (
                        <button
                          key={originalIdx}
                          onClick={() => handleTopicSelect(originalIdx)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all text-left group",
                            activeTopic === originalIdx
                              ? "bg-theme-bg text-theme-accent shadow-lg shadow-theme-accent/5 border border-theme-accent/20"
                              : "text-theme-muted hover:bg-theme-bg/60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                              activeTopic === originalIdx ? "bg-theme-accent text-white" : "bg-theme-border text-theme-muted group-hover:bg-theme-border/80"
                            )}>
                              {String(originalIdx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="text-[13px] font-bold block leading-none truncate max-w-[160px]">{topic.title}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className={cn(
                            "transition-transform",
                            activeTopic === originalIdx ? "rotate-90 text-theme-accent" : "text-theme-muted opacity-50"
                          )} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Main Reading Canvas */}
              <div className="flex-1 bg-theme-bg overflow-y-auto relative custom-scrollbar z-10">
                {!sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-8 left-8 p-3 bg-theme-card border border-theme-border text-theme-muted hover:text-theme-accent hover:border-theme-accent rounded-2xl shadow-sm transition-all z-30"
                    title="Show Topics"
                  >
                    <Menu size={20} />
                  </button>
                )}
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTopic === null ? 'overview' : `topic-${activeTopic}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="max-w-4xl mx-auto px-8 py-16 md:px-20"
                  >
                    {activeTopic === null ? (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-accent/10 text-theme-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-theme-accent/20">
                             Welcome to the Guide
                          </div>
                          <h1 className="text-5xl md:text-6xl font-black text-theme-text tracking-tight leading-[1.1]">
                            {subject} <br />
                            <span className="text-theme-accent">Foundation</span>
                          </h1>
                          <p className="text-xl text-theme-muted leading-relaxed font-medium">
                            {guide.overview}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="p-6 bg-theme-card rounded-[2rem] border border-theme-border group hover:bg-theme-accent/5 transition-colors">
                            <div className="w-10 h-10 bg-theme-bg rounded-xl flex items-center justify-center text-theme-accent mb-4 shadow-sm border border-theme-border">
                              <Book size={20} />
                            </div>
                            <p className="text-3xl font-black text-theme-text">{guide.topics.length}</p>
                            <p className="text-[10px] text-theme-muted font-black uppercase tracking-widest mt-1">Core Modules</p>
                          </div>
                          <div className="p-6 bg-theme-card rounded-[2rem] border border-theme-border group hover:bg-theme-accent/5 transition-colors">
                            <div className="w-10 h-10 bg-theme-bg rounded-xl flex items-center justify-center text-emerald-500 mb-4 shadow-sm border border-theme-border">
                              <Lightbulb size={20} />
                            </div>
                            <p className="text-3xl font-black text-theme-text">High</p>
                            <p className="text-[10px] text-theme-muted font-black uppercase tracking-widest mt-1">Exam Relevance</p>
                          </div>
                          <div className="p-6 bg-theme-card rounded-[2rem] border border-theme-border group hover:bg-theme-accent/5 transition-colors">
                            <div className="w-10 h-10 bg-theme-bg rounded-xl flex items-center justify-center text-amber-500 mb-4 shadow-sm border border-theme-border">
                              <ChevronRight size={20} />
                            </div>
                            <p className="text-3xl font-black text-theme-text">12</p>
                            <p className="text-[10px] text-theme-muted font-black uppercase tracking-widest mt-1">Reading Mins</p>
                          </div>
                        </div>

                        <div className="bg-theme-accent rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
                           <h3 className="text-2xl font-bold mb-4 relative z-10">Ready to begin?</h3>
                           <p className="text-white/70 mb-8 max-w-md relative z-10">Select the first topic from the sidebar to start your journey towards excellence in {subject}.</p>
                           <button 
                            onClick={() => setActiveTopic(0)}
                            className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all relative z-10 shadow-xl"
                           >
                             Open First Chapter
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-theme-bg text-theme-muted text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-theme-border">
                              Chapter {String(activeTopic + 1).padStart(2, '0')}
                            </span>
                            <div className="h-px flex-1 bg-theme-border" />
                          </div>
                          
                          <h2 className="text-4xl md:text-5xl font-black text-theme-text tracking-tight leading-tight">
                            {guide.topics[activeTopic].title}
                          </h2>
                        </div>

                        <div className="prose prose-lg max-w-none text-theme-text transition-colors duration-300">
                          <div className="text-theme-muted leading-relaxed font-medium text-[1.05rem]">
                            <MathRenderer text={guide.topics[activeTopic].content} />
                          </div>
                        </div>

                        {guide.topics[activeTopic].diagram && (
                          <div className="my-12 p-8 bg-theme-card rounded-[3rem] border border-theme-border transition-all hover:border-theme-accent group">
                            <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-white mb-6 shadow-inner border border-theme-border">
                              {guide.topics[activeTopic].diagram?.url && (
                                <img 
                                  src={guide.topics[activeTopic].diagram?.url} 
                                  alt={guide.topics[activeTopic].diagram?.caption}
                                  className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-2 h-2 bg-theme-accent rounded-full" />
                              <p className="text-xs text-theme-muted font-black uppercase tracking-widest text-center">
                                FIG {activeTopic + 1}: {guide.topics[activeTopic].diagram?.caption}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Navigation */}
                        <div className="pt-16 flex items-center justify-between border-t border-theme-border">
                          <button
                            onClick={() => setActiveTopic(activeTopic > 0 ? activeTopic - 1 : null)}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all active:scale-95"
                          >
                            <ChevronRight size={20} className="rotate-180" />
                            PREVIOUS
                          </button>
                          
                          <div className="hidden sm:flex items-center gap-2">
                             {[...Array(guide.topics.length)].map((_, i) => (
                               <div 
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                  i === activeTopic ? "bg-theme-accent w-6" : "bg-theme-border"
                                )}
                               />
                             ))}
                          </div>

                          {activeTopic < guide.topics.length - 1 ? (
                            <button
                              onClick={() => setActiveTopic(activeTopic + 1)}
                              className="flex items-center gap-3 px-8 py-3 bg-theme-accent text-white rounded-2xl text-sm font-black hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-theme-accent/20"
                            >
                              NEXT CHAPTER
                              <ChevronRight size={20} />
                            </button>
                          ) : (
                            <button
                              onClick={onClose}
                              className="flex items-center gap-3 px-8 py-3 bg-theme-accent text-white rounded-2xl text-sm font-black hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-theme-accent/20"
                            >
                              FINISH STUDYING
                              <ChevronRight size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Custom scrollbar styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
              }
            `}} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
