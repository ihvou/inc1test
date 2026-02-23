import { NextResponse } from "next/server";
import type { GymPersonalizedPlan, PlanDay } from "@/lib/types";

const LLM_TIMEOUT_MS = 20000;

function validateDaysShape(data: unknown): data is { days: PlanDay[] } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.days) || obj.days.length !== 7) return false;
  return true;
}

function buildMockNextWeekDays(weekNumber: number, timeBudgetMinutes: number): PlanDay[] {
  const startDay = (weekNumber - 1) * 7 + 1;
  const themes = [
    "Momentum Reset",
    "Focus Training",
    "Distraction Defense",
    "Energy Management",
    "Confidence Stack",
    "Consistency Sprint",
    "Review and Scale",
  ];

  return Array.from({ length: 7 }, (_, i) => {
    const dayNum = startDay + i;
    const deepPracticeMinutes = Math.max(8, timeBudgetMinutes - 5);

    return {
      day_number: dayNum,
      is_locked: false,
      title: `Day ${dayNum} — ${themes[i]}`,
      objective: `Build on Week ${weekNumber - 1} by reinforcing ${themes[i].toLowerCase()} with practical routines.`,
      workout: {
        steps: [
          {
            step_number: 1,
            title: "Review Yesterday",
            description: "Capture one win and one blocker from your previous day.",
            duration_minutes: 3,
          },
          {
            step_number: 2,
            title: "Deep Practice",
            description: "Run a focused block with one concrete outcome and no multitasking.",
            duration_minutes: deepPracticeMinutes,
          },
          {
            step_number: 3,
            title: "Reflect and Adjust",
            description: "Write one adjustment that improves tomorrow's execution.",
            duration_minutes: 2,
          },
        ],
      },
      guided_session: {
        total_duration_seconds: 120,
        script: [
          {
            type: "text",
            content: `Welcome to Day ${dayNum}. Today is about ${themes[i].toLowerCase()}.`,
            duration_seconds: 15,
          },
          {
            type: "breathing",
            content: "Inhale for 4, hold for 4, exhale for 6. Repeat three cycles.",
            duration_seconds: 25,
          },
          {
            type: "reflection",
            content: "What single behavior matters most today?",
            duration_seconds: 20,
          },
          {
            type: "action",
            content: "Take the smallest meaningful action now and complete it.",
            duration_seconds: 35,
          },
          {
            type: "text",
            content: "Great work. Keep the rhythm and return tomorrow.",
            duration_seconds: 25,
          },
        ],
      },
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inputJson, currentPlan, weekNumber } = body as {
      inputJson: { answers: Record<string, unknown> };
      currentPlan: GymPersonalizedPlan;
      weekNumber: number;
    };

    if (!inputJson || !currentPlan || typeof weekNumber !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mockDays = buildMockNextWeekDays(weekNumber, currentPlan.program.time_budget_minutes);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ days: mockDays });
    }

    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = weekNumber * 7;

    // Get summaries of previous weeks for context
    const previousDaySummaries = currentPlan.days
      .map((d) => `Day ${d.day_number}: ${d.title} — ${d.objective}`)
      .join("\n");

    const systemPrompt = `You are a personal development planning engine. Your output is JSON only — no markdown, no explanation, no commentary. Generate the next 7 days of a self-development plan, continuing from previous weeks. This is a "mental gym" program, NOT clinical therapy. Never guarantee medical outcomes.`;

    const userPrompt = `Generate days ${startDay}-${endDay} (Week ${weekNumber}) as a continuation of an existing personal development program.

Previous days covered:
${previousDaySummaries}

User context from initial assessment:
- Time budget: ${currentPlan.program.time_budget_minutes} minutes/day
- Challenges: ${JSON.stringify(inputJson.answers.gym_25_challenges)}
- When they fail: ${inputJson.answers.gym_26_when_fail}

Return JSON matching this schema:
{
  "days": [{
    "day_number": ${startDay}-${endDay},
    "is_locked": false,
    "title": string,
    "objective": string,
    "workout": { "steps": [{ "step_number": number, "title": string, "description": string, "duration_minutes": number }] (3-8 steps) },
    "guided_session": {
      "total_duration_seconds": number (90-240),
      "script": [{ "type": "text"|"breathing"|"reflection"|"action", "content": string, "duration_seconds": number }]
    }
  }] (exactly 7 days)
}

Rules:
- Day numbers must be ${startDay} through ${endDay}
- All days have is_locked = false
- Build progressively on previous weeks — increase complexity and depth
- Each day's steps should sum to roughly ${currentPlan.program.time_budget_minutes} minutes
- Guided session scripts should total 90-240 seconds
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
        return NextResponse.json({ days: mockDays });
      }

      const llmResult = await response.json();
      text = llmResult.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("OpenAI API request failed or timed out:", err);
      return NextResponse.json({ days: mockDays });
    } finally {
      clearTimeout(timeout);
    }

    if (!text.trim()) {
      console.error("OpenAI API returned empty content for next week");
      return NextResponse.json({ days: mockDays });
    }

    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    let result: { days: PlanDay[] };
    try {
      result = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse next-week JSON output");
      return NextResponse.json({ days: mockDays });
    }

    if (!validateDaysShape(result)) {
      console.error("Next-week output failed shape validation");
      return NextResponse.json({ days: mockDays });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Next week generation error:", error);
    return NextResponse.json({ days: buildMockNextWeekDays(2, 15) });
  }
}
