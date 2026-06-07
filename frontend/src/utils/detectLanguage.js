/**
 * Auto-detect programming language from code content using keyword heuristics.
 * Returns { language: string, confidence: 'high' | 'medium' | 'low' }
 */

const RULES = [
  {
    lang: "python",
    high: [/\bdef\s+\w+\s*\(/, /\bfrom\s+\w+\s+import\b/],
    medium: [/\bprint\s*\(/, /\belif\b/, /\bself\.\w+/, /:\s*$/m],
  },
  {
    lang: "typescript",
    high: [/:\s*(string|number|boolean|void)\b/, /\binterface\s+\w+/, /\b<\w+>\s*\(/],
    medium: [/\btype\s+\w+\s*=/, /\bas\s+\w+/],
  },
  {
    lang: "javascript",
    high: [/\bconsole\.\w+\s*\(/, /\b(const|let|var)\s+\w+\s*=/],
    medium: [/\b=>\s*[{(]/, /\brequire\s*\(/, /\bmodule\.exports/, /\bdocument\.\w+/],
  },
  {
    lang: "java",
    high: [/\bpublic\s+(static\s+)?void\s+main/, /\bSystem\.out\.print/],
    medium: [/\bpublic\s+class\s+/, /\bprivate\s+\w+\s+\w+/, /\b@Override\b/],
  },
  {
    lang: "cpp",
    high: [/\b#include\s*<\w+>/, /\bstd::\w+/, /\bcout\s*<</],
    medium: [/\busing\s+namespace\b/, /\bvector</, /\bint\s+main\s*\(/],
  },
  {
    lang: "c",
    high: [/\b#include\s*<stdio\.h>/, /\bprintf\s*\(/],
    medium: [/\b#include\s*<\w+\.h>/, /\bmalloc\s*\(/, /\bfree\s*\(/],
  },
  {
    lang: "go",
    high: [/\bfunc\s+\w+\s*\(/, /\bpackage\s+main\b/],
    medium: [/\bfmt\.\w+/, /\b:=\s*/, /\bgo\s+func/],
  },
  {
    lang: "rust",
    high: [/\bfn\s+main\s*\(/, /\blet\s+mut\s+/],
    medium: [/\bimpl\s+\w+/, /\b->\s*\w+/, /\bprintln!\s*\(/],
  },
  {
    lang: "ruby",
    high: [/\bdef\s+\w+.*\bend\b/s, /\bputs\s+/],
    medium: [/\bclass\s+\w+\s*<\s*\w+/, /\battr_accessor\b/, /\bdo\s*\|/],
  },
  {
    lang: "php",
    high: [/\b<\?php\b/, /\b\$\w+\s*=/],
    medium: [/\becho\s+/, /\bfunction\s+\w+\s*\(\s*\$/, /\b->\w+\s*\(/],
  },
  {
    lang: "swift",
    high: [/\bvar\s+\w+\s*:\s*\w+/, /\bfunc\s+\w+\s*\(.*\)\s*->/],
    medium: [/\bguard\s+let\b/, /\bif\s+let\b/, /\bprint\s*\(/],
  },
  {
    lang: "kotlin",
    high: [/\bfun\s+main\s*\(/, /\bval\s+\w+\s*[:=]/],
    medium: [/\bvar\s+\w+\s*:/, /\bprintln\s*\(/, /\bdata\s+class\b/],
  },
  {
    lang: "sql",
    high: [/\bSELECT\s+.+\bFROM\b/i, /\bCREATE\s+TABLE\b/i],
    medium: [/\bINSERT\s+INTO\b/i, /\bWHERE\b/i, /\bJOIN\b/i],
  },
  {
    lang: "html",
    high: [/<!DOCTYPE\s+html>/i, /<html[\s>]/i],
    medium: [/<div[\s>]/, /<\/\w+>/, /<a\s+href/],
  },
  {
    lang: "css",
    high: [/\b\w+\s*\{[^}]*:\s*[^}]+\}/s],
    medium: [/@media\s*\(/, /\.\w+\s*\{/, /#\w+\s*\{/],
  },
  {
    lang: "shell",
    high: [/^#!/m, /\bsudo\s+/, /\bapt(-get)?\s+install/],
    medium: [/\becho\s+"/, /\|\s*grep\b/, /\bchmod\b/],
  },
];

export function detectLanguage(code) {
  if (!code || code.trim().length < 10) {
    return { language: "plaintext", confidence: "low" };
  }

  let bestLang = "plaintext";
  let bestScore = 0;
  let bestConfidence = "low";

  for (const rule of RULES) {
    let score = 0;
    let hasHigh = false;

    for (const pattern of rule.high) {
      if (pattern.test(code)) {
        score += 3;
        hasHigh = true;
      }
    }
    for (const pattern of rule.medium) {
      if (pattern.test(code)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestLang = rule.lang;
      bestConfidence = hasHigh ? (score >= 5 ? "high" : "medium") : "low";
    }
  }

  return { language: bestLang, confidence: bestConfidence };
}
