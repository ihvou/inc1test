"use client";

import type { Insight } from "@/lib/types";

export default function InsightCarousel({ insights }: { insights: Insight[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-hide">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="snap-center flex-shrink-0 w-[260px] bg-surface rounded-2xl border border-border p-4"
        >
          <div className="text-2xl mb-2">{insight.icon}</div>
          <h4 className="font-semibold text-foreground text-sm mb-1">{insight.title}</h4>
          <p className="text-xs text-muted leading-relaxed">{insight.description}</p>
        </div>
      ))}
    </div>
  );
}
