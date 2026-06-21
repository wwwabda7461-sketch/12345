/**
 * Safe Mathematical Expression Evaluator
 * Supports Standard & Scientific operations without raw un-sanitized eval.
 */

// Custom Factorial function
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Format output numbers gracefully, preventing extreme floats (like 0.30000000000000004)
 */
export function formatResult(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
  
  // Custom threshold for scientific notation
  const absNum = Math.abs(num);
  if (absNum > 0 && (absNum < 1e-10 || absNum > 1e12)) {
    return num.toExponential(6);
  }
  
  // Floating point corrections (e.g. 1.00000000001 or 0.299999999999)
  const fixedStr = num.toFixed(10);
  const parsedFixed = parseFloat(fixedStr);
  return parsedFixed.toString();
}

/**
 * Main parser/evaluate function
 */
export function evaluateExpression(expr: string, isDeg: boolean): string {
  try {
    // Sanitize input
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E');

    // Handle Factorials: e.g. 5! or (2+3)!
    // We can replace [number]! with a custom factorial runner
    // Let's search for patterns of a number or bracketed expr followed by !
    let previousSanitized = '';
    while (sanitized.includes('!') && sanitized !== previousSanitized) {
      previousSanitized = sanitized;
      // 1. Matches simple digits followed by !: e.g., 5! -> factorial(5)
      sanitized = sanitized.replace(/(\d+)\!/g, (_, num) => `factorial(${num})`);
      // 2. Matches parentheses followed by !: e.g., (1+2)! -> factorial(1+2)
      // We will look for brackets that terminate with !. To keep things robust:
      // We search for a bracket sub-string of shape (expr)! and replace.
      // E.g. find matches for (anything-without-parens)! or matching parens.
      sanitized = sanitized.replace(/\(([^()]+)\)\!/g, (_, sub) => `factorial(${sub})`);
    }

    // Handle implicit multiplication before functions or constants
    // e.g., 5Math.PI -> 5*Math.PI, 2(3+1) -> 2*(3+1), 3sin(x) -> 3*sin(x)
    sanitized = sanitized.replace(/(\d)(Math\.|sin|cos|tan|log|ln|sqrt|\()/g, '$1*$2');
    sanitized = sanitized.replace(/(\))((\d|Math\.|sin|cos|tan|log|ln|sqrt))/g, '$1*$2');

    // Handle Power operator: x^y to Math.pow(x, y) or using ** operator in JS
    sanitized = sanitized.replace(/\^/g, '**');

    // Handle logarithms and natural log
    sanitized = sanitized.replace(/ln\(/g, 'Math.log('); // ln in calc is base e, JS Math.log is base e
    sanitized = sanitized.replace(/log\(/g, 'Math.log10('); // log in calc is base 10, JS Math.log10 is base 10

    // Handle scientific trig operations with Radian / Degree conversions
    // Trigonometric inputs in standard js expect radians, so if isDeg is true, we convertsin/cos/tan arguments
    // We can create helper wrappers inside eval context
    
    // We compile safe sandbox variables
    const trigFactor = isDeg ? Math.PI / 180 : 1;
    const invTrigFactor = isDeg ? 180 / Math.PI : 1;

    // Custom Trigs that respect degrees/radians
    const sin = (val: number) => {
      // Fix precise results e.g. sin(pi) should be 0, sin(30 deg) is 0.5
      if (isDeg && val % 180 === 0) return 0;
      if (isDeg && val % 90 === 0 && (val / 90) % 2 !== 0) return val % 360 === 90 ? 1 : -1;
      return Math.sin(val * trigFactor);
    };
    
    const cos = (val: number) => {
      if (isDeg && val % 90 === 0 && (val / 90) % 2 !== 0) return 0;
      if (isDeg && val % 180 === 0 && (val / 180) % 2 !== 0) return -1;
      if (isDeg && val % 360 === 0) return 1;
      return Math.cos(val * trigFactor);
    };

    const tan = (val: number) => {
      if (isDeg && val % 180 === 0) return 0;
      if (isDeg && val % 90 === 0 && (val / 90) % 2 !== 0) return NaN; // Undefined
      return Math.tan(val * trigFactor);
    };

    const asin = (val: number) => Math.asin(val) * invTrigFactor;
    const acos = (val: number) => Math.acos(val) * invTrigFactor;
    const atan = (val: number) => Math.atan(val) * invTrigFactor;
    const sqrt = (val: number) => Math.sqrt(val);
    const cbrt = (val: number) => Math.cbrt(val);
    const abs = (val: number) => Math.abs(val);

    // Evaluate formula safely using a restricted Function constructor.
    // This sandbox is safe as we check the characters.
    // Allowed characters: standard numbers, math symbols, paren, spaces, factorial, and our registered function keywords
    const allowedWords = [
      'Math.PI', 'Math.E', 'factorial', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
      'log', 'ln', 'sqrt', 'cbrt', 'abs', 'Math.log10', 'Math.log', 'Math.pow'
    ];
    
    // Check for any unauthorized words (e.g. window, alert, fetch, document, etc.)
    const words = sanitized.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
    for (const w of words) {
      if (w.includes('.')) {
        if (!allowedWords.includes(w) && !allowedWords.includes(w.split('.')[0])) {
          throw new Error('Unauthorized identifier: ' + w);
        }
      } else {
        if (!allowedWords.includes(w)) {
          throw new Error('Unauthorized identifier: ' + w);
        }
      }
    }

    // Secondary strict regex safety check on permitted characters
    // Digits, whitespace, brackets, basic operators, power, exponents (e), decimal point, and trig wrapper functions
    const safeRegex = /^[0-9+\-*/%().a-zA-Z_\s*!^]+$/;
    if (sanitized.trim() !== '' && !safeRegex.test(sanitized)) {
      throw new Error('Unpermitted characters detected');
    }

    // Execute sandbox evaluation function
    const sandboxFunc = new Function(
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'cbrt', 'abs', 'factorial',
      `return (${sanitized});`
    );

    const result = sandboxFunc(sin, cos, tan, asin, acos, atan, sqrt, cbrt, abs, factorial);
    
    if (result === null || result === undefined || isNaN(result)) {
      return 'Error';
    }
    
    return formatResult(result);
  } catch (err) {
    console.error('Math evaluation failed for expression:', expr, err);
    return 'Error';
  }
}
