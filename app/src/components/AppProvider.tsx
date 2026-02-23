"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AppContext,
  getPlan,
  getProgress,
  getEmail,
  getIsPremium,
  savePlan as storeSavePlan,
  setProgress as storeSetProgress,
  setEmail as storeSetEmail,
  setIsPremium as storeSetIsPremium,
  resetAll,
} from "@/lib/store";
import type { GymPersonalizedPlan, ProgressState } from "@/lib/types";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanLocal] = useState<GymPersonalizedPlan | null>(null);
  const [isPremium, setIsPremiumLocal] = useState(false);
  const [progress, setProgressLocal] = useState<ProgressState>({
    completedDays: {},
    checkins: {},
    lastOpenedDay: 1,
  });
  const [email, setEmailLocal] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlanLocal(getPlan());
    setIsPremiumLocal(getIsPremium());
    setProgressLocal(getProgress());
    setEmailLocal(getEmail());
    setMounted(true);
  }, []);

  const setPlan = useCallback((p: GymPersonalizedPlan) => {
    storeSavePlan(p);
    setPlanLocal(p);
  }, []);

  const setIsPremiumState = useCallback((v: boolean) => {
    storeSetIsPremium(v);
    setIsPremiumLocal(v);
  }, []);

  const setProgressState = useCallback((p: ProgressState) => {
    storeSetProgress(p);
    setProgressLocal(p);
  }, []);

  const setEmailState = useCallback((e: string) => {
    storeSetEmail(e);
    setEmailLocal(e);
  }, []);

  const resetState = useCallback(() => {
    resetAll();
    setPlanLocal(null);
    setIsPremiumLocal(false);
    setProgressLocal({ completedDays: {}, checkins: {}, lastOpenedDay: 1 });
    setEmailLocal("");
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{ plan, isPremium, progress, email, setPlan, setIsPremiumState, setProgressState, setEmailState, resetState }}
    >
      {children}
    </AppContext.Provider>
  );
}
