import React from 'react';
import { motion } from 'motion/react';

// SVG GOLD CREST - Crown, Monogram, Twin Crescents
export const JeeRafGoldIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = "w-full h-full", style, ...props }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      <defs>
        {/* Premium gold gradient */}
        <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF5C2" />
          <stop offset="20%" stopColor="#E5C158" />
          <stop offset="40%" stopColor="#B28929" />
          <stop offset="60%" stopColor="#FDE68A" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Silver gradient */}
        <linearGradient id="silverMetal" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E5E7EB" />
          <stop offset="50%" stopColor="#9CA3AF" />
          <stop offset="70%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>

        <filter id="iconShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter="url(#iconShadow)">
        {/* Outer crescent protective arcs */}
        <path 
          d="M 230 80 C 130 90 90 200 130 310 C 160 380 210 410 230 420 C 210 400 150 340 140 250 C 130 160 200 100 230 80 Z" 
          fill="url(#goldMetal)" 
        />
        <path 
          d="M 270 80 C 370 90 410 200 370 310 C 340 380 290 410 270 420 C 290 400 350 340 360 250 C 370 160 300 100 270 80 Z" 
          fill="url(#goldMetal)" 
        />

        {/* Thin gold circle frame */}
        <circle cx="250" cy="250" r="185" stroke="url(#goldMetal)" strokeWidth="2.5" strokeOpacity="0.5" />

        {/* Silver 'S' shape */}
        <path 
          d="M 290 150 
             C 210 140 170 190 190 240 
             C 210 280 290 290 300 330 
             C 310 380 250 410 200 390 
             C 170 380 180 350 190 350 
             C 195 350 205 365 220 370 
             C 245 380 275 360 270 330 
             C 260 290 190 280 180 235 
             C 170 180 230 130 300 140
             Z" 
          fill="url(#silverMetal)" 
        />

        {/* Gold 'I' Column anchor shape */}
        <path 
          d="M 242 135 L 258 135 L 258 370 C 258 390 280 405 310 415 C 290 415 270 410 258 395 L 258 420 L 242 420 L 242 395 C 230 410 210 415 190 415 C 220 405 242 390 242 370 Z" 
          fill="url(#goldMetal)" 
        />

        {/* Beautiful Crown on top */}
        <rect x="236" y="118" width="28" height="4" rx="1.5" fill="url(#goldMetal)" />
        <path d="M 238 118 L 230 102 L 242 108 L 250 95 L 258 108 L 270 102 L 262 118 Z" fill="url(#goldMetal)" />
        <circle cx="230" cy="102" r="2.5" fill="#FFFFFF" />
        <circle cx="242" cy="108" r="2" fill="#FFFFFF" />
        <circle cx="250" cy="95" r="3" fill="#FFFFFF" />
        <circle cx="258" cy="108" r="2" fill="#FFFFFF" />
        <circle cx="270" cy="102" r="2.5" fill="#FFFFFF" />

        {/* Golden silhouette of Akwa Ibom State at the bottom center */}
        <path 
          d="M 250 435 
             C 242 435 237 442 235 448 
             C 233 454 237 460 240 464 
             C 243 468 245 470 248 475 
             C 250 478 252 475 254 472
             C 256 469 259 467 261 462 
             C 263 457 265 452 263 446 
             C 261 440 256 435 250 435 Z" 
          fill="url(#goldMetal)" 
        />
      </g>
    </svg>
  );
};

// SVG SILVER LOGO WITH TYPOGRAPHY - Interlocking Monogram, "JeeRaf", "INTEGRITY. PURPOSE. IMPACT."
export const JeeRafSilverLogo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = "w-full h-full", style, ...props }) => {
  return (
    <svg 
      viewBox="0 0 800 800" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...props}
    >
      <defs>
        {/* Soft studio radial lighting vignette background */}
        <radialGradient id="vignetteBg" cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
          <stop offset="0%" stopColor="#1c212c" />
          <stop offset="60%" stopColor="#0a0d13" />
          <stop offset="100%" stopColor="#040508" />
        </radialGradient>

        {/* Master silver metallic gradient with sharp chrome-like bands */}
        <linearGradient id="silverMetalLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="18%" stopColor="#E5E7EB" />
          <stop offset="35%" stopColor="#7F8694" />
          <stop offset="50%" stopColor="#F3F4F6" />
          <stop offset="68%" stopColor="#9CA3AF" />
          <stop offset="85%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Highlight side for chiseled look */}
        <linearGradient id="silverLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#E5E7EB" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.2" />
        </linearGradient>

        {/* Shadow side for chiseled look */}
        <linearGradient id="silverShadow" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4B5563" stopOpacity="0.3" />
        </linearGradient>

        {/* Soft shadow filter to give depth */}
        <filter id="luxuryShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* Glow for high-end feel */}
        <filter id="ambientGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark Studio Background with subtle leather-like radial vignette */}
      <rect width="800" height="800" fill="url(#vignetteBg)" />

      {/* Main emblem container with dropshadow */}
      <g filter="url(#luxuryShadow)">
        {/* Outer perfect metallic ring */}
        <circle cx="400" cy="330" r="162" stroke="url(#silverMetalLogo)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="400" cy="330" r="154" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" />

        {/* INTERLOCKING MONOGRAM */}
        
        {/* 1. Base 'S' Curve Layer (back part to blend seamlessly) */}
        <path 
          d="M 465 242 
             C 410 215 330 245 348 310 
             C 362 360 440 365 448 405 
             C 458 450 405 482 342 452" 
          stroke="url(#silverMetalLogo)" 
          strokeWidth="24" 
          strokeLinecap="round"
          fill="none"
        />

        {/* 2. Highlight ridge on the S for 3D depth */}
        <path 
          d="M 463 241 
             C 410 216 333 246 349 309 
             C 363 359 439 364 447 404 
             C 457 449 406 480 344 451" 
          stroke="url(#silverLight)" 
          strokeWidth="6" 
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* 3. The vertical 'I' column in front/behind */}
        {/* Top Serif of the 'I' */}
        <path 
          d="M 360 218 L 440 218 L 430 234 L 370 234 Z" 
          fill="url(#silverMetalLogo)" 
        />
        {/* Main 'I' Stem */}
        <rect x="388" y="230" width="24" height="200" fill="url(#silverMetalLogo)" />
        <rect x="388" y="230" width="6" height="200" fill="url(#silverLight)" opacity="0.7" />
        <rect x="406" y="230" width="6" height="200" fill="url(#silverShadow)" opacity="0.5" />

        {/* 4. Beautiful Chiseled 3D Pyramid Pedestal Base of the 'I' column at the lower intersection */}
        {/* Left facet of the pyramid */}
        <path 
          d="M 400 420 L 350 472 L 400 472 Z" 
          fill="url(#silverLight)" 
        />
        {/* Right facet of the pyramid */}
        <path 
          d="M 400 420 L 450 472 L 400 472 Z" 
          fill="url(#silverShadow)" 
        />
        {/* Center ridge highlight of the pyramid */}
        <line x1="400" y1="420" x2="400" y2="472" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" />

        {/* Bottom flat base bar of the pedestal */}
        <rect x="340" y="472" width="120" height="6" rx="1" fill="url(#silverMetalLogo)" />
      </g>

      {/* BRAND TYPOGRAPHY - matches image 3 perfectly */}
      <g filter="url(#luxuryShadow)">
        {/* "JeeRaf" text in a luxury Serif font */}
        <text 
          x="400" 
          y="575" 
          textAnchor="middle" 
          fontFamily="Georgia, 'Times New Roman', serif" 
          fontWeight="bold" 
          fontSize="56" 
          fill="url(#silverMetalLogo)"
          letterSpacing="4"
        >
          JeeRaf
        </text>

        {/* Pure bright overlay for pristine contrast */}
        <text 
          x="400" 
          y="575" 
          textAnchor="middle" 
          fontFamily="Georgia, 'Times New Roman', serif" 
          fontWeight="bold" 
          fontSize="56" 
          fill="url(#silverLight)"
          letterSpacing="4"
          opacity="0.3"
        >
          JeeRaf
        </text>

        {/* Elegant horizontal divider with center bead */}
        <line x1="240" y1="615" x2="560" y2="615" stroke="url(#silverMetalLogo)" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="400" cy="615" r="5" fill="url(#silverMetalLogo)" />
        <circle cx="400" cy="615" r="5" fill="#FFFFFF" opacity="0.5" filter="url(#ambientGlow)" />

        {/* "INTEGRITY. PURPOSE. IMPACT." subtitle */}
        <text 
          x="400" 
          y="656" 
          textAnchor="middle" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="800" 
          fontSize="14" 
          fill="url(#silverMetalLogo)" 
          fillOpacity="0.85"
          letterSpacing="9"
        >
          INTEGRITY. PURPOSE. IMPACT.
        </text>
      </g>
    </svg>
  );
};

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
      {/* Glow Backdrop when loading */}
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
          className={`absolute -inset-1 bg-gradient-to-tr from-amber-500/30 via-theme-accent/20 to-indigo-500/30 blur-lg rounded-full`}
        />
      )}

      {/* Main Icon container */}
      <motion.div
        animate={isLoading ? {
          scale: [1, 1.06, 0.96, 1.04, 1],
          rotate: [0, 5, -5, 3, 0],
        } : {}}
        transition={isLoading ? {
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        className={`relative overflow-hidden border border-white/10 shadow-lg bg-slate-950 flex items-center justify-center ${sizeClasses[size]}`}
      >
        {/* Render our custom Gold Icon vector directly - no connection or upload error! */}
        <JeeRafGoldIcon className="w-full h-full object-contain" />
      </motion.div>

      {/* Active Dot / loading state badge */}
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

        {/* Central Spinning Gold Crest Vector */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-1 rounded-full overflow-hidden border border-amber-500/20 shadow-xl shadow-amber-500/10 bg-slate-950 flex items-center justify-center"
        >
          <JeeRafGoldIcon className="w-[85%] h-[85%] object-contain" />
        </motion.div>
      </div>
      {text && (
        <p className="text-theme-muted text-xs font-semibold tracking-wider uppercase animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Backward compatibility exports
export const ZeeRafGoldIcon = JeeRafGoldIcon;
export const ZeeRafSilverLogo = JeeRafSilverLogo;
export const SilverIbomGoldIcon = JeeRafGoldIcon;
export const SilverIbomSilverLogo = JeeRafSilverLogo;


