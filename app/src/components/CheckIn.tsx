"use client";

import { useState } from "react";
import PillButton from "./PillButton";

export default function CheckIn({
  label,
  onSave,
}: {
  label: "pre" | "post";
  onSave: (value: number, note: string) => void;
}) {
  const [value, setValue] = useState(3);
  const [note, setNote] = useState("");

  const labels = ["Very Low", "Low", "Moderate", "High", "Very High"];

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-1">
        {label === "pre" ? "Pre-Session Check-In" : "Post-Session Check-In"}
      </h3>
      <p className="text-sm text-muted mb-4">
        {label === "pre" ? "How's your energy level right now?" : "How do you feel after the session?"}
      </p>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => setValue(v)}
              className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all ${
                value === v
                  ? "bg-gold text-black"
                  : "bg-surface-light text-muted hover:bg-border"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gold mt-2 font-medium">
          {labels[value - 1]}
        </p>
      </div>

      {/* Note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any notes? (optional)"
        className="w-full bg-surface-light border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted resize-none h-20 focus:outline-none focus:border-gold/50"
      />

      <PillButton onClick={() => onSave(value, note)} className="mt-3">
        Save & Continue
      </PillButton>
    </div>
  );
}
