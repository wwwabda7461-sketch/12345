import React, { useState, useEffect } from 'react';
import { CONVERSION_CATEGORIES, convertTemperature } from '../data';
import { LangType, TranslationDict } from '../types';
import { ArrowLeftRight, Check, ChevronDown, RefreshCw, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnitConverterProps {
  lang: LangType;
  t: TranslationDict;
}

export default function UnitConverter({ lang, t }: UnitConverterProps) {
  const [selectedCategory, setSelectedCategory] = useState(CONVERSION_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState(CONVERSION_CATEGORIES[0].units[0]);
  const [toUnit, setToUnit] = useState(CONVERSION_CATEGORIES[0].units[1]);
  const [inputValue, setInputValue] = useState<string>('1');
  const [convertedValue, setConvertedValue] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Reset units when category changes
  const handleCategoryChange = (catId: string) => {
    const category = CONVERSION_CATEGORIES.find((c) => c.id === catId);
    if (category) {
      setSelectedCategory(category);
      setFromUnit(category.units[0]);
      setToUnit(category.units[1] || category.units[0]);
    }
  };

  // Switch "From" and "To" units
  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Convert whenever input or unit selections change
  useEffect(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setConvertedValue('');
      return;
    }

    if (selectedCategory.id === 'temperature') {
      const result = convertTemperature(num, fromUnit.value, toUnit.value);
      setConvertedValue(result.toFixed(6).replace(/\.?0+$/, '')); // trim trailing zeros
    } else {
      // Standard conversion relative to the base unit
      // valueInBase = num * fromUnit.factor
      // valueInTarget = valueInBase / toUnit.factor
      const valueInBase = num * fromUnit.factor;
      const targetValue = valueInBase / toUnit.factor;
      
      // format appropriately
      if (Math.abs(targetValue) < 1e-6 || Math.abs(targetValue) > 1e9) {
        setConvertedValue(targetValue.toExponential(6));
      } else {
        setConvertedValue(
          parseFloat(targetValue.toFixed(8)).toString()
        );
      }
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const handleKeyPress = (char: string) => {
    setInputValue((prev) => {
      if (char === 'C') return '0';
      if (char === '←') {
        const next = prev.slice(0, -1);
        return next === '' || next === '-' ? '0' : next;
      }
      if (char === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (char === '±') {
        if (prev.startsWith('-')) return prev.slice(1);
        if (prev === '0') return prev;
        return '-' + prev;
      }
      // regular digits
      if (prev === '0') return char;
      return prev + char;
    });
  };

  const copyToClipboard = () => {
    if (!convertedValue) return;
    navigator.clipboard.writeText(convertedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="unit-converter-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Settings / Selection Panels */}
      <div className="lg:col-span-7 flex flex-col gap-5 bg-slate-900/40 p-5 rounded-3xl border border-slate-800/60">
        
        {/* Category Picker */}
        <div>
          <label className="text-sm font-semibold text-teal-400 mb-2 block">
            {t.category}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONVERSION_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer text-center border ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-300 border-teal-500/70 shadow-sm shadow-teal-500/5'
                      : 'bg-slate-800/40 text-gray-400 border-slate-800 hover:bg-slate-800 hover:text-gray-200'
                  }`}
                >
                  {lang === 'ar' ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
            
            {/* Custom Temperature pseudo-category */}
            <button
              id="btn-cat-temp"
              onClick={() => {
                setSelectedCategory({
                  id: 'temperature',
                  labelAr: 'درجة الحرارة',
                  labelEn: 'Temperature',
                  baseUnit: 'c',
                  units: [
                    { value: 'c', labelAr: 'سيلسيوس (C°)', labelEn: 'Celsius (C°)', factor: 1 },
                    { value: 'f', labelAr: 'فهرنهايت (F°)', labelEn: 'Fahrenheit (F°)', factor: 1 },
                    { value: 'k', labelAr: 'كلفن (K)', labelEn: 'Kelvin (K)', factor: 1 },
                  ],
                });
                setFromUnit({ value: 'c', labelAr: 'سيلسيوس (C°)', labelEn: 'Celsius (C°)', factor: 1 });
                setToUnit({ value: 'f', labelAr: 'فهرنهايت (F°)', labelEn: 'Fahrenheit (F°)', factor: 1 });
              }}
              className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center border ${
                selectedCategory.id === 'temperature'
                  ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-300 border-teal-500/70 shadow-sm shadow-teal-500/5'
                  : 'bg-slate-800/40 text-gray-400 border-slate-800 hover:bg-slate-800 hover:text-gray-200'
              }`}
            >
              {t.temperature}
            </button>
          </div>
        </div>

        {/* Units Dropdown Selector (From & To) */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
          
          {/* FROM Unit */}
          <div className="md:col-span-4 select-none">
            <span className="text-xs text-gray-400 block mb-1.5">{t.from}</span>
            <div className="relative">
              <select
                id="select-from-unit"
                value={fromUnit.value}
                onChange={(e) => {
                  const targetUnit = selectedCategory.units.find((u) => u.value === e.target.value);
                  if (targetUnit) setFromUnit(targetUnit);
                }}
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-100 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                {selectedCategory.units.map((u) => (
                  <option key={u.value} value={u.value}>
                    {lang === 'ar' ? u.labelAr : u.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Swap Trigger Button */}
          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              id="btn-swap-converter"
              type="button"
              onClick={handleSwapUnits}
              className="p-3 bg-teal-500/15 hover:bg-teal-500/25 active:scale-95 text-teal-400 rounded-full transition-transform duration-200 cursor-pointer"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO Unit */}
          <div className="md:col-span-4 select-none">
            <span className="text-xs text-gray-400 block mb-1.5">{t.to}</span>
            <div className="relative">
              <select
                id="select-to-unit"
                value={toUnit.value}
                onChange={(e) => {
                  const targetUnit = selectedCategory.units.find((u) => u.value === e.target.value);
                  if (targetUnit) setToUnit(targetUnit);
                }}
                className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-100 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
              >
                {selectedCategory.units.map((u) => (
                  <option key={u.value} value={u.value}>
                    {lang === 'ar' ? u.labelAr : u.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Real-time Display Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 font-mono">
          <div className="flex flex-col gap-1 border-b border-slate-800/50 pb-2">
            <span className="text-[10px] uppercase text-gray-500 select-none">
              {lang === 'ar' ? fromUnit.labelAr : fromUnit.labelEn}
            </span>
            <span className="text-xl md:text-2xl font-semibold text-gray-200">
              {inputValue}
            </span>
          </div>

          <div className="flex justify-between items-end pt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-teal-500/80 select-none">
                {lang === 'ar' ? toUnit.labelAr : toUnit.labelEn}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-teal-400 select-all tracking-wider">
                {convertedValue || '0'}
              </span>
            </div>

            {convertedValue && (
              <button
                id="btn-copy-converted"
                onClick={copyToClipboard}
                title={t.copy}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 text-gray-300 rounded-xl transition-all duration-150 cursor-pointer border border-slate-700/50 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-xs font-sans font-medium">
                  {copied ? t.copied : t.copy}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Numerical Auxiliary Keyboard */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-4 grid grid-cols-3 gap-2">
          
          {/* Keypad numbers */}
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((char) => (
            <motion.button
              key={char}
              id={`btn-conv-${char}`}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleKeyPress(char)}
              className="py-4 rounded-xl font-mono text-xl font-bold bg-slate-800 hover:bg-slate-750 text-gray-200 border border-slate-700/50 cursor-pointer flex items-center justify-center active:bg-slate-705"
            >
              {char}
            </motion.button>
          ))}

          {/* Controls row */}
          <motion.button
            id="btn-conv-negate"
            whileTap={{ scale: 0.94 }}
            onClick={() => handleKeyPress('±')}
            className="py-4 rounded-xl font-mono text-lg font-bold bg-slate-800/40 hover:bg-slate-800/60 text-gray-300 border border-slate-700/50 cursor-pointer flex items-center justify-center"
          >
            ±
          </motion.button>
          
          <motion.button
            id="btn-conv-0"
            whileTap={{ scale: 0.94 }}
            onClick={() => handleKeyPress('0')}
            className="py-4 rounded-xl font-mono text-xl font-bold bg-slate-800 hover:bg-slate-750 text-gray-200 border border-slate-700/50 cursor-pointer flex items-center justify-center"
          >
            0
          </motion.button>

          <motion.button
            id="btn-conv-dot"
            whileTap={{ scale: 0.94 }}
            onClick={() => handleKeyPress('.')}
            className="py-4 rounded-xl font-mono text-xl font-bold bg-slate-800/40 hover:bg-slate-800/60 text-gray-300 border border-slate-700/50 cursor-pointer flex items-center justify-center"
          >
            .
          </motion.button>

          {/* Action buttons full width */}
          <motion.button
            id="btn-conv-clear"
             whileTap={{ scale: 0.94 }}
             onClick={() => handleKeyPress('C')}
             className="col-span-1 py-3.5 rounded-xl text-sm font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 cursor-pointer"
          >
            {t.clear}
          </motion.button>

          <motion.button
            id="btn-conv-del"
             whileTap={{ scale: 0.94 }}
             onClick={() => handleKeyPress('←')}
             className="col-span-2 py-3.5 rounded-xl text-sm font-bold bg-slate-700/60 hover:bg-slate-700 text-gray-300 border border-slate-600/40 cursor-pointer"
          >
            {t.backspace}
          </motion.button>

        </div>
      </div>

    </div>
  );
}
