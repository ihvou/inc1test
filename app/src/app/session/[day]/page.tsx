"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ScreenShell from "@/components/ScreenShell";
import TopBar from "@/components/TopBar";
import SessionPlayer from "@/components/SessionPlayer";
import CheckIn from "@/components/CheckIn";
import { useAppState } from "@/lib/store";

export default function SessionPage() {
  const params = useParams();
  const dayNum = Number(params.day);
  const router = useRouter();
  const { plan, isPremium, progress, setProgressState } = useAppState();
  const [phase, setPhase] = useState<"pre-checkin" | "session" | "post-checkin" | "done">("pre-checkin");
  const [preScore, setPreScore] = useState(3);

  if (!plan) {
    router.push("/");
    return null;
  }

  if (dayNum > 1 && !isPremium) {
    router.push("/email");
    return null;
  }

  const day = plan.days.find((d) => d.day_number === dayNum);
  if (!day) {
    router.push("/plan/full");
    return null;
  }

  function handlePreCheckin(value: number) {
    setPreScore(value);
    setPhase("session");
  }

  function handleSessionComplete() {
    setPhase("post-checkin");
  }

  function handlePostCheckin(value: number, note: string) {
    const updated = {
      ...progress,
      completedDays: { ...progress.completedDays, [String(dayNum)]: true },
      checkins: {
        ...progress.checkins,
        [String(dayNum)]: { pre: preScore, post: value, note },
      },
      lastOpenedDay: dayNum,
    };
    setProgressState(updated);
    setPhase("done");
  }

  return (
    <ScreenShell>
      <TopBar onBack={() => router.push("/plan/full")} />

      <div className="mb-4">
        <div className="text-xs text-muted uppercase tracking-wider mb-1">Day {dayNum}</div>
        <h1 className="text-xl font-bold text-foreground">{day.title}</h1>
        <p className="text-sm text-muted mt-1">{day.objective}</p>
      </div>

      {phase === "pre-checkin" && (
        <CheckIn label="pre" onSave={(v) => handlePreCheckin(v)} />
      )}

      {phase === "session" && (
        <SessionPlayer
          script={day.guided_session.script}
          onComplete={handleSessionComplete}
        />
      )}

      {phase === "post-checkin" && (
        <CheckIn label="post" onSave={handlePostCheckin} />
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Session Complete!</h2>
          <p className="text-sm text-muted mb-6">
            Day {dayNum} is done. Your progress has been saved.
          </p>
          <button
            onClick={() => router.push("/plan/full")}
            className="text-gold font-semibold hover:underline"
          >
            Back to Plan
          </button>
        </div>
      )}
    </ScreenShell>
  );
}
