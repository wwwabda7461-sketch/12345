import React, { useState, useEffect, useRef } from 'react';
import { CalculatorMode, HistoryItem, LangType, TranslationDict } from './types';
import { TRANSLATIONS } from './data';
import { evaluateExpression, formatResult } from './utils/mathEvaluator';
import CalcButton from './components/CalcButton';
import UnitConverter from './components/UnitConverter';
import HistoryLogs from './components/HistoryLogs';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Settings, 
  History as HistoryIcon, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  Globe, 
  Copy, 
  Check, 
  Info, 
  Delete,
  Maximize2
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<LangType>('ar');
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [livePreview, setLivePreview] = useState<string>('');
  const [isDeg, setIsDeg] = useState<boolean>(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryPane, setShowHistoryPane] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Localization Dictionary lookup
  const t = TRANSLATIONS[lang];

  // Load history & memory from localStorage on startup
  useEffect(() => {
    const cachedHistory = localStorage.getItem('calc_history');
    if (cachedHistory) {
      try {
        setHistory(JSON.parse(cachedHistory));
      } catch (err) {
        console.error('Failed to parse history cache:', err);
      }
    }
    const cachedMemory = localStorage.getItem('calc_memory');
    if (cachedMemory) {
      const parsedMem = parseFloat(cachedMemory);
      if (!isNaN(parsedMem)) setMemory(parsedMem);
    }
  }, []);

  // Sync memory cache
  const updateMemory = (val: number) => {
    setMemory(val);
    localStorage.setItem('calc_memory', val.toString());
  };

  // Evaluate Expression live-ghost preview as user types
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setLivePreview('');
      return;
    }
    
    // Don't show live preview if the last char is an operator or a dangling parenthesis to avoid flashing errors
    const lastChar = expression.trim().slice(-1);
    if (['+', '−', '×', '÷', '%', '^', '('].includes(lastChar)) {
      return;
    }

    const testRes = evaluateExpression(expression, isDeg);
    if (testRes !== 'Error' && testRes !== expression) {
      setLivePreview(testRes);
    } else {
      setLivePreview('');
    }
  }, [expression, isDeg]);

  // Append character to formula expression
  const handleInput = (char: string) => {
    setExpression((prev) => {
      // Prevent consecutive dot markers
      if (char === '.' && prev.slice(-1) === '.') return prev;
      
      // If expression is "0" and input is a numeral (not dot/operator), replace "0"
      if (prev === '0' && !isNaN(Number(char))) return char;
      
      return prev + char;
    });
  };

  // Safe deletion backspace
  const handleBackspace = () => {
    setExpression((prev) => {
      if (!prev) return '';
      
      // Smart deletion of full multi-letter scientific functions
      const functions = [
        'asin(', 'acos(', 'atan(', 'sqrt(', 'cbrt(', 'abs(',
        'sin(', 'cos(', 'tan(', 'log(', 'ln('
      ];

      for (const fn of functions) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }

      if (prev.endsWith('Math.PI')) return prev.slice(0, -7);
      if (prev.endsWith('Math.E')) return prev.slice(0, -6);
      
      return prev.slice(0, -1);
    });
  };

  // Clear expression screen
  const handleClear = () => {
    setExpression('');
    setResult('');
    setLivePreview('');
  };

  // Smart Parentheses toggler
  const handleParentheses = () => {
    setExpression((prev) => {
      const openCount = (prev.match(/\(/g) || []).length;
      const closeCount = (prev.match(/\)/g) || []).length;
      
      // If last character is a digit or closing parenthesis, we close if openCount > closeCount
      const lastChar = prev.slice(-1);
      const isLastDigitOrParen = !isNaN(Number(lastChar)) || lastChar === ')' || lastChar === 'e' || lastChar === 'π' || lastChar === '!';
      
      if (openCount > closeCount && isLastDigitOrParen) {
        return prev + ')';
      } else {
        return prev + '(';
      }
    });
  };

  // Equals / Trigger Evaluation
  const handleEvaluate = () => {
    if (!expression || expression.trim() === '') return;

    const evalResult = evaluateExpression(expression, isDeg);
    setResult(evalResult);

    if (evalResult !== 'Error') {
      // Build history item
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: evalResult,
        timestamp: new Date(),
      };
      
      const nextHistory = [newItem, ...history].slice(0, 100); // Limit logs to 100
      setHistory(nextHistory);
      localStorage.setItem('calc_history', JSON.stringify(nextHistory));
      
      // Set the active expression as the result of this calculation, to allow continuing
      setExpression(evalResult);
    }
  };

  // Smart negate ± key handler
  const handleNegate = () => {
    // If no expression, start with negative minus
    if (!expression) {
      setExpression('−');
      return;
    }
    
    // Look at last numerical group and negate it
    setExpression((prev) => {
      // Find the last number token in the expression
      const match = prev.match(/([−+]?\d*\.?\d+$)/);
      if (match) {
        const fullMatch = match[0];
        const numberPortion = fullMatch.replace(/[−+]/, '');
        const sign = fullMatch.startsWith('−') ? '+' : '−';
        
        return prev.slice(0, -fullMatch.length) + (sign === '−' ? '−' + numberPortion : numberPortion);
      }
      return prev + '−';
    });
  };

  // Copy output to clipboard
  const copyDisplayResult = () => {
    const valueToCopy = result || expression || '0';
    if (!valueToCopy || valueToCopy === 'Error') return;
    navigator.clipboard.writeText(valueToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recall parameters from history
  const handleRecallExpression = (expr: string) => {
    setExpression(expr);
    setResult('');
  };

  const handleRecallResult = (res: string) => {
    setExpression((prev) => {
      const lastChar = prev.trim().slice(-1);
      // If ends in an operator, append the result
      if (['+', '−', '×', '÷', '%', '^'].includes(lastChar) || prev === '') {
        return prev + res;
      }
      return res;
    });
  };

  const clearHistoryLogs = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  // Keyboard integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus element check to ignore keyboard shortcuts when typing in unit converter input values
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      const key = e.key;
      let virtualKey: string | null = null;

      if (key >= '0' && key <= '9') {
        handleInput(key);
        virtualKey = `btn-${key}`;
      } else if (key === '.') {
        handleInput('.');
        virtualKey = 'btn-dot';
      } else if (key === '+') {
        handleInput('+');
        virtualKey = 'btn-plus';
      } else if (key === '-') {
        handleInput('−');
        virtualKey = 'btn-minus';
      } else if (key === '*') {
        handleInput('×');
        virtualKey = 'btn-multiply';
      } else if (key === '/') {
        handleInput('÷');
        virtualKey = 'btn-divide';
      } else if (key === '%') {
        handleInput('%');
        virtualKey = 'btn-modulo';
      } else if (key === '(') {
        handleInput('(');
        virtualKey = 'btn-lparen';
      } else if (key === ')') {
        handleInput(')');
        virtualKey = 'btn-rparen';
      } else if (key === '^') {
        handleInput('^');
        virtualKey = 'btn-power';
      } else if (key === '!') {
        handleInput('!');
        virtualKey = 'btn-factorial';
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
        virtualKey = 'btn-equal';
      } else if (key === 'Backspace') {
        handleBackspace();
        virtualKey = 'btn-backspace';
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleClear();
        virtualKey = 'btn-clear';
      }

      if (virtualKey) {
        setActiveKey(virtualKey);
        setTimeout(() => setActiveKey(null), 120);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, isDeg, history]);

  // Standard keyboard buttons configuration
  const standardKeys = [
    { label: 'C', variant: 'danger' as const, id: 'btn-clear', action: handleClear },
    { label: '( )', variant: 'func' as const, id: 'btn-paren', action: handleParentheses },
    { label: '%', variant: 'func' as const, id: 'btn-modulo', action: () => handleInput('%') },
    { label: '÷', variant: 'operator' as const, id: 'btn-divide', action: () => handleInput('÷') },
    
    { label: '7', variant: 'num' as const, id: 'btn-7', action: () => handleInput('7') },
    { label: '8', variant: 'num' as const, id: 'btn-8', action: () => handleInput('8') },
    { label: '9', variant: 'num' as const, id: 'btn-9', action: () => handleInput('9') },
    { label: '×', variant: 'operator' as const, id: 'btn-multiply', action: () => handleInput('×') },
    
    { label: '4', variant: 'num' as const, id: 'btn-4', action: () => handleInput('4') },
    { label: '5', variant: 'num' as const, id: 'btn-5', action: () => handleInput('5') },
    { label: '6', variant: 'num' as const, id: 'btn-6', action: () => handleInput('6') },
    { label: '−', variant: 'operator' as const, id: 'btn-minus', action: () => handleInput('−') },
    
    { label: '1', variant: 'num' as const, id: 'btn-1', action: () => handleInput('1') },
    { label: '2', variant: 'num' as const, id: 'btn-2', action: () => handleInput('2') },
    { label: '3', variant: 'num' as const, id: 'btn-3', action: () => handleInput('3') },
    { label: '+', variant: 'operator' as const, id: 'btn-plus', action: () => handleInput('+') },
    
    { label: '±', variant: 'num' as const, id: 'btn-negate', action: handleNegate },
    { label: '0', variant: 'num' as const, id: 'btn-0', action: () => handleInput('0') },
    { label: '.', variant: 'num' as const, id: 'btn-dot', action: () => handleInput('.') },
    { label: '=', variant: 'equal' as const, id: 'btn-equal', action: handleEvaluate },
  ];

  // Memory Operations
  const handleMemoryOperation = (op: 'MC' | 'MR' | 'M+' | 'M-') => {
    switch (op) {
      case 'MC':
        updateMemory(0);
        break;
      case 'MR':
        // Recall Memory to current expression
        setExpression((prev) => {
          if (prev === '0') return memory.toString();
          return prev + memory.toString();
        });
        break;
      case 'M+': {
        const testRes = evaluateExpression(expression || '0', isDeg);
        if (testRes !== 'Error') {
          updateMemory(memory + parseFloat(testRes));
        }
        break;
      }
      case 'M-': {
        const testRes = evaluateExpression(expression || '0', isDeg);
        if (testRes !== 'Error') {
          updateMemory(memory - parseFloat(testRes));
        }
        break;
      }
    }
  };

  // Scientific Extra Actions keys
  const scientificKeys = [
    // Memory and Mode indicators Row
    { label: 'MC', variant: 'danger' as const, id: 'btn-mc', action: () => handleMemoryOperation('MC'), subLabel: 'Clear' },
    { label: 'MR', variant: 'func' as const, id: 'btn-mr', action: () => handleMemoryOperation('MR'), subLabel: 'Recall' },
    { label: 'M+', variant: 'operator' as const, id: 'btn-mplus', action: () => handleMemoryOperation('M+'), subLabel: 'Add' },
    { label: 'M-', variant: 'operator' as const, id: 'btn-mminus', action: () => handleMemoryOperation('M-'), subLabel: 'Subtract' },
    { label: isDeg ? 'DEG' : 'RAD', variant: 'func' as const, id: 'btn-degrad', action: () => setIsDeg(!isDeg), className: 'text-rose-400 font-bold' },

    // Row 2: Trig functions / absolute
    { label: 'sin', variant: 'func' as const, id: 'btn-sin', action: () => handleInput('sin(') },
    { label: 'cos', variant: 'func' as const, id: 'btn-cos', action: () => handleInput('cos(') },
    { label: 'tan', variant: 'func' as const, id: 'btn-tan', action: () => handleInput('tan(') },
    { label: 'abs', variant: 'func' as const, id: 'btn-abs', action: () => handleInput('abs('), subLabel: '|x|' },
    { label: '(', variant: 'func' as const, id: 'btn-lparen', action: () => handleInput('(') },

    // Row 3: Inverse Trig & constants
    { label: 'asin', variant: 'func' as const, id: 'btn-asin', action: () => handleInput('asin('), subLabel: 'sin⁻¹' },
    { label: 'acos', variant: 'func' as const, id: 'btn-acos', action: () => handleInput('acos('), subLabel: 'cos⁻¹' },
    { label: 'atan', variant: 'func' as const, id: 'btn-atan', action: () => handleInput('atan('), subLabel: 'tan⁻¹' },
    { label: 'π', variant: 'func' as const, id: 'btn-pi', action: () => handleInput('π'), subLabel: '3.1415' },
    { label: ')', variant: 'func' as const, id: 'btn-rparen', action: () => handleInput(')') },

    // Row 4: Log / base e / powers
    { label: 'ln', variant: 'func' as const, id: 'btn-ln', action: () => handleInput('ln('), subLabel: 'log_e' },
    { label: 'log', variant: 'func' as const, id: 'btn-log', action: () => handleInput('log('), subLabel: 'log_10' },
    { label: 'x^y', variant: 'func' as const, id: 'btn-power', action: () => handleInput('^'), subLabel: 'Power' },
    { label: 'e', variant: 'func' as const, id: 'btn-e', action: () => handleInput('e'), subLabel: '2.7182' },
    { label: 'n!', variant: 'func' as const, id: 'btn-factorial', action: () => handleInput('!'), subLabel: 'Fact' },

    // Row 5: Square Roots / Standard Numbers begins mixing
    { label: '√x', variant: 'func' as const, id: 'btn-sqrt', action: () => handleInput('sqrt('), subLabel: 'sqrt' },
    { label: '7', variant: 'num' as const, id: 'btn-7', action: () => handleInput('7') },
    { label: '8', variant: 'num' as const, id: 'btn-8', action: () => handleInput('8') },
    { label: '9', variant: 'num' as const, id: 'btn-9', action: () => handleInput('9') },
    { label: '÷', variant: 'operator' as const, id: 'btn-divide', action: () => handleInput('÷') },

    // Row 6: Third-root / intermediate numbers
    { label: '³√x', variant: 'func' as const, id: 'btn-cbrt', action: () => handleInput('cbrt('), subLabel: 'cbrt' },
    { label: '4', variant: 'num' as const, id: 'btn-4', action: () => handleInput('4') },
    { label: '5', variant: 'num' as const, id: 'btn-5', action: () => handleInput('5') },
    { label: '6', variant: 'num' as const, id: 'btn-6', action: () => handleInput('6') },
    { label: '×', variant: 'operator' as const, id: 'btn-multiply', action: () => handleInput('×') },

    // Row 7
    { label: 'C', variant: 'danger' as const, id: 'btn-clear', action: handleClear },
    { label: '1', variant: 'num' as const, id: 'btn-1', action: () => handleInput('1') },
    { label: '2', variant: 'num' as const, id: 'btn-2', action: () => handleInput('2') },
    { label: '3', variant: 'num' as const, id: 'btn-3', action: () => handleInput('3') },
    { label: '−', variant: 'operator' as const, id: 'btn-minus', action: () => handleInput('−') },

    // Row 8
    { label: 'DEL', variant: 'num' as const, id: 'btn-backspace', action: handleBackspace, className: 'text-rose-400 bg-slate-800/10' },
    { label: '±', variant: 'num' as const, id: 'btn-negate', action: handleNegate },
    { label: '0', variant: 'num' as const, id: 'btn-0', action: () => handleInput('0') },
    { label: '.', variant: 'num' as const, id: 'btn-dot', action: () => handleInput('.') },
    { label: '+', variant: 'operator' as const, id: 'btn-plus', action: () => handleInput('+') },

    // Large equals row underneath science keys
    { label: '=', variant: 'equal' as const, id: 'btn-equal', action: handleEvaluate, className: 'col-span-5 h-14 md:h-16 mt-2' },
  ];

  return (
    <div 
      id="app-root-container"
      dir={lang === 'ar' ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col justify-between py-6 px-4 md:px-8 select-none font-sans relative"
    >
      
      {/* Decorative Gradient Glows for Premium Ambiance */}
      <div className="absolute top-[-5%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] rounded-full bg-violet-500/5 blur-[160px] pointer-events-none" />

      {/* Header Panel with cute Apple-style retro browser controls */}
      <header id="app-header" className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-5 z-10">
        
        {/* Logo, OS circles & branding */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 bg-[#121218] px-3 py-2 rounded-xl border border-white/5 select-none mr-2">
            <span className="w-2 rounded-full h-2 bg-rose-500 inline-block shadow-sm" />
            <span className="w-2 rounded-full h-2 bg-amber-500 inline-block shadow-sm" />
            <span className="w-2 rounded-full h-2 bg-emerald-500 inline-block shadow-sm" />
          </div>
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl shadow-lg shadow-emerald-500/10">
            <Calculator className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="text-right sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/25 tracking-wider font-mono">
                BENTO PRO v4.2
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight">
              {t.title}
            </h1>
          </div>
        </div>

        {/* Global toggles: Mode select, history drawer switch, language toggle */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Bento Mode Switcher Panel */}
          <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex items-center gap-0.5 shadow-lg">
            <button
              id="tab-mode-standard"
              onClick={() => setMode('standard')}
              className={`px-3 md:px-4.5 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                mode === 'standard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.standard}
            </button>
            <button
              id="tab-mode-scientific"
              onClick={() => setMode('scientific')}
              className={`px-3 md:px-4.5 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                mode === 'scientific'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.scientific}
            </button>
            <button
              id="tab-mode-converter"
              onClick={() => setMode('converter')}
              className={`px-3 md:px-4.5 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                mode === 'converter'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.converter}
            </button>
          </div>

          {/* Toggle History Side Drawer */}
          {mode !== 'converter' && (
            <button
              id="btn-toggle-history-pane"
              onClick={() => setShowHistoryPane(!showHistoryPane)}
              title={t.history}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                showHistoryPane
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
          )}

          {/* Language selector */}
          <button
            id="btn-toggle-lang"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all duration-150 border border-white/5 cursor-pointer text-xs font-bold"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid Frame */}
      <main className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10 flex-1">
        
        {/* Core Calculation UI Panel */}
        <div className={`
          ${mode === 'converter' ? 'lg:col-span-12' : showHistoryPane ? 'lg:col-span-8' : 'lg:col-span-12'} 
          transition-all duration-300 flex flex-col gap-6
        `}>
          
          {mode !== 'converter' ? (
            <div className="flex flex-col gap-6">
              
              {/* Display Screens Card (Bento Panel Primary) */}
              <div 
                id="display-screen" 
                onClick={copyDisplayResult}
                className="bento-panel-primary p-6 md:p-8 relative flex flex-col justify-between items-end gap-3 text-right group cursor-pointer hover:border-emerald-500/20 hover:shadow-emerald-500/[0.02] shadow-2xl transition-all duration-200 active:ring-1 active:ring-emerald-500/20 overflow-hidden"
              >
                {/* Visual Watermark matching reference */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-6xl md:text-7xl font-sans font-black select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
                  {lang === 'ar' ? 'حسابة احترافية' : 'PRO CALCULATOR'}
                </div>

                {/* Copied helper indicator overlay */}
                <span className="absolute left-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-[10px] text-gray-300 py-1 px-2.5 rounded-lg flex items-center gap-1 border border-white/5">
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                  <span>{copied ? t.copied : t.copy}</span>
                </span>

                {/* Status Bar Indicators (Memory state, Angle parameters) */}
                <div className="flex items-center gap-2 select-none self-start z-10">
                  <span className="text-[10px] bg-white/5 border border-white/5 font-mono text-slate-400 px-3 py-1 rounded-md">
                    {isDeg ? 'DEG' : 'RAD'}
                  </span>
                  {memory !== 0 && (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-400 px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" />
                      M = {formatResult(memory)}
                    </span>
                  )}
                </div>

                {/* Formulated Expression Row */}
                <div className="w-full text-right overflow-x-auto select-all scrollbar-none py-2 min-h-[48px] z-10">
                  <span id="expression-value" className="text-slate-350 text-xl md:text-2xl font-mono tracking-wide whitespace-nowrap leading-relaxed unicode-bidi-plaintext">
                    {expression || '0'}
                  </span>
                </div>

                {/* Computed Final Result Row */}
                <div className="w-full min-h-[44px] flex items-center justify-end font-mono z-10">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.span
                        key="final-result"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        id="final-result-value"
                        className="text-3xl md:text-4xl font-black text-emerald-400 tracking-wider overflow-x-auto scrollbar-none"
                      >
                        = {result}
                      </motion.span>
                    ) : livePreview ? (
                      <motion.span
                        key="ghost-result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.55 }}
                        id="ghost-result-value"
                        className="text-xl md:text-2xl font-bold text-slate-500 tracking-wider overflow-x-auto scrollbar-none"
                      >
                        = {livePreview}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sub-Bento Multi-column (Keyboard row next to Constants & Memory sidebar) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Keypad block (col-span-8 or 9) */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9 bento-panel-primary p-5 md:p-6 shadow-xl relative">
                  <AnimatePresence mode="wait">
                    {mode === 'standard' ? (
                      <motion.div
                        key="standard-kbd"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.18 }}
                        id="standard-keypad"
                        className="grid grid-cols-4 gap-3 md:gap-4 select-none"
                      >
                        {standardKeys.map((key) => {
                          const isKeyboardActive = activeKey === key.id;
                          return (
                            <CalcButton
                              key={key.id}
                              id={key.id}
                              label={key.label}
                              onClick={key.action}
                              variant={key.variant}
                              isActive={isKeyboardActive}
                            />
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="scientific-kbd"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.18 }}
                        id="scientific-keypad"
                        className="grid grid-cols-5 gap-2 md:gap-3 select-none"
                      >
                        {scientificKeys.map((key) => {
                          const isKeyboardActive = activeKey === key.id;
                          return (
                            <CalcButton
                              key={key.id}
                              id={key.id}
                              label={key.label}
                              subLabel={key.subLabel}
                              onClick={key.action}
                              variant={key.variant}
                              className={key.className}
                              isActive={isKeyboardActive}
                            />
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Auxiliary Bento panels stack side-column */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
                  
                  {/* Card 1: Live Memory control panel */}
                  <div className="bento-panel-alt p-5 flex flex-col justify-between shadow-md border border-white/5 relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1 select-none">
                      {lang === 'ar' ? 'الذاكرة المشغلة' : 'Active Memory'}
                    </div>
                    <div className="text-xl font-mono font-bold text-slate-300 truncate tracking-wide py-1">
                      {formatResult(memory)}
                    </div>
                    <div className="flex gap-1.5 mt-2 z-10">
                      <button 
                        id="btn-mem-add-quick"
                        onClick={() => handleMemoryOperation('M+')}
                        className="text-[10px] font-black bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95 text-slate-300 transition-all px-2.5 py-1.5 rounded-lg cursor-pointer flex-1 text-center border border-white/5 hover:border-emerald-500/20"
                        title={lang === 'ar' ? 'إضافة للذاكرة' : 'Add to memory'}
                      >
                        M+
                      </button>
                      <button
                        id="btn-mem-recall-quick"
                        onClick={() => handleMemoryOperation('MR')}
                        className="text-[10px] font-black bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95 text-slate-300 transition-all px-2.5 py-1.5 rounded-lg cursor-pointer flex-1 text-center border border-white/5 hover:border-emerald-500/20"
                        title={lang === 'ar' ? 'استيراد الذاكرة' : 'Recall memory'}
                      >
                        MR
                      </button>
                      <button
                        id="btn-mem-clear-quick"
                        onClick={() => handleMemoryOperation('MC')}
                        className="text-[10px] font-black bg-rose-500/10 hover:bg-rose-500/25 active:scale-95 text-rose-400 transition-all px-2.5 py-1.5 rounded-lg cursor-pointer flex-1 text-center border border-rose-500/10"
                        title={lang === 'ar' ? 'تصفير الذاكرة' : 'Clear memory'}
                      >
                        MC
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Interactive Constants Panel */}
                  <div className="bento-panel-alt p-5 flex flex-col justify-between shadow-md border border-white/5 hover:border-emerald-500/15 transition-all duration-200 group">
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-2 select-none">
                      {lang === 'ar' ? 'الثوابت الرياضية' : 'Math Constants'}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button 
                        id="btn-pi-const"
                        onClick={() => handleInput('π')}
                        className="flex justify-between items-center bg-white/[0.02] hover:bg-emerald-500/10 p-1 px-2.5 rounded-lg transition-colors cursor-pointer text-left border border-white/5"
                      >
                        <span className="text-emerald-400 font-mono font-bold italic">π</span>
                        <span className="text-[10px] text-slate-400 font-mono">3.14159</span>
                      </button>
                      <button 
                        id="btn-e-const"
                        onClick={() => handleInput('e')}
                        className="flex justify-between items-center bg-white/[0.02] hover:bg-emerald-500/10 p-1 px-2.5 rounded-lg transition-colors cursor-pointer text-left border border-white/5"
                      >
                        <span className="text-emerald-400 font-mono font-bold italic">e</span>
                        <span className="text-[10px] text-slate-400 font-mono">2.71828</span>
                      </button>
                      <button 
                        id="btn-phi-const"
                        onClick={() => handleInput('1.6180339887')}
                        className="flex justify-between items-center bg-white/[0.02] hover:bg-emerald-500/10 p-1 px-2.5 rounded-lg transition-colors cursor-pointer text-left border border-white/5"
                      >
                        <span className="text-emerald-400 font-mono font-bold italic">φ</span>
                        <span className="text-[10px] text-slate-400 font-mono">1.61803</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Quick Degrees/Radians Switcher */}
                  <div className="bento-panel-alt p-5 flex flex-col justify-between shadow-md border border-white/5">
                    <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest select-none">
                      {lang === 'ar' ? 'نظام قياس الزوايا' : 'Angle Measurement'}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2.5">
                      <button
                        id="btn-quick-deg"
                        onClick={() => setIsDeg(true)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer ${
                          isDeg 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 font-black' 
                            : 'bg-white/5 text-slate-400 border border-transparent hover:text-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'درجات' : 'DEG'}
                      </button>
                      <button
                        id="btn-quick-rad"
                        onClick={() => setIsDeg(false)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer ${
                          !isDeg 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5 font-black' 
                            : 'bg-white/5 text-slate-400 border border-transparent hover:text-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'راديان' : 'RAD'}
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Informational Help Box */}
              <div className="flex items-center gap-2.5 text-[11px] text-slate-450 bg-white/5 p-3 px-4 rounded-2xl border border-white/5">
                <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  {lang === 'ar' 
                    ? 'تلميح: يمكنك استخدام لوحة المفاتيح الفعلية لجهازك لكتابة الأرقام والعمليات الرياضية الأساسية مباشرة!' 
                    : 'Protip: Feel free to use your physical computer keyboard keys (digits, +, -, *, /, Backspace, Enter, Esc) to calculate instantaneously!'}
                </span>
              </div>

            </div>
          ) : (
            /* Unit Converter Mode (Bento Panel Primary) */
            <div className="bento-panel-primary p-6 md:p-8 shadow-2xl relative">
              <UnitConverter lang={lang} t={t} />
            </div>
          )}
        </div>

        {/* Persistent calculation History logs side column */}
        {mode !== 'converter' && showHistoryPane && (
          <div className="lg:col-span-4 flex flex-col h-full">
            <HistoryLogs
              history={history}
              onClear={clearHistoryLogs}
              onRecallExpression={handleRecallExpression}
              onRecallResult={handleRecallResult}
              lang={lang}
              t={t}
            />
          </div>
        )}

      </main>

      {/* Decorative clean footer (no telemetry, no simulated system larping logs) */}
      <footer id="app-footer" className="max-w-6xl w-full mx-auto border-t border-white/10 pt-5 mt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
        <span>
          © {new Date().getFullYear()} {t.title}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-wide uppercase">
            {lang === 'ar' ? 'مصمم بأعلى معايير الإتقان والدقة' : 'Designed to standard-grade specs'}
          </span>
        </div>
      </footer>

    </div>
  );
}
