"use client";

import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import PillButton from "@/components/PillButton";
import InsightCarousel from "@/components/InsightCarousel";
import Card from "@/components/Card";
import { useAppState } from "@/lib/store";

export default function PreviewPage() {
  const { plan } = useAppState();
  const router = useRouter();

  if (!plan) {
    router.push("/");
    return null;
  }

  const day1 = plan.days[0];

  return (
    <ScreenShell
      bottomSlot={
        <div className="flex flex-col gap-2">
          <PillButton onClick={() => router.push("/email")}>
            Save & Continue
          </PillButton>
          <button
            onClick={() => router.push("/plan")}
            className="text-sm text-muted hover:text-foreground text-center py-2 transition-colors"
          >
            Continue without email
          </button>
        </div>
      }
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Program Ready
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your custom program is ready
        </h1>
        <p className="text-sm text-muted">{plan.program.summary}</p>
      </div>

      {/* Insights */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Key Insights</h2>
        <InsightCarousel insights={plan.insights} />
      </div>

      {/* Day 1 Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Day 1 — {day1.title}</h2>
        <Card>
          <p className="text-sm text-gold font-medium mb-3">{day1.objective}</p>
          <div className="space-y-3">
            {day1.workout.steps.map((step) => (
              <div key={step.step_number} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.step_number}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Start session CTA */}
      <PillButton variant="secondary" onClick={() => router.push("/session/1")}>
        Start Today&apos;s Session
      </PillButton>

      <div className="h-24" />
    </ScreenShell>
  );
}
