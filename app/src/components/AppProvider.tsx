"use client";

import { useState, useCallback } from "react";
import {
  AppContext,
  getPlan,
  getProgress,
  getEmail,
  getIsPremium,
  getInputJson,
  savePlan as storeSavePlan,
  updatePlan as storeUpdatePlan,
  setProgress as storeSetProgress,
  setEmail as storeSetEmail,
  setIsPremium as storeSetIsPremium,
  saveInputJson as storeSaveInputJson,
  resetAll,
} from "@/lib/store";
import type { GymPersonalizedPlan, ProgressState, InputJSON } from "@/lib/types";

const defaultProgress: ProgressState = {
  completedDays: { "1": false, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false },
  checkins: {},
  lastOpenedDay: 1,
};

function getInitialPlan(): GymPersonalizedPlan | null {
  if (typeof window === "undefined") return null;
  return getPlan();
}

function getInitialPremium(): boolean {
  if (typeof window === "undefined") return false;
  return getIsPremium();
}

function getInitialProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress;
  return getProgress();
}

function getInitialEmail(): string {
  if (typeof window === "undefined") return "";
  return getEmail();
}

function getInitialInputJson(): InputJSON | null {
  if (typeof window === "undefined") return null;
  return getInputJson();
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanLocal] = useState<GymPersonalizedPlan | null>(getInitialPlan);
  const [isPremium, setIsPremiumLocal] = useState(getInitialPremium);
  const [progress, setProgressLocal] = useState<ProgressState>(getInitialProgress);
  const [email, setEmailLocal] = useState(getInitialEmail);
  const [inputJson, setInputJsonLocal] = useState<InputJSON | null>(getInitialInputJson);

  const setPlan = useCallback((p: GymPersonalizedPlan) => {
    storeSavePlan(p);
    setPlanLocal(p);
  }, []);

  const updatePlanState = useCallback((p: GymPersonalizedPlan) => {
    storeUpdatePlan(p);
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

  const setInputJsonState = useCallback((j: InputJSON) => {
    storeSaveInputJson(j);
    setInputJsonLocal(j);
  }, []);

  const resetState = useCallback(() => {
    resetAll();
    setPlanLocal(null);
    setIsPremiumLocal(false);
    setProgressLocal(defaultProgress);
    setEmailLocal("");
    setInputJsonLocal(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        plan, isPremium, progress, email, inputJson,
        setPlan, updatePlanState, setIsPremiumState, setProgressState, setEmailState, setInputJsonState, resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
