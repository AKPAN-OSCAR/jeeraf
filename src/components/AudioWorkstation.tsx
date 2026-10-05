import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Pause, Play, Trash2, CheckCircle, FileAudio, Loader2, X, ChevronRight, Settings2, Minus, Plus, Sparkles, Volume2, History, RotateCcw, Save, Trash, Upload, Calendar, PlayCircle, Maximize2, ArrowLeft } from 'lucide-react';
import { cn } from '../data/lib/utils';
import { generateQuestionsFromAudio, getAudioExplanation } from '../services/aiQuestions';
import { GoldSpinner } from './AIAvatar';
import { Question } from '../types';
import Markdown from 'react-markdown';

interface AudioWorkstationProps {
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[], duration: number) => void;
  user: any;
}

interface SavedItem {
  id: string;
  type: 'recording' | 'explanation';
  title: string;
  timestamp: number;
  audioUrl?: string; // This will actually be base64 or blob URL in memory, usually we'd use Firestore Storage but for now we keep LocalStorage pattern with better persistence warnings
  explanation?: string;
}

export function AudioWorkstation({ onClose, onQuestionsGenerated, user }: AudioWorkstationProps) {
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'questions' | 'explanation' | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'studio' | 'vault'>('selection');
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [viewingItem, setViewingItem] = useState<SavedItem | null>(null);
  
  // Configuration
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [topics, setTopics] = useState('');

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [visualData, setVisualData] = useState<Uint8Array>(new Uint8Array(0));
  const animationFrameRef = useRef<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // History state (sync with user-specific local storage)
  const historyKey = `study_audio_history_${user?.uid || 'guest'}`;
  const [history, setHistory] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(history));
  }, [history, historyKey]);

  // Draft persistence for ongoing recording
  useEffect(() => {
    const draftKey = `audio_draft_${user?.uid || 'guest'}`;
    if (recordingStatus === 'recording' || recordingStatus === 'paused') {
       // We can't easily save the Blob chunks in real-time to localStorage, 
       // but we can save the metadata so the user knows they were recording.
       localStorage.setItem(draftKey, JSON.stringify({
         recordingTime,
         topics,
         status: recordingStatus,
         timestamp: Date.now()
       }));
    } else if (recordingStatus === 'idle') {
      localStorage.removeItem(draftKey);
    }
  }, [recordingStatus, recordingTime, topics, user]);

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
      // We don't reset visualData immediately to keep the last frame visible briefly
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [recordingStatus, analyser]);

  const startRecording = async () => {
    try {
      // Enhanced audio constraints for maximum clarity
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Disabling aggressive noise suppression for "normal" voice sound
          autoGainControl: true,
          channelCount: 1, 
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;

      // Audio Context for Visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);
      
      // Preferred formats
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav'
      ];
      
      let mimeType = preferredTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      // Force audio/wav if on Safari/iOS which might be picky, or use empty for default
      if (!mimeType) {
        console.warn("No preferred mimeType supported, using browser default");
      }

      console.log("Using mimeType for recording:", mimeType);

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
        // Use the recorder's actual mimeType if the blob doesn't have one
        const finalType = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(internalChunks, { type: finalType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks(internalChunks);
        if (audioCtx.state !== 'closed') audioCtx.close();
      };

      recorder.start(1000); // 1s slices are safer for some browsers than 100ms
      setMediaRecorder(recorder);
      setRecordingStatus('recording');
      setAudioChunks([]);
      setAudioUrl(null);
      setRecordingTime(0);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access denied. Please allow permissions for studio recording.");
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

  const handleGenerateQuestions = async () => {
    if (!audioChunks.length) return;
    
    setIsProcessing(true);
    setProcessingType('questions');
    
    try {
      const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
      const base64 = await blobToBase64(audioBlob);
      
      const questions = await generateQuestionsFromAudio(
        base64, 
        audioChunks[0].type, 
        'Personal CBT', 
        questionCount, 
        topics
      );

      if (questions.length > 0) {
        onQuestionsGenerated(questions, duration);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleGetExplanation = async () => {
    if (!audioChunks.length) return;
    
    setIsProcessing(true);
    setProcessingType('explanation');
    
    try {
      const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
      const base64 = await blobToBase64(audioBlob);
      
      const result = await getAudioExplanation(base64, audioChunks[0].type);
      setExplanation(result);
    } catch (err) {
      console.error(err);
      alert("Failed to get explanation.");
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setRecordingStatus('stopped');
      
      // Load chunks from file
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      setAudioChunks([blob]);
      setRecordingTime(0); 
    }
  };

  const saveToHistory = async (type: 'recording' | 'explanation') => {
    let savedAudioUrl = undefined;
    
    // For recordings, we convert the blob URL to a DataURL for persistence
    if (type === 'recording' && audioChunks.length > 0) {
      try {
        const audioBlob = new Blob(audioChunks, { type: audioChunks[0].type });
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
        savedAudioUrl = await base64Promise;
      } catch (err) {
        console.error("Failed to persist audio:", err);
        savedAudioUrl = audioUrl || undefined; // Fallback to temp URL
      }
    }

    const newItem: SavedItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: topics || `Audio Study ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      audioUrl: savedAudioUrl,
      explanation: type === 'explanation' ? explanation || undefined : undefined,
    };
    setHistory([newItem, ...history]);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const loadSavedItem = async (item: SavedItem) => {
    if (item.audioUrl) {
      setAudioUrl(item.audioUrl);
      
      // If it's a data URL, convert it back to chunks so processing works
      if (item.audioUrl.startsWith('data:')) {
        try {
          const response = await fetch(item.audioUrl);
          const blob = await response.blob();
          setAudioChunks([blob]);
        } catch (err) {
          console.error("Failed to recover audio chunks:", err);
          // Fallback: create a dummy chunk so logic doesn't break if processing is clicked
          setAudioChunks([]); 
        }
      }
      
      setActiveTab('record');
      setRecordingStatus('stopped');
      setViewMode('studio');
      setExplanation(item.explanation || null);
    } else if (item.explanation) {
      setExplanation(item.explanation);
      setViewMode('studio');
      setActiveTab('record');
      setRecordingStatus('stopped');
    }
  };

  const deleteFromHistory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this study record?")) {
      setHistory(history.filter(item => item.id !== id));
      if (viewingItem?.id === id) setViewingItem(null);
    }
  };

  const handleModeSelection = (mode: 'record' | 'upload') => {
    setActiveTab(mode);
    setViewMode('studio');
    resetRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-theme-card md:rounded-[2.5rem] p-6 md:p-8 max-w-6xl w-full shadow-2xl relative h-full md:h-[90vh] flex flex-col md:flex-row gap-8 border border-theme-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Notification */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold"
            >
              <CheckCircle /> Study Record Saved Successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-screen Focused View (Blackout Mode) */}
        <AnimatePresence>
          {viewingItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[80] bg-black overflow-y-auto custom-scrollbar"
            >
              <div className="min-h-screen flex flex-col p-6 md:p-20">
                {/* Top Controls */}
                <div className="flex items-center justify-between mb-16">
                  <button 
                    onClick={() => setViewingItem(null)}
                    className="p-4 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 transition-all flex items-center gap-3 font-bold uppercase text-[11px] tracking-[0.3em]"
                  >
                    <ArrowLeft size={20} /> Back to Vault
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full">
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{viewingItem.type} Session</p>
                    </div>
                    <button 
                      onClick={() => {
                        deleteFromHistory(viewingItem.id);
                        setViewingItem(null);
                      }}
                      className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full hover:bg-rose-500 hover:text-white transition-all hover:scale-110"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto w-full space-y-20 flex-1 flex flex-col justify-center">
                  <div className="space-y-6 text-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-6">{viewingItem.title}</h2>
                      <p className="text-white/40 text-lg font-medium">{new Date(viewingItem.timestamp).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </motion.div>
                  </div>

                  {viewingItem.audioUrl && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-12 bg-white/[0.03] border-2 border-white/10 rounded-[4rem] shadow-2xl backdrop-blur-xl group hover:border-rose-500/30 transition-all"
                    >
                      <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/40">
                          <Volume2 className="text-white" size={32} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">Audio Analysis</h4>
                          <p className="text-xs text-white/40 font-bold tracking-widest uppercase">Neural Source Material</p>
                        </div>
                      </div>
                      {viewingItem.audioUrl && (
                        <audio 
                          key={viewingItem.audioUrl}
                          src={viewingItem.audioUrl} 
                          controls 
                          preload="auto"
                          className="w-full h-16 accent-rose-500 bg-transparent" 
                        />
                      )}
                      
                      <div className="mt-10 flex justify-center pt-6 border-t border-white/5">
                        <button 
                          onClick={() => loadSavedItem(viewingItem)}
                          className="px-12 py-5 bg-rose-500 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                        >
                          <PlayCircle size={24} /> Enter Recording Studio
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {viewingItem.explanation && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-16 bg-white/[0.02] border border-white/10 rounded-[4rem] prose prose-invert max-w-none shadow-inner"
                    >
                      <div className="flex items-center gap-4 mb-12">
                        <Sparkles className="text-rose-500" size={32} />
                        <h4 className="text-2xl font-black text-white uppercase tracking-[0.2em] m-0">Study Intelligence</h4>
                      </div>
                      <div className="text-white/70 text-xl leading-relaxed markdown-content markdown-vault-focused">
                        <Markdown>{viewingItem.explanation}</Markdown>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-20 flex justify-center">
                    <button 
                      onClick={() => setViewingItem(null)}
                      className="group flex flex-col items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500 transition-all">
                        <X size={32} className="text-white group-hover:scale-125 transition-transform" />
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] group-hover:text-rose-500 transition-colors">Close Focus Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Dash Menu */}
        <div className="absolute top-0 inset-x-0 h-20 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Volume2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-black text-theme-text uppercase tracking-tighter text-lg">Study Studio</h2>
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Neural Audio Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-theme-card p-1.5 rounded-2xl border border-theme-border shadow-sm">
            <button 
              onClick={() => setViewMode('selection')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'selection' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-theme-muted hover:text-theme-text"
              )}
            >
              Mode Select
            </button>
            <button 
              onClick={() => { if(viewMode === 'selection') handleModeSelection('record'); else setViewMode('studio'); }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'studio' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-theme-muted hover:text-theme-text"
              )}
            >
              Studio
            </button>
            <button 
              onClick={() => setViewMode('vault')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'vault' ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "text-theme-muted hover:text-theme-text"
              )}
            >
              Study Vault
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 bg-theme-card border border-theme-border rounded-xl flex items-center justify-center text-theme-muted hover:text-rose-500 transition-all hover:scale-105 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 mt-24 overflow-y-auto px-4 md:px-8 pb-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {viewMode === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto"
              >
                <div className="text-center mb-16">
                  <h1 className="text-6xl font-black text-theme-text tracking-tighter mb-4">Choose Your <span className="text-rose-500">Method</span></h1>
                  <p className="text-theme-muted text-lg max-w-2xl mx-auto font-medium">Capture lectures in real-time or process existing digital libraries with our advanced AI Studio.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full">
                  <button 
                    onClick={() => handleModeSelection('record')}
                    className="group relative bg-theme-card border-2 border-theme-border p-12 rounded-[3.5rem] text-left transition-all hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Mic size={120} className="text-rose-500" />
                    </div>
                    <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/40 mb-8 group-hover:scale-110 transition-transform">
                      <Mic className="text-white" size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-theme-text mb-4 uppercase tracking-tight">Direct Recording</h3>
                    <p className="text-theme-muted text-lg font-medium leading-relaxed">Perfect for live lectures. Our acoustic engine filters background noise for crystal clear transcripts.</p>
                    <div className="mt-8 flex items-center gap-3 text-rose-500 font-bold uppercase tracking-widest text-xs">
                      Enter Studio <ChevronRight size={16} />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleModeSelection('upload')}
                    className="group relative bg-theme-card border-2 border-theme-border p-12 rounded-[3.5rem] text-left transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FileAudio size={120} className="text-emerald-500" />
                    </div>
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-8 group-hover:scale-110 transition-transform">
                      <FileAudio className="text-white" size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-theme-text mb-4 uppercase tracking-tight">Digital Sync</h3>
                    <p className="text-theme-muted text-lg font-medium leading-relaxed">Upload your library of MP3, WAV or M4A files. Ideal for processing pre-recorded study materials.</p>
                    <div className="mt-8 flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                      Start Upload <ChevronRight size={16} />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {viewMode === 'studio' && activeTab === 'record' && (
              <motion.div
                key="studio-record"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-10"
              >
                {/* 1. STUDIO HEADER & ON-AIR BADGE */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-theme-border/60 pb-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setViewMode('selection')} 
                      className="p-3 bg-theme-card border border-theme-border rounded-2xl text-theme-muted hover:text-rose-500 hover:border-rose-500/30 transition-all active:scale-95 shadow-xs"
                      title="Back to Station Modes"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-2xl sm:text-3xl font-black text-theme-text uppercase tracking-tight">Audio Studio & Lecture Lab</h3>
                      </div>
                      <p className="text-theme-muted text-xs sm:text-sm border-l-2 border-rose-500 pl-3 mt-1">
                        High-fidelity acoustic speech-to-test processor with real-time AI derivations.
                      </p>
                    </div>
                  </div>

                  {/* Studio Broadcast Indicator (ON AIR) */}
                  <div className={cn(
                    "px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-black uppercase text-xs tracking-widest shadow-md transition-all",
                    recordingStatus === 'recording'
                      ? "bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse shadow-rose-500/20"
                      : recordingStatus === 'paused'
                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                      : recordingStatus === 'stopped'
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-theme-bg border-theme-border text-theme-muted"
                  )}>
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      recordingStatus === 'recording' ? "bg-rose-500 animate-ping" : 
                      recordingStatus === 'paused' ? "bg-amber-500" :
                      recordingStatus === 'stopped' ? "bg-emerald-400" : "bg-theme-muted"
                    )} />
                    <span>
                      {recordingStatus === 'recording' ? '● ON AIR • REC' :
                       recordingStatus === 'paused' ? 'PAUSED' :
                       recordingStatus === 'stopped' ? 'TAPE READY' : 'STUDIO READY'}
                    </span>
                  </div>
                </div>

                {/* 2. RECORDING CONSOLE */}
                <div className={cn(
                  "bg-gradient-to-b from-theme-card/90 to-theme-bg rounded-[3rem] p-8 sm:p-12 border-2 flex flex-col items-center text-center relative overflow-hidden transition-all duration-700 shadow-2xl",
                  recordingStatus === 'recording' 
                    ? "border-rose-500/60 shadow-rose-500/10" 
                    : "border-theme-border shadow-xl"
                )}>
                  {/* Studio Ceiling Status Light Strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-theme-border/40 overflow-hidden">
                    {recordingStatus === 'recording' && (
                      <motion.div 
                        className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" 
                        animate={{ x: ['-100%', '100%'] }} 
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} 
                      />
                    )}
                  </div>

                  <div className="w-full flex flex-col items-center">
                    {/* Central Studio Mic / Visualizer Ring */}
                    <div className="relative mb-8">
                      <div className={cn(
                        "w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 shadow-2xl",
                        recordingStatus === 'recording' 
                          ? "bg-rose-500 scale-105 shadow-rose-500/40 ring-8 ring-rose-500/20" 
                          : "bg-theme-card border-4 border-theme-border hover:border-rose-500/40"
                      )}>
                        {/* Audio Waveform Bars Inside Ring */}
                        {recordingStatus === 'recording' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {Array.from({ length: 16 }).map((_, i) => {
                              const value = visualData[i * 3] || 0;
                              const height = Math.max(8, (value / 255) * 48);
                              return (
                                <motion.div 
                                  key={i}
                                  className="w-1.5 mx-0.5 bg-white/50 rounded-full"
                                  animate={{ height }}
                                  transition={{ duration: 0.08 }}
                                />
                              );
                            })}
                          </div>
                        )}

                        {recordingStatus === 'recording' ? (
                          <Square className="text-white fill-white cursor-pointer relative z-20 hover:scale-110 transition-transform" size={44} onClick={stopRecording} />
                        ) : recordingStatus === 'paused' ? (
                          <Play className="text-rose-500 fill-rose-500 ml-1 cursor-pointer hover:scale-110 transition-transform" size={44} onClick={resumeRecording} />
                        ) : (
                          <Mic className="text-rose-500 cursor-pointer hover:scale-110 transition-transform" size={48} onClick={startRecording} />
                        )}
                      </div>

                      {/* Studio VU Meter Ambient Halo */}
                      {recordingStatus === 'recording' && (
                        <div className="absolute inset-0 -m-3 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none" />
                      )}
                    </div>

                    {/* Studio Console Timecode */}
                    <div className="space-y-2 z-10">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">
                          Studio Timecode
                        </span>
                      </div>
                      <p className={cn(
                        "font-mono text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-md",
                        recordingStatus === 'recording' ? "text-rose-500" : "text-theme-muted"
                      )}>
                        {formatTime(recordingTime)}
                      </p>
                    </div>

                    {/* Studio VU Meter Strip */}
                    <div className="my-6 w-full max-w-xs flex items-center justify-center gap-1.5 p-2 rounded-xl bg-theme-bg/80 border border-theme-border/70">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const val = visualData[i * 3] || 0;
                        const isHot = i > 11;
                        const isWarm = i > 8 && i <= 11;
                        const isActive = recordingStatus === 'recording' && val > (i * 18);
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "flex-1 h-3 rounded-xs transition-all duration-75",
                              isActive
                                ? isHot ? "bg-rose-500 shadow-xs shadow-rose-500" : isWarm ? "bg-amber-400" : "bg-emerald-400"
                                : "bg-theme-border/40"
                            )} 
                          />
                        );
                      })}
                    </div>

                    {/* Primary Studio Action Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 z-10">
                      {recordingStatus === 'idle' && (
                        <button 
                          onClick={startRecording} 
                          className="px-12 py-5 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-3"
                        >
                          <Mic size={24} /> Initialize Studio Mic
                        </button>
                      )}
                      {recordingStatus === 'recording' && (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={pauseRecording} 
                            className="px-6 py-4 bg-theme-card border border-theme-border rounded-2xl flex items-center gap-2 text-theme-muted hover:text-amber-500 hover:border-amber-500/40 transition-all font-bold text-sm"
                          >
                            <Pause size={18} /> Pause Take
                          </button>
                          <button 
                            onClick={stopRecording} 
                            className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black text-base shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all flex items-center gap-3 active:scale-95"
                          >
                            <Square size={20} fill="white" /> Cut & Process Take
                          </button>
                        </div>
                      )}
                      {recordingStatus === 'paused' && (
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={resumeRecording} 
                            className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-base shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all flex items-center gap-2 active:scale-95"
                          >
                            <Play size={20} fill="white" /> Resume Take
                          </button>
                          <button 
                            onClick={stopRecording} 
                            className="px-6 py-4 bg-theme-card border border-theme-border rounded-2xl font-bold text-sm text-theme-text hover:bg-theme-bg transition-all"
                          >
                            Finalize Recording
                          </button>
                        </div>
                      )}
                      {recordingStatus === 'stopped' && (
                        <div className="flex flex-col items-center gap-6 w-full max-w-xl">
                          <div className="w-full p-5 bg-theme-card border border-theme-border rounded-2xl shadow-sm space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted block text-left">
                              Studio Tape Playback
                            </span>
                            {audioUrl && (
                              <audio 
                                key={audioUrl}
                                src={audioUrl} 
                                controls 
                                preload="auto"
                                className="w-full h-11 accent-rose-500 rounded-lg" 
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap justify-center gap-3">
                            <button 
                              onClick={resetRecording} 
                              className="px-6 py-3 bg-theme-card border border-theme-border rounded-xl text-theme-muted hover:text-rose-500 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
                            >
                              <RotateCcw size={16} /> Record New Take
                            </button>
                            <button 
                              onClick={() => saveToHistory('recording')} 
                              className="px-6 py-3 bg-theme-card border border-theme-border rounded-xl font-bold text-xs uppercase tracking-wider text-theme-text hover:border-theme-muted transition-all flex items-center gap-2"
                            >
                              <Save size={16} /> Save to Tape Vault
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. SETTINGS & AI EXECUTION BELOW RECORDING */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-theme-card rounded-[3.5rem] p-10 border border-theme-border space-y-10 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-theme-muted uppercase tracking-[0.4em] flex items-center gap-4">
                        <Settings2 size={18} className="text-rose-500" /> Precision Engine
                      </h3>
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">Exam Complexity</label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-3xl p-3 text-theme-text shadow-inner">
                          <button onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all shadow-sm">
                            <Minus size={20} className="text-theme-muted" />
                          </button>
                          <span className="text-3xl font-black">{questionCount}</span>
                          <button onClick={() => setQuestionCount(prev => Math.min(100, prev + 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all shadow-sm">
                            <Plus size={20} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">Test Duration</label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-3xl p-3 text-theme-text shadow-inner">
                          <button onClick={() => setDuration(prev => Math.max(10, prev - 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all shadow-sm">
                            <Minus size={20} className="text-theme-muted" />
                          </button>
                          <span className="text-3xl font-black">{duration}<span className="text-[10px] ml-1 opacity-40">MIN</span></span>
                          <button onClick={() => setDuration(prev => Math.min(180, prev + 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all shadow-sm">
                            <Plus size={20} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">Neural Focus Point</label>
                      <input 
                        placeholder="Subject, Topic or Concept..."
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        className="w-full bg-theme-bg border border-theme-border rounded-[2.5rem] px-8 py-6 text-sm focus:ring-8 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-theme-text transition-all font-medium shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGenerateQuestions}
                      className="flex-1 group relative overflow-hidden bg-rose-500 text-white rounded-[3.5rem] font-black uppercase text-sm tracking-[0.5em] flex flex-col items-center justify-center gap-6 disabled:opacity-40 transition-all shadow-2xl shadow-rose-500/40 hover:translate-y-[-6px] active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isProcessing && processingType === 'questions' ? (
                        <div className="flex flex-col items-center gap-4">
                           <GoldSpinner size={48} />
                           <span className="text-[10px] tracking-widest animate-pulse">Running Neural Array...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle size={64} className="drop-shadow-2xl" />
                          <span>Generate Exam</span>
                        </>
                      )}
                    </button>
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGetExplanation}
                      className="flex-1 group bg-theme-card border-4 border-theme-border rounded-[3.5rem] font-black uppercase text-sm tracking-[0.5em] flex flex-col items-center justify-center gap-6 disabled:opacity-40 transition-all hover:bg-theme-bg hover:border-rose-500/40 hover:translate-y-[-6px] active:scale-95 shadow-xl"
                    >
                      {isProcessing && processingType === 'explanation' ? (
                        <div className="flex flex-col items-center gap-4">
                           <GoldSpinner size={48} />
                           <span className="text-[10px] tracking-widest animate-pulse">Extracting Narrative...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles className="text-rose-500" size={40} />
                          </div>
                          <span className="text-theme-text">Full Explanation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Explanation Result Preview */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-theme-bg rounded-[4rem] p-12 border-2 border-rose-500/30 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 flex gap-4 z-10">
                        <button onClick={() => saveToHistory('explanation')} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-rose-500/30 hover:scale-105 transition-all flex items-center gap-3">
                          <Save size={20} /> Save Study Notes
                        </button>
                        <button onClick={() => setExplanation(null)} className="p-4 bg-theme-card border border-theme-border rounded-2xl text-theme-muted hover:text-rose-500 transition-all">
                          <Trash2 size={24} />
                        </button>
                      </div>
                      <div className="flex items-center gap-6 mb-12">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 shadow-inner">
                          <Sparkles size={32} className="text-rose-500 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-4xl font-black text-theme-text uppercase tracking-tight">AI Insights</h4>
                          <p className="text-xs text-rose-500 font-black tracking-widest uppercase mt-1">Deep-Dive Analysis Module</p>
                        </div>
                      </div>
                      <div className="prose prose-xl prose-invert max-w-none text-theme-muted text-lg leading-relaxed markdown-content p-10 bg-theme-card/30 rounded-[3rem] border border-theme-border/50">
                        <Markdown>{explanation}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {viewMode === 'studio' && activeTab === 'upload' && (
              <motion.div
                key="studio-upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                {/* 1. SETTINGS FIRST for Upload Path */}
                <div className="flex items-center gap-4">
                  <button onClick={() => setViewMode('selection')} className="p-3 bg-theme-card border border-theme-border rounded-xl text-theme-muted hover:text-rose-500 transition-all">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h3 className="text-3xl font-black text-theme-text uppercase tracking-tight text-left">Digital Material Processor</h3>
                    <p className="text-theme-muted text-sm border-l-2 border-emerald-500 pl-3 text-left">Upload pre-recorded sessions for analysis.</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 pb-8">
                  <div className="bg-theme-card rounded-[3.5rem] p-10 border border-theme-border space-y-10 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-theme-muted uppercase tracking-[0.4em] flex items-center gap-4">
                        <Settings2 size={18} className="text-emerald-500" /> Processor Config
                      </h3>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">Questions</label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-3xl p-3 text-theme-text shadow-inner">
                          <button onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all">
                            <Minus size={20} className="text-theme-muted" />
                          </button>
                          <span className="text-3xl font-black">{questionCount}</span>
                          <button onClick={() => setQuestionCount(prev => Math.min(100, prev + 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all">
                            <Plus size={20} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">CBT Duration</label>
                        <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-3xl p-3 text-theme-text shadow-inner">
                          <button onClick={() => setDuration(prev => Math.max(10, prev - 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all">
                            <Minus size={20} className="text-theme-muted" />
                          </button>
                          <span className="text-3xl font-black">{duration}m</span>
                          <button onClick={() => setDuration(prev => Math.min(180, prev + 5))} className="w-12 h-12 flex items-center justify-center bg-theme-card hover:bg-theme-border rounded-2xl transition-all">
                            <Plus size={20} className="text-theme-muted" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] pl-2">Subject Matter Focus</label>
                      <input 
                        placeholder="Search specific topics in audio..."
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        className="w-full bg-theme-bg border border-theme-border rounded-[2.5rem] px-8 py-6 text-sm focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-theme-text transition-all font-medium shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGenerateQuestions}
                      className="flex-1 group relative overflow-hidden bg-emerald-600 text-white rounded-[3.5rem] font-black uppercase text-sm tracking-[0.5em] flex flex-col items-center justify-center gap-6 disabled:opacity-40 transition-all shadow-2xl shadow-emerald-500/40 hover:translate-y-[-6px] active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isProcessing && processingType === 'questions' ? <GoldSpinner size={48} /> : <CheckCircle size={64} className="drop-shadow-2xl" />}
                      <span>Process CBT</span>
                    </button>
                    <button
                      disabled={!audioUrl || isProcessing}
                      onClick={handleGetExplanation}
                      className="flex-1 group bg-theme-card border-4 border-theme-border rounded-[3.5rem] font-black uppercase text-sm tracking-[0.5em] flex flex-col items-center justify-center gap-6 disabled:opacity-40 transition-all hover:bg-theme-bg hover:border-emerald-500/40 hover:translate-y-[-6px] active:scale-95 shadow-xl"
                    >
                      {isProcessing && processingType === 'explanation' ? <GoldSpinner size={48} /> : <Sparkles className="text-emerald-500" size={64} />}
                      <span className="text-theme-text">Narrative Analysis</span>
                    </button>
                  </div>
                </div>

                {/* 2. UPLOAD ZONE SECOND (Upload Area) */}
                <div className="bg-theme-bg rounded-[4rem] p-16 border-2 border-dashed border-theme-border flex flex-col items-center text-center relative overflow-hidden hover:border-emerald-500/50 transition-all shadow-inner">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20 group hover:scale-110 transition-transform">
                    <Upload className="text-emerald-500" size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-theme-text mb-4 uppercase tracking-tight">Material Link</h3>
                  <p className="text-theme-muted text-lg max-w-sm mb-12 leading-relaxed font-medium">Link your lecture audio files for deep neural analysis. Supports high-fidelity formats.</p>
                  
                  <button 
                    onClick={() => document.getElementById('audio-upload-input')?.click()}
                    className="px-16 py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-emerald-500/30 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Upload size={32} /> Link Files
                    <input id="audio-upload-input" type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                  </button>

                  <AnimatePresence>
                    {audioUrl && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 w-full max-w-lg p-10 bg-theme-card border-2 border-theme-border rounded-[3rem] shadow-2xl">
                         <div className="flex items-center justify-between mb-6">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">File Inbound</span>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[11px] font-black text-emerald-500 uppercase">Synchronized</span>
                            </div>
                         </div>
                         <audio src={audioUrl} controls className="w-full h-14 accent-emerald-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Explanation Result */}
                <AnimatePresence>
                  {explanation && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-theme-card rounded-[3.5rem] p-12 border-2 border-emerald-500/30 shadow-2xl">
                      {/* ... Markdown explanation same as above ... */}
                      <div className="prose prose-xl prose-invert max-w-none text-theme-muted markdown-content">
                        <Markdown>{explanation}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {viewMode === 'vault' && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 max-w-5xl mx-auto"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-theme-text tracking-tight uppercase">Study Vault</h3>
                    <p className="text-theme-muted font-medium border-l-2 border-rose-500 pl-3">Your personal library of captured wisdom.</p>
                  </div>
                  <div className="bg-theme-bg px-6 py-3 rounded-2xl border border-theme-border font-bold text-xs text-theme-muted tracking-widest uppercase">
                    {history.length} Saved Records
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-32 bg-theme-bg rounded-[3rem] border-2 border-dashed border-theme-border/50">
                    <div className="w-24 h-24 bg-theme-card rounded-full flex items-center justify-center mx-auto mb-6 text-theme-muted/30">
                      <History size={48} />
                    </div>
                    <h4 className="text-xl font-bold text-theme-text mb-2">The Vault is Empty</h4>
                    <p className="text-theme-muted max-w-sm mx-auto">Start a recording session or upload materials to populate your personal study archive.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {history.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-theme-bg border border-theme-border rounded-[2.5rem] p-8 hover:border-rose-500/50 transition-all hover:shadow-2xl hover:shadow-rose-500/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 flex flex-col gap-2 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all">
                          <button 
                            onClick={() => deleteFromHistory(item.id)}
                            className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-rose-500 mb-4">
                          {item.type === 'recording' ? (
                            <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                              <Mic size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Recording</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-500">
                              <Sparkles size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Full Deep-Dive</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-xl font-black text-theme-text mb-2 line-clamp-1 group-hover:text-rose-500 transition-colors uppercase tracking-tight">{item.title}</h4>
                        <div className="flex items-center gap-3 text-theme-muted text-xs font-bold mb-8">
                          <Calendar size={14} />
                          {new Date(item.timestamp).toLocaleDateString()}
                          <span className="opacity-20">•</span>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <button 
                            onClick={() => loadSavedItem(item)}
                            className="flex items-center justify-center gap-2 py-4 bg-theme-card border border-theme-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-theme-text hover:bg-theme-bg transition-all"
                          >
                            <PlayCircle size={16} className="text-rose-500" /> Open Record
                          </button>
                          <button 
                            onClick={() => setViewingItem(item)}
                            className="flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                          >
                            <Maximize2 size={16} /> Focus View
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
      </motion.div>
    </div>
  );
}
