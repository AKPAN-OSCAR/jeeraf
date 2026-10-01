import React from 'react';
import { motion } from 'motion/react';
import { StarryBackground } from './StarryBackground';
import { Footer } from './Footer';
import { SupportButton } from './SupportButton';
import { ArrowRight, GraduationCap } from 'lucide-react';

interface WelcomeProps {
  onProceed: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onProceed }) => {
  return (
    <StarryBackground>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-2xl backdrop-blur-md overflow-hidden bg-slate-950 p-2">
            <img 
              src="/jeeraf-with-name.svg" 
              alt="JeeRaf CBT" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            JeeRaf <span className="text-theme-accent">CBT</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto font-light leading-relaxed">
            Excellence in Computer Based Testing. Comprehensive JAMB, WAEC, and AI-Powered Examination Studio.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onProceed}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-8 py-4 bg-white text-theme-bg font-bold rounded-full flex items-center gap-3 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
        >
          Proceed to Login
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
      <Footer />
      <SupportButton />
    </StarryBackground>
  );
};
