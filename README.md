# Bottleneck — AI Diagnostic

7 questions → one diagnosis, one prediction, one action → log what you actually did.
https://bottleneck-diagnostic.vercel.app/start

## Stack
React (Vite) + Supabase (Postgres + Auth + RLS) + Gemini (via a Vercel serverless function).

## 1. Supabase
1. Create a project at supabase.com (free tier).
2. SQL Editor → run `supabase/schema.sql`.
3. Authentication → Providers → enable **Anonymous sign-ins**
   (the app calls `signInAnonymously()` so every row gets a real `auth.uid()`
   without a signup screen — that's what makes the RLS policies meaningful).
4. Settings → API → copy the Project URL and anon public key.

## 2. Gemini
Get a free key at https://aistudio.google.com/app/apikey.

## 3. Local setup
```bash
npm install
cp .env.example .env   # fill in the three values
npm run dev
```
The `GEMINI_API_KEY` in `.env` is only read by `api/diagnose.js`, which only
runs when deployed on Vercel (or via `vercel dev` locally) — it never reaches
the browser.

## 4. Deploy
```bash
vercel
```
Add the three env vars in the Vercel dashboard (Project → Settings →
Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`GEMINI_API_KEY`.

## Flow
- `/start` — 7-question intake → saves a `sessions` row → calls `/api/diagnose`
  → saves a `diagnoses` row linked by `session_id`.
- `/diagnosis/:id` — shows the verdict (diagnosis / prediction / action).
- `/follow-up/:id` — records what the user actually did, linked by `diagnosis_id`.
- `/dashboard` — diagnosis → outcome rollup, the demo screen.

## Proving Move 4 (RLS / data isolation)
Open the app in two separate browser profiles (or one normal + one
incognito), run a diagnosis in each, then open `/dashboard` in both —
each only ever shows its own rows. That's the anonymous-auth + RLS pairing
doing its job.
