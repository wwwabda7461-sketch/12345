import React from 'react';
import { HistoryItem, LangType, TranslationDict } from '../types';
import { Trash2, History, RotateCcw, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogsProps {
  history: HistoryItem[];
  onClear: () => void;
  onRecallExpression: (expr: string) => void;
  onRecallResult: (res: string) => void;
  lang: LangType;
  t: TranslationDict;
}

export default function HistoryLogs({
  history,
  onClear,
  onRecallExpression,
  onRecallResult,
  lang,
  t,
}: HistoryLogsProps) {
  return (
    <div id="history-sidebar" className="flex flex-col h-full bento-panel-side p-6 shadow-lg min-h-[380px] lg:min-h-full font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h2 className="font-bold text-slate-400 text-sm tracking-wide">
            {t.history}
          </h2>
        </div>
        {history.length > 0 && (
          <button
            id="btn-clear-history"
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer select-none bg-rose-500/10 hover:bg-rose-500/20 py-1 px-2.5 rounded-xl border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearHistory}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[340px] lg:max-h-[500px] pr-1 flex flex-col gap-3 scrollbar-none">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-32 flex flex-col items-center justify-center text-center text-slate-550 gap-2 select-none"
            >
              <History className="w-8 h-8 opacity-20 text-slate-400" />
              <span className="text-xs text-slate-500">{t.noHistory}</span>
            </motion.div>
          ) : (
            history.map((item, index) => {
              // Fade older calculations slightly like the reference design (60%, 40% opacity)
              let opacityClass = 'opacity-100';
              if (index === 1) opacityClass = 'opacity-80';
              if (index === 2) opacityClass = 'opacity-60';
              if (index >= 3) opacityClass = 'opacity-40';

              const itemTime = item.timestamp 
                ? new Date(item.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 450 }}
                  className={`bg-white/5 hover:bg-white/10 rounded-2xl p-3.5 border border-white/5 group relative transition-all duration-200 ${opacityClass}`}
                >
                  <div className="flex flex-col gap-1.5 font-mono text-left">
                    {/* Timestamp inside cards */}
                    {itemTime && (
                      <div className="text-[10px] text-slate-500 font-sans tracking-wide">
                        {itemTime}
                      </div>
                    )}
                    {/* Expression */}
                    <div className="text-slate-300 text-sm truncate max-w-full unicode-bidi-plaintext leading-normal">
                      {item.expression}
                    </div>
                    {/* Result */}
                    <div className="text-emerald-400 font-bold truncate text-base leading-normal">
                      = {item.result}
                    </div>
                  </div>

                  {/* Hidden Quick Actions menu showing up on Hover */}
                  <div className="absolute inset-0 bg-[#121218]/95 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 px-2">
                    <button
                      id={`btn-recall-expr-${item.id}`}
                      onClick={() => onRecallExpression(item.expression)}
                      className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-sans py-1.5 px-2.5 rounded-lg cursor-pointer border border-white/5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px]">{lang === 'ar' ? 'استعادة الصيغة' : 'Formula'}</span>
                    </button>

                    <button
                      id={`btn-recall-res-${item.id}`}
                      onClick={() => onRecallResult(item.result)}
                      className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-xs font-sans py-1.5 px-2.5 rounded-lg cursor-pointer border border-emerald-500/10"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px]">{lang === 'ar' ? 'استيراد الناتج' : 'Result'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <div className="text-[10.5px] text-slate-500 text-center select-none pt-4 mt-2 border-t border-white/5 leading-normal">
        {lang === 'ar' ? 'مرر المؤشر فوق أي عملية في السجل لاستعادة القيم' : 'Hover over any calculations to recall formula or result'}
      </div>
    </div>
  );
}
