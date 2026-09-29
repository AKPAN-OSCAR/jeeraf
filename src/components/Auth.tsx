import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StarryBackground } from './StarryBackground';
import { Footer } from './Footer';
import { SupportButton } from './SupportButton';
import { LogIn, UserPlus, Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '../data/lib/utils';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

enum AuthState {
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT = 'forgot'
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthState>(AuthState.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth?.currentUser?.uid,
        email: auth?.currentUser?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    return new Error(JSON.stringify(errInfo));
  };

  const setupUserProfile = async (firebaseUser: any, role: 'user' | 'admin' = 'user') => {
    if (!db) return;
    const profilePath = `sib_profiles/${firebaseUser.uid}`;
    
    // Explicitly force admin role for the master emails
    const emailClean = firebaseUser.email?.toLowerCase().trim();
    const isAdminEmail = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com';
    const effectiveRole = isAdminEmail ? 'admin' : role;

    // Standard profile with trial setup
    const trialDays = 14;
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + trialDays);

    try {
      await setDoc(doc(db, profilePath), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: effectiveRole,
        subscriptionStatus: (effectiveRole === 'admin') ? 'paid' : 'free',
        plan: (effectiveRole === 'admin') ? 'claxy_pro' : 'free',
        isPremium: (effectiveRole === 'admin'),
        trialExpiresAt: trialExpiresAt.toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Non-blocking profile setup warning:", err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address to receive the reset link.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('Initializing reset automation...');

    try {
      if (auth) {
        console.log('Attempting to send reset email to:', email);
        await sendPasswordResetEmail(auth, email);
        console.log('Reset email sent successfully');
        setSuccessMessage('Reset link sent! Please check your inbox and spam/junk folder immediately.');
      } else {
        throw new Error('Authentication service initialization failed.');
      }
    } catch (err: any) {
      console.error('Password Reset Error:', err.code, err.message);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email in this project yet. Please Sign Up first.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address format is invalid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait 60 seconds before trying again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in your Firebase Console. Please enable it in the Authentication tab.');
      } else {
        setError(`Failed to send: ${err.message || 'Check your internet and try again.'}`);
      }
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Client-side validation
    if (view !== AuthState.FORGOT && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (auth && db) {
        let userCredential;
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPassword = password.trim();
        const isAdminEmail = normalizedEmail === 'eemmpatech@gmail.com';
        const isAdminPassword = normalizedPassword === 'MUMDADboy@100%.Com';

        if (view === AuthState.LOGIN) {
          try {
            userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
            // Always refresh admin profile on successful login
            if (isAdminEmail) {
              await setupUserProfile(userCredential.user, 'admin');
            }
          } catch (loginErr: any) {
            // Enhanced Admin Recovery: Auto-create if project is fresh
            if (isAdminEmail && isAdminPassword && (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential')) {
              try {
                userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
                await setupUserProfile(userCredential.user, 'admin');
              } catch (createErr: any) {
                if (createErr.code === 'auth/email-already-in-use') {
                  setError('Account exists but password mismatch. Please check your password or use Forgot Password.');
                }
                throw loginErr;
              }
            } else {
              throw loginErr;
            }
          }
        } else {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
            await setupUserProfile(userCredential.user, isAdminEmail ? 'admin' : 'user');
          } catch (signUpErr: any) {
            // Auto-bridge to login if user already exists
            if (signUpErr.code === 'auth/email-already-in-use') {
              try {
                userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
                if (isAdminEmail) await setupUserProfile(userCredential.user, 'admin');
              } catch (retryLoginErr: any) {
                setError('Email is already registered. Please login with the correct password.');
                setLoading(false);
                return;
              }
            } else {
              throw signUpErr;
            }
          }
        }
        onAuthSuccess(userCredential.user);
      } else {
        setTimeout(() => {
          onAuthSuccess({ email, uid: 'mock-uid' });
          setLoading(false);
        }, 1000);
        return;
      }
      setLoading(false);
    } catch (err: any) {
      if (err.code === 'auth/weak-password') {
        setError('Your password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase Console. Please enable it in the Authentication tab.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <StarryBackground>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {view === AuthState.LOGIN ? 'Welcome Back' : view === AuthState.SIGNUP ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-white/60">
              {view === AuthState.LOGIN 
                ? 'Login to continue your CBT' 
                : view === AuthState.SIGNUP 
                  ? 'Sign up to start your CBT journey' 
                  : 'Enter your email to receive a recovery link'}
            </p>
          </div>

          <form onSubmit={view === AuthState.FORGOT ? handleResetPassword : handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {view !== AuthState.FORGOT && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-white/80">Password</label>
                  {view === AuthState.LOGIN && (
                    <button 
                      type="button"
                      onClick={() => setView(AuthState.FORGOT)}
                      className="text-xs text-theme-accent hover:opacity-80 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {view === AuthState.SIGNUP && (
                  <p className="text-[10px] text-white/40 ml-1">Must be at least 6 characters</p>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            {successMessage && (
              <div className="space-y-4">
                <p className="text-green-400 text-sm text-center bg-green-400/10 py-2 rounded-lg border border-green-400/20">
                  {successMessage}
                </p>
                {view === AuthState.FORGOT && (
                  <button
                    type="button"
                    onClick={() => handleResetPassword(null as any)}
                    disabled={loading}
                    className="w-full text-theme-accent hover:opacity-80 text-sm font-medium transition-colors"
                  >
                    Didn't receive it? Resend Link
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-accent hover:opacity-90 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === AuthState.LOGIN ? 'Login' : view === AuthState.SIGNUP ? 'Sign Up' : 'Send Reset Link'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            {view === AuthState.FORGOT ? (
              <button
                onClick={() => setView(AuthState.LOGIN)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Back to Login
              </button>
            ) : (
              <button
                onClick={() => setView(view === AuthState.LOGIN ? AuthState.SIGNUP : AuthState.LOGIN)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                {view === AuthState.LOGIN ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
      <SupportButton />
    </StarryBackground>
  );
};
