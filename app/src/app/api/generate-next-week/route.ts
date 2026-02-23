import { NextResponse } from "next/server";
import type { GymPersonalizedPlan, PlanDay } from "@/lib/types";

function validateDaysShape(data: unknown): data is { days: PlanDay[] } {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.days) || obj.days.length !== 7) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inputJson, currentPlan, weekNumber } = body as {
      inputJson: { answers: Record<string, unknown> };
      currentPlan: GymPersonalizedPlan;
      weekNumber: number;
    };

    if (!inputJson || !currentPlan || !weekNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: generate deterministic next-week days
      const fallbackDays: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
        const dayNum = (weekNumber - 1) * 7 + i + 1;
        return {
          day_number: dayNum,
          is_locked: false,
          title: `Day ${dayNum} — Advanced Practice`,
          objective: `Build on Week ${weekNumber - 1} foundations with deeper focus techniques`,
          workout: {
            steps: [
              { step_number: 1, title: "Review & Reset", description: "Review your progress from the previous week and set new intentions.", duration_minutes: 3 },
              { step_number: 2, title: "Deep Practice", description: "Apply your refined system with increased challenge and duration.", duration_minutes: Math.max(10, currentPlan.program.time_budget_minutes - 5) },
              { step_number: 3, title: "Reflect & Plan", description: "Note what worked and adjust your approach for tomorrow.", duration_minutes: 2 },
            ],
          },
          guided_session: {
            total_duration_seconds: 120,
            script: [
              { type: "text" as const, content: `Welcome to Day ${dayNum}. You're in Week ${weekNumber} now — this is where real transformation happens.`, duration_seconds: 15 },
              { type: "breathing" as const, content: "Center yourself. Deep breath in for 4... hold for 4... release for 6.", duration_seconds: 25 },
              { type: "text" as const, content: "Think about what you learned last week. What's one thing you want to do differently?", duration_seconds: 20 },
              { type: "action" as const, content: "Take that one improvement and apply it right now. Start with the smallest possible step.", duration_seconds: 30 },
              { type: "reflection" as const, content: "How does it feel to be building on a real system? You're not starting over — you're leveling up.", duration_seconds: 20 },
              { type: "text" as const, content: "Keep the momentum going. See you next session.", duration_seconds: 10 },
            ],
          },
        };
      });
      return NextResponse.json({ days: fallbackDays });
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
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      return NextResponse.json({ error: "LLM generation failed" }, { status: 500 });
    }

    const llmResult = await response.json();
    const text = llmResult.choices?.[0]?.message?.content || "";

    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    let result: { days: PlanDay[] };
    try {
      result = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse next-week JSON output");
      return NextResponse.json({ error: "Failed to parse LLM output" }, { status: 500 });
    }

    if (!validateDaysShape(result)) {
      console.error("Next-week output failed shape validation");
      return NextResponse.json({ error: "Invalid LLM output shape" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Next week generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
