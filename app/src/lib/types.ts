export interface ScriptBlock {
  type: "text" | "breathing" | "reflection" | "action";
  content: string;
  duration_seconds: number;
}

export interface GuidedSession {
  total_duration_seconds: number;
  script: ScriptBlock[];
}

export interface WorkoutStep {
  step_number: number;
  title: string;
  description: string;
  duration_minutes?: number;
}

export interface PlanDay {
  day_number: number;
  is_locked: boolean;
  title: string;
  objective: string;
  workout: {
    steps: WorkoutStep[];
  };
  guided_session: GuidedSession;
}

export interface Insight {
  icon: string;
  title: string;
  description: string;
}

export interface GymPersonalizedPlan {
  program: {
    title: string;
    summary: string;
    time_budget_minutes: number;
    disclaimer: string;
  };
  insights: Insight[];
  days: PlanDay[];
}

export interface CheckIn {
  pre: number;
  post: number;
  note: string;
}

export interface ProgressState {
  completedDays: Record<string, boolean>;
  checkins: Record<string, CheckIn>;
  lastOpenedDay: number;
}

export interface InputJSON {
  version: string;
  answers: {
    gym_24_time_invest_daily: string;
    gym_25_challenges: string[];
    gym_26_when_fail: string;
    [key: string]: unknown;
  };
}
