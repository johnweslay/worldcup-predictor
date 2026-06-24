-- ============================================================
--  World Cup Predictor — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── users ──────────────────────────────────────────────────
create table public.users (
  id               uuid primary key default uuid_generate_v4(),
  twitter_id       text unique not null,
  twitter_handle   text not null,
  twitter_name     text,
  twitter_image    text,
  wallet_address   text,                  -- optional, filled on WL claim
  points           int not null default 0,
  total_predicted  int not null default 0,
  total_correct    int not null default 0,
  wl_claimed       boolean not null default false,
  wl_claimed_at    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── matches ────────────────────────────────────────────────
create table public.matches (
  id               uuid primary key default uuid_generate_v4(),
  external_id      text unique not null,  -- football-data.org match ID
  stage            text not null,         -- 'Group Stage', 'Round of 16', etc.
  group_name       text,                  -- 'Group A', null for knockouts
  kickoff_at       timestamptz not null,
  home_team        text not null,
  away_team        text not null,
  home_flag        text,                  -- emoji flag
  away_flag        text,
  status           text not null default 'SCHEDULED',
  -- SCHEDULED | IN_PLAY | PAUSED | FINISHED | POSTPONED | CANCELLED
  result           text,                  -- 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | null
  home_score       int,
  away_score       int,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── predictions ────────────────────────────────────────────
create table public.predictions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  match_id         uuid not null references public.matches(id) on delete cascade,
  pick             text not null check (pick in ('HOME_WIN','DRAW','AWAY_WIN')),
  is_correct       boolean,               -- null until match resolved
  point_awarded    boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (user_id, match_id)             -- one prediction per match per user
);

-- ── whitelist ──────────────────────────────────────────────
create table public.whitelist (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid unique not null references public.users(id) on delete cascade,
  wallet_address   text not null,
  tx_hash          text,                  -- on-chain tx hash (filled after contract call)
  on_chain         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ── indexes ────────────────────────────────────────────────
create index idx_predictions_user    on public.predictions(user_id);
create index idx_predictions_match   on public.predictions(match_id);
create index idx_matches_kickoff     on public.matches(kickoff_at);
create index idx_matches_status      on public.matches(status);

-- ── updated_at triggers ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_users_updated   before update on public.users
  for each row execute function public.set_updated_at();
create trigger trg_matches_updated before update on public.matches
  for each row execute function public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────
alter table public.users       enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;
alter table public.whitelist   enable row level security;

-- Users: read own row; service role writes
create policy "users_select_own" on public.users
  for select using (true);               -- public leaderboard read
create policy "users_update_own" on public.users
  for update using (auth.uid()::text = twitter_id);

-- Matches: public read
create policy "matches_select_all" on public.matches
  for select using (true);

-- Predictions: users read/insert own; service role resolves
create policy "predictions_select_own" on public.predictions
  for select using (user_id = (
    select id from public.users where twitter_id = auth.uid()::text limit 1
  ));
create policy "predictions_insert_own" on public.predictions
  for insert with check (user_id = (
    select id from public.users where twitter_id = auth.uid()::text limit 1
  ));

-- Whitelist: users read own
create policy "whitelist_select_own" on public.whitelist
  for select using (user_id = (
    select id from public.users where twitter_id = auth.uid()::text limit 1
  ));
