/**
 * Auto-detect programming language from code content using keyword heuristics.
 * Returns { language: string, confidence: 'high' | 'medium' | 'low' }
 *
 * Scoring:
 *   - Each "high" pattern match   = +3 points
 *   - Each "medium" pattern match = +1 point
 *
 * Confidence thresholds:
 *   - "high"   → any high-rule matched AND total score >= 5
 *   - "medium" → any high-rule matched, OR total score >= 3 (multiple medium matches)
 *   - "low"    → everything else (score < 3 with no high matches)
 */

const RULES = [
  {
    lang: "python",
    high: [
      /\bdef\s+\w+\s*\(/,                 // def function_name(
      /\bfrom\s+\w+\s+import\b/,          // from module import
      /\bimport\s+\w+/,                   // import os
      /\bif\s+__name__\s*==\s*['"]__main__['"]/,  // if __name__ == "__main__"
    ],
    medium: [
      /\bprint\s*\(/,                     // print(...)
      /\belif\b/,                         // elif
      /\bself\.\w+/,                      // self.variable
      /:\s*$/m,                           // colon at end of line (if/for/def blocks)
      /\bfor\s+\w+\s+in\s+/,             // for x in ...
      /\brange\s*\(/,                     // range(...)
      /\blen\s*\(/,                       // len(...)
      /f["']/,                            // f-strings: f"..." or f'...'
      /\bTrue\b|\bFalse\b|\bNone\b/,     // Python booleans/None
      /\bclass\s+\w+\s*[:(]/,            // class Foo: or class Foo(Bar):
      /^\s{4}\w/m,                        // 4-space indentation (Python style)
      /\bexcept\s+\w+/,                  // except ValueError
      /\blambda\s+/,                      // lambda x: ...
      /\bwith\s+\w+/,                    // with open(...) as f:
      /\bas\s+\w+\s*:/,                  // as alias:
    ],
  },
  {
    lang: "typescript",
    high: [
      /:\s*(string|number|boolean|void|any|never|unknown)\b/,  // type annotations
      /\binterface\s+\w+/,              // interface Foo
      /\b<\w+>\s*\(/,                   // generic <T>(
      /\btype\s+\w+\s*=\s*\{/,          // type Foo = {
    ],
    medium: [
      /\btype\s+\w+\s*=/,               // type alias
      /\bas\s+\w+/,                      // type assertion
      /\benum\s+\w+/,                    // enum
      /\bReadonly<|Partial<|Record</,     // utility types
    ],
  },
  {
    lang: "javascript",
    high: [
      /\bconsole\.\w+\s*\(/,            // console.log(
      /\b(const|let|var)\s+\w+\s*=/,    // const x =
    ],
    medium: [
      /\b=>\s*[{(]/,                    // arrow function
      /\brequire\s*\(/,                 // require()
      /\bmodule\.exports/,              // module.exports
      /\bdocument\.\w+/,                // document.getElementById
      /\bwindow\.\w+/,                  // window.location
      /\bfunction\s+\w+\s*\(/,          // function foo(
      /\bnew\s+Promise\s*\(/,           // new Promise(
      /\basync\s+function/,             // async function
      /\bawait\s+/,                     // await
      /\b\.then\s*\(/,                  // .then(
      /\b\.catch\s*\(/,                 // .catch(
    ],
  },
  {
    lang: "java",
    high: [
      /\bpublic\s+(static\s+)?void\s+main/,  // main method
      /\bSystem\.out\.print/,                  // System.out.println
    ],
    medium: [
      /\bpublic\s+class\s+/,            // public class
      /\bprivate\s+\w+\s+\w+/,          // private int x
      /\b@Override\b/,                   // annotation
      /\bimport\s+java\./,              // import java.
      /\bString\[\]\s+args/,            // String[] args
      /\bnew\s+\w+\s*\(/,              // new Object(
      /\bextends\s+\w+/,               // extends
      /\bimplements\s+\w+/,            // implements
    ],
  },
  {
    lang: "cpp",
    high: [/\b#include\s*<\w+>/, /\bstd::\w+/, /\bcout\s*<</],
    medium: [/\busing\s+namespace\b/, /\bvector</, /\bint\s+main\s*\(/, /\bcin\s*>>/, /\bendl\b/],
  },
  {
    lang: "c",
    high: [/\b#include\s*<stdio\.h>/, /\bprintf\s*\(/],
    medium: [/\b#include\s*<\w+\.h>/, /\bmalloc\s*\(/, /\bfree\s*\(/, /\bscanf\s*\(/, /\btypedef\s+/],
  },
  {
    lang: "csharp",
    high: [/\busing\s+System\b/, /\bnamespace\s+\w+/],
    medium: [/\bConsole\.\w+/, /\bclass\s+\w+\s*:\s*\w+/, /\bvoid\s+\w+\s*\(/, /\bstring\[\]\s+args/, /\bvar\s+\w+\s*=\s*new\b/],
  },
  {
    lang: "go",
    high: [/\bfunc\s+\w+\s*\(/, /\bpackage\s+main\b/],
    medium: [/\bfmt\.\w+/, /\b:=\s*/, /\bgo\s+func/, /\bdefer\s+/, /\bgoroutine\b/],
  },
  {
    lang: "rust",
    high: [/\bfn\s+main\s*\(/, /\blet\s+mut\s+/],
    medium: [/\bimpl\s+\w+/, /\b->\s*\w+/, /\bprintln!\s*\(/, /\bmatch\s+\w+\s*\{/, /\bOption<|Result</],
  },
  {
    lang: "ruby",
    high: [/\bdef\s+\w+.*\bend\b/s, /\bputs\s+/],
    medium: [/\bclass\s+\w+\s*<\s*\w+/, /\battr_accessor\b/, /\bdo\s*\|/, /\brequire\s+['"]/, /\bend\s*$/m],
  },
  {
    lang: "php",
    high: [/\b<\?php\b/, /\b\$\w+\s*=/],
    medium: [/\becho\s+/, /\bfunction\s+\w+\s*\(\s*\$/, /\b->\w+\s*\(/, /\barray\s*\(/],
  },
  {
    lang: "swift",
    high: [/\bvar\s+\w+\s*:\s*\w+/, /\bfunc\s+\w+\s*\(.*\)\s*->/],
    medium: [/\bguard\s+let\b/, /\bif\s+let\b/, /\bprint\s*\(/, /\bstruct\s+\w+/],
  },
  {
    lang: "kotlin",
    high: [/\bfun\s+main\s*\(/, /\bval\s+\w+\s*[:=]/],
    medium: [/\bvar\s+\w+\s*:/, /\bprintln\s*\(/, /\bdata\s+class\b/, /\bwhen\s*\{/],
  },
  {
    lang: "sql",
    high: [/\bSELECT\s+.+\bFROM\b/i, /\bCREATE\s+TABLE\b/i],
    medium: [/\bINSERT\s+INTO\b/i, /\bWHERE\b/i, /\bJOIN\b/i, /\bALTER\s+TABLE\b/i],
  },
  {
    lang: "html",
    high: [/<!DOCTYPE\s+html>/i, /<html[\s>]/i],
    medium: [/<div[\s>]/, /<\/\w+>/, /<a\s+href/, /<script[\s>]/, /<link\s+/],
  },
  {
    lang: "css",
    high: [/\b\w+\s*\{[^}]*:\s*[^}]+\}/s],
    medium: [/@media\s*\(/, /\.\w+\s*\{/, /#\w+\s*\{/, /\bbackground\s*:/, /\bmargin\s*:/],
  },
  {
    lang: "shell",
    high: [/^#!/m, /\bsudo\s+/, /\bapt(-get)?\s+install/],
    medium: [/\becho\s+"/, /\|\s*grep\b/, /\bchmod\b/, /\bexport\s+\w+=/],
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

      // Confidence: high-rule match + strong score = "high"
      //             high-rule match alone = "medium"
      //             3+ medium matches (no high) = "medium"  ← THIS was the missing case
      //             below that = "low"
      if (hasHigh) {
        bestConfidence = score >= 5 ? "high" : "medium";
      } else {
        bestConfidence = score >= 3 ? "medium" : "low";
      }
    }
  }

  // If the best score is too low, treat as plaintext
  if (bestScore < 2) {
    return { language: "plaintext", confidence: "low" };
  }

  return { language: bestLang, confidence: bestConfidence };
}
