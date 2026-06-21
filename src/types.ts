export type CalculatorMode = 'standard' | 'scientific' | 'converter';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface TranslationDict {
  title: string;
  subtitle: string;
  standard: string;
  scientific: string;
  converter: string;
  history: string;
  clearHistory: string;
  noHistory: string;
  copied: string;
  copy: string;
  deg: string;
  rad: string;
  memory: string;
  clear: string;
  backspace: string;
  loading: string;
  error: string;
  
  // Converter terms
  from: string;
  to: string;
  value: string;
  result: string;
  category: string;
  
  // Categories
  length: string;
  weight: string;
  temperature: string;
  area: string;
  volume: string;
  speed: string;
}

export type LangType = 'ar' | 'en';
