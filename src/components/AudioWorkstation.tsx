import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Square, Pause, Play, Trash2, CheckCircle, FileAudio, 
  Loader2, X, ChevronRight, Settings2, Minus, Plus, Sparkles, 
  Volume2, History, RotateCcw, Save, Upload, Calendar, PlayCircle, 
  Maximize2, ArrowLeft, Radio, Download, Search, Check, Disc,
  Headphones, Award, BookOpen, Clock, FileText, Send, Sparkle
} from 'lucide-react';
import { cn } from '../data/lib/utils';
import { generateQuestionsFromAudio, getAudioExplanation } from '../services/aiQuestions';
import { GoldSpinner, JeeRafHeadIcon } from './AIAvatar';
import { Question } from '../types';
import { MathRenderer } from './MathRenderer';

interface AudioWorkstationProps {
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[], duration: number) => void;
  user: any;
}

export interface SavedTapeItem {
  id: string;
  type: 'recording' | 'explanation' | 'full_session';
  title: string;
  timestamp: number;
  durationSeconds?: number;
  audioUrl?: string;
  explanation?: string;
  topics?: string;
  questionCount?: number;
}

export function AudioWorkstation({ onClose, onQuestionsGenerated, user }: AudioWorkstationProps) {
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'questions' | 'explanation' | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'studio' | 'upload' | 'vault'>('studio');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [viewingItem, setViewingItem] = useState<SavedTapeItem | null>(null);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  
  // Configuration
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [topics, setTopics] = useState('');

  // Audio Analyser State
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [visualData, setVisualData] = useState<Uint8Array>(new Uint8Array(0));
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Tape Vault Persistence
  const historyKey = `jeeraf_audio_vault_${user?.uid || 'guest'}`;
  const [vaultItems, setVaultItems] = useState<SavedTapeItem[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(vaultItems));
    } catch (err) {
      console.warn("Storage quota exceeded for audio vault:", err);
    }
  }, [vaultItems, historyKey]);

  // Timer
  useEffect(() => {
    if (recordingStatus === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingStatus]);

  // Audio Visualizer Loop
  useEffect(() => {
    if (recordingStatus === 'recording' && analyser) {
      const updateVisualizer = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        setVisualData(dataArray);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [recordingStatus, analyser]);

  // Microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          channelCount: 1, 
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav'
      ];
      
      const mimeType = preferredTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 128000
      });
      
      const internalChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          internalChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalType = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(internalChunks, { type: finalType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks(internalChunks);
        if (audioCtx.state !== 'closed') audioCtx.close();
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setRecordingStatus('recording');
      setAudioChunks([]);
      setAudioUrl(null);
      setUploadedFileName(null);
      setRecordingTime(0);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access denied. Please grant microphone permissions to use the Audio Recording Studio.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && recordingStatus === 'recording') {
      mediaRecorder.pause();
      setRecordingStatus('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && recordingStatus === 'paused') {
      mediaRecorder.resume();
      setRecordingStatus('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecordingStatus('stopped');
    }
  };

  const resetRecording = () => {
    if (recordingStatus === 'recording' || recordingStatus === 'paused') {
      stopRecording();
    }
    setRecordingStatus('idle');
    setAudioUrl(null);
    setUploadedFileName(null);
    setAudioChunks([]);
    setRecordingTime(0);
    setExplanation(null);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // 1. AI Task: Generate CBT practice test from audio
  const handleGenerateQuestions = async () => {
    if (!audioChunks.length) {
      alert("Please record audio or upload an audio lecture first!");
      return;
    }
    
    setIsProcessing(true);
    setProcessingType('questions');
    
    try {
      const blobType = audioChunks[0]?.type || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: blobType });
      const base64 = await blobToBase64(audioBlob);
      
      const questions = await generateQuestionsFromAudio(
        base64, 
        blobType, 
        'Personal CBT', 
        questionCount, 
        topics
      );

      if (questions && questions.length > 0) {
        // Auto-save take metadata to vault
        await autoSaveToVault('recording', `Lecture CBT (${questions.length} Questions) - ${topics || 'General'}`);
        onQuestionsGenerated(questions, duration);
      } else {
        alert("The AI could not extract test questions from this audio. Please check microphone clarity and try again.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate questions: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  // 2. AI Task: Full Explanatory / Lecture Breakdown
  const handleGetExplanation = async () => {
    if (!audioChunks.length) {
      alert("Please record audio or upload an audio lecture first!");
      return;
    }
    
    setIsProcessing(true);
    setProcessingType('explanation');
    
    try {
      const blobType = audioChunks[0]?.type || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type: blobType });
      const base64 = await blobToBase64(audioBlob);
      
      const result = await getAudioExplanation(base64, blobType);
      if (result) {
        setExplanation(result);
        await autoSaveToVault('explanation', `Full Lecture Notes: ${topics || 'Session'}`, result);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate explanation: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  // Audio File Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setUploadedFileName(file.name);
      setRecordingStatus('stopped');
      
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || 'audio/mp3' });
      setAudioChunks([blob]);
      setRecordingTime(0);
    }
  };

  // Tape Vault Management
  const autoSaveToVault = async (type: 'recording' | 'explanation' | 'full_session', defaultTitle?: string, customExplanation?: string) => {
    let savedAudioUrl: string | undefined = undefined;
    
    if (audioChunks.length > 0) {
      try {
        const audioBlob = new Blob(audioChunks, { type: audioChunks[0]?.type || 'audio/webm' });
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
        savedAudioUrl = await base64Promise;
      } catch (err) {
        console.error("Failed to persist audio string:", err);
        savedAudioUrl = audioUrl || undefined;
      }
    }

    const newItem: SavedTapeItem = {
      id: `tape-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      title: topics || defaultTitle || (uploadedFileName ? `Tape: ${uploadedFileName}` : `Studio Take ${new Date().toLocaleDateString()}`),
      timestamp: Date.now(),
      durationSeconds: recordingTime > 0 ? recordingTime : undefined,
      audioUrl: savedAudioUrl,
      explanation: customExplanation || explanation || undefined,
      topics: topics || undefined,
      questionCount: questionCount
    };

    setVaultItems(prev => [newItem, ...prev]);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const loadSavedItem = async (item: SavedTapeItem) => {
    if (item.audioUrl) {
      setAudioUrl(item.audioUrl);
      if (item.audioUrl.startsWith('data:')) {
        try {
          const response = await fetch(item.audioUrl);
          const blob = await response.blob();
          setAudioChunks([blob]);
        } catch {
          setAudioChunks([]);
        }
      }
      setRecordingStatus('stopped');
      setViewMode('studio');
      setExplanation(item.explanation || null);
      if (item.topics) setTopics(item.topics);
    } else if (item.explanation) {
      setExplanation(item.explanation);
      setViewMode('studio');
      setRecordingStatus('stopped');
      if (item.topics) setTopics(item.topics);
    }
    setViewingItem(null);
  };

  const deleteFromVault = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this tape record from your vault?")) {
      setVaultItems(prev => prev.filter(item => item.id !== id));
      if (viewingItem?.id === id) setViewingItem(null);
    }
  };

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtered vault records
  const filteredVault = useMemo(() => {
    if (!vaultSearchQuery.trim()) return vaultItems;
    const q = vaultSearchQuery.toLowerCase();
    return vaultItems.filter(item => 
      item.title.toLowerCase().includes(q) || 
      (item.topics && item.topics.toLowerCase().includes(q))
    );
  }, [vaultItems, vaultSearchQuery]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="bg-theme-card text-theme-text rounded-3xl md:rounded-[2.5rem] p-0 max-w-6xl w-full shadow-2xl relative h-[92vh] max-h-[920px] flex flex-col border-2 border-theme-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Alert Banner */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div 
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-6 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs uppercase tracking-wider"
            >
              <CheckCircle size={16} /> Saved to Study Tape Vault
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* TOP STUDIO NAVIGATION BAR                                             */}
        {/* ===================================================================== */}
        <header className="bg-theme-bg/95 border-b border-theme-border px-5 md:px-8 py-3.5 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center shadow-xs text-theme-accent">
              <Headphones size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-theme-text uppercase tracking-tight text-base sm:text-lg">
                  JeeRaf Audio Studio
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                  <Radio size={10} className="animate-pulse" /> Studio Console
                </span>
              </div>
              <p className="text-[11px] text-theme-muted font-bold">
                Speech-to-Test Laboratory & Cognitive Lecture Breakdown
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-theme-card p-1 rounded-2xl border border-theme-border shadow-inner">
            <button 
              onClick={() => { setViewMode('studio'); }}
              className={cn(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'studio' 
                  ? "bg-theme-accent text-white shadow-md shadow-theme-accent/20" 
                  : "text-theme-muted hover:text-theme-text"
              )}
            >
              <Mic size={14} />
              <span>Record Studio</span>
            </button>
            <button 
              onClick={() => { setViewMode('upload'); }}
              className={cn(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'upload' 
                  ? "bg-theme-accent text-white shadow-md shadow-theme-accent/20" 
                  : "text-theme-muted hover:text-theme-text"
              )}
            >
              <Upload size={14} />
              <span>Digital Sync</span>
            </button>
            <button 
              onClick={() => { setViewMode('vault'); }}
              className={cn(
                "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === 'vault' 
                  ? "bg-theme-accent text-white shadow-md shadow-theme-accent/20" 
                  : "text-theme-muted hover:text-theme-text"
              )}
            >
              <Disc size={14} />
              <span>Tape Vault</span>
              <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-theme-card text-theme-text border border-theme-border">
                {vaultItems.length}
              </span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 bg-theme-card border border-theme-border rounded-xl flex items-center justify-center text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-all cursor-pointer shadow-xs"
            title="Exit Studio"
          >
            <X size={18} />
          </button>
        </header>

        {/* ===================================================================== */}
        {/* MAIN BODY WORKSPACE                                                   */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: RECORDING STUDIO DECK */}
            {viewMode === 'studio' && (
              <motion.div
                key="studio-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* 1. STUDIO CONSOLE DECK */}
                <div className={cn(
                  "bg-gradient-to-b from-theme-card to-theme-bg rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 border-2 flex flex-col items-center text-center relative overflow-hidden transition-all shadow-xl",
                  recordingStatus === 'recording' 
                    ? "border-rose-500/80 shadow-rose-500/15 ring-4 ring-rose-500/10" 
                    : "border-theme-border"
                )}>
                  {/* Top Broadcast Ceiling Status Strip */}
                  <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-theme-border/70">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-theme-accent animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-theme-muted">
                        Acoustic Speech Processing Deck
                      </span>
                    </div>

                    {/* Studio Indicator Light (ON AIR) */}
                    <div className={cn(
                      "px-3.5 py-1.5 rounded-full border flex items-center gap-2 font-black uppercase text-[11px] tracking-widest shadow-xs transition-all",
                      recordingStatus === 'recording'
                        ? "bg-rose-500/15 border-rose-500 text-rose-500 animate-pulse shadow-rose-500/20"
                        : recordingStatus === 'paused'
                        ? "bg-amber-500/15 border-amber-500 text-amber-500"
                        : recordingStatus === 'stopped'
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
                        : "bg-theme-bg border-theme-border text-theme-muted"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        recordingStatus === 'recording' ? "bg-rose-500 animate-ping" : 
                        recordingStatus === 'paused' ? "bg-amber-500" :
                        recordingStatus === 'stopped' ? "bg-emerald-500" : "bg-theme-muted"
                      )} />
                      <span>
                        {recordingStatus === 'recording' ? '● ON AIR • REC' :
                         recordingStatus === 'paused' ? 'TAKE PAUSED' :
                         recordingStatus === 'stopped' ? 'MASTER TAPE READY' : 'STUDIO STANDBY'}
                      </span>
                    </div>
                  </div>

                  {/* Master Studio Mic Circle & Waveform Ring */}
                  <div className="relative my-4">
                    <div className={cn(
                      "w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 shadow-2xl",
                      recordingStatus === 'recording' 
                        ? "bg-rose-600 scale-105 shadow-rose-600/40 ring-8 ring-rose-500/25" 
                        : "bg-theme-card border-4 border-theme-border hover:border-theme-accent transition-colors"
                    )}>
                      {/* Live Spectrum Frequency Bars */}
                      {recordingStatus === 'recording' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {Array.from({ length: 16 }).map((_, i) => {
                            const value = visualData[i * 3] || 0;
                            const height = Math.max(8, (value / 255) * 48);
                            return (
                              <motion.div 
                                key={i}
                                className="w-1.5 mx-0.5 bg-white/70 rounded-full"
                                animate={{ height }}
                                transition={{ duration: 0.08 }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {recordingStatus === 'recording' ? (
                        <button 
                          type="button"
                          onClick={stopRecording}
                          title="Cut & Finalize Take"
                          className="relative z-20 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Square className="text-white fill-white" size={40} />
                        </button>
                      ) : recordingStatus === 'paused' ? (
                        <button 
                          type="button"
                          onClick={resumeRecording}
                          title="Resume Recording"
                          className="relative z-20 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Play className="text-amber-500 fill-amber-500 ml-1" size={40} />
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={startRecording}
                          title="Initialize Studio Mic"
                          className="relative z-20 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Mic className="text-theme-accent" size={44} />
                        </button>
                      )}
                    </div>

                    {/* Ambient Acoustic Halo */}
                    {recordingStatus === 'recording' && (
                      <div className="absolute inset-0 -m-3 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none" />
                    )}
                  </div>

                  {/* Master Timecode Readout */}
                  <div className="space-y-1 my-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">
                      Studio Timecode
                    </span>
                    <p className={cn(
                      "font-mono text-5xl sm:text-6xl font-black tracking-tighter drop-shadow-sm",
                      recordingStatus === 'recording' ? "text-rose-500" : "text-theme-text"
                    )}>
                      {formatTimecode(recordingTime)}
                    </p>
                  </div>

                  {/* VU Meter Visualizer Strip */}
                  <div className="my-3 w-full max-w-sm flex items-center justify-center gap-1 p-2 rounded-xl bg-theme-bg border border-theme-border">
                    {Array.from({ length: 18 }).map((_, i) => {
                      const val = visualData[i * 2] || 0;
                      const isHot = i > 14;
                      const isWarm = i > 10 && i <= 14;
                      const isActive = recordingStatus === 'recording' && val > (i * 14);
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex-1 h-3.5 rounded-xs transition-all duration-75",
                            isActive
                              ? isHot ? "bg-rose-500 shadow-xs shadow-rose-500" : isWarm ? "bg-amber-400" : "bg-emerald-400"
                              : "bg-theme-border/40"
                          )} 
                        />
                      );
                    })}
                  </div>

                  {/* Studio Deck Action Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4 z-10">
                    {recordingStatus === 'idle' && (
                      <button 
                        onClick={startRecording} 
                        className="px-8 py-3.5 bg-theme-accent text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-theme-accent/25 hover:opacity-90 transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Mic size={18} /> Initialize Studio Take
                      </button>
                    )}
                    {recordingStatus === 'recording' && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={pauseRecording} 
                          className="px-5 py-3 bg-theme-card border border-theme-border rounded-2xl flex items-center gap-2 text-theme-text hover:text-amber-500 hover:border-amber-500/40 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                          <Pause size={16} /> Pause Take
                        </button>
                        <button 
                          onClick={stopRecording} 
                          className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
                        >
                          <Square size={16} fill="white" /> Cut Take & Process
                        </button>
                      </div>
                    )}
                    {recordingStatus === 'paused' && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={resumeRecording} 
                          className="px-6 py-3 bg-theme-accent text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <Play size={16} fill="white" /> Resume Take
                        </button>
                        <button 
                          onClick={stopRecording} 
                          className="px-5 py-3 bg-theme-card border border-theme-border rounded-2xl font-bold text-xs uppercase tracking-wider text-theme-text hover:bg-theme-bg transition-all cursor-pointer"
                        >
                          Finalize Take
                        </button>
                      </div>
                    )}
                    {recordingStatus === 'stopped' && (
                      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
                        <div className="w-full p-4 bg-theme-card border border-theme-border rounded-2xl shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">
                              Master Tape Playback
                            </span>
                            <span className="text-xs font-mono font-bold text-theme-accent">
                              {formatTimecode(recordingTime)}
                            </span>
                          </div>
                          {audioUrl && (
                            <audio 
                              key={audioUrl}
                              src={audioUrl} 
                              controls 
                              preload="auto"
                              className="w-full h-10 accent-theme-accent rounded-lg" 
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2.5">
                          <button 
                            onClick={resetRecording} 
                            className="px-4 py-2.5 bg-theme-card border border-theme-border rounded-xl text-theme-muted hover:text-theme-text transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <RotateCcw size={14} /> Record New Take
                          </button>
                          <button 
                            onClick={() => autoSaveToVault('recording')} 
                            className="px-4 py-2.5 bg-theme-card border border-theme-border rounded-xl font-bold text-xs uppercase tracking-wider text-theme-text hover:border-theme-accent transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Save size={14} /> Save to Tape Vault
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. EXAM CONFIGURATION & DUAL AI ENGINE DISPATCH */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* CONFIG PANEL */}
                  <div className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-theme-text uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={16} className="text-theme-accent" /> CBT Exam Blueprint
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-theme-muted px-2 py-0.5 rounded-md bg-theme-bg border border-theme-border">
                        Personal Mode
                      </span>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Question Count */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-wider pl-1">
                          Questions Count
                        </label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-2xl p-2.5 text-theme-text shadow-inner">
                          <button 
                            onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))} 
                            className="w-9 h-9 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-xl transition-all cursor-pointer"
                          >
                            <Minus size={16} className="text-theme-muted" />
                          </button>
                          <span className="text-2xl font-black">{questionCount}</span>
                          <button 
                            onClick={() => setQuestionCount(prev => Math.min(50, prev + 5))} 
                            className="w-9 h-9 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-xl transition-all cursor-pointer"
                          >
                            <Plus size={16} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>

                      {/* Test Duration */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-wider pl-1">
                          Test Duration
                        </label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-2xl p-2.5 text-theme-text shadow-inner">
                          <button 
                            onClick={() => setDuration(prev => Math.max(5, prev - 5))} 
                            className="w-9 h-9 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-xl transition-all cursor-pointer"
                          >
                            <Minus size={16} className="text-theme-muted" />
                          </button>
                          <span className="text-2xl font-black">{duration}<span className="text-xs ml-1 font-bold text-theme-muted">MIN</span></span>
                          <button 
                            onClick={() => setDuration(prev => Math.min(180, prev + 5))} 
                            className="w-9 h-9 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-xl transition-all cursor-pointer"
                          >
                            <Plus size={16} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Topic input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-theme-muted uppercase tracking-wider pl-1">
                        Lecture Topic / Syllabus Target
                      </label>
                      <input 
                        placeholder="e.g. Organic Chemistry, Calculus, Newton's Laws..."
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        className="w-full bg-theme-bg border border-theme-border rounded-2xl px-5 py-3.5 text-xs text-theme-text placeholder:text-theme-muted focus:border-theme-accent outline-none transition-all font-medium shadow-inner"
                      />
                    </div>
                  </div>

                  {/* DUAL AI ACTION DECK */}
                  <div className="flex flex-col gap-4">
                    {/* BUTTON 1: GENERATE CBT EXAM */}
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGenerateQuestions}
                      className="flex-1 bg-theme-accent hover:opacity-95 text-white rounded-3xl p-6 font-black uppercase text-xs tracking-widest flex flex-col items-center justify-center gap-3 disabled:opacity-40 transition-all shadow-xl shadow-theme-accent/25 hover:translate-y-[-2px] active:scale-98 cursor-pointer"
                    >
                      {isProcessing && processingType === 'questions' ? (
                        <div className="flex flex-col items-center gap-2">
                          <GoldSpinner size={36} />
                          <span className="text-[11px] tracking-wider animate-pulse font-bold">Synthesizing CBT Exam Questions...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                            <CheckCircle size={26} className="text-white" />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-black block">Generate CBT Exam</span>
                            <span className="text-[10px] font-normal opacity-85 block lowercase">Extract test questions & start exam</span>
                          </div>
                        </>
                      )}
                    </button>

                    {/* BUTTON 2: FULL EXPLANATORY / LECTURE BREAKDOWN */}
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGetExplanation}
                      className="flex-1 bg-theme-card border-2 border-theme-border hover:border-theme-accent text-theme-text rounded-3xl p-6 font-black uppercase text-xs tracking-widest flex flex-col items-center justify-center gap-3 disabled:opacity-40 transition-all hover:bg-theme-bg hover:translate-y-[-2px] active:scale-98 cursor-pointer shadow-sm"
                    >
                      {isProcessing && processingType === 'explanation' ? (
                        <div className="flex flex-col items-center gap-2">
                          <GoldSpinner size={36} />
                          <span className="text-[11px] tracking-wider animate-pulse font-bold text-theme-accent">Analyzing Audio Lecture Deeply...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-theme-accent">
                            <Sparkles size={24} />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-black block">Full Explanatory Breakdown</span>
                            <span className="text-[10px] font-normal text-theme-muted block lowercase">Conceptual rules, formulas & mnemonics</span>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* EXPLANATION RESULT PREVIEW (IF AVAILABLE) */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="bg-theme-card rounded-3xl p-6 sm:p-10 border-2 border-theme-accent/30 shadow-xl relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-theme-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center text-theme-accent">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-theme-text uppercase tracking-tight">
                              AI Lecture Intelligence
                            </h4>
                            <p className="text-xs text-theme-muted font-bold">
                              Verified Academic Synthesis & Revision Guide
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => autoSaveToVault('explanation')} 
                            className="px-4 py-2 bg-theme-accent text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save size={14} /> Save Notes
                          </button>
                          <button 
                            onClick={() => setExplanation(null)} 
                            className="p-2 text-theme-muted hover:text-theme-text bg-theme-bg rounded-xl transition-all cursor-pointer"
                            title="Dismiss notes"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="text-theme-text leading-relaxed p-4 bg-theme-bg/60 rounded-2xl border border-theme-border">
                        <MathRenderer text={explanation} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TAB 2: DIGITAL SYNC / AUDIO FILE UPLOAD */}
            {viewMode === 'upload' && (
              <motion.div
                key="upload-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* UPLOAD DROPZONE */}
                <div className="bg-theme-bg rounded-3xl sm:rounded-[3rem] p-8 sm:p-14 border-2 border-dashed border-theme-border hover:border-theme-accent/60 flex flex-col items-center text-center transition-all shadow-inner">
                  <div className="w-20 h-20 rounded-3xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center mb-6 text-theme-accent">
                    <Upload size={38} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-theme-text uppercase tracking-tight mb-2">
                    Digital Audio Synchronization
                  </h3>
                  <p className="text-theme-muted text-xs sm:text-sm max-w-md mb-8 font-medium">
                    Import existing lecture recordings, seminars, or study voice notes. Supports MP3, WAV, AAC, M4A, FLAC, and WebM.
                  </p>

                  <input 
                    id="digital-audio-file-input" 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />

                  <button 
                    onClick={() => document.getElementById('digital-audio-file-input')?.click()}
                    className="px-8 py-4 bg-theme-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-theme-accent/25 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <FileAudio size={18} /> Select Audio File
                  </button>

                  {/* Uploaded File Player */}
                  <AnimatePresence>
                    {audioUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="mt-8 w-full max-w-lg p-5 bg-theme-card border-2 border-theme-border rounded-2xl shadow-md text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black uppercase tracking-wider text-theme-accent truncate pr-2">
                            {uploadedFileName || "Synchronized Audio Take"}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            Ready for AI
                          </span>
                        </div>
                        <audio src={audioUrl} controls className="w-full h-10 accent-theme-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Configuration & AI Buttons for Uploaded Audio */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-theme-card rounded-3xl p-6 border border-theme-border space-y-4 shadow-sm">
                    <h3 className="text-xs font-black text-theme-text uppercase tracking-widest flex items-center gap-2">
                      <Settings2 size={16} className="text-theme-accent" /> Test Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-theme-muted uppercase block mb-1">Questions</label>
                        <div className="flex items-center justify-between bg-theme-bg p-2 rounded-xl border border-theme-border">
                          <button onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))} className="p-1 hover:bg-theme-card rounded text-theme-muted"><Minus size={14} /></button>
                          <span className="font-bold text-sm">{questionCount}</span>
                          <button onClick={() => setQuestionCount(prev => Math.min(50, prev + 5))} className="p-1 hover:bg-theme-card rounded text-theme-muted"><Plus size={14} /></button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-theme-muted uppercase block mb-1">Duration</label>
                        <div className="flex items-center justify-between bg-theme-bg p-2 rounded-xl border border-theme-border">
                          <button onClick={() => setDuration(prev => Math.max(5, prev - 5))} className="p-1 hover:bg-theme-card rounded text-theme-muted"><Minus size={14} /></button>
                          <span className="font-bold text-sm">{duration}m</span>
                          <button onClick={() => setDuration(prev => Math.min(180, prev + 5))} className="p-1 hover:bg-theme-card rounded text-theme-muted"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-theme-muted uppercase block mb-1">Focus Topics</label>
                      <input 
                        placeholder="Topics in uploaded material..."
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-2 text-xs text-theme-text outline-none focus:border-theme-accent"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGenerateQuestions}
                      className="flex-1 bg-theme-accent hover:opacity-95 text-white rounded-2xl p-5 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-3 disabled:opacity-40 transition-all shadow-lg cursor-pointer"
                    >
                      {isProcessing && processingType === 'questions' ? (
                        <GoldSpinner size={24} />
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          <span>Generate CBT from Uploaded Audio</span>
                        </>
                      )}
                    </button>
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGetExplanation}
                      className="flex-1 bg-theme-card border-2 border-theme-border hover:border-theme-accent text-theme-text rounded-2xl p-5 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-3 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                    >
                      {isProcessing && processingType === 'explanation' ? (
                        <GoldSpinner size={24} />
                      ) : (
                        <>
                          <Sparkles size={20} className="text-theme-accent" />
                          <span>Full Lecture Explanation Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Upload Explanation Result */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-theme-card rounded-3xl p-6 sm:p-8 border border-theme-border shadow-md">
                      <h4 className="text-base font-black text-theme-text uppercase mb-4">Extracted Lecture Notes</h4>
                      <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border text-theme-text text-sm">
                        <MathRenderer text={explanation} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TAB 3: STUDY TAPE VAULT ARCHIVE */}
            {viewMode === 'vault' && (
              <motion.div
                key="vault-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                {/* Vault Header & Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-theme-text uppercase tracking-tight">
                      Study Tape Vault
                    </h3>
                    <p className="text-xs text-theme-muted font-bold">
                      Your secured archive of audio study takes, synthesized lectures, and AI derivations.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                      <input 
                        type="text"
                        value={vaultSearchQuery}
                        onChange={(e) => setVaultSearchQuery(e.target.value)}
                        placeholder="Search vault takes..."
                        className="w-full bg-theme-bg border border-theme-border rounded-xl pl-9 pr-3 py-2 text-xs text-theme-text placeholder:text-theme-muted outline-none focus:border-theme-accent"
                      />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-theme-bg border border-theme-border text-[11px] font-black uppercase text-theme-muted shrink-0">
                      {vaultItems.length} Takes
                    </div>
                  </div>
                </div>

                {/* Vault Items List */}
                {filteredVault.length === 0 ? (
                  <div className="text-center py-24 bg-theme-bg/60 rounded-3xl border-2 border-dashed border-theme-border/70 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-theme-card border border-theme-border flex items-center justify-center mx-auto text-theme-muted">
                      <Disc size={32} />
                    </div>
                    <h4 className="text-base font-black text-theme-text uppercase">The Tape Vault is Empty</h4>
                    <p className="text-xs text-theme-muted max-w-sm mx-auto font-medium">
                      Record a live lecture in the Studio or upload study material to populate your personal audio archive.
                    </p>
                    <button
                      onClick={() => setViewMode('studio')}
                      className="px-6 py-2.5 bg-theme-accent text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2 mt-2"
                    >
                      <Mic size={14} /> Open Recording Studio
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredVault.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-theme-card border-2 border-theme-border hover:border-theme-accent/50 rounded-3xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              {item.type === 'recording' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/20">
                                  <Mic size={10} /> Live Take
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-theme-accent/15 text-theme-accent border border-theme-accent/20">
                                  <Sparkles size={10} /> Lecture Notes
                                </span>
                              )}
                              {item.durationSeconds && (
                                <span className="text-[10px] font-mono text-theme-muted font-bold">
                                  {formatTimecode(item.durationSeconds)}
                                </span>
                              )}
                            </div>

                            <button 
                              onClick={(e) => deleteFromVault(item.id, e)}
                              className="p-1.5 text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors line-clamp-1 uppercase tracking-tight">
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-2 text-theme-muted text-[11px] font-bold mt-1">
                            <Calendar size={12} />
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {/* Audio Player if present */}
                          {item.audioUrl && (
                            <div className="mt-3 p-2 bg-theme-bg rounded-xl border border-theme-border">
                              <audio src={item.audioUrl} controls className="w-full h-8 accent-theme-accent" />
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-theme-border grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => loadSavedItem(item)}
                            className="py-2.5 bg-theme-bg hover:bg-theme-card border border-theme-border text-theme-text rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <PlayCircle size={14} className="text-theme-accent" /> Open Take
                          </button>
                          <button 
                            onClick={() => setViewingItem(item)}
                            className="py-2.5 bg-theme-accent text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Maximize2 size={13} /> Focus Mode
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ===================================================================== */}
        {/* FULLSCREEN FOCUSED TAPE VIEW (THEME-AWARE FOCUS MODE)                 */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {viewingItem && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-[80] bg-theme-card overflow-y-auto custom-scrollbar flex flex-col p-4 sm:p-8 md:p-12"
            >
              <div className="max-w-4xl mx-auto w-full space-y-8 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-theme-border">
                  <button 
                    onClick={() => setViewingItem(null)}
                    className="px-4 py-2 bg-theme-bg border border-theme-border rounded-xl text-theme-text hover:bg-theme-card transition-all flex items-center gap-2 font-black uppercase text-xs tracking-wider cursor-pointer shadow-xs"
                  >
                    <ArrowLeft size={16} /> Back to Vault
                  </button>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        deleteFromVault(viewingItem.id);
                        setViewingItem(null);
                      }}
                      className="p-2.5 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-theme-accent">
                    Vault Tape Inspection
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-theme-text uppercase tracking-tight">
                    {viewingItem.title}
                  </h2>
                  <p className="text-xs text-theme-muted font-bold">
                    Recorded on {new Date(viewingItem.timestamp).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>

                {/* Audio Playback Box */}
                {viewingItem.audioUrl && (
                  <div className="p-6 bg-theme-bg rounded-3xl border-2 border-theme-border space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-theme-text flex items-center gap-2">
                        <Volume2 size={16} className="text-theme-accent" /> Master Audio Stream
                      </span>
                      {viewingItem.durationSeconds && (
                        <span className="text-xs font-mono font-bold text-theme-accent">
                          {formatTimecode(viewingItem.durationSeconds)}
                        </span>
                      )}
                    </div>
                    <audio src={viewingItem.audioUrl} controls className="w-full h-12 accent-theme-accent" />
                    
                    <div className="pt-2 flex justify-end">
                      <button 
                        onClick={() => loadSavedItem(viewingItem)}
                        className="px-6 py-2.5 bg-theme-accent text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <PlayCircle size={16} /> Load into Studio Console
                      </button>
                    </div>
                  </div>
                )}

                {/* Markdown Explanation Notes */}
                {viewingItem.explanation && (
                  <div className="p-6 sm:p-8 bg-theme-bg rounded-3xl border border-theme-border space-y-4 shadow-sm flex-1">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border">
                      <Sparkles size={18} className="text-theme-accent" />
                      <h4 className="text-sm font-black text-theme-text uppercase tracking-wider">
                        Cognitive Study Intelligence
                      </h4>
                    </div>
                    <div className="text-theme-text text-sm leading-relaxed">
                      <MathRenderer text={viewingItem.explanation} />
                    </div>
                  </div>
                )}

                <div className="pt-6 pb-2 text-center">
                  <button 
                    onClick={() => setViewingItem(null)}
                    className="px-8 py-3 bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Close Focus Mode
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
