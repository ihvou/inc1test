"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import PillButton from "@/components/PillButton";
import { useAppState } from "@/lib/store";
import type { InputJSON } from "@/lib/types";

const sampleA: InputJSON = {
  version: "gym-funnel-v1",
  answers: {
    gym_24_time_invest_daily: "10–15 minutes",
    gym_25_challenges: ["No clear plan or structure", "Too many distractions"],
    gym_26_when_fail: "Reflect, adjust, and go again",
  },
};

const sampleB: InputJSON = {
  version: "gym-funnel-v1",
  answers: {
    gym_24_time_invest_daily: "5–10 minutes",
    gym_25_challenges: ["Low energy or motivation", "Fear of failure"],
    gym_26_when_fail: "Get frustrated but eventually try again",
  },
};

const sampleC: InputJSON = {
  version: "gym-funnel-v1",
  answers: {
    gym_24_time_invest_daily: "20–30 minutes",
    gym_25_challenges: ["No clear plan or structure", "Doubt or insecurity"],
    gym_26_when_fail: "Quit and move on to something else",
  },
};

export default function DevHarness() {
  const [json, setJson] = useState(JSON.stringify(sampleA, null, 2));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPlan, resetState } = useAppState();

  async function handleGenerate() {
    setError("");
    setLoading(true);

    let parsed: InputJSON;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON. Please check syntax.");
      setLoading(false);
      return;
    }

    if (!parsed.answers?.gym_24_time_invest_daily || !parsed.answers?.gym_25_challenges || !parsed.answers?.gym_26_when_fail) {
      setError("Missing required fields: gym_24_time_invest_daily, gym_25_challenges, gym_26_when_fail");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setPlan(data);
      router.push("/preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Plan Generator</h1>
        <button
          onClick={resetState}
          className="text-xs text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg bg-surface border border-border"
        >
          Reset Demo
        </button>
      </div>

      <p className="text-sm text-muted mb-4">
        Paste your gym-funnel JSON answers below, or load a sample.
      </p>

      {/* Sample buttons */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "Sample A", data: sampleA },
          { label: "Sample B", data: sampleB },
          { label: "Sample C", data: sampleC },
        ].map(({ label, data }) => (
          <button
            key={label}
            onClick={() => setJson(JSON.stringify(data, null, 2))}
            className="text-xs px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-foreground hover:border-gold/50 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* JSON editor */}
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        className="w-full h-64 bg-surface border border-border rounded-xl p-4 font-mono text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-gold/50"
      />

      {error && (
        <p className="text-sm text-danger mt-2 px-1">{error}</p>
      )}

      <div className="mt-4">
        <PillButton onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate Plan"
          )}
        </PillButton>
      </div>

      <p className="text-xs text-muted text-center mt-4">Prototype — Dev Harness</p>
    </ScreenShell>
  );
}
