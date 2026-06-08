/**
 * Code execution engine.
 * - Runs JavaScript locally in a secure, sandboxed Web Worker (instant execution).
 * - Runs other languages (Python, Java, C++, Go, etc.) via the free Wandbox public API.
 */

const TIMEOUT_MS = 5000;

// Wandbox API mappings for supported languages
const WANDBOX_COMPILERS = {
  typescript: "typescript-5.6.2",
  python: "cpython-3.14.0",
  java: "openjdk-jdk-22+36",
  cpp: "gcc-head",
  c: "gcc-head-c",
  csharp: "mono-6.12.0.199",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  php: "php-8.3.12",
  ruby: "ruby-4.0.2",
  swift: "swift-6.0.1",
  shell: "bash"
};

// All executable languages (JS is handled locally)
export const EXECUTABLE_LANGUAGES = new Set(["javascript", ...Object.keys(WANDBOX_COMPILERS)]);

/**
 * Execute code either locally (JS) or via Wandbox API.
 */
export async function executeCode(code, language) {
  if (language === "javascript") {
    return executeClientSideJS(code);
  }

  const compiler = WANDBOX_COMPILERS[language];
  if (!compiler) {
    throw new Error(`Execution for ${language} is not supported yet.`);
  }

  return executeViaWandbox(code, compiler);
}

/**
 * Run JavaScript code in a sandboxed Web Worker.
 */
function executeClientSideJS(code) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const escapedCode = JSON.stringify(code);

    const workerScript = `
'use strict';
const __logs = [];
const __errs = [];

globalThis.console = {
  log:   (...a) => __logs.push(a.map(__fmt).join(' ')),
  info:  (...a) => __logs.push(a.map(__fmt).join(' ')),
  warn:  (...a) => __errs.push('[warn] ' + a.map(__fmt).join(' ')),
  error: (...a) => __errs.push(a.map(__fmt).join(' ')),
  debug: (...a) => __logs.push('[debug] ' + a.map(__fmt).join(' ')),
  table: (...a) => __logs.push(JSON.stringify(a[0], null, 2)),
  dir:   (...a) => __logs.push(JSON.stringify(a[0], null, 2)),
  clear: () => {},
};

function __fmt(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') {
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  }
  return String(v);
}

try {
  const __code = ${escapedCode};
  const __fn = new Function('return (async () => {\\n' + __code + '\\n})()');
  __fn().then((r) => {
    if (r !== undefined) __logs.push(__fmt(r));
    postMessage({ stdout: __logs.join('\\n'), stderr: __errs.join('\\n'), exitCode: 0 });
  }).catch((e) => {
    __errs.push(e.stack || e.message || String(e));
    postMessage({ stdout: __logs.join('\\n'), stderr: __errs.join('\\n'), exitCode: 1 });
  });
} catch (e) {
  __errs.push(e.stack || e.message || String(e));
  postMessage({ stdout: __logs.join('\\n'), stderr: __errs.join('\\n'), exitCode: 1 });
}
`;

    const blob = new Blob([workerScript], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        stdout: "",
        stderr: "Error: Execution timed out after 5 seconds.\\nPossible infinite loop detected.",
        exitCode: 1,
        executionTime: TIMEOUT_MS,
      });
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ...e.data, executionTime: Date.now() - startTime });
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        stdout: "",
        stderr: e.message || "Unknown worker error",
        exitCode: 1,
        executionTime: Date.now() - startTime,
      });
    };
  });
}

/**
 * Execute code via Wandbox public API.
 */
async function executeViaWandbox(code, compiler) {
  const startTime = Date.now();
  
  try {
    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: compiler,
        code: code,
        save: false
      })
    });

    if (!res.ok) {
      throw new Error(`Execution API failed (${res.status})`);
    }

    const data = await res.json();
    
    // Wandbox returns compiler_message, program_message, status
    // status is usually "0" for success
    
    let stdout = "";
    let stderr = "";
    
    // Combine compile errors and runtime errors into stderr
    if (data.compiler_error) stderr += data.compiler_error.trim() + "\n";
    if (data.program_error) stderr += data.program_error.trim() + "\n";
    
    // Combine output
    if (data.compiler_message && !data.compiler_error) stdout += data.compiler_message.trim() + "\n";
    if (data.program_output) stdout += data.program_output.trim() + "\n";

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: parseInt(data.status || "0", 10),
      executionTime: Date.now() - startTime
    };
  } catch (err) {
    return {
      stdout: "",
      stderr: "Cloud Execution Error: " + err.message,
      exitCode: 1,
      executionTime: Date.now() - startTime
    };
  }
}
