import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["Ctrl", "Enter"], action: "Submit code for review" },
  { keys: ["Ctrl", "L"], action: "Clear the editor" },
  { keys: ["Ctrl", "/"], action: "Toggle this shortcuts panel" },
  { keys: ["Escape"], action: "Close sidebar / modal" },
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <Keyboard size={16} className="text-violet-500" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-3.5">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 text-xs font-mono font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-md shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
