import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Home, Search, 
  CornerUpRight, Lock, Bookmark, Star, X, Plus,
  MoreVertical, Globe, ShieldCheck, ChevronLeft
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

    if (!target.includes('.') || target.includes(' ')) {
      target = `https://www.bing.com/search?q=${encodeURIComponent(target)}`;
    } else if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }

    setIsLoading(true);
    setCurrentUrl(target);
    setInputUrl(target);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), target]);
    setHistoryIndex(prev => prev + 1);
    setIframeKey(k => k + 1);

    setTimeout(() => setIsLoading(false), 800);
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
    setIsLoading(true);
    setIframeKey(k => k + 1);
    setTimeout(() => setIsLoading(false), 600);
  };

  const quickBookmarks = [
    { label: 'Google Search', url: 'https://www.bing.com' },
    { label: 'JAMB Portal', url: 'https://www.jamb.gov.ng' },
    { label: 'WAEC Nigeria', url: 'https://www.waecnigeria.org' },
    { label: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
    { label: 'Khan Academy', url: 'https://www.khanacademy.org' },
    { label: 'WolframAlpha', url: 'https://www.wolframalpha.com' },
  ];

  // Helper to get clean hostname for tab title
  const getTabTitle = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '') || 'New Tab';
    } catch {
      return url.slice(0, 20) || 'New Tab';
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2328] text-slate-200 flex flex-col w-full h-screen overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. CHROME TOP TAB BAR                                                     */}
      {/* ========================================================================= */}
      <div className="bg-[#191C20] pt-2 px-2 flex items-center justify-between border-b border-[#2D333B] shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 max-w-2xl">
          {/* Back to App Link / Sidebar Toggle */}
          <div className="flex items-center gap-1 mr-2 shrink-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 hover:bg-[#2D333B] text-slate-400 hover:text-white rounded-md transition-colors"
                title="Exit Browser to Dashboard"
              >
                <ChevronLeft size={16} />
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
          </div>

          {/* Active Chrome Tab */}
          <div className="flex items-center gap-2 bg-[#2D333B] text-slate-100 px-3.5 py-1.5 rounded-t-lg text-xs font-medium max-w-[220px] truncate shadow-sm border-t border-x border-[#373E47] relative">
            <Globe size={13} className="text-blue-400 shrink-0" />
            <span className="truncate flex-1 font-semibold">{getTabTitle(currentUrl)}</span>
            <button
              type="button"
              onClick={() => navigateToUrl('https://www.bing.com')}
              className="p-0.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>

          {/* New Tab Button */}
          <button
            type="button"
            onClick={() => navigateToUrl('https://www.bing.com')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#2D333B] rounded-full transition-colors shrink-0"
            title="New tab"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Chrome Window Action: Open Native Browser */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
            className="text-xs bg-[#2D333B] hover:bg-[#373E47] text-slate-300 hover:text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors border border-[#373E47] font-semibold"
            title="Open in Chrome App"
          >
            <CornerUpRight size={13} />
            <span className="hidden sm:inline">Open in Chrome</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHROME OMNIBOX & NAVIGATION TOOLBAR                                    */}
      {/* ========================================================================= */}
      <div className="bg-[#21262D] px-3 py-2 flex items-center gap-2 border-b border-[#30363D] shrink-0">
        {/* Navigation arrows */}
        <div className="flex items-center gap-0.5 text-slate-300">
          <button
            type="button"
            onClick={handleGoBackInHistory}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-full hover:bg-[#30363D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Click to go back"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleGoForwardInHistory}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-full hover:bg-[#30363D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Click to go forward"
          >
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={handleReload}
            className={`p-1.5 rounded-full hover:bg-[#30363D] transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Reload this page"
          >
            <RotateCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => navigateToUrl('https://www.bing.com')}
            className="p-1.5 rounded-full hover:bg-[#30363D] transition-colors hidden sm:inline-flex"
            title="Open the homepage"
          >
            <Home size={15} />
          </button>
        </div>

        {/* Chrome Rounded Omnibox Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigateToUrl(inputUrl);
          }}
          className="flex-1 flex items-center gap-2 bg-[#0D1117] hover:bg-[#161B22] focus-within:bg-[#0D1117] border border-[#30363D] focus-within:border-blue-500 rounded-full px-3.5 py-1.5 text-xs text-slate-100 transition-colors shadow-inner"
        >
          {/* SSL Lock */}
          <div className="flex items-center text-slate-400 hover:text-emerald-400 cursor-pointer" title="Connection is secure">
            <Lock size={12} className="text-emerald-400 mr-1" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={() => inputRef.current?.select()}
            placeholder="Search Google or type a URL"
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 font-normal tracking-wide text-xs"
          />

          {inputUrl && (
            <button
              type="button"
              onClick={() => {
                setInputUrl('');
                inputRef.current?.focus();
              }}
              className="text-slate-500 hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}

          {/* Bookmark Star */}
          <button
            type="button"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-0.5 transition-colors ${isBookmarked ? 'text-blue-400 fill-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            title="Bookmark this tab"
          >
            <Star size={13} className={isBookmarked ? 'fill-blue-400' : ''} />
          </button>
        </form>

        {/* Chrome 3 Dots / External Launch */}
        <button
          type="button"
          onClick={() => window.open(currentUrl, '_blank', 'noopener,noreferrer')}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#30363D] rounded-full transition-colors"
          title="Open in Device Browser"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHROME BOOKMARKS BAR                                                   */}
      {/* ========================================================================= */}
      <div className="bg-[#1C2128] px-3 py-1 flex items-center gap-1.5 border-b border-[#2D333B] overflow-x-auto scrollbar-none text-[11px] shrink-0">
        {quickBookmarks.map((bm) => (
          <button
            key={bm.url}
            type="button"
            onClick={() => navigateToUrl(bm.url)}
            className={`px-2.5 py-0.5 rounded flex items-center gap-1.5 text-slate-300 hover:bg-[#2D333B] hover:text-white transition-colors whitespace-nowrap ${
              currentUrl === bm.url ? 'bg-[#2D333B] text-white font-medium' : ''
            }`}
          >
            <Globe size={11} className="text-slate-400" />
            <span>{bm.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. EDGE-TO-EDGE CHROME WEB VIEW                                           */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white relative w-full h-full overflow-hidden">
        {/* Loading progress line */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse z-10" />
        )}

        <iframe
          key={iframeKey}
          src={currentUrl}
          title="Google Chrome Web View"
          className="w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};
