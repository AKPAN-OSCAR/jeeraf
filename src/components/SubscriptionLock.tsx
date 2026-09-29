import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Copy, Check, ExternalLink, LogOut, Loader2, ShieldCheck, Zap } from 'lucide-react';

interface SubscriptionLockProps {
  user: any;
  onLogout: () => void;
  onConfirmPayment: () => void;
}

export const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ user, onLogout, onConfirmPayment }) => {
  const emailClean = user?.email?.toLowerCase().trim();
  const isAdmin = emailClean === 'eemmpatech@gmail.com' || emailClean === 'eemmpatec@gmail.com';
  if (isAdmin) return null;

  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const accountNumber = "238XXXXXXX";
  const bankName = "Zenith Bank PLC";
  const accountName = "CBT PREP SERVICES";
  const amountClaxy = "₦5,000";
  const amountPro = "₦8,000";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      try {
        await onConfirmPayment();
        setShowSuccess(true);
      } catch (err) {
        setIsVerifying(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div 
            key="lock-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-lg bg-theme-bg rounded-[2.5rem] overflow-hidden shadow-2xl border border-theme-border text-theme-text"
          >
            <div className="bg-theme-card p-8 text-center relative overflow-hidden border-b border-theme-border">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-theme-accent rounded-3xl flex items-center justify-center mb-4 shadow-xl text-white">
                  <Lock size={32} />
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-none text-theme-text">TRIAL EXPIRED</h2>
                <p className="text-xs text-theme-muted mt-2 font-medium">Choose a half-yearly subscription plan to unlock full CBT access</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-theme-card border border-theme-border rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-theme-accent">Claxy Mode</span>
                  <p className="text-xl font-black text-theme-text">{amountClaxy}</p>
                  <p className="text-[9px] text-theme-muted font-bold uppercase">6 Months Access</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-theme-accent to-indigo-600 text-white rounded-2xl text-center space-y-1 shadow-lg">
                  <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">Claxy Pro</span>
                  <p className="text-xl font-black">{amountPro}</p>
                  <p className="text-[9px] text-white/80 font-bold uppercase">6 Months Access</p>
                </div>
              </div>

              <div className="bg-theme-card rounded-2xl p-6 border border-theme-border space-y-4">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <div>
                    <p className="text-[10px] font-bold text-theme-muted uppercase">Bank Name</p>
                    <p className="text-sm font-bold text-theme-text">{bankName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-theme-muted uppercase">Account Name</p>
                    <p className="text-xs font-bold text-theme-text">{accountName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-theme-muted uppercase">Account Number</p>
                    <p className="text-lg font-black text-theme-accent tracking-widest">{accountNumber}</p>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 bg-theme-bg text-theme-accent rounded-xl border border-theme-border hover:bg-theme-card transition-all"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-theme-accent text-white font-black py-4 rounded-xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      VERIFYING PAYMENT...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      CONFIRM PAYMENT & UNLOCK
                    </>
                  )}
                </button>
                
                <button 
                  onClick={onLogout}
                  className="w-full py-3 text-theme-muted font-bold border border-theme-border rounded-xl hover:bg-theme-card transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Exit Account
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-theme-card rounded-3xl p-8 text-center shadow-2xl space-y-6 border border-theme-border text-theme-text"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black">PAYMENT VERIFIED!</h2>
              <p className="text-xs text-theme-muted mt-1">Your half-yearly subscription is now active.</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-theme-accent text-white font-black py-4 rounded-xl shadow-xl hover:opacity-90 transition-all text-xs"
            >
              CONTINUE TO DASHBOARD
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
