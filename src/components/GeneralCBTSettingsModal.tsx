import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, GraduationCap, BookOpen, Layers, Check, X, Settings2, Sparkles, Send, ArrowRight, Bot, Upload } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface GeneralCBTSettingsModalProps {
  user: any;
  profile: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedProfile: any) => void;
  onNavigateToCBT?: (customSearchPrompt?: string, category?: string) => void;
}

const AFRICAN_COUNTRIES = [
  { id: 'Nigeria', label: 'Nigeria 🇳🇬' },
  { id: 'Ghana', label: 'Ghana 🇬🇭' },
  { id: 'Kenya', label: 'Kenya 🇰🇪' },
  { id: 'South Africa', label: 'South Africa 🇿🇦' },
  { id: 'Rwanda', label: 'Rwanda 🇷🇼' },
  { id: 'General Africa', label: 'General Africa 🌍' },
];

const CBT_CATEGORIES = [
  {
    id: 'national_exams',
    title: 'National Exams',
    description: 'JAMB UTME, WAEC, NECO & Post-UTME sets for candidates.',
    icon: <GraduationCap className="text-amber-500" size={22} />,
  },
  {
    id: 'university',
    title: 'Universal Personal CBT',
    description: 'Personal CBT notes, audio lecture transcription, and custom course file parsing.',
    icon: <BookOpen className="text-blue-500" size={22} />,
  },
  {
    id: 'general_practice',
    title: 'General CBT & Skill Drills',
    description: 'General knowledge, aptitude, speed tests & practice sets including all national and personal CBTs.',
    icon: <Layers className="text-emerald-500" size={22} />,
  },
  {
    id: 'explore_ai',
    title: 'Explore AI CBT (Custom Route)',
    description: 'Describe any CBT topic or exam you want to write, and AI will prepare and direct you straight to that exact center.',
    icon: <Sparkles className="text-indigo-500 animate-pulse" size={22} />,
  },
];

export const GeneralCBTSettingsModal: React.FC<GeneralCBTSettingsModalProps> = ({
  user,
  profile,
  isOpen,
  onClose,
  onSave,
  onNavigateToCBT
}) => {
  const [country, setCountry] = useState<string>(profile?.cbtCountry || 'Nigeria');
  const [category, setCategory] = useState<string>(profile?.cbtCategory || 'national_exams');
  const [explorePrompt, setExplorePrompt] = useState<string>(profile?.customExamName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // AI Feedback Modal state
  const [aiFeedback, setAiFeedback] = useState<{
    show: boolean;
    title: string;
    message: string;
    suggestsUpload: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (redirectAfterSave = false) => {
    if (!user || !db) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const userRef = doc(db, 'sib_profiles', user.uid);
      const updates = {
        cbtCountry: country,
        cbtCategory: category,
        customExamName: explorePrompt,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updates);
      if (onSave) onSave({ ...profile, ...updates });

      // If Explore AI mode is selected with prompt or personal keywords
      if (category === 'explore_ai' && explorePrompt.trim()) {
        const pLower = explorePrompt.toLowerCase();
        const isPersonal = pLower.includes('personal') || pLower.includes('upcoming') || pLower.includes('exam') || pLower.includes('lecture') || pLower.includes('material') || pLower.includes('audio') || pLower.includes('course') || pLower.includes('test') || pLower.includes('prepare');

        if (isPersonal) {
          setAiFeedback({
            show: true,
            title: 'JeeRaf AI Personal CBT Router',
            message: `I have analyzed your request: "${explorePrompt}". To construct your exact test questions, please upload your lecture audio, PDF materials, or study notes on the next screen. Directing you straight to your Personal CBT workspace...`,
            suggestsUpload: true
          });
          return;
        } else {
          setAiFeedback({
            show: true,
            title: 'JeeRaf AI Exam Router',
            message: `I have prepared the exact practice center for "${explorePrompt}". Directing you straight to the test simulation center...`,
            suggestsUpload: false
          });
          return;
        }
      }

      // Automatically navigate for university, national_exams, general_practice, or standard save
      onClose();
      if (onNavigateToCBT) {
        onNavigateToCBT(explorePrompt, category);
      }
    } catch (err: any) {
      console.error("Failed to save CBT settings:", err);
      setErrorMessage(err?.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProceedFromAiFeedback = () => {
    setAiFeedback(null);
    onClose();
    if (onNavigateToCBT) {
      onNavigateToCBT(explorePrompt, category);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-theme-card border border-theme-border rounded-3xl p-6 shadow-2xl text-theme-text space-y-6 max-h-[90vh] overflow-y-auto relative"
      >
        <AnimatePresence>
          {aiFeedback?.show ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 p-2 text-center"
            >
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Bot size={36} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/20">
                  AI Search Router
                </span>
                <h3 className="text-xl font-black text-theme-text">{aiFeedback.title}</h3>
                <p className="text-xs text-theme-muted leading-relaxed font-medium bg-theme-bg p-4 rounded-2xl border border-theme-border">
                  {aiFeedback.message}
                </p>
              </div>

              {aiFeedback.suggestsUpload && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold flex items-center gap-2 justify-center">
                  <Upload size={16} />
                  <span>Upload lecture materials or audio on the next screen</span>
                </div>
              )}

              <button
                onClick={handleProceedFromAiFeedback}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <span>Proceed to CBT Center</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-theme-accent/10 text-theme-accent rounded-xl">
                    <Settings2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-theme-text leading-tight">General CBT Settings</h2>
                    <p className="text-xs text-theme-muted font-medium">Select region, focus mode, or AI explore search</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-theme-bg rounded-xl text-theme-muted hover:text-theme-text transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Country Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-theme-muted block flex items-center gap-1.5">
                  <Globe size={14} className="text-theme-accent" /> Select Region / Country
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AFRICAN_COUNTRIES.map((c) => {
                    const isSelected = country === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCountry(c.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                            : 'bg-theme-bg text-theme-text border-theme-border hover:border-theme-muted'
                        }`}
                      >
                        <span>{c.label}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-theme-muted block">
                  Target CBT Focus Mode
                </label>
                <div className="space-y-2.5">
                  {CBT_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-theme-bg border-theme-accent ring-2 ring-theme-accent/20'
                            : 'bg-theme-bg/50 border-theme-border hover:border-theme-muted'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-theme-card border border-theme-border shrink-0 mt-0.5">
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-theme-text">{cat.title}</h4>
                            {isSelected && (
                              <span className="text-[10px] bg-theme-accent text-white px-2 py-0.5 rounded-full font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-theme-muted mt-1 leading-snug">{cat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explore AI Search Field */}
              {category === 'explore_ai' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={16} />
                    <label className="text-xs font-black text-theme-text uppercase tracking-wider">
                      Describe CBT to Explore
                    </label>
                  </div>
                  <p className="text-[11px] text-theme-muted">
                    Type what CBT you want (e.g. "I want a personal CBT to prepare for my upcoming exams", "JAMB 2023 Chemistry").
                  </p>
                  <div className="space-y-2">
                    <textarea
                      value={explorePrompt}
                      onChange={(e) => setExplorePrompt(e.target.value)}
                      placeholder="e.g. I want a personal cbt to prepare for my upcoming exams..."
                      rows={2}
                      className="w-full bg-theme-card border border-theme-border rounded-xl p-3 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-medium"
                    />
                    <button
                      onClick={() => handleSave(true)}
                      disabled={isSaving || !explorePrompt.trim()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                    >
                      <Send size={14} />
                      <span>Search & Route to CBT Center</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Save Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-theme-bg border border-theme-border text-theme-muted font-bold text-xs rounded-xl hover:bg-theme-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-theme-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-md shadow-theme-accent/20"
                >
                  {isSaving ? 'Saving...' : 'Apply CBT Mode'}
                </button>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
