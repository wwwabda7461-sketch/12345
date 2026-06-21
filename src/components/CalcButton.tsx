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
      btnStyle = 'bg-white/5 hover:bg-white/10 text-white border border-white/5 shadow-sm active:bg-white/15';
      break;
    case 'operator':
      btnStyle = 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 shadow-sm active:bg-emerald-500/40';
      break;
    case 'func':
      btnStyle = 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 border border-white/5 font-mono text-sm transition-colors duration-150';
      break;
    case 'danger':
      btnStyle = 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 active:bg-rose-500/30 text-sm';
      break;
    case 'equal':
      btnStyle = 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] active:brightness-95';
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
        ${isActive ? 'ring-2 ring-emerald-400 scale-95 shadow-lg brightness-110' : ''}
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
