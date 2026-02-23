"use client";

import { useRouter } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import TopBar from "@/components/TopBar";
import DayCard from "@/components/DayCard";
import { useAppState } from "@/lib/store";

export default function PlanPage() {
  const { plan, isPremium, progress } = useAppState();
  const router = useRouter();

  if (!plan) {
    router.push("/");
    return null;
  }

  function handleDayClick(dayNum: number) {
    if (dayNum === 1 || isPremium) {
      router.push("/plan/full");
    } else {
      router.push("/email");
    }
  }

  return (
    <ScreenShell>
      <TopBar onBack={() => router.push("/preview")} />

      {/* Program header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">{plan.program.title}</h1>
        <p className="text-sm text-muted mb-3">{plan.program.summary}</p>
        <div className="flex gap-2">
          <span className="text-xs bg-surface border border-border px-3 py-1 rounded-full text-muted">
            {plan.program.time_budget_minutes} min/day
          </span>
          <span className="text-xs bg-surface border border-border px-3 py-1 rounded-full text-muted">
            7 days
          </span>
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {plan.days.map((day) => {
          const isLocked = day.day_number > 1 && !isPremium;
          const isCompleted = progress.completedDays[String(day.day_number)] === true;

          return (
            <DayCard
              key={day.day_number}
              dayNumber={day.day_number}
              title={day.title}
              objective={day.objective}
              isLocked={isLocked}
              isCompleted={isCompleted}
              isActive={day.day_number === 1 && !isCompleted}
              onClick={() => handleDayClick(day.day_number)}
            />
          );
        })}
      </div>
    </ScreenShell>
  );
}
