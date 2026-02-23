import { NextResponse } from "next/server";
import fallbackPlan from "@/lib/fallback-plan.json";
import type { GymPersonalizedPlan, InputJSON } from "@/lib/types";

const LLM_TIMEOUT_MS = 20000;

function parseTimeBudget(raw: string): number {
  if (raw.includes("5") && raw.includes("10")) return 10;
  if (raw.includes("10") && raw.includes("15")) return 15;
  if (raw.includes("15") && raw.includes("20")) return 20;
  if (raw.includes("20") || raw.includes("30")) return 30;
  return 15;
}

function getMockPlan(timeBudget: number): GymPersonalizedPlan {
  const plan = JSON.parse(JSON.stringify(fallbackPlan)) as GymPersonalizedPlan;
  plan.program.time_budget_minutes = timeBudget;
  return plan;
}

function mapChallenges(challenges: string[]): string {
  const mapping: Record<string, string> = {
    "No clear plan or structure": "structured checklists and clear step-by-step actions",
    "Too many distractions": "environment design, micro-commitments, and distraction defense",
    "Low energy or motivation": "short sessions, tiny wins, and energy management",
    "Fear of failure": "gentle coaching, self-compassion, and safe-to-fail experiments",
    "Doubt or insecurity": "confidence-building exercises and progressive challenges",
  };
  return challenges.map((c) => mapping[c] || c).join("; ");
}

function mapCoachingTone(style: string): string {
  if (style.toLowerCase().includes("quit")) return "Include relapse prevention and gentle re-entry prompts. Be encouraging about restarts.";
  if (style.toLowerCase().includes("frustrated")) return "Emphasize self-compassion, micro-restart steps, and celebrate small progress.";
  if (style.toLowerCase().includes("reflect") || style.toLowerCase().includes("try again")) return "Include reflection prompts and adaptive strategies. Encourage experimentation.";
  return "Use a balanced, supportive coaching tone.";
}

function validatePlanShape(data: unknown): data is GymPersonalizedPlan {
  if (!data || typeof data !== "object") return false;
  const plan = data as Record<string, unknown>;
  if (!plan.program || !plan.insights || !plan.days) return false;
  if (!Array.isArray(plan.days) || plan.days.length !== 7) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body: InputJSON = await request.json();

    if (!body.answers?.gym_24_time_invest_daily || !body.answers?.gym_25_challenges || !body.answers?.gym_26_when_fail) {
      return NextResponse.json({ error: "Missing required answer fields" }, { status: 400 });
    }

    const timeBudget = parseTimeBudget(body.answers.gym_24_time_invest_daily);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // No API key — return mocked fallback plan.
      return NextResponse.json(getMockPlan(timeBudget));
    }

    const challengeFocus = mapChallenges(body.answers.gym_25_challenges);
    const coachingTone = mapCoachingTone(body.answers.gym_26_when_fail);

    const systemPrompt = `You are a personal development planning engine. Your output is JSON only — no markdown, no explanation, no commentary. Generate a structured 7-day self-development plan. This is a "mental gym" program, NOT clinical therapy. Never guarantee medical outcomes.`;

    const userPrompt = `Generate a personalized 7-day plan as JSON matching this schema:
{
  "program": { "title": string, "summary": string, "time_budget_minutes": number, "disclaimer": string },
  "insights": [{ "icon": string (emoji), "title": string, "description": string }] (3-5 items),
  "days": [{
    "day_number": 1-7,
    "is_locked": boolean (day 1 = false, days 2-7 = true),
    "title": string,
    "objective": string,
    "workout": { "steps": [{ "step_number": number, "title": string, "description": string, "duration_minutes": number }] (3-8 steps) },
    "guided_session": {
      "total_duration_seconds": number (90-240),
      "script": [{ "type": "text"|"breathing"|"reflection"|"action", "content": string, "duration_seconds": number }]
    }
  }]
}

User context:
- Time budget: ${timeBudget} minutes/day
- Key challenges: ${challengeFocus}
- Coaching tone: ${coachingTone}

Rules:
- Each day's steps should sum to roughly ${timeBudget} minutes
- Guided session scripts should total 90-240 seconds
- Day 1 is_locked = false, days 2-7 is_locked = true
- Make content specific, actionable, and progressive
- Return ONLY valid JSON`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    let text = "";
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.error("OpenAI API error:", response.status);
        return NextResponse.json(getMockPlan(timeBudget));
      }

      const llmResult = await response.json();
      text = llmResult.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("OpenAI API request failed or timed out:", err);
      return NextResponse.json(getMockPlan(timeBudget));
    } finally {
      clearTimeout(timeout);
    }

    if (!text.trim()) {
      console.error("OpenAI API returned empty content");
      return NextResponse.json(getMockPlan(timeBudget));
    }

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let plan: GymPersonalizedPlan;
    try {
      plan = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse LLM JSON output");
      return NextResponse.json(getMockPlan(timeBudget));
    }

    if (!validatePlanShape(plan)) {
      console.error("LLM output failed shape validation");
      return NextResponse.json(getMockPlan(timeBudget));
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(getMockPlan(15));
  }
}
