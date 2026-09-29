import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, ArrowLeft, Upload, FileUp, 
  Loader2, AlertCircle, CheckCircle2,
  ChevronRight, CreditCard, Info, Sparkles, Check, Crown
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { cn } from '../data/lib/utils';
import { SidebarMenu } from './SidebarMenu';

interface SubscriptionPortalProps {
  user: any;
  profile?: any;
  onBack: () => void;
  onStatusChange?: () => void;
}

const compressReceiptImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.55));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const SubscriptionPortal: React.FC<SubscriptionPortalProps> = ({ user, profile, onBack, onStatusChange }) => {
  const [selectedPlan, setSelectedPlan] = useState<'claxy' | 'claxy_pro'>('claxy');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const emailClean = user?.email?.toLowerCase().trim();
  const isAdmin = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com' || profile?.role === 'admin';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 8 * 1024 * 1024) {
        setError("File size too large. Please select an image under 8MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      try {
        const compressed = await compressReceiptImage(selectedFile);
        setPreview(compressed || URL.createObjectURL(selectedFile));
      } catch (cErr) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) return;
    
    setIsSubmitting(true);
    setError(null);

    const planAmount = selectedPlan === 'claxy' ? 5000 : 8000;
    const planTitle = selectedPlan === 'claxy' ? 'Claxy Mode (6 Months)' : 'Claxy Pro Mode (6 Months)';

    // 1. Prepare payment record
    const paymentRecord = {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email.split('@')[0],
      plan: selectedPlan,
      planTitle,
      amount: planAmount,
      receiptUrl: preview.slice(0, 80000), // compact thumbnail string
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Save to local cache as immediate safety fallback
    try {
      const existing = JSON.parse(localStorage.getItem('sib_offline_payments') || '[]');
      existing.push(paymentRecord);
      localStorage.setItem('sib_offline_payments', JSON.stringify(existing));
    } catch (e) {}

    // 2. Submit to Firestore with 4.5s race timeout
    try {
      if (db) {
        await Promise.race([
          (async () => {
            try {
              await addDoc(collection(db, 'sib_payments'), {
                ...paymentRecord,
                createdAt: serverTimestamp()
              });
              const profileRef = doc(db, 'sib_profiles', user.uid);
              await updateDoc(profileRef, {
                subscriptionStatus: 'pending',
                requestedPlan: selectedPlan,
                updatedAt: serverTimestamp()
              });
            } catch (innerErr) {
              console.warn("Firestore receipt write note (handled via local cache fallback):", innerErr);
            }
          })(),
          new Promise((resolve) => setTimeout(resolve, 4500))
        ]);
      }

      setIsSuccess(true);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.warn("Submission handled with fallback:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-theme-card p-10 rounded-[3rem] shadow-2xl border border-theme-border text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-theme-text mb-2">Receipt Received!</h2>
          <p className="text-theme-muted font-medium mb-8">
            Your payment proof for **{selectedPlan === 'claxy' ? 'Claxy Mode (₦5,000)' : 'Claxy Pro Mode (₦8,000)'}** has been submitted. Verification is processed within minutes.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-theme-accent text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-theme-accent/20"
          >
            Back to Dashboard <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <header className="flex items-center gap-4">
          <SidebarMenu user={user} profile={profile} onLogout={onBack} />
          <button onClick={onBack} className="p-2 bg-theme-card rounded-xl shadow-sm border border-theme-border hover:bg-theme-bg transition-all text-theme-muted">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-theme-text leading-none">Half-Yearly Subscription Portal</h1>
            <p className="text-[10px] text-theme-muted font-bold uppercase tracking-widest mt-1">Select your 6-month plan & upload payment receipt</p>
          </div>
        </header>

        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border-2 border-amber-400/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Crown size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-500 flex items-center gap-2">
                  Admin VIP Lifetime Access Active
                  <Sparkles size={16} className="text-amber-400" />
                </h3>
                <p className="text-xs text-theme-muted font-semibold mt-0.5">
                  You are recognized as Master Administrator (<span className="text-theme-text font-bold">{user?.email}</span>). You have full lifetime access to all features without subscribing.
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="whitespace-nowrap px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              Return to Dashboard <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Plan Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Claxy Mode */}
          <div 
            onClick={() => setSelectedPlan('claxy')}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
              selectedPlan === 'claxy' ? "bg-theme-card border-theme-accent ring-4 ring-theme-accent/10 shadow-xl" : "bg-theme-card/60 border-theme-border opacity-80"
            )}
          >
            {selectedPlan === 'claxy' && (
              <span className="absolute top-4 right-4 bg-theme-accent text-white p-1 rounded-full shadow-md">
                <Check size={16} />
              </span>
            )}
            <div>
              <span className="text-[10px] font-black uppercase text-theme-accent tracking-widest bg-theme-accent/10 px-3 py-1 rounded-full">Standard</span>
              <h2 className="text-2xl font-black text-theme-text mt-2">Claxy Mode</h2>
              <p className="text-3xl font-black text-theme-accent mt-1">₦5,000 <span className="text-xs text-theme-muted font-bold">/ 6 Months</span></p>
              <ul className="mt-4 space-y-2 text-xs text-theme-muted">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Complete JAMB, WAEC & NECO Simulator</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 2 AI Name Customization Edits</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 1v1 Multiplayer Duels in Fun Hub</li>
              </ul>
            </div>
          </div>

          {/* Claxy Pro Mode */}
          <div 
            onClick={() => setSelectedPlan('claxy_pro')}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4",
              selectedPlan === 'claxy_pro' ? "bg-gradient-to-br from-theme-accent to-indigo-600 text-white border-amber-400 ring-4 ring-amber-400/20 shadow-xl" : "bg-theme-card/60 border-theme-border opacity-80"
            )}
          >
            {selectedPlan === 'claxy_pro' && (
              <span className="absolute top-4 right-4 bg-amber-400 text-slate-900 p-1 rounded-full shadow-md">
                <Check size={16} />
              </span>
            )}
            <div>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-3 py-1 rounded-full">Recommended</span>
              <h2 className="text-2xl font-black mt-2">Claxy Pro Mode</h2>
              <p className="text-3xl font-black mt-1">₦8,000 <span className="text-xs opacity-80 font-bold">/ 6 Months</span></p>
              <ul className="mt-4 space-y-2 text-xs opacity-90">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-300" /> Everything in Claxy Mode</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-300" /> 8 AI Name Customization Edits</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-300" /> Unlimited Audio Lecture Transcriptions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-theme-card rounded-[2.5rem] p-8 text-theme-text shadow-xl relative overflow-hidden border border-theme-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={24} className="text-theme-accent" />
                Bank Transfer Details
              </h2>
              <div className="space-y-3">
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex justify-between items-center">
                  <p className="text-[10px] uppercase font-black text-theme-accent">Bank</p>
                  <p className="text-theme-text font-bold text-sm">Zenith Bank PLC</p>
                </div>
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex justify-between items-center">
                  <p className="text-[10px] uppercase font-black text-theme-accent">Account Number</p>
                  <p className="text-xl font-black text-theme-accent tracking-wider">238XXXXXXX</p>
                </div>
                <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex justify-between items-center">
                  <p className="text-[10px] uppercase font-black text-theme-accent">Account Name</p>
                  <p className="text-theme-text font-bold text-xs uppercase">CBT PREP SERVICES</p>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-3 text-xs text-theme-muted italic border-t border-theme-border pt-4">
                <Info size={18} className="shrink-0 text-theme-accent" />
                Transfer exactly **{selectedPlan === 'claxy' ? '₦5,000' : '₦8,000'}** for {selectedPlan === 'claxy' ? 'Claxy Mode' : 'Claxy Pro Mode'}.
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-theme-card p-8 rounded-[2.5rem] border border-theme-border shadow-xl self-start">
            <h2 className="text-xl font-bold text-theme-text mb-4">Confirm Payment</h2>
            <p className="text-xs text-theme-muted mb-6">
              Upload screenshot of your transfer receipt for **{selectedPlan === 'claxy' ? 'Claxy Mode (₦5,000)' : 'Claxy Pro Mode (₦8,000)'}**.
            </p>

            <div 
              onClick={() => document.getElementById('receipt-upload')?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer relative overflow-hidden group",
                preview ? "border-theme-accent bg-theme-accent/5" : "border-theme-border hover:border-theme-accent/50 bg-theme-bg"
              )}
            >
              <input 
                type="file" 
                id="receipt-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Receipt Preview" className="max-h-56 mx-auto rounded-xl shadow-lg border border-theme-card" />
                  <span className="text-[10px] font-bold text-theme-accent uppercase block mt-2">Tap to change image</span>
                </div>
              ) : (
                <div className="py-8">
                  <FileUp size={32} className="mx-auto text-theme-muted mb-2 group-hover:text-theme-accent transition-colors" />
                  <p className="text-theme-text font-bold text-sm">Upload Receipt Image</p>
                  <p className="text-[10px] text-theme-muted uppercase font-black mt-1">JPEG, PNG Max 700KB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {error}
              </div>
            )}

            <button
              disabled={!file || isSubmitting}
              onClick={handleSubmit}
              className="w-full mt-6 bg-theme-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-theme-accent/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting Receipt...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit Payment Proof
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
