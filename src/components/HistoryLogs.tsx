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
    <div id="history-sidebar" className="flex flex-col h-full bg-slate-900/60 p-4 rounded-3xl border border-slate-800/60 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-gray-100 text-sm md:text-base">
            {t.history}
          </h3>
        </div>
        {history.length > 0 && (
          <button
            id="btn-clear-history"
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer select-none bg-rose-500/10 hover:bg-rose-500/20 py-1.5 px-3 rounded-xl border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearHistory}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[340px] lg:max-h-[500px] pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-slate-800">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-32 flex flex-col items-center justify-center text-center text-gray-500 gap-2 select-none"
            >
              <History className="w-8 h-8 opacity-25" />
              <span className="text-xs">{t.noHistory}</span>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="bg-slate-950/65 rounded-2xl p-3 border border-slate-900 group relative hover:border-slate-800 transition-colors"
              >
                <div className="flex flex-col gap-1 font-mono text-right text-sm">
                  {/* Expression */}
                  <div className="text-gray-400 text-xs truncate max-w-full unicode-bidi-plaintext">
                    {item.expression}
                  </div>
                  {/* Result */}
                  <div className="text-teal-400 font-bold truncate max-w-full">
                    = {item.result}
                  </div>
                </div>

                {/* Hidden Quick Actions menu showing up on Hover */}
                <div className="absolute inset-0 bg-slate-950/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 px-2">
                  <button
                    id={`btn-recall-expr-${item.id}`}
                    onClick={() => onRecallExpression(item.expression)}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-sans py-1.5 px-3 rounded-lg cursor-pointer border border-slate-700/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                    <span>{lang === 'ar' ? 'استعادة التعبير' : 'Recall formula'}</span>
                  </button>

                  <button
                    id={`btn-recall-res-${item.id}`}
                    onClick={() => onRecallResult(item.result)}
                    className="flex items-center gap-1 bg-slate-850 hover:bg-slate-750 text-gray-200 text-xs font-sans py-1.5 px-3 rounded-lg cursor-pointer border border-slate-700/40"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ar' ? 'استيراد الناتج' : 'Import result'}</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-gray-500 text-center select-none pt-3 mt-2 border-t border-slate-850">
        {lang === 'ar' ? 'انقر فوق العملية في السجل لعرض الخيارات المتاحة' : 'Hover / Tap on any item to import formula or results'}
      </div>
    </div>
  );
}
