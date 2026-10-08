import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileText, Sparkles, Clock, Sliders, ArrowLeft, 
  CheckCircle, Trash2, Camera, AlertCircle, Check, Loader2 
} from 'lucide-react';
import { cn } from '../data/lib/utils';
import { generateQuestionsFromText, generateQuestionsFromImage } from '../services/aiQuestions';
import { Question, ExamType } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface FileUploadPageProps {
  user: any;
  profile: any;
  onBack: () => void;
  onQuestionsGenerated: (questions: Question[], duration: number) => void;
}

export const FileUploadPage: React.FC<FileUploadPageProps> = ({
  user,
  profile,
  onBack,
  onQuestionsGenerated
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<'Mixed' | 'Easy' | 'Medium' | 'Hard'>('Mixed');
  const [topics, setTopics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'reading' | 'analyzing' | 'generating' | 'finalizing'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviewUrl(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setImagePreviewUrl(null);
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setImagePreviewUrl(null);
  };

  const extractTextFromFile = async (f: File): Promise<string> => {
    if (f.type === 'text/plain') {
      return await f.text();
    }
    if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    }
    if (f.name.endsWith('.docx') || f.type.includes('wordprocessingml')) {
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    return '';
  };

  const handleGenerate = async () => {
    if (!file) {
      setUploadError("Please select a study document, textbook PDF, or note photo first.");
      return;
    }

    setIsGenerating(true);
    setUploadError(null);
    setGenerationStep('reading');

    try {
      let generated: Question[] = [];

      if (file.type.startsWith('image/')) {
        setGenerationStep('analyzing');
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;

        setGenerationStep('generating');
        generated = await generateQuestionsFromImage(
          base64,
          file.type,
          'General',
          'Personal CBT',
          `Generate ${questionCount} questions. Difficulty: ${difficulty}. Focus topics: ${topics || 'Core concepts in image'}`
        );
      } else {
        setGenerationStep('reading');
        const textContent = await extractTextFromFile(file);
        if (!textContent || textContent.trim().length < 20) {
          throw new Error("Could not extract readable text from this document. Please ensure it contains readable text or try a different file.");
        }

        setGenerationStep('analyzing');
        await new Promise(r => setTimeout(r, 400));

        setGenerationStep('generating');
        generated = await generateQuestionsFromText(
          textContent,
          'Personal CBT',
          questionCount,
          difficulty,
          topics
        );
      }

      if (!generated || generated.length === 0) {
        throw new Error("No CBT questions could be generated from this material. Try adding specific focus topics or uploading a clearer file.");
      }

      setGenerationStep('finalizing');
      await new Promise(r => setTimeout(r, 400));
      onQuestionsGenerated(generated, duration);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || "Failed to generate practice test. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep('idle');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-theme-border shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-theme-card hover:bg-theme-bg text-theme-text border border-theme-border rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Selection</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-accent animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-theme-muted">
              Document CBT Generator
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center py-6 sm:py-8 space-y-2 shrink-0">
          <span className="inline-block text-[10px] bg-theme-accent/15 text-theme-accent font-black uppercase tracking-widest px-3 py-1 rounded-full border border-theme-accent/30">
            Digital Curriculum Sync
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-theme-text uppercase tracking-tight">
            Upload Lecture Notes & Documents
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted max-w-lg mx-auto font-medium">
            Transform PDFs, lecture slides, Word documents, or textbook photos into an interactive, syllabus-standard Computer-Based Test.
          </p>
        </div>

        {/* Main Workstation Container */}
        <div className="bg-theme-card rounded-3xl sm:rounded-[2.5rem] border-2 border-theme-border p-6 sm:p-10 shadow-xl space-y-8 flex-1">
          {/* File Upload Dropzone */}
          <div 
            onClick={() => document.getElementById('full-screen-file-input')?.click()}
            className={cn(
              "border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer relative overflow-hidden group",
              file 
                ? "border-theme-accent bg-theme-accent/5 shadow-inner" 
                : "border-theme-border hover:border-theme-accent/60 bg-theme-bg/60"
            )}
          >
            <input 
              id="full-screen-file-input"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,image/*"
            />

            {file ? (
              <div className="flex flex-col items-center justify-center gap-4">
                {imagePreviewUrl ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-theme-accent shadow-lg mx-auto group/thumb">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Upload preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                      Click to Change
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-theme-accent/20 rounded-2xl flex items-center justify-center text-theme-accent shadow-md">
                    <FileText size={32} />
                  </div>
                )}
                <div className="text-center">
                  <span className="font-extrabold text-theme-text text-base truncate max-w-md block">
                    {file.name}
                  </span>
                  <span className="text-[11px] font-black text-theme-accent uppercase tracking-widest mt-1 block">
                    {imagePreviewUrl ? 'Photo Loaded • Vision Engine Ready' : 'Document Loaded • Text Parser Ready'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                >
                  Remove Selected File
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 bg-theme-bg rounded-3xl flex items-center justify-center mx-auto shadow-md text-theme-muted group-hover:text-theme-accent group-hover:scale-105 transition-all border border-theme-border">
                  <Upload size={30} />
                </div>
                <div className="space-y-1">
                  <p className="text-theme-text font-black text-lg">Click to Choose or Drag & Drop File</p>
                  <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">
                    PDF, Word (DOCX), TXT, or Camera Snapshots (JPG, PNG)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Controls */}
          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-xs font-bold text-theme-text focus:outline-none focus:border-theme-accent transition-all"
              >
                <option value={10}>10 Questions (Quick Quiz)</option>
                <option value={20}>20 Questions (Standard Test)</option>
                <option value={30}>30 Questions (Full Lecture)</option>
                <option value={40}>40 Questions (Comprehensive)</option>
                <option value={50}>50 Questions (Full Mock Exam)</option>
              </select>
            </div>

            {/* Test Duration */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block">
                Duration (Minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-xs font-bold text-theme-text focus:outline-none focus:border-theme-accent transition-all"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>

            {/* Difficulty Calibration */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-xs font-bold text-theme-text focus:outline-none focus:border-theme-accent transition-all"
              >
                <option value="Mixed">Mixed (Standard Curve)</option>
                <option value="Easy">Foundational / Easy</option>
                <option value="Medium">Standard / Medium</option>
                <option value="Hard">Advanced / Challenging</option>
              </select>
            </div>
          </div>

          {/* Priority Topics Focus */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider flex items-center justify-between">
              <span>Specific Topic Focus (Optional)</span>
              <span className="text-[10px] text-theme-accent font-bold">Grounded in File Content</span>
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Chapter 4: Thermodynamics, Calculus, Organic Compounds..."
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-accent transition-all"
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-500 font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Generate Button & Progress */}
          <div className="pt-4">
            <button
              type="button"
              disabled={!file || isGenerating}
              onClick={handleGenerate}
              className="w-full py-4 bg-theme-accent hover:opacity-95 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-theme-accent/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {generationStep === 'reading' && 'Reading & Processing File...'}
                    {generationStep === 'analyzing' && 'Analyzing Lecture Material...'}
                    {generationStep === 'generating' && 'Synthesizing Verified CBT Questions...'}
                    {generationStep === 'finalizing' && 'Finalizing Exam Session...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate CBT Practice Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
