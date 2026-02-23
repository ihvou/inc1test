"use client";

import { useState, useCallback } from "react";
import type { ScriptBlock } from "@/lib/types";
import PillButton from "./PillButton";

export default function SessionPlayer({
  script,
  onComplete,
}: {
  script: ScriptBlock[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const block = script[currentIndex];
  const progress = ((currentIndex + 1) / script.length) * 100;

  const goNext = useCallback(() => {
    if (currentIndex < script.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete();
    }
  }, [currentIndex, onComplete, script.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const typeIcons: Record<string, string> = {
    text: "💬",
    breathing: "🌬️",
    reflection: "🪞",
    action: "⚡",
  };

  const typeColors: Record<string, string> = {
    text: "text-foreground",
    breathing: "text-blue-400",
    reflection: "text-purple-400",
    action: "text-gold",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {currentIndex + 1} of {script.length}
        </span>
        <span>{block.duration_seconds}s</span>
      </div>

      {/* Block card */}
      <div className="bg-surface rounded-2xl border border-border p-6 min-h-[200px] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{typeIcons[block.type] || "💬"}</span>
          <span className={`text-xs font-semibold uppercase tracking-wider ${typeColors[block.type]}`}>
            {block.type}
          </span>
        </div>
        <p className="text-lg leading-relaxed text-foreground">{block.content}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <PillButton
          onClick={goNext}
          className="flex-1"
        >
          {currentIndex === script.length - 1 ? "Complete Session" : "Next"}
        </PillButton>
      </div>
    </div>
  );
}
