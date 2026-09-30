import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Award, Flame, Star, ShieldCheck, 
  ArrowLeft, Lock, CheckCircle2, Sparkles, Download, Share2
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AwardsPageProps {
  user: any;
  profile?: any;
  onBack: () => void;
}

export interface AwardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'CBT Milestone' | 'Game Winner' | 'Subscription Honor';
  unlocked: boolean;
  unlockedAt?: string;
}

export const ALL_MILESTONE_AWARDS: AwardItem[] = [
  {
    id: 'cbt-pioneer',
    title: 'CBT Pioneer',
    description: 'Completed your first JeeRaf CBT Mock Examination.',
    icon: '🚀',
    category: 'CBT Milestone',
    unlocked: true,
    unlockedAt: '2026-07-20'
  },
  {
    id: 'speed-math-legend',
    title: 'Speed Math Legend',
    description: 'Scored 5+ correct answers in Speed Math Challenge under 30 seconds.',
    icon: '⚡',
    category: 'Game Winner',
    unlocked: false
  },
  {
    id: 'duel-champion',
    title: 'Duel Champion',
    description: 'Won a 1v1 multiplayer CBT duel in the Fun Hub.',
    icon: '⚔️',
    category: 'Game Winner',
    unlocked: false
  },
  {
    id: 'memory-genius',
    title: 'Memory Genius',
    description: 'Matched all concept pairs in CBT Memory Flip without error.',
    icon: '🧠',
    category: 'Game Winner',
    unlocked: false
  },
  {
    id: 'century-scorer',
    title: 'Century Scorer',
    description: 'Scored above 80% in any 100-question CBT exam simulation.',
    icon: '💯',
    category: 'CBT Milestone',
    unlocked: false
  },
  {
    id: 'claxy-pro-honor',
    title: 'Claxy Pro Elite Member',
    description: 'Subscribed to Claxy Pro half-yearly plan.',
    icon: '👑',
    category: 'Subscription Honor',
    unlocked: false
  }
];

export const AwardsPage: React.FC<AwardsPageProps> = ({ user, profile, onBack }) => {
  const [userAwards, setUserAwards] = useState<AwardItem[]>(ALL_MILESTONE_AWARDS);

  useEffect(() => {
    // Sync with Firestore profile if user has custom earned awards
    if (user && db) {
      const fetchAwards = async () => {
        try {
          const docRef = doc(db, 'sib_profiles', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data()?.awards) {
            const earnedList: any[] = snap.data().awards || [];
            const updated = ALL_MILESTONE_AWARDS.map(award => {
              const matched = earnedList.find(e => e.title.toLowerCase() === award.title.toLowerCase() || e.id === award.id);
              if (matched) {
                return { ...award, unlocked: true, unlockedAt: matched.earnedAt || 'Recently' };
              }
              // Unlock Claxy Pro honor if profile has claxy pro
              if (award.id === 'claxy-pro-honor' && profile?.subscriptionStatus === 'paid') {
                return { ...award, unlocked: true, unlockedAt: 'Active Member' };
              }
              return award;
            });
            setUserAwards(updated);
          }
        } catch (err) {
          console.error("Error fetching user awards:", err);
        }
      };
      fetchAwards();
    }
  }, [user, profile]);

  const unlockedCount = userAwards.filter(a => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / userAwards.length) * 100);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-4 md:p-8 flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} />
          <button onClick={onBack} className="p-2 bg-theme-card rounded-xl border border-theme-border hover:bg-theme-bg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Trophy className="text-amber-500 animate-pulse" size={28} /> Awards & Achievements Cabinet
            </h1>
            <p className="text-xs text-theme-muted font-medium">Track your exam milestones, trophies, and game victories</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full space-y-8 flex-1">
        {/* Progress Overview Banner */}
        <div className="bg-theme-card border border-theme-border p-8 rounded-3xl shadow-xl flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
          <div className="space-y-2 z-10 text-center md:text-left">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Cabinet Status
            </span>
            <h2 className="text-3xl font-black text-theme-text">{unlockedCount} of {userAwards.length} Unlocked</h2>
            <p className="text-xs text-theme-muted max-w-md">
              Complete mock CBT exams, win 1v1 game competitions in the Fun Hub, or upgrade to Claxy Pro to fill your cabinet!
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2 z-10">
            <div className="flex justify-between text-xs font-bold text-theme-text">
              <span>Collection Progress</span>
              <span className="text-amber-500 font-black">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-theme-bg rounded-full overflow-hidden border border-theme-border">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Awards Cabinet Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {userAwards.map((award) => (
            <motion.div 
              key={award.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between transition-all ${
                award.unlocked 
                  ? 'bg-theme-card border-amber-500/40 hover:border-amber-500' 
                  : 'bg-theme-card/50 border-theme-border opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border ${
                    award.unlocked 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-theme-bg border-theme-border'
                  }`}>
                    {award.unlocked ? award.icon : <Lock size={24} className="text-theme-muted" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    award.unlocked 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-theme-bg text-theme-muted border-theme-border'
                  }`}>
                    {award.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-theme-text">{award.title}</h3>
                  <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                    {award.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-theme-border flex items-center justify-between text-[10px] text-theme-muted font-bold">
                <span>{award.category}</span>
                {award.unlockedAt && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {award.unlockedAt}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
