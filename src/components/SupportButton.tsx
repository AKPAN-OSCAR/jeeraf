import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, User, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { AIAvatar } from './AIAvatar';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is JeeRaf CBT?",
  "How does the AI-powered custom exam work?",
  "Which subjects are supported?",
  "How can I get Premium full access?",
];

// Pre-coded offline JS response database (0 API tokens consumed)
const OFFLINE_FAQ_RESPONSES: Record<string, string> = {
  "What is JeeRaf CBT?": `🌟 **JeeRaf CBT** is Nigeria's elite Computer-Based Testing preparation environment designed for candidates taking **JAMB UTME, WAEC, NECO**, and post-UTME examinations.

It features:
- Real-time countdown exam timers and score analytics.
- Built-in scientific calculator and past question banks.
- Personal CBT mode allowing candidates to upload study notes/textbooks for custom AI question parsing.
- Fun competitions and real-time JeeRaf AI assistant.`,

  "How does the AI-powered custom exam work?": `📚 **Personal CBT AI Extraction**:
1. Simply navigate to the **Personal CBT** tab.
2. Upload your textbook PDF, lecture notes, or audio recording.
3. Our system's offline parser extracts key concepts and formats them into high-quality multiple-choice questions complete with answers and explanations!`,

  "Which subjects are supported?": `🎯 **Comprehensive Subject Sets**:
We support all major arts, commercial, and science subjects:
- **Core**: Use of English, Mathematics
- **Sciences**: Physics, Chemistry, Biology
- **Commercial & Arts**: Economics, Government, Literature, Geography, Commerce, Accounting, CRK, IRK, and General Knowledge.`,

  "How can I get Premium full access?": `💳 **Half-Yearly Subscription Plans**:
JeeRaf offers two flexible 6-month subscription options:
- **Claxy Mode (₦5,000 / 6 Months)**: Unlocks full CBT exam simulations, 2 JeeRaf AI name edits, and 1v1 duel matches in the Fun Hub.
- **Claxy Pro Mode (₦8,000 / 6 Months)**: Unlocks 8 JeeRaf AI name edits, priority audio lecture transcription, and full trophy cabinet access!`
};

export const SupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! Welcome to the **JeeRaf CBT AI Help Desk**. 🌟\n\nI can answer any questions you have about our Computer-Based Testing preparation platform. Ask me about our subjects, custom AI question extraction, simulator features, or subscription plans!\n\nHow can I support your study journey today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Fast JS offline engine response (No Gemini API call = 0 tokens)
    setTimeout(() => {
      let responseText = OFFLINE_FAQ_RESPONSES[textToSend.trim()];

      if (!responseText) {
        const lower = textToSend.toLowerCase();
        if (lower.includes('jamb') || lower.includes('utme') || lower.includes('waec')) {
          responseText = OFFLINE_FAQ_RESPONSES["What is JeeRaf CBT?"];
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('pay') || lower.includes('claxy')) {
          responseText = OFFLINE_FAQ_RESPONSES["How can I get Premium full access?"];
        } else if (lower.includes('ai') || lower.includes('pdf') || lower.includes('audio')) {
          responseText = OFFLINE_FAQ_RESPONSES["How does the AI-powered custom exam work?"];
        } else if (lower.includes('subject')) {
          responseText = OFFLINE_FAQ_RESPONSES["Which subjects are supported?"];
        } else {
          responseText = `👋 Thank you for reaching out to **JeeRaf Help Desk**!\n\nJeeRaf CBT provides full practice simulations for JAMB, WAEC, and NECO, interactive 1v1 duels, and offline question parsers. Choose one of our suggested questions below or create an account to start practicing immediately!`;
        }
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 400);
  };

  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-sm">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-sm">{children}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-theme-accent">{children}</strong>,
  };

  return (
    <>
      <motion.button
        id="ai-support-trigger-btn"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-theme-accent to-indigo-600 hover:from-theme-accent hover:to-indigo-500 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.5)] border border-white/20 transition-all font-semibold text-xs tracking-wider uppercase"
        title="Open AI Help Desk"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Sparkles size={14} className="animate-pulse" />
        <span>Ask JeeRaf AI</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-support-page-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div
              id="ai-support-content-card"
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full h-full md:max-w-3xl md:h-[80vh] bg-slate-900 border-0 md:border border-slate-800 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
            >
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-theme-accent to-indigo-500 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm tracking-wide uppercase text-white flex items-center gap-2">
                      JeeRaf Offline AI Help Desk
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        0 Tokens Used
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Ask us anything about our CBT system & features</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer border border-slate-700/50"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-950 rounded-2xl flex items-start gap-3 shadow-inner">
                  <HelpCircle size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Instant Interactive Support</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Select any question below to view immediate instructions without consuming API tokens!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isAI = msg.role === 'model';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}
                      >
                        {isAI && <AIAvatar size="xs" />}
                        <div className="max-w-[82%]">
                          <div
                            className={`px-4 py-3.5 rounded-2xl text-xs shadow-md leading-relaxed ${
                              isAI
                                ? 'bg-slate-800/80 border border-slate-800 text-slate-100 rounded-tl-none'
                                : 'bg-gradient-to-r from-theme-accent to-indigo-600 text-white rounded-tr-none font-medium'
                            }`}
                          >
                            <div className="markdown-body">
                              <Markdown components={markdownComponents}>{msg.text}</Markdown>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-500 block mt-1.5 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!isAI && (
                          <div className="w-8 h-8 rounded-xl bg-theme-accent flex items-center justify-center shrink-0 text-white shadow-md">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3.5 justify-start">
                      <AIAvatar size="xs" isLoading={true} />
                      <div className="bg-slate-800/40 border border-slate-800/60 px-5 py-3 rounded-2xl text-slate-400 text-xs">
                        JeeRaf AI is processing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800/60 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggested Questions</span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        disabled={isLoading}
                        className="text-[11px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-800 transition-all text-left cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about JAMB sets, plans, subjects..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-2 border-none outline-none text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputText.trim()}
                    className="p-3 bg-theme-accent hover:bg-theme-accent/90 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-md"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
