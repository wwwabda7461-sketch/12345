import { TranslationDict, LangType } from './types';

export const TRANSLATIONS: Record<LangType, TranslationDict> = {
  ar: {
    title: 'الحاسبة الاحترافية',
    subtitle: 'حاسبة متطورة للأعمال اليومية والعلمية مع محول وحدات متكامل',
    standard: 'القياسي',
    scientific: 'العلمي',
    converter: 'محول الوحدات',
    history: 'سجل العمليات',
    clearHistory: 'مسح السجل',
    noHistory: 'لا توجد عمليات سابقة',
    copied: 'تم النسخ في الحافظة!',
    copy: 'نسخ النتيجة',
    deg: 'درجات',
    rad: 'راديان',
    memory: 'الذاكرة',
    clear: 'مسح الكل',
    backspace: 'مسح خطوة',
    loading: 'جاري التحميل...',
    error: 'خطأ في التعبير',
    from: 'من وحدة',
    to: 'إلى وحدة',
    value: 'القيمة المدخلة',
    result: 'النتيجة المحسوبة',
    category: 'التصنيف الرئيسي',
    length: 'الطول / المسافة',
    weight: 'Weight / الوزن',
    temperature: 'الحرارة',
    area: 'المساحة',
    volume: 'الحجم',
    speed: 'السرعة',
  },
  en: {
    title: 'Professional Calculator',
    subtitle: 'Advanced calculator for standard, scientific computations & unit conversions',
    standard: 'Standard',
    scientific: 'Scientific',
    converter: 'Unit Converter',
    history: 'History Logs',
    clearHistory: 'Clear History',
    noHistory: 'No recent calculations',
    copied: 'Copied to Clipboard!',
    copy: 'Copy Result',
    deg: 'DEG',
    rad: 'RAD',
    memory: 'Memory',
    clear: 'AC',
    backspace: 'DEL',
    loading: 'Loading...',
    error: 'Format Error',
    from: 'From Unit',
    to: 'To Unit',
    value: 'Input Value',
    result: 'Converted Result',
    category: 'Category',
    length: 'Length / Distance',
    weight: 'Weight / Mass',
    temperature: 'Temperature',
    area: 'Area',
    volume: 'Volume',
    speed: 'Speed',
  },
};

export interface ConversionUnit {
  value: string;
  labelAr: string;
  labelEn: string;
  factor: number; // reference factor relative to a base unit
}

export interface ConversionCategory {
  id: string;
  labelAr: string;
  labelEn: string;
  baseUnit: string;
  units: ConversionUnit[];
}

export const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'length',
    labelAr: 'الطول والمسافات',
    labelEn: 'Length & Distances',
    baseUnit: 'm',
    units: [
      { value: 'm', labelAr: 'متر (m)', labelEn: 'Meter (m)', factor: 1 },
      { value: 'km', labelAr: 'كيلومتر (km)', labelEn: 'Kilometer (km)', factor: 1000 },
      { value: 'cm', labelAr: 'سنتيمتر (cm)', labelEn: 'Centimeter (cm)', factor: 0.01 },
      { value: 'mm', labelAr: 'مليمتر (mm)', labelEn: 'Millimeter (mm)', factor: 0.001 },
      { value: 'mi', labelAr: 'ميل (mi)', labelEn: 'Mile (mi)', factor: 1609.344 },
      { value: 'yd', labelAr: 'ياردة (yd)', labelEn: 'Yard (yd)', factor: 0.9144 },
      { value: 'ft', labelAr: 'قدم (ft)', labelEn: 'Foot (ft)', factor: 0.3048 },
      { value: 'in', labelAr: 'بوصة (in)', labelEn: 'Inch (in)', factor: 0.0254 },
    ],
  },
  {
    id: 'weight',
    labelAr: 'الوزن والكتلة',
    labelEn: 'Weight & Mass',
    baseUnit: 'kg',
    units: [
      { value: 'kg', labelAr: 'كيلوجرام (kg)', labelEn: 'Kilogram (kg)', factor: 1 },
      { value: 'g', labelAr: 'جرام (g)', labelEn: 'Gram (g)', factor: 0.001 },
      { value: 'mg', labelAr: 'مليجرام (mg)', labelEn: 'Milligram (mg)', factor: 0.000001 },
      { value: 'lb', labelAr: 'رطل (lb)', labelEn: 'Pound (lb)', factor: 0.45359237 },
      { value: 'oz', labelAr: 'أونصة (oz)', labelEn: 'Ounce (oz)', factor: 0.028349523 },
      { value: 'ton', labelAr: 'طن (ton)', labelEn: 'Metric Ton (ton)', factor: 1000 },
    ],
  },
  {
    id: 'area',
    labelAr: 'المساحات',
    labelEn: 'Area',
    baseUnit: 'm2',
    units: [
      { value: 'm2', labelAr: 'متر مربع (m²)', labelEn: 'Square Meter (m²)', factor: 1 },
      { value: 'km2', labelAr: 'كيلومتر مربع (km²)', labelEn: 'Square Kilometer (km²)', factor: 1000000 },
      { value: 'cm2', labelAr: 'سنتيمتر مربع (cm²)', labelEn: 'Square Centimeter (cm²)', factor: 0.0001 },
      { value: 'ha', labelAr: 'هكتار (ha)', labelEn: 'Hectare (ha)', factor: 10000 },
      { value: 'acre', labelAr: 'فدان / آكر (acre)', labelEn: 'Acre (acre)', factor: 4046.8564 },
      { value: 'mi2', labelAr: 'ميل مربع (mi²)', labelEn: 'Square Mile (mi²)', factor: 2589988.11 },
    ],
  },
  {
    id: 'volume',
    labelAr: 'الأحجام والسوائل',
    labelEn: 'Volume & Capacity',
    baseUnit: 'l',
    units: [
      { value: 'l', labelAr: 'لتر (L)', labelEn: 'Liter (L)', factor: 1 },
      { value: 'ml', labelAr: 'مليلتر (mL)', labelEn: 'Milliliter (mL)', factor: 0.001 },
      { value: 'm3', labelAr: 'متر مكعب (m³)', labelEn: 'Cubic Meter (m³)', factor: 1000 },
      { value: 'gallon', labelAr: 'جالون أمريكي (gal)', labelEn: 'US Gallon (gal)', factor: 3.78541 },
      { value: 'cup', labelAr: 'كوب (cup)', labelEn: 'Cup (cup)', factor: 0.24 },
      { value: 'fl_oz', labelAr: 'أونصة سائلة (fl oz)', labelEn: 'Fluid Ounce (fl oz)', factor: 0.0295735 },
    ],
  },
  {
    id: 'speed',
    labelAr: 'السرعة والتردد',
    labelEn: 'Speed',
    baseUnit: 'm/s',
    units: [
      { value: 'm/s', labelAr: 'متر/ثانية (m/s)', labelEn: 'Meter per Second (m/s)', factor: 1 },
      { value: 'km/h', labelAr: 'كيلومتر/ساعة (km/h)', labelEn: 'Kilometer per Hour (km/h)', factor: 1 / 3.6 },
      { value: 'mph', labelAr: 'ميل/ساعة (mph)', labelEn: 'Miles per Hour (mph)', factor: 0.44704 },
      { value: 'knot', labelAr: 'عقدة بحرية (kn)', labelEn: 'Knot (kn)', factor: 0.514444 },
    ],
  },
];

// Custom function for temperatures because conversion is non-linear
export function convertTemperature(value: number, from: string, to: string): number {
  let tempInCelsius = value;
  if (from === 'f') {
    tempInCelsius = (value - 32) * (5 / 9);
  } else if (from === 'k') {
    tempInCelsius = value - 273.15;
  }

  if (to === 'c') {
    return tempInCelsius;
  } else if (to === 'f') {
    return tempInCelsius * (9 / 5) + 32;
  } else if (to === 'k') {
    return tempInCelsius + 273.15;
  }
  return value;
}
