import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, XCircle, Clock, Eye, 
  Search, Filter, ShieldCheck, ArrowLeft,
  ExternalLink, Loader2, AlertCircle, Trash2, 
  UserX, UserCheck, Activity, Globe,
  Plus, Sparkles, Upload, FileText, Check,
  MessageSquare, Send, HelpCircle, FileSpreadsheet,
  BookOpen, Library, ChevronRight, Edit3, Settings, AlertTriangle,
  Code, Image, Lock, Shield, Key, Mail, Bot, Zap,
  Building2, Download, CreditCard, Camera
} from 'lucide-react';
import { HardcopyVisionManager } from './HardcopyVisionManager';
import { GoogleGenAI } from '@google/genai';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { 
  reauthenticateWithCredential, 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider 
} from 'firebase/auth';
import { 
  collection, query, where, orderBy, onSnapshot, 
  doc, updateDoc, serverTimestamp, deleteDoc, 
  getDocs, writeBatch, setDoc, addDoc
} from 'firebase/firestore';
import { PaymentRequest, Subject, ExamType, Question } from '../types';
import { cn } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';
import { 
  extractQuestionsWithAI, 
  chatWithAIQuestionsAgent, 
  getSystemSettings, 
  DEFAULT_SETTINGS, 
  SystemSettings,
  ApiKeyItem
} from '../services/aiQuestions';
import mammoth from 'mammoth';
import { AIAvatar, GoldSpinner } from './AIAvatar';
import { BookReaderModal } from './BookReaderModal';
import { saveBookBlob, deleteBookBlob, saveBookFileToCloud, extractBookContentFromFile, compressCoverImage, ExtractedBookData, onDeletedBooksSnapshot, markBookAsDeleted, unmarkBookAsDeleted } from '../library';
import { ALL_BUILTIN_BOOKS } from '../library';

interface AdminConsoleProps {
  user: any;
  profile?: any;
  onBack: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ user, profile, onBack }) => {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Auto-authorize if user is explicitly the master admin or has admin role in profile
    const emailClean = user?.email?.toLowerCase().trim();
    if (emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profile?.role === 'admin') {
      setAuthorized(true);
    }
  }, [user, profile]);
  const [adminPassword, setAdminPassword] = useState('');
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [tab, setTab] = useState<'hub' | 'payments' | 'users' | 'questions' | 'alerts' | 'tokens' | 'user_overrides' | 'api_keys' | 'security' | 'library'>('hub');

  // Institutional CBT & Dispatcher Hub State
  const [instRequests, setInstRequests] = useState<any[]>([]);
  const [instRooms, setInstRooms] = useState<any[]>([]);
  const [instSubmissions, setInstSubmissions] = useState<any[]>([]);
  const [selectedInstRequest, setSelectedInstRequest] = useState<any | null>(null);
  const [selectedInstRoomId, setSelectedInstRoomId] = useState<string | null>(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [assignRoomIdInput, setAssignRoomIdInput] = useState('');
  const [instFilter, setInstFilter] = useState<'all' | 'pending' | 'in_conversation' | 'approved' | 'completed'>('all');
  const [isProcessingInst, setIsProcessingInst] = useState(false);

  // Library Management State
  const [adminLibraryBooks, setAdminLibraryBooks] = useState<any[]>([]);
  const [librarySectionTab, setLibrarySectionTab] = useState<'national' | 'universal' | 'general'>('national');
  const [adminLibrarySearch, setAdminLibrarySearch] = useState<string>('');
  const [uploadBookSection, setUploadBookSection] = useState<'national' | 'universal' | 'general'>('national');
  const [uploadBookTitle, setUploadBookTitle] = useState('');
  const [uploadBookAuthor, setUploadBookAuthor] = useState('');
  const [uploadBookSubject, setUploadBookSubject] = useState('Physics');
  const [uploadBookExamTarget, setUploadBookExamTarget] = useState('JAMB / WAEC');
  const [uploadBookDescription, setUploadBookDescription] = useState('');
  const [uploadBookCoverImage, setUploadBookCoverImage] = useState<string>('');
  const [previewSearchQuery, setPreviewSearchQuery] = useState<string>('');
  const [uploadBookFormat, setUploadBookFormat] = useState<'file' | 'electronic' | 'both'>('file');
  const [uploadBookChapters, setUploadBookChapters] = useState('');
  const [uploadFileObject, setUploadFileObject] = useState<File | null>(null);
  const [uploadFileDataUrl, setUploadFileDataUrl] = useState<string | null>(null);
  const [uploadExtractedData, setUploadExtractedData] = useState<ExtractedBookData | null>(null);
  const [extractingFile, setExtractingFile] = useState(false);
  const [uploadingBook, setUploadingBook] = useState(false);

  // Library Book Editing Modal States
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editFileObject, setEditFileObject] = useState<File | null>(null);
  const [savingEditBook, setSavingEditBook] = useState(false);

  // Admin security states
  const [securityOldEmail, setSecurityOldEmail] = useState('');
  const [securityOldPassword, setSecurityOldPassword] = useState('');
  const [securityNewEmail, setSecurityNewEmail] = useState('');
  const [securityNewPassword, setSecurityNewPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [backupEmailInput, setBackupEmailInput] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  // System Settings & Token Controls State
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Questions Management State
  const [adminQuestionsList, setAdminQuestionsList] = useState<any[]>([]);
  const [questionsTab, setQuestionsTab] = useState<'list' | 'add' | 'json'>('list');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all');
  const [qSearchQuery, setQSearchQuery] = useState('');

  // AI Model & API Key Management State
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [newKeyLabelInput, setNewKeyLabelInput] = useState('');
  const [newKeyTargetInput, setNewKeyTargetInput] = useState<'ibom_ai' | 'admin_ai' | 'all'>('all');
  const [newKeyModelInput, setNewKeyModelInput] = useState('gemini-2.0-flash');
  const [testingApiKey, setTestingApiKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ keyId: string; success: boolean; message: string; latency?: number } | null>(null);

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKeyInput.trim()) {
      alert("Please paste a valid Gemini API key!");
      return;
    }
    const cleanKey = newApiKeyInput.trim();
    const label = newKeyLabelInput.trim() || `API Key (${newKeyTargetInput.toUpperCase()})`;
    const keyId = `key_${Date.now()}`;
    const newItem: ApiKeyItem = {
      id: keyId,
      key: cleanKey,
      label,
      target: newKeyTargetInput,
      active: true,
      model: newKeyModelInput,
      createdAt: new Date().toISOString()
    };

    const currentList = systemSettings?.apiKeysList || [];
    const updatedList = currentList.map(k => {
      if (newKeyTargetInput === 'all' || k.target === newKeyTargetInput || k.target === 'all') {
        return { ...k, active: false };
      }
      return k;
    }).concat(newItem);

    const updates: Partial<SystemSettings> = {
      apiKeysList: updatedList,
      ...(newKeyTargetInput === 'ibom_ai' || newKeyTargetInput === 'all' ? { ibomAiApiKey: cleanKey, ibomAiModel: newKeyModelInput } : {}),
      ...(newKeyTargetInput === 'admin_ai' || newKeyTargetInput === 'all' ? { adminAiApiKey: cleanKey, adminAiModel: newKeyModelInput } : {})
    };

    await handleSaveSystemSettings(updates);

    if (typeof localStorage !== 'undefined') {
      if (newKeyTargetInput === 'ibom_ai' || newKeyTargetInput === 'all') {
        localStorage.setItem('sib_ibom_ai_api_key', cleanKey);
        localStorage.setItem('sib_ibom_ai_model', newKeyModelInput);
      }
      if (newKeyTargetInput === 'admin_ai' || newKeyTargetInput === 'all') {
        localStorage.setItem('sib_admin_ai_api_key', cleanKey);
        localStorage.setItem('sib_admin_ai_model', newKeyModelInput);
      }
      localStorage.setItem('sib_active_gemini_key', cleanKey);
    }

    setNewApiKeyInput('');
    setNewKeyLabelInput('');
    alert(`API Key "${label}" saved and added to Vault!`);
  };

  const handleSwitchApiKeyForTarget = async (target: 'ibom_ai' | 'admin_ai' | 'all', keyId: string) => {
    if (!systemSettings) return;
    const currentList = systemSettings.apiKeysList || [];

    if (keyId === 'default') {
      const updatedList = currentList.map(k => {
        if (target === 'all' || k.target === target || k.target === 'all') {
          return { ...k, active: false };
        }
        return k;
      });

      const updates: Partial<SystemSettings> = {
        apiKeysList: updatedList,
        ...(target === 'ibom_ai' || target === 'all' ? { ibomAiApiKey: '' } : {}),
        ...(target === 'admin_ai' || target === 'all' ? { adminAiApiKey: '' } : {})
      };

      await handleSaveSystemSettings(updates);

      if (typeof localStorage !== 'undefined') {
        if (target === 'ibom_ai' || target === 'all') localStorage.removeItem('sib_ibom_ai_api_key');
        if (target === 'admin_ai' || target === 'all') localStorage.removeItem('sib_admin_ai_api_key');
      }
      return;
    }

    const selectedItem = currentList.find(k => k.id === keyId);
    if (!selectedItem) return;

    const keyString = selectedItem.key;
    const keyModel = selectedItem.model || 'gemini-2.0-flash';

    const updatedList = currentList.map(k => {
      if (k.id === keyId) {
        return { ...k, active: true };
      }
      if (target === 'all' || k.target === target || k.target === 'all' || selectedItem.target === 'all') {
        return { ...k, active: false };
      }
      return k;
    });

    const updates: Partial<SystemSettings> = {
      apiKeysList: updatedList,
      ...(target === 'ibom_ai' || target === 'all' ? { ibomAiApiKey: keyString, ibomAiModel: keyModel } : {}),
      ...(target === 'admin_ai' || target === 'all' ? { adminAiApiKey: keyString, adminAiModel: keyModel } : {})
    };

    await handleSaveSystemSettings(updates);

    if (typeof localStorage !== 'undefined') {
      if (target === 'ibom_ai' || target === 'all') {
        localStorage.setItem('sib_ibom_ai_api_key', keyString);
        localStorage.setItem('sib_ibom_ai_model', keyModel);
      }
      if (target === 'admin_ai' || target === 'all') {
        localStorage.setItem('sib_admin_ai_api_key', keyString);
        localStorage.setItem('sib_admin_ai_model', keyModel);
      }
      localStorage.setItem('sib_active_gemini_key', keyString);
    }
  };

  const handleTestApiKey = async (keyId: string, apiKeyString: string, modelName: string) => {
    setTestingApiKey(keyId);
    setTestResult(null);
    const startTime = Date.now();
    try {
      const ai = new GoogleGenAI({ apiKey: apiKeyString });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-2.0-flash',
        contents: [{ text: "Respond with the word 'OK' if active." }]
      });
      const latency = Date.now() - startTime;
      if (response?.text) {
        setTestResult({
          keyId,
          success: true,
          message: `Connection Validated Successfully! Model (${modelName || 'gemini-2.0-flash'}) responded in ${latency}ms. Output: "${response.text.trim().slice(0, 30)}"`,
          latency
        });
      } else {
        setTestResult({ keyId, success: false, message: "API call returned empty output." });
      }
    } catch (err: any) {
      setTestResult({
        keyId,
        success: false,
        message: `API Call Failed: ${err?.message || String(err)}`
      });
    } finally {
      setTestingApiKey(null);
    }
  };

  const handleToggleKeyActive = async (keyId: string) => {
    if (!systemSettings) return;
    const currentList = systemSettings.apiKeysList || [];
    const targetItem = currentList.find(k => k.id === keyId);
    if (!targetItem) return;

    const newActiveState = !targetItem.active;
    const updatedList = currentList.map(k => {
      if (k.id === keyId) {
        return { ...k, active: newActiveState };
      }
      if (newActiveState && (k.target === targetItem.target || k.target === 'all' || targetItem.target === 'all')) {
        return { ...k, active: false };
      }
      return k;
    });

    const activeIbomKey = updatedList.find(k => k.active && (k.target === 'ibom_ai' || k.target === 'all'))?.key || '';
    const activeAdminKey = updatedList.find(k => k.active && (k.target === 'admin_ai' || k.target === 'all'))?.key || '';

    const updates: Partial<SystemSettings> = {
      apiKeysList: updatedList,
      ibomAiApiKey: activeIbomKey,
      adminAiApiKey: activeAdminKey
    };

    await handleSaveSystemSettings(updates);

    if (typeof localStorage !== 'undefined') {
      if (activeIbomKey) localStorage.setItem('sib_ibom_ai_api_key', activeIbomKey);
      if (activeAdminKey) localStorage.setItem('sib_admin_ai_api_key', activeAdminKey);
      localStorage.setItem('sib_active_gemini_key', activeIbomKey || activeAdminKey);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!window.confirm("Are you sure you want to delete this API Key configuration?")) return;
    if (!systemSettings) return;
    const updatedList = (systemSettings.apiKeysList || []).filter(k => k.id !== keyId);
    await handleSaveSystemSettings({ apiKeysList: updatedList });
  };

  // CRUD Edit / Create Question Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);
  const [adminPreviewBook, setAdminPreviewBook] = useState<any | null>(null);

  // Sync deleted books in real time
  useEffect(() => {
    const unsub = onDeletedBooksSnapshot((ids) => {
      setDeletedBookIds(ids);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore sync for Library Books uploaded by Admins
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'library_books'));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: any[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          setAdminLibraryBooks(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'library_books');
        }
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'library_books');
    }
  }, [db]);

  const handleUploadLibraryBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert("Database is not connected. Please check your connection.");
      return;
    }
    if (!uploadBookTitle.trim() || !uploadBookAuthor.trim()) {
      alert("Please provide the Standard Title and Author Name for the book.");
      return;
    }

    setUploadingBook(true);
    try {
      let fileName = uploadFileObject?.name || `${uploadBookTitle.trim().replace(/[^a-z0-9]/gi, '_')}.txt`;
      let fileSize = uploadFileObject ? `${(uploadFileObject.size / (1024 * 1024)).toFixed(2)} MB` : '0.8 MB';
      let fileType = uploadFileObject ? (uploadFileObject.name.split('.').pop()?.toLowerCase() || 'pdf') : (uploadBookFormat === 'file' ? 'pdf' : 'text');
      let storageKey = '';

      const newBookId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (uploadFileObject) {
        storageKey = `book_file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        // Save file asynchronously to IndexedDB + Firestore chunks
        saveBookFileToCloud(storageKey, uploadFileObject, {
          fileName,
          fileType,
          fileSize,
          bookId: newBookId
        }).catch(err => {
          console.warn("Storage sync notice:", err);
        });
      }

      // Safe lightweight cover image
      let finalCoverImage = '';
      if (uploadBookCoverImage.trim()) {
        finalCoverImage = await compressCoverImage(uploadBookCoverImage.trim());
      }

      // Fallback lightweight fileUrl
      const fileUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(
        `Title: ${uploadBookTitle.trim()}\nAuthor: ${uploadBookAuthor.trim()}\nSubject: ${uploadBookSubject.trim() || 'General'}\n\n${uploadBookDescription.trim() || 'Digital Reading Material'}`
      )}`;

      const keywords = Array.from(new Set([
        ...uploadBookTitle.toLowerCase().split(/\s+/),
        ...uploadBookAuthor.toLowerCase().split(/\s+/),
        uploadBookSubject.toLowerCase(),
        uploadBookExamTarget.toLowerCase(),
        uploadBookSection.toLowerCase()
      ])).filter(Boolean);

      // Determine chapters list: cap content size to prevent Firestore 1MB limits
      let chaptersList: any[] = [];
      if (uploadBookChapters.trim()) {
        chaptersList = [
          {
            id: `ch_${Date.now()}`,
            title: `${uploadBookTitle.trim()} - Main Text`,
            content: uploadBookChapters.trim().slice(0, 50000)
          }
        ];
      } else if (uploadExtractedData && uploadExtractedData.chapters.length > 0) {
        chaptersList = uploadExtractedData.chapters.slice(0, 25).map((ch, idx) => ({
          id: ch.id || `ch_${idx + 1}`,
          title: ch.title || `Chapter ${idx + 1}`,
          content: (ch.content || '').slice(0, 4000)
        }));
      } else {
        chaptersList = [
          {
            id: 'ch1',
            title: `${uploadBookTitle.trim()} - Study Notes & Syllabus Guide`,
            content: uploadBookDescription.trim() || `${uploadBookTitle.trim()} complete digital reading material for ${uploadBookSubject.trim() || 'General Studies'}.`
          }
        ];
      }

      const bookDoc: any = {
        id: newBookId,
        title: uploadBookTitle.trim(),
        author: uploadBookAuthor.trim(),
        section: uploadBookSection || 'general',
        subject: uploadBookSubject.trim() || 'General',
        description: uploadBookDescription.trim() || `${uploadBookTitle.trim()} textbook for ${uploadBookSubject.trim() || 'General Studies'}.`,
        keywords,
        format: uploadBookFormat || 'both',
        coverImage: finalCoverImage,
        examTarget: uploadBookExamTarget.trim() || 'General Education',
        fileName,
        fileSize,
        fileType,
        pageCount: uploadExtractedData?.pageCount || chaptersList.length || 1,
        fileUrl,
        chapters: chaptersList,
        amazonUrl: `https://www.amazon.com/s?k=${encodeURIComponent(uploadBookTitle.trim())}`,
        createdAt: new Date().toISOString(),
        uploadedBy: user?.email || 'Admin'
      };

      if (storageKey) {
        bookDoc.storageKey = storageKey;
      }

      // Unmark from deleted books if ever present
      await unmarkBookAsDeleted(newBookId);

      // Save to Firestore with timeout guard
      const bookRef = doc(db, 'library_books', newBookId);
      try {
        await Promise.race([
          setDoc(bookRef, bookDoc),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout saving book document')), 10000))
        ]);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.CREATE, `library_books/${newBookId}`);
        throw fsErr;
      }

      // Instantly update local state for real-time reactivity
      setAdminLibraryBooks(prev => [bookDoc, ...prev.filter(b => b.id !== newBookId)]);
      setDeletedBookIds(prev => prev.filter(id => id !== newBookId));

      alert(`Successfully published "${uploadBookTitle}" (${fileSize}) to the ${uploadBookSection.toUpperCase()} Library!`);

      // Reset Form
      setUploadBookTitle('');
      setUploadBookAuthor('');
      setUploadBookDescription('');
      setUploadBookChapters('');
      setUploadBookCoverImage('');
      setUploadFileObject(null);
      setUploadFileDataUrl(null);
      setUploadExtractedData(null);
    } catch (err: any) {
      console.error("Error uploading library book:", err);
      alert("Failed to upload book: " + (err?.message || String(err)));
    } finally {
      setUploadingBook(false);
    }
  };

  const handleOpenEditBook = (book: any) => {
    setEditingBook({
      ...book,
      chaptersText: book.chapters?.map((c: any) => c.content || '').join('\n\n') || book.description || ''
    });
    setEditFileObject(null);
    setIsEditBookModalOpen(true);
  };

  const handleSaveEditedBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingBook) return;
    if (!editingBook.title?.trim() || !editingBook.author?.trim()) {
      alert("Please provide Title and Author.");
      return;
    }

    setSavingEditBook(true);
    try {
      let storageKey = editingBook.storageKey || `book_file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let fileName = editingBook.fileName || `${editingBook.title.trim().replace(/[^a-z0-9]/gi, '_')}.txt`;
      let fileSize = editingBook.fileSize || '0.8 MB';
      let fileType = editingBook.fileType || 'text';
      let chaptersList = editingBook.chapters || [];

      if (editFileObject) {
        storageKey = `book_file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        fileName = editFileObject.name;
        fileSize = `${(editFileObject.size / (1024 * 1024)).toFixed(2)} MB`;
        fileType = editFileObject.name.split('.').pop()?.toLowerCase() || 'pdf';

        saveBookFileToCloud(storageKey, editFileObject, {
          fileName,
          fileType,
          fileSize,
          bookId: editingBook.id
        }).catch(err => {
          console.warn("Storage sync notice:", err);
        });
      }

      const keywords = Array.from(new Set([
        ...editingBook.title.toLowerCase().split(/\s+/),
        ...editingBook.author.toLowerCase().split(/\s+/),
        (editingBook.subject || '').toLowerCase(),
        (editingBook.examTarget || '').toLowerCase(),
        (editingBook.section || '').toLowerCase()
      ])).filter(Boolean);

      if (editingBook.chaptersText?.trim()) {
        chaptersList = [
          {
            id: `ch_${Date.now()}`,
            title: `${editingBook.title.trim()} - Main Text`,
            content: editingBook.chaptersText.trim().slice(0, 50000)
          }
        ];
      } else if (!chaptersList || chaptersList.length === 0) {
        chaptersList = [
          {
            id: 'ch1',
            title: `${editingBook.title.trim()} - Course Notes`,
            content: editingBook.description?.trim() || `${editingBook.title.trim()} reading material.`
          }
        ];
      } else {
        chaptersList = chaptersList.slice(0, 25).map((ch: any, idx: number) => ({
          id: ch.id || `ch_${idx + 1}`,
          title: ch.title || `Chapter ${idx + 1}`,
          content: (ch.content || '').slice(0, 4000)
        }));
      }

      let finalCoverImage = '';
      if (editingBook.coverImage?.trim()) {
        finalCoverImage = await compressCoverImage(editingBook.coverImage.trim());
      }

      const updatedBook: any = {
        id: editingBook.id,
        title: editingBook.title.trim(),
        author: editingBook.author.trim(),
        section: editingBook.section || 'general',
        subject: editingBook.subject?.trim() || 'General',
        description: editingBook.description?.trim() || '',
        keywords,
        format: editingBook.format || 'both',
        coverImage: finalCoverImage,
        examTarget: editingBook.examTarget?.trim() || 'General Education',
        fileName,
        fileSize,
        fileType,
        chapters: chaptersList,
        amazonUrl: editingBook.amazonUrl || `https://www.amazon.com/s?k=${encodeURIComponent(editingBook.title.trim())}`,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'Admin'
      };

      if (storageKey) {
        updatedBook.storageKey = storageKey;
      }

      updatedBook.fileUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(editingBook.description || editingBook.title)}`;

      // Unmark from deleted list if present
      await unmarkBookAsDeleted(editingBook.id);

      const bookRef = doc(db, 'library_books', editingBook.id);
      try {
        await Promise.race([
          setDoc(bookRef, updatedBook, { merge: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout updating book document')), 10000))
        ]);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.UPDATE, `library_books/${editingBook.id}`);
        throw fsErr;
      }

      // Instantly update local state
      setAdminLibraryBooks(prev => {
        const exists = prev.some(b => b.id === editingBook.id);
        if (exists) {
          return prev.map(b => b.id === editingBook.id ? { ...b, ...updatedBook } : b);
        }
        return [updatedBook, ...prev];
      });
      setDeletedBookIds(prev => prev.filter(id => id !== editingBook.id));

      alert(`Successfully saved updates for "${editingBook.title}"!`);
      setIsEditBookModalOpen(false);
      setEditingBook(null);
      setEditFileObject(null);
    } catch (err: any) {
      console.error("Error updating book:", err);
      alert("Failed to save changes: " + (err?.message || String(err)));
    } finally {
      setSavingEditBook(false);
    }
  };

  const handleDeleteLibraryBook = async (bookId: string, bookTitle: string, storageKey?: string) => {
    if (!window.confirm(`Are you sure you want to remove "${bookTitle}" from the library?`)) return;
    try {
      // 1. Immediately update UI state so it disappears instantly
      setDeletedBookIds(prev => Array.from(new Set([...prev, bookId])));
      setAdminLibraryBooks(prev => prev.filter(b => b.id !== bookId));

      // 2. Persist deletion in cloud & local storage
      await markBookAsDeleted(bookId);

      // 3. Delete from Firestore library_books collection
      if (db) {
        try {
          await deleteDoc(doc(db, 'library_books', bookId));
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.DELETE, `library_books/${bookId}`);
        }
      }

      // 4. Delete blob from IndexedDB & Firestore chunks
      await deleteBookBlob(storageKey || bookId, [bookId, storageKey || '']);
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Error deleting book from library.");
    }
  };

  // Question Database Codes (JSON) States
  const [jsonContent, setJsonContent] = useState<string>('[]');
  const [jsonCbtType, setJsonCbtType] = useState<string>('JAMB');
  const [jsonSubject, setJsonSubject] = useState<string>('English');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Image Preview State
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // AI Question Parsing State
  const [selectedSubject, setSelectedSubject] = useState<string>('English');
  const [selectedExamType, setSelectedExamType] = useState<string>('JAMB');
  const [inputType, setInputType] = useState<'manual' | 'image' | 'file'>('manual');
  
  // Manual Input State
  const [manualQuestion, setManualQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    topic: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    year: new Date().getFullYear(),
    passage: ''
  });

  // Upload Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [parsingPrompt, setParsingPrompt] = useState('');
  const [rawTextContent, setRawTextContent] = useState('');

  // Review / Extracted Questions
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [savingQuestions, setSavingQuestions] = useState(false);

  // Agentic AI Chat State
  const [chats, setChats] = useState<{ sender: 'user' | 'ai'; text: string; timestamp: Date }[]>([
    {
      sender: 'ai',
      text: "Hello Admin! I'm your Exam Organizer AI Assistant. Select a Subject & Exam Type, then upload an image or document, or write unformatted questions, and I will extract, align, and organize them perfectly to fit our system's format!",
      timestamp: new Date()
    }
  ]);
  const [aiMessageText, setAiMessageText] = useState('');
  const [isChattingWithAI, setIsChattingWithAI] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isChattingWithAI]);

  // Load Admin/Added Questions from Firestore inside Admin Console as well
  useEffect(() => {
    if (!authorized || !db) return;
    const questionsRef = collection(db, 'sib_questions');
    const unsubscribe = onSnapshot(questionsRef, (snapshot) => {
      setAdminQuestionsList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, [authorized]);

  // Load System Settings from Firestore or default
  useEffect(() => {
    if (!authorized || !db) return;
    
    // Set up a real-time snapshot listener on the settings document so it's always up-to-date
    const settingsDocRef = doc(db, 'sib_settings', 'global');
    const unsubscribe = onSnapshot(settingsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemSettings;
        setSystemSettings(data);
        setCustomBudgetInput(String(data.totalTokensBudget));
      } else {
        // Document doesn't exist, create it with default settings
        setDoc(settingsDocRef, DEFAULT_SETTINGS).then(() => {
          setSystemSettings(DEFAULT_SETTINGS);
          setCustomBudgetInput(String(DEFAULT_SETTINGS.totalTokensBudget));
        });
      }
    });
    return () => unsubscribe();
  }, [authorized]);

  const handleSaveSystemSettings = async (updatedFields: Partial<SystemSettings>) => {
    if (!db || !systemSettings) return;
    setSavingSettings(true);
    try {
      const settingsDocRef = doc(db, 'sib_settings', 'global');
      await updateDoc(settingsDocRef, updatedFields);
    } catch (err) {
      console.error("Failed to update system settings in Firestore:", err);
      alert("Failed to update system settings: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetJsEngine = () => {
    if (!window.confirm("Are you sure you want to reset the custom Local JS Engine fallback code to the default factory template?")) return;
    handleSaveSystemSettings({ localJsEngineCode: DEFAULT_SETTINGS.localJsEngineCode });
  };

  const handleResetTokenUsage = () => {
    if (!window.confirm("Are you sure you want to reset the accumulated token consumption counter back to 0? This represents starting a new billing period.")) return;
    handleSaveSystemSettings({ totalTokensUsed: 0 });
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = Number(customBudgetInput);
    if (isNaN(newBudget) || newBudget < 0) {
      alert("Please enter a valid non-negative number for the token budget limit.");
      return;
    }
    handleSaveSystemSettings({ totalTokensBudget: newBudget });
    alert("Token quota budget updated successfully!");
  };

  const handleUpdateUserAiOverride = async (userId: string, mode: 'default' | 'tokens' | 'without_tokens') => {
    if (!db) return;
    try {
      const userRef = doc(db, 'sib_profiles', userId);
      await updateDoc(userRef, {
        forcedAiMode: mode,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update user AI override in Firestore:", err);
      alert("Failed to update override: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateUserPremiumStatus = async (userId: string, isPremium: boolean) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'sib_profiles', userId);
      await updateDoc(userRef, {
        isPremium: isPremium,
        subscriptionStatus: isPremium ? 'paid' : 'free',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to update user premium status in Firestore:", err);
      alert("Failed to update status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("No active session detected. Please sign in again.");
      return;
    }
    if (!securityOldEmail.trim() || !securityOldPassword.trim()) {
      alert("You must enter your current email and password for secure re-authentication.");
      return;
    }
    if (!securityNewEmail.trim() && !securityNewPassword.trim()) {
      alert("Please enter a new email and/or a new password to make changes.");
      return;
    }

    setSecurityLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        securityOldEmail.trim().toLowerCase(),
        securityOldPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      if (securityNewEmail.trim()) {
        const emailToSet = securityNewEmail.trim().toLowerCase();
        await updateEmail(auth.currentUser, emailToSet);
        
        if (db) {
          const profileRef = doc(db, 'sib_profiles', auth.currentUser.uid);
          await updateDoc(profileRef, {
            email: emailToSet,
            updatedAt: serverTimestamp()
          });
        }
      }

      if (securityNewPassword.trim()) {
        await updatePassword(auth.currentUser, securityNewPassword);
      }

      alert("Admin credentials updated successfully!");
      setSecurityOldEmail('');
      setSecurityOldPassword('');
      setSecurityNewEmail('');
      setSecurityNewPassword('');
    } catch (err: any) {
      console.error("Credentials update failed:", err);
      let errorMsg = err?.message || String(err);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errorMsg = "Invalid current credentials. Please check your old email and password.";
      }
      alert("Failed to update credentials:\n" + errorMsg);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleAddBackupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    const emailToFind = backupEmailInput.trim().toLowerCase();
    if (!emailToFind) {
      alert("Please enter a user email to add as backup admin.");
      return;
    }

    setBackupLoading(true);
    try {
      const match = profiles.find(p => p.email?.toLowerCase().trim() === emailToFind);
      if (!match) {
        alert(`No user profile found with email: ${emailToFind}. The backup admin must register an account first.`);
        setBackupLoading(false);
        return;
      }

      if (match.role === 'admin') {
        alert("This user is already configured as an administrator.");
        setBackupLoading(false);
        return;
      }

      const profileRef = doc(db, 'sib_profiles', match.id);
      await updateDoc(profileRef, {
        role: 'admin',
        updatedAt: serverTimestamp()
      });

      alert(`Successfully designated ${match.fullName || match.email} as a Backup Administrator.`);
      setBackupEmailInput('');
    } catch (err) {
      console.error("Failed to add backup admin:", err);
      alert("Error adding backup admin: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDemoteAdmin = async (adminId: string, adminEmail: string) => {
    if (!db) return;
    if (adminId === auth.currentUser?.uid || adminEmail?.toLowerCase() === 'eemmpatech@gmail.com') {
      alert("To ensure continuous system safety, you cannot demote yourself or the master system owner.");
      return;
    }

    if (!window.confirm(`Are you sure you want to demote this administrator (${adminEmail})? They will lose access to the Admin Console.`)) return;

    try {
      const profileRef = doc(db, 'sib_profiles', adminId);
      await updateDoc(profileRef, {
        role: 'user',
        updatedAt: serverTimestamp()
      });
      alert(`Successfully demoted administrator: ${adminEmail}`);
    } catch (err) {
      console.error("Demote failed:", err);
      alert("Failed to demote admin: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this custom question?")) return;
    try {
      await deleteDoc(doc(db, 'sib_questions', id));
      alert("Question deleted successfully!");
    } catch (err) {
      console.error("Failed to delete question:", err);
      alert("Failed to delete question.");
    }
  };

  // CRUD Question Editor Helper Functions
  const handleOpenCreateModal = () => {
    setEditingQuestion({
      id: '', // Empty means new question
      subject: selectedSubject || 'English',
      examType: selectedExamType || 'JAMB',
      set: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      topic: 'General',
      difficulty: 'Medium',
      year: new Date().getFullYear(),
      passage: ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion({
      id: q.id,
      subject: q.subject || 'English',
      examType: q.examType || 'JAMB',
      set: q.set || 1,
      question: q.question || '',
      options: q.options ? [...q.options] : ['', '', '', ''],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
      topic: q.topic || 'General',
      difficulty: q.difficulty || 'Medium',
      year: q.year || new Date().getFullYear(),
      passage: q.passage || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveQuestionFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingQuestion) return;
    if (!editingQuestion.question.trim() || editingQuestion.options.some((o: string) => !o.trim())) {
      alert("Please fill in the question and all 4 options.");
      return;
    }

    setSavingQuestions(true);
    try {
      const qData = {
        subject: editingQuestion.subject,
        examType: editingQuestion.examType,
        set: Number(editingQuestion.set) || 1,
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        topic: editingQuestion.topic || 'General',
        difficulty: editingQuestion.difficulty,
        year: Number(editingQuestion.year) || new Date().getFullYear(),
        passage: editingQuestion.passage || null,
        updatedAt: serverTimestamp()
      };

      if (editingQuestion.id) {
        // Update existing question document
        await updateDoc(doc(db, 'sib_questions', editingQuestion.id), qData);
        alert("Question updated successfully!");
      } else {
        // Create new question document
        const qRef = doc(collection(db, 'sib_questions'));
        await setDoc(qRef, {
          ...qData,
          createdAt: serverTimestamp()
        });
        alert("New question created successfully!");
      }
      setIsEditModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Failed to save question to database: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingQuestions(false);
    }
  };

  // JSON Database Code Loader and Synchronizer Functions
  const normalizeQuestionItem = (item: any, defaultSubject: string, defaultExamType: string) => {
    if (!item || typeof item !== 'object') {
      throw new Error("Question item must be a valid object.");
    }

    // 1. Normalize Question Text
    let question = "";
    const questionKeys = ['question', 'q', 'text', 'questionText', 'question_text', 'desc', 'description', 'body', 'prompt'];
    for (const k of questionKeys) {
      if (typeof item[k] === 'string' && item[k].trim() !== '') {
        question = item[k].trim();
        break;
      } else if (item[k] !== undefined && item[k] !== null) {
        question = String(item[k]).trim();
        break;
      }
    }

    // 2. Normalize Options
    let options: string[] = [];
    const optionsKeys = ['options', 'choices', 'answers', 'opts', 'o'];
    for (const k of optionsKeys) {
      if (Array.isArray(item[k]) && item[k].length > 0) {
        options = item[k].map((o: any) => String(o).trim());
        break;
      }
    }

    // If options array wasn't found, try separate option fields like optionA, optionB, etc. or A, B, C, D
    if (options.length === 0) {
      const keys = Object.keys(item);
      const optMap: { [key: string]: string } = {};
      for (const key of keys) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'a' || lowerKey === 'optiona' || lowerKey === 'option_a') {
          optMap['A'] = String(item[key]).trim();
        } else if (lowerKey === 'b' || lowerKey === 'optionb' || lowerKey === 'option_b') {
          optMap['B'] = String(item[key]).trim();
        } else if (lowerKey === 'c' || lowerKey === 'optionc' || lowerKey === 'option_c') {
          optMap['C'] = String(item[key]).trim();
        } else if (lowerKey === 'd' || lowerKey === 'optiond' || lowerKey === 'option_d') {
          optMap['D'] = String(item[key]).trim();
        }
      }
      if (optMap['A'] || optMap['B'] || optMap['C'] || optMap['D']) {
        options = [
          optMap['A'] || "",
          optMap['B'] || "",
          optMap['C'] || "",
          optMap['D'] || ""
        ];
      }
    }

    // Fill in any missing options up to exactly 4 options to avoid strict crashes
    while (options.length < 4) {
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }
    if (options.length > 4) {
      options = options.slice(0, 4);
    }

    // 3. Normalize Correct Answer
    let correctAnswer = 0;
    let ansVal: any = null;
    const ansKeys = ['correctAnswer', 'correct_answer', 'answer', 'ans', 'correct', 'correctOpt', 'correctIndex', 'correct_index', 'solution_index'];
    for (const k of ansKeys) {
      if (item[k] !== undefined && item[k] !== null) {
        ansVal = item[k];
        break;
      }
    }

    if (ansVal !== null) {
      if (typeof ansVal === 'number') {
        correctAnswer = Math.floor(ansVal);
      } else if (typeof ansVal === 'string') {
        const trimmedAns = ansVal.trim().toUpperCase();
        if (trimmedAns === 'A' || trimmedAns === '0') correctAnswer = 0;
        else if (trimmedAns === 'B' || trimmedAns === '1') correctAnswer = 1;
        else if (trimmedAns === 'C' || trimmedAns === '2') correctAnswer = 2;
        else if (trimmedAns === 'D' || trimmedAns === '3') correctAnswer = 3;
        else {
          // Try to match option text exactly
          const optIdx = options.findIndex(o => o.toUpperCase() === trimmedAns);
          if (optIdx !== -1) {
            correctAnswer = optIdx;
          } else {
            const parsedInt = parseInt(trimmedAns, 10);
            if (!isNaN(parsedInt) && parsedInt >= 0 && parsedInt <= 3) {
              correctAnswer = parsedInt;
            } else {
              correctAnswer = 0;
            }
          }
        }
      }
    }
    // Clamp correctAnswer index
    if (correctAnswer < 0 || correctAnswer > 3) {
      correctAnswer = 0;
    }

    // 4. Normalize Explanation
    let explanation = "";
    const expKeys = ['explanation', 'explain', 'reason', 'exp', 'sol', 'solution', 'explanations'];
    for (const k of expKeys) {
      if (typeof item[k] === 'string' && item[k].trim() !== '') {
        explanation = item[k].trim();
        break;
      } else if (item[k] !== undefined && item[k] !== null) {
        explanation = String(item[k]).trim();
        break;
      }
    }

    // 5. Normalize Passage
    let passage: string | null = null;
    const passageKeys = ['passage', 'comprehension', 'textPassage', 'context'];
    for (const k of passageKeys) {
      if (typeof item[k] === 'string' && item[k].trim() !== '') {
        passage = item[k].trim();
        break;
      }
    }

    // 6. Metadata attributes
    const subject = String(item.subject || item.sub || defaultSubject).trim();
    const examType = String(item.examType || item.type || item.exam_type || item.cbtType || defaultExamType).trim();
    const set = Number(item.set || item.setNum || item.set_number) || 1;
    const year = Number(item.year || item.examYear || item.exam_year) || new Date().getFullYear();
    const difficulty = String(item.difficulty || item.diff || item.level || 'Medium').trim();
    const topic = String(item.topic || item.category || item.tag || 'General').trim();
    const id = item.id || null;

    return {
      id,
      question,
      options,
      correctAnswer,
      explanation,
      passage,
      subject,
      examType,
      set,
      year,
      difficulty,
      topic
    };
  };

  const parseJsOrJsonArray = (content: string): any[] => {
    const trimmed = content.trim();

    // 1. First attempt: Try evaluating the entire content directly
    try {
      const evaluator = new Function(`return (${trimmed});`);
      const result = evaluator();
      if (Array.isArray(result)) {
        return result;
      }
    } catch (e) {
      // Direct evaluation failed, proceed to extract array candidates
    }

    // Helper to find matching bracket while respecting strings and escape sequences
    const findBalancedBracket = (str: string, startIdx: number): number => {
      let depth = 0;
      let inString: string | null = null;
      let escaped = false;

      for (let i = startIdx; i < str.length; i++) {
        const char = str[i];

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          continue;
        }

        if (inString) {
          if (char === inString) {
            inString = null;
          }
          continue;
        }

        if (char === '"' || char === "'" || char === '`') {
          inString = char;
          continue;
        }

        if (char === '[') {
          depth++;
        } else if (char === ']') {
          depth--;
          if (depth === 0) {
            return i;
          }
        }
      }
      return -1;
    };

    // Helper to attempt to parse a candidate substring
    const tryParseSub = (sub: string): any[] | null => {
      try {
        const parsed = JSON.parse(sub);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Not standard JSON
      }

      try {
        const evaluator = new Function(`return (${sub});`);
        const result = evaluator();
        if (Array.isArray(result)) return result;
      } catch (e) {
        // Not standard JS expression
      }
      return null;
    };

    // 2. Second attempt: Search for array assignment starting after any '=' sign (handles type annotations like : Question[])
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const bracketIdx = trimmed.indexOf('[', eqIdx);
      if (bracketIdx !== -1) {
        const matchingIdx = findBalancedBracket(trimmed, bracketIdx);
        if (matchingIdx !== -1) {
          const sub = trimmed.substring(bracketIdx, matchingIdx + 1);
          const parsed = tryParseSub(sub);
          if (parsed) return parsed;
        }
      }
    }

    // 3. Third attempt: Look for any open bracket in the text and try to find a valid balanced array
    let searchStart = 0;
    let fallbackResult: any[] | null = null;

    while (true) {
      const bracketIdx = trimmed.indexOf('[', searchStart);
      if (bracketIdx === -1) break;

      const matchingIdx = findBalancedBracket(trimmed, bracketIdx);
      if (matchingIdx !== -1) {
        const sub = trimmed.substring(bracketIdx, matchingIdx + 1);
        const parsed = tryParseSub(sub);
        if (parsed) {
          if (parsed.length > 0) {
            return parsed; // Prioritize non-empty arrays
          }
          if (!fallbackResult) {
            fallbackResult = parsed;
          }
        }
      }
      searchStart = bracketIdx + 1;
    }

    if (fallbackResult) {
      return fallbackResult;
    }

    throw new Error("Syntax Error: Failed to extract a valid database questions array from the input. Make sure the code contains a valid JSON or JavaScript array structure like [...]");
  };

  const handleUploadJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Validate if it is parseable JSON or JS
        parseJsOrJsonArray(text);
        setJsonContent(text);
        setJsonError(null);
        alert("Database code file loaded successfully into the editor!");
      } catch (err: any) {
        setJsonError(err.message || "Invalid database code format. Make sure it contains a valid array of question objects.");
        alert("Failed to load file: Syntax Error.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveJsonCodes = async () => {
    if (!db) return;
    setJsonError(null);
    try {
      const parsed = parseJsOrJsonArray(jsonContent);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be a valid array of question objects.");
      }

      // Perform normalization and field-level verification
      const normalizedList = parsed.map((item, index) => {
        try {
          return normalizeQuestionItem(item, jsonSubject, jsonCbtType);
        } catch (err: any) {
          throw new Error(`Item at index ${index} could not be normalized: ${err?.message || err}`);
        }
      });

      for (let i = 0; i < normalizedList.length; i++) {
        const item = normalizedList[i];
        if (!item.question || item.question.trim() === '') {
          throw new Error(`Question at index ${i} is missing a valid non-empty "question" text field (or "q", "text", "body").`);
        }
        if (item.options.length !== 4) {
          throw new Error(`Question at index ${i} must contain an "options" list or fields mapping to exactly 4 choices.`);
        }
      }

      setSavingQuestions(true);
      const batch = writeBatch(db);

      for (const q of normalizedList) {
        const qData = {
          subject: q.subject,
          examType: q.examType,
          set: q.set,
          year: q.year,
          difficulty: q.difficulty,
          passage: q.passage,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          updatedAt: serverTimestamp()
        };

        // Reuse existing doc ID if present and valid, otherwise generate new
        let qRef;
        if (q.id && !q.id.startsWith('admin-ai-') && !q.id.startsWith('ai-')) {
          qRef = doc(db, 'sib_questions', q.id);
        } else {
          qRef = doc(collection(db, 'sib_questions'));
        }
        batch.set(qRef, qData, { merge: true });
      }

      await batch.commit();
      alert(`Successfully saved and merged ${normalizedList.length} questions into the CBT database!`);
    } catch (err) {
      console.error("JSON synchronizing failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setJsonError(msg);
      alert(`Error synchronizing question codes: ${msg}`);
    } finally {
      setSavingQuestions(false);
    }
  };

  // Keep JSON codes editor synchronized with selection or database changes
  useEffect(() => {
    if (questionsTab === 'json') {
      const filtered = adminQuestionsList.filter(
        q => q.examType === jsonCbtType && q.subject === jsonSubject
      );
      const cleanJson = filtered.map(q => ({
        id: q.id,
        subject: q.subject,
        examType: q.examType,
        set: q.set || 1,
        year: q.year || new Date().getFullYear(),
        difficulty: q.difficulty || "Medium",
        passage: q.passage || null,
        question: q.question,
        options: q.options || ["", "", "", ""],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || "",
        topic: q.topic || "General"
      }));
      setJsonContent(JSON.stringify(cleanJson, null, 2));
      setJsonError(null);
    }
  }, [jsonCbtType, jsonSubject, adminQuestionsList, questionsTab]);

  const handleSaveManualQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!manualQuestion.question.trim() || manualQuestion.options.some(o => !o.trim())) {
      alert("Please enter the question and all 4 options.");
      return;
    }
    
    setSavingQuestions(true);
    try {
      const newQuestion = {
        subject: selectedSubject,
        examType: selectedExamType,
        set: 1,
        question: manualQuestion.question,
        options: manualQuestion.options,
        correctAnswer: manualQuestion.correctAnswer,
        explanation: manualQuestion.explanation,
        topic: manualQuestion.topic || 'General',
        difficulty: manualQuestion.difficulty,
        year: manualQuestion.year,
        passage: manualQuestion.passage || null,
        createdAt: serverTimestamp()
      };
      
      const qRef = doc(collection(db, 'sib_questions'));
      await setDoc(qRef, newQuestion);
      
      alert("Question added successfully!");
      setManualQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        topic: '',
        difficulty: 'Medium',
        year: new Date().getFullYear(),
        passage: ''
      });
    } catch (err) {
      console.error("Error saving manual question:", err);
      alert("Failed to save question.");
    } finally {
      setSavingQuestions(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromDocx = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromTxt = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const handleAIExtract = async () => {
    if (!db) return;
    setIsProcessingFile(true);
    
    setChats(prev => [...prev, {
      sender: 'ai',
      text: `🔄 Working on extracting questions for ${selectedExamType} ${selectedSubject}... Please wait.`,
      timestamp: new Date()
    }]);

    try {
      let fileData: { base64?: string; mimeType?: string; rawText?: string } = {};

      if (inputType === 'image' || inputType === 'file') {
        if (!selectedFile) {
          throw new Error("Please select a file to upload first.");
        }
        
        const mime = selectedFile.type;
        if (mime.includes('image')) {
          const base64 = await convertFileToBase64(selectedFile);
          fileData = { base64, mimeType: mime };
        } else if (selectedFile.name.endsWith('.docx')) {
          const text = await extractTextFromDocx(selectedFile);
          fileData = { rawText: text };
        } else if (selectedFile.name.endsWith('.pdf')) {
          const base64 = await convertFileToBase64(selectedFile);
          fileData = { base64, mimeType: 'application/pdf' };
        } else {
          const text = await extractTextFromTxt(selectedFile);
          fileData = { rawText: text };
        }
      } else {
        if (!rawTextContent.trim()) {
          throw new Error("Please write or paste some unformatted text questions.");
        }
        fileData = { rawText: rawTextContent };
      }

      const extracted = await extractQuestionsWithAI(
        fileData,
        selectedSubject as any,
        selectedExamType as any,
        parsingPrompt
      );

      setExtractedQuestions(extracted);

      setChats(prev => [...prev, {
        sender: 'ai',
        text: `✨ Success! I have extracted and formatted ${extracted.length} questions for you! Review them on the right. You can edit them or chat with me to make any adjustments before saving!`,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error("AI extraction failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setChats(prev => [...prev, {
        sender: 'ai',
        text: `⚠️ Extraction failed: ${errMsg}. Please ensure your file is valid and try again.`,
        timestamp: new Date()
      }]);
      alert(`AI Extraction Error: ${errMsg}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSendMessageToAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessageText.trim()) return;
    
    const userMsg = aiMessageText;
    setAiMessageText('');
    
    setChats(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date() }]);
    setIsChattingWithAI(true);
    
    try {
      const result = await chatWithAIQuestionsAgent(
        userMsg,
        extractedQuestions,
        selectedSubject as any,
        selectedExamType as any
      );
      
      setChats(prev => [...prev, { sender: 'ai', text: result.text, timestamp: new Date() }]);
      if (result.updatedQuestions) {
        setExtractedQuestions(result.updatedQuestions);
      }
    } catch (err) {
      console.error("AI chat failed:", err);
      setChats(prev => [...prev, {
        sender: 'ai',
        text: "I'm sorry, I ran into an error while processing that request. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsChattingWithAI(false);
    }
  };

  const handleSaveExtractedQuestions = async () => {
    if (!db || extractedQuestions.length === 0) return;
    setSavingQuestions(true);
    try {
      const batch = writeBatch(db);
      
      extractedQuestions.forEach(q => {
        const qRef = doc(collection(db, 'sib_questions'));
        const { id, ...qData } = q;
        batch.set(qRef, {
          ...qData,
          createdAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      
      alert(`Successfully saved ${extractedQuestions.length} questions to the database!`);
      setExtractedQuestions([]);
      setRawTextContent('');
      setSelectedFile(null);
      setQuestionsTab('list');
    } catch (err) {
      console.error("Failed to save extracted questions:", err);
      alert("Failed to save questions to database.");
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'MUMDADboy@100%.Com') {
      setAuthorized(true);
    } else {
      alert("Unauthorized Access Attempt.");
    }
  };

  useEffect(() => {
    if (!authorized) return;
    
    // Fetch Profiles
    const profilesRef = collection(db, 'sib_profiles');
    const qProfiles = query(profilesRef, orderBy('createdAt', 'desc'));
    const unsubscribeProfiles = onSnapshot(qProfiles, (snapshot) => {
      setProfiles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // Fetch Payments
    const paymentsRef = collection(db, 'sib_payments');
    let qPayments = query(paymentsRef, orderBy('createdAt', 'desc'));
    if (filter !== 'all') {
      qPayments = query(paymentsRef, where('status', '==', filter), orderBy('createdAt', 'desc'));
    }
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PaymentRequest[]);
      setLoading(false);
    });

    // Fetch Alerts
    const alertsRef = collection(db, 'sib_alerts');
    const qAlerts = query(alertsRef, orderBy('timestamp', 'desc'));
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      setAlerts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // Fetch Institutional Requests, Rooms, and Submissions
    const unsubInstRequests = onSnapshot(collection(db, 'sib_inst_requests'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setInstRequests(list);
    });

    const unsubInstRooms = onSnapshot(collection(db, 'sib_inst_rooms'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setInstRooms(list);
    });

    const unsubInstSubmissions = onSnapshot(collection(db, 'sib_inst_submissions'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setInstSubmissions(list);
    });

    return () => {
      unsubscribeProfiles();
      unsubscribePayments();
      unsubscribeAlerts();
      unsubInstRequests();
      unsubInstRooms();
      unsubInstSubmissions();
    };
  }, [authorized, filter]);

  const handleVerify = async (payment: PaymentRequest, approve: boolean) => {
    if (!db) return;
    setProcessingId(payment.id);
    try {
      const paymentRef = doc(db, 'sib_payments', payment.id);
      const profileRef = doc(db, 'sib_profiles', payment.userId);

      await updateDoc(paymentRef, {
        status: approve ? 'verified' : 'rejected',
        verifiedAt: serverTimestamp()
      });

      if (approve) {
        await updateDoc(profileRef, {
          subscriptionStatus: 'paid',
          isPremium: true,
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(profileRef, {
          subscriptionStatus: 'free',
          isPremium: false,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to update status. Check permissions.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleDisable = async (targetUserId: string, currentlyDisabled: boolean) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'sib_profiles', targetUserId);
      await updateDoc(userRef, {
        isDisabled: !currentlyDisabled,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!window.confirm("Are you sure? This will delete the profile and all examination results permanently.")) return;
    
    try {
      await deleteDoc(doc(db, 'sib_profiles', targetUserId));
      
      // Also cleanup results
      const resultsRef = collection(db, 'sib_results');
      const q = query(resultsRef, where('userId', '==', targetUserId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      
      alert("User account and data removed.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user profile.");
    }
  };

  // Institutional CBT Handlers
  const handleVerifyInstPayment = async (reqId: string, currentVerified: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'sib_inst_requests', reqId), {
        paymentVerified: !currentVerified,
        status: !currentVerified ? 'verified' : 'pending',
        updatedAt: serverTimestamp()
      });
      alert(`Payment status updated to ${!currentVerified ? 'VERIFIED' : 'PENDING'}`);
    } catch (e: any) {
      alert("Failed to update payment status: " + e?.message);
    }
  };

  const handleSendAdminChatMessage = async (reqId: string, messagesList: any[] = []) => {
    if (!db || !adminChatInput.trim()) return;
    const msg = adminChatInput.trim();
    setAdminChatInput('');
    try {
      const newMsg = {
        sender: 'admin',
        text: msg,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...(messagesList || []), newMsg];
      await updateDoc(doc(db, 'sib_inst_requests', reqId), {
        messages: updatedMessages,
        status: 'in_conversation',
        updatedAt: serverTimestamp()
      });
    } catch (e: any) {
      alert("Failed to send message: " + e?.message);
    }
  };

  const handleApproveAndCreateRoom = async (reqItem: any) => {
    if (!db) return;
    setIsProcessingInst(true);
    try {
      const generatedRoomId = assignRoomIdInput.trim().toUpperCase() || `INST-${Math.floor(100000 + Math.random() * 900000)}`;

      // Filter existing questions matching subject or fallback questions
      const matchingQuestions = adminQuestionsList.filter(q => 
        q.subject?.toLowerCase() === reqItem.subject?.toLowerCase()
      );

      const finalQuestions = matchingQuestions.length >= 5 ? matchingQuestions.slice(0, 50) : [
        {
          id: 'iq1',
          question: `Sample Assessment Question for ${reqItem.subject || 'General Studies'}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Sample explanation for CBT room.'
        },
        {
          id: 'iq2',
          question: `Which of the following is correct regarding ${reqItem.examTitle}?`,
          options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
          correctAnswer: 1,
          explanation: 'Standard test verification.'
        }
      ];

      // 1. Create Room Document in sib_inst_rooms
      const roomRef = doc(db, 'sib_inst_rooms', generatedRoomId);
      await setDoc(roomRef, {
        roomId: generatedRoomId,
        institutionName: reqItem.institutionName,
        examTitle: reqItem.examTitle,
        subject: reqItem.subject,
        durationMinutes: reqItem.durationMinutes || 45,
        candidateCountLimit: reqItem.candidateCount || 100,
        questions: finalQuestions,
        active: true,
        dispatched: false,
        createdBy: user?.email || 'Admin',
        createdAt: new Date().toISOString()
      });

      // 2. Update Request Status and notify chat
      const systemNotice = {
        sender: 'admin',
        text: `🎉 CBT Room Generated Successfully! Your official CBT Room ID is: ${generatedRoomId}. Share this Room ID with your candidates so they can enter via the CBT Dispatcher.`,
        timestamp: new Date().toISOString()
      };

      await updateDoc(doc(db, 'sib_inst_requests', reqItem.id), {
        status: 'approved',
        roomId: generatedRoomId,
        messages: [...(reqItem.messages || []), systemNotice],
        updatedAt: serverTimestamp()
      });

      setAssignRoomIdInput('');
      alert(`Room Created and Activated! CBT Room ID: ${generatedRoomId}`);
    } catch (e: any) {
      console.error("Room creation error:", e);
      alert("Failed to activate CBT room: " + e?.message);
    } finally {
      setIsProcessingInst(false);
    }
  };

  const handleDispatchResultsToRep = async (room: any) => {
    if (!db) return;
    if (!window.confirm(`Are you sure you want to dispatch all results for Room "${room.roomId}" to the representative?`)) return;

    setIsProcessingInst(true);
    try {
      // 1. Mark room as dispatched
      await updateDoc(doc(db, 'sib_inst_rooms', room.roomId), {
        dispatched: true,
        dispatchedAt: new Date().toISOString()
      });

      // 2. Find matching request doc and post message
      const matchingReq = instRequests.find(r => r.roomId === room.roomId || r.institutionName === room.institutionName);
      if (matchingReq) {
        const roomSubmissions = instSubmissions.filter(s => s.roomId === room.roomId);
        const dispatchNotice = {
          sender: 'admin',
          text: `📊 CBT Results Dispatched! Total Candidates Submitted: ${roomSubmissions.length}. You can now view and download the full result roster in your Representative Portal.`,
          timestamp: new Date().toISOString()
        };
        await updateDoc(doc(db, 'sib_inst_requests', matchingReq.id), {
          status: 'completed',
          messages: [...(matchingReq.messages || []), dispatchNotice],
          updatedAt: serverTimestamp()
        });
      }

      alert(`Results for Room ${room.roomId} dispatched successfully!`);
    } catch (e: any) {
      alert("Failed to dispatch results: " + e?.message);
    } finally {
      setIsProcessingInst(false);
    }
  };

  const handleExportSubmissionsCSV = (roomId: string, examTitle: string) => {
    const submissions = instSubmissions.filter(s => s.roomId === roomId);
    if (submissions.length === 0) {
      alert("No candidate submissions recorded for this room yet.");
      return;
    }

    const headers = ["Candidate Name", "Reg / Matric No", "Department", "Score", "Total Questions", "Percentage (%)", "Submitted At"];
    const rows = submissions.map(s => [
      `"${s.candidateName || 'Anonymous'}"`,
      `"${s.candidateRegNo || 'N/A'}"`,
      `"${s.candidateDept || 'N/A'}"`,
      s.score ?? 0,
      s.totalQuestions ?? 0,
      s.totalQuestions ? Math.round(((s.score ?? 0) / s.totalQuestions) * 100) : 0,
      `"${s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'N/A'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CBT_Results_${examTitle.replace(/\s+/g, '_')}_${roomId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOnline = (lastSeen: any) => {
    if (!lastSeen) return false;
    try {
      const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
      const diff = (new Date().getTime() - date.getTime()) / 1000;
      return diff < 180; // 3 minutes threshold
    } catch (e) {
      return false;
    }
  };

  const getRelativeTime = (lastSeen: any) => {
    if (!lastSeen) return 'Never';
    try {
      const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
      const diff = (new Date().getTime() - date.getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  };

  const filteredPayments = payments.filter(p => 
    p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p => 
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTokenSubscribers = profiles.filter(p => 
    p.isPremium && 
    ((p.fullName || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()) || 
     (p.email || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
     (p.nickname || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()))
  );

  const filteredTokenNonSubscribers = profiles.filter(p => 
    !p.isPremium && 
    ((p.fullName || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()) || 
     (p.email || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
     (p.nickname || '').toLowerCase().includes(tokenSearchQuery.toLowerCase()))
  );

  if (!authorized) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-6 text-theme-text transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-theme-card p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-theme-border"
        >
          <div className="w-16 h-16 bg-theme-accent/10 text-theme-accent rounded-2xl flex items-center justify-center mx-auto mb-6 border border-theme-accent/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-theme-text mb-2">Admin Authorization</h2>
          <p className="text-theme-muted text-sm mb-8 font-medium">Enter your secure administrator password to continue.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-5 py-4 focus:ring-4 focus:ring-theme-accent/10 outline-none transition-all font-mono text-theme-text"
            />
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onBack}
                className="flex-1 bg-theme-bg text-theme-muted font-bold py-4 rounded-xl border border-theme-border hover:bg-theme-card transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] bg-theme-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-theme-accent/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Authorize <ArrowLeft className="rotate-180" size={18} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-300 flex flex-col">
      <header className="bg-theme-card border-b border-theme-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} />
          {tab !== 'hub' ? (
            <button 
              onClick={() => setTab('hub')} 
              className="px-3.5 py-2 bg-theme-bg border border-theme-border hover:border-theme-accent text-theme-text rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Admin Hub</span>
            </button>
          ) : (
            <button onClick={onBack} className="p-2 hover:bg-theme-bg rounded-xl transition-all" title="Return to Dashboard">
              <ArrowLeft size={22} className="text-theme-muted" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-black text-theme-text leading-none flex items-center gap-2">
              <span>Admin Console</span>
              {tab !== 'hub' && (
                <>
                  <span className="text-theme-muted text-sm font-normal">/</span>
                  <span className="text-theme-accent text-sm font-black uppercase">
                    {tab === 'questions' && 'Questions Manager & Vision'}
                    {tab === 'payments' && 'Payments & Subscriptions'}
                    {tab === 'users' && 'Users Directory'}
                    {tab === 'tokens' && 'AI Operations & Tokens'}
                    {tab === 'user_overrides' && 'User Mode Overrides'}
                    {tab === 'api_keys' && 'AI Models & API Keys'}
                    {tab === 'security' && 'Security Settings'}
                    {tab === 'library' && 'E-Library & Books'}
                    {tab === 'alerts' && 'System Alerts'}
                  </span>
                </>
              )}
            </h1>
            <p className="text-[10px] text-theme-muted mt-1">
              {tab === 'hub' ? 'Master Administration Hub & Content Pipeline' : 'Click "Back to Admin Hub" to return to the function dashboard'}
            </p>
          </div>
        </div>

        {tab !== 'hub' && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-theme-muted">Jump to:</span>
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value as any)}
              className="px-3 py-1.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
            >
              <option value="hub">Dashboard Hub</option>
              <option value="questions">Questions & Vision Scanner</option>
              <option value="payments">Payments & Receipts</option>
              <option value="users">Users Management</option>
              <option value="tokens">AI Operations & Tokens</option>
              <option value="api_keys">AI Models & API Keys</option>
              <option value="library">Library & E-Books</option>
              <option value="alerts">System Alerts</option>
              <option value="security">Security Settings</option>
            </select>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {tab === 'hub' && (
          <div className="space-y-8">
            {/* Hub Welcome Banner & System Status */}
            <div className="bg-gradient-to-br from-theme-card via-theme-card to-theme-bg p-6 sm:p-8 rounded-3xl border border-theme-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/30 text-theme-accent text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  <span>Authenticated Master Console</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight">
                  Admin Command Hub
                </h2>
                <p className="text-xs text-theme-muted max-w-xl">
                  Select any administrative function below to manage question banks, review student subscription transfers, configure Gemini models, or inspect system alerts.
                </p>
              </div>

              {/* Quick Health Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-theme-bg/60 p-4 rounded-2xl border border-theme-border/60">
                <div className="text-center px-2">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Questions</p>
                  <p className="text-lg font-black text-theme-text">{adminQuestionsList.length}</p>
                </div>
                <div className="text-center px-2 border-l border-theme-border/40">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Users</p>
                  <p className="text-lg font-black text-theme-text">{profiles.length}</p>
                </div>
                <div className="text-center px-2 border-l border-theme-border/40">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Pending</p>
                  <p className="text-lg font-black text-amber-400">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="text-center px-2 border-l border-theme-border/40">
                  <p className="text-[10px] uppercase font-bold text-theme-muted">Alerts</p>
                  <p className="text-lg font-black text-rose-400">{alerts.length}</p>
                </div>
              </div>
            </div>

            {/* Orderly Function Button Cards Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-theme-muted px-1">
                Administrative Function Modules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Questions Manager & Hardcopy Vision */}
                <button
                  type="button"
                  onClick={() => setTab('questions')}
                  className="group p-6 rounded-3xl bg-theme-card border-2 border-theme-accent/40 hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Camera size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Renovated Pipeline
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      Questions Manager & Hardcopy Vision Scanner
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Scan physical past exam booklets (1990–2025). Multimodal Vision extracts math formulas into KaTeX, options A–D, and step-by-step solutions with split-screen verification.
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] font-bold text-theme-muted">
                      <span>{adminQuestionsList.length} dynamic questions stored</span>
                    </div>
                  </div>
                </button>

                {/* 2. Payments & Receipts */}
                <button
                  type="button"
                  onClick={() => setTab('payments')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                        payments.filter(p => p.status === 'pending').length > 0
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-theme-bg text-theme-muted border-theme-border"
                      )}>
                        {payments.filter(p => p.status === 'pending').length} Pending Approval
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      Payments & Receipts Verification
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Inspect uploaded bank payment receipts, verify transactions, activate Claxy & Claxy Pro plans, and manage rejected proofs.
                    </p>
                  </div>
                </button>

                {/* 3. Users Directory */}
                <button
                  type="button"
                  onClick={() => setTab('users')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Users size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-theme-bg text-theme-muted border border-theme-border">
                        {profiles.length} Total Registered
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      Users Management & Directory
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Browse all user accounts, check subscription statuses, promote/demote administrators, and manage student security.
                    </p>
                  </div>
                </button>

                {/* 4. AI Operations & Tokens */}
                <button
                  type="button"
                  onClick={() => setTab('tokens')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Bot size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-theme-bg text-theme-muted border border-theme-border">
                        Mode: {systemSettings?.subscriberMode || 'tokens'}
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      AI Operations & Token Budget
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Track Gemini token consumption, configure token quotas for subscribers and non-subscribers, and customize the fallback offline JS engine.
                    </p>
                  </div>
                </button>

                {/* 5. AI Models & API Keys */}
                <button
                  type="button"
                  onClick={() => setTab('api_keys')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Key size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-theme-bg text-theme-muted border border-theme-border">
                        {systemSettings?.apiKeysList?.length || 0} Registered Keys
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      AI Models & API Keys Management
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Manage Gemini API keys, test connection latency, set target models (gemini-3.8-flash), and assign role-specific keys.
                    </p>
                  </div>
                </button>

                {/* 6. E-Library & Textbooks */}
                <button
                  type="button"
                  onClick={() => setTab('library')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-theme-bg text-theme-muted border border-theme-border">
                        {adminLibraryBooks.length} Books
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      E-Library & National Textbooks
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Publish educational textbooks, syllabus materials, and revision guides across National, Universal, and General categories.
                    </p>
                  </div>
                </button>

                {/* 7. System Alerts & Logs */}
                <button
                  type="button"
                  onClick={() => setTab('alerts')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AlertTriangle size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                        alerts.length > 0 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-theme-bg text-theme-muted border-theme-border"
                      )}>
                        {alerts.length} Logged Alerts
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      System Alerts & Live Error Logs
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Review automated error notifications, Gemini quota spikes, network issues, and database read/write diagnostic events.
                    </p>
                  </div>
                </button>

                {/* 8. Security Settings */}
                <button
                  type="button"
                  onClick={() => setTab('security')}
                  className="group p-6 rounded-3xl bg-theme-card border border-theme-border hover:border-theme-accent transition-all text-left flex items-start gap-5 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-500/10 text-slate-300 border border-slate-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Shield size={26} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Shielded Endpoint
                      </span>
                      <ChevronRight size={18} className="text-theme-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-base font-black text-theme-text group-hover:text-theme-accent transition-colors">
                      Admin Security & Master Credentials
                    </h4>
                    <p className="text-xs text-theme-muted line-clamp-2">
                      Change master administrator password, configure recovery notification email, and protect access to the /admin route.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Total Profiles</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-theme-text">{profiles.length}</p>
                  <Users className="text-theme-muted opacity-20" size={32} />
                </div>
              </div>
              <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Premium Users</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-theme-accent">{profiles.filter(p => p.isPremium).length}</p>
                  <CheckCircle className="text-theme-accent opacity-20" size={32} />
                </div>
              </div>
              <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Users Online</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-emerald-500">{profiles.filter(p => isOnline(p.lastSeen)).length}</p>
                  <Globe className="text-emerald-500 opacity-20 animate-pulse" size={32} />
                </div>
              </div>
            </div>

            <div className="bg-theme-card rounded-3xl border border-theme-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-theme-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
                  <input 
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-theme-bg/50 border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-theme-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Active Management</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-theme-bg/50 border-b border-theme-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">User Profile</th>
                      <th className="px-6 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Plan</th>
                      <th className="px-6 py-4 text-[10px] font-black text-theme-muted uppercase tracking-widest">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className={cn("hover:bg-theme-bg/30 transition-all", p.isDisabled ? "opacity-60 bg-rose-50/5" : "")}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-theme-bg border border-theme-border overflow-hidden flex items-center justify-center shrink-0">
                                {p.profileImage ? (
                                  <img src={p.profileImage} alt="" className="w-full h-full object-cover" />
                               ) : (
                                  <Users size={18} className="text-theme-muted" />
                                )}
                              </div>
                              {isOnline(p.lastSeen) && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-theme-card rounded-full shadow-sm" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-theme-text text-sm">
                                {p.fullName || p.nickname || (p.email ? p.email.split('@')[0] : 'Unknown User')}
                                {p.role === 'admin' && <ShieldCheck size={14} className="inline ml-1 text-amber-500" />}
                              </p>
                              <p className="text-[10px] text-theme-muted font-mono">{p.email || 'No Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", isOnline(p.lastSeen) ? "bg-emerald-500" : "bg-slate-300")} />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                                {isOnline(p.lastSeen) ? "Online Now" : `Last seen: ${getRelativeTime(p.lastSeen)}`}
                              </span>
                            </div>
                            <p className="text-[9px] text-theme-muted">
                              Joined: {new Date(p.createdAt?.toDate?.() || p.createdAt).toLocaleString()}
                            </p>
                            {p.isDisabled && (
                              <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-0.5">
                                <XCircle size={10} /> Blocked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit",
                              p.isPremium ? "bg-emerald-100 text-emerald-600" : "bg-theme-bg border border-theme-border text-theme-muted"
                            )}>
                              {p.isPremium ? 'Premium' : 'Free Trial'}
                            </span>
                            {!p.isPremium && p.trialExpiresAt && (
                              <span className="text-[9px] text-theme-muted italic">
                                Expires: {new Date(p.trialExpiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleDisable(p.id, p.isDisabled)}
                              className={cn(
                                "p-2 rounded-lg transition-all border",
                                p.isDisabled 
                                  ? "bg-theme-bg text-emerald-500 border-emerald-500/20 hover:bg-emerald-50" 
                                  : "bg-theme-bg text-rose-500 border-rose-500/20 hover:bg-rose-100"
                              )}
                              title={p.isDisabled ? "Enable User" : "Disable User"}
                            >
                              {p.isDisabled ? <UserCheck size={16} /> : <UserX size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(p.id)}
                              className="p-2 bg-theme-bg text-theme-muted rounded-lg hover:text-rose-600 hover:bg-rose-100 transition-all border border-theme-border"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Stats & Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Verification Filter</h3>
                <div className="space-y-2">
                  {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl text-sm font-bold capitalize flex items-center justify-between transition-all",
                        filter === f ? "bg-blue-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {f}
                      {f === 'pending' && payments.filter(p => p.status === 'pending').length > 0 && (
                        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-[10px]">
                          {payments.filter(p => p.status === 'pending').length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Users</p>
                    <p className="text-xl font-black">{payments.length}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Paid Users</p>
                    <p className="text-lg font-bold text-green-400">{payments.filter(p => p.status === 'verified').length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={18} />
                <input 
                  type="text"
                  placeholder="Search users by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-theme-card border border-theme-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent/20 shadow-sm text-theme-text"
                />
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={40} className="text-theme-accent animate-spin mb-4" />
                  <p className="text-theme-muted font-medium">Loading payment records...</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="bg-theme-card rounded-3xl border border-dashed border-theme-border p-20 text-center">
                  <AlertCircle size={40} className="mx-auto text-theme-muted mb-4" />
                  <h3 className="text-lg font-bold text-theme-text">No records found</h3>
                  <p className="text-theme-muted">No payment requests match your current filters.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPayments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-theme-bg flex items-center justify-center text-theme-muted">
                          <Users size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-theme-text">{payment.userName || 'Unknown User'}</h4>
                          <p className="text-sm text-theme-muted">{payment.userEmail}</p>
                          <p className="text-[10px] text-theme-muted font-medium uppercase mt-1">
                            Ref: {payment.id.slice(-8).toUpperCase()} • {new Date(payment.createdAt?.toDate?.() || payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setSelectedReceipt(payment.receiptUrl)}
                          className="px-4 py-2 bg-theme-bg text-theme-text rounded-xl text-xs font-bold hover:bg-theme-border transition-all flex items-center gap-2"
                        >
                          <Eye size={14} /> View Receipt
                        </button>

                        {payment.status === 'pending' ? (
                          <>
                            <button
                              disabled={processingId === payment.id}
                              onClick={() => handleVerify(payment, true)}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100"
                            >
                              {processingId === payment.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                              Approve
                            </button>
                            <button
                              disabled={processingId === payment.id}
                              onClick={() => handleVerify(payment, false)}
                              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-2"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2",
                            payment.status === 'verified' ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {payment.status === 'verified' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {payment.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-theme-card p-6 rounded-3xl border border-theme-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-theme-text flex items-center gap-2">
                  <AlertTriangle className="text-rose-500 animate-pulse" size={24} />
                  System Alerts & API Notifications
                </h2>
                <p className="text-theme-muted text-xs mt-1">
                  Real-time status updates and errors routed from your AI model provider (Gemini / Google AI Studio) and system services.
                </p>
              </div>
              {alerts.length > 0 && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to clear all logged system alerts? This action is irreversible.")) return;
                    try {
                      const batch = writeBatch(db);
                      alerts.forEach(alertItem => {
                        batch.delete(doc(db, 'sib_alerts', alertItem.id));
                      });
                      await batch.commit();
                      alert("All system alerts cleared successfully!");
                    } catch (err) {
                      console.error("Failed to purge alerts:", err);
                      alert("Failed to clear system alerts.");
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-rose-100"
                >
                  <Trash2 size={14} />
                  Clear All Alerts
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-theme-card p-4 rounded-2xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Total Alerts</p>
                <p className="text-2xl font-black text-theme-text">{alerts.length}</p>
              </div>
              <div className="bg-theme-card p-4 rounded-2xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Rate Limits (429)</p>
                <p className="text-2xl font-black text-rose-500">{alerts.filter(a => a.errorType === 'RESOURCE_EXHAUSTED').length}</p>
              </div>
              <div className="bg-theme-card p-4 rounded-2xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Auth / 403 Errors</p>
                <p className="text-2xl font-black text-amber-500">{alerts.filter(a => a.errorType === 'PERMISSION_DENIED').length}</p>
              </div>
              <div className="bg-theme-card p-4 rounded-2xl border border-theme-border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-1">Timeouts</p>
                <p className="text-2xl font-black text-blue-500">{alerts.filter(a => a.errorType === 'TIMEOUT').length}</p>
              </div>
            </div>

            {/* List */}
            {alerts.length === 0 ? (
              <div className="bg-theme-card rounded-3xl border border-dashed border-theme-border p-20 text-center">
                <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-theme-text">All systems operational</h3>
                <p className="text-theme-muted text-sm mt-1">No API failures or system notifications are currently logged.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alertItem) => (
                  <motion.div
                    key={alertItem.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "bg-theme-card p-6 rounded-3xl border shadow-sm transition-all flex flex-col gap-4",
                      alertItem.errorType === 'RESOURCE_EXHAUSTED' ? "border-rose-200 bg-rose-50/10" : "border-theme-border"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                            alertItem.errorType === 'RESOURCE_EXHAUSTED' ? "bg-rose-100 text-rose-600" :
                            alertItem.errorType === 'PERMISSION_DENIED' ? "bg-amber-100 text-amber-600" :
                            alertItem.errorType === 'TIMEOUT' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                          )}>
                            {alertItem.errorType || 'SYSTEM_ALERT'}
                          </span>
                          <span className="text-[10px] font-bold text-theme-muted">
                            {alertItem.service}
                          </span>
                        </div>
                        <h4 className="font-bold text-theme-text text-sm md:text-base mt-2 leading-relaxed">
                          {alertItem.message}
                        </h4>
                      </div>
                      <button
                        onClick={async () => {
                          if (!db) return;
                          try {
                            await deleteDoc(doc(db, 'sib_alerts', alertItem.id));
                          } catch (err) {
                            console.error("Failed to delete alert:", err);
                          }
                        }}
                        className="p-1.5 hover:bg-theme-bg text-theme-muted hover:text-rose-600 rounded-lg transition-all border border-transparent hover:border-theme-border"
                        title="Dismiss Alert"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>

                    {alertItem.rawError && (
                      <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Raw Trace Information</span>
                        </div>
                        <pre className="text-rose-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                          {alertItem.rawError}
                        </pre>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-theme-border pt-3 text-[10px] text-theme-muted font-medium">
                      <span>Triggered by: <strong>{alertItem.userEmail || alertItem.userId || 'System'}</strong></span>
                      <span className="font-mono text-right">
                        {alertItem.timestamp ? new Date(alertItem.timestamp.toDate ? alertItem.timestamp.toDate() : alertItem.timestamp).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'questions' && (
          <HardcopyVisionManager
            existingQuestions={adminQuestionsList}
            onQuestionDeleted={handleDeleteQuestion}
          />
        )}

        {tab === 'tokens' && (
          <div className="space-y-8">
            {/* Top overview alert */}
            <div className="bg-theme-card p-6 rounded-[2rem] border border-theme-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-theme-accent/10 text-theme-accent rounded-lg border border-theme-accent/20">
                    <Sparkles size={16} />
                  </span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-theme-text">AI Operations & Token Management</h3>
                </div>
                <p className="text-[11px] text-theme-muted max-w-xl leading-relaxed">
                  Monitor token limits, modify the live client-side JavaScript generation engines, and toggle fallback routing between high-fidelity Gemini models and local offline scripts.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-theme-bg border border-theme-border hover:bg-theme-card text-theme-text text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink size={14} /> Get API Key
                </a>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-theme-accent text-white hover:opacity-90 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  Manage Billing
                </a>
              </div>
            </div>

            {/* Token Budget Gauge & Settings */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Token Monitor Card */}
              <div className="md:col-span-2 bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Token Consumption Quota</span>
                      <h4 className="text-xl font-black text-theme-text mt-0.5">Live Quota Usage</h4>
                    </div>
                    {systemSettings && systemSettings.totalTokensUsed >= systemSettings.totalTokensBudget ? (
                      <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-wider rounded-full animate-pulse flex items-center gap-1">
                        <AlertTriangle size={12} /> Budget Depleted
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Active Online
                      </span>
                    )}
                  </div>

                  {systemSettings && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-theme-muted">
                          {systemSettings.totalTokensUsed.toLocaleString()} Used
                        </span>
                        <span className="text-theme-text">
                          {systemSettings.totalTokensBudget.toLocaleString()} Budget Limit
                        </span>
                      </div>
                      <div className="w-full h-3.5 bg-theme-bg border border-theme-border rounded-full overflow-hidden p-0.5">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            systemSettings.totalTokensUsed >= systemSettings.totalTokensBudget
                              ? "bg-rose-500"
                              : (systemSettings.totalTokensUsed / systemSettings.totalTokensBudget) > 0.8
                              ? "bg-amber-500"
                              : "bg-theme-accent"
                          )}
                          style={{ width: `${Math.min(100, (systemSettings.totalTokensUsed / systemSettings.totalTokensBudget) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-theme-muted">
                        <span>{Math.round((systemSettings.totalTokensUsed / systemSettings.totalTokensBudget) * 100)}% Used</span>
                        <span>{Math.max(0, systemSettings.totalTokensBudget - systemSettings.totalTokensUsed).toLocaleString()} remaining tokens before fallback</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-theme-border flex flex-wrap items-center justify-between gap-4">
                  <form onSubmit={handleUpdateBudget} className="flex items-center gap-2 max-w-xs w-full">
                    <input 
                      type="number"
                      placeholder="Set Token Budget"
                      value={customBudgetInput}
                      onChange={(e) => setCustomBudgetInput(e.target.value)}
                      className="flex-1 bg-theme-bg border border-theme-border px-4 py-2.5 rounded-xl text-xs font-bold text-theme-text focus:outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={savingSettings}
                      className="px-4 py-2.5 bg-theme-text text-theme-card hover:opacity-90 text-xs font-black rounded-xl transition-all"
                    >
                      Update
                    </button>
                  </form>
                  <button 
                    onClick={handleResetTokenUsage}
                    className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-500 text-xs font-black rounded-xl transition-all flex items-center gap-1"
                  >
                    <Clock size={12} /> Reset Usage Counter
                  </button>
                </div>
              </div>

              {/* Mode Selection Config Card */}
              <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">System Routing Toggles</span>
                  <h4 className="text-xl font-black text-theme-text mt-0.5">Mode Toggles</h4>
                  <p className="text-[10px] text-theme-muted mt-1 leading-relaxed">
                    Select which user groups utilize live AI processing versus light client-side offline JS engines.
                  </p>
                </div>

                {systemSettings && (
                  <div className="space-y-4">
                    <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-theme-text uppercase tracking-wider">Subscribers (Premium)</label>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-bold uppercase tracking-wider">PRO</span>
                      </div>
                      <select
                        value={systemSettings.subscriberMode}
                        onChange={(e) => handleSaveSystemSettings({ subscriberMode: e.target.value as any })}
                        className="w-full bg-theme-card border border-theme-border px-3 py-2 rounded-xl text-xs font-black text-theme-text focus:outline-none"
                      >
                        <option value="tokens">Tokens Mode (Premium AI Online)</option>
                        <option value="without_tokens">Without Tokens Mode (Local Offline Fallback)</option>
                      </select>
                    </div>

                    <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-theme-text uppercase tracking-wider">Non-Subscribers (Trial)</label>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[8px] font-bold uppercase tracking-wider">FREE</span>
                      </div>
                      <select
                        value={systemSettings.nonSubscriberMode}
                        onChange={(e) => handleSaveSystemSettings({ nonSubscriberMode: e.target.value as any })}
                        className="w-full bg-theme-card border border-theme-border px-3 py-2 rounded-xl text-xs font-black text-theme-text focus:outline-none"
                      >
                        <option value="tokens">Tokens Mode (Premium AI Online)</option>
                        <option value="without_tokens">Without Tokens Mode (Local Offline Fallback)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feature 2: Real-time User Operating Override */}
        {tab === 'user_overrides' && (
          <div className="space-y-8">
            {/* Real-time User Routing Selector */}
            <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Real-time Control Deck</span>
                  <h4 className="text-xl font-black text-theme-text mt-0.5">Real-time User Operating Override</h4>
                  <p className="text-[11px] text-theme-muted mt-1">
                    Select individual users to force Tokens Mode or Without Tokens (Offline Local JS) mode, overriding their group defaults.
                  </p>
                </div>
                
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input 
                    type="text"
                    placeholder="Search users by name or email..."
                    value={tokenSearchQuery}
                    onChange={(e) => setTokenSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/60"
                  />
                </div>
              </div>

              {/* Dual lists container */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Column 1: Subscribers (Pro version) */}
                <div className="bg-gradient-to-b from-indigo-500/[0.02] to-transparent p-6 rounded-3xl border border-indigo-500/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <h5 className="text-xs font-black uppercase tracking-widest text-indigo-400">Subscribers ({filteredTokenSubscribers.length})</h5>
                    </div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Premium Access</span>
                  </div>

                  {filteredTokenSubscribers.length === 0 ? (
                    <div className="text-center py-10 text-theme-muted text-xs border border-dashed border-theme-border/50 rounded-2xl">
                      {tokenSearchQuery ? "No matching subscribers found" : "No active subscribers yet"}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {filteredTokenSubscribers.map((p) => {
                        const effectiveMode = p.forcedAiMode === 'tokens' || p.forcedAiMode === 'without_tokens'
                          ? p.forcedAiMode
                          : (systemSettings?.subscriberMode || 'tokens');
                        
                        return (
                          <div key={p.id} className="bg-theme-bg/60 p-4 rounded-2xl border border-theme-border/60 hover:border-indigo-500/20 transition-all flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="relative">
                                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500 font-bold text-xs uppercase overflow-hidden">
                                    {p.profileImage ? (
                                      <img src={p.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      (p.fullName || p.nickname || p.email || 'U').charAt(0)
                                    )}
                                  </div>
                                  {isOnline(p.lastSeen) && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-theme-bg rounded-full" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h6 className="text-xs font-bold text-theme-text flex items-center gap-1 truncate">
                                    {p.fullName || p.nickname || p.email?.split('@')[0] || 'Unknown User'}
                                  </h6>
                                  <span className="text-[9px] text-theme-muted font-mono block truncate">{p.email || 'No email address'}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleUpdateUserPremiumStatus(p.id, false)}
                                className="px-2.5 py-1.5 border border-rose-500/20 hover:border-rose-500/40 text-rose-500 hover:bg-rose-500/5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap shrink-0"
                                title="Demote to Trial Status"
                              >
                                Revoke Premium
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-theme-border/40 gap-2 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-theme-muted whitespace-nowrap">Active Engine:</span>
                                <span className={cn(
                                  "font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap",
                                  effectiveMode === 'tokens' ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-400"
                                )}>
                                  {effectiveMode === 'tokens' ? "⚡ AI Tokens" : "📁 Local Offline JS"}
                                </span>
                              </div>

                              {/* Target overrides selector buttons */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'default')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    (!p.forcedAiMode || p.forcedAiMode === 'default')
                                      ? "bg-indigo-500 text-white shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Follow global subscriber settings rule"
                                >
                                  Default
                                </button>
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'tokens')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    p.forcedAiMode === 'tokens'
                                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Force live high-fidelity AI generation"
                                >
                                  Force AI
                                </button>
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'without_tokens')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    p.forcedAiMode === 'without_tokens'
                                      ? "bg-slate-600 text-white shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Force lightweight offline scripts"
                                >
                                  Force Offline
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Non-Subscribers (Trial version) */}
                <div className="bg-gradient-to-b from-amber-500/[0.02] to-transparent p-6 rounded-3xl border border-amber-500/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <h5 className="text-xs font-black uppercase tracking-widest text-amber-500">Non-Subscribers ({filteredTokenNonSubscribers.length})</h5>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Free Trial</span>
                  </div>

                  {filteredTokenNonSubscribers.length === 0 ? (
                    <div className="text-center py-10 text-theme-muted text-xs border border-dashed border-theme-border/50 rounded-2xl">
                      {tokenSearchQuery ? "No matching non-subscribers found" : "No non-subscribers registered yet"}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {filteredTokenNonSubscribers.map((p) => {
                        const effectiveMode = p.forcedAiMode === 'tokens' || p.forcedAiMode === 'without_tokens'
                          ? p.forcedAiMode
                          : (systemSettings?.nonSubscriberMode || 'without_tokens');
                        
                        return (
                          <div key={p.id} className="bg-theme-bg/60 p-4 rounded-2xl border border-theme-border/60 hover:border-amber-500/20 transition-all flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="relative">
                                  <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0 text-amber-500 font-bold text-xs uppercase overflow-hidden">
                                    {p.profileImage ? (
                                      <img src={p.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      (p.fullName || p.nickname || p.email || 'U').charAt(0)
                                    )}
                                  </div>
                                  {isOnline(p.lastSeen) && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-theme-bg rounded-full" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h6 className="text-xs font-bold text-theme-text flex items-center gap-1 truncate">
                                    {p.fullName || p.nickname || p.email?.split('@')[0] || 'Unknown User'}
                                  </h6>
                                  <span className="text-[9px] text-theme-muted font-mono block truncate">{p.email || 'No email address'}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleUpdateUserPremiumStatus(p.id, true)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0"
                                title="Upgrade user to premium subscriber"
                              >
                                Grant Premium
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-theme-border/40 gap-2 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-theme-muted whitespace-nowrap">Active Engine:</span>
                                <span className={cn(
                                  "font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap",
                                  effectiveMode === 'tokens' ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-400"
                                )}>
                                  {effectiveMode === 'tokens' ? "⚡ AI Tokens" : "📁 Local Offline JS"}
                                </span>
                              </div>

                              {/* Target overrides selector buttons */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'default')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    (!p.forcedAiMode || p.forcedAiMode === 'default')
                                      ? "bg-indigo-500 text-white shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Follow global non-subscriber settings rule"
                                >
                                  Default
                                </button>
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'tokens')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    p.forcedAiMode === 'tokens'
                                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Force live high-fidelity AI generation"
                                >
                                  Force AI
                                </button>
                                <button
                                  onClick={() => handleUpdateUserAiOverride(p.id, 'without_tokens')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-bold transition-all",
                                    p.forcedAiMode === 'without_tokens'
                                      ? "bg-slate-600 text-white shadow-sm"
                                      : "bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text"
                                  )}
                                  title="Force lightweight offline scripts"
                                >
                                  Force Offline
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature 3: AI Models & API Key Management */}
        {tab === 'api_keys' && (
          <div className="space-y-8">
            {/* Admin Control Center: AI Models & Active API Key Management */}
            <div className="bg-theme-card p-8 rounded-[2.5rem] border-2 border-theme-accent/30 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-accent flex items-center gap-1.5">
                    <Sparkles size={14} /> Master Admin Control Center
                  </span>
                  <h4 className="text-xl font-black text-theme-text mt-1">AI Models & API Keys Management</h4>
                  <p className="text-xs text-theme-muted mt-1">
                    Manage and switch between saved API keys for each AI model engine. Saved keys remain stored in your vault so you can switch back and forth anytime.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Key Vault Active
                  </span>
                </div>
              </div>

              {/* Active Model Selector Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* JeeRaf AI Config Card */}
                <div className="bg-theme-bg p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-theme-border pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="text-amber-500" size={20} />
                      <h5 className="font-black text-theme-text text-sm">JeeRaf AI Assistant</h5>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Student AI Engine
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block mb-1">
                        Active Gemini AI Model:
                      </label>
                      <select
                        value={systemSettings?.ibomAiModel || 'gemini-2.0-flash'}
                        onChange={(e) => {
                          const newModel = e.target.value;
                          handleSaveSystemSettings({ ibomAiModel: newModel });
                          if (typeof localStorage !== 'undefined') localStorage.setItem('sib_ibom_ai_model', newModel);
                        }}
                        className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      >
                        <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash (Recommended - Ultra Fast)</option>
                        <option value="gemini-1.5-flash">🚀 Gemini 1.5 Flash (Balanced Multimodal)</option>
                        <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Deep Reasoning & Math)</option>
                        <option value="gemini-2.0-pro-exp">🧪 Gemini 2.0 Pro Experimental</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block mb-1">
                        Switch Active API Key (JeeRaf AI):
                      </label>
                      <select
                        value={
                          systemSettings?.apiKeysList?.find(
                            k => k.active && (k.target === 'ibom_ai' || k.target === 'all') && k.key === systemSettings?.ibomAiApiKey
                          )?.id || (systemSettings?.ibomAiApiKey ? 'custom' : 'default')
                        }
                        onChange={(e) => handleSwitchApiKeyForTarget('ibom_ai', e.target.value)}
                        className="w-full bg-theme-card border-2 border-amber-500/40 rounded-xl px-3 py-2.5 text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm"
                      >
                        <option value="default">🌐 System Default Environment Key</option>
                        {systemSettings?.apiKeysList && systemSettings.apiKeysList.map((item) => (
                          <option key={item.id} value={item.id}>
                            🔑 {item.label} ({item.key.slice(0, 8)}...{item.key.slice(-4)}) [{item.target.toUpperCase()}] {item.active ? '★ ACTIVE' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-theme-card rounded-xl border border-theme-border flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Key size={14} className="text-amber-500 shrink-0" />
                        <span className="font-mono text-xs text-theme-text font-bold truncate">
                          {systemSettings?.ibomAiApiKey 
                            ? `${systemSettings.ibomAiApiKey.slice(0, 10)}...${systemSettings.ibomAiApiKey.slice(-4)}` 
                            : 'Using Default System Key'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase shrink-0">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin AI Config Card */}
                <div className="bg-theme-bg p-6 rounded-3xl border border-theme-border space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-theme-border pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-indigo-500" size={20} />
                      <h5 className="font-black text-theme-text text-sm">Admin Exam Generator AI</h5>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      CBT Question Creator
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block mb-1">
                        Active Gemini AI Model:
                      </label>
                      <select
                        value={systemSettings?.adminAiModel || 'gemini-2.0-flash'}
                        onChange={(e) => {
                          const newModel = e.target.value;
                          handleSaveSystemSettings({ adminAiModel: newModel });
                          if (typeof localStorage !== 'undefined') localStorage.setItem('sib_admin_ai_model', newModel);
                        }}
                        className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                      >
                        <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash (Recommended - High Throughput)</option>
                        <option value="gemini-1.5-flash">🚀 Gemini 1.5 Flash (Fast Processing)</option>
                        <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Deep Syllabus Reasoning)</option>
                        <option value="gemini-2.0-pro-exp">🧪 Gemini 2.0 Pro Experimental</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-theme-muted uppercase tracking-wider block mb-1">
                        Switch Active API Key (Admin AI):
                      </label>
                      <select
                        value={
                          systemSettings?.apiKeysList?.find(
                            k => k.active && (k.target === 'admin_ai' || k.target === 'all') && k.key === systemSettings?.adminAiApiKey
                          )?.id || (systemSettings?.adminAiApiKey ? 'custom' : 'default')
                        }
                        onChange={(e) => handleSwitchApiKeyForTarget('admin_ai', e.target.value)}
                        className="w-full bg-theme-card border-2 border-indigo-500/40 rounded-xl px-3 py-2.5 text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                      >
                        <option value="default">🌐 System Default Environment Key</option>
                        {systemSettings?.apiKeysList && systemSettings.apiKeysList.map((item) => (
                          <option key={item.id} value={item.id}>
                            🔑 {item.label} ({item.key.slice(0, 8)}...{item.key.slice(-4)}) [{item.target.toUpperCase()}] {item.active ? '★ ACTIVE' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-theme-card rounded-xl border border-theme-border flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Key size={14} className="text-indigo-500 shrink-0" />
                        <span className="font-mono text-xs text-theme-text font-bold truncate">
                          {systemSettings?.adminAiApiKey 
                            ? `${systemSettings.adminAiApiKey.slice(0, 10)}...${systemSettings.adminAiApiKey.slice(-4)}` 
                            : 'Using Default System Key'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase shrink-0">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form: Add New API Key to Vault */}
              <div className="bg-theme-bg p-6 rounded-3xl border border-theme-border space-y-4">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <div>
                    <h5 className="font-black text-theme-text text-sm flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" /> Add New API Key to Vault
                    </h5>
                    <p className="text-[11px] text-theme-muted mt-0.5">
                      Store new keys into your vault without overwriting old keys. You can switch between any stored key at any time.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddApiKey} className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-theme-muted uppercase tracking-wider block">
                      Paste Gemini API Key:
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={newApiKeyInput}
                      onChange={(e) => setNewApiKeyInput(e.target.value)}
                      className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-2.5 font-mono text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-theme-muted uppercase tracking-wider block">
                      Key Name / Label:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Studio Key #1"
                      value={newKeyLabelInput}
                      onChange={(e) => setNewKeyLabelInput(e.target.value)}
                      className="w-full bg-theme-card border border-theme-border rounded-xl px-4 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-theme-muted uppercase tracking-wider block">
                      Target Service:
                    </label>
                    <select
                      value={newKeyTargetInput}
                      onChange={(e) => setNewKeyTargetInput(e.target.value as any)}
                      className="w-full bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-xs font-bold text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                    >
                      <option value="all">🌟 All AI Services (Global)</option>
                      <option value="ibom_ai">🤖 JeeRaf AI Assistant Only</option>
                      <option value="admin_ai">🛡️ Admin Exam Generator Only</option>
                    </select>
                  </div>

                  <div className="md:col-span-4 flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-theme-accent text-white font-black text-xs rounded-xl shadow-lg shadow-theme-accent/20 hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <Plus size={15} /> Save & Add API Key to Vault
                    </button>
                  </div>
                </form>
              </div>

              {/* Table of Saved API Keys */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-theme-text text-xs uppercase tracking-wider text-theme-muted">
                    Saved API Key Vault ({systemSettings?.apiKeysList?.length || 0} Keys Stored)
                  </h5>
                  <span className="text-[10px] text-theme-muted italic">
                    Use the switch selector to toggle active status for any key
                  </span>
                </div>

                {!systemSettings?.apiKeysList || systemSettings.apiKeysList.length === 0 ? (
                  <div className="p-6 text-center text-theme-muted text-xs bg-theme-bg border border-dashed border-theme-border rounded-2xl">
                    No custom API keys added yet. The system is operating under the default environment configuration.
                  </div>
                ) : (
                  <div className="bg-theme-bg border border-theme-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-theme-card border-b border-theme-border text-[10px] font-black uppercase text-theme-muted">
                          <tr>
                            <th className="p-3">Key Label</th>
                            <th className="p-3">Masked API Key</th>
                            <th className="p-3">Target Service</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Switch & Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                          {systemSettings.apiKeysList.map((item) => (
                            <tr key={item.id} className="hover:bg-theme-card/50 transition-all">
                              <td className="p-3 font-bold text-theme-text">{item.label}</td>
                              <td className="p-3 font-mono text-theme-muted">
                                {item.key.slice(0, 8)}...{item.key.slice(-4)}
                              </td>
                              <td className="p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-theme-card border border-theme-border text-theme-text">
                                  {item.target}
                                </span>
                              </td>
                              <td className="p-3">
                                {item.active ? (
                                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                                    🟢 Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-theme-muted bg-slate-500/10 px-2 py-0.5 rounded uppercase">
                                    ⚪ Stored in Vault
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value === 'disable') {
                                      handleToggleKeyActive(item.id);
                                    } else if (e.target.value) {
                                      handleSwitchApiKeyForTarget(e.target.value as any, item.id);
                                    }
                                  }}
                                  defaultValue=""
                                  className="px-2 py-1 bg-theme-card border border-theme-border rounded-lg text-[10px] font-bold text-theme-text focus:outline-none"
                                >
                                  <option value="" disabled>Switch to...</option>
                                  <option value="ibom_ai">Activate for JeeRaf AI</option>
                                  <option value="admin_ai">Activate for Admin AI</option>
                                  <option value="all">Activate Globally (All)</option>
                                  <option value="disable">{item.active ? 'Set Inactive' : 'Toggle Active'}</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleTestApiKey(item.id, item.key, item.model || 'gemini-2.0-flash')}
                                  disabled={testingApiKey === item.id}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg font-bold text-[10px] transition-all"
                                >
                                  {testingApiKey === item.id ? 'Testing...' : '⚡ Test Connection'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApiKey(item.id)}
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg font-bold text-[10px] transition-all"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {testResult && (
                  <div className={`p-4 rounded-2xl border text-xs font-bold ${
                    testResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Token Management Infrastructure */}
        {tab === 'tokens' && (
          <div className="space-y-8">
            {/* List of CBT systems operating under paid tokens */}
            <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Model Architecture Blueprint</span>
                <h4 className="text-lg font-black text-theme-text mt-0.5">AI Tools Operating Under Paid Tokens</h4>
                <p className="text-[11px] text-theme-muted mt-1">
                  The JeeRaf CBT platform leverages these elite Gemini models for contextual execution. Click to configure credentials or purchase tokens.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "CBT Questions Generator",
                    desc: "Used for generating mock questions from uploaded textbooks, notes, and study guides in high-volume batches.",
                    model: "gemini-3-flash-preview",
                    status: "Active",
                    role: "Generative Engine"
                  },
                  {
                    name: "Audio AI Study Analyzer & Generator",
                    desc: "Used for analyzing speech, audio lectures, and video recordings to compile custom practice sheets.",
                    model: "gemini-3.1-pro-preview",
                    status: "Active",
                    role: "Multimodal Audio Engine"
                  },
                  {
                    name: "Audio Explanation System",
                    desc: "Powering vocalized transcript summaries and deep reasoning tutorials for individual test takers.",
                    model: "gemini-3.1-pro-preview",
                    status: "Active",
                    role: "Synthesizer & Reasoning Engine"
                  },
                  {
                    name: "CBT Assistant Chat",
                    desc: "Conversational tutor assisting users contextually within active mock examination setups.",
                    model: "gemini-3.5-flash",
                    status: "Active",
                    role: "Agentic Tutor"
                  },
                  {
                    name: "AI Question Extractor",
                    desc: "Parses structured materials (PDF, Word, Images) into real interactive exam files in the questions database.",
                    model: "gemini-3.5-flash",
                    status: "Active",
                    role: "Parser & Code Synthesizer"
                  },
                  {
                    name: "Public Help Desk Agent",
                    desc: "Handling open customer support questions, general usage assistance, and user guidelines.",
                    model: "gemini-3.5-flash",
                    status: "Active",
                    role: "Public Help Desk Concierge"
                  }
                ].map((tool, idx) => (
                  <div key={idx} className="bg-theme-bg p-5 rounded-2xl border border-theme-border flex flex-col justify-between hover:border-theme-accent/25 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-[9px] font-bold text-theme-accent bg-theme-accent/5 px-2 py-0.5 rounded border border-theme-accent/10">
                          {tool.role}
                        </span>
                        <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {tool.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-theme-text uppercase tracking-wide">{tool.name}</h5>
                      <p className="text-[10px] text-theme-muted leading-relaxed">{tool.desc}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-theme-border/50 mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-theme-muted font-semibold">{tool.model}</span>
                      <a 
                        href="https://ai.google.dev/models/gemini" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] font-bold text-theme-accent hover:underline flex items-center gap-0.5"
                      >
                        Model Info <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Fallback JS Custom Code Editor */}
            <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-theme-muted/10 text-theme-muted rounded-lg border border-theme-border">
                      <Code size={16} />
                    </span>
                    <h4 className="text-lg font-black text-theme-text">Offline Local JS Questions Generator</h4>
                  </div>
                  <p className="text-[11px] text-theme-muted mt-1">
                    Customize the client-side JavaScript routine that generates and scores mock practice tests instantly when operating in "Without Tokens Mode".
                  </p>
                </div>
                <button 
                  onClick={handleResetJsEngine}
                  className="px-4 py-2 bg-theme-bg border border-theme-border hover:bg-theme-card text-theme-text text-xs font-bold rounded-xl flex items-center gap-1 transition-all w-fit shrink-0"
                >
                  Reset Factory Template
                </button>
              </div>

              {systemSettings && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea 
                      value={systemSettings.localJsEngineCode}
                      onChange={(e) => handleSaveSystemSettings({ localJsEngineCode: e.target.value })}
                      rows={18}
                      className="w-full p-6 bg-slate-950 text-slate-100 font-mono text-xs rounded-3xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-theme-accent/30 leading-relaxed shadow-inner"
                      placeholder="function generateLocalQuestions(subject, count) { ... }"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/85 px-3 py-1 rounded-full text-[10px] text-slate-400 font-mono border border-slate-800">
                      JavaScript Engine Active
                    </div>
                  </div>
                  <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-start gap-3">
                    <AlertCircle size={18} className="text-theme-accent shrink-0 mt-0.5" />
                    <div className="text-[11px] text-theme-muted leading-relaxed">
                      <strong>Code execution blueprint:</strong> This script executes securely in a sandboxed client-side closure.
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>It must declare a function: <code>generateLocalQuestions(subject, count)</code></li>
                        <li>It must return an array of objects containing: <code>question</code> (string), <code>options</code> (array of 4 strings), <code>correctAnswer</code> (index 0-3), and <code>explanation</code> (string).</li>
                        <li>Try to avoid infinite loops or syntax exceptions as they will fallback automatically to safe practice pools.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-8">
            {/* Top overview alert */}
            <div className="bg-theme-card p-6 rounded-[2rem] border border-theme-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-theme-accent/10 text-theme-accent rounded-lg border border-theme-accent/20">
                    <Shield size={16} />
                  </span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-theme-text">Admin Security & Identity Protection</h3>
                </div>
                <p className="text-[11px] text-theme-muted max-w-xl leading-relaxed">
                  Manage master administrator credentials, configure secure credential rotation requiring re-authentication, and delegate authorized backup administrative accounts to secure access.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Credentials Rotation Card */}
              <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted flex items-center gap-1.5">
                    <Lock size={12} className="text-theme-accent" /> Secure Control Panel
                  </span>
                  <h4 className="text-xl font-black text-theme-text mt-1">Credentials Rotation</h4>
                  <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">
                    To update administrative access, you are required to first authenticate by providing your old email and password.
                  </p>
                </div>

                <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
                  <div className="bg-theme-bg p-5 rounded-2xl border border-theme-border/50 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-theme-muted border-b border-theme-border/40 pb-2">
                      1. Verify Current Identity (Required)
                    </h5>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">Current Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted/60" size={14} />
                        <input
                          required
                          type="email"
                          placeholder="Enter your current registered email..."
                          value={securityOldEmail}
                          onChange={(e) => setSecurityOldEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">Current Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted/60" size={14} />
                        <input
                          required
                          type="password"
                          placeholder="Enter your current password..."
                          value={securityOldPassword}
                          onChange={(e) => setSecurityOldPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-theme-bg p-5 rounded-2xl border border-theme-border/50 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-theme-muted border-b border-theme-border/40 pb-2">
                      2. New Credentials (Fill to update)
                    </h5>

                    <div>
                      <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">New Email Address (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted/60" size={14} />
                        <input
                          type="email"
                          placeholder="Leave empty unless changing email..."
                          value={securityNewEmail}
                          onChange={(e) => setSecurityNewEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1.5">New Password (Optional)</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted/60" size={14} />
                        <input
                          type="password"
                          placeholder="Leave empty unless changing password..."
                          value={securityNewPassword}
                          onChange={(e) => setSecurityNewPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/50"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={securityLoading}
                    className="w-full py-3 bg-theme-accent text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {securityLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Updating Credentials...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Apply Security Rotation
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Backup Admin Delegation Card */}
              <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-md space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted flex items-center gap-1.5">
                      <Users size={12} className="text-indigo-500" /> Administrative Access
                    </span>
                    <h4 className="text-xl font-black text-theme-text mt-1">Backup Admin Delegation</h4>
                    <p className="text-[11px] text-theme-muted mt-1 leading-relaxed">
                      Designate registered users as backup administrators. Backup admins can review payments, modify questions, and edit system configs.
                    </p>
                  </div>

                  {/* Add Backup Admin Form */}
                  <form onSubmit={handleAddBackupAdmin} className="space-y-3 bg-theme-bg p-5 rounded-2xl border border-theme-border/50">
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-wider">
                      Designate Backup Admin (by Email)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted/60" size={14} />
                        <input
                          type="email"
                          placeholder="Enter user's registered email..."
                          value={backupEmailInput}
                          onChange={(e) => setBackupEmailInput(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/20 placeholder-theme-muted/50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={backupLoading}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
                      >
                        {backupLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Promote
                      </button>
                    </div>
                    <span className="text-[9px] text-theme-muted block leading-relaxed italic">
                      * The backup user must have registered an account on this system first before they can be promoted.
                    </span>
                  </form>

                  {/* List of current administrators */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-theme-muted flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" /> Active Administrators ({profiles.filter(p => p.role === 'admin' || p.email?.toLowerCase().trim() === 'eemmpatech@gmail.com').length})
                    </h5>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                      {profiles.filter(p => p.role === 'admin' || p.email?.toLowerCase().trim() === 'eemmpatech@gmail.com').map((adm) => {
                        const isMaster = adm.email?.toLowerCase().trim() === 'eemmpatech@gmail.com';
                        const isSelf = adm.id === auth.currentUser?.uid;
                        
                        return (
                          <div key={adm.id || adm.email} className="flex items-center justify-between p-3.5 bg-theme-bg/60 rounded-xl border border-theme-border/60 hover:border-theme-accent/10 transition-all">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent border border-theme-accent/10 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                {adm.profileImage ? (
                                  <img src={adm.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  (adm.fullName || adm.nickname || adm.email || 'A').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold text-theme-text flex items-center gap-1.5 truncate">
                                  {adm.fullName || adm.nickname || 'Admin Account'}
                                  {isMaster && (
                                    <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-widest leading-none">
                                      Owner
                                    </span>
                                  )}
                                </h6>
                                <span className="text-[9px] text-theme-muted block truncate font-mono">{adm.email || 'System Owner'}</span>
                              </div>
                            </div>

                            {!isMaster && !isSelf && (
                              <button
                                onClick={() => handleDemoteAdmin(adm.id, adm.email)}
                                className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-rose-500 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 rounded-lg transition-all shrink-0"
                                title="Demote Administrator to normal User"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-theme-border/50 pt-4 text-[10px] text-theme-muted leading-relaxed flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Backup admins have fully replicated operational rights except they cannot demote or delete the master system owner account. Always review your backup list to maintain tight workspace control.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY & E-BOOKS MANAGEMENT TAB */}
        {tab === 'library' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">
                  JeeRaf Admin Control
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                  {adminLibraryBooks.length} Admin Uploaded Books
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Digital Library & E-Book Repository Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                Upload and organize academic textbooks, university study guides, professional exam materials, and PDF/DOC/TXT files for students across <strong>National</strong>, <strong>Higher Ed & STEM</strong>, and <strong>General</strong> sections.
              </p>
            </div>

            {/* Book Upload Form */}
            <div className="bg-theme-card border border-theme-border p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
              <div className="border-b border-theme-border pb-4">
                <h3 className="text-lg font-black text-theme-text flex items-center gap-2">
                  <Plus size={20} className="text-amber-500" />
                  <span>Upload New Book or Academic Study File</span>
                </h3>
                <p className="text-xs text-theme-muted mt-1">
                  All uploaded books sync automatically to the live user library database in real-time.
                </p>
              </div>

              <form onSubmit={handleUploadLibraryBook} className="space-y-5">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Library Section *
                    </label>
                    <select
                      value={uploadBookSection}
                      onChange={(e) => setUploadBookSection(e.target.value as any)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-black text-theme-text focus:border-amber-500 outline-none"
                    >
                      <option value="national">National Curricula & Exams</option>
                      <option value="universal">Higher Ed, STEM & Global Standards</option>
                      <option value="general">General Literature & Reference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Standard Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Advanced Physics & Engineering 2026"
                      value={uploadBookTitle}
                      onChange={(e) => setUploadBookTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Author / Publisher Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. A. Johnson / JeeRaf Faculty"
                      value={uploadBookAuthor}
                      onChange={(e) => setUploadBookAuthor(e.target.value)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Subject Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science, Medicine, Law, Physics"
                      value={uploadBookSubject}
                      onChange={(e) => setUploadBookSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Exam Target / Grade Level
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. University Semester / Professional Certification / National Exam"
                      value={uploadBookExamTarget}
                      onChange={(e) => setUploadBookExamTarget(e.target.value)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Book Access Format
                    </label>
                    <select
                      value={uploadBookFormat}
                      onChange={(e) => setUploadBookFormat(e.target.value as any)}
                      className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-black text-theme-text focus:border-amber-500 outline-none"
                    >
                      <option value="both">Read Online & External Download</option>
                      <option value="electronic">Read Online Only (E-Book Reader)</option>
                      <option value="file">External File Download Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                    Book Summary / Syllabus Outline
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a detailed outline or description of this textbook..."
                    value={uploadBookDescription}
                    onChange={(e) => setUploadBookDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-2xl text-xs font-medium text-theme-text focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Cover Image Input Section */}
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-amber-400">
                      Book Cover Image (Upload File or Paste Image URL)
                    </label>
                    {uploadBookCoverImage && (
                      <button
                        type="button"
                        onClick={() => setUploadBookCoverImage('')}
                        className="text-[10px] font-bold text-rose-400 hover:underline"
                      >
                        Remove Cover Image
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const imgFile = e.target.files?.[0];
                          if (imgFile) {
                            try {
                              const compressed = await compressCoverImage(imgFile);
                              if (compressed) {
                                setUploadBookCoverImage(compressed);
                              }
                            } catch (err) {
                              console.warn("Cover image process note:", err);
                            }
                          }
                        }}
                        className="w-full text-xs text-theme-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500/20 file:text-amber-400 border border-theme-border rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="Or paste cover image URL (e.g. https://.../cover.jpg)"
                        value={uploadBookCoverImage.startsWith('data:') ? '' : uploadBookCoverImage}
                        onChange={(e) => setUploadBookCoverImage(e.target.value)}
                        className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {uploadBookCoverImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={uploadBookCoverImage}
                        alt="Book Cover Thumbnail"
                        className="w-12 h-16 object-cover rounded-lg border border-amber-500/30 shadow"
                      />
                      <span className="text-[11px] text-emerald-400 font-bold">
                        ✓ Cover image preview ready for search results
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Option A: Upload PDF / DOCX / TXT file */}
                  <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-2">
                    <label className="block text-xs font-black text-amber-400">
                      Option A: Upload File (PDF, DOCX, TXT)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadFileObject(file);
                          setExtractingFile(true);

                          // Auto-fill Title if empty
                          if (!uploadBookTitle.trim()) {
                            const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
                            setUploadBookTitle(rawName);
                          }

                          try {
                            const extracted = await extractBookContentFromFile(file);
                            setUploadExtractedData(extracted);
                          } catch (extErr) {
                            console.warn("Extraction note:", extErr);
                          } finally {
                            setExtractingFile(false);
                          }

                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setUploadFileDataUrl(ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-theme-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                    {extractingFile && (
                      <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        Extracting pages, text, and chapters from document...
                      </p>
                    )}
                    {uploadFileObject && !extractingFile && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={12} />
                          Selected: {uploadFileObject.name} ({(uploadFileObject.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                        {uploadExtractedData && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            ✓ {uploadExtractedData.chapters.length} chapter/page sections ready for Reader Mode and direct download!
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option B: Electronic Book Text / Chapters */}
                  <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-2">
                    <label className="block text-xs font-black text-amber-400">
                      Option B: Paste E-Book Full Content / Chapters
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Paste electronic chapter text or book content for reading inside the JeeRaf E-Reader..."
                      value={uploadBookChapters}
                      onChange={(e) => setUploadBookChapters(e.target.value)}
                      className="w-full p-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-mono text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Real-time Search & Display Preview Box */}
                <div className="bg-theme-bg border-2 border-amber-500/30 p-5 rounded-3xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border pb-3">
                    <div className="flex items-center gap-2">
                      <Search size={16} className="text-amber-500" />
                      <span className="text-xs font-black text-theme-text uppercase tracking-wider">
                        Live Search & User Card Display Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Real-time Verification
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest">
                      Simulate User Search Input:
                    </label>
                    <input
                      type="text"
                      placeholder="Type keywords (e.g. Physics, Ababio, JAMB)..."
                      value={previewSearchQuery}
                      onChange={(e) => setPreviewSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-theme-card border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* Preview Book Card */}
                  <div className="bg-theme-card border border-theme-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      {uploadBookCoverImage ? (
                        <img
                          src={uploadBookCoverImage}
                          alt="Cover"
                          className="w-14 h-20 object-cover rounded-xl border border-theme-border shadow"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center p-1 text-center">
                          <BookOpen size={20} className="text-amber-400" />
                          <span className="text-[8px] font-black uppercase text-amber-400 mt-1">
                            {uploadBookSection}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-black uppercase">
                            {uploadBookSection}
                          </span>
                          {uploadBookSubject && (
                            <span className="px-2 py-0.5 bg-theme-bg text-theme-text border border-theme-border rounded-md text-[9px] font-bold">
                              {uploadBookSubject}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase">
                            {uploadBookFormat === 'electronic' ? 'E-Book' : uploadBookFormat === 'file' ? 'PDF File' : 'E-Book & PDF'}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-theme-text leading-tight">
                          {uploadBookTitle || 'Untitled Book'}
                        </h4>
                        <p className="text-xs text-theme-muted font-medium">
                          By {uploadBookAuthor || 'Unknown Author'} • {uploadBookExamTarget || 'General'}
                        </p>

                        {/* Search Match Status */}
                        {previewSearchQuery.trim() && (
                          <div className="pt-1">
                            {[uploadBookTitle, uploadBookAuthor, uploadBookSubject, uploadBookExamTarget, uploadBookSection, uploadBookDescription]
                              .some(txt => txt.toLowerCase().includes(previewSearchQuery.toLowerCase())) ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                ✓ Search Match Confirmed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                ℹ No match for current search query
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                      <div className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl text-center">
                        Read Online
                      </div>
                      <div className="px-3 py-1.5 bg-theme-bg border border-theme-border text-theme-text font-bold text-xs rounded-xl text-center">
                        Download PDF
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingBook}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Plus size={18} />
                  <span>{uploadingBook ? 'Uploading to Library Database...' : 'Upload & Publish Book to Live Library'}</span>
                </button>
              </form>
            </div>

            {/* List of Managed Admin & System Library Books */}
            <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-border pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-theme-text flex items-center gap-2">
                    <Library size={18} className="text-amber-500" />
                    <span>
                      Managed Library Catalog ({
                        (() => {
                          const m = new Map<string, any>();
                          ALL_BUILTIN_BOOKS.forEach(b => {
                            if (!deletedBookIds.includes(b.id)) m.set(b.id, b);
                          });
                          adminLibraryBooks.forEach(b => {
                            if (!deletedBookIds.includes(b.id)) m.set(b.id, b);
                          });
                          return m.size;
                        })()
                      } Active Books)
                    </span>
                  </h3>
                  <p className="text-[11px] text-theme-muted font-medium">
                    Manage, edit content, replace files, and remove books in real time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                    <input
                      type="text"
                      placeholder="Search managed books..."
                      value={adminLibrarySearch}
                      onChange={(e) => setAdminLibrarySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-theme-bg border border-theme-border rounded-xl text-xs text-theme-text placeholder:text-theme-muted focus:border-amber-500 outline-none w-48 sm:w-60"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto">
                    {['national', 'universal', 'general'].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setLibrarySectionTab(sec as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all shrink-0 ${
                          librarySectionTab === sec
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-theme-bg border border-theme-border text-theme-muted hover:text-theme-text'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const bookMap = new Map<string, any>();
                ALL_BUILTIN_BOOKS.forEach(b => {
                  if (!deletedBookIds.includes(b.id)) {
                    bookMap.set(b.id, b);
                  }
                });
                adminLibraryBooks.forEach(b => {
                  if (!deletedBookIds.includes(b.id)) {
                    bookMap.set(b.id, b);
                  }
                });

                let list = Array.from(bookMap.values()).filter(b => b.section === librarySectionTab);
                if (adminLibrarySearch.trim()) {
                  const q = adminLibrarySearch.toLowerCase().trim();
                  list = list.filter(b => 
                    b.title?.toLowerCase().includes(q) ||
                    b.author?.toLowerCase().includes(q) ||
                    b.subject?.toLowerCase().includes(q) ||
                    b.examTarget?.toLowerCase().includes(q) ||
                    b.description?.toLowerCase().includes(q)
                  );
                }

                if (list.length === 0) {
                  return (
                    <div className="text-center py-10 text-xs text-theme-muted font-bold">
                      {adminLibrarySearch.trim()
                        ? `No books match "${adminLibrarySearch}" in the ${librarySectionTab.toUpperCase()} section.`
                        : `No books found in the ${librarySectionTab.toUpperCase()} section.`}
                    </div>
                  );
                }

                return (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((bk) => (
                      <div
                        key={bk.id}
                        className="bg-theme-bg p-4 rounded-2xl border border-theme-border hover:border-amber-500/40 flex flex-col justify-between space-y-3 transition-all shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            {bk.coverImage ? (
                              <img
                                src={bk.coverImage}
                                alt={bk.title}
                                className="w-12 h-16 object-cover rounded-xl border border-theme-border shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                                <BookOpen size={20} />
                              </div>
                            )}

                            <div className="space-y-1 min-w-0 flex-1">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md inline-block">
                                {bk.subject || bk.section}
                              </span>
                              <h4 className="text-sm font-black text-theme-text line-clamp-1">{bk.title}</h4>
                              <p className="text-xs text-theme-muted font-medium truncate">By {bk.author}</p>
                            </div>
                          </div>

                          <p className="text-[11px] text-theme-muted line-clamp-2 font-medium">{bk.description}</p>
                        </div>

                        <div className="pt-2 border-t border-theme-border flex items-center justify-between">
                          <span className="text-[10px] text-theme-muted font-mono font-bold">
                            {bk.fileType?.toUpperCase() || 'PDF/TXT'} • {bk.fileSize || '2.0 MB'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setAdminPreviewBook(bk)}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-all text-xs font-black flex items-center gap-1"
                              title="Preview full book in reader / PDF viewer"
                            >
                              <Eye size={13} />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditBook(bk)}
                              className="px-2 py-1 text-theme-muted hover:text-theme-text hover:bg-theme-card border border-theme-border rounded-lg transition-all text-xs font-black flex items-center gap-1"
                              title="Edit title, author, cover, or file"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteLibraryBook(bk.id, bk.title, bk.storageKey)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete book from library"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {/* Edit Library Book Modal */}
        {isEditBookModalOpen && editingBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsEditBookModalOpen(false);
              setEditingBook(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-theme-border pb-4">
                <div>
                  <h3 className="text-lg font-black text-theme-text flex items-center gap-2">
                    <Edit3 size={20} className="text-amber-500" />
                    <span>Edit & Rename Library Book</span>
                  </h3>
                  <p className="text-xs text-theme-muted mt-0.5">
                    ID: {editingBook.id} • Updates save to live user library in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditBookModalOpen(false);
                    setEditingBook(null);
                  }}
                  className="text-theme-muted hover:text-theme-text p-2 rounded-xl transition-all"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedBook} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Library Section
                    </label>
                    <select
                      value={editingBook.section || 'general'}
                      onChange={(e) => setEditingBook({ ...editingBook, section: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-black text-theme-text focus:border-amber-500 outline-none"
                    >
                      <option value="national">National Curricula & Exams</option>
                      <option value="universal">Higher Ed, STEM & Global Standards</option>
                      <option value="general">General Literature & Reference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBook.title || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBook.author || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={editingBook.subject || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, subject: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Target Audience / Exam
                    </label>
                    <input
                      type="text"
                      value={editingBook.examTarget || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, examTarget: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                      Format Mode
                    </label>
                    <select
                      value={editingBook.format || 'both'}
                      onChange={(e) => setEditingBook({ ...editingBook, format: e.target.value })}
                      className="w-full px-3 py-2.5 bg-theme-bg border border-theme-border rounded-xl text-xs font-black text-theme-text focus:border-amber-500 outline-none"
                    >
                      <option value="both">Read Online & External Download</option>
                      <option value="electronic">Read Online Only</option>
                      <option value="file">File Download Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                    Book Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingBook.description || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    className="w-full p-3 bg-theme-bg border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Change Cover Image */}
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-3">
                  <label className="block text-xs font-black text-amber-400">
                    Change Book Cover Image
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressCoverImage(file);
                            if (compressed) {
                              setEditingBook({ ...editingBook, coverImage: compressed });
                            }
                          } catch (err) {
                            console.warn("Edit cover process note:", err);
                          }
                        }
                      }}
                      className="w-full text-xs text-theme-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500/20 file:text-amber-400 border border-theme-border rounded-xl cursor-pointer"
                    />

                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={editingBook.coverImage?.startsWith('data:') ? '' : editingBook.coverImage || ''}
                      onChange={(e) => setEditingBook({ ...editingBook, coverImage: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-xl text-xs font-medium text-theme-text focus:border-amber-500 outline-none"
                    />
                  </div>

                  {editingBook.coverImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={editingBook.coverImage}
                        alt="Preview"
                        className="w-12 h-16 object-cover rounded-lg border border-amber-500/30"
                      />
                      <span className="text-xs text-emerald-400 font-bold">✓ Cover image updated</span>
                    </div>
                  )}
                </div>

                {/* Change Attached PDF / File */}
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border space-y-2">
                  <label className="block text-xs font-black text-amber-400">
                    Replace PDF / E-Book File Attachment (Up to 100MB+)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditFileObject(file);
                      }
                    }}
                    className="w-full text-xs text-theme-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-950 cursor-pointer"
                  />
                  {editFileObject && (
                    <p className="text-xs text-emerald-400 font-bold">
                      New file selected: {editFileObject.name} ({(editFileObject.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Chapter Content / Electronic Text */}
                <div>
                  <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">
                    E-Reader Full Chapter Text
                  </label>
                  <textarea
                    rows={4}
                    value={editingBook.chaptersText || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, chaptersText: e.target.value })}
                    className="w-full p-3 bg-theme-bg border border-theme-border rounded-xl text-xs font-mono text-theme-text focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-theme-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditBookModalOpen(false);
                      setEditingBook(null);
                    }}
                    className="px-5 py-2.5 bg-theme-bg border border-theme-border text-theme-text font-bold text-xs rounded-xl hover:bg-theme-card"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingEditBook}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{savingEditBook ? 'Saving Changes...' : 'Save & Publish Updates'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReceipt(null)}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-2 rounded-3xl shadow-2xl relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={selectedReceipt} 
                alt="Payment Receipt" 
                className="w-full rounded-2xl max-h-[70vh] object-contain"
              />
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="absolute -top-12 right-0 text-white font-bold flex items-center gap-2 hover:text-slate-300"
              >
                Close <XCircle size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Create / Edit Question Modal */}
        {isEditModalOpen && editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingQuestion(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-theme-text uppercase tracking-wider flex items-center gap-2">
                    {editingQuestion.id ? (
                      <>
                        <Edit3 size={18} className="text-amber-500" /> Edit Question Details
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="text-theme-accent" /> Create New Question
                      </>
                    )}
                  </h3>
                  <p className="text-[10px] text-theme-muted mt-1">
                    {editingQuestion.id ? "Modify existing CBT question parameters" : "Add a brand-new manually formulated question"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingQuestion(null);
                  }}
                  className="text-theme-muted hover:text-theme-text transition-all"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestionFromModal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">CBT Exam Type</label>
                    <select
                      value={editingQuestion.examType}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, examType: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
                    >
                      {['JAMB', 'WAEC', 'NECO', 'WAEC GCE', 'NECO GCE', 'Personal CBT'].map(et => (
                        <option key={et} value={et}>{et}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">Subject</label>
                    <select
                      value={editingQuestion.subject}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs font-bold text-theme-text focus:outline-none"
                    >
                      {['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'Commerce', 'Accounting', 'Agricultural Science', 'Civic Education', 'Further Mathematics', 'History', 'CRK', 'IRK', 'Yoruba', 'Hausa', 'Igbo', 'French', 'General'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Comprehension Passage (Optional)</label>
                  <textarea
                    value={editingQuestion.passage || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, passage: e.target.value })}
                    placeholder="If this question belongs to a comprehension passage, paste the passage here..."
                    rows={2}
                    className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Question Text</label>
                  <textarea
                    required
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    placeholder="Type the question text..."
                    rows={3}
                    className="w-full px-4 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider">Options (All 4 options required)</label>
                  {editingQuestion.options.map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6">{String.fromCharCode(65 + idx)}.</span>
                      <input
                        required
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...editingQuestion.options];
                          opts[idx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: opts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className="flex-1 px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-xs focus:outline-none text-theme-text"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Correct Answer Index</label>
                    <select
                      value={editingQuestion.correctAnswer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text font-bold"
                    >
                      <option value={0}>A is Correct</option>
                      <option value={1}>B is Correct</option>
                      <option value={2}>C is Correct</option>
                      <option value={3}>D is Correct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Topic</label>
                    <input
                      type="text"
                      value={editingQuestion.topic || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                      placeholder="e.g. Algebra"
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Difficulty</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Exam Year</label>
                    <input
                      type="number"
                      value={editingQuestion.year}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-theme-muted uppercase tracking-wider mb-1">Answer Explanation</label>
                  <textarea
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Provide explanatory context for correct solution..."
                    rows={2}
                    className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-xl text-xs focus:outline-none text-theme-text"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-theme-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingQuestion(null);
                    }}
                    className="px-5 py-2.5 bg-theme-bg border border-theme-border text-theme-text text-xs font-bold rounded-xl hover:bg-theme-bg/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuestions}
                    className="px-6 py-2.5 bg-theme-accent text-white text-xs font-bold rounded-xl hover:bg-theme-accent/90 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    {savingQuestions ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {editingQuestion.id ? "Update Question" : "Create Question"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Live Admin Library Book Reader Preview Modal */}
        {adminPreviewBook && (
          <BookReaderModal
            book={adminPreviewBook}
            initialMode="read"
            onClose={() => setAdminPreviewBook(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
