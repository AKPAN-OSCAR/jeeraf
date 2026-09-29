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
          className="mb-8"
        >
          <div className="w-24 h-24 bg-theme-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-theme-accent/30 backdrop-blur-md">
            <GraduationCap size={48} className="text-theme-accent" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            JeeRaf <span className="text-theme-accent">CBT</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Excellence in Computer Based Testing. Prepare for your future with our JAMB-style examination system.
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
