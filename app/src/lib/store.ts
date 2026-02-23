"use client";

import { createContext, useContext } from "react";
import type { GymPersonalizedPlan, ProgressState, InputJSON } from "./types";

const KEYS = {
  plan: "mvp_plan_json",
  meta: "mvp_plan_meta",
  email: "mvp_email",
  premium: "mvp_is_premium",
  progress: "mvp_progress",
  inputJson: "mvp_input_json",
} as const;

const defaultProgress: ProgressState = {
  completedDays: { "1": false, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false },
  checkins: {},
  lastOpenedDay: 1,
};

export function savePlan(plan: GymPersonalizedPlan) {
  localStorage.setItem(KEYS.plan, JSON.stringify(plan));
  localStorage.setItem(KEYS.meta, JSON.stringify({ planId: crypto.randomUUID(), createdAtIso: new Date().toISOString() }));
  localStorage.setItem(KEYS.progress, JSON.stringify(defaultProgress));
}

export function updatePlan(plan: GymPersonalizedPlan) {
  localStorage.setItem(KEYS.plan, JSON.stringify(plan));
}

export function getPlan(): GymPersonalizedPlan | null {
  const raw = localStorage.getItem(KEYS.plan);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getProgress(): ProgressState {
  const raw = localStorage.getItem(KEYS.progress);
  if (!raw) return defaultProgress;
  try { return JSON.parse(raw); } catch { return defaultProgress; }
}

export function setProgress(progress: ProgressState) {
  localStorage.setItem(KEYS.progress, JSON.stringify(progress));
}

export function getEmail(): string {
  return localStorage.getItem(KEYS.email) || "";
}

export function setEmail(email: string) {
  localStorage.setItem(KEYS.email, email);
}

export function getIsPremium(): boolean {
  return localStorage.getItem(KEYS.premium) === "true";
}

export function setIsPremium(val: boolean) {
  localStorage.setItem(KEYS.premium, val ? "true" : "false");
}

export function saveInputJson(input: InputJSON) {
  localStorage.setItem(KEYS.inputJson, JSON.stringify(input));
}

export function getInputJson(): InputJSON | null {
  const raw = localStorage.getItem(KEYS.inputJson);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

// React context for sharing plan across components
export interface AppState {
  plan: GymPersonalizedPlan | null;
  isPremium: boolean;
  progress: ProgressState;
  email: string;
  inputJson: InputJSON | null;
  setPlan: (p: GymPersonalizedPlan) => void;
  updatePlanState: (p: GymPersonalizedPlan) => void;
  setIsPremiumState: (v: boolean) => void;
  setProgressState: (p: ProgressState) => void;
  setEmailState: (e: string) => void;
  setInputJsonState: (j: InputJSON) => void;
  resetState: () => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
