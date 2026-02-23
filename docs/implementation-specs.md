# MVP Spec — Personalized Plan + Today’s Session (Gym-style Web Prototype)

Owner: You
Implementers: Claude + Codex
Platform: Web (mobile-first), runs locally, **no database** (state in `localStorage`)
Goal: Demonstrate **core logic + UX** of a “personalized program” funnel: value preview → email save → locked plan → paywall imitation → full unlocked plan.

---

## 1) What we are building

A mobile-first web app that:

1. Accepts Gym-funnel answers (as JSON) via a dev harness form.
2. Calls a Large Language Model (LLM) to generate a structured **7-day plan**.
3. Shows **Day 1** immediately (value first).
4. Optionally asks email to “save your plan”.
5. Shows Days 2–7 locked; tapping locked days opens a paywall imitation.
6. After “Continue” on paywall (no real payment), unlocks full plan and enables “session player” + completion + check-in, stored locally.

This aligns with the key funnel insight: users convert better when the paid offer is **concrete** (“your program is ready”) and when they can see value before committing.

---

## 2) Non-functional requirements

* **Mobile-first** UI (max content width ~420px).
* Runs locally: `npm install && npm run dev`.
* No DB: use `localStorage` only.
* No external auth.
* LLM key stored in `.env.local` (never hardcode).
* If LLM is unavailable, use a bundled fallback plan JSON.

---

## 3) UX flow (final)

### Route map

* `/` — Dev harness (paste JSON answers + “Generate Plan”)
* `/preview` — Day 1 value preview (unlocked)
* `/email` — Email capture (optional “save plan” step)
* `/plan` — Plan week view (Days 1–7; Days 2–7 locked if not premium)
* `/paywall` — Paywall imitation (Gym-style)
* `/plan/full` — Full interactive plan (premium unlocked)
* `/session/:day` — Guided session player for Day N

### User journey

1. `/` submit JSON → app generates plan via LLM → store in local state → `/preview`
2. `/preview` shows:

   * program title, 3 insights
   * Day 1 objective + steps
   * “Start Today’s Session”
   * CTA: “Save & Continue” → `/email` (optional) or “Continue without email”
3. `/email`:

   * email input + privacy line + CTA → store email → `/plan`
4. `/plan`:

   * Days list 1..7
   * Day 1 open, Days 2–7 locked (blur overlay)
   * tapping locked day opens `/paywall`
5. `/paywall`:

   * pricing cards, continue button
   * on continue: set `isPremium=true` → `/plan/full`
6. `/plan/full`:

   * all days unlocked
   * “Start session” for any day
   * “Mark day done” + check-in
7. `/session/:day`:

   * plays scripted blocks (manual next or timed)
   * post-check-in + save → back to plan

---

## 4) Data model and storage (no DB)

### Local storage keys

* `mvp_plan_json` — entire plan JSON returned by LLM (stringified)
* `mvp_plan_meta` — `{ planId, createdAtIso }`
* `mvp_email` — string or `""`
* `mvp_is_premium` — `"true"` / `"false"`
* `mvp_progress` — progress state:

  * `completedDays`: map of day number to boolean
  * `checkins`: map of day number to `{ pre, post, note }`
  * `lastOpenedDay`: number

Example `mvp_progress`:

```json
{
  "completedDays": { "1": true, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false },
  "checkins": { "1": { "pre": 3, "post": 2, "note": "Felt calmer after session" } },
  "lastOpenedDay": 1
}
```

### In-memory state (React)

* `plan: GymPersonalizedPlan | null`
* `isPremium: boolean`
* `progress: ProgressState`
* `email: string`

### Deterministic + LLM hybrid (recommended)

* Deterministic logic controls:

  * locked/unlocked visibility
  * gating rules (premium required for days 2–7)
  * fallback plan if LLM fails
* LLM generates:

  * plan copy, daily objectives, steps, session script blocks, insights

---

## 5) Input JSON for the generator

Minimum required fields:

```json
{
  "version": "gym-funnel-v1",
  "answers": {
    "gym_24_time_invest_daily": "10–15 minutes",
    "gym_25_challenges": ["No clear plan or structure", "Too many distractions"],
    "gym_26_when_fail": "Reflect, adjust, and go again"
  }
}
```

The app should accept any JSON; validate required fields and show a clear error if missing.

---

## 6) Plan output JSON schema

Name: `GymPersonalizedPlan`

Minimum requirements:

* `program` with title/summary/time budget/disclaimer
* `insights[3..5]`
* `days[7]`, each day with:

  * `day_number` 1..7
  * `is_locked` default true for 2..7 (app can override lock based on premium)
  * `objective` string
  * `workout.steps[3..8]`
  * `guided_session` with script blocks totaling ~90–240 seconds
  * `fallback`

Store schema at `schemas/plan-output.json` and (optionally) validate server-side.

---

## 7) LLM integration (dataflow + logic)

### High-level dataflow

1. User submits input JSON in `/`.
2. `POST /api/generate-plan` with the input JSON.
3. Server route composes prompt (system + user) and calls LLM.
4. Server validates:

   * JSON parse
   * basic structural checks (days length = 7, required keys exist)
   * optional JSON schema validation
5. Server returns plan JSON to client.
6. Client stores to `localStorage` and navigates.

### Why server route

* Prevent exposing API keys.
* Central place to validate and normalize output.
* Allows fallback generation.

### Server pseudo-logic

1. Parse request body.
2. Validate required fields exist.
3. Build a deterministic “plan context”:

   * `timeBudgetMinutes` from `gym_24_time_invest_daily`
   * `challengeFocus` from selected challenges
   * `failureStyle` from `gym_26_when_fail`
4. Call LLM.
5. If fail or invalid output:

   * use `fallbackPlan.json` (bundled)
6. Return valid plan JSON.

### Interpreting Gym answers deterministically

* `gym_24_time_invest_daily`

  * "5–10 minutes" → 10
  * "10–15 minutes" → 15
  * "15–20 minutes" → 20
  * "20–30 minutes" → 30
* `gym_25_challenges` mapping to plan emphasis:

  * "No clear plan or structure" → more structure, explicit checklists
  * "Too many distractions" → environment design + micro-commitments
  * "Low energy or motivation" → short sessions + “tiny wins”
  * "Fear of failure" / "Doubt or insecurity" → gentler coaching prompts
* `gym_26_when_fail` maps to coaching tone:

  * "Quit and move on..." → relapse plan + re-entry prompts
  * "Get frustrated..." → self-compassion + micro-restart steps
  * "Try again..." → reflect & adjust prompts

---

## 8) LLM prompt (reliable structured JSON)

### System prompt

* Role: planning engine
* Output: JSON only
* Rules:

  * match time budget
  * plan is “self-development/mental gym” not clinical therapy
  * no guaranteed results

### User prompt template

Provide schema instructions and input JSON:

* must return 7 days
* guided session script blocks sum to ~2–3 minutes
* day 1 unlocked, days 2–7 locked by default

### Reliability measures

* Use low temperature (0.2–0.4)
* If JSON parse fails:

  * re-ask: “Return valid JSON only. Fix syntax.”
* Optional: JSON schema validation on server to enforce shape.

---

## 9) UI kit (tokenized components first)

We mimic the Gym funnel style:

* black background, bold white headers
* gold/beige primary CTA
* dark rounded cards
* “best offer” gold highlight
* minimal shadows, subtle borders
* big pill buttons

### Design tokens (CSS variables)

Put tokens in `styles/tokens.css` (see previous token set).

---

## 10) Reusable UI components (build these first)

### Core components

1. `ScreenShell`

   * max width container
   * consistent padding
   * optional sticky bottom CTA slot

2. `TopBar`

   * back button
   * optional right slot

3. `PillButton`

   * primary (gold), secondary (dark)
   * disabled style

4. `Card`

   * surface background + radius + subtle border

5. `SelectableCard`

   * selected state flips background to gold-soft + dark text

6. `PricingCard`

   * left: plan name + price
   * right: per-day price
   * optional discount badge
   * “BEST OFFER” top strip variant

7. `DayCard`

   * day number + objective
   * locked overlay (blur + lock icon)
   * open indicator

8. `InsightCarousel`

   * 3 cards, horizontal scroll snap

9. `SessionPlayer`

   * script blocks UI
   * progress bar
   * next / previous
   * optional timer auto-advance

10. `CheckIn`

* slider 1..5
* optional note
* save action

---

## 11) Screen-by-screen UI specs (MVP pages)

### `/` Dev harness

* Title: “Plan Generator (Prototype)”
* Textarea with JSON (monospace)
* Buttons: “Load sample A/B/C”
* CTA: “Generate Plan” (gold pill)
* Error states: inline under textarea

### `/preview` Day 1 value preview

Purpose: show real value before email/paywall

* Header: “Your custom program is ready”
* Insight carousel (3 items)
* Day 1 card expanded:

  * objective
  * steps list (3–6)
  * CTA: “Start Today’s Session”
* Bottom CTA bar:

  * Primary: “Save & Continue” (→ `/email`)
  * Secondary link: “Continue without email” (→ `/plan`)

### `/email` Email capture (Gym-like)

* Envelope icon
* Header: “Enter your email to get detailed test results”
* Input
* Privacy mini-card with lock icon
* CTA: “Explore results” (enabled on valid email)
* “Skip for now” small link

### `/plan` Plan with locked days

* Program header + chips (time/day focus)
* Days list 1..7

  * Day 1 open
  * Day 2..7 locked with blur overlay
* Tap locked day:

  * navigate to `/paywall`

### `/paywall` Paywall imitation (close to Gym)

* Mini chart card at top (static SVG)
* Headline: “Your custom program is ready to start!”
* Three pricing cards:

  * 1 week (unselected)
  * 1 month BEST OFFER (gold border + top strip + save badge)
  * 3 months (unselected)
* CTA: “Continue” (gold)
* Trust row: “Cancel anytime” + “Money-back guarantee”
* Legal text block

Action:

* “Continue” sets `mvp_is_premium=true` then `/plan/full`

### `/plan/full` Full interactive plan

* Same header
* Progress widget: “X/7 completed”
* Days list all unlocked
* Each day expands:

  * steps list
  * “Start session”
  * “Mark day done” (enabled after session completion)
  * check-in view (pre/post)
* “Generate next week” button (optional; can be stub)

### `/session/:day` Session player

* Title + day
* Progress bar
* Script block text area
* Next button (primary), Back (secondary)
* After last block:

  * post-check-in slider + note
  * Save → update local progress → return to plan

---

## 12) Application logic (client)

### Locking logic

* If `isPremium=false`:

  * Day 1 unlocked
  * Days 2–7 locked
* If `isPremium=true`:

  * all unlocked

The plan JSON may mark days 2–7 locked; the client can override based on premium state.

### Completion logic

* Completing a session sets `progress.completedDays[day]=true`
* “Mark done” can be a separate action; or auto-mark at end of session

### Email logic

* Email is optional in prototype
* If provided, store and show in settings/debug footer

---

## 13) Implementation phases (recommended)

### Phase 0 — Scaffold

* Create Next.js (or Vite React) project
* Add Tailwind or simple CSS modules
* Add routing + pages skeleton
* Add tokens stylesheet

### Phase 1 — Tokenized UI components (UI kit)

Build reusable components:

* `ScreenShell`, `PillButton`, `Card`, `PricingCard`, `DayCard`, `InsightCarousel`, `SessionPlayer`
  Goal: match Gym look before logic.

### Phase 2 — Client flow without LLM (static plan)

* Add `fallbackPlan.json`
* Wire `/` → `/preview` using fallback plan
* Implement localStorage persistence
* Implement paywall toggle → unlock full plan

### Phase 3 — LLM integration

* Implement `/api/generate-plan`
* Add prompt + validation
* Add error fallback to static plan

### Phase 4 — Session + progress

* Implement `/session/:day` player
* Save progress and check-ins
* Show progress on plan page

### Phase 5 — Polish and “demo readiness”

* Add loading states (skeletons/spinners)
* Add toasts for errors
* Add “Reset demo” button to clear localStorage

---

## 14) Acceptance criteria

### Must-have

* App runs locally
* Can paste input JSON and generate plan (LLM or fallback)
* Day 1 is visible before email
* Email capture screen works and gates nothing critical
* Days 2–7 are locked pre-premium and open paywall on tap
* Paywall imitation unlocks full plan
* Session player runs and writes progress to localStorage

### Nice-to-have

* Week switcher (Week 1 visible, Week 2 locked)
* “Generate Week 2” button (LLM call) after unlock
* Smooth transitions and small animations

---

## 15) Notes for Claude/Codex

* Keep code simple and readable.
* Prefer deterministic mapping for time budget and plan emphasis; LLM fills text.
* Treat LLM output as untrusted: validate shape and clamp lengths.
* Avoid any claims of medical outcomes; keep it “self-development / mental gym”.

---

