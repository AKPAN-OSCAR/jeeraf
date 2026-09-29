import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Search, BookOpen, Download, Globe, FileText, X, Eye, Filter
} from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { BookReaderModal } from './BookReaderModal';
import { LibraryBook, ALL_BUILTIN_BOOKS, onDeletedBooksSnapshot } from '../library';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface TextbookSelectionProps {
  onBack: () => void;
  onLogout: () => void;
  user: any;
  profile?: any;
  onOpenBrowserUrl?: (url: string) => void;
}

export const TextbookSelection: React.FC<TextbookSelectionProps> = ({ 
  onBack, 
  onLogout, 
  user, 
  profile,
  onOpenBrowserUrl 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'national' | 'universal' | 'general' | 'ebooks' | 'pdfs'>('all');
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [readerMode, setReaderMode] = useState<'read' | 'download'>('read');

  // Sync deleted book IDs in real time
  useEffect(() => {
    const unsub = onDeletedBooksSnapshot((ids) => {
      setDeletedBookIds(ids);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore sync with library_books collection
  useEffect(() => {
    if (!db) {
      setBooks(ALL_BUILTIN_BOOKS);
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, 'library_books'));
      const unsub = onSnapshot(q, (snapshot) => {
        const fetchedBooks: LibraryBook[] = [];
        snapshot.forEach((docSnap) => {
          fetchedBooks.push({ id: docSnap.id, ...docSnap.data() } as LibraryBook);
        });

        // Merge in-code built-in books with Firestore books (Firestore overrides/supplements)
        const bookMap = new Map<string, LibraryBook>();
        ALL_BUILTIN_BOOKS.forEach(b => bookMap.set(b.id, b));
        fetchedBooks.forEach(b => bookMap.set(b.id, b));

        setBooks(Array.from(bookMap.values()));
        setLoading(false);
      }, (err) => {
        console.warn("Library books sync error:", err);
        setBooks(ALL_BUILTIN_BOOKS);
        setLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Error attaching library books listener:", e);
      setBooks(ALL_BUILTIN_BOOKS);
      setLoading(false);
    }
  }, []);

  // Filter books based on search query, category pill selection, and deleted status
  const filteredBooks = books.filter((book) => {
    if (deletedBookIds.includes(book.id)) return false;

    // 1. Search Query Match
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || [
      book.title,
      book.author,
      book.subject,
      book.examTarget,
      book.description,
      book.section,
      book.fileName,
      ...(book.keywords || [])
    ].some(field => field && field.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // 2. Category Filter Match
    if (activeFilter === 'national') return book.section === 'national';
    if (activeFilter === 'universal') return book.section === 'universal';
    if (activeFilter === 'general') return book.section === 'general';
    if (activeFilter === 'ebooks') {
      return book.format === 'electronic' || book.format === 'both' || (book.chapters && book.chapters.length > 0);
    }
    if (activeFilter === 'pdfs') {
      return book.format === 'file' || book.format === 'both' || book.fileType?.toLowerCase() === 'pdf' || Boolean(book.fileUrl);
    }

    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenReader = (book: LibraryBook, mode: 'read' | 'download') => {
    setSelectedBook(book);
    setReaderMode(mode);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col transition-colors duration-300">
      {/* Header matching main system UI */}
      <header className="bg-theme-card border-b border-theme-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <SidebarMenu 
            user={user} 
            profile={profile}
            onLogout={onLogout} 
          />
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-theme-bg rounded-xl transition-all border border-transparent hover:border-theme-border"
            title="Go Back"
          >
            <ChevronLeft size={22} className="text-theme-muted" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-theme-accent rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              J
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-theme-text leading-none tracking-tight">
                JeeRaf Library
              </h1>
              <p className="text-[10px] text-theme-muted font-bold uppercase tracking-widest mt-1">
                Digital Academic Repository
              </p>
            </div>
          </div>
        </div>

        {onOpenBrowserUrl && (
          <button
            onClick={() => onOpenBrowserUrl('https://www.google.com')}
            className="px-3.5 py-2 bg-theme-accent/10 hover:bg-theme-accent/20 border border-theme-accent/30 text-theme-accent font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            title="Open Web Browser"
          >
            <Globe size={15} />
            <span className="hidden sm:inline">Web Browser</span>
          </button>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Search Bar & Web Browser Button */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-accent" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library by title, author, subject, exam, or keywords..."
              className="w-full pl-11 pr-10 py-3.5 bg-theme-card border border-theme-border focus:border-theme-accent rounded-2xl text-xs sm:text-sm font-bold text-theme-text placeholder:text-theme-muted outline-none transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-theme-muted hover:text-theme-text p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-3.5 bg-theme-accent text-white hover:opacity-90 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-theme-accent/20 active:scale-95"
            >
              <Search size={16} />
              <span>Search</span>
            </button>

            {onOpenBrowserUrl && (
              <button
                type="button"
                onClick={() => onOpenBrowserUrl('https://www.google.com')}
                className="px-5 py-3.5 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-accent hover:border-theme-accent/50 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 active:scale-95"
                title="Launch Web Browser"
              >
                <Globe size={16} className="text-theme-accent" />
                <span className="hidden md:inline">Web Browser</span>
              </button>
            )}
          </div>
        </form>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Books' },
            { id: 'national', label: 'National Curricula' },
            { id: 'universal', label: 'Higher Ed & STEM' },
            { id: 'general', label: 'General & Literature' },
            { id: 'ebooks', label: 'E-Books' },
            { id: 'pdfs', label: 'Downloadable PDFs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeFilter === cat.id
                  ? 'bg-theme-accent text-white shadow-md shadow-theme-accent/20'
                  : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Book Grid / States */}
        {loading ? (
          <div className="bg-theme-card border border-theme-border p-12 rounded-3xl text-center space-y-3">
            <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-theme-muted font-bold">Syncing library collection...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Empty Library / No Search Results State */
          <div className="bg-theme-card border border-theme-border p-12 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-theme-bg border border-theme-border rounded-2xl flex items-center justify-center text-theme-muted mx-auto">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-theme-text">No Books Found</h3>
              <p className="text-xs text-theme-muted max-w-md mx-auto font-medium">
                {searchQuery || activeFilter !== 'all'
                  ? 'No materials matched your search or category filter.'
                  : 'The library catalog is currently empty. Uploaded textbooks and PDFs will appear here.'}
              </p>
            </div>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-5 py-2.5 bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent border border-theme-accent/30 text-xs font-black rounded-xl transition-all"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          /* Book Cards Grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-theme-card border border-theme-border hover:border-theme-accent/50 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm hover:shadow-md group"
              >
                {/* Book Header & Cover */}
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-theme-bg border border-theme-border flex items-center justify-center">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-theme-accent/5">
                        <BookOpen size={36} className="text-theme-accent mb-1" />
                        <span className="text-[10px] font-black uppercase text-theme-accent tracking-wider">
                          {book.subject || book.section}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-theme-card/90 backdrop-blur-md text-theme-accent border border-theme-border text-[9px] font-black uppercase rounded-md shadow-sm">
                        {book.section}
                      </span>
                      {book.fileType && (
                        <span className="px-2 py-0.5 bg-theme-card/90 backdrop-blur-md text-emerald-500 border border-theme-border text-[9px] font-black uppercase rounded-md shadow-sm">
                          {book.fileType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-theme-text leading-snug line-clamp-2 group-hover:text-theme-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-theme-muted font-bold truncate">
                      Author: {book.author}
                    </p>
                    {book.examTarget && (
                      <p className="text-[11px] text-theme-accent font-semibold truncate">
                        Target: {book.examTarget}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-theme-border grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenReader(book, 'read')}
                    className="py-2.5 bg-theme-accent hover:opacity-90 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-theme-accent/20 active:scale-95"
                  >
                    <BookOpen size={14} />
                    <span>Read</span>
                  </button>
                  <button
                    onClick={() => handleOpenReader(book, 'download')}
                    className="py-2.5 bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download size={14} className="text-theme-accent" />
                    <span>Download</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Reader / Download Modal */}
      {selectedBook && (
        <BookReaderModal
          book={selectedBook}
          initialMode={readerMode}
          onClose={() => setSelectedBook(null)}
          onOpenBrowserUrl={onOpenBrowserUrl}
        />
      )}
    </div>
  );
};
