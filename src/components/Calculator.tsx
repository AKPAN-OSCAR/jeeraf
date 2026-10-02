import React, { useState } from 'react';
import { motion, useDragControls } from 'motion/react';
import { 
  X, GripHorizontal, Minus, Maximize2,
  ArrowUpRight, ArrowUpLeft, ArrowDownLeft, ArrowDownRight,
  Calculator as CalcIcon, Delete
} from 'lucide-react';
import { cn } from '../data/lib/utils';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);
  
  // Minimize / Enlarge state (Requirement 2)
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Drag controls so only the header bar / drag handle initiates dragging
  // This completely eliminates button click glitching (Requirement 3)
  const dragControls = useDragControls();

  // Corner positioning state: 'free' or snapped to one of the 4 corners
  const [cornerPosition, setCornerPosition] = useState<'tr' | 'tl' | 'br' | 'bl' | 'free'>('tr');

  const handleDigit = (digit: string) => {
    if (display === 'Error') {
      setDisplay(digit === '.' ? '0.' : digit);
      setEquation([]);
      setShouldReset(false);
      return;
    }
    
    if (digit === '.' && display.includes('.')) return;
    if (display.length > 14 && !shouldReset) return;

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

  const handleBackspace = () => {
    if (display === 'Error' || shouldReset) {
      handleClear();
      return;
    }
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
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

  const handlePlusMinus = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const buttons = [
    { label: 'C', type: 'clear' },
    { label: '⌫', type: 'backspace' },
    { label: '%', type: 'special' },
    { label: '÷', type: 'op' },

    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '×', type: 'op' },

    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '-', type: 'op' },

    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'op' },

    { label: '±', type: 'plusminus' },
    { label: '0', type: 'digit' },
    { label: '.', type: 'digit' },
    { label: '=', type: 'equal' },

    { label: '√', type: 'sqrt' },
  ];

  const handleClick = (btn: typeof buttons[0]) => {
    switch (btn.type) {
      case 'digit': handleDigit(btn.label); break;
      case 'op': handleOperator(btn.label); break;
      case 'equal': calculate(); break;
      case 'clear': handleClear(); break;
      case 'backspace': handleBackspace(); break;
      case 'special': handlePercentage(); break;
      case 'sqrt': handleSqrt(); break;
      case 'plusminus': handlePlusMinus(); break;
    }
  };

  // Corner positioning classes for instant flinging out of the question's way
  const getCornerClass = () => {
    if (cornerPosition === 'tl') return 'top-14 left-2 sm:top-16 sm:left-6';
    if (cornerPosition === 'bl') return 'bottom-16 left-2 sm:bottom-6 sm:left-6';
    if (cornerPosition === 'br') return 'bottom-16 right-2 sm:bottom-6 sm:right-6';
    // default 'tr'
    return 'top-14 right-2 sm:top-16 sm:right-6';
  };

  return (
    <div className={cn(
      "fixed z-[70] transition-all duration-300 pointer-events-auto",
      cornerPosition !== 'free' ? getCornerClass() : "top-20 right-4"
    )}>
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.08}
        onDragStart={() => setCornerPosition('free')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "bg-theme-card border-2 border-amber-500/70 rounded-3xl shadow-2xl overflow-hidden transition-all select-none backdrop-blur-md",
          isMinimized 
            ? "w-64 border-amber-500 shadow-amber-500/20" 
            : isEnlarged
              ? "w-[330px] sm:w-[380px] shadow-2xl"
              : "w-[280px] sm:w-[320px] shadow-2xl"
        )}
      >
        {/* DRAGGABLE HEADER BAR (Only this bar initiates dragging to avoid key glitching) */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="px-3.5 py-2.5 bg-gradient-to-r from-theme-card via-amber-500/10 to-theme-card text-theme-text border-b border-theme-border cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-between gap-2"
        >
          {/* Drag Handle & Title */}
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
            <GripHorizontal size={18} className="text-amber-500 shrink-0" />
            <CalcIcon size={14} className="text-amber-500 shrink-0" />
            <span>CBT Calc</span>
            {isMinimized && (
              <span className="font-mono text-xs text-theme-text font-black ml-1 truncate max-w-[90px]">
                = {display}
              </span>
            )}
          </div>

          {/* Quick Corner Snap Buttons (Requirement 2: Push to top right, top left, bottom left, bottom right) */}
          <div className="flex items-center gap-0.5 bg-theme-bg/80 px-1 py-0.5 rounded-lg border border-theme-border/60">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCornerPosition('tl'); }}
              className={cn("p-1 rounded text-theme-muted hover:text-amber-500 transition-colors", cornerPosition === 'tl' && "text-amber-500 bg-amber-500/10")}
              title="Snap to Top-Left"
            >
              <ArrowUpLeft size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCornerPosition('tr'); }}
              className={cn("p-1 rounded text-theme-muted hover:text-amber-500 transition-colors", cornerPosition === 'tr' && "text-amber-500 bg-amber-500/10")}
              title="Snap to Top-Right"
            >
              <ArrowUpRight size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCornerPosition('bl'); }}
              className={cn("p-1 rounded text-theme-muted hover:text-amber-500 transition-colors", cornerPosition === 'bl' && "text-amber-500 bg-amber-500/10")}
              title="Snap to Bottom-Left"
            >
              <ArrowDownLeft size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCornerPosition('br'); }}
              className={cn("p-1 rounded text-theme-muted hover:text-amber-500 transition-colors", cornerPosition === 'br' && "text-amber-500 bg-amber-500/10")}
              title="Snap to Bottom-Right"
            >
              <ArrowDownRight size={12} />
            </button>
          </div>

          {/* Controls: Minimize, Enlarge, Close */}
          <div className="flex items-center gap-1">
            {/* Minimize Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(prev => !prev);
              }}
              className="p-1 hover:bg-theme-bg text-theme-muted hover:text-amber-500 rounded-lg transition-colors"
              title={isMinimized ? "Expand Calculator" : "Minimize to Floating Pill"}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
            </button>

            {/* Enlarge Toggle */}
            {!isMinimized && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEnlarged(prev => !prev);
                }}
                className={cn(
                  "p-1 hover:bg-theme-bg rounded-lg transition-colors",
                  isEnlarged ? "text-amber-500" : "text-theme-muted hover:text-theme-text"
                )}
                title={isEnlarged ? "Standard Size" : "Enlarge Touch Keypad"}
              >
                <Maximize2 size={13} />
              </button>
            )}

            {/* Close Button */}
            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                onClose(); 
              }} 
              className="p-1 hover:bg-rose-500/20 text-theme-muted hover:text-rose-500 rounded-lg transition-colors"
              title="Close Calculator"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* FULL DIGITAL DISPLAY & TOUCH-READY KEYPAD */}
        {!isMinimized && (
          <div className={cn(
            "bg-theme-bg space-y-2.5",
            isEnlarged ? "p-4 space-y-3.5" : "p-3 sm:p-3.5"
          )}>
            {/* Digital Display */}
            <div className={cn(
              "bg-theme-card border-2 border-theme-border rounded-2xl flex flex-col items-end justify-center shadow-inner",
              isEnlarged ? "p-3.5 min-h-[70px]" : "p-2.5 min-h-[58px]"
            )}>
              <div className="text-[11px] font-mono text-theme-muted mb-0.5 h-4 overflow-hidden text-right w-full">
                {equation.join(' ')}
              </div>
              <div className={cn(
                "font-mono font-black text-theme-text tracking-tight text-right w-full overflow-hidden truncate",
                isEnlarged ? "text-3xl" : "text-2xl"
              )}>
                {display}
              </div>
            </div>

            {/* Keypad Grid (Standard 4-Column Layout) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleClick(btn)}
                  className={cn(
                    "rounded-xl font-black transition-all active:scale-90 shadow-sm flex items-center justify-center cursor-pointer select-none",
                    isEnlarged ? "h-12 text-base" : "h-9 sm:h-10 text-sm",
                    btn.type === 'digit' && "bg-theme-card text-theme-text hover:bg-theme-bg border border-theme-border",
                    btn.type === 'op' && "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-700",
                    btn.type === 'equal' && "bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 font-black",
                    btn.type === 'clear' && "bg-rose-600 text-white hover:bg-rose-500 border border-rose-700",
                    btn.type === 'backspace' && "bg-orange-600 text-white hover:bg-orange-500 border border-orange-700",
                    (btn.type === 'special' || btn.type === 'sqrt' || btn.type === 'plusminus') && "bg-theme-card text-amber-500 hover:bg-theme-bg border border-theme-border font-bold"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Hint Bar */}
            <div className="flex items-center justify-between text-[10px] text-theme-muted pt-0.5 px-0.5">
              <span>Drag top bar to move</span>
              <span className="text-amber-500 font-bold">Tap arrows to snap corner</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
