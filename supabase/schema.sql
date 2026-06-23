-- Run this in the Supabase SQL editor.
-- Requires: Authentication > Providers > Anonymous sign-ins ENABLED
-- (the app uses supabase.auth.signInAnonymously() so every row can be
-- scoped to a real auth.uid() without building a signup screen).

create table if not exists sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) default auth.uid(),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists diagnoses (
  id bigint generated always as identity primary key,
  session_id bigint not null references sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) default auth.uid(),
  diagnosis text not null,
  prediction text not null,
  action_plan text not null,
  created_at timestamptz not null default now()
);

create table if not exists outcomes (
  id bigint generated always as identity primary key,
  diagnosis_id bigint not null references diagnoses(id) on delete cascade,
  user_id uuid not null references auth.users(id) default auth.uid(),
  action_taken text not null check (action_taken in ('yes', 'no', 'partially')),
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
-- Proves users cannot see each other's rows: every policy checks
-- auth.uid() = user_id, scoped per table.

alter table sessions enable row level security;
alter table diagnoses enable row level security;
alter table outcomes enable row level security;

create policy "sessions_select_own" on sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on sessions
  for insert with check (auth.uid() = user_id);

create policy "diagnoses_select_own" on diagnoses
  for select using (auth.uid() = user_id);
create policy "diagnoses_insert_own" on diagnoses
  for insert with check (auth.uid() = user_id);

create policy "outcomes_select_own" on outcomes
  for select using (auth.uid() = user_id);
create policy "outcomes_insert_own" on outcomes
  for insert with check (auth.uid() = user_id);

-- ---------- Demo check for Move 4 ----------
-- Sign in as two different anonymous users (two browser profiles / incognito
-- windows) and run:
--   select * from sessions;
-- Each session will only ever return that browser's own rows.
