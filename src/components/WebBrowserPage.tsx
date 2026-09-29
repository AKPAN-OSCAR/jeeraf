import React, { useState, useEffect } from 'react';
import { 
  Globe, ArrowLeft, ArrowRight, RotateCw, Home, Search, 
  CornerUpRight, Lock, ShieldCheck, Compass, Bookmark,
  ExternalLink, Sparkles, X, ChevronLeft
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';

interface WebBrowserPageProps {
  initialUrl?: string;
  user?: any;
  profile?: any;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigateTo?: (target: string) => void;
}

export const WebBrowserPage: React.FC<WebBrowserPageProps> = ({
  initialUrl = 'https://www.bing.com',
  user,
  profile,
  onBack,
  onLogout,
  onNavigateTo
}) => {
  const defaultUrl = initialUrl || 'https://www.bing.com';
  const [currentUrl, setCurrentUrl] = useState<string>(defaultUrl);
  const [inputUrl, setInputUrl] = useState<string>(defaultUrl);
  const [history, setHistory] = useState<string[]>([defaultUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(0);

  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      let target = initialUrl.trim();
      if (!/^https?:\/\//i.test(target)) {
        target = 'https://' + target;
      }
      setCurrentUrl(target);
      setInputUrl(target);
      setHistory([target]);
      setHistoryIndex(0);
      setIframeKey(k => k + 1);
    }
  }, [initialUrl]);

  const navigateToUrl = (rawTarget: string) => {
    let target = rawTarget.trim();
    if (!target) return;

    // Check if search query or domain
    if (!target.includes('.') || target.includes(' ')) {
      target = `https://www.bing.com/search?q=${encodeURIComponent(target)}`;
    } else if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }

    setCurrentUrl(target);
    setInputUrl(target);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), target]);
    setHistoryIndex(prev => prev + 1);
    setIframeKey(k => k + 1);
  };

  const handleGoBackInHistory = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevUrl = history[prevIdx];
      setHistoryIndex(prevIdx);
      setCurrentUrl(prevUrl);
      setInputUrl(prevUrl);
      setIframeKey(k => k + 1);
    }
  };

  const handleGoForwardInHistory = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextUrl = history[nextIdx];
      setHistoryIndex(nextIdx);
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      setIframeKey(k => k + 1);
    }
  };

  const handleReload = () => {
    setIframeKey(k => k + 1);
  };

  const quickBookmarks = [
    { label: '🔍 Search Engine', url: 'https://www.bing.com' },
    { label: '📖 Wikipedia', url: 'https://en.m.wikipedia.org' },
    { label: '🎓 JAMB Portal', url: 'https://www.jamb.gov.ng' },
    { label: '📜 WAEC Portal', url: 'https://www.waecnigeria.org' },
    { label: '🧮 Khan Academy', url: 'https://www.khanacademy.org' },
    { label: '💻 Python Docs', url: 'https://docs.python.org/3/' },
    { label: '🔢 WolframAlpha', url: 'https://www.wolframalpha.com' },
    { label: '🌐 BBC World', url: 'https://www.bbc.com' }
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col p-3 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-theme-card border border-theme-border p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 bg-theme-bg hover:bg-theme-accent/10 hover:text-theme-accent text-theme-text rounded-xl border border-theme-border transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <SidebarMenu
            user={user}
            profile={profile}
            onLogout={onLogout || (() => {})}
            onNavigate={(target) => {
              if (onNavigateTo) onNavigateTo(target);
            }}
          />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-theme-accent/15 border border-theme-accent/30 rounded-xl flex items-center justify-center text-theme-accent">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-theme-text flex items-center gap-2">
                ZeeRaf World Browser
                <span className="bg-theme-accent/10 text-theme-accent text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border border-theme-accent/20">
                  Live Engine
                </span>
              </h1>
              <p className="text-xs text-theme-muted font-medium">
                Full-screen browser with instant search & worldwide web access
              </p>
            </div>
          </div>
        </div>

        {/* Direct Native Device Browser Launch Button */}
        <button
          type="button"
          onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
          className="px-4 py-2.5 bg-theme-accent hover:opacity-90 text-white font-black text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-theme-accent/20 transition-all active:scale-95 shrink-0"
          title="Open currently loaded website in your device default browser (Chrome/Safari)"
        >
          <CornerUpRight size={18} className="stroke-[2.5]" />
          <span className="hidden sm:inline">Open in Chrome / Device Browser</span>
        </button>
      </div>

      {/* Browser Controls & Search Bar Box matching System UI */}
      <div className="bg-theme-card border border-theme-border p-3 md:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Back, Forward, Refresh, Home buttons */}
          <div className="flex items-center gap-1 bg-theme-bg p-1.5 rounded-xl border border-theme-border shrink-0">
            <button
              type="button"
              onClick={handleGoBackInHistory}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-card disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleGoForwardInHistory}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-card disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Go Forward"
            >
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={handleReload}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-card transition-all"
              title="Reload Page"
            >
              <RotateCw size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigateToUrl('https://www.bing.com')}
              className="p-2 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-card transition-all"
              title="Home Search Engine"
            >
              <Home size={18} />
            </button>
          </div>

          {/* Main URL / Search Query Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigateToUrl(inputUrl);
            }}
            className="flex-1 flex items-center gap-2 bg-theme-bg border border-theme-border focus-within:border-theme-accent focus-within:ring-2 focus-within:ring-theme-accent/20 rounded-xl px-3.5 py-2 transition-all shadow-inner min-w-[240px]"
          >
            <Lock size={15} className="text-emerald-500 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Search Google/Bing or enter website URL (e.g., jamb.gov.ng)..."
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm font-extrabold text-theme-text placeholder:text-theme-muted"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="p-1 text-theme-muted hover:text-theme-text"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 bg-theme-accent text-white hover:opacity-90 font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
              title="Search or Go"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {/* Quick Bookmarks Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-extrabold scrollbar-none">
          <span className="text-theme-accent shrink-0 flex items-center gap-1 mr-1">
            <Compass size={14} /> Quick Bookmarks:
          </span>
          {quickBookmarks.map((bm) => (
            <button
              key={bm.url}
              type="button"
              onClick={() => navigateToUrl(bm.url)}
              className={`px-3 py-1 rounded-xl border whitespace-nowrap transition-all ${
                currentUrl === bm.url
                  ? 'bg-theme-accent text-white border-theme-accent font-black shadow-sm'
                  : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-accent hover:text-theme-text'
              }`}
            >
              {bm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Full-Screen Embedded Web View */}
      <div className="flex-1 min-h-[650px] bg-slate-950 rounded-2xl border-2 border-theme-border overflow-hidden shadow-2xl flex flex-col relative">
        {/* URL Header Status */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-extrabold">
          <div className="flex items-center gap-2 truncate max-w-[70%]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-amber-400 font-black truncate">{currentUrl}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-400 text-[11px] hidden md:inline">
              If a site blocks iframe embed, click Chrome button
            </span>
            <button
              type="button"
              onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
              className="text-amber-300 hover:text-amber-200 font-black underline flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              title="Open in native default browser"
            >
              <span>Chrome / Default Browser</span>
              <CornerUpRight size={13} />
            </button>
          </div>
        </div>

        <iframe
          key={iframeKey}
          src={currentUrl}
          title="ZeeRaf Web Browser"
          className="w-full flex-1 border-none min-h-[600px] bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};
