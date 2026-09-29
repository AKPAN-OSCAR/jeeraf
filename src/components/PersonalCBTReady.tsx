import React from 'react';
import { motion } from 'motion/react';
import { Play, Clock, BookOpen, ChevronRight, Calculator, AlertCircle, Menu } from 'lucide-react';
import { Question } from '../types';
import { SidebarMenu } from './SidebarMenu';

interface PersonalCBTReadyProps {
  questions: Question[];
  duration: number;
  user: any;
  profile?: any;
  onLogout: () => void;
  onNavigateTo: (target: 'dashboard' | 'textbooks' | 'exam_select' | 'progress' | 'admin_console' | 'subscription_portal' | 'fun' | 'blog' | 'awards' | 'system_ai' | 'browser') => void;
  onStart: () => void;
  onBack: () => void;
}

export function PersonalCBTReady({ questions, duration, user, profile, onLogout, onNavigateTo, onStart, onBack }: PersonalCBTReadyProps) {
  return (
    <div className="min-h-screen bg-theme-bg flex flex-col p-4 text-theme-text transition-colors duration-300">
      <div className="max-w-xl w-full mx-auto">
        <div className="flex justify-start mb-4">
          <SidebarMenu 
            user={user} 
            profile={profile}
            onLogout={onLogout} 
            onNavigate={(target) => onNavigateTo(target)}
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-theme-card rounded-[32px] p-8 shadow-2xl border border-theme-border"
        >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-theme-accent/10 text-theme-accent rounded-3xl flex items-center justify-center mx-auto mb-4 border border-theme-accent/20">
            <Play size={40} className="ml-1" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black text-theme-text leading-tight">Your Practice is Ready!</h2>
          <p className="text-theme-muted mt-2 font-medium">All questions have been generated and optimized.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-theme-bg rounded-2xl p-5 border border-theme-border">
            <div className="flex items-center gap-2 text-theme-muted font-bold text-xs uppercase tracking-widest mb-1">
              <BookOpen size={14} /> Questions
            </div>
            <div className="text-2xl font-black text-theme-text">{questions.length}</div>
          </div>
          <div className="bg-theme-bg rounded-2xl p-5 border border-theme-border">
            <div className="flex items-center gap-2 text-theme-muted font-bold text-xs uppercase tracking-widest mb-1">
              <Clock size={14} /> Duration
            </div>
            <div className="text-2xl font-black text-theme-text">{duration} <span className="text-sm font-bold text-theme-muted">Min</span></div>
          </div>
        </div>

        <div className="bg-theme-accent/10 rounded-2xl p-6 border border-theme-accent/20 mb-8">
          <h4 className="font-bold text-theme-accent mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
            <AlertCircle size={16} /> Key Instructions
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-theme-muted">
              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
              <span>All subjects detected in your file are combined into this single exam.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-theme-muted">
              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
              <span>A dedicated <strong>Calculator</strong> is available for all technical questions.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-theme-muted">
              <div className="w-1.5 h-1.5 bg-theme-accent rounded-full mt-1.5 shrink-0" />
              <span>Target: <strong>100% factual accuracy</strong> based on your specific document.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onStart}
            className="w-full bg-theme-accent text-white rounded-2xl py-5 font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-theme-accent/20 flex items-center justify-center gap-2 group"
          >
            Start Practice Now
            <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onBack}
            className="w-full py-4 text-theme-muted font-bold text-sm hover:text-theme-text transition-colors"
          >
            Back to Configuration
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
