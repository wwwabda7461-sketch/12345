import { motion } from 'motion/react';
import React from 'react';

interface CalcButtonProps {
  key?: string;
  label: string;
  subLabel?: string;
  onClick: () => void;
  variant?: 'num' | 'operator' | 'func' | 'equal' | 'danger';
  className?: string;
  id?: string;
  isActive?: boolean;
}

export default function CalcButton({
  label,
  subLabel,
  onClick,
  variant = 'num',
  className = '',
  id,
  isActive = false,
}: CalcButtonProps) {
  // Determine Tailwind styles based on button variant
  let btnStyle = '';
  
  switch (variant) {
    case 'num':
      btnStyle = 'bg-slate-800/60 hover:bg-slate-700/80 text-gray-100 active:bg-slate-600 border border-slate-700/40 shadow-sm';
      break;
    case 'operator':
      btnStyle = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:bg-amber-600 shadow-md shadow-amber-500/10';
      break;
    case 'func':
      btnStyle = 'bg-slate-900/80 hover:bg-slate-800 text-teal-400 active:bg-slate-950 border border-teal-950/40 font-mono text-sm';
      break;
    case 'danger':
      btnStyle = 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 active:bg-rose-500/40 text-sm';
      break;
    case 'equal':
      btnStyle = 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold active:bg-teal-600 shadow-md shadow-teal-500/20';
      break;
  }

  return (
    <motion.button
      id={id}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={onClick}
      className={`
        relative select-none flex flex-col items-center justify-center rounded-2xl h-14 md:h-16
        font-medium transition-all duration-150 button-press-effect cursor-pointer
        ${btnStyle}
        ${isActive ? 'ring-2 ring-teal-400 scale-95 shadow-lg brightness-110' : ''}
        ${className}
      `}
    >
      <span className="text-lg md:text-xl font-semibold tracking-wider">{label}</span>
      {subLabel && (
        <span className="text-[9px] md:text-[10px] text-gray-400 -mt-1 font-sans">{subLabel}</span>
      )}
    </motion.button>
  );
}
