import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, GripHorizontal, Move, ArrowUpRight, ArrowUpLeft, ArrowDownLeft, ArrowDownRight } from 'lucide-react';
import { cn } from '../data/lib/utils';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  
  // Track active corner snap: 'tl' | 'tr' | 'bl' | 'br'
  const [activeCorner, setActiveCorner] = useState<'tl' | 'tr' | 'bl' | 'br'>('tr');
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Default to top-right
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const w = typeof window !== 'undefined' ? window.innerWidth : 360;
    const h = typeof window !== 'undefined' ? window.innerHeight : 640;
    const offset = isMobile ? 12 : 24;
    return {
      x: (w / 2 - 145) - offset,
      y: -(h / 2 - 190) + offset
    };
  });

  const handleDigit = (digit: string) => {
    if (display === 'Error') {
      setDisplay(digit === '.' ? '0.' : digit);
      setEquation([]);
      setShouldReset(false);
      return;
    }
    
    if (digit === '.' && display.includes('.')) return;
    if (display.length > 12 && !shouldReset) return;

    if (shouldReset || display === '0') {
      setDisplay(digit === '.' ? '0.' : digit);
      setShouldReset(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;

    if (shouldReset && equation.length > 0) {
      const lastItem = equation[equation.length - 1];
      if (['+', '-', '×', '÷'].includes(lastItem)) {
        const newEq = [...equation];
        newEq[newEq.length - 1] = op;
        setEquation(newEq);
        return;
      }
    }

    setEquation([...equation, display, op]);
    setShouldReset(true);
  };

  const calculate = () => {
    if (equation.length === 0) return;
    try {
      const fullEquation = [...equation, display].join(' ');
      const evalString = fullEquation.replace(/×/g, '*').replace(/÷/g, '/');
      
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${evalString}`)();
      
      if (!isFinite(result)) {
        setDisplay('Error');
      } else {
        const formattedResult = parseFloat(result.toFixed(8));
        const finalResult = String(formattedResult);
        setDisplay(finalResult.length > 15 ? finalResult.slice(0, 15) : finalResult);
      }
      setEquation([]);
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
      setEquation([]);
      setShouldReset(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation([]);
    setShouldReset(false);
  };

  const handleClearEntry = () => {
    setDisplay('0');
    setEquation([]);
    setShouldReset(false);
  };

  const handleSqrt = () => {
    if (display === 'Error') return;
    const val = parseFloat(display);
    if (val < 0) {
      setDisplay('Error');
    } else {
      const res = Math.sqrt(val);
      setDisplay(String(parseFloat(res.toFixed(8))));
    }
    setShouldReset(true);
  };

  const handlePercentage = () => {
    if (display === 'Error') return;
    const val = parseFloat(display);
    const res = val / 100;
    setDisplay(String(parseFloat(res.toFixed(8))));
    setShouldReset(true);
  };

  const buttons = [
    { label: '7', type: 'digit' }, { label: '8', type: 'digit' }, { label: '9', type: 'digit' }, { label: '÷', type: 'op' },
    { label: '4', type: 'digit' }, { label: '5', type: 'digit' }, { label: '6', type: 'digit' }, { label: '×', type: 'op' },
    { label: '1', type: 'digit' }, { label: '2', type: 'digit' }, { label: '3', type: 'digit' }, { label: '-', type: 'op' },
    { label: '0', type: 'digit' }, { label: '.', type: 'digit' }, { label: '=', type: 'equal' }, { label: '+', type: 'op' },
    { label: 'CE', type: 'ce' }, { label: 'C', type: 'clear' }, { label: '%', type: 'special' }, { label: '√', type: 'special' },
  ];

  const handleClick = (btn: typeof buttons[0]) => {
    switch (btn.type) {
      case 'digit': handleDigit(btn.label); break;
      case 'op': handleOperator(btn.label); break;
      case 'equal': calculate(); break;
      case 'clear': handleClear(); break;
      case 'ce': handleClearEntry(); break;
      case 'special':
        if (btn.label === '√') handleSqrt();
        if (btn.label === '%') handlePercentage();
        break;
    }
  };

  // Quick corner snap: Top-Left, Top-Right, Bottom-Left, Bottom-Right
  const snapToCorner = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    setActiveCorner(corner);
    const isMobile = window.innerWidth < 640;
    const offset = isMobile ? 12 : 24;
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const calcHalfW = isMobile ? 140 : 155;
    const calcHalfH = isMobile ? 180 : 195;

    switch (corner) {
      case 'tl':
        setPosition({ x: -(halfW - calcHalfW) + offset, y: -(halfH - calcHalfH) + offset });
        break;
      case 'tr':
        setPosition({ x: (halfW - calcHalfW) - offset, y: -(halfH - calcHalfH) + offset });
        break;
      case 'bl':
        setPosition({ x: -(halfW - calcHalfW) + offset, y: (halfH - calcHalfH) - offset });
        break;
      case 'br':
        setPosition({ x: (halfW - calcHalfW) - offset, y: (halfH - calcHalfH) - offset });
        break;
    }
  };

  // When user drags and releases, detect which corner was closest and snap smoothly
  const handleDragEnd = (_: any, info: any) => {
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    const isRight = newX > 0;
    const isBottom = newY > 0;
    const closestCorner: 'tl' | 'tr' | 'bl' | 'br' = isRight 
      ? (isBottom ? 'br' : 'tr') 
      : (isBottom ? 'bl' : 'tl');
    snapToCorner(closestCorner);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-2">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.06}
        animate={position}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        className="pointer-events-auto bg-theme-card rounded-3xl overflow-hidden shadow-2xl w-72 sm:w-80 border-4 border-amber-500/40 select-none shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Thumb Draggable Header */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-theme-card via-theme-bg to-theme-card text-theme-text border-b border-theme-border cursor-grab active:cursor-grabbing touch-none select-none">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
              <GripHorizontal size={18} className="text-amber-500 animate-pulse" />
              <span>CBT Calc</span>
              <span className="text-[10px] text-theme-muted font-normal">(Push to corner)</span>
            </div>

            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="p-1 hover:bg-rose-500/10 text-theme-muted hover:text-rose-500 rounded-lg transition-colors"
              title="Close Calculator"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Thumb Corner Snaps (TR, TL, BR, BL) */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-theme-border/50 text-[10px] font-bold">
            <span className="text-theme-muted text-[9px] uppercase tracking-wider">Snap:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => snapToCorner('tl')}
                className={cn(
                  "px-2 py-0.5 rounded-md font-mono font-black border transition-all flex items-center gap-0.5",
                  activeCorner === 'tl' 
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm" 
                    : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                )}
                title="Push to Top-Left"
              >
                <ArrowUpLeft size={10} />
                <span>TL</span>
              </button>
              <button
                type="button"
                onClick={() => snapToCorner('tr')}
                className={cn(
                  "px-2 py-0.5 rounded-md font-mono font-black border transition-all flex items-center gap-0.5",
                  activeCorner === 'tr' 
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm" 
                    : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                )}
                title="Push to Top-Right"
              >
                <ArrowUpRight size={10} />
                <span>TR</span>
              </button>
              <button
                type="button"
                onClick={() => snapToCorner('bl')}
                className={cn(
                  "px-2 py-0.5 rounded-md font-mono font-black border transition-all flex items-center gap-0.5",
                  activeCorner === 'bl' 
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm" 
                    : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                )}
                title="Push to Bottom-Left"
              >
                <ArrowDownLeft size={10} />
                <span>BL</span>
              </button>
              <button
                type="button"
                onClick={() => snapToCorner('br')}
                className={cn(
                  "px-2 py-0.5 rounded-md font-mono font-black border transition-all flex items-center gap-0.5",
                  activeCorner === 'br' 
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm" 
                    : "bg-theme-bg text-theme-muted hover:text-theme-text border-theme-border"
                )}
                title="Push to Bottom-Right"
              >
                <ArrowDownRight size={10} />
                <span>BR</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-theme-bg">
          {/* Display */}
          <div className="bg-theme-card border-2 border-theme-border rounded-2xl p-3 mb-3 min-h-[68px] flex flex-col items-end justify-center shadow-inner">
            <div className="text-[11px] font-mono text-theme-muted mb-0.5 h-4 overflow-hidden text-right w-full">
              {equation.join(' ')}
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-theme-text tracking-tight text-right w-full overflow-hidden">
              {display}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClick(btn);
                }}
                className={cn(
                  "h-10 sm:h-11 rounded-xl font-black text-sm sm:text-base transition-all active:scale-95 shadow-sm flex items-center justify-center",
                  btn.type === 'digit' && "bg-theme-card text-theme-text hover:bg-theme-bg border border-theme-border",
                  btn.type === 'op' && "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-700",
                  btn.type === 'equal' && "bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 font-black",
                  btn.type === 'clear' && "bg-rose-600 text-white hover:bg-rose-500 border border-rose-700",
                  btn.type === 'ce' && "bg-orange-600 text-white hover:bg-orange-500 border border-orange-700",
                  btn.type === 'special' && "bg-theme-card text-theme-text hover:bg-theme-bg border border-theme-border"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
