-- The leaderboard needs to show OTHER members' display names, but members
-- RLS only allows reading your own row (members_select_own) — by design,
-- since the table also holds WhatsApp number, email, birthday, and state.
-- Rather than widen members SELECT access (which would leak that PII across
-- the community), expose only `full_name` for approved members via a
-- SECURITY DEFINER function — the function bypasses RLS internally, but the
-- surface it exposes to callers is intentionally narrow.
create or replace function leaderboard_member_names(member_ids uuid[])
returns table (id uuid, full_name text)
language sql
security definer
set search_path = public
as $$
  select m.id, m.full_name
  from members m
  where m.id = any(member_ids)
    and m.registration_status = 'approved';
$$;

grant execute on function leaderboard_member_names(uuid[]) to authenticated;
