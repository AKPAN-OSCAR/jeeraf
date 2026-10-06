import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, GraduationCap, FileText, Upload, ChevronRight, X, FileUp, Loader2, Minus, Plus, Clock, Settings2, AlertCircle, Menu, Sparkles, Mic } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { AudioWorkstation } from './AudioWorkstation';
import { ExamType, Question } from '../types';
import { cn } from '../data/lib/utils';
import { generateQuestionsFromText, extractQuestionsWithAI } from '../services/aiQuestions';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker using unpkg - mirrors npm exactly and is more reliable for new versions
const pdfWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

console.log('PDF.js Version:', pdfjsLib.version);
console.log('PDF.js Worker URL:', pdfjsLib.GlobalWorkerOptions.workerSrc);

interface ExamTypeSelectionProps {
  onSelect: (type: ExamType, customQuestions?: Question[], duration?: number) => void;
  user: any;
  profile?: any;
  onLogout: () => void;
  onNavigateTo: (target: 'dashboard' | 'textbooks' | 'exam_select' | 'progress' | 'admin_console' | 'subscription_portal' | 'fun' | 'blog' | 'awards' | 'system_ai' | 'browser') => void;
}

const EXAM_TYPES = [
  {
    id: 'JAMB' as ExamType,
    title: 'JAMB CBT',
    description: 'Unified Tertiary Matriculation Examination (UTME) practice.',
    icon: GraduationCap,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50'
  },
  {
    id: 'WAEC' as ExamType,
    title: 'WAEC',
    description: 'West African Examinations Council senior secondary school certificate.',
    icon: BookOpen,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50'
  },
  {
    id: 'NECO' as ExamType,
    title: 'NECO',
    description: 'National Examinations Council senior secondary school certificate.',
    icon: FileText,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50'
  },
  {
    id: 'WAEC GCE' as ExamType,
    title: 'WAEC GCE',
    description: 'General Certificate of Education for private candidates (WAEC).',
    icon: FileText,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50'
  },
  {
    id: 'NECO GCE' as ExamType,
    title: 'NECO GCE',
    description: 'National Examinations Council General Certificate of Education.',
    icon: FileText,
    color: 'bg-amber-600',
    lightColor: 'bg-amber-50'
  },
  {
    id: 'Personal CBT' as ExamType,
    title: 'Personal CBT',
    description: 'Create your own practice test by uploading study materials.',
    icon: Upload,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50'
  },
  {
    id: 'Audio Study' as any, // Temporary casting
    title: 'Audio AI Study',
    description: 'Record lectures or upload audio to generate tests and explanations.',
    icon: Mic,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50'
  }
];

export function ExamTypeSelection({ onSelect, user, profile, onLogout, onNavigateTo }: ExamTypeSelectionProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showAllExams, setShowAllExams] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'reading' | 'analyzing' | 'generating' | 'finalizing'>('reading');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [topics, setTopics] = useState('');
  const [difficulty, setDifficulty] = useState<'Mixed' | 'Easy' | 'Medium' | 'Hard'>('Mixed');
  const [selectedSubject, setSelectedSubject] = useState<string>('General');

  // Check active CBT Category Mode
  const cbtCategory = profile?.cbtCategory || 'national_exams';
  const customExam = (profile?.customExamName || '').toLowerCase();
  const isPersonalRequest = customExam.includes('personal') || customExam.includes('upcoming') || customExam.includes('exam') || customExam.includes('lecture') || customExam.includes('material') || customExam.includes('audio') || customExam.includes('note') || customExam.includes('course') || customExam.includes('test') || customExam.includes('prepare') || customExam.trim().length === 0;

  const isPersonalCBTMode = cbtCategory === 'university' || (cbtCategory === 'explore_ai' && isPersonalRequest);
  const isNationalExamsMode = cbtCategory === 'national_exams' || (cbtCategory === 'explore_ai' && !isPersonalRequest);
  const isGeneralMode = cbtCategory === 'general_practice';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
      setIsGenerating(false);

      if (selectedFile.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(selectedFile.name.split('.').pop()?.toLowerCase() || '')) {
        setImagePreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setImagePreviewUrl(null);
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setImagePreviewUrl(null);
    setUploadError(null);
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 100);
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ');
        fullText += pageText + '\n\n';
      }
      return fullText;
    } catch (err) {
      console.error('PDF extraction failed:', err);
      if (err instanceof Error && err.message.includes('worker')) {
        throw new Error('PDF worker failed to load. Please refresh the page and try again, or use a .txt file.');
      }
      throw err;
    }
  };

  const handleGenerateQuestions = async () => {
    if (!file && !topics.trim()) return;
    
    setIsGenerating(true);
    setUploadError(null);
    
    try {
      let text = '';
      let imageBase64Data: string | null = null;
      let imageMimeType: string | null = null;

      if (file) {
        setGenerationStep('reading');
        const fileType = file.name.split('.').pop()?.toLowerCase();
        const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(fileType || '');

        // Support massive files up to 100MB
        if (file.size > 100 * 1024 * 1024) {
          throw new Error('File is too large. Please upload files smaller than 100MB.');
        }

        if (isImage) {
          imageMimeType = file.type || 'image/jpeg';
          const reader = new FileReader();
          imageBase64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const res = reader.result as string;
              resolve(res.includes(',') ? res.split(',')[1] : res);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } else if (fileType === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          text = await extractTextFromPDF(arrayBuffer);
        } else if (fileType === 'docx' || fileType === 'doc') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else {
          const reader = new FileReader();
          text = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }
      }

      setGenerationStep('analyzing');
      
      // Smart sampling for massive text to avoid API payload limits
      let sampledText = text;
      if (text.length > 200000) {
        const partSize = 60000;
        const start = text.slice(0, partSize);
        const middle = text.slice(Math.floor(text.length / 2) - partSize / 2, Math.floor(text.length / 2) + partSize / 2);
        const end = text.slice(-partSize);
        sampledText = `${start}\n\n[...]\n\n${middle}\n\n[...]\n\n${end}`;
      }

      setGenerationStep('generating');
      let generated: any[] = [];

      // Primary: Call server-side Personal CBT AI generator with Gemini 3.1 Pro / 3.8 Flash
      try {
        const res = await fetch('/api/ai/personal-cbt/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: selectedSubject,
            topics: topics.trim(),
            difficulty,
            questionCount,
            documentText: sampledText,
            imageBase64: imageBase64Data,
            mimeType: imageMimeType,
            examType: 'Personal CBT'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            generated = data.questions;
          }
        }
      } catch (serverErr) {
        console.warn('Server personal CBT call failed, trying client fallback:', serverErr);
      }

      // Fallback if server call returned empty
      if (generated.length === 0) {
        if (imageBase64Data) {
          generated = await extractQuestionsWithAI(
            { base64: imageBase64Data, mimeType: imageMimeType || 'image/jpeg' },
            selectedSubject as any,
            'Personal CBT',
            topics
          );
        } else {
          generated = await generateQuestionsFromText(sampledText || topics, 'Personal CBT', questionCount, topics);
        }
      }
      
      if (generated.length === 0) {
        throw new Error('No questions could be generated. Try specifying clearer educational topics or uploading a clearer document/image.');
      }

      setGenerationStep('finalizing');
      await new Promise(r => setTimeout(r, 400));

      onSelect('Personal CBT', generated, duration);
    } catch (error) {
      console.error(error);
      setUploadError(error instanceof Error ? error.message : 'Failed to generate questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepMessage = () => {
    switch(generationStep) {
      case 'reading': return 'Reading and processing file...';
      case 'analyzing': return 'Analyzing study materials...';
      case 'generating': return 'AI is generating questions...';
      case 'finalizing': return 'Rounding up...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col p-4 transition-colors duration-300">
      <div className="max-w-5xl w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <SidebarMenu 
            user={user} 
            profile={profile}
            onLogout={onLogout} 
            onNavigate={(target) => onNavigateTo(target)}
          />
          <button
            onClick={() => onNavigateTo('dashboard')}
            className="px-3 py-1.5 bg-theme-card border border-theme-border hover:border-theme-accent text-theme-text font-bold text-xs rounded-xl transition-all"
          >
            Main Directory
          </button>
        </div>
        {isPersonalCBTMode ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <span className="inline-block text-[10px] bg-theme-accent/10 text-theme-accent font-black uppercase tracking-widest px-3 py-1 rounded-full border border-theme-accent/20 mb-3">
                Universal Personal CBT
              </span>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black text-theme-text mb-2"
              >
                Personal CBT & Audio Studio
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-theme-muted text-xs md:text-sm max-w-2xl mx-auto"
              >
                Upload course lecture materials, PDFs, or record audio lectures to generate personalized CBT practice tests.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Personal CBT Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => setShowUpload(true)}
                className="group relative overflow-hidden bg-theme-accent p-8 rounded-3xl shadow-lg border border-theme-accent/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    PDF / DOCX / Textbooks
                  </span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-black text-white">Upload Lecture Materials</h3>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Upload course notes, slides, or reading materials. AI automatically processes your text and extracts exam questions.
                  </p>
                </div>
                <div className="flex items-center text-white font-black text-xs gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Upload Files & Generate Quiz</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>

              {/* Audio AI Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => setShowAudio(true)}
                className="group relative overflow-hidden bg-rose-600 p-8 rounded-3xl shadow-lg border border-rose-500/30 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Live Audio AI Studio
                  </span>
                </div>
                <div className="space-y-2 my-4">
                  <h3 className="text-2xl font-black text-white">Audio AI Lecture Studio</h3>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Record live lecturer audio or upload voice note recordings. AI transcribes speech into comprehensive CBT practice tests.
                  </p>
                </div>
                <div className="flex items-center text-white font-black text-xs gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Audio Studio</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            </div>
          </div>
        ) : isNationalExamsMode ? (
          <>
            <div className="text-center mb-10">
              <span className="inline-block text-[10px] bg-amber-500/10 text-amber-500 font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20 mb-3">
                National Exams Center
              </span>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
              >
                National Exams
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-theme-muted text-xs md:text-sm max-w-xl mx-auto"
              >
                Choose your national examination body to start practicing past questions and timed mock tests.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAM_TYPES.filter(exam => exam.id !== 'Personal CBT' && exam.id !== 'Audio Study').map((exam, index) => (
                <motion.button
                  key={exam.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelect(exam.id)}
                  className="group bg-theme-card p-6 rounded-2xl shadow-sm border border-theme-border hover:border-theme-accent hover:shadow-md transition-all text-left flex flex-col h-full"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", exam.lightColor)}>
                    <exam.icon className={cn("w-6 h-6", exam.color.replace('bg-', 'text-'))} />
                  </div>
                  <h3 className="text-xl font-bold text-theme-text mb-2">{exam.title}</h3>
                  <p className="text-theme-muted text-sm flex-grow">{exam.description}</p>
                  <div className="mt-4 flex items-center text-theme-accent font-medium text-sm">
                    Start Practice <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-10">
              <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                General CBT Dashboard
              </span>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
              >
                General CBT & Skill Center
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-theme-muted text-xs md:text-sm max-w-xl mx-auto"
              >
                Access all national exams, personal CBT upload generators, audio AI study studio, and skill practice drills.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAM_TYPES.map((exam, index) => {
                if (exam.id === 'Personal CBT') {
                  return (
                    <motion.button
                      key={exam.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setShowUpload(true)}
                      className="group relative overflow-hidden bg-theme-accent p-6 rounded-2xl shadow-sm border border-theme-accent/20 hover:shadow-lg transition-all text-left flex flex-col h-full"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <div className="bg-white/10 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Custom AI
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Personal CBT</h3>
                      <p className="text-white/80 text-sm flex-grow">
                        Upload notes or textbooks. Our AI will automatically generate questions for you.
                      </p>
                      <div className="mt-4 flex items-center text-white font-medium text-sm">
                        Upload Files <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.button>
                  );
                }

                if (exam.id === 'Audio Study') {
                  return (
                    <motion.button
                      key={exam.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setShowAudio(true)}
                      className="group relative overflow-hidden bg-rose-600 p-6 rounded-2xl shadow-sm border border-rose-500/20 hover:shadow-lg transition-all text-left flex flex-col h-full"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <div className="bg-white/10 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Audio Multi-Modal
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Audio AI Study</h3>
                      <p className="text-white/80 text-sm flex-grow">
                        Record your lecturers or voice notes. AI generates full explanations and tests.
                      </p>
                      <div className="mt-4 flex items-center text-white font-medium text-sm">
                        Open Studio <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(exam.id)}
                    className="group bg-theme-card p-6 rounded-2xl shadow-sm border border-theme-border hover:border-theme-accent hover:shadow-md transition-all text-left flex flex-col h-full"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", exam.lightColor)}>
                      <exam.icon className={cn("w-6 h-6", exam.color.replace('bg-', 'text-'))} />
                    </div>
                    <h3 className="text-xl font-bold text-theme-text mb-2">{exam.title}</h3>
                    <p className="text-theme-muted text-sm flex-grow">{exam.description}</p>
                    <div className="mt-4 flex items-center text-theme-accent font-medium text-sm">
                      Start Practice <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        <AnimatePresence>
          {showAudio && (
            <AudioWorkstation 
              onClose={() => setShowAudio(false)} 
              user={user}
              onQuestionsGenerated={(questions, duration) => {
                setShowAudio(false);
                onSelect('Personal CBT', questions, duration);
              }}
            />
          )}

          {showUpload && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-theme-card rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-theme-border"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowUpload(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-theme-bg rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-theme-muted" />
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-theme-accent/20">
                    <FileUp className="w-8 h-8 text-theme-accent" />
                  </div>
                  <h2 className="text-2xl font-bold text-theme-text text-balance">Personalize Your Quiz</h2>
                  <p className="text-theme-muted mt-2">Configure and upload your study material.</p>
                </div>

                <div className="space-y-8">
                  {/* Configuration Controls - ARRANGED FOR CONFIGURATION */}
                  <div className="bg-theme-bg rounded-3xl p-6 border border-theme-border space-y-6">
                    <h3 className="text-xs font-black text-theme-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Settings2 size={14} className="text-theme-accent" /> Exam Configuration
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest pl-1">
                          Question Count
                        </label>
                        <div className="flex items-center justify-between bg-theme-card border border-theme-border rounded-2xl p-2 shadow-sm text-theme-text">
                          <button 
                            onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))}
                            className="w-10 h-10 flex items-center justify-center bg-theme-bg hover:bg-theme-border rounded-xl transition-colors"
                          >
                            <Minus size={16} className="text-theme-muted" />
                          </button>
                          <span className="text-xl font-black">{questionCount}</span>
                          <button 
                            onClick={() => setQuestionCount(prev => Math.min(100, prev + 5))}
                            className="w-10 h-10 flex items-center justify-center bg-theme-bg hover:bg-theme-border rounded-xl transition-colors"
                          >
                            <Plus size={16} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest pl-1">
                          Time (Minutes)
                        </label>
                        <div className="flex items-center justify-between bg-theme-card border border-theme-border rounded-2xl p-2 shadow-sm text-theme-text">
                          <button 
                            onClick={() => setDuration(prev => Math.max(10, prev - 5))}
                            className="w-10 h-10 flex items-center justify-center bg-theme-bg hover:bg-theme-border rounded-xl transition-colors"
                          >
                            <Minus size={16} className="text-theme-muted" />
                          </button>
                          <span className="text-xl font-black">{duration}</span>
                          <button 
                            onClick={() => setDuration(prev => Math.min(180, prev + 5))}
                            className="w-10 h-10 flex items-center justify-center bg-theme-bg hover:bg-theme-border rounded-xl transition-colors"
                          >
                            <Plus size={16} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subject Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest pl-1">
                        Select Subject
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-2.5 text-xs font-bold text-theme-text outline-none focus:border-theme-accent transition-all cursor-pointer"
                      >
                        {['General', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'Commerce', 'Accounting', 'Computer Science'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Difficulty Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest pl-1">
                          Target Difficulty
                        </label>
                        <span className="text-[10px] font-bold text-amber-500">
                          {difficulty === 'Mixed' ? 'Curriculum Balanced' : `${difficulty} Focus`}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficulty(diff)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-black border transition-all active:scale-95 text-center",
                              difficulty === diff 
                                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                                : "bg-theme-card border-theme-border text-theme-muted hover:text-theme-text"
                            )}
                          >
                            {diff === 'Mixed' ? 'Mixed' : diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-theme-muted uppercase tracking-widest pl-1">
                        Priority Focus / Topics
                      </label>
                      <div className="relative">
                        <textarea 
                          placeholder="e.g. Quadratic Equations, Photosynthesis, Organic Chemistry, Mechanics..."
                          value={topics}
                          onChange={(e) => setTopics(e.target.value)}
                          className="w-full bg-theme-card border border-theme-border rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-theme-accent/10 focus:border-theme-accent transition-all outline-none resize-none h-20 shadow-sm text-theme-text"
                        />
                        <div className="absolute right-4 bottom-4">
                          <Sparkles size={16} className="text-theme-accent animate-pulse" />
                        </div>
                      </div>
                      <p className="text-[9px] text-theme-muted font-medium italic pl-1 leading-tight">
                        AI will generate questions strictly calibrated to your chosen topics and difficulty.
                      </p>
                    </div>
                  </div>

                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-[2rem] p-6 text-center transition-all cursor-pointer relative overflow-hidden group",
                      file ? "border-theme-accent bg-theme-accent/5 shadow-inner" : "border-theme-border hover:border-theme-muted bg-theme-bg/50"
                    )}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input 
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".txt,.pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,image/*"
                    />
                    {file ? (
                      <div className="flex flex-col items-center justify-center gap-3">
                        {imagePreviewUrl ? (
                          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-theme-accent shadow-md mx-auto group/thumb">
                            <img 
                              src={imagePreviewUrl} 
                              alt="Upload preview" 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              Change Image
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-theme-accent/20 rounded-2xl flex items-center justify-center text-theme-accent shadow-md transform rotate-3 transition-transform group-hover:rotate-0">
                            <FileText size={28} />
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-theme-text truncate max-w-[280px]">{file.name}</span>
                          <span className="text-[10px] font-black text-theme-accent uppercase tracking-widest mt-0.5">
                            {imagePreviewUrl ? 'Image Ready for AI Analysis' : 'Document Ready to Generate'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearFile();
                          }}
                          className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 py-2">
                        <div className="w-14 h-14 bg-theme-card rounded-2xl flex items-center justify-center mx-auto shadow-md text-theme-muted group-hover:text-theme-accent group-hover:scale-105 transition-all border border-theme-border">
                          <Upload size={28} />
                        </div>
                        <div>
                          <p className="text-theme-text font-bold text-sm">Upload Study Material, Notes, or Photo</p>
                          <p className="text-[10px] text-theme-muted font-bold uppercase tracking-widest mt-0.5">
                            PDF, Word (DOCX), TXT, or Image (PNG, JPG, Camera Photo)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl border border-rose-500/20 text-xs flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {uploadError}
                    </div>
                  )}

                  <button
                    disabled={(!file && !topics.trim()) || isGenerating}
                    onClick={handleGenerateQuestions}
                    className="w-full bg-theme-accent text-white rounded-xl py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-theme-accent/20 active:scale-98"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {getStepMessage()}
                      </>
                    ) : (
                      <span>Generate {difficulty === 'Mixed' ? '' : difficulty} Practice Test</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
