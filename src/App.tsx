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
import { ResultDashboard } from './components/ResultDashboard';
import { ProgressTracker } from './components/ProgressTracker';
import { questions as allQuestions } from './data/questions';
import { Subject, Question, QuizResult, ExamType } from './types';
import { auth, db } from './firebase';
import { getStandardLimit } from './data/lib/utils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { SubscriptionLock } from './components/SubscriptionLock';
import { SidebarMenu } from './components/SidebarMenu';
import { TextbookSelection } from './components/TextbookSelection';
import { AdminConsole } from './components/AdminConsole';
import { SubscriptionPortal } from './components/SubscriptionPortal';
import { IbomAIPage } from './components/IbomAIPage';
import { WebBrowserPage } from './components/WebBrowserPage';
import { MainDirectoryDashboard } from './components/MainDirectoryDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { GoldSpinner, JeeRafSilverLogo } from './components/AIAvatar';

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
  | 'cbt_subjects'
  | 'personal_ready' 
  | 'dashboard' 
  | 'cbt' 
  | 'result' 
  | 'progress' 
  | 'textbooks' 
  | 'admin_console' 
  | 'subscription_portal'
  | 'system_ai'
  | 'browser';

export const getPathFromState = (s: AppState): string => {
  switch (s) {
    case 'dashboard': return '/';
    case 'exam_select':
    case 'cbt_subjects': return '/cbt';
    case 'personal_ready': return '/cbt/ready';
    case 'cbt': return '/cbt/exam';
    case 'result': return '/cbt/results';
    case 'system_ai': return '/ai';
    case 'browser': return '/browser';
    case 'textbooks': return '/library';
    case 'progress': return '/progress';
    case 'subscription_portal': return '/subscription';
    case 'admin_console': return '/admin';
    default: return '/';
  }
};

export const getStateFromPath = (path: string): AppState | null => {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '' || clean === '/') return 'dashboard';
  if (clean === '/cbt' || clean === '/cbt/select') return 'exam_select';
  if (clean === '/cbt/practice' || clean === '/cbt/subjects') return 'cbt_subjects';
  if (clean === '/cbt/ready') return 'personal_ready';
  if (clean === '/cbt/exam') return 'cbt';
  if (clean === '/cbt/results' || clean === '/results') return 'result';
  if (clean === '/ai' || clean === '/chat') return 'system_ai';
  if (clean === '/browser') return 'browser';
  if (clean === '/library' || clean === '/books' || clean === '/textbooks') return 'textbooks';
  if (clean === '/progress' || clean === '/stats') return 'progress';
  if (clean === '/subscription' || clean === '/plans') return 'subscription_portal';
  if (clean === '/admin') return 'admin_console';
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
    // Show splash (JeeRaf Silver Logo) for 3.5 seconds
    const timer = setTimeout(() => {
      setSplashStage('done');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Preserve initial intended URL if user arrives at a deep link while unauthenticated
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/' && currentPath !== '') {
      sessionStorage.setItem('intended_path', currentPath);
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
      } else {
        const intended = sessionStorage.getItem('intended_path') || window.location.pathname;
        const pathTarget = getStateFromPath(intended);
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
      const target = getStateFromPath(window.location.pathname);
      if (target) {
        setState(target);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
          setProfile(profileData);
          
          // Check for admin email
          const emailClean = user.email?.toLowerCase().trim();
          const isAdminEmail = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profileData.role === 'admin';
          
          if (isAdminEmail) {
            profileData.isPremium = true;
            profileData.subscriptionStatus = 'paid';
            profileData.plan = 'claxy_pro';
            profileData.role = 'admin';
            setIsLocked(false);
          } else if (!profileData.isPremium) {
            const now = new Date();
            const expiresAt = new Date(profileData.trialExpiresAt || 0);
            if (now > expiresAt && profileData.trialExpiresAt) {
              setIsLocked(true);
            } else {
              setIsLocked(false);
            }
          } else {
            setIsLocked(false);
          }
          setProfile(profileData);
          setProfileLoading(false);
        } else {
          // If no profile exists (legacy users), create one
          const emailClean = user.email?.toLowerCase().trim();
          const isAdminEmail = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com';
          const trialDays = 14;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + trialDays);
          
          setDoc(profileRef, {
            uid: user.uid,
            email: user.email,
            subscriptionStatus: isAdminEmail ? 'paid' : 'free',
            plan: isAdminEmail ? 'claxy_pro' : 'free',
            isSubscribed: isAdminEmail,
            isPremium: isAdminEmail,
            role: isAdminEmail ? 'admin' : 'user',
            theme: 'white',
            trialExpiresAt: expiresAt.toISOString(),
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
      setState('cbt_subjects');
    }
  };

  const handleStartExam = (subject: Subject, duration: number, practiceMode: 'yearly' | 'random' = 'random', selectedYear?: number) => {
    let subjectQuestions: Question[] = [];
    const combinedQuestions = [...allQuestions, ...adminQuestions];
    
    if (selectedExamType === 'Personal CBT') {
      subjectQuestions = [...customQuestions];
    } else {
      subjectQuestions = combinedQuestions.filter(q => 
        q.subject === subject && 
        q.examType === selectedExamType &&
        (practiceMode === 'yearly' && selectedYear ? q.year === selectedYear : true)
      );
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

  const handleFinishExam = (answers: Record<string, number | null>, timeTaken: number) => {
    let score = 0;
    const resultAnswers = currentQuestions.map(q => {
      const selected = answers[q.id] ?? null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect
      };
    });

    const result: QuizResult = {
      userId: user.uid,
      userName: user.email,
      subject: currentSubject!,
      examType: selectedExamType!,
      score,
      totalQuestions: currentQuestions.length,
      timeTaken,
      date: new Date().toISOString(),
      answers: resultAnswers
    };

    if (db) {
      const resultsPath = 'sib_results';
      addDoc(collection(db, resultsPath), {
        ...result,
        date: serverTimestamp()
      }).catch(fsErr => {
        console.error("Background save failed:", fsErr);
        handleFirestoreError(fsErr, OperationType.WRITE, resultsPath);
      });
    }

    setLastResult(result);
    navigateToState('result');
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
    else if (target === 'admin_console') navigateToState('admin_console');
    else if (target === 'subscription_portal') navigateToState('subscription_portal');
    else if (target === 'system_ai') navigateToState('system_ai');
    else if (target === 'browser') navigateToState('browser');
    else navigateToState('dashboard');
  };

  if (splashStage !== 'done') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden select-none z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="w-full h-full max-w-[650px] max-h-[650px] flex items-center justify-center p-6 bg-black"
        >
          <JeeRafSilverLogo className="w-full h-full" />
        </motion.div>
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

      {state === 'cbt_subjects' && user && (
        <Dashboard 
          user={user} 
          profile={profile}
          examType={selectedExamType}
          defaultDuration={currentDuration}
          availableQuestions={customQuestions}
          adminQuestions={adminQuestions}
          onStart={handleStartExam} 
          onLogout={handleLogout} 
          onViewProgress={() => navigateToState('progress')}
          onNavigateTo={handleNavigateTo}
          onChangeExamType={() => navigateToState('exam_select')}
        />
      )}

      {state === 'system_ai' && user && (
        <IbomAIPage
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

      {state === 'admin_console' && user && (
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
      
      {state === 'cbt' && currentSubject && (
        <CBTInterface
          subject={currentSubject}
          examType={selectedExamType || undefined}
          questions={currentQuestions}
          durationMinutes={currentDuration}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onFinish={handleFinishExam}
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
          onRestart={() => handleStartExam(currentSubject!, currentDuration)}
          onHome={() => navigateToState('dashboard')}
          onNavigateTo={handleNavigateTo}
        />
      )}
    </div>
  );
}
