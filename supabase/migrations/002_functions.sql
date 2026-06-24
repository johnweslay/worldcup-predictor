-- ============================================================
--  RPC functions called server-side (run with service role)
-- ============================================================

-- Award +1 point and increment total_correct
create or replace function public.award_point(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users
  set points        = points + 1,
      total_correct = total_correct + 1
  where id = p_user_id;
end; $$;

-- Increment total_predicted (idempotent — only if not yet counted)
create or replace function public.increment_predicted(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users
  set total_predicted = total_predicted + 1
  where id = p_user_id;
end; $$;

-- Atomically deduct 3 points and mark wl_claimed
create or replace function public.claim_whitelist(p_user_id uuid, p_wallet text)
returns void language plpgsql security definer as $$
begin
  update public.users
  set points          = points - 3,
      wl_claimed      = true,
      wl_claimed_at   = now(),
      wallet_address  = p_wallet
  where id = p_user_id
    and points >= 3
    and wl_claimed = false;

  if not found then
    raise exception 'Cannot claim: insufficient points or already claimed';
  end if;
end; $$;

-- Leaderboard view (top 100 by points)
create or replace view public.leaderboard as
  select
    twitter_handle,
    twitter_image,
    points,
    total_correct,
    total_predicted,
    wl_claimed,
    row_number() over (order by points desc, total_correct desc) as rank
  from public.users
  order by points desc, total_correct desc
  limit 100;
