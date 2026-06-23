# Bottleneck — AI Diagnostic

> Most people think they're stuck because they need more AI knowledge.
> Usually they're stuck for a completely different reason.
> Find your real bottleneck in 3 minutes.

A 9-question diagnostic that doesn't just ask what's wrong — it compares
what you *think* is blocking you against a behavior-based pattern, names
one of 6 bottleneck categories, predicts why your current plan won't work,
and gives you one 72-hour action. Then it tracks whether you actually did it.

**Live demo:** [bottleneck-diagnostic.vercel.app](https://bottleneck-diagnostic.vercel.app)

## Example diagnosis

> **Category:** Knowledge Collector
> **Diagnosis:** You have completed multiple AI courses but shipped zero
> projects. Your bottleneck is avoiding public feedback, not lack of knowledge.
> **Prediction:** Taking another course will not help.
> **Action:** Ship one project publicly within 72 hours.

## How it works

1. **Intake** — 3-step questionnaire: current situation, behavior questions
   (projects finished vs. abandoned, public feedback, shipping frequency),
   and self-assessment (what you *think* is blocking you).
2. **Diagnosis** — answers are sent to an AI model that picks one of 6
   fixed bottleneck categories (Knowledge Collector, Perfectionist,
   Feedback Avoider, Tool Hopper, Idea Addict, Builder Without Validation),
   and returns a diagnosis, a prediction, and a 72-hour action.
3. **Follow-up** — the user comes back and logs what they actually did and
   what happened. This is stored linked to the original diagnosis.
4. **Dashboard** — every diagnosis next to its outcome, so the loop between
   "what the tool said" and "what actually happened" is visible and provable.

## Tech stack

- **Frontend:** React (Vite) + React Router
- **Database / Auth:** Supabase (Postgres, anonymous auth, Row Level Security)
- **AI:** Groq running OpenAI's open-weight `gpt-oss-20b` (free tier)
- **Hosting:** Vercel (static frontend + serverless function for the AI call)
- **Cost:** ₹0

## Why the architecture is the way it is

- **The AI call happens server-side** (`api/diagnose.js`, a Vercel
  serverless function), not in the browser. This keeps the API key off the
  client — calling an AI API directly from frontend JS exposes the key to
  anyone who opens dev tools.
- **Anonymous Supabase auth**, not a signup form. Every visitor still gets
  a real `auth.uid()`, so Row Level Security policies (`auth.uid() = user_id`)
  are meaningful and enforced by Postgres itself — not just app-level
  filtering that a bug could bypass.
- **Categories are a fixed list in code, not a database table** — they don't
  vary per user, so a table would add a join for no benefit.

## Database schema

```
sessions                    diagnoses                    outcomes
─────────────                ─────────────                ─────────────
id (PK)        <──────┐      id (PK)        <──────┐      id (PK)
user_id               │      session_id (FK)───────┘      diagnosis_id (FK)──┐
answers (jsonb)       └──────user_id                      user_id           │
created_at                   category                     action_taken      │
                              diagnosis                    result (jsonb)    │
                              prediction                   created_at        │
                              action_plan                                    │
                              created_at         <─────────────────────────┘
```

The `outcomes.diagnosis_id -> diagnoses.id` link is the evidence link: it's
what turns "the tool gave an opinion" and "a person did something" into one
provable, traceable claim. Full writeup and the hand-drawn version: see
[`docs/move4.md`](docs/move4.md).

## Hackathon evidence (Track C)

- [`docs/move1.md`](docs/move1.md) — hypothesis + 2 manual diagnoses given
  to real people before any code was written
- [`docs/move2.md`](docs/move2.md) — written hypothesis, pre-code
- [`docs/move3.md`](docs/move3.jpeg) — hand-drawn system design
- [`docs/move4.md`](docs/move4.jpeg) — hand-drawn schema, RLS, two-user
  isolation test with screenshots
- [`docs/move5.md`](docs/move5.md) — 2 real users running the live app,
  with logged outcomes

## Local setup

### 1. Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. SQL Editor → run `supabase/schema.sql`, then `supabase/migration_add_category.sql`
3. Authentication → Providers → enable **Anonymous sign-ins**
4. Settings → API → copy the Project URL and anon public key

### 2. Groq (AI)
Get a free key at [console.groq.com](https://console.groq.com) → API Keys

### 3. Run locally
```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, GROQ_API_KEY
npm run dev
```
Note: the `/api/diagnose` AI call only works when deployed to Vercel, or
locally via `vercel dev` — plain `npm run dev` won't run serverless functions.

### 4. Deploy
```bash
npm install -g vercel
vercel
vercel --prod
```
Add the three env vars in Vercel dashboard → Settings → Environment Variables,
then redeploy.

## Project structure

```
src/
  pages/        Landing.jsx · Questionnaire.jsx · Diagnosis.jsx · FollowUp.jsx · Dashboard.jsx
  services/      supabase.js · diagnostics.js
api/
  diagnose.js    Vercel serverless function calling Groq
supabase/
  schema.sql, migration_add_category.sql
docs/
  move1.md ... move5.md
```
