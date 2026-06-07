import { X, Trash2, Clock, Inbox } from "lucide-react";

const formatDate = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString([], { month: "short", day: "numeric" })
  );
};

export default function Sidebar({
  open,
  history,
  activeId,
  onSelect,
  onDelete,
  onClearAll,
  onClose,
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white/95 dark:bg-[#0f0f1a]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/[0.06] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06]">
          <h2 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            <Clock size={12} /> History
          </h2>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-[11px] text-red-400/70 hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={11} /> Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <Inbox size={28} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No reviews yet</p>
              <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">
                Your reviews will appear here
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                  activeId === item.id
                    ? "bg-violet-500/10 border-violet-500/30"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:border-gray-200 dark:hover:border-white/[0.06]"
                }`}
                onClick={() => onSelect(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">
                    {item.language}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
                    {item.strictness}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate pr-6">
                  {item.codeSnippet}
                </p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                  {formatDate(item.createdAt)}
                </p>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete this review"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 dark:border-white/[0.06]">
          <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center">
            Stored locally · {history.length}/{MAX_HISTORY}
          </p>
        </div>
      </aside>
    </>
  );
}

const MAX_HISTORY = 10;
