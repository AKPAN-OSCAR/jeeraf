import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, GraduationCap, BookOpen, Layers, Check, X, 
  Settings2, Sparkles, ArrowRight, Upload, Radio, Server,
  Cpu, CheckCircle2, ShieldCheck, MapPin
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { JeeRafHeadIcon } from './AIAvatar';
import { CONTINENTS, REGIONAL_SERVERS, getActiveContinent, getCountryById } from '../data/regions';

interface GeneralCBTSettingsModalProps {
  user: any;
  profile: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedProfile: any) => void;
  onNavigateToCBT?: (customSearchPrompt?: string, category?: string) => void;
}

const CBT_CATEGORIES = [
  {
    id: 'national_exams',
    title: 'National Examinations',
    description: 'JAMB UTME, WAEC, NECO & Post-UTME question sets with authentic marking guides.',
    icon: <GraduationCap className="text-amber-500" size={20} />,
  },
  {
    id: 'university',
    title: 'Universal Personal CBT & Audio Lab',
    description: 'Personal study notes, studio audio transcription, and custom lecture syllabus parsing.',
    icon: <BookOpen className="text-blue-500" size={20} />,
  },
  {
    id: 'general_practice',
    title: 'General CBT & Skill Drills',
    description: 'General knowledge, aptitude, speed tests & practice sets including all national and personal CBTs.',
    icon: <Layers className="text-emerald-500" size={20} />,
  },
  {
    id: 'explore_ai',
    title: 'Explore AI CBT (Custom Route)',
    description: 'Describe any CBT topic or exam you want to write, and AI will prepare and direct you straight to that exact center.',
    icon: <Sparkles className="text-indigo-500 animate-pulse" size={20} />,
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
  const [continent, setContinent] = useState<string>(profile?.cbtContinent || 'africa');
  const [country, setCountry] = useState<string>(profile?.cbtCountry || 'Nigeria');
  const [serverRegion, setServerRegion] = useState<string>(
    profile?.preferredServerRegion || profile?.serverRegion || 'af-west-1'
  );
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

  const activeContinentData = CONTINENTS.find(c => c.id === continent) || getActiveContinent();
  const activeCountryConfig = getCountryById(country);

  const handleCountrySelect = (countryId: string) => {
    setCountry(countryId);
    const cfg = getCountryById(countryId);
    if (cfg?.preferredServer?.id) {
      setServerRegion(cfg.preferredServer.id);
    }
  };

  const handleSave = async (redirectAfterSave = false) => {
    if (!user || !db) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const userRef = doc(db, 'sib_profiles', user.uid);
      const updates = {
        cbtContinent: continent,
        cbtCountry: country,
        preferredServerRegion: serverRegion,
        serverRegion: serverRegion,
        cbtCategory: category,
        customExamName: explorePrompt,
        databaseArchitecture: 'json_file_bank',
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
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-theme-card border border-theme-border rounded-3xl p-5 sm:p-7 shadow-2xl text-theme-text space-y-5 max-h-[90vh] overflow-y-auto relative custom-scrollbar"
      >
        <AnimatePresence>
          {aiFeedback?.show ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 p-2 text-center"
            >
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-sm overflow-hidden p-2">
                <JeeRafHeadIcon className="w-full h-full object-cover rounded-xl" />
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
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Proceed to CBT Center</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <>
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-theme-accent/10 text-theme-accent rounded-xl border border-theme-accent/20">
                    <Globe size={22} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-theme-text leading-tight">
                      International CBT System & Region Settings
                    </h2>
                    <p className="text-xs text-theme-muted font-bold">
                      Configure continent, active national server, and CBT focus mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-theme-bg rounded-xl text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* 1. CONTINENTS SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-theme-muted block flex items-center gap-1.5">
                    <Globe size={14} className="text-theme-accent" /> 1. Select Continent
                  </label>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Africa Active Hub
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {CONTINENTS.map((cont) => {
                    const isSelected = continent === cont.id;
                    return (
                      <button
                        type="button"
                        key={cont.id}
                        onClick={() => {
                          if (cont.isActive) setContinent(cont.id);
                          else alert(`${cont.name} is scheduled for Phase ${cont.statusText}. Africa is currently active!`);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                            : cont.isActive
                            ? 'bg-theme-bg text-theme-text border-theme-border hover:border-theme-accent'
                            : 'bg-theme-bg/40 text-theme-muted border-theme-border/60 opacity-60'
                        }`}
                      >
                        <span className="text-base sm:text-lg">{cont.icon}</span>
                        <span className="text-[11px] font-black">{cont.name}</span>
                        <span className={`text-[8px] font-bold px-1 rounded-sm uppercase ${
                          cont.isActive ? (isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-500') : 'text-theme-muted'
                        }`}>
                          {cont.isActive ? 'Active' : 'Roadmap'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. COUNTRY SELECTION INSIDE AFRICA */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-theme-muted block flex items-center gap-1.5">
                  <MapPin size={14} className="text-theme-accent" /> 2. African Country & Examination Registry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeContinentData.countries.map((c) => {
                    const isSelected = country === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleCountrySelect(c.id)}
                        className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                            : 'bg-theme-bg text-theme-text border-theme-border hover:border-theme-muted'
                        }`}
                      >
                        <span className="truncate">{c.name} {c.flag}</span>
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SERVER REGION & LATENCY */}
              <div className="p-3.5 bg-theme-bg rounded-2xl border border-theme-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-1.5">
                    <Server size={14} className="text-theme-accent" /> Regional Edge Node
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    🟢 {activeCountryConfig?.preferredServer?.latencyMs || 15}ms Latency
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-theme-muted">
                  <span>Server: <strong className="text-theme-text">{activeCountryConfig?.preferredServer?.name}</strong></span>
                  <span>Code: <strong className="font-mono text-theme-accent">{activeCountryConfig?.preferredServer?.code}</strong></span>
                </div>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-theme-muted border-t border-theme-border/60">
                  <Cpu size={12} className="text-theme-accent" />
                  <span>Question Bank Storage: <strong>JSON File Bank (`src/data/question_banks/`)</strong></span>
                </div>
              </div>

              {/* 4. CBT FOCUS MODE CATEGORY */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-theme-muted block">
                  3. Target CBT Focus Mode
                </label>
                <div className="space-y-2">
                  {CBT_CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
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
                          <p className="text-[11px] text-theme-muted font-medium mt-0.5 leading-snug">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EXPLORE AI CUSTOM PROMPT (IF EXPLORE MODE SELECTED) */}
              {category === 'explore_ai' && (
                <div className="space-y-2 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <label className="text-xs font-bold text-indigo-500 uppercase flex items-center gap-1.5">
                    <Sparkles size={14} /> Describe Your Target Examination or Topic
                  </label>
                  <input
                    type="text"
                    value={explorePrompt}
                    onChange={(e) => setExplorePrompt(e.target.value)}
                    placeholder="e.g., WAEC 2013 Mathematics, Post-UTME Chemistry, My University Physics Test..."
                    className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text placeholder:text-theme-muted focus:border-indigo-500 outline-none"
                  />
                </div>
              )}

              {/* MODAL ACTIONS */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(false)}
                  className="flex-1 py-3 bg-theme-accent hover:opacity-95 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-theme-accent/20 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving Config..." : "Save Preferences"}
                </button>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
