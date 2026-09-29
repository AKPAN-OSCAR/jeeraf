import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Delete } from 'lucide-react';
import { cn } from '../data/lib/utils';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-theme-card rounded-3xl overflow-hidden shadow-2xl w-80 border-4 border-theme-border select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-theme-card text-theme-text border-b border-theme-border">
        <span className="font-bold tracking-tight">CBT Calculator</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="p-1.5 hover:bg-theme-accent/10 text-theme-muted hover:text-theme-accent rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 bg-theme-bg">
        {/* Display */}
        <div className="bg-theme-card border-2 border-theme-border rounded-2xl p-5 mb-6 min-h-[96px] flex flex-col items-end justify-center shadow-inner">
          <div className="text-xs font-mono text-theme-muted mb-1 h-5 overflow-hidden text-right w-full">
            {equation.join(' ')}
          </div>
          <div className="text-4xl font-mono font-bold text-theme-text tracking-tighter text-right w-full overflow-hidden">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
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
                "h-14 rounded-2xl font-bold text-lg transition-all active:scale-90 shadow-sm flex items-center justify-center",
                btn.type === 'digit' && "bg-theme-card text-theme-text hover:opacity-80 border-b-4 border-theme-border",
                btn.type === 'op' && "bg-emerald-600 text-white hover:bg-emerald-700 border-b-4 border-emerald-800",
                btn.type === 'equal' && "bg-theme-accent text-white hover:opacity-90 border-b-4 border-theme-accent/70",
                btn.type === 'clear' && "bg-rose-500 text-white hover:bg-rose-600 border-b-4 border-rose-700",
                btn.type === 'ce' && "bg-orange-500 text-white hover:bg-orange-600 border-b-4 border-orange-700",
                btn.type === 'special' && "bg-theme-muted/20 text-theme-text hover:bg-theme-muted/30 border-b-4 border-theme-muted/40"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
