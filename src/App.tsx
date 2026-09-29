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
import { FunPage } from './components/FunPage';
import { BlogPage } from './components/BlogPage';
import { AwardsPage } from './components/AwardsPage';
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

type AppState = 
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
  | 'fun'
  | 'blog'
  | 'awards'
  | 'system_ai'
  | 'browser';

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
        setState(prevState => prevState === 'auth' ? 'dashboard' : prevState);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
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
    setState('dashboard');
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
    setState('cbt');
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
    setState('result');
  };

  const handleConfirmPayment = async () => {
    setState('subscription_portal');
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
  };

  const handleNavigateTo = (target: any) => {
    if (target === 'dashboard') setState('dashboard');
    if (target === 'textbooks') setState('textbooks');
    if (target === 'exam_select') setState('exam_select');
    if (target === 'progress') setState('progress');
    if (target === 'admin_console') setState('admin_console');
    if (target === 'subscription_portal') setState('subscription_portal');
    if (target === 'fun') setState('fun');
    if (target === 'blog') setState('blog');
    if (target === 'awards') setState('awards');
    if (target === 'system_ai') setState('system_ai');
    if (target === 'browser') setState('browser');
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
          onBack={() => setState('exam_select')}
        />
      )}
      
      {state === 'dashboard' && user && (
        <MainDirectoryDashboard 
          user={user} 
          profile={profile}
          examType={selectedExamType}
          adminQuestions={adminQuestions}
          onStartSubject={(subject) => handleStartExam(subject, currentDuration)}
          onOpenExamTypeSelect={() => setState('exam_select')}
          onNavigateTo={handleNavigateTo}
          onLogout={handleLogout}
          onViewProgress={() => setState('progress')}
          onOpenCBTDirectory={(customCategory, customPrompt) => {
            const category = customCategory || profile?.cbtCategory || 'national_exams';
            const prompt = customPrompt || profile?.customExamName || '';

            if (category === 'university') {
              setSelectedExamType('Personal CBT');
              setState('exam_select');
            } else if (category === 'explore_ai') {
              const pLower = prompt.toLowerCase();
              const isPersonal = pLower.includes('personal') || pLower.includes('upcoming') || pLower.includes('lecture') || pLower.includes('material') || pLower.includes('audio') || pLower.includes('note') || pLower.includes('course') || pLower.includes('test') || pLower.includes('prepare') || prompt.trim().length === 0;

              if (isPersonal) {
                setSelectedExamType('Personal CBT');
                setState('exam_select');
              } else {
                if (selectedExamType && selectedExamType !== 'Personal CBT') {
                  setState('cbt_subjects');
                } else {
                  setSelectedExamType('JAMB');
                  setState('cbt_subjects');
                }
              }
            } else if (category === 'national_exams') {
              setState('exam_select');
            } else {
              setState('exam_select');
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
          onViewProgress={() => setState('progress')}
          onNavigateTo={handleNavigateTo}
          onChangeExamType={() => setState('exam_select')}
        />
      )}

      {state === 'fun' && user && (
        <FunPage
          user={user}
          profile={profile}
          onBack={() => setState('dashboard')}
          onNavigateToAwards={() => setState('awards')}
        />
      )}

      {state === 'blog' && user && (
        <BlogPage
          user={user}
          profile={profile}
          onBack={() => setState('dashboard')}
          onNavigateTo={handleNavigateTo}
        />
      )}

      {state === 'awards' && user && (
        <AwardsPage
          user={user}
          profile={profile}
          onBack={() => setState('dashboard')}
        />
      )}

      {state === 'system_ai' && user && (
        <IbomAIPage
          user={user}
          profile={profile}
          onBack={() => setState('dashboard')}
          onNavigateToSubscription={() => setState('subscription_portal')}
          onNavigate={(targetState) => setState(targetState as any)}
          onOpenBrowserUrl={(url) => {
            setBrowserUrl(url);
            setState('browser');
          }}
        />
      )}

      {state === 'browser' && user && (
        <WebBrowserPage
          initialUrl={browserUrl}
          user={user}
          profile={profile}
          onBack={() => setState('dashboard')}
          onLogout={handleLogout}
          onNavigateTo={handleNavigateTo}
        />
      )}
      
      {state === 'progress' && user && (
        <ProgressTracker 
          user={user} 
          profile={profile}
          onBack={() => setState('dashboard')} 
          onLogout={handleLogout}
        />
      )}

      {state === 'textbooks' && user && (
        <TextbookSelection 
          onBack={() => setState('dashboard')}
          onLogout={handleLogout}
          user={user}
          profile={profile}
        />
      )}

      {state === 'admin_console' && user && (
        <AdminConsole user={user} profile={profile} onBack={() => setState('dashboard')} />
      )}

      {state === 'subscription_portal' && user && (
        <SubscriptionPortal 
          user={user} 
          profile={profile}
          onBack={() => setState('dashboard')} 
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
          onHome={() => setState('dashboard')}
          onNavigateTo={handleNavigateTo}
        />
      )}
    </div>
  );
}
