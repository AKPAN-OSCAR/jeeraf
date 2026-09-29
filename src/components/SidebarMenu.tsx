import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, UserCircle, UserCheck, HelpCircle, 
  FileText, Info, CreditCard, LogOut, Camera, 
  ChevronLeft, Save, Loader2, Check, Book, Play,
  ShieldCheck, LayoutDashboard, Palette, Gamepad2,
  Newspaper, Trophy, Sparkles, Settings2, Globe, Search,
  BarChart2, Building2
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../data/lib/utils';
import { GeneralCBTSettingsModal } from './GeneralCBTSettingsModal';

interface SidebarMenuProps {
  user: any;
  profile?: any;
  onLogout: () => void;
  onNavigate?: (target: 'dashboard' | 'textbooks' | 'exam_select' | 'progress' | 'admin_console' | 'subscription_portal' | 'fun' | 'blog' | 'awards' | 'system_ai' | 'browser') => void;
  onNavigateToExam?: () => void;
}

type MenuState = 'main' | 'profile' | 'theme' | 'guide' | 'terms' | 'about' | 'subscription' | 'account' | 'admin' | 'cbt_settings';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ user, profile, onLogout, onNavigate, onNavigateToExam }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuState>('main');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: profile?.fullName || '',
    nickname: profile?.nickname || '',
    gender: profile?.gender || '',
    age: profile?.age || '',
    profileImage: profile?.profileImage || '',
    theme: profile?.theme || 'white'
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || '',
        nickname: profile.nickname || '',
        gender: profile.gender || '',
        age: profile.age || '',
        profileImage: profile.profileImage || '',
        theme: profile.theme || 'white'
      });
    }
  }, [profile]);

  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const emailClean = user.email?.toLowerCase().trim();
      setIsAdmin(emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profile?.role === 'admin');
    }
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!db || !user) return;
    setSaving(true);
    const profilePath = `sib_profiles/${user.uid}`;
    try {
      await setDoc(doc(db, profilePath), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setActiveMenu('main');
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Image too large. Please select an image smaller than 800KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetTheme = async (newTheme: string) => {
    setProfileData(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('zeeraf_theme', newTheme);
    document.documentElement.className = newTheme === 'white' ? '' : `theme-${newTheme}`;
    window.dispatchEvent(new CustomEvent('zeeraf-theme-change', { detail: newTheme }));
    if (db && user) {
      try {
        await updateDoc(doc(db, `sib_profiles/${user.uid}`), {
          theme: newTheme,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Theme sync failed:", err);
      }
    }
  };

  const menuItems = [
    { id: 'browser', label: 'ZeeRaf Web Browser', keywords: 'web browser internet search engine chrome url link page google bing wikipedia zeeraf', icon: <Globe className="text-amber-500" size={20} />, action: 'browser' },
    { id: 'system_ai', label: 'ZeeRaf Real-time AI', keywords: 'zeeraf ai tutor chat solver camera questions assistant', icon: <Sparkles className="text-indigo-500" size={20} />, action: 'system_ai' },
    { id: 'main_dashboard', label: 'Main Directory Hub', keywords: 'directory home hub navigation main', icon: <LayoutDashboard className="text-theme-accent" size={20} />, action: 'dashboard' },
    { id: 'cbt_subjects', label: 'CBT Subjects & Practice', keywords: 'cbt exam subject questions jamb waec neco practice', icon: <Book className="text-blue-500" size={20} />, action: 'dashboard' },
    { id: 'exam_select', label: 'Select Exam Category', keywords: 'exam type category jamb waec neco personal cbt', icon: <LayoutDashboard className="text-emerald-500" size={20} />, action: 'exam_select' },
    { id: 'progress', label: 'Stats & Progress Tracker', keywords: 'progress stats score accuracy history performance charts', icon: <BarChart2 className="text-emerald-500" size={20} />, action: 'progress' },
    { id: 'cbt_settings', label: 'General CBT Settings', keywords: 'settings audio timer questions limit cbt configuration', icon: <Settings2 className="text-emerald-500" size={20} />, state: 'cbt_settings' as MenuState },
    { id: 'fun', label: 'Fun & CBT Games', keywords: 'fun games duel 1v1 trivia match challenge', icon: <Gamepad2 className="text-amber-500" size={20} />, action: 'fun' },
    { id: 'blog', label: 'Blog & App News', keywords: 'blog news updates announcements exam tips', icon: <Newspaper className="text-blue-500" size={20} />, action: 'blog' },
    { id: 'awards', label: 'Awards & Trophies', keywords: 'awards trophies achievements badges leaderboard streak', icon: <Trophy className="text-amber-400" size={20} />, action: 'awards' },
    { id: 'textbooks', label: 'Library & Textbooks', keywords: 'textbooks library books summary syllabus pdf reading', icon: <Book size={20} />, action: 'textbooks' },
    { id: 'theme', label: 'Theme Color Customization', keywords: 'theme color dark light gold silver black white red green yellow cyan violet pink', icon: <Palette size={20} />, state: 'theme' as MenuState },
    { id: 'account', label: 'Account Change & Info', keywords: 'account change login email user logout', icon: <UserCircle size={20} />, state: 'account' as MenuState },
    { id: 'profile', label: 'Profile Setup', keywords: 'profile avatar nickname full name image photo setup', icon: <UserCheck size={20} />, state: 'profile' as MenuState },
    { id: 'premium', label: 'Subscription Plans', keywords: 'subscription premium claxy pro plan payment upgrade renew', icon: <ShieldCheck size={20} />, action: 'subscription_portal' },
    { id: 'guide', label: 'Users Guide', keywords: 'guide user help instructions how to use', icon: <HelpCircle size={20} />, state: 'guide' as MenuState },
    { id: 'terms', label: 'Terms and Conditions', keywords: 'terms conditions policy agreement system rules', icon: <FileText size={20} />, state: 'terms' as MenuState },
    { id: 'about', label: 'About Developers', keywords: 'about developers eemmpatech empire contact info', icon: <Info size={20} />, state: 'about' as MenuState },
    { id: 'subscription', label: 'Subscription Details', keywords: 'subscription details status plan info', icon: <CreditCard size={20} />, state: 'subscription' as MenuState },
  ];

  if (isAdmin) {
    menuItems.unshift({ id: 'admin', label: 'Admin Console', keywords: 'admin console questions manager users permissions database', icon: <ShieldCheck className="text-blue-500" size={20} />, action: 'admin_console' });
  }

  const queryClean = menuSearchQuery.trim().toLowerCase();
  const filteredMenuItems = queryClean.length >= 1
    ? menuItems.filter(item => 
        item.label.toLowerCase().includes(queryClean) || 
        (item.keywords && item.keywords.toLowerCase().includes(queryClean))
      )
    : menuItems;

  const renderContent = () => {
    switch (activeMenu) {
      case 'cbt_settings':
        return (
          <GeneralCBTSettingsModal
            user={user}
            profile={profile}
            isOpen={true}
            onClose={() => setActiveMenu('main')}
          />
        );
      case 'theme':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Theme Color</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'white', label: 'White', color: 'bg-white', border: 'border-slate-200' },
                { id: 'black', label: 'Black', color: 'bg-slate-950', border: 'border-slate-800' },
                { id: 'gold', label: 'Gold', color: 'bg-amber-50', border: 'border-amber-300' },
                { id: 'silver', label: 'Silver', color: 'bg-slate-300', border: 'border-slate-400' },
                { id: 'red', label: 'Red', color: 'bg-red-500', border: 'border-red-600' },
                { id: 'green', label: 'Green', color: 'bg-emerald-500', border: 'border-emerald-600' },
                { id: 'yellow', label: 'Yellow', color: 'bg-yellow-500', border: 'border-yellow-600' },
                { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500', border: 'border-cyan-600' },
                { id: 'violet', label: 'Violet', color: 'bg-violet-500', border: 'border-violet-600' },
                { id: 'pink', label: 'Pink', color: 'bg-pink-500', border: 'border-pink-600' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSetTheme(t.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all group bg-theme-card shadow-sm",
                    profileData.theme === t.id ? "border-theme-accent ring-4 ring-theme-accent/10" : "border-theme-border hover:border-theme-muted"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl shadow-inner border", t.color || 'bg-theme-bg', t.border || 'border-theme-border')} />
                  <span className="text-sm font-bold text-theme-text">{t.label}</span>
                  {profileData.theme === t.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-theme-accent rounded-full flex items-center justify-center text-white p-1 shadow-sm">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Profile Setup</h2>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 bg-theme-bg rounded-full flex items-center justify-center border-2 border-theme-border overflow-hidden cursor-pointer group"
              >
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserCircle size={48} className="text-theme-muted opacity-30" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-theme-muted">Tap to upload profile image</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-theme-muted uppercase tracking-wider block mb-1 pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/20 text-theme-text"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-theme-muted uppercase tracking-wider block mb-1 pl-1">Nickname</label>
                <input 
                  type="text" 
                  value={profileData.nickname}
                  onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/20 text-theme-text"
                  placeholder="CBT Master"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-theme-accent text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Profile</>}
            </button>
          </div>
        );
      case 'guide':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Users Guide</h2>
            </div>
            <div className="prose prose-slate text-sm space-y-4">
              <p className="text-theme-text opacity-90">Welcome to ZeeRaf CBT! Follow these steps to get started:</p>
              <ol className="space-y-2 list-decimal list-inside text-theme-muted">
                <li>Select your exam type (JAMB, WAEC, NECO) or Personal CBT.</li>
                <li>Practice with interactive CBT timers and detailed explanations.</li>
                <li>Visit the Fun Hub to duel peers, or chat with ZeeRaf AI for real-time tutoring.</li>
              </ol>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">About Developers</h2>
            </div>
            <div className="text-center space-y-4 pt-4">
              <div className="w-20 h-20 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto border border-theme-accent/20">
                <Info size={40} className="text-theme-accent" />
              </div>
              <h3 className="text-lg font-bold">@eemmpatech-empire</h3>
              <p className="text-xs text-theme-muted">
                Contact: <span className="text-theme-accent font-bold">eemmpatech@gmail.com</span>
              </p>
              <div className="pt-4 border-t border-theme-border mt-4 space-y-1 text-xs text-theme-muted opacity-80">
                <p>Powered by BMT mobile</p>
                <p>All right reserved @2026</p>
              </div>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Terms & Conditions</h2>
            </div>
            <div className="text-xs text-theme-muted space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="font-bold text-theme-text">1. System Access & Half-Yearly Terms</p>
              <p>Subscriptions renew every 6 months (₦5,000 for Claxy Mode, ₦8,000 for Claxy Pro Mode).</p>
            </div>
          </div>
        );
      case 'subscription':
        const subStatus = profile?.subscriptionStatus;
        const currentPlan = profile?.plan || 'Free';
        
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Subscription Plans</h2>
            </div>
            
            <div className="space-y-4">
              {/* Claxy Plan Card */}
              <div className="bg-theme-card border-2 border-theme-border p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-theme-text">Claxy Mode</h3>
                  <span className="text-xs font-black text-theme-accent">₦5,000 / 6 Months</span>
                </div>
                <p className="text-xs text-theme-muted">
                  Full CBT access, 2 ZeeRaf AI name edits, and 1v1 duel matches for 6 months.
                </p>
              </div>

              {/* Claxy Pro Plan Card */}
              <div className="bg-gradient-to-br from-theme-accent to-indigo-600 p-5 rounded-2xl text-white space-y-2 shadow-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base">Claxy Pro Mode</h3>
                  <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-full">₦8,000 / 6 Months</span>
                </div>
                <p className="text-xs text-white/80">
                  Priority AI lecture transcription, 8 ZeeRaf AI name edits, unlimited CBT exams & trophies.
                </p>
              </div>

              <button 
                onClick={() => {
                  onNavigate?.('subscription_portal');
                  setIsOpen(false);
                }}
                className="w-full bg-theme-accent text-white font-black py-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Manage & Upgrade Subscription
              </button>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-theme-text">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setActiveMenu('main')} className="p-1 hover:bg-theme-bg rounded-full transition-colors text-theme-muted">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Account Change</h2>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-xs text-theme-muted">Logged in as:</p>
              <div className="p-4 bg-theme-bg rounded-xl border border-theme-border">
                <p className="text-sm font-bold text-theme-text">{user?.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-rose-500 font-bold border border-rose-500/20 rounded-xl hover:bg-rose-500/5 transition-all"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 text-theme-text">
            {/* Logo & User Info Header */}
            <div className="pt-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-theme-accent rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">Z</div>
                <div>
                  <h2 className="text-lg font-black text-theme-text leading-none">ZeeRaf</h2>
                  <p className="text-[10px] text-theme-accent font-black tracking-widest uppercase">CBT System</p>
                </div>
              </div>
              <p className="text-xs text-theme-muted font-medium italic opacity-60 truncate">{user?.email}</p>
            </div>

            {/* FIRST ITEM IN MENU: Instant Feature Search Input */}
            <div className="relative bg-theme-card border border-theme-border focus-within:border-theme-accent rounded-2xl p-2.5 flex items-center gap-2 shadow-inner transition-all">
              <Search size={18} className="text-theme-accent shrink-0" />
              <input
                type="text"
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                placeholder="Search features (e.g. 'browser', 'ai', 'cbt')..."
                className="w-full bg-transparent border-none outline-none text-xs font-extrabold text-theme-text placeholder:text-theme-muted placeholder:font-normal"
              />
              {menuSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMenuSearchQuery('')}
                  className="p-1 text-theme-muted hover:text-theme-text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Menu Items List */}
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredMenuItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-theme-muted space-y-1 bg-theme-card rounded-2xl border border-theme-border">
                  <p className="font-bold text-theme-text">No features found</p>
                  <p>Try searching "Browser", "AI", "CBT", or "Theme".</p>
                </div>
              ) : (
                filteredMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if ('action' in item && typeof item.action === 'string') {
                        onNavigate?.(item.action as any);
                        setIsOpen(false);
                      } else if ('state' in item) {
                        setActiveMenu(item.state);
                      }
                    }}
                    className="w-full flex items-center gap-3.5 p-3 text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 rounded-2xl transition-all group text-left"
                  >
                    <div className="p-2 bg-theme-bg text-theme-muted rounded-xl group-hover:bg-theme-accent/10 group-hover:text-theme-accent transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-bold text-xs text-theme-text group-hover:text-theme-accent">{item.label}</span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-theme-border">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3.5 p-3 text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all group"
              >
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-500/20 group-hover:text-rose-600 transition-colors">
                  <LogOut size={18} />
                </div>
                <span className="font-bold text-xs">Log Out</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setActiveMenu('main');
        }}
        className="p-2 hover:bg-theme-bg rounded-xl transition-all active:scale-90"
        aria-label="Toggle menu"
      >
        <Menu size={24} className="text-theme-muted" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-theme-bg shadow-2xl z-[101] flex flex-col p-6 overflow-y-auto border-r border-theme-border"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-theme-card rounded-full transition-colors"
                title="Close Menu"
              >
                <X size={20} className="text-theme-muted" />
              </button>
              
              <div className="flex-1 flex flex-col">
                {renderContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
