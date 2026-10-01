import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Upload, Sparkles, Check, AlertCircle, 
  Trash2, Eye, Download, Copy, RefreshCw, 
  ZoomIn, ZoomOut, CheckCircle2,
  FileCode, Layers, Search, Edit3, X, HelpCircle,
  ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Question, Subject, ExamType, QuestionSection } from '../types';
import { MathRenderer } from './MathRenderer';
import { getAI } from '../services/aiQuestions';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../data/lib/utils';

interface PageImageItem {
  id: string;
  name: string;
  dataUrl: string;
  base64: string;
  mimeType: string;
  pageType: 'questions' | 'solution_key';
}

interface HardcopyVisionManagerProps {
  existingQuestions: Question[];
  onQuestionAdded?: (q: Question) => void;
  onQuestionDeleted?: (id: string) => void;
}

const ALL_SUBJECTS: Subject[] = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'Geography', 'Commerce',
  'Accounting', 'Agricultural Science', 'Civic Education', 'Further Mathematics',
  'History', 'CRK', 'IRK', 'Yoruba', 'Hausa', 'Igbo', 'French', 'General'
];

const ALL_EXAMS: ExamType[] = [
  'JAMB', 'WAEC', 'NECO', 'WAEC GCE', 'NECO GCE', 'Personal CBT'
];

// Generate years from 2025 back to 1990
const ALL_YEARS = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 2025 - i);

export const HardcopyVisionManager: React.FC<HardcopyVisionManagerProps> = ({
  existingQuestions,
  onQuestionDeleted
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'bank' | 'export'>('scanner');

  // Scanner Configuration
  const [examType, setExamType] = useState<ExamType>('JAMB');
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [year, setYear] = useState<number>(2024);
  const [setNumber, setSetNumber] = useState<number>(1);
  const [section, setSection] = useState<QuestionSection>('General');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Page Uploads
  const [pages, setPages] = useState<PageImageItem[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Extraction State
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Save / Export State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Question Bank Filter State
  const [bankExamFilter, setBankExamFilter] = useState<string>('all');
  const [bankSubjectFilter, setBankSubjectFilter] = useState<string>('all');
  const [bankYearFilter, setBankYearFilter] = useState<string>('all');
  const [bankSearch, setBankSearch] = useState<string>('');
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading of images (questions and/or solutions page)
  const handleImageFiles = (files: FileList | null, pageType: 'questions' | 'solution_key' = 'questions') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        const newPage: PageImageItem = {
          id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          dataUrl,
          base64,
          mimeType: file.type || 'image/jpeg',
          pageType
        };

        setPages(prev => [...prev, newPage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    if (selectedPageIndex >= pages.length - 1) {
      setSelectedPageIndex(Math.max(0, pages.length - 2));
    }
  };

  // Execute Gemini Multimodal Vision Extraction
  const handleRunVisionExtraction = async () => {
    if (pages.length === 0) {
      setExtractionError("Please upload at least one photo of the hardcopy exam booklet before scanning.");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionProgress("Preparing high-resolution images for Multimodal AI Vision analysis...");

    try {
      const ai = getAI();
      const modelName = 'gemini-3.8-flash';

      setExtractionProgress(`Analyzing ${pages.length} exam booklet page(s) with ${modelName}... Extracting formulas and solutions...`);

      // Prepare contents for Gemini Multimodal input
      const contentsParts: any[] = [];

      pages.forEach((p, idx) => {
        contentsParts.push({
          inlineData: {
            mimeType: p.mimeType,
            data: p.base64
          }
        });
        contentsParts.push({
          text: `[Page ${idx + 1} Image: ${p.pageType === 'solution_key' ? 'Answer Key / Solutions Sheet' : 'Exam Questions Sheet'}]`
        });
      });

      const extractionPrompt = `
You are the master examiner and OCR ingestion engine for Nigeria's National CBT exams (JAMB, WAEC, NECO).
You are analyzing photographs of authentic hardcopy past question booklets.

TARGET METADATA:
- Exam Type: ${examType}
- Subject: ${subject}
- Exam Year: ${year}
- Set / Batch: ${setNumber}
- Section: ${section}
${customInstructions ? `- Specific User Guidance: "${customInstructions}"` : ''}

CRITICAL RULES FOR HARDCOPY EXTRACTION:
1. Extract ALL questions visible on the uploaded question pages in sequential order as numbered in the booklet (e.g., 1, 2, 3, etc.).
2. MATHEMATICAL & SCIENTIFIC FORMULAS:
   - Convert all algebraic equations, square roots, fractions, limits, matrices, chemistry formulas, and physics laws to standard LaTeX notation enclosed in dollar signs.
   - Example: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$\\int_0^\\pi \\sin(x)dx$", "$2x^2 + 5x - 3 = 0$".
3. OPTIONS:
   - Every question must have EXACTLY 4 options (Option A, Option B, Option C, Option D).
   - Strip leading labels like "A. ", "B. ", "(A) ", etc., from the option text.
4. CORRECT ANSWER:
   - 'correctAnswer' must be the 0-indexed integer of the correct option:
     0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D.
   - If an Answer Key / Solution Sheet is provided among the photos, match against it strictly.
   - If no answer key is visible for a question, compute the rigorously proven correct answer.
5. STEP-BY-STEP EXPLANATION / SOLUTION:
   - For EVERY question, write a comprehensive, clear, step-by-step worked solution.
   - Detail Step 1, Step 2, and the conclusion with formulas so students learn effectively.
6. DIAGRAMS & FIGURES:
   - If a question references a geometry diagram, circle theorem, electric circuit, graph, or chart in the image, flag 'images' with a descriptive label (e.g., ["diagram: triangle ABC with angle B = 60 degrees"]).
7. ACCURACY:
   - Return clean, strictly valid JSON array of objects.

Output JSON structure must strictly follow:
[
  {
    "question": "string (with LaTeX formulas if applicable)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed step-by-step solution with LaTeX formulas",
    "topic": "Name of curriculum topic (e.g. Quadratic Equations, Optics)",
    "difficulty": "Easy" | "Medium" | "Hard",
    "section": "${section}",
    "images": []
  }
]
`;

      contentsParts.push({ text: extractionPrompt });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contentsParts,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                section: { type: Type.STRING },
                images: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['question', 'options', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini Multimodal Vision returned an empty extraction result.");
      }

      const parsed: any[] = JSON.parse(responseText);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("No structured questions could be extracted from the uploaded photos. Please check image clarity and retry.");
      }

      const formattedQuestions: Question[] = parsed.map((item, index) => ({
        id: `extracted-${examType.toLowerCase()}-${subject.toLowerCase()}-${year}-${Date.now()}-${index + 1}`,
        subject,
        examType,
        year,
        set: setNumber,
        section: (item.section as QuestionSection) || section,
        question: item.question || `Question ${index + 1}`,
        options: Array.isArray(item.options) && item.options.length === 4 
          ? item.options 
          : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: typeof item.correctAnswer === 'number' && item.correctAnswer >= 0 && item.correctAnswer <= 3 
          ? item.correctAnswer 
          : 0,
        explanation: item.explanation || "Step-by-step solution verified by JeeRaf Vision AI.",
        topic: item.topic || "General",
        difficulty: (item.difficulty as any) || "Medium",
        images: Array.isArray(item.images) ? item.images : []
      }));

      setExtractedQuestions(formattedQuestions);
      setExtractionProgress("");
      setSaveSuccessMsg(`Successfully extracted ${formattedQuestions.length} questions from hardcopy photos!`);
      setTimeout(() => setSaveSuccessMsg(null), 6000);

    } catch (err: any) {
      console.error("Vision Extraction error:", err);
      setExtractionError(err?.message || "Failed to extract questions with AI Vision. Please verify your Gemini API key and image clarity.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Save Extracted Questions to Firestore
  const handleSaveToDatabase = async () => {
    if (extractedQuestions.length === 0) return;
    if (!db) {
      alert("Firestore database is not connected.");
      return;
    }

    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      const questionsCol = collection(db, 'sib_questions');

      extractedQuestions.forEach(q => {
        const docRef = doc(questionsCol, q.id);
        batch.set(docRef, {
          ...q,
          createdAt: serverTimestamp(),
          source: 'hardcopy_vision_scanner'
        });
      });

      await batch.commit();
      setSaveSuccessMsg(`Saved ${extractedQuestions.length} questions directly to the Live CBT Database!`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Save to database error:", err);
      alert(`Error saving questions to database: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Download clean JSON formatted for codebase bundling
  const handleDownloadCodebaseJson = () => {
    if (extractedQuestions.length === 0) return;

    const fileName = `${examType.toLowerCase()}_${subject.toLowerCase()}_${year}.json`;
    const jsonString = JSON.stringify(extractedQuestions, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Clean JSON to Clipboard
  const handleCopyJsonToClipboard = () => {
    if (extractedQuestions.length === 0) return;
    const jsonString = JSON.stringify(extractedQuestions, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 3000);
    });
  };

  // Filtered Questions Bank List
  const filteredBankQuestions = existingQuestions.filter(q => {
    if (bankExamFilter !== 'all' && q.examType !== bankExamFilter) return false;
    if (bankSubjectFilter !== 'all' && q.subject !== bankSubjectFilter) return false;
    if (bankYearFilter !== 'all' && q.year !== parseInt(bankYearFilter)) return false;
    if (bankSearch.trim()) {
      const sLower = bankSearch.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(sLower);
      const matchTopic = q.topic?.toLowerCase().includes(sLower);
      const matchExp = q.explanation?.toLowerCase().includes(sLower);
      if (!matchQ && !matchTopic && !matchExp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex border-b border-theme-border/60 bg-theme-bg/30 rounded-2xl p-1.5 gap-2">
        <button
          onClick={() => setActiveTab('scanner')}
          className={cn(
            "flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
            activeTab === 'scanner'
              ? "bg-theme-accent text-white shadow-md"
              : "text-theme-muted hover:text-theme-text hover:bg-theme-card/50"
          )}
        >
          <Camera size={16} />
          <span>Hardcopy Scanner (Vision AI)</span>
          {extractedQuestions.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
              {extractedQuestions.length} Extracted
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={cn(
            "flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
            activeTab === 'bank'
              ? "bg-theme-accent text-white shadow-md"
              : "text-theme-muted hover:text-theme-text hover:bg-theme-card/50"
          )}
        >
          <Layers size={16} />
          <span>Exam Question Bank</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-theme-border text-theme-muted text-[10px]">
            {existingQuestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            "flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
            activeTab === 'export'
              ? "bg-theme-accent text-white shadow-md"
              : "text-theme-muted hover:text-theme-text hover:bg-theme-card/50"
          )}
        >
          <FileCode size={16} />
          <span>Codebase Bundler & Export</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccessMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-3 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {extractionError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-3 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{extractionError}</span>
          </div>
          <button onClick={() => setExtractionError(null)} className="p-1 hover:bg-rose-500/20 rounded-lg">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* TAB 1: HARDCOPY SCANNER */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Top Configuration & Ingestion Controls */}
          <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-border/60 pb-4">
              <div>
                <h3 className="text-base font-black text-theme-text flex items-center gap-2">
                  <Camera className="text-amber-500" size={20} />
                  Hardcopy Past Questions Vision Scanner
                </h3>
                <p className="text-xs text-theme-muted mt-1">
                  Upload photographs of physical past question booklets (1990–2025). Multimodal Vision extracts formulas into KaTeX, options A–D, and full worked solutions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <Sparkles size={12} /> Gemini 3.8 Flash Vision Active
                </span>
              </div>
            </div>

            {/* Target Metadata Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                >
                  {ALL_EXAMS.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                >
                  {ALL_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Exam Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                >
                  {ALL_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Set / Batch
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={setNumber}
                  onChange={(e) => setSetNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                />
              </div>
            </div>

            {/* Optional Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Section / Paper Category
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as QuestionSection)}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                >
                  <option value="General">General / Objectives</option>
                  <option value="Comprehension">Comprehension Passages</option>
                  <option value="Lexis and Structure">Lexis and Structure</option>
                  <option value="Word Stress">Word Stress / Oral</option>
                  <option value="Theory">Theory / Essay</option>
                  <option value="Practical">Practical / Laboratory</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted mb-1.5">
                  Special Parsing Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 'Questions 1 to 20 only' or 'Include circle theorem diagram notes'"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                />
              </div>
            </div>

            {/* Photo Ingestion Dropzone */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
                  <Upload size={14} className="text-amber-500" />
                  Exam Booklet Photos ({pages.length} Pages Uploaded)
                </span>

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files, 'questions')}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-theme-accent/10 border border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Upload size={14} />
                    <span>Upload Question Pages</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e: any) => handleImageFiles(e.target?.files, 'solution_key');
                      input.click();
                    }}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Upload optional answer key or worked solution page from booklet"
                  >
                    <CheckCircle2 size={14} />
                    <span>+ Answer Key Page</span>
                  </button>
                </div>
              </div>

              {pages.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-theme-border/80 hover:border-theme-accent rounded-3xl p-8 text-center cursor-pointer bg-theme-bg/30 hover:bg-theme-bg/60 transition-all space-y-3"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Camera size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-theme-text">
                      Drag & Drop Hardcopy Exam Photos Here or Click to Browse
                    </p>
                    <p className="text-xs text-theme-muted mt-1 max-w-md mx-auto">
                      Take clear photos of your JAMB, WAEC, or NECO past questions booklet. You can select multiple page photos at once.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-card border border-theme-border text-[10px] font-bold text-theme-muted">
                    <span>JPEG, PNG, WEBP supported • Processed directly in-memory (0 storage fees)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Thumbnail Row */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {pages.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPageIndex(idx)}
                        className={cn(
                          "relative group shrink-0 w-28 h-36 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-theme-card shadow-sm",
                          selectedPageIndex === idx
                            ? "border-theme-accent ring-2 ring-theme-accent/30"
                            : "border-theme-border hover:border-theme-muted"
                        )}
                      >
                        <img 
                          src={p.dataUrl} 
                          alt={`Page ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                          <span className="block text-[9px] font-black uppercase tracking-wider">
                            {p.pageType === 'solution_key' ? '🔑 Key / Sol' : `Page ${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePage(p.id);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Add More Button Tile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0 w-28 h-36 rounded-2xl border-2 border-dashed border-theme-border hover:border-theme-accent flex flex-col items-center justify-center gap-2 text-theme-muted hover:text-theme-accent bg-theme-bg/40 transition-all"
                    >
                      <Upload size={18} />
                      <span className="text-[10px] font-black uppercase">Add More</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Run Extraction Button */}
            <div className="pt-2 border-t border-theme-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-theme-muted">
                {pages.length > 0 ? (
                  <span>
                    Ready to scan <strong>{pages.length} page(s)</strong> for <strong>{examType} {subject} ({year})</strong>
                  </span>
                ) : (
                  <span>Upload booklet images above to begin extraction</span>
                )}
              </div>

              <button
                type="button"
                disabled={isExtracting || pages.length === 0}
                onClick={handleRunVisionExtraction}
                className={cn(
                  "w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl transition-all",
                  isExtracting || pages.length === 0
                    ? "bg-theme-border text-theme-muted cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95"
                )}
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Extracting Questions & Formulas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Run Multimodal Vision Extraction</span>
                  </>
                )}
              </button>
            </div>

            {isExtracting && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-3">
                <RefreshCw size={16} className="animate-spin shrink-0" />
                <span>{extractionProgress}</span>
              </div>
            )}
          </div>

          {/* SPLIT SCREEN PREVIEW & REVIEW WORKSPACE */}
          {extractedQuestions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Hardcopy Page Viewer with Zoom */}
              <div className="lg:col-span-5 bg-theme-card p-5 rounded-3xl border border-theme-border shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-500" />
                      Original Hardcopy Photo
                    </h4>
                    <p className="text-[10px] text-theme-muted">
                      Inspect against extracted formulas on the right
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-theme-bg p-1 rounded-xl border border-theme-border">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.2))}
                      className="p-1.5 text-theme-muted hover:text-theme-text rounded-lg"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="text-[10px] font-bold px-1.5 text-theme-muted">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                      className="p-1.5 text-theme-muted hover:text-theme-text rounded-lg"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div>

                {pages.length > 0 && pages[selectedPageIndex] ? (
                  <div className="relative overflow-auto max-h-[600px] rounded-2xl border border-theme-border/60 bg-slate-950 flex items-center justify-center p-2 scrollbar-thin">
                    <img
                      src={pages[selectedPageIndex].dataUrl}
                      alt="Exam page view"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                      className="max-w-full transition-transform duration-200 select-none shadow-xl"
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-theme-muted">
                    No page selected
                  </div>
                )}

                {pages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {pages.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPageIndex(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                          selectedPageIndex === idx
                            ? "bg-theme-accent text-white"
                            : "bg-theme-bg border border-theme-border text-theme-muted"
                        )}
                      >
                        {p.pageType === 'solution_key' ? '🔑 Key' : `Page ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Extracted Questions Review & Live KaTeX Math */}
              <div className="lg:col-span-7 space-y-4">
                {/* Header Actions */}
                <div className="bg-theme-card p-5 rounded-3xl border border-theme-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      Extracted Questions ({extractedQuestions.length})
                    </h4>
                    <p className="text-[10px] text-theme-muted">
                      Verify KaTeX math rendering, options, and step-by-step solutions
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDownloadCodebaseJson}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-theme-bg border border-theme-border hover:border-theme-accent text-theme-text rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      title="Download JSON file for src/data/subjects"
                    >
                      <Download size={14} />
                      <span>Codebase JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyJsonToClipboard}
                      className="p-2.5 bg-theme-bg border border-theme-border hover:border-theme-accent text-theme-text rounded-xl text-xs font-bold flex items-center justify-center transition-all"
                      title="Copy JSON to clipboard"
                    >
                      {copiedJson ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveToDatabase}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all"
                    >
                      {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      <span>Save All to Live CBT</span>
                    </button>
                  </div>
                </div>

                {/* List of Questions with In-Place Edit & KaTeX Live Preview */}
                <div className="space-y-4 max-h-[850px] overflow-y-auto pr-1 scrollbar-thin">
                  {extractedQuestions.map((q, qIdx) => (
                    <div 
                      key={q.id}
                      className="bg-theme-card p-5 rounded-3xl border border-theme-border shadow-sm space-y-4 relative"
                    >
                      <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-xs font-black flex items-center justify-center">
                            #{qIdx + 1}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-theme-bg border border-theme-border text-theme-muted">
                            {q.topic || 'General Topic'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            {q.difficulty || 'Medium'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setExtractedQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Question Text Editor & Live KaTeX Render */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted">
                          Question Prompt (Supports $LaTeX$ Math)
                        </label>
                        <textarea
                          rows={3}
                          value={q.question}
                          onChange={(e) => {
                            const updated = [...extractedQuestions];
                            updated[qIdx].question = e.target.value;
                            setExtractedQuestions(updated);
                          }}
                          className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-mono text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                        />
                        {/* Live KaTeX Render Preview */}
                        <div className="p-3 rounded-xl bg-theme-bg/60 border border-theme-border/50 text-xs text-theme-text">
                          <span className="text-[9px] uppercase font-bold text-theme-muted block mb-1">
                            Live Math Preview:
                          </span>
                          <MathRenderer text={q.question} />
                        </div>
                      </div>

                      {/* Options with Correct Answer Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-theme-muted">
                          Options (Select the correct radio button)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => (
                            <div 
                              key={optIdx}
                              className={cn(
                                "flex items-start gap-2.5 p-2.5 rounded-xl border transition-all",
                                q.correctAnswer === optIdx
                                  ? "bg-emerald-500/10 border-emerald-500/50"
                                  : "bg-theme-bg border-theme-border"
                              )}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => {
                                  const updated = [...extractedQuestions];
                                  updated[qIdx].correctAnswer = optIdx;
                                  setExtractedQuestions(updated);
                                }}
                                className="mt-1 accent-emerald-500 cursor-pointer"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-theme-muted">
                                    Option {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  {q.correctAnswer === optIdx && (
                                    <span className="text-[9px] font-black uppercase text-emerald-400">
                                      Correct Key
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...extractedQuestions];
                                    updated[qIdx].options[optIdx] = e.target.value;
                                    setExtractedQuestions(updated);
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-theme-card border border-theme-border rounded-lg text-xs text-theme-text focus:outline-none"
                                />
                                <div className="pt-0.5">
                                  <MathRenderer text={opt} className="text-xs" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step-by-Step Worked Solution */}
                      <div className="space-y-2 pt-2 border-t border-theme-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Sparkles size={12} />
                            Step-by-Step Worked Solution
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...extractedQuestions];
                            updated[qIdx].explanation = e.target.value;
                            setExtractedQuestions(updated);
                          }}
                          className="w-full px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-mono text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30"
                        />
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-theme-text">
                          <span className="text-[9px] uppercase font-bold text-amber-500/80 block mb-1">
                            Solution Math Render:
                          </span>
                          <MathRenderer text={q.explanation} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXAM QUESTION BANK (BROWSE & FILTER) */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-theme-card p-5 rounded-3xl border border-theme-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
              <input
                type="text"
                placeholder="Search questions by formula, keywords, topic, or solution..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/30 font-bold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={bankExamFilter}
                onChange={(e) => setBankExamFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
              >
                <option value="all">All Exams</option>
                {ALL_EXAMS.map(et => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </select>

              <select
                value={bankSubjectFilter}
                onChange={(e) => setBankSubjectFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {ALL_SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={bankYearFilter}
                onChange={(e) => setBankYearFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
              >
                <option value="all">All Years (1990–2025)</option>
                {ALL_YEARS.map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-theme-muted px-1">
            <span>
              Showing <strong>{filteredBankQuestions.length}</strong> questions in bank
            </span>
          </div>

          {/* Question Cards */}
          {filteredBankQuestions.length === 0 ? (
            <div className="p-12 text-center bg-theme-card rounded-3xl border border-theme-border space-y-3">
              <Layers size={36} className="mx-auto text-theme-muted/50" />
              <p className="text-sm font-bold text-theme-text">No Questions Found</p>
              <p className="text-xs text-theme-muted max-w-sm mx-auto">
                No past questions match your filter. Use the Hardcopy Scanner tab to scan pages from past examination booklets.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBankQuestions.map((q, idx) => (
                <div 
                  key={q.id || idx}
                  className="bg-theme-card p-5 rounded-3xl border border-theme-border shadow-sm space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                        {q.examType} {q.subject}
                      </span>
                      {q.year && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-theme-bg border border-theme-border text-theme-muted">
                          {q.year}
                        </span>
                      )}
                      {q.topic && (
                        <span className="text-[10px] font-bold text-theme-muted">
                          • {q.topic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(q)}
                        className="p-1.5 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-bg transition-colors"
                        title="Edit question"
                      >
                        <Edit3 size={14} />
                      </button>
                      {onQuestionDeleted && (
                        <button
                          type="button"
                          onClick={() => onQuestionDeleted(q.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm text-theme-text font-medium">
                    <MathRenderer text={q.question} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs flex items-start gap-2 border",
                          q.correctAnswer === optIdx
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
                            : "bg-theme-bg/50 border-theme-border/60 text-theme-text"
                        )}
                      >
                        <span className="font-black text-[10px] text-theme-muted mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <div className="flex-1">
                          <MathRenderer text={opt} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Worked Solution Accordion */}
                  {q.explanation && (
                    <div className="pt-2 border-t border-theme-border/60">
                      <button
                        type="button"
                        onClick={() => setExpandedExplanationId(expandedExplanationId === q.id ? null : q.id)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                      >
                        <Sparkles size={12} />
                        <span>{expandedExplanationId === q.id ? 'Hide Step-by-Step Solution' : 'View Step-by-Step Solution'}</span>
                        {expandedExplanationId === q.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {expandedExplanationId === q.id && (
                        <div className="mt-2.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-theme-text space-y-1">
                          <MathRenderer text={q.explanation} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CODEBASE BUNDLER & EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-theme-text flex items-center gap-2">
              <FileCode className="text-blue-500" size={20} />
              Codebase Question Bundler & Static Files
            </h3>
            <p className="text-xs text-theme-muted mt-1">
              Download clean, pre-parsed JSON and TypeScript question banks for direct drop-in into <code>src/data/subjects/</code>.
              This gives students 0.01-second instant offline test loads with zero monthly database hosting bills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
              <span className="text-xs font-black uppercase text-theme-text flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Zero Latency Loading
              </span>
              <p className="text-xs text-theme-muted">
                Pre-bundled questions load in memory instantaneously without fetching over slow mobile networks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
              <span className="text-xs font-black uppercase text-theme-text flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-amber-400" />
                Zero Firestore Bill
              </span>
              <p className="text-xs text-theme-muted">
                Students practicing 40-question CBT mocks make 0 database read requests, saving 100% of API quota.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-theme-bg border border-theme-border space-y-3">
              <span className="text-xs font-black uppercase text-theme-text flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-400" />
                Booklet Organization
              </span>
              <p className="text-xs text-theme-muted">
                Modular structure: <code>src/data/subjects/jamb/subjects/jambmathquestions.ts</code>.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-theme-bg border border-theme-border space-y-4">
            <h4 className="text-xs font-black uppercase text-theme-text tracking-wider">
              Generate Export File for Selected Exam & Subject
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-theme-muted uppercase mb-1">Exam</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-xl text-xs font-bold text-theme-text"
                >
                  {ALL_EXAMS.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-theme-muted uppercase mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-xl text-xs font-bold text-theme-text"
                >
                  {ALL_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    const matched = existingQuestions.filter(q => q.examType === examType && q.subject === subject);
                    if (matched.length === 0) {
                      alert(`No existing questions found for ${examType} ${subject} in bank yet.`);
                      return;
                    }
                    const fileName = `${examType.toLowerCase()}_${subject.toLowerCase()}_all.json`;
                    const blob = new Blob([JSON.stringify(matched, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full py-2.5 bg-theme-accent text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-theme-accent/90 transition-all"
                >
                  <Download size={14} />
                  <span>Download Bundled File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-theme-card border border-theme-border rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-sm font-black uppercase text-theme-text">Edit Question</h3>
              <button 
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg hover:bg-theme-bg text-theme-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-theme-muted uppercase mb-1">Question</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs text-theme-text"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-theme-muted uppercase mb-1">Options</label>
                <div className="space-y-2">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={editingQuestion.correctAnswer === i}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })}
                        className="accent-emerald-500"
                      />
                      <span className="text-xs font-bold w-4">{String.fromCharCode(65 + i)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...editingQuestion.options];
                          opts[i] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                        className="flex-1 px-3 py-1.5 bg-theme-bg border border-theme-border rounded-lg text-xs text-theme-text"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-theme-muted uppercase mb-1">Step-by-Step Solution</label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs text-theme-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-theme-bg text-theme-muted rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (db) {
                      try {
                        const qRef = doc(db, 'sib_questions', editingQuestion.id);
                        await writeBatch(db).set(qRef, editingQuestion, { merge: true });
                        alert("Question updated successfully!");
                      } catch (err: any) {
                        alert("Failed to update question: " + err.message);
                      }
                    }
                    setEditingQuestion(null);
                  }}
                  className="px-5 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
