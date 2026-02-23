"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import TopBar from "@/components/TopBar";
import Card from "@/components/Card";
import PillButton from "@/components/PillButton";
import { useAppState } from "@/lib/store";

export default function FullPlanPage() {
  const { plan, isPremium, progress, setProgressState } = useAppState();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const router = useRouter();

  if (!plan) {
    router.push("/");
    return null;
  }

  // Allow Day 1 even without premium
  if (!isPremium) {
    // Still show day 1 in full mode
  }

  const completedCount = Object.values(progress.completedDays).filter(Boolean).length;

  function markDayDone(dayNum: number) {
    const updated = {
      ...progress,
      completedDays: { ...progress.completedDays, [String(dayNum)]: true },
    };
    setProgressState(updated);
  }

  return (
    <ScreenShell>
      <TopBar onBack={() => router.push("/plan")} />

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{plan.program.title}</h1>
        <p className="text-sm text-muted">{plan.program.summary}</p>
      </div>

      {/* Progress */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Progress</span>
          <span className="text-sm text-gold font-bold">{completedCount}/7</span>
        </div>
        <div className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {plan.days.map((day) => {
          const isCompleted = progress.completedDays[String(day.day_number)] === true;
          const isExpanded = expandedDay === day.day_number;
          const checkin = progress.checkins[String(day.day_number)];
          const canAccess = isPremium || day.day_number === 1;

          return (
            <Card key={day.day_number} className="!p-0 overflow-hidden">
              {/* Day header - clickable */}
              <button
                onClick={() => {
                  if (canAccess) {
                    setExpandedDay(isExpanded ? null : day.day_number);
                  } else {
                    router.push("/paywall");
                  }
                }}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isCompleted
                      ? "bg-success/20 text-success"
                      : canAccess
                      ? "bg-gold/10 text-gold"
                      : "bg-surface-light text-muted"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : !canAccess ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    day.day_number
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted uppercase tracking-wider">Day {day.day_number}</div>
                  <h3 className="font-semibold text-foreground">{day.title}</h3>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-muted flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && canAccess && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-sm text-gold font-medium mb-3">{day.objective}</p>

                  {/* Steps */}
                  <div className="space-y-2 mb-4">
                    {day.workout.steps.map((step) => (
                      <div key={step.step_number} className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-gold/10 text-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {step.step_number}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{step.title}</span>
                          <span className="text-sm text-muted"> — {step.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Check-in display */}
                  {checkin && (
                    <div className="bg-surface-light rounded-xl p-3 mb-3 text-sm">
                      <div className="flex gap-4 text-muted">
                        <span>Pre: <strong className="text-foreground">{checkin.pre}/5</strong></span>
                        <span>Post: <strong className="text-foreground">{checkin.post}/5</strong></span>
                      </div>
                      {checkin.note && <p className="text-muted mt-1 text-xs">{checkin.note}</p>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <PillButton
                      variant="primary"
                      onClick={() => router.push(`/session/${day.day_number}`)}
                      className="flex-1"
                    >
                      {isCompleted ? "Replay Session" : "Start Session"}
                    </PillButton>
                    {!isCompleted && (
                      <PillButton
                        variant="secondary"
                        onClick={() => markDayDone(day.day_number)}
                        className="flex-1"
                      >
                        Mark Done
                      </PillButton>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="h-6" />
    </ScreenShell>
  );
}
