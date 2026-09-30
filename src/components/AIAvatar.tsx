import React from 'react';
import { motion } from 'motion/react';

export interface JeeRafHeadIconProps {
  className?: string;
  size?: number | string;
  variant?: 'natural' | 'white' | 'black' | 'glow';
  style?: React.CSSProperties;
}

/**
 * AUTHENTIC JEERAF HEAD EMBLEM (NO NAME)
 * Derived directly from the uploaded file (silver-ibom1.jpeg / jeeraf-head).
 * Used across all AI components, dashboard cards, navigation headers, and avatar icons.
 */
export const JeeRafHeadIcon: React.FC<JeeRafHeadIconProps> = ({ 
  className = "w-full h-full", 
  size, 
  variant = 'natural',
  style 
}) => {
  const inlineStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style
  };

  if (variant === 'white') {
    return (
      <img 
        src="/jeeraf-head-white.svg" 
        alt="JeeRaf Emblem"
        className={`object-contain select-none pointer-events-none ${className}`}
        style={inlineStyle}
      />
    );
  }

  if (variant === 'black') {
    return (
      <img 
        src="/jeeraf-head-black.svg" 
        alt="JeeRaf Emblem"
        className={`object-contain select-none pointer-events-none ${className}`}
        style={inlineStyle}
      />
    );
  }

  // Default natural variant uses the authentic high-resolution artwork directly
  return (
    <img 
      src="/jeeraf-head.jpeg" 
      alt="JeeRaf Head Emblem"
      className={`object-cover rounded-xl select-none pointer-events-none ${className}`}
      style={inlineStyle}
    />
  );
};

export interface JeeRafLogoWithNameProps {
  className?: string;
  size?: number | string;
  variant?: 'natural' | 'white' | 'black';
  style?: React.CSSProperties;
}

/**
 * AUTHENTIC JEERAF LOGO WITH NAME
 * Derived directly from the uploaded file (silver-ibom3.jpeg / jeeraf-with-name).
 * Displayed on first screen loading (splash) and welcome screens.
 */
export const JeeRafLogoWithName: React.FC<JeeRafLogoWithNameProps> = ({
  className = "w-full h-full",
  size,
  variant = 'natural',
  style
}) => {
  const inlineStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style
  };

  if (variant === 'white') {
    return (
      <img 
        src="/jeeraf-logo-white.svg" 
        alt="JeeRaf"
        className={`object-contain select-none pointer-events-none ${className}`}
        style={inlineStyle}
      />
    );
  }

  if (variant === 'black') {
    return (
      <img 
        src="/jeeraf-logo-black.svg" 
        alt="JeeRaf"
        className={`object-contain select-none pointer-events-none ${className}`}
        style={inlineStyle}
      />
    );
  }

  return (
    <img 
      src="/jeeraf-with-name.jpeg" 
      alt="JeeRaf CBT System"
      className={`object-contain select-none rounded-2xl shadow-2xl ${className}`}
      style={inlineStyle}
    />
  );
};

// Aliases for seamless drop-in compatibility across codebase
export const JeeRafGoldIcon = JeeRafHeadIcon;
export const JeeRafSilverLogo = JeeRafLogoWithName;
export const JeeRafHeadEmblem = JeeRafHeadIcon;

interface AIAvatarProps {
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ isLoading = false, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {/* Ambient Pulsing Glow when loading */}
      {isLoading && (
        <motion.div
          animate={{
            scale: [1, 1.25, 0.95, 1.15, 1],
            opacity: [0.25, 0.65, 0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -inset-1 bg-gradient-to-tr from-amber-500/30 via-theme-accent/20 to-indigo-500/30 blur-lg rounded-full"
        />
      )}

      {/* Main Avatar Emblem Container */}
      <motion.div
        animate={isLoading ? {
          scale: [1, 1.06, 0.96, 1.04, 1],
          rotate: [0, 4, -4, 2, 0],
        } : {}}
        transition={isLoading ? {
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        className={`relative overflow-hidden border border-amber-500/30 shadow-lg bg-slate-950 flex items-center justify-center ${sizeClasses[size]}`}
      >
        <JeeRafHeadIcon className="w-full h-full object-cover" />
      </motion.div>

      {/* Status Active Badge */}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'} border border-slate-950`}></span>
      </span>
    </div>
  );
};

interface GoldSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

export const GoldSpinner: React.FC<GoldSpinnerProps> = ({ size = 64, text, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glowing thin ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-amber-500/40"
        />

        {/* Inner spinning gradient ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1.5 rounded-full border-t border-b border-amber-500/60 border-l-transparent border-r-transparent"
        />

        {/* Central Spinning JeeRaf Head Emblem Vector */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-1 rounded-full overflow-hidden border border-amber-500/30 shadow-xl shadow-amber-500/10 bg-slate-950 flex items-center justify-center"
        >
          <JeeRafHeadIcon className="w-[85%] h-[85%] object-cover rounded-full" />
        </motion.div>
      </div>
      {text && (
        <p className="text-theme-muted text-xs font-semibold tracking-wider uppercase animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Backward compatibility exports
export const ZeeRafGoldIcon = JeeRafHeadIcon;
export const ZeeRafSilverLogo = JeeRafLogoWithName;
export const SilverIbomGoldIcon = JeeRafHeadIcon;
export const SilverIbomSilverLogo = JeeRafLogoWithName;
