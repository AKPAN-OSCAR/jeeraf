import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, ArrowLeft, 
  Calendar, User, ChevronRight,
  Search, Gamepad2, Trophy, ArrowUpRight
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';

interface BlogPageProps {
  user: any;
  profile?: any;
  onBack: () => void;
  onNavigateTo?: (target: 'fun' | 'awards' | 'dashboard' | 'system_ai' | 'textbooks') => void;
}

export interface BlogPost {
  id: string;
  title: string;
  category: 'App News' | 'Historic' | 'New Features' | 'Exam Guide';
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  tags: string[];
  actionTarget?: 'fun' | 'awards' | 'system_ai';
  actionLabel?: string;
}

// Built-in initial blog dataset
export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Discover 1v1 CBT Duels & Multiplayer Games in the Dash Menu!',
    category: 'New Features',
    date: '2026-07-25',
    author: 'JeeRaf Gaming Team',
    readTime: '3 min read',
    summary: 'Challenge friends to 1v1 live CBT room duels, speed math battles, and memory flip quizzes. Located right in your sidebar dash menu!',
    content: `Study doesn't have to be solitary! We have launched a dedicated multiplayer Fun & Games Hub in the sidebar menu.

    ### What You Can Do in the Fun & Games Room:
    1. **1v1 CBT Duels**: Challenge any candidate using a room code to see who answers 10 questions faster.
    2. **Speed Math Blitz**: Test your mental math calculations under a 60-second ticking clock.
    3. **Memory & Vocab Flips**: Match key terms and concepts in record time.
    4. **Leaderboards & Awards**: Earn trophy badges that display automatically in your Awards Cabinet!

    Access the Fun Hub directly from the top-left sidebar menu anytime!`,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
    tags: ['Games', 'Duels', 'Fun', 'DashMenu'],
    actionTarget: 'fun',
    actionLabel: 'Launch 1v1 Duels Room'
  },
  {
    id: 'post-2',
    title: 'Unlock Trophy Badges & Rewards in Your Awards Cabinet',
    category: 'App News',
    date: '2026-07-24',
    author: 'JeeRaf Gamification',
    readTime: '2 min read',
    summary: 'Earn gold, silver, and bronze badges for scoring 80%+ on mock CBTs, completing daily streaks, and winning room duels.',
    content: `Celebrate your academic milestones! Every high score, 1v1 duel victory, and AI lecture transcription awards you points and badges.

    Check your Awards Cabinet in the Dash Menu to see your current rank, unlocked trophies, and progress toward Master Candidate status!`,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
    tags: ['Awards', 'Trophies', 'Rankings'],
    actionTarget: 'awards',
    actionLabel: 'Open Awards Cabinet'
  },
  {
    id: 'post-3',
    title: 'The History of JeeRaf: Building Africa\'s Premier CBT Engine',
    category: 'Historic',
    date: '2026-05-10',
    author: 'EmmPaTech Empire',
    readTime: '5 min read',
    summary: 'How JeeRaf transformed from a simple study script into a full offline and online AI-driven exam engine.',
    content: `JeeRaf was conceived to tackle a critical challenge faced by thousands of JAMB, WAEC, and NECO candidates: lack of realistic, high-speed practice tools.
    
    From our initial release with basic offline question sets, we expanded into custom AI textbook question extractors, audio lecture transcription, and real-time candidate analytics.
    
    Today, thousands of candidates rely on JeeRaf daily to build speed, accuracy, and confidence.`,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    tags: ['History', 'Mission', 'Education']
  },
  {
    id: 'post-4',
    title: 'Top 5 Strategies for Scoring 300+ in JAMB UTME',
    category: 'Exam Guide',
    date: '2026-04-18',
    author: 'Academic Advisory',
    readTime: '4 min read',
    summary: 'Master time management, subject prioritization, and error reduction with our proven CBT practice routine.',
    content: `Scoring above 300 in JAMB requires strategy as much as studying.
    
    1. **Master the Timer**: Practice 40 questions in under 30 minutes using JeeRaf mock mode.
    2. **Target Weak Topics**: Use our performance breakdown charts to pinpoint areas requiring revision.
    3. **Solve Past Questions Continuously**: Familiarity with question styles reduces test anxiety.`,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    tags: ['JAMB', 'UTME', 'Study Tips']
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ user, profile, onBack, onNavigateTo }) => {
  const [posts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const categories = ['All', 'New Features', 'App News', 'Historic', 'Exam Guide'];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-4 md:p-8 flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-theme-border max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} onNavigate={onNavigateTo} />
          <button onClick={onBack} className="p-2 bg-theme-card rounded-xl border border-theme-border hover:bg-theme-bg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Newspaper className="text-theme-accent" size={28} /> JeeRaf Official Blog & News
            </h1>
            <p className="text-xs text-theme-muted font-medium">Discover app updates, feature spotlights, and exam preparation guides</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full space-y-8 flex-1">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-theme-card p-4 rounded-2xl border border-theme-border shadow-sm">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search news or updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-theme-accent text-white shadow-md' 
                    : 'bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-theme-card border border-theme-border rounded-3xl overflow-hidden shadow-lg hover:border-theme-accent/40 transition-all flex flex-col group cursor-pointer"
              onClick={() => setActivePost(post)}
            >
              <div className="relative h-48 overflow-hidden bg-theme-bg">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-theme-card/90 backdrop-blur-md border border-theme-border text-theme-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-theme-muted font-semibold">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-theme-text group-hover:text-theme-accent transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-theme-muted line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-theme-border flex items-center justify-between">
                  <span className="text-[11px] font-bold text-theme-accent flex items-center gap-1">
                    Read Article <ChevronRight size={14} />
                  </span>
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[9px] bg-theme-bg border border-theme-border px-2 py-0.5 rounded-md text-theme-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Full Post Reader Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-theme-card border border-theme-border rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative text-theme-text"
            >
              <button 
                onClick={() => setActivePost(null)}
                className="absolute top-6 right-6 p-2 bg-theme-bg border border-theme-border rounded-xl text-theme-muted hover:text-theme-text"
              >
                ✕
              </button>

              <div className="space-y-3">
                <span className="bg-theme-accent/10 text-theme-accent border border-theme-accent/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {activePost.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-black">{activePost.title}</h2>
                <div className="flex items-center gap-4 text-xs text-theme-muted font-medium border-b border-theme-border pb-4">
                  <span className="flex items-center gap-1"><User size={14} /> {activePost.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {activePost.date}</span>
                </div>
              </div>

              <img 
                src={activePost.imageUrl} 
                alt={activePost.title} 
                className="w-full h-64 md:h-80 object-cover rounded-2xl border border-theme-border shadow-md"
              />

              <div className="prose dark:prose-invert text-sm leading-relaxed text-theme-text space-y-4 whitespace-pre-line font-medium">
                {activePost.content}
              </div>

              {/* Direct CTA link to feature in Dash Menu if featured */}
              {activePost.actionTarget && onNavigateTo && (
                <div className="p-4 bg-theme-accent/10 border border-theme-accent/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activePost.actionTarget === 'fun' ? <Gamepad2 className="text-amber-500" size={20} /> : <Trophy className="text-amber-500" size={20} />}
                    <span className="text-xs font-black text-theme-text">Try this feature in the Dash Menu:</span>
                  </div>
                  <button
                    onClick={() => {
                      const target = activePost.actionTarget!;
                      setActivePost(null);
                      onNavigateTo(target);
                    }}
                    className="px-4 py-2 bg-theme-accent text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-theme-accent/20"
                  >
                    <span>{activePost.actionLabel || 'Go to Feature'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-theme-border flex justify-between items-center">
                <div className="flex gap-2">
                  {activePost.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-theme-bg border border-theme-border px-3 py-1 rounded-lg text-theme-muted font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setActivePost(null)}
                  className="px-6 py-2.5 bg-theme-accent text-white font-bold rounded-xl text-xs"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
