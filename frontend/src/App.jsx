import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Menu, Sun, Moon, Keyboard, Trash2, Square, Rocket, Copy, Download, Code2, Bot, Sparkles, ChevronDown, FileCode, AlertTriangle, Play, TerminalSquare } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ScoreRing from "./components/ScoreRing";
import ShortcutsModal from "./components/ShortcutsModal";
import Terminal from "./components/Terminal";
import { useToast } from "./components/ToastProvider";
import { detectLanguage } from "./utils/detectLanguage";
import { executeCode, EXECUTABLE_LANGUAGES } from "./utils/codeRunner";

const MAX_CHARS = 15000;
const MAX_HISTORY = 10;
const BACKEND = import.meta.env.VITE_BACKEND_API || "http://localhost:3000/ai/get-review";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" }, { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" }, { value: "java", label: "Java" },
  { value: "cpp", label: "C++" }, { value: "c", label: "C" },
  { value: "csharp", label: "C#" }, { value: "go", label: "Go" },
  { value: "rust", label: "Rust" }, { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" }, { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" }, { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" }, { value: "css", label: "CSS" },
  { value: "shell", label: "Shell" }, { value: "plaintext", label: "Plain Text" },
];
const MODES = [
  { value: "standard", label: "Standard" }, { value: "nitpicky", label: "Nitpicky" },
  { value: "security", label: "Security" }, { value: "performance", label: "Performance" },
];

const DEFAULT_CODE = `// Paste your code here, then hit Ctrl+Enter or click "Review"
function fetchUserData(userId) {
  let data = fetch('/api/users/' + userId).then(r => r.json());
  return data;
}

function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].age > 18) {
      result.push(users[i]);
    }
  }
  return result;
}`;

const loadHistory = () => { try { return JSON.parse(localStorage.getItem("cr_history") || "[]"); } catch { return []; } };
const saveHistory = (h) => localStorage.setItem("cr_history", JSON.stringify(h));

export default function App() {
  const { addToast } = useToast();
  const [dark, setDark] = useState(() => localStorage.getItem("cr_theme") !== "light");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");
  const [autoLang, setAutoLang] = useState(null);
  const [strictness, setStrictness] = useState("standard");
  const [review, setReview] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  // Terminal state
  const [rightTab, setRightTab] = useState("review"); // "review" | "terminal"
  const [termOutput, setTermOutput] = useState([]);
  const [termRunning, setTermRunning] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("cr_theme", dark ? "dark" : "light"); }, [dark]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = detectLanguage(code);
      setAutoLang(result);
      if (result.confidence === "high" || result.confidence === "medium") setLanguage(result.language);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); reviewCode(); }
      if (e.ctrlKey && e.key === "l") { e.preventDefault(); setCode(""); addToast("Editor cleared", "info"); }
      if (e.ctrlKey && e.key === "/") { e.preventDefault(); setShortcutsOpen((v) => !v); }
      if (e.key === "Escape") { if (shortcutsOpen) setShortcutsOpen(false); else if (sidebarOpen) setSidebarOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const reviewCode = useCallback(async () => {
    if (streaming || !code.trim() || code.length > MAX_CHARS) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true); setError(""); setReview(""); setActiveHistoryId(null); setRightTab("review");
    try {
      const res = await fetch(BACKEND, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language, strictness }), signal: controller.signal });
      if (!res.ok) { const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` })); throw new Error(body.error || `Request failed (${res.status})`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let accumulated = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
        for (const line of lines) { if (!line.startsWith("data: ")) continue; try { const parsed = JSON.parse(line.slice(6).trim()); if (parsed.done) break; if (parsed.chunk) { accumulated += parsed.chunk; setReview(accumulated); } } catch {} }
      }
      if (accumulated) {
        const entry = { id: Date.now(), language, strictness, codeSnippet: code.trim().slice(0, 80), review: accumulated, createdAt: new Date().toISOString() };
        setHistory((prev) => { const updated = [entry, ...prev].slice(0, MAX_HISTORY); saveHistory(updated); return updated; });
        setActiveHistoryId(entry.id); addToast("Review complete!", "success");
      }
    } catch (err) { if (err.name !== "AbortError") { setError(err.message); addToast(err.message, "error"); } } finally { setStreaming(false); }
  }, [code, language, strictness, streaming, addToast]);

  // ─── Run Code (client-side via Web Worker) ─────────────────────────────
  const runCode = useCallback(async () => {
    if (termRunning || !code.trim()) return;
    if (!EXECUTABLE_LANGUAGES.has(language)) {
      addToast(`Client-side execution supports JavaScript only`, "warning");
      setRightTab("terminal");
      setTermOutput((prev) => [...prev, { type: "error", text: `⚠ ${language} execution is not available in the browser.` }, { type: "meta", text: "Client-side runner supports JavaScript. For other languages, use your local dev environment." }]);
      return;
    }
    setRightTab("terminal"); setTermRunning(true);
    setTermOutput((prev) => [...prev, { type: "info", text: `$ executing ${language} code...` }]);
    try {
      const data = await executeCode(code, language);
      const lines = [];
      if (data.stdout) data.stdout.split("\n").forEach((l) => lines.push({ type: "stdout", text: l }));
      if (data.stderr) data.stderr.split("\n").forEach((l) => lines.push({ type: "stderr", text: l }));
      lines.push({ type: "meta", text: `\n⏱ ${data.executionTime}ms · exit ${data.exitCode}` });
      if (data.exitCode === 0) lines.push({ type: "success", text: "✓ Process exited successfully" });
      else lines.push({ type: "error", text: `✕ Process exited with code ${data.exitCode}` });
      setTermOutput((prev) => [...prev, ...lines]);
      addToast(data.exitCode === 0 ? "Executed successfully" : "Finished with errors", data.exitCode === 0 ? "success" : "warning");
    } catch (err) {
      setTermOutput((prev) => [...prev, { type: "error", text: `Error: ${err.message}` }]);
      addToast(err.message, "error");
    } finally { setTermRunning(false); }
  }, [code, language, termRunning, addToast]);

  const stopStream = () => { abortRef.current?.abort(); setStreaming(false); };
  const copyReview = async () => { if (!review) return; await navigator.clipboard.writeText(review); addToast("Copied to clipboard", "success"); };
  const exportMd = () => { if (!review) return; const blob = new Blob([`# AI Code Review\n\n**Language:** ${language} | **Mode:** ${strictness}\n\n---\n\n${review}`], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `code-review-${Date.now()}.md`; a.click(); URL.revokeObjectURL(a.href); addToast("Exported as Markdown", "success"); };
  const selectHistory = (item) => { setReview(item.review); setLanguage(item.language); setStrictness(item.strictness); setError(""); setActiveHistoryId(item.id); setSidebarOpen(false); setRightTab("review"); };
  const deleteHistory = (id) => { setHistory((prev) => { const u = prev.filter((h) => h.id !== id); saveHistory(u); return u; }); if (activeHistoryId === id) { setActiveHistoryId(null); setReview(""); } addToast("Review deleted", "info"); };
  const clearHistory = () => { setHistory([]); saveHistory([]); setActiveHistoryId(null); addToast("History cleared", "warning"); };

  const charPercent = code.length / MAX_CHARS;
  const showSkeleton = streaming && !review;
  const canRun = EXECUTABLE_LANGUAGES.has(language);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-[#0a0a14] dark:text-gray-100 overflow-hidden">
      {/* HEADER */}
      <header className="h-12 flex items-center justify-between px-3 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0 z-50">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setSidebarOpen((v) => !v)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors" aria-label="Toggle history"><Menu size={18} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"><Code2 size={14} className="text-white" /></div>
            <span className="text-sm font-bold tracking-tight hidden sm:inline">Code<span className="text-violet-500">Pulse</span></span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShortcutsOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors" title="Shortcuts (Ctrl+/)"><Keyboard size={16} /></button>
          <button onClick={() => setDark((d) => !d)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors" title={dark ? "Light mode" : "Dark mode"}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/60 dark:bg-[#0f0f1a]/40 backdrop-blur-lg border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <FileCode size={13} className="text-gray-400" />
          <div className="relative">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-7 pl-2 pr-7 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-md text-xs text-gray-700 dark:text-gray-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all">
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {autoLang && autoLang.confidence !== "low" && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-medium">
              <Sparkles size={10} /> Auto: {LANGUAGES.find((l) => l.value === autoLang.language)?.label}
            </span>
          )}
        </div>
        <div className="w-px h-4 bg-gray-200 dark:bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mode</span>
          <div className="relative">
            <select value={strictness} onChange={(e) => setStrictness(e.target.value)} className="h-7 pl-2 pr-7 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-md text-xs text-gray-700 dark:text-gray-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all">
              {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${charPercent > 1 ? "bg-red-500" : charPercent > 0.8 ? "bg-amber-500" : "bg-violet-500"}`} style={{ width: `${Math.min(charPercent * 100, 100)}%` }} />
          </div>
          <span className={`text-[10px] font-mono tabular-nums ${charPercent > 1 ? "text-red-400" : charPercent > 0.8 ? "text-amber-400" : "text-gray-500"}`}>{code.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}</span>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} history={history} activeId={activeHistoryId} onSelect={selectHistory} onDelete={deleteHistory} onClearAll={clearHistory} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* LEFT: Editor */}
          <section className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/[0.06] min-h-0">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"><Code2 size={12} /> Editor</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setCode(""); addToast("Editor cleared", "info"); }} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"><Trash2 size={12} /> Clear</button>
                {/* Run Button */}
                {canRun && (
                  <button onClick={runCode} disabled={termRunning || !code.trim()} className="h-7 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                    <Play size={12} /> Run
                  </button>
                )}
                {/* Review Button */}
                {streaming ? (
                  <button onClick={stopStream} className="h-7 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center gap-1.5"><Square size={12} /> Stop</button>
                ) : (
                  <button onClick={reviewCode} disabled={!code.trim() || code.length > MAX_CHARS} className="h-7 px-3.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0 flex items-center gap-1.5"><Rocket size={12} /> Review</button>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language}
                value={code}
                theme={dark ? "vs-dark" : "light"}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  lineNumbers: "on",
                  minimap: { enabled: true, scale: 1 },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  padding: { top: 10, bottom: 10 },
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  tabSize: 2,
                  // Mobile fixes
                  accessibilitySupport: "off",
                  quickSuggestions: false,
                  parameterHints: { enabled: false },
                  suggestOnTriggerCharacters: false,
                  acceptSuggestionOnEnter: "off",
                  wordBasedSuggestions: "off",
                }}
              />
            </div>
          </section>

          {/* RIGHT: Tabs (Review / Terminal) */}
          <section className="flex-1 flex flex-col min-h-0">
            {/* Tab Bar */}
            <div className="flex items-center justify-between bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
              <div className="flex">
                <button onClick={() => setRightTab("review")} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider border-b-2 transition-colors ${rightTab === "review" ? "text-violet-500 border-violet-500" : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400"}`}>
                  <Bot size={12} /> Review
                </button>
                <button onClick={() => setRightTab("terminal")} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider border-b-2 transition-colors ${rightTab === "terminal" ? "text-emerald-400 border-emerald-400" : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400"}`}>
                  <TerminalSquare size={12} /> Terminal
                  {termOutput.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>
              {rightTab === "review" && review && !streaming && (
                <div className="flex items-center gap-1 pr-2">
                  <button onClick={copyReview} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"><Copy size={12} /> Copy</button>
                  <button onClick={exportMd} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"><Download size={12} /> Export</button>
                </div>
              )}
            </div>

            {/* Tab Content */}
            {rightTab === "review" ? (
              <div className="flex-1 overflow-y-auto p-5">
                {streaming && review && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-400 font-medium">
                    <span className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" /><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse [animation-delay:0.4s]" /></span>
                    Generating review…
                  </div>
                )}
                {showSkeleton && (<div className="space-y-4 animate-[fadeIn_0.3s_ease-out]"><div className="skeleton-line h-6 w-48" /><div className="skeleton-line h-4 w-full" /><div className="skeleton-line h-4 w-5/6" /><div className="skeleton-line h-4 w-3/4" /><div className="skeleton-line h-20 w-full mt-2" /><div className="skeleton-line h-4 w-2/3" /><div className="skeleton-line h-4 w-full" /><div className="skeleton-line h-16 w-full mt-2" /></div>)}
                {error && !streaming && (<div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"><AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span></div>)}
                {review && (<><ScoreRing reviewText={review} /><div className="review-md"><Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown></div></>)}
                {!review && !streaming && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center animate-[float_3s_ease-in-out_infinite]"><Code2 size={24} className="text-violet-400" /></div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ready to Review</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px] leading-relaxed">Paste code in the editor, pick your mode, then hit <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded text-[10px] font-mono">Ctrl+Enter</kbd></p>
                  </div>
                )}
              </div>
            ) : (
              <Terminal output={termOutput} running={termRunning} onClear={() => setTermOutput([])} />
            )}
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="h-7 flex items-center justify-between px-3 bg-white/60 dark:bg-[#0f0f1a]/40 backdrop-blur-lg border-t border-gray-200 dark:border-white/[0.06] flex-shrink-0">
        <span className="text-[10px] text-gray-400 dark:text-gray-600">Built by <a href="https://github.com/rohitkumar14203" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">Rohit Kumar</a></span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Gemini 2.5 Flash · Free</span>
      </footer>

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}
