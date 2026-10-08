/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Welcome } from './components/Welcome';
import { Auth } from './components/Auth';
import { ExamTypeSelection } from './components/ExamTypeSelection';
import { PersonalCBTReady } from './components/PersonalCBTReady';
import { Dashboard } from './components/Dashboard';
import { CBTInterface } from './components/CBTInterface';
import { CBTExamConfigPage } from './components/CBTExamConfigPage';
import { ExamIntermissionBreak } from './components/ExamIntermissionBreak';
import { ResultDashboard } from './components/ResultDashboard';
import { ProgressTracker } from './components/ProgressTracker';
import { questions as allQuestions } from './data/questions';
import { Subject, Question, QuizResult, ExamType, ExamSessionConfig } from './types';
import { auth, db } from './firebase';
import { getStandardLimit, STANDARD_NATIONAL_EXAM_YEARS, normalizeQuestion } from './data/lib/utils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { SubscriptionLock } from './components/SubscriptionLock';
import { SidebarMenu } from './components/SidebarMenu';
import { TextbookSelection } from './components/TextbookSelection';
import { AdminConsole } from './components/AdminConsole';
import { SubscriptionPortal } from './components/SubscriptionPortal';
import { JeeRafAIPage } from './components/JeeRafAIPage';
import { WebBrowserPage } from './components/WebBrowserPage';
import { MainDirectoryDashboard } from './components/MainDirectoryDashboard';
import { AudioWorkstation } from './components/AudioWorkstation';
import { FileUploadPage } from './components/FileUploadPage';
import { motion, AnimatePresence } from 'motion/react';
import { GoldSpinner, JeeRafLogoWithName } from './components/AIAvatar';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type AppState = 
  | 'welcome' 
  | 'auth' 
  | 'exam_select' 
  | 'cbt_config'
  | 'cbt_subjects'
  | 'personal_ready' 
  | 'dashboard' 
  | 'cbt' 
  | 'exam_intermission'
  | 'result' 
  | 'progress' 
  | 'textbooks' 
  | 'admin_console' 
  | 'subscription_portal'
  | 'system_ai'
  | 'browser'
  | 'audio'
  | 'file_upload';

export const getPathFromState = (s: AppState): string => {
  switch (s) {
    case 'dashboard': return '/';
    case 'exam_select': return '/cbt/select';
    case 'cbt_config': return '/cbt/config';
    case 'cbt_subjects': return '/cbt';
    case 'personal_ready': return '/cbt/ready';
    case 'cbt': return '/cbt/exam';
    case 'exam_intermission': return '/cbt/break';
    case 'result': return '/cbt/results';
    case 'system_ai': return '/ai';
    case 'browser': return '/browser';
    case 'textbooks': return '/library';
    case 'progress': return '/progress';
    case 'subscription_portal': return '/subscription';
    case 'admin_console': return '/admin';
    case 'audio': return '/audio';
    case 'file_upload': return '/file-upload';
    default: return '/';
  }
};

export const getStateFromPath = (path: string): AppState | null => {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '' || clean === '/') return 'dashboard';
  if (clean === '/cbt/select') return 'exam_select';
  if (clean === '/cbt/config' || clean === '/cbt/setup') return 'cbt_config';
  if (clean === '/cbt' || clean === '/cbt/practice' || clean === '/cbt/subjects') return 'cbt_subjects';
  if (clean === '/cbt/ready') return 'personal_ready';
  if (clean === '/cbt/exam') return 'cbt';
  if (clean === '/cbt/break') return 'exam_intermission';
  if (clean === '/cbt/results' || clean === '/results') return 'result';
  if (clean === '/ai' || clean === '/chat') return 'system_ai';
  if (clean === '/browser') return 'browser';
  if (clean === '/library' || clean === '/books' || clean === '/textbooks') return 'textbooks';
  if (clean === '/progress' || clean === '/stats') return 'progress';
  if (clean === '/subscription' || clean === '/plans') return 'subscription_portal';
  if (clean === '/admin') return 'admin_console';
  if (clean === '/audio') return 'audio';
  if (clean === '/file-upload' || clean === '/upload') return 'file_upload';
  return null;
};

export default function App() {
  const [splashStage, setSplashStage] = useState<'image3' | 'done'>('image3');
  const [state, setState] = useState<AppState>('auth');
  const [browserUrl, setBrowserUrl] = useState<string>('https://www.bing.com');
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentDuration, setCurrentDuration] = useState<number>(60);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [usedPassages, setUsedPassages] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [adminQuestions, setAdminQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Show splash (JeeRaf Logo With Name) for 3.5 seconds
    const timer = setTimeout(() => {
      setSplashStage('done');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Preserve initial intended URL if user arrives at a deep link while unauthenticated
    // Strict Shield: If anyone visits /admin while unauthenticated, wipe immediately and never store
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/' && currentPath !== '') {
      if (currentPath.toLowerCase() === '/admin') {
        window.history.replaceState(null, '', '/');
      } else {
        sessionStorage.setItem('intended_path', currentPath);
      }
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setIsLocked(false);
        setProfileLoading(false);
        // Automatically sanitize /admin from URL if logged out
        if (window.location.pathname.toLowerCase() === '/admin') {
          window.history.replaceState(null, '', '/');
        }
      } else {
        const emailClean = firebaseUser.email?.toLowerCase().trim();
        const isAdmin = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com';

        const intended = sessionStorage.getItem('intended_path') || window.location.pathname;
        let pathTarget = getStateFromPath(intended);

        // Strict shield: non-admin users attempting /admin are deflected immediately to dashboard
        if (pathTarget === 'admin_console' && !isAdmin) {
          sessionStorage.removeItem('intended_path');
          window.history.replaceState(null, '', '/');
          pathTarget = 'dashboard';
        }

        setState(prevState => {
          if (prevState === 'auth' || prevState === 'welcome') {
            if (pathTarget && pathTarget !== 'auth' && pathTarget !== 'welcome') {
              sessionStorage.removeItem('intended_path');
              const targetUrl = getPathFromState(pathTarget);
              if (window.location.pathname !== targetUrl) {
                window.history.replaceState(null, '', targetUrl);
              }
              return pathTarget;
            }
            return 'dashboard';
          }
          return prevState;
        });
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Listen to browser Back/Forward (and Android Capacitor Back Button) to sync state
  useEffect(() => {
    const handlePopState = () => {
      const cleanPath = window.location.pathname.toLowerCase();
      if (cleanPath === '/admin') {
        const emailClean = user?.email?.toLowerCase().trim();
        const isAdmin = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profile?.role === 'admin';
        if (!isAdmin) {
          window.history.replaceState(null, '', '/');
          setState('dashboard');
          return;
        }
      }
      const target = getStateFromPath(window.location.pathname);
      if (target) {
        setState(target);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, profile]);

  // Safety Timeout for Profile Syncing
  useEffect(() => {
    if (profileLoading) {
      const timer = setTimeout(() => {
        setProfileLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [profileLoading]);

  // Subscription & Trial Listener
  useEffect(() => {
    if (user && db) {
      setProfileLoading(true);
      const profileRef = doc(db, 'sib_profiles', user.uid);
      
      const unsubscribe = onSnapshot(profileRef, (snapshot) => {
        if (snapshot.exists()) {
          const profileData = snapshot.data();
          
          // Check for admin email
          const emailClean = user.email?.toLowerCase().trim();
          const isAdminEmail = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profileData.role === 'admin';
          
          // Unblock all users per specification: free lifetime access to all platform and AI features
          profileData.isPremium = true;
          profileData.subscriptionStatus = 'paid';
          profileData.plan = 'unlimited_pro';
          if (isAdminEmail) {
            profileData.role = 'admin';
          }
          setIsLocked(false);
          setProfile(profileData);
          setProfileLoading(false);
        } else {
          // If no profile exists (legacy users), create one with full unlocked access
          const emailClean = user.email?.toLowerCase().trim();
          const isAdminEmail = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com';
          
          setDoc(profileRef, {
            uid: user.uid,
            email: user.email,
            subscriptionStatus: 'paid',
            plan: 'unlimited_pro',
            isSubscribed: true,
            isPremium: true,
            role: isAdminEmail ? 'admin' : 'user',
            theme: 'white',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true }).catch((err) => {
            console.error("Profile creation failed:", err);
          }).finally(() => {
            setProfileLoading(false);
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `sib_profiles/${user.uid}`);
        setProfileLoading(false);
      });

      return () => unsubscribe();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  // Load Admin/Added Questions from Firestore
  useEffect(() => {
    if (!user || !db) return;
    const questionsRef = collection(db, 'sib_questions');
    const unsubscribe = onSnapshot(questionsRef, (snapshot) => {
      const qList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Question[];
      setAdminQuestions(qList);
    }, (error) => {
      console.error("Error subscribing to sib_questions:", error);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user && db) {
      const resultsRef = collection(db, 'sib_results');
      const q = query(resultsRef, where('userId', '==', user.uid), where('subject', '==', 'English'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => doc.data() as QuizResult);
        const seenQuestionIds = new Set(history.flatMap(h => h.answers.map(a => a.questionId)));
        
        // Find passages associated with these questions
        const seenPassages = new Set<string>();
        allQuestions.forEach(q => {
          if (seenQuestionIds.has(q.id) && q.section === 'Comprehension' && q.passage) {
            seenPassages.add(q.passage);
          }
        });
        
        setUsedPassages(Array.from(seenPassages));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'results');
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    // Initial theme hydration from localStorage or profile
    const savedTheme = localStorage.getItem('jeeraf_theme') || localStorage.getItem('zeeraf_theme') || profile?.theme || 'white';
    document.documentElement.className = savedTheme === 'white' ? '' : `theme-${savedTheme}`;

    const handleThemeChange = (e: any) => {
      const newTheme = e.detail;
      if (newTheme) {
        document.documentElement.className = newTheme === 'white' ? '' : `theme-${newTheme}`;
      }
    };
    window.addEventListener('jeeraf-theme-change', handleThemeChange);
    window.addEventListener('zeeraf-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('jeeraf-theme-change', handleThemeChange);
      window.removeEventListener('zeeraf-theme-change', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    // Sync theme with profile preference
    if (profile?.theme) {
      localStorage.setItem('jeeraf_theme', profile.theme);
      document.documentElement.className = profile.theme === 'white' ? '' : `theme-${profile.theme}`;
    }
  }, [profile?.theme]);

  // Presence Tracking
  useEffect(() => {
    if (!user || !db) return;
    
    const updatePresence = async () => {
      try {
        const profileRef = doc(db, 'sib_profiles', user.uid);
        await updateDoc(profileRef, {
          lastSeen: serverTimestamp()
        });
      } catch (err) {
        // Silent fail for presence
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 120000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Handle Disabled Users
  useEffect(() => {
    if (profile?.isDisabled) {
      handleLogout();
    }
  }, [profile?.isDisabled]);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    return new Error(JSON.stringify(errInfo));
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    const intended = sessionStorage.getItem('intended_path') || window.location.pathname;
    const targetState = getStateFromPath(intended);
    if (targetState && targetState !== 'auth' && targetState !== 'welcome') {
      sessionStorage.removeItem('intended_path');
      navigateToState(targetState);
    } else {
      navigateToState('dashboard');
    }
  };

  const handleExamTypeSelect = (type: ExamType, questions?: Question[], preferredDuration?: number) => {
    setSelectedExamType(type);
    if (questions) {
      setCustomQuestions(questions);
    } else {
      setCustomQuestions([]);
    }
    if (preferredDuration) {
      setCurrentDuration(preferredDuration);
    }
    
    if (type === 'Personal CBT') {
      setState('personal_ready');
    } else {
      setState('cbt_config');
    }
  };

  // Advanced Exam / Merged & Continuation State
  const [examSessionConfig, setExamSessionConfig] = useState<ExamSessionConfig | null>(null);
  const [continuationPart, setContinuationPart] = useState<1 | 2>(1);
  const [continuationPart1Questions, setContinuationPart1Questions] = useState<Question[]>([]);
  const [continuationPart2Questions, setContinuationPart2Questions] = useState<Question[]>([]);
  const [continuationPart1Answers, setContinuationPart1Answers] = useState<Record<string, number | null>>({});
  const [continuationPart1TheoryAnswers, setContinuationPart1TheoryAnswers] = useState<Record<string, string>>({});
  const [continuationPart1TimeTaken, setContinuationPart1TimeTaken] = useState<number>(0);
  const [intermissionBreakMinutes, setIntermissionBreakMinutes] = useState<number>(15);
  const [nextPaperTitle, setNextPaperTitle] = useState<string>('');

  const handleStartAdvancedExam = (config: ExamSessionConfig) => {
    setExamSessionConfig(config);
    const combinedQuestions = [...allQuestions, ...adminQuestions];
    
    // Helper to get questions for a given subject
    const getQuestionsForSubject = (subj: Subject) => {
      const targetSubj = String(subj || '').trim().toLowerCase();
      const targetExam = String(config.examType || '').trim().toUpperCase();
      const targetYear = config.selectedYear ? Number(config.selectedYear) : null;

      let filtered = combinedQuestions.filter(q => {
        const qSubj = String(q.subject || '').trim().toLowerCase();
        const qExam = String(q.examType || '').trim().toUpperCase();
        const qYear = Number(q.year);

        const subjMatch = qSubj === targetSubj;
        const examMatch = qExam === targetExam;
        const yearMatch = config.practiceMode === 'yearly' && targetYear ? qYear === targetYear : true;

        return subjMatch && examMatch && yearMatch;
      });

      if (filtered.length === 0 && config.practiceMode === 'random') {
        filtered = combinedQuestions.filter(q => {
          const qSubj = String(q.subject || '').trim().toLowerCase();
          const qExam = String(q.examType || '').trim().toUpperCase();
          return qSubj === targetSubj && qExam === targetExam;
        });
      }
      return filtered.map(normalizeQuestion);
    };

    // Reorder subjects in merged mode so candidate's chosen startingSubject is first
    const orderedSubjects = (config.timingMode === 'merged' && config.startingSubject && config.subjects.includes(config.startingSubject))
      ? [config.startingSubject, ...config.subjects.filter(s => s !== config.startingSubject)]
      : config.subjects;

    if (config.paperFormat === 'both_continuation') {
      // Gather questions across the selected subjects in proper starting order
      let allSelectedQuestions: Question[] = [];
      orderedSubjects.forEach(subj => {
        allSelectedQuestions.push(...getQuestionsForSubject(subj));
      });

      if (allSelectedQuestions.length === 0) {
        alert(`No questions found for ${config.examType} - ${config.subjects.join(', ')}.`);
        return;
      }

      // Separate into Objectives and Theory
      let objQuestions = allSelectedQuestions.filter(q => q.type !== 'theory' && q.section !== 'Theory' && q.options && q.options.length > 0);
      let theoryQuestions = allSelectedQuestions.filter(q => q.type === 'theory' || q.section === 'Theory' || !q.options || q.options.length === 0);

      // If theory questions are scarce, create syllabus-grounded theory questions for the subjects
      if (theoryQuestions.length === 0) {
        theoryQuestions = orderedSubjects.map((subj, idx) => ({
          id: `gen-theory-${subj}-${Date.now()}-${idx}`,
          subject: subj,
          examType: config.examType,
          year: config.selectedYear || 2024,
          difficulty: 'Hard',
          section: 'Theory',
          type: 'theory',
          marks: 10,
          question: `**Paper 2: Theory & Essay Section (${subj})**\n\n(a) Clearly state the foundational principles, definitions, and mathematical equations governing this topic in ${subj}.\n\n(b) Write a comprehensive, step-by-step mathematical calculation, analytical reasoning, and proof addressing a practical scenario in this domain.\n\n[Provide full working, units, and clear justifications for full marks.]`,
          options: [],
          correctAnswer: -1,
          explanation: `**Model Solution & Marking Scheme for ${subj}:**\n1. Definition and principles correctly stated with appropriate scientific/technical vocabulary (3 Marks).\n2. Formula substitution and algebraic manipulations correctly presented (4 Marks).\n3. Accurate final computation with correct SI units and conclusion (3 Marks).`,
          modelAnswer: `Full detailed theoretical explanation and step-by-step calculations with proper units.`,
          topic: `${subj} Core Theory`
        }));
      }

      const isTheoryFirst = config.continuationOrder === 'theory_first';
      const part1 = isTheoryFirst ? theoryQuestions : objQuestions;
      const part2 = isTheoryFirst ? objQuestions : theoryQuestions;
      const nextTitle = isTheoryFirst ? 'Paper 1: Objective Multiple-Choice Questions' : 'Paper 2: Theory & Essay Questions';

      setContinuationPart(1);
      setContinuationPart1Questions(part1);
      setContinuationPart2Questions(part2);
      setContinuationPart1Answers({});
      setContinuationPart1TheoryAnswers({});
      setContinuationPart1TimeTaken(0);
      setNextPaperTitle(nextTitle);
      setIntermissionBreakMinutes(Math.max(5, config.breakDurationMinutes || 5));

      setCurrentSubject(orderedSubjects[0]);
      setCurrentQuestions(part1);
      // Half time for Part 1
      setCurrentDuration(Math.max(15, Math.round(config.durationMinutes / 2)));
      navigateToState('cbt');
      return;
    }

    // Single format: Objectives Only or Theory Only
    let collectedQuestions: Question[] = [];
    if (config.timingMode === 'merged') {
      // Merged national mode: all selected subjects under one unified timer with chosen starting subject first
      orderedSubjects.forEach(subj => {
        let qs = getQuestionsForSubject(subj);
        if (config.paperFormat === 'theory') {
          qs = qs.filter(q => q.type === 'theory' || q.section === 'Theory');
        } else {
          qs = qs.filter(q => q.type !== 'theory' && q.section !== 'Theory');
        }
        collectedQuestions.push(...qs);
      });
    } else {
      // One-by-one mode
      const primarySubject = config.subjects[0] || 'Mathematics';
      let qs = getQuestionsForSubject(primarySubject);
      if (config.paperFormat === 'theory') {
        qs = qs.filter(q => q.type === 'theory' || q.section === 'Theory');
      } else {
        qs = qs.filter(q => q.type !== 'theory' && q.section !== 'Theory');
      }
      collectedQuestions = qs;
    }

    if (collectedQuestions.length === 0) {
      alert(`No practice questions found for ${config.examType} with the selected options.`);
      return;
    }

    setCurrentSubject(orderedSubjects[0] || config.subjects[0]);
    setCurrentQuestions(collectedQuestions);
    setCurrentDuration(config.durationMinutes);
    navigateToState('cbt');
  };

  const handleContinuationSectionComplete = (
    answers: Record<string, number | null>,
    timeTaken: number,
    theoryAnswers?: Record<string, string>
  ) => {
    setContinuationPart1Answers(answers);
    setContinuationPart1TheoryAnswers(theoryAnswers || {});
    setContinuationPart1TimeTaken(timeTaken);
    // Transition to intermission break countdown (min 15 mins)
    navigateToState('exam_intermission');
  };

  const handleCompleteIntermissionBreak = () => {
    // Launch Part 2 of the continuation exam
    setContinuationPart(2);
    setCurrentQuestions(continuationPart2Questions);
    const halfDuration = Math.max(15, Math.round((examSessionConfig?.durationMinutes || 60) / 2));
    setCurrentDuration(halfDuration);
    navigateToState('cbt');
  };

  const handleStartExam = (subject: Subject, duration: number, practiceMode: 'yearly' | 'random' = 'random', selectedYear?: number) => {
    let subjectQuestions: Question[] = [];
    const combinedQuestions = [...allQuestions, ...adminQuestions];
    
    if (selectedExamType === 'Personal CBT') {
      subjectQuestions = [...customQuestions];
    } else {
      const targetSubj = String(subject || '').trim().toLowerCase();
      const targetExam = String(selectedExamType || '').trim().toUpperCase();
      const targetYear = selectedYear ? Number(selectedYear) : null;

      subjectQuestions = combinedQuestions.filter(q => {
        const qSubj = String(q.subject || '').trim().toLowerCase();
        const qExam = String(q.examType || '').trim().toUpperCase();
        const qYear = Number(q.year);

        const subjMatch = qSubj === targetSubj;
        const examMatch = qExam === targetExam;
        const yearMatch = practiceMode === 'yearly' && targetYear ? qYear === targetYear : true;

        return subjMatch && examMatch && yearMatch;
      });
      subjectQuestions = subjectQuestions.map(normalizeQuestion);
    }
    
    if (subjectQuestions.length === 0) {
      alert(`No practice questions are currently loaded for ${selectedExamType} - ${subject}${practiceMode === 'yearly' && selectedYear ? ` (${selectedYear})` : ''}.`);
      return;
    }

    if (practiceMode === 'yearly') {
      subjectQuestions = [...subjectQuestions].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    } else if (subject === 'English' && selectedExamType !== 'Personal CBT') {
      const allComprehension = subjectQuestions.filter(q => q.section === 'Comprehension');
      
      const passagesMap = new Map<string, Question[]>();
      allComprehension.forEach(q => {
        if (q.passage) {
          const existing = passagesMap.get(q.passage) || [];
          passagesMap.set(q.passage, [...existing, q]);
        }
      });
      
      const availablePassages = Array.from(passagesMap.keys()).filter(p => (passagesMap.get(p)?.length || 0) >= 3);
      let filteredPassages = availablePassages.filter(p => !usedPassages.includes(p));
      if (filteredPassages.length === 0) {
        filteredPassages = availablePassages;
      }
      
      const selectedPassage = filteredPassages[Math.floor(Math.random() * filteredPassages.length)];
      const passageQuestions = passagesMap.get(selectedPassage) || [];
      
      const otherSectionsMap = new Map<string, Question[]>();
      subjectQuestions.filter(q => q.section !== 'Comprehension').forEach(q => {
        const section = q.section || 'General';
        const existing = otherSectionsMap.get(section) || [];
        otherSectionsMap.set(section, [...existing, q]);
      });

      const sectionOrder: string[] = ['Lexis and Structure', 'Oral English', 'Word Stress', 'General'];
      const orderedOthers: Question[] = [];
      
      sectionOrder.forEach(section => {
        const sectionQuestions = otherSectionsMap.get(section) || [];
        orderedOthers.push(...sectionQuestions.sort(() => Math.random() - 0.5));
        otherSectionsMap.delete(section);
      });

      otherSectionsMap.forEach(qs => {
        orderedOthers.push(...qs.sort(() => Math.random() - 0.5));
      });
      
      subjectQuestions = [...passageQuestions, ...orderedOthers];
    } else {
      subjectQuestions = [...subjectQuestions].sort(() => Math.random() - 0.5);
    }

    const limit = selectedExamType === 'Personal CBT' 
      ? subjectQuestions.length 
      : getStandardLimit(selectedExamType, subject);
      
    const selected = subjectQuestions.slice(0, limit);

    setCurrentSubject(subject);
    setCurrentDuration(duration);
    setCurrentQuestions(selected);
    navigateToState('cbt');
  };

  const handleFinishExam = (
    answers: Record<string, number | null>, 
    timeTaken: number,
    theoryAnswers?: Record<string, string>
  ) => {
    let allSessionQuestions = currentQuestions;
    let allAnswers = answers;
    let allTheory = theoryAnswers || {};
    let totalTimeTaken = timeTaken;
    let isContinuation = false;

    if (examSessionConfig?.paperFormat === 'both_continuation' && continuationPart === 2) {
      isContinuation = true;
      allSessionQuestions = [...continuationPart1Questions, ...continuationPart2Questions];
      allAnswers = { ...continuationPart1Answers, ...answers };
      allTheory = { ...continuationPart1TheoryAnswers, ...(theoryAnswers || {}) };
      totalTimeTaken = continuationPart1TimeTaken + timeTaken;
      setCurrentQuestions(allSessionQuestions);
    }

    let score = 0;
    const resultAnswers = allSessionQuestions.map(q => {
      const selected = allAnswers[q.id] !== undefined ? allAnswers[q.id] : null;
      const isTheory = q.type === 'theory' || !q.options || q.options.length === 0;
      let isCorrect = false;

      if (isTheory) {
        // Theory answer is marked complete if submitted with meaningful response
        const candidateText = (allTheory[q.id] || '').trim();
        isCorrect = candidateText.length >= 10;
        if (isCorrect) score++;
      } else {
        isCorrect = selected === q.correctAnswer;
        if (isCorrect) score++;
      }

      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect,
        theoryAnswer: allTheory[q.id] || ''
      };
    });

    const result: QuizResult = {
      userId: user?.uid || 'guest_candidate',
      userName: user?.displayName || user?.email || 'Candidate',
      subject: currentSubject || (allSessionQuestions[0]?.subject) || 'General',
      examType: selectedExamType || (allSessionQuestions[0]?.examType) || 'JAMB',
      score,
      totalQuestions: allSessionQuestions.length,
      timeTaken: totalTimeTaken,
      date: new Date().toISOString(),
      answers: resultAnswers,
      theoryAnswers: allTheory,
      isContinuation: Boolean(isContinuation),
      timingMode: examSessionConfig?.timingMode || 'merged'
    };

    // Transition immediately without any delay or blocking (Requirement 1 & 4)
    setLastResult(result);
    navigateToState('result');

    // Asynchronous background persistence (never blocks user screen transition)
    if (db && user?.uid) {
      setTimeout(() => {
        try {
          const resultsPath = 'sib_results';
          const cleanAnswers = (result.answers || []).map(a => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer,
            isCorrect: a.isCorrect,
            theoryAnswer: typeof a.theoryAnswer === 'string' && a.theoryAnswer.length > 3000 
              ? a.theoryAnswer.slice(0, 3000) 
              : a.theoryAnswer || ''
          }));
          const cleanPayload = {
            ...result,
            answers: cleanAnswers
          };
          addDoc(collection(db, resultsPath), {
            ...cleanPayload,
            savedAt: serverTimestamp()
          }).catch(fsErr => {
            console.warn("Background save note:", fsErr);
          });
        } catch (err) {
          console.warn("Serialization note:", err);
        }
      }, 0);
    }
  };

  const handleConfirmPayment = async () => {
    navigateToState('subscription_portal');
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setSelectedExamType(null);
    setCustomQuestions([]);
    setState('auth');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const navigateToState = (target: AppState) => {
    setState(target);
    const targetPath = getPathFromState(target);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleNavigateTo = (target: any) => {
    if (target === 'dashboard') navigateToState('dashboard');
    else if (target === 'textbooks') navigateToState('textbooks');
    else if (target === 'exam_select') navigateToState('exam_select');
    else if (target === 'cbt_subjects') navigateToState('cbt_subjects');
    else if (target === 'progress') navigateToState('progress');
    else if (target === 'admin_console') {
      const emailClean = user?.email?.toLowerCase().trim();
      const isAdmin = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profile?.role === 'admin';
      if (isAdmin) {
        navigateToState('admin_console');
      } else {
        navigateToState('dashboard');
      }
    }
    else if (target === 'subscription_portal') navigateToState('subscription_portal');
    else if (target === 'system_ai') navigateToState('system_ai');
    else if (target === 'browser') navigateToState('browser');
    else if (target === 'audio') navigateToState('audio');
    else if (target === 'file_upload') navigateToState('file_upload');
    else navigateToState('dashboard');
  };

  if (splashStage !== 'done') {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden select-none z-[99999] p-0 m-0 border-0 rounded-none">
        <img 
          src="/jeeraf-with-name.svg" 
          alt="JeeRaf CBT System" 
          className="w-screen h-screen object-cover select-none block p-0 m-0 border-0 rounded-none"
        />
      </div>
    );
  }

  if (!isAuthReady || profileLoading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-6">
          <GoldSpinner size={64} />
          <p className="text-theme-muted text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-theme-text bg-theme-bg transition-colors duration-300">
      {isLocked && (
        <SubscriptionLock 
          user={user} 
          onLogout={handleLogout} 
          onConfirmPayment={handleConfirmPayment} 
        />
      )}

      {state === 'welcome' && <Welcome onProceed={() => setState('auth')} />}
      
      {state === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}

      {state === 'exam_select' && user && (
        <ExamTypeSelection 
          onSelect={handleExamTypeSelect} 
          user={user} 
          profile={profile}
          onLogout={handleLogout} 
          onNavigateTo={handleNavigateTo}
        />
      )}

      {state === 'personal_ready' && user && (
        <PersonalCBTReady 
          questions={customQuestions} 
          duration={currentDuration}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onNavigateTo={handleNavigateTo}
          onStart={() => handleStartExam('General', currentDuration)}
          onBack={() => navigateToState('exam_select')}
        />
      )}

      {state === 'audio' && user && (
        <AudioWorkstation
          user={user}
          onClose={() => navigateToState('exam_select')}
          onQuestionsGenerated={(questions, duration) => {
            setCustomQuestions(questions);
            setCurrentDuration(duration);
            setSelectedExamType('Personal CBT');
            navigateToState('personal_ready');
          }}
        />
      )}

      {state === 'file_upload' && user && (
        <FileUploadPage
          user={user}
          profile={profile}
          onBack={() => navigateToState('exam_select')}
          onQuestionsGenerated={(questions, duration) => {
            setCustomQuestions(questions);
            setCurrentDuration(duration);
            setSelectedExamType('Personal CBT');
            navigateToState('personal_ready');
          }}
        />
      )}
      
      {state === 'dashboard' && user && (
        <MainDirectoryDashboard 
          user={user} 
          profile={profile}
          examType={selectedExamType}
          adminQuestions={adminQuestions}
          onStartSubject={(subject) => handleStartExam(subject, currentDuration)}
          onOpenExamTypeSelect={() => navigateToState('exam_select')}
          onNavigateTo={handleNavigateTo}
          onLogout={handleLogout}
          onViewProgress={() => navigateToState('progress')}
          onOpenCBTDirectory={(customCategory, customPrompt) => {
            const category = customCategory || profile?.cbtCategory || 'national_exams';
            const prompt = customPrompt || profile?.customExamName || '';

            if (category === 'university') {
              setSelectedExamType('Personal CBT');
              navigateToState('exam_select');
            } else if (category === 'explore_ai') {
              const pLower = prompt.toLowerCase();
              const isPersonal = pLower.includes('personal') || pLower.includes('upcoming') || pLower.includes('lecture') || pLower.includes('material') || pLower.includes('audio') || pLower.includes('note') || pLower.includes('course') || pLower.includes('test') || pLower.includes('prepare') || prompt.trim().length === 0;

              if (isPersonal) {
                setSelectedExamType('Personal CBT');
                navigateToState('exam_select');
              } else {
                if (selectedExamType && selectedExamType !== 'Personal CBT') {
                  navigateToState('cbt_subjects');
                } else {
                  setSelectedExamType('JAMB');
                  navigateToState('cbt_subjects');
                }
              }
            } else if (category === 'national_exams') {
              navigateToState('exam_select');
            } else {
              navigateToState('exam_select');
            }
          }}
        />
      )}

      {state === 'cbt_config' && user && (
        <CBTExamConfigPage
          examType={selectedExamType || 'JAMB'}
          availableSubjects={['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature', 'Geography', 'Commerce', 'Accounting', 'Agricultural Science', 'Civic Education', 'Further Mathematics', 'History', 'CRK', 'IRK']}
          initialSubject={currentSubject || undefined}
          availableYears={STANDARD_NATIONAL_EXAM_YEARS}
          questions={[...allQuestions, ...adminQuestions]}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onNavigateTo={handleNavigateTo}
          onBack={() => navigateToState('exam_select')}
          onStartExam={handleStartAdvancedExam}
        />
      )}

      {state === 'cbt_subjects' && user && (
        <Dashboard 
          user={user} 
          profile={profile}
          examType={selectedExamType}
          defaultDuration={currentDuration}
          availableQuestions={customQuestions}
          adminQuestions={adminQuestions}
          onStart={handleStartExam} 
          onStartAdvanced={handleStartAdvancedExam}
          onLogout={handleLogout} 
          onViewProgress={() => navigateToState('progress')}
          onNavigateTo={handleNavigateTo}
          onChangeExamType={() => navigateToState('exam_select')}
        />
      )}

      {state === 'system_ai' && user && (
        <JeeRafAIPage
          user={user}
          profile={profile}
          onBack={() => navigateToState('dashboard')}
          onNavigateToSubscription={() => navigateToState('subscription_portal')}
          onNavigate={(targetState) => handleNavigateTo(targetState)}
          onOpenBrowserUrl={(url) => {
            setBrowserUrl(url);
            navigateToState('browser');
          }}
        />
      )}

      {state === 'browser' && user && (
        <WebBrowserPage
          initialUrl={browserUrl}
          user={user}
          profile={profile}
          onBack={() => navigateToState('dashboard')}
          onLogout={handleLogout}
          onNavigateTo={handleNavigateTo}
        />
      )}
      
      {state === 'progress' && user && (
        <ProgressTracker 
          user={user} 
          profile={profile}
          onBack={() => navigateToState('dashboard')} 
          onLogout={handleLogout}
        />
      )}

      {state === 'textbooks' && user && (
        <TextbookSelection 
          onBack={() => navigateToState('dashboard')}
          onLogout={handleLogout}
          user={user}
          profile={profile}
        />
      )}

      {state === 'admin_console' && user && (user.email?.toLowerCase().trim() === 'eemmpatech@gmail.com' || user.email?.toLowerCase().trim() === 'eemmpatec@gmail.com' || profile?.role === 'admin') && (
        <AdminConsole user={user} profile={profile} onBack={() => navigateToState('dashboard')} />
      )}

      {state === 'subscription_portal' && user && (
        <SubscriptionPortal 
          user={user} 
          profile={profile}
          onBack={() => navigateToState('dashboard')} 
          onStatusChange={() => {}}
        />
      )}

      {state === 'exam_intermission' && (
        <ExamIntermissionBreak
          examType={selectedExamType || 'WAEC'}
          subjects={examSessionConfig?.subjects || (currentSubject ? [currentSubject] : ['Mathematics'])}
          nextPaperTitle={nextPaperTitle}
          nextQuestionsCount={continuationPart2Questions.length}
          initialMinutes={intermissionBreakMinutes}
          onCompleteBreak={handleCompleteIntermissionBreak}
        />
      )}
      
      {state === 'cbt' && (
        <CBTInterface
          subject={currentSubject || examSessionConfig?.subjects?.[0] || 'General'}
          subjects={examSessionConfig?.subjects}
          isMergedMode={examSessionConfig?.timingMode === 'merged' && (examSessionConfig?.subjects?.length || 0) > 1}
          isContinuationSection={examSessionConfig?.paperFormat === 'both_continuation'}
          continuationPart={continuationPart}
          nextPartTitle={nextPaperTitle}
          examType={selectedExamType || undefined}
          questions={currentQuestions}
          durationMinutes={currentDuration}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onFinish={handleFinishExam}
          onContinuationSectionComplete={handleContinuationSectionComplete}
          onNavigateTo={handleNavigateTo}
        />
      )}
      
      {state === 'result' && lastResult && (
        <ResultDashboard
          result={lastResult}
          questions={currentQuestions}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onRestart={() => {
            if (examSessionConfig) {
              handleStartAdvancedExam(examSessionConfig);
            } else {
              handleStartExam(currentSubject!, currentDuration);
            }
          }}
          onHome={() => navigateToState('dashboard')}
          onNavigateTo={handleNavigateTo}
        />
      )}
    </div>
  );
}
