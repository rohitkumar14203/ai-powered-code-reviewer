import { useMemo } from "react";

/**
 * Parses the AI review text for a score like "7/10", "Score: 8/10", etc.
 * Renders an animated SVG circular progress ring.
 */
export default function ScoreRing({ reviewText }) {
  const score = useMemo(() => {
    if (!reviewText) return null;
    const match = reviewText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    if (!match) return null;
    const val = parseFloat(match[1]);
    return val >= 0 && val <= 10 ? val : null;
  }, [reviewText]);

  if (score === null) return null;

  const radius = 36;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  const color =
    score >= 8 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444";
  const bgColor =
    score >= 8
      ? "rgba(34,197,94,0.1)"
      : score >= 5
      ? "rgba(245,158,11,0.1)"
      : "rgba(239,68,68,0.1)";
  const label = score >= 8 ? "Great" : score >= 5 ? "Okay" : "Needs Work";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] mb-5"
      style={{ background: bgColor }}>
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke="currentColor"
            strokeWidth={stroke}
            className="text-white/[0.08]"
          />
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
            style={{ animation: "scoreReveal 1s ease-out forwards" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-400 -mt-0.5">/10</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Overall Quality Score</p>
      </div>
    </div>
  );
}
