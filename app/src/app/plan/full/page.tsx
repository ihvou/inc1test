"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import TopBar from "@/components/TopBar";
import Card from "@/components/Card";
import PillButton from "@/components/PillButton";
import { useAppState } from "@/lib/store";

export default function FullPlanPage() {
  const { plan, isPremium, progress, setProgressState, updatePlanState, inputJson } = useAppState();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [generatingWeek, setGeneratingWeek] = useState(false);
  const router = useRouter();

  if (!plan) {
    router.push("/");
    return null;
  }

  // Allow Day 1 even without premium
  if (!isPremium) {
    // Still show day 1 in full mode
  }

  const totalWeeks = Math.ceil(plan.days.length / 7);
  const weekStart = (currentWeek - 1) * 7;
  const weekDays = plan.days.slice(weekStart, weekStart + 7);

  const totalDays = plan.days.length;
  const completedCount = Object.values(progress.completedDays).filter(Boolean).length;

  function markDayDone(dayNum: number) {
    const updated = {
      ...progress,
      completedDays: { ...progress.completedDays, [String(dayNum)]: true },
    };
    setProgressState(updated);
  }

  async function handleGenerateNextWeek() {
    if (!plan) return;
    setGeneratingWeek(true);
    try {
      const nextWeekNum = totalWeeks + 1;
      const res = await fetch("/api/generate-next-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputJson,
          currentPlan: plan,
          weekNumber: nextWeekNum,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate next week");

      const data = await res.json();
      if (data.days && Array.isArray(data.days)) {
        // Append new days to existing plan
        const updatedPlan = {
          ...plan!,
          days: [...plan!.days, ...data.days],
        };
        updatePlanState(updatedPlan);

        // Initialize progress for new days
        const updatedProgress = { ...progress };
        data.days.forEach((d: { day_number: number }) => {
          if (!(String(d.day_number) in updatedProgress.completedDays)) {
            updatedProgress.completedDays[String(d.day_number)] = false;
          }
        });
        setProgressState(updatedProgress);

        // Navigate to the new week
        setCurrentWeek(nextWeekNum);
      }
    } catch (err) {
      console.error("Failed to generate next week:", err);
    } finally {
      setGeneratingWeek(false);
    }
  }

  return (
    <ScreenShell>
      <TopBar onBack={() => router.push("/")} />

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{plan.program.title}</h1>
        <p className="text-sm text-muted">{plan.program.summary}</p>
      </div>

      {/* Progress */}
      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Progress</span>
          <span className="text-sm text-gold font-bold">{completedCount}/{totalDays}</span>
        </div>
        <div className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalDays) * 100}%` }}
          />
        </div>
      </div>

      {/* Week header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
          Week {currentWeek}
        </h2>
        <span className="text-xs text-muted">
          Days {weekStart + 1}–{Math.min(weekStart + 7, plan.days.length)}
        </span>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {weekDays.map((day) => {
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
                    router.push("/email");
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

      {/* Week pagination */}
      <div className="mt-6 mb-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => {
                setCurrentWeek(week);
                setExpandedDay(null);
              }}
              className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                currentWeek === week
                  ? "bg-gold text-black"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:border-gold/50"
              }`}
            >
              {week}
            </button>
          ))}

          {/* Next week button */}
          <button
            onClick={handleGenerateNextWeek}
            disabled={generatingWeek}
            className="w-9 h-9 rounded-full bg-surface border border-border border-dashed text-muted hover:text-gold hover:border-gold/50 flex items-center justify-center transition-all disabled:opacity-50"
          >
            {generatingWeek ? (
              <span className="w-4 h-4 border-2 border-muted/30 border-t-gold rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>

        {generatingWeek && (
          <p className="text-xs text-gold text-center mt-2 animate-pulse">
            Generating Week {totalWeeks + 1}...
          </p>
        )}
      </div>

      <div className="h-6" />
    </ScreenShell>
  );
}
