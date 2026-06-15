import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let toastId = 0;

const TOAST_CONFIG = {
  success: { Icon: CheckCircle2, bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
  error:   { Icon: XCircle,      bg: "bg-red-500/15 border-red-500/30",         text: "text-red-400" },
  warning: { Icon: AlertTriangle, bg: "bg-amber-500/15 border-amber-500/30",    text: "text-amber-400" },
  info:    { Icon: Info,          bg: "bg-violet-500/15 border-violet-500/30",   text: "text-violet-400" },
};

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-12 right-5 z-[200] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((t) => {
          const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
          const Icon = config.Icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-lg border backdrop-blur-xl text-sm font-medium shadow-lg transition-all duration-300 ${config.bg} ${config.text} ${
                t.exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0 animate-[slideIn_0.3s_ease-out]"
              }`}
            >
              <Icon size={16} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
