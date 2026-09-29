import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Award, Calendar, ChevronRight, Menu } from 'lucide-react';
import { SidebarMenu } from '../components/SidebarMenu';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { QuizResult } from '../types';

interface ProgressTrackerProps {
  user: any;
  profile?: any;
  onBack: () => void;
  onLogout: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ user, profile, onBack, onLogout }) => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && db) {
      const resultsRef = collection(db, 'sib_results');
      const q = query(
        resultsRef, 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as any[];
        setResults(data);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const averageScore = results.length > 0 
    ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length) * 100)
    : 0;

  const totalExams = results.length;
  
  const getRating = (scorePercentage: number) => {
    if (scorePercentage >= 75) return { label: 'Excellent', color: 'text-emerald-500' };
    if (scorePercentage >= 50) return { label: 'Good', color: 'text-theme-accent' };
    return { label: 'Needs Improvement', color: 'text-amber-500' };
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-theme-bg text-theme-text transition-colors duration-300">
      {/* Galactic Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 right-0 w-96 h-96 bg-theme-accent/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-theme-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Mixed Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => {
          const isGold = Math.random() > 0.5;
          return (
            <motion.div
              key={i}
              initial={{ opacity: Math.random() }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                backgroundColor: isGold ? '#FFD700' : '#FFFFFF',
                boxShadow: `0 0 5px ${isGold ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.5)'}`
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <SidebarMenu user={user} profile={profile} onLogout={onLogout} />
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-theme-muted hover:text-theme-text transition-colors group"
            >
              <div className="p-2 rounded-full bg-theme-card border border-theme-border group-hover:bg-theme-bg transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-theme-accent">
            Progress Tracker
          </h1>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-card backdrop-blur-md border border-theme-border p-6 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-theme-accent/10 rounded-lg text-theme-accent">
                <TrendingUp size={20} />
              </div>
              <span className="text-theme-muted text-sm font-medium">Average Score</span>
            </div>
            <div className="text-4xl font-bold">{averageScore}%</div>
            <p className="text-xs text-theme-muted mt-2">Overall performance rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-theme-card backdrop-blur-md border border-theme-border p-6 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-theme-accent/10 rounded-lg text-theme-accent">
                <Award size={20} />
              </div>
              <span className="text-theme-muted text-sm font-medium">Total Exams</span>
            </div>
            <div className="text-4xl font-bold">{totalExams}</div>
            <p className="text-xs text-theme-muted mt-2">Completed CBT practices</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-theme-card backdrop-blur-md border border-theme-border p-6 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-theme-accent/10 rounded-lg text-theme-accent">
                <Calendar size={20} />
              </div>
              <span className="text-theme-muted text-sm font-medium">Last Activity</span>
            </div>
            <div className="text-xl font-bold truncate">
              {results.length > 0 ? new Date(results[0].date).toLocaleDateString() : 'No activity'}
            </div>
            <p className="text-xs text-theme-muted mt-2">Most recent practice session</p>
          </motion.div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Recent Performance
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-theme-card border border-theme-border rounded-3xl p-12 text-center">
              <p className="text-theme-muted">No exam results found yet. Start a CBT to track your progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, idx) => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                const rating = getRating(percentage);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-theme-card hover:bg-theme-bg backdrop-blur-sm border border-theme-border p-5 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 
                        percentage >= 50 ? 'bg-theme-accent/10 text-theme-accent' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {percentage}%
                      </div>
                      <div>
                        <h4 className="font-bold text-theme-text flex items-center gap-2">
                          {result.subject}
                          <span className="text-[10px] px-1.5 py-0.5 bg-theme-bg border border-theme-border rounded text-theme-muted">
                            {result.examType || 'JAMB'}
                          </span>
                        </h4>
                        <p className="text-xs text-theme-muted">
                          {new Date(result.date).toLocaleDateString()} • {result.score}/{result.totalQuestions} Correct
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className={`text-sm font-bold ${rating.color}`}>{rating.label}</p>
                        <p className="text-[10px] text-theme-muted uppercase tracking-wider">Performance</p>
                      </div>
                      <ChevronRight size={20} className="text-theme-muted group-hover:text-theme-text transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
