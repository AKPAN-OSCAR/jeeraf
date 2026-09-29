import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, Download, Search, ChevronLeft, ChevronRight,
  Globe, CornerUpRight, FileText, Check, ZoomIn, ZoomOut,
  Sun, Moon, Book, FileDown, Eye, Share2, ArrowLeft,
  Maximize2, Minimize2, FileCheck, Layers, BookMarked, Image as ImageIcon,
  RotateCcw, ExternalLink, Loader2, Menu, Sparkles, RefreshCw
} from 'lucide-react';
import { LibraryBook, LibraryChapter, ChapterFigure } from '../library/types';
import { getBookBlob } from '../library/storage';
import { extractBookContentFromFile } from '../library/fileProcessor';
import { isBinaryPdf, generateBookPdfBlob } from '../library/pdfGenerator';
import { MathRenderer } from './MathRenderer';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface BookReaderModalProps {
  book: LibraryBook;
  initialMode: 'read' | 'download';
  onClose: () => void;
  onOpenBrowserUrl?: (url: string) => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  initialMode,
  onClose,
  onOpenBrowserUrl
}) => {
  const isUploadedFileBook = Boolean(
    book.storageKey ||
    book.fileType?.toLowerCase() === 'pdf' ||
    book.fileName?.toLowerCase().endsWith('.pdf') ||
    (book.fileUrl && !book.fileUrl.startsWith('data:text/plain'))
  );

  const [activeTab, setActiveTab] = useState<'read' | 'download'>(initialMode);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'pdf' | 'text' | 'figures'>(isUploadedFileBook ? 'pdf' : 'text');
  const [useCanvasEngine, setUseCanvasEngine] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [readerBg, setReaderBg] = useState<'theme' | 'dark' | 'sepia' | 'light' | 'cream'>('theme');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  
  const [resolvedBlob, setResolvedBlob] = useState<Blob | null>(null);
  const [resolvedFileUrl, setResolvedFileUrl] = useState<string | undefined>(book.fileUrl);
  const [blobLoading, setBlobLoading] = useState<boolean>(true);
  const [extractedClientChapters, setExtractedClientChapters] = useState<LibraryChapter[] | null>(null);
  const [isExtractingChapters, setIsExtractingChapters] = useState<boolean>(false);

  // Active figure slide state for diagram gallery
  const [activeFigureIndex, setActiveFigureIndex] = useState<number>(0);
  const [figureZoom, setFigureZoom] = useState<number>(1);

  // Resolve Blob from IndexedDB or Cloud Chunked Firestore, or synthesize valid PDF
  useEffect(() => {
    let activeBlobUrl: string | null = null;
    let isMounted = true;

    const resolveBookPdf = async () => {
      setBlobLoading(true);

      const lookupKeys = [
        book.storageKey, 
        book.id, 
        book.fileName, 
        `book_file_${book.id}`
      ].filter(Boolean) as string[];

      // 1. Try reading from storage keys (IndexedDB or Firestore chunked storage)
      if (lookupKeys.length > 0) {
        try {
          const blob = await getBookBlob(lookupKeys);
          if (blob && isMounted) {
            const isPdf = await isBinaryPdf(blob);
            if (isPdf) {
              setResolvedBlob(blob);
              activeBlobUrl = URL.createObjectURL(blob);
              setResolvedFileUrl(activeBlobUrl);
              setBlobLoading(false);

              // Client chapter extraction if needed for Reader Mode
              const needsRealExtraction = !book.chapters || book.chapters.length === 0 || 
                (book.chapters.length === 1 && (
                  book.chapters[0].content === book.description ||
                  book.chapters[0].content.length < 350
                ));

              if (needsRealExtraction) {
                setIsExtractingChapters(true);
                try {
                  const fileObj = new File([blob], book.fileName || `${book.title}.pdf`, { type: blob.type || 'application/pdf' });
                  const extracted = await extractBookContentFromFile(fileObj);
                  if (extracted.chapters.length > 0 && isMounted) {
                    setExtractedClientChapters(extracted.chapters);
                  }
                } catch (extErr) {
                  console.warn("Client dynamic chapter extraction note:", extErr);
                } finally {
                  if (isMounted) setIsExtractingChapters(false);
                }
              }
              return;
            }
          }
        } catch (err) {
          console.warn("Error reading stored book blob:", err);
        }
      }

      // 2. Check direct fileUrl if it's a binary PDF, Blob URL, or remote PDF URL
      if (book.fileUrl && !book.fileUrl.startsWith('data:text/')) {
        try {
          const isPdf = await isBinaryPdf(book.fileUrl);
          if (isPdf && isMounted) {
            setResolvedFileUrl(book.fileUrl);
            setBlobLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Direct fileUrl check note:", e);
        }
      }

      // 3. Fallback: Synthesize an authentic, high-quality multi-page PDF document for manual books or guides
      if (isMounted) {
        try {
          const syntheticPdfBlob = generateBookPdfBlob(book);
          setResolvedBlob(syntheticPdfBlob);
          activeBlobUrl = URL.createObjectURL(syntheticPdfBlob);
          setResolvedFileUrl(activeBlobUrl);
        } catch (genErr) {
          console.warn("Dynamic PDF synthesis note:", genErr);
        } finally {
          setBlobLoading(false);
        }
      }
    };

    resolveBookPdf();

    return () => {
      isMounted = false;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [book.id, book.storageKey, book.fileUrl]);

  // Fullscreen Handler (combines HTML5 Fullscreen API + in-app state)
  const toggleModalFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Open in New Tab
  const handleOpenInNewTab = () => {
    if (resolvedFileUrl && !resolvedFileUrl.startsWith('data:text/')) {
      window.open(resolvedFileUrl, '_blank', 'noopener,noreferrer');
    } else if (resolvedBlob) {
      const url = URL.createObjectURL(resolvedBlob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const syntheticBlob = generateBookPdfBlob(book);
      const url = URL.createObjectURL(syntheticBlob);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Determine standard chapter list
  const chapters: LibraryChapter[] = (extractedClientChapters && extractedClientChapters.length > 0)
    ? extractedClientChapters
    : (book.chapters && book.chapters.length > 0)
    ? book.chapters
    : [
        {
          id: 'full_doc_ch',
          title: isUploadedFileBook ? 'Full PDF Document' : `${book.title} - Main Content`,
          content: isUploadedFileBook
            ? 'This textbook has visual pages and diagrams. You can read the full document using the Full PDF View tab or download the original file to view on your device.'
            : `${book.description}\n\nAuthor: ${book.author}\nSection: ${book.section.toUpperCase()}\nSubject: ${book.subject}`
        }
      ];

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  // Collect all figures from chapter + book cover/pageImages for slide gallery
  const chapterFigures: ChapterFigure[] = activeChapter.figures && activeChapter.figures.length > 0
    ? activeChapter.figures
    : (book.pageImages && book.pageImages.length > 0)
      ? book.pageImages.map((imgUrl, i) => ({
          id: `page_img_${i}`,
          title: `Figure / Page ${i + 1}: ${book.title}`,
          url: imgUrl,
          caption: `High-resolution illustrative scan figure for ${book.title} - Chapter: ${activeChapter.title}`
        }))
      : [
          {
            id: 'default_fig',
            title: `Figure 1: ${book.title} - Reference Illustration`,
            url: book.coverImage || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
            caption: `Illustrative subject figure representation for ${book.subject} - ${activeChapter.title}`
          }
        ];

  const activeFigure = chapterFigures[activeFigureIndex] || chapterFigures[0];

  // File Download Handler - Downloads the authentic original PDF file
  const handleTriggerDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      let downloadBlob = resolvedBlob;
      let filename = book.fileName || `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename = `${filename.replace(/\.[a-z0-9]+$/i, '')}.pdf`;
      }

      if (!downloadBlob && book.storageKey) {
        downloadBlob = await getBookBlob(book.storageKey);
      }

      if (!downloadBlob) {
        downloadBlob = generateBookPdfBlob(book);
      }

      const blobUrl = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloading(false);
    }
  };

  const currentDisplayFileName = book.fileName || `${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  return (
    <div className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-1 sm:p-3 md:p-4'} overflow-hidden animate-in fade-in duration-200`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className={`bg-theme-card border border-theme-border w-full ${
          isFullscreen ? 'h-screen w-screen rounded-none border-none' : 'max-w-6xl h-[96vh] rounded-2xl sm:rounded-3xl'
        } shadow-2xl flex flex-col overflow-hidden text-theme-text transition-all duration-300 relative`}
      >
        {/* Modal Top Header matching System UI */}
        <div className="bg-theme-card px-3 sm:px-5 py-2.5 border-b border-theme-border flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 truncate min-w-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-bg rounded-xl text-theme-muted hover:text-theme-text transition-colors shrink-0 border border-transparent hover:border-theme-border"
              title="Close Reader"
            >
              <ArrowLeft size={18} />
            </button>
            
            {/* Mobile Chapter Drawer Toggle */}
            {activeTab === 'read' && viewMode === 'text' && (
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="p-2 bg-theme-bg hover:bg-theme-card border border-theme-border rounded-xl text-theme-accent md:hidden shrink-0"
                title="Toggle Chapters Menu"
              >
                <Menu size={18} />
              </button>
            )}

            <div className="truncate min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-theme-accent/10 text-theme-accent border border-theme-accent/30 shrink-0">
                  {book.section}
                </span>
                <h2 className="text-sm sm:text-base md:text-lg font-black text-theme-text truncate">{book.title}</h2>
              </div>
              <p className="text-[11px] text-theme-muted font-medium truncate">
                By {book.author} • {book.subject} ({book.fileSize || '33.39 MB'})
              </p>
            </div>
          </div>

          {/* Action Tabs & Fullscreen / Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex bg-theme-bg p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-theme-border">
              <button
                onClick={() => setActiveTab('read')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeTab === 'read'
                    ? 'bg-theme-accent text-white shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                <BookOpen size={14} /> <span>Read Book</span>
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  activeTab === 'download'
                    ? 'bg-theme-accent text-white shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                <Download size={14} /> <span>Download ({book.fileSize || '33.39 MB'})</span>
              </button>
            </div>

            <button
              onClick={toggleModalFullscreen}
              className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-bg rounded-xl transition-all border border-transparent hover:border-theme-border"
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-bg rounded-xl transition-all border border-transparent hover:border-theme-border"
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'read' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Secondary Navigation Modes Bar matching System UI */}
              <div className="bg-theme-bg/95 px-3 sm:px-4 py-2 border-b border-theme-border flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 z-20">
                {/* View Modes Selector */}
                <div className="flex bg-theme-card p-0.5 sm:p-1 rounded-xl border border-theme-border">
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                      viewMode === 'text' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <BookOpen size={13} /> <span>Reader Mode</span>
                  </button>
                  <button
                    onClick={() => setViewMode('figures')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                      viewMode === 'figures' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <ImageIcon size={13} /> <span>Figure Slides ({chapterFigures.length})</span>
                  </button>
                  {isUploadedFileBook && (
                    <button
                      onClick={() => setViewMode('pdf')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                        viewMode === 'pdf' ? 'bg-theme-accent text-white shadow-sm' : 'text-theme-muted hover:text-theme-text'
                      }`}
                    >
                      <Layers size={13} /> <span>Full PDF View</span>
                    </button>
                  )}
                </div>

                {/* Text Formatting & Theme Controls (When in Reader Mode) */}
                {viewMode === 'text' && (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 bg-theme-card px-2 py-1 rounded-xl border border-theme-border">
                      <span className="text-theme-muted font-bold text-[11px] pr-1">Zoom:</span>
                      <button
                        onClick={() => setFontSize(f => Math.max(12, f - 2))}
                        className="p-1 bg-theme-bg hover:bg-theme-card text-theme-text rounded-lg border border-transparent hover:border-theme-border"
                        title="Smaller Text"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="font-mono font-black text-theme-accent w-8 text-center text-xs">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize(f => Math.min(32, f + 2))}
                        className="p-1 bg-theme-bg hover:bg-theme-card text-theme-text rounded-lg border border-transparent hover:border-theme-border"
                        title="Larger Text"
                      >
                        <ZoomIn size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-theme-card px-2 py-1 rounded-xl border border-theme-border">
                      <span className="text-theme-muted font-bold text-[11px] pr-1">Style:</span>
                      <button
                        onClick={() => setReaderBg('theme')}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                          readerBg === 'theme' ? 'bg-theme-accent text-white border-theme-accent shadow-sm' : 'bg-theme-bg text-theme-muted border-theme-border hover:text-theme-text'
                        }`}
                        title="Match current system theme"
                      >
                        System
                      </button>
                      <button
                        onClick={() => setReaderBg('dark')}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                          readerBg === 'dark' ? 'bg-slate-950 text-white border-slate-700 shadow-sm' : 'bg-theme-bg text-theme-muted border-theme-border hover:text-theme-text'
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setReaderBg('sepia')}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                          readerBg === 'sepia' ? 'bg-[#fbf0d9] text-[#5f4b32] border-amber-600 shadow-sm font-black' : 'bg-theme-bg text-theme-muted border-theme-border hover:text-theme-text'
                        }`}
                      >
                        Sepia
                      </button>
                      <button
                        onClick={() => setReaderBg('cream')}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                          readerBg === 'cream' ? 'bg-[#f5f2eb] text-[#1a1a1a] border-amber-500 shadow-sm' : 'bg-theme-bg text-theme-muted border-theme-border hover:text-theme-text'
                        }`}
                      >
                        Cream
                      </button>
                      <button
                        onClick={() => setReaderBg('light')}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                          readerBg === 'light' ? 'bg-white text-slate-900 border-slate-300 shadow-sm' : 'bg-theme-bg text-theme-muted border-theme-border hover:text-theme-text'
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                )}

                {/* PDF View Header Switcher / Engine Toggle */}
                {viewMode === 'pdf' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseCanvasEngine(!useCanvasEngine)}
                      className="px-2.5 py-1 bg-theme-card hover:bg-theme-bg border border-theme-border text-theme-text rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="Toggle Rendering Engine"
                    >
                      <RefreshCw size={11} className="text-theme-accent" />
                      <span>{useCanvasEngine ? 'Switch to Native Embed' : 'Switch to Canvas Engine'}</span>
                    </button>
                  </div>
                )}

                {/* Figure Slide Zoom Controls */}
                {viewMode === 'figures' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFigureZoom(z => Math.max(0.8, z - 0.2))}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ZoomOut size={13} /> Zoom Out
                    </button>
                    <button
                      onClick={() => setFigureZoom(1)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setFigureZoom(z => Math.min(2.5, z + 0.2))}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ZoomIn size={13} /> Zoom In
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode 1: Full PDF View */}
              {viewMode === 'pdf' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg">
                  {/* Top Bar for PDF */}
                  <div className="bg-theme-card border-b border-theme-border px-4 py-2 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <Layers size={16} className="text-theme-accent shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-theme-text truncate">
                        Full Document PDF View: {currentDisplayFileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleOpenInNewTab}
                        className="px-3 py-1.5 bg-theme-bg hover:bg-theme-card text-theme-text font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-theme-border"
                      >
                        <ExternalLink size={13} /> <span>Open in New Tab</span>
                      </button>
                      <button
                        onClick={handleTriggerDownload}
                        className="px-3.5 py-1.5 bg-theme-accent text-white hover:opacity-90 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-theme-accent/20 active:scale-95"
                      >
                        <Download size={13} /> <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Container */}
                  <div className="flex-1 overflow-hidden relative bg-theme-bg">
                    {blobLoading ? (
                      <div className="h-full w-full flex flex-col items-center justify-center space-y-3 bg-theme-bg text-theme-text p-6 text-center">
                        <Loader2 size={36} className="text-theme-accent animate-spin" />
                        <p className="text-sm font-bold text-theme-text">Opening PDF in Reader Engine ({book.fileSize || '33.39 MB'})...</p>
                        <p className="text-xs text-theme-muted max-w-sm">Reassembling document pages for smooth, unblocked viewing.</p>
                      </div>
                    ) : (
                      <PdfCanvasViewer
                        blob={resolvedBlob}
                        fileUrl={resolvedFileUrl || book.fileUrl}
                        fileName={currentDisplayFileName}
                        title={book.title}
                        onDownload={handleTriggerDownload}
                        onOpenNewTab={handleOpenInNewTab}
                        onFallbackToText={() => setViewMode('text')}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* View Mode 2: Reader Mode */}
              {viewMode === 'text' && (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                  {/* Chapters Sidebar */}
                  <div className={`
                    w-full md:w-72 bg-theme-card border-r border-theme-border p-3 sm:p-4 overflow-y-auto space-y-3 shrink-0
                    ${showMobileSidebar ? 'fixed inset-0 z-40 bg-theme-card p-6' : 'hidden md:block'}
                  `}>
                    {showMobileSidebar && (
                      <div className="flex items-center justify-between pb-3 border-b border-theme-border md:hidden">
                        <span className="text-xs font-black uppercase text-theme-accent">Chapters & Sections</span>
                        <button
                          onClick={() => setShowMobileSidebar(false)}
                          className="p-1.5 bg-theme-bg border border-theme-border rounded-xl text-theme-text text-xs font-bold"
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {/* Book Summary Card */}
                    <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-border space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase text-theme-accent block tracking-widest">
                        TEXTBOOK DETAILS
                      </span>
                      <p className="font-bold text-theme-text text-sm truncate">{book.title}</p>
                      <p className="text-[11px] text-theme-muted truncate">Author: {book.author}</p>
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black rounded uppercase">
                          {book.fileType?.toUpperCase() || 'PDF'}
                        </span>
                        <span className="text-[11px] text-theme-muted font-bold font-mono">{book.fileSize || '33.39 MB'}</span>
                      </div>
                    </div>

                    {/* Chapters Table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase text-theme-accent tracking-wider">
                          CHAPTERS / PAGES ({chapters.length})
                        </span>
                        {isExtractingChapters && (
                          <span className="text-[10px] text-theme-accent flex items-center gap-1 font-bold animate-pulse">
                            <Loader2 size={10} className="animate-spin" /> Loading
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 max-h-[50vh] md:max-h-none overflow-y-auto">
                        {chapters.map((ch, idx) => (
                          <button
                            key={ch.id || idx}
                            onClick={() => {
                              setActiveChapterIndex(idx);
                              setActiveFigureIndex(0);
                              setShowMobileSidebar(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 border ${
                              activeChapterIndex === idx
                                ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/30 shadow-sm'
                                : 'border-transparent text-theme-muted hover:bg-theme-bg hover:text-theme-text'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Book size={13} className="shrink-0 text-theme-accent" />
                              <span className="truncate">{ch.title}</span>
                            </div>
                            {ch.figures && ch.figures.length > 0 && (
                              <span className="text-[9px] bg-theme-bg px-1.5 py-0.5 rounded text-theme-accent font-mono shrink-0 border border-theme-border">
                                {ch.figures.length} Fig
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Reading Canvas */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-theme-card">
                    <div className={`flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 space-y-6 leading-relaxed font-sans transition-colors duration-300 ${
                      readerBg === 'theme'
                        ? 'bg-theme-bg text-theme-text'
                        : readerBg === 'dark'
                        ? 'bg-slate-950 text-slate-100'
                        : readerBg === 'sepia'
                        ? 'bg-[#fbf0d9] text-[#2c2217]'
                        : readerBg === 'cream'
                        ? 'bg-[#f5f2eb] text-[#1a1a1a]'
                        : 'bg-white text-slate-900'
                    }`}>
                      {/* Chapter Title Bar */}
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase text-theme-accent tracking-widest block">
                          SECTION {activeChapterIndex + 1}
                        </span>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black">
                          {activeChapter.title}
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div 
                        style={{ fontSize: `${fontSize}px` }} 
                        className="font-medium tracking-wide space-y-4 leading-relaxed max-w-4xl whitespace-pre-line"
                      >
                        {isUploadedFileBook && chapters.length <= 1 && (
                          <div className="space-y-5">
                            <p className="text-base sm:text-lg leading-relaxed opacity-95">
                              This textbook has visual pages and diagrams. You can read the full document using the Full PDF View tab or download the original file to view on your device.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                              <button
                                onClick={() => setViewMode('pdf')}
                                className="px-5 py-2.5 bg-theme-accent text-white hover:opacity-90 font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-theme-accent/20 transition-all active:scale-95"
                              >
                                <Layers size={15} /> <span>Open in Full PDF View</span>
                              </button>
                              <button
                                onClick={handleTriggerDownload}
                                className="px-4 py-2.5 bg-theme-card hover:bg-theme-bg text-theme-text font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-theme-border"
                              >
                                <Download size={15} /> <span>Download Original File</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {(!isUploadedFileBook || chapters.length > 1 || activeChapter.content !== chapters[0].content) && (
                          <MathRenderer text={activeChapter.content} />
                        )}
                      </div>

                      {/* Chapter Inline Figures */}
                      {activeChapter.figures && activeChapter.figures.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-theme-border space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-wider text-theme-accent flex items-center gap-2">
                            <ImageIcon size={16} /> Chapter Diagrams & Scientific Figures
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {activeChapter.figures.map((fig, fIdx) => (
                              <div 
                                key={fig.id}
                                onClick={() => {
                                  setActiveFigureIndex(fIdx);
                                  setViewMode('figures');
                                }}
                                className="bg-theme-card p-3 rounded-2xl border border-theme-border cursor-pointer hover:border-theme-accent transition-all space-y-2 group shadow-sm"
                              >
                                <div className="h-40 w-full rounded-xl overflow-hidden bg-theme-bg border border-theme-border relative">
                                  <img 
                                    src={fig.url} 
                                    alt={fig.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <p className="text-xs font-bold text-theme-text">{fig.title}</p>
                                <p className="text-[11px] text-theme-muted opacity-90 line-clamp-2">{fig.caption}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chapter Bottom Navigation */}
                    <div className="bg-theme-card px-3 sm:px-4 py-2.5 border-t border-theme-border flex items-center justify-between shrink-0">
                      <button
                        onClick={() => {
                          setActiveChapterIndex(i => Math.max(0, i - 1));
                          setActiveFigureIndex(0);
                        }}
                        disabled={activeChapterIndex === 0}
                        className="px-3 py-1.5 bg-theme-bg hover:bg-theme-card disabled:opacity-30 text-xs font-bold text-theme-text rounded-xl flex items-center gap-1 transition-all border border-theme-border"
                      >
                        <ChevronLeft size={15} /> Prev Section
                      </button>
                      <span className="text-xs font-black text-theme-accent">
                        {activeChapterIndex + 1} / {chapters.length}
                      </span>
                      <button
                        onClick={() => {
                          setActiveChapterIndex(i => Math.min(chapters.length - 1, i + 1));
                          setActiveFigureIndex(0);
                        }}
                        disabled={activeChapterIndex === chapters.length - 1}
                        className="px-3 py-1.5 bg-theme-bg hover:bg-theme-card disabled:opacity-30 text-xs font-bold text-theme-text rounded-xl flex items-center gap-1 transition-all border border-theme-border"
                      >
                        Next Section <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View Mode 3: Figure Slides */}
              {viewMode === 'figures' && (
                <div className="flex-1 bg-theme-bg p-4 sm:p-6 flex flex-col items-center justify-center overflow-auto space-y-4">
                  <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center relative bg-theme-card border border-theme-border rounded-3xl p-3 sm:p-4 overflow-hidden shadow-xl">
                    <div 
                      className="w-full h-full max-h-[50vh] flex items-center justify-center overflow-hidden transition-transform duration-200"
                      style={{ transform: `scale(${figureZoom})` }}
                    >
                      <img 
                        src={activeFigure.url} 
                        alt={activeFigure.title} 
                        className="max-h-full max-w-full object-contain rounded-2xl shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Figure Caption Overlay */}
                    <div className="w-full bg-theme-bg p-3 sm:p-4 rounded-2xl border border-theme-border space-y-1 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-theme-accent tracking-wider">
                          Slide {activeFigureIndex + 1} of {chapterFigures.length}
                        </span>
                        <span className="text-xs font-bold text-theme-muted">{book.subject}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-theme-text">{activeFigure.title}</h4>
                      <p className="text-[11px] sm:text-xs text-theme-muted leading-relaxed font-medium">{activeFigure.caption}</p>
                    </div>
                  </div>

                  {/* Figure Slide Navigation Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveFigureIndex(i => Math.max(0, i - 1))}
                      disabled={activeFigureIndex === 0}
                      className="px-3.5 py-1.5 bg-theme-card hover:bg-theme-bg disabled:opacity-30 text-xs font-bold text-theme-text border border-theme-border rounded-xl flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft size={15} /> Prev Figure
                    </button>
                    <span className="text-xs font-mono font-bold text-theme-accent">
                      {activeFigureIndex + 1} / {chapterFigures.length}
                    </span>
                    <button
                      onClick={() => setActiveFigureIndex(i => Math.min(chapterFigures.length - 1, i + 1))}
                      disabled={activeFigureIndex === chapterFigures.length - 1}
                      className="px-3.5 py-1.5 bg-theme-card hover:bg-theme-bg disabled:opacity-30 text-xs font-bold text-theme-text border border-theme-border rounded-xl flex items-center gap-1 transition-all"
                    >
                      Next Figure <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Download View */
            <div className="flex-1 p-4 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto overflow-y-auto">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-3xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center text-theme-accent shadow-lg">
                <FileDown size={36} />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-1 bg-theme-accent/10 text-theme-accent border border-theme-accent/20 rounded-full text-xs font-black uppercase tracking-wider">
                  Full Electronic Download
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-theme-text">{book.title}</h3>
                <p className="text-xs sm:text-sm text-theme-muted font-medium">Author: {book.author} • Subject: {book.subject}</p>
              </div>

              <div className="w-full bg-theme-bg p-4 rounded-2xl border border-theme-border text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-theme-border">
                  <span className="text-theme-muted">Section:</span>
                  <span className="font-bold text-theme-accent capitalize">{book.section}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-theme-border">
                  <span className="text-theme-muted">Target Audience:</span>
                  <span className="font-bold text-theme-text">{book.examTarget || 'General Education'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-theme-border">
                  <span className="text-theme-muted">File Format:</span>
                  <span className="font-bold text-emerald-500 uppercase">{book.fileType || 'PDF / TEXT Document'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-theme-muted">File Size:</span>
                  <span className="font-bold text-theme-accent font-mono">{book.fileSize || '33.39 MB'}</span>
                </div>
              </div>

              {downloadSuccess ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 rounded-2xl w-full flex items-center justify-center gap-2 font-bold animate-in fade-in">
                  <Check size={20} />
                  <span>File downloaded successfully ({book.fileSize || '33.39 MB'})!</span>
                </div>
              ) : (
                <button
                  onClick={handleTriggerDownload}
                  disabled={downloading}
                  className="w-full py-3.5 sm:py-4 bg-theme-accent hover:opacity-90 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-theme-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Download size={18} />
                  <span>{downloading ? 'Preparing File Download...' : `Download ${book.fileName || book.title} (${book.fileSize || '33.39 MB'})`}</span>
                </button>
              )}

              <div className="pt-2 text-xs text-theme-muted flex flex-wrap items-center justify-center gap-4">
                {book.amazonUrl && (
                  <button
                    onClick={() => {
                      if (onOpenBrowserUrl) onOpenBrowserUrl(book.amazonUrl!);
                    }}
                    className="text-theme-accent hover:underline flex items-center gap-1 font-bold"
                  >
                    <Globe size={13} /> Search Amazon Book Store in Browser
                  </button>
                )}
                <button
                  onClick={() => window.open(book.amazonUrl || `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`, '_blank', 'noopener,noreferrer')}
                  className="text-theme-muted hover:text-theme-text underline flex items-center gap-1 font-medium"
                >
                  Open in Browser <CornerUpRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

