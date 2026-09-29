import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw,
  Maximize2, Minimize2, Download, ExternalLink, 
  Loader2, BookOpen, Grid, Printer, FileText, ChevronUp, ChevronDown
} from 'lucide-react';

// Configure pdfjs worker source safely for browser environments
if (typeof window !== 'undefined') {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '5.6.205'}/build/pdf.worker.min.mjs`;
    }
  } catch (e) {
    console.warn('PDF worker setup:', e);
  }
}

interface PdfCanvasViewerProps {
  fileUrl?: string;
  blob?: Blob | null;
  fileName?: string;
  title?: string;
  onDownload?: () => void;
  onOpenNewTab?: () => void;
  onFallbackToText?: () => void;
}

// Single Page Canvas with Intersection Observer Lazy Rendering
const PdfPageItem: React.FC<{
  pdfDoc: any;
  pageNum: number;
  scale: number;
  rotation: number;
  fitMode: 'width' | 'page' | 'custom';
  containerWidth: number;
  containerHeight: number;
  onVisible: (pageNum: number) => void;
}> = ({
  pdfDoc,
  pageNum,
  scale,
  rotation,
  fitMode,
  containerWidth,
  containerHeight,
  onVisible
}) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  // 1. Intersection Observer to check when page enters viewport
  useEffect(() => {
    const el = pageContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            onVisible(pageNum);
          } else {
            // Keep nearby pages active, unload far pages to conserve mobile memory
            if (Math.abs(entry.boundingClientRect.top) > 2500) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '600px 0px 600px 0px', // Pre-render 600px ahead of scroll
        threshold: 0.1
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNum, onVisible]);

  // 2. Fetch page dimension metadata
  useEffect(() => {
    let active = true;
    if (!pdfDoc) return;

    pdfDoc.getPage(pageNum).then((page: any) => {
      if (!active) return;
      const initialViewport = page.getViewport({ scale: 1.0, rotation });

      let calculatedScale = scale;
      if (fitMode === 'width' && containerWidth > 40) {
        calculatedScale = Math.max(0.4, Math.min((containerWidth - 32) / initialViewport.width, 3.5));
      } else if (fitMode === 'page' && containerHeight > 40 && containerWidth > 40) {
        const scaleW = (containerWidth - 32) / initialViewport.width;
        const scaleH = (containerHeight - 48) / initialViewport.height;
        calculatedScale = Math.max(0.4, Math.min(scaleW, scaleH, 2.5));
      }

      const viewport = page.getViewport({ scale: calculatedScale, rotation });
      setPageSize({ width: Math.floor(viewport.width), height: Math.floor(viewport.height) });
    }).catch(() => {});

    return () => { active = false; };
  }, [pdfDoc, pageNum, scale, rotation, fitMode, containerWidth, containerHeight]);

  // 3. Render Canvas when visible
  useEffect(() => {
    let active = true;
    if (!pdfDoc || !isVisible || !canvasRef.current) return;

    const render = async () => {
      try {
        if (renderTaskRef.current) {
          try { renderTaskRef.current.cancel(); } catch (e) {}
        }

        const page = await pdfDoc.getPage(pageNum);
        if (!active || !canvasRef.current) return;

        const initialViewport = page.getViewport({ scale: 1.0, rotation });

        let calculatedScale = scale;
        if (fitMode === 'width' && containerWidth > 40) {
          calculatedScale = Math.max(0.4, Math.min((containerWidth - 32) / initialViewport.width, 3.5));
        } else if (fitMode === 'page' && containerHeight > 40 && containerWidth > 40) {
          const scaleW = (containerWidth - 32) / initialViewport.width;
          const scaleH = (containerHeight - 48) / initialViewport.height;
          calculatedScale = Math.max(0.4, Math.min(scaleW, scaleH, 2.5));
        }

        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
        const viewport = page.getViewport({ scale: calculatedScale, rotation });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (active) {
          setIsRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Page ${pageNum} render notice:`, err);
        }
      }
    };

    render();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch (e) {}
      }
    };
  }, [pdfDoc, pageNum, isVisible, scale, rotation, fitMode, containerWidth, containerHeight]);

  return (
    <div
      ref={pageContainerRef}
      id={`pdf-page-${pageNum}`}
      style={{
        width: `${pageSize.width}px`,
        minHeight: `${pageSize.height}px`
      }}
      className="relative my-4 bg-white shadow-2xl rounded-sm transition-shadow duration-200 border border-slate-700/40 flex flex-col items-center justify-center shrink-0 select-text"
    >
      {isVisible ? (
        <canvas ref={canvasRef} className="block w-full h-full" />
      ) : (
        <div
          style={{ width: `${pageSize.width}px`, height: `${pageSize.height}px` }}
          className="flex flex-col items-center justify-center bg-slate-900/60 text-slate-400 gap-2"
        >
          <Loader2 size={24} className="animate-spin text-blue-400 opacity-60" />
          <span className="text-xs font-mono font-bold text-slate-400">Page {pageNum}</span>
        </div>
      )}

      {/* Page Number Label Badge */}
      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-300 border border-slate-700/60 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
        Page {pageNum}
      </div>
    </div>
  );
};

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  fileUrl,
  blob,
  fileName = 'Document.pdf',
  title = 'Textbook Document',
  onDownload,
  onOpenNewTab,
  onFallbackToText
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width');
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [loading, setLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [isViewerFullscreen, setIsViewerFullscreen] = useState<boolean>(false);
  const [pageInput, setPageInput] = useState<string>('1');
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 900 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to check if Uint8Array contains %PDF header within first 1KB
  const isPdfHeader = (uint8: Uint8Array): boolean => {
    if (uint8.length < 5) return false;
    const searchLimit = Math.min(uint8.length - 4, 1024);
    for (let i = 0; i < searchLimit; i++) {
      if (
        uint8[i] === 0x25 && // %
        uint8[i + 1] === 0x50 && // P
        uint8[i + 2] === 0x44 && // D
        uint8[i + 3] === 0x46 // F
      ) {
        return true;
      }
    }
    return false;
  };

  // Track Container Width for Responsive Fit-to-Width
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    const resizeObs = new ResizeObserver(() => updateSize());
    resizeObs.observe(containerRef.current);
    return () => resizeObs.disconnect();
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setRenderError(null);

    const loadDocument = async () => {
      try {
        let uint8Data: Uint8Array | null = null;

        if (blob) {
          const arrayBuffer = await blob.arrayBuffer();
          uint8Data = new Uint8Array(arrayBuffer);
        } else if (fileUrl) {
          if (fileUrl.startsWith('data:text/')) {
            if (isMounted) {
              setRenderError('This textbook is formatted as electronic Chapter Study Notes.');
              setLoading(false);
            }
            if (onFallbackToText) onFallbackToText();
            return;
          } else if (fileUrl.startsWith('data:application/pdf;base64,')) {
            const base64 = fileUrl.split(',')[1];
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            uint8Data = bytes;
          } else {
            try {
              const res = await fetch(fileUrl);
              const arrayBuffer = await res.arrayBuffer();
              uint8Data = new Uint8Array(arrayBuffer);
            } catch (fetchErr) {
              console.warn('Direct fetch note:', fetchErr);
            }
          }
        }

        if (uint8Data) {
          if (!isPdfHeader(uint8Data)) {
            if (isMounted) {
              setRenderError('This document is formatted for the Text Reader with rich formulas and chapter notes.');
              setLoading(false);
            }
            if (onFallbackToText) onFallbackToText();
            return;
          }

          const loadingTask = pdfjsLib.getDocument({ data: uint8Data });
          const doc = await loadingTask.promise;
          if (isMounted) {
            setPdfDoc(doc);
            setTotalPages(doc.numPages || 1);
            setCurrentPage(1);
            setPageInput('1');
            setLoading(false);
          }
        } else if (fileUrl) {
          const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
          const doc = await loadingTask.promise;
          if (isMounted) {
            setPdfDoc(doc);
            setTotalPages(doc.numPages || 1);
            setCurrentPage(1);
            setPageInput('1');
            setLoading(false);
          }
        } else {
          throw new Error('No PDF document source available.');
        }
      } catch (err: any) {
        console.warn('PDF parser note:', err);
        if (isMounted) {
          setRenderError(
            err?.message?.includes('Invalid PDF structure')
              ? 'This document is formatted for Text Reader.'
              : (err?.message || 'Failed to load PDF document.')
          );
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, blob, onFallbackToText]);

  // Smooth scroll directly to a specific page
  const scrollToPage = useCallback((pageNum: number) => {
    const pageEl = document.getElementById(`pdf-page-${pageNum}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handlePageVisible = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
    setPageInput(String(pageNum));
  }, []);

  // Previous & Next Page buttons smooth-scroll to page
  const handlePrevPage = () => {
    const target = Math.max(1, currentPage - 1);
    setCurrentPage(target);
    setPageInput(String(target));
    scrollToPage(target);
  };

  const handleNextPage = () => {
    const target = Math.min(totalPages, currentPage + 1);
    setCurrentPage(target);
    setPageInput(String(target));
    scrollToPage(target);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      scrollToPage(num);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setFitMode('custom');
    setScale(s => Math.min(3.5, +(s + 0.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setScale(s => Math.max(0.4, +(s - 0.2).toFixed(2)));
  };

  const handleRotateClockwise = () => {
    setRotation(r => (r + 90) % 360);
  };

  const handlePrint = () => {
    window.print();
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const el = containerRef.current?.parentElement || containerRef.current;
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
      setIsViewerFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsViewerFullscreen(false);
    }
  };

  const currentZoomPercent = Math.round(scale * 100);

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative ${isViewerFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>
      {/* Microsoft Edge Styled PDF Toolbar */}
      <div className="bg-[#1e293b] border-b border-slate-700/80 px-2 sm:px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20 shadow-md">
        {/* Left: Edge Page Navigation & Thumbnails */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showThumbnails 
                ? 'bg-blue-600 text-white shadow' 
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Page Thumbnails & Outlines"
          >
            <Grid size={14} />
            <span className="hidden sm:inline">Contents</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Jump to Page Box */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 sm:px-2 py-1 rounded-lg border border-slate-700">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-200 rounded transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            <form onSubmit={handleJumpPage} className="flex items-center gap-1 text-xs">
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handleJumpPage}
                className="w-9 sm:w-12 bg-slate-950 text-blue-400 font-mono font-bold text-center text-xs py-0.5 rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium">/ {totalPages || 1}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-200 rounded transition-all"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Center: Title info */}
        <div className="hidden lg:flex items-center gap-2 truncate max-w-sm">
          <FileText size={14} className="text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">{fileName || title}</span>
        </div>

        {/* Right: Edge Zoom, Rotation, Download, Fullscreen Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Section */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 px-1.5 py-1 rounded-lg border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-300 px-1 sm:px-1.5 min-w-[38px] text-center">
              {currentZoomPercent}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Fit Width / Fit Page Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => { setFitMode('width'); }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                fitMode === 'width' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Fit to Width (Continuous Full Scroll)"
            >
              Page Width
            </button>
            <button
              onClick={() => { setFitMode('page'); }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                fitMode === 'page' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Fit Page Height"
            >
              Fit Page
            </button>
          </div>

          {/* Rotate Clockwise */}
          <button
            onClick={handleRotateClockwise}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all hidden sm:block"
            title="Rotate Clockwise 90°"
          >
            <RotateCw size={14} />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all hidden md:block"
            title="Print Document"
          >
            <Printer size={14} />
          </button>

          {/* Open in New Window */}
          {onOpenNewTab && (
            <button
              onClick={onOpenNewTab}
              className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all hidden md:block"
              title="Open in Separate Tab"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all"
            title={isViewerFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isViewerFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Download */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all shadow flex items-center gap-1 text-xs"
              title="Download Original PDF"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Continuous PDF Scroll Container with Left Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Page Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-48 sm:w-60 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto flex flex-col gap-2 shrink-0 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">
                Pages ({totalPages})
              </span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-1 pr-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => {
                    setCurrentPage(pNum);
                    setPageInput(String(pNum));
                    scrollToPage(pNum);
                    if (window.innerWidth < 640) setShowThumbnails(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                    currentPage === pNum
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={13} />
                    Page {pNum}
                  </span>
                  {currentPage === pNum && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continuous Multi-Page Vertical Scroll Viewport */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#0f172a] overflow-y-auto overflow-x-auto flex flex-col items-center justify-start p-2 sm:p-6 relative scroll-smooth"
        >
          {loading && (
            <div className="m-auto flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 size={36} className="text-blue-400 animate-spin" />
              <p className="text-sm font-bold text-white">Opening Full PDF Document...</p>
              <p className="text-xs text-slate-400">Loading continuous high-resolution pages</p>
            </div>
          )}

          {renderError && !loading && (
            <div className="m-auto max-w-md p-6 bg-slate-900 border border-blue-500/40 rounded-2xl text-center space-y-3 shadow-xl">
              <p className="text-sm font-bold text-blue-300">{renderError}</p>
              <p className="text-xs text-slate-400">
                You can switch to the Full Text Reader with LaTeX Math & Chapters, or download the original file to view on your device.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {onFallbackToText && (
                  <button
                    onClick={onFallbackToText}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow"
                  >
                    <BookOpen size={14} /> Open in Text Reader
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download Document
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Continuous Column of All Document Pages */}
          {!loading && !renderError && pdfDoc && totalPages > 0 && (
            <div className="w-full flex flex-col items-center py-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PdfPageItem
                  key={`page-${pageNum}-${scale}-${rotation}-${fitMode}`}
                  pdfDoc={pdfDoc}
                  pageNum={pageNum}
                  scale={scale}
                  rotation={rotation}
                  fitMode={fitMode}
                  containerWidth={containerDimensions.width}
                  containerHeight={containerDimensions.height}
                  onVisible={handlePageVisible}
                />
              ))}
            </div>
          )}

          {/* Floating Mobile Quick Navigation Dock */}
          {!loading && !renderError && totalPages > 0 && (
            <div className="sticky bottom-3 mt-4 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-2xl flex items-center gap-2.5 z-10 sm:hidden">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 bg-slate-800 disabled:opacity-30 rounded-full text-white active:scale-95 transition-transform"
                title="Previous Page"
              >
                <ChevronUp size={16} />
              </button>
              <span className="text-xs font-mono font-bold text-blue-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 bg-slate-800 disabled:opacity-30 rounded-full text-white active:scale-95 transition-transform"
                title="Next Page"
              >
                <ChevronDown size={16} />
              </button>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-slate-300 hover:text-white"
                title="Toggle Fullscreen"
              >
                {isViewerFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
