import { useEffect, useRef } from "react";
import { TerminalSquare, Trash2, Loader2 } from "lucide-react";

/**
 * Terminal component — displays code execution output with real terminal styling.
 */
export default function Terminal({ output, running, onClear }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new output arrives (smooth)
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [output]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.06] flex-shrink-0">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <TerminalSquare size={12} /> Terminal
        </span>
        <div className="flex items-center gap-1.5">
          {running && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
              <Loader2 size={11} className="animate-spin" /> Running…
            </span>
          )}
          {output.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body — pb-10 ensures the last lines are never hidden behind the footer */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#0a0a14] p-4 pb-10 font-mono text-[13px] leading-relaxed scroll-smooth"
      >
        {output.length === 0 && !running ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2">
            <TerminalSquare size={24} className="text-gray-600" />
            <p className="text-xs text-gray-600">
              Click <span className="text-emerald-400 font-semibold">▶ Run</span> to execute your code
            </p>
            <p className="text-[10px] text-gray-700">
              Sandboxed browser execution · JavaScript
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {output.map((line, i) => (
              <div key={i} className={`flex gap-2 ${getLineStyle(line.type)}`}>
                {line.type === "info" && (
                  <span className="text-gray-600 select-none flex-shrink-0">$</span>
                )}
                <pre className="whitespace-pre-wrap break-all m-0 flex-1">{line.text}</pre>
              </div>
            ))}

            {/* Blinking cursor when running */}
            {running && (
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getLineStyle(type) {
  switch (type) {
    case "stdout":  return "text-gray-300";
    case "stderr":  return "text-red-400";
    case "info":    return "text-violet-400";
    case "success": return "text-emerald-400";
    case "error":   return "text-red-400 font-medium";
    case "meta":    return "text-gray-600 text-[11px]";
    default:        return "text-gray-400";
  }
}

