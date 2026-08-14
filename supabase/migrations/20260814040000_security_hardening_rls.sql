-- Security hardening pass (secure-me audit, 2026-08-14):
--
-- 1. predictions_insert_own allowed a member to submit a prediction after
--    kickoff via a direct REST call to Supabase — the "no picks after
--    kickoff" rule was only enforced in the Next.js server action, not in
--    the database, so it could be bypassed entirely by calling the API
--    directly with a valid member JWT.
-- 2. giveaway_entries_insert_own never checked the member's approval status
--    or the giveaway's own open/eligibility state, only row ownership.
--    watch_parties got this exact fix in 20260814025138 but it was never
--    backported here.
-- 3. leaderboard_member_names() checked the *target* rows' approval status
--    but never the *caller's*, letting any authenticated account (including
--    pending/rejected/suspended members) enumerate approved members' names.
-- 4. giveaway_winners_select_for_members exposed disqualified entries
--    (including disqualified_reason) and pre-announcement winners to the
--    whole membership.

-- 1. predictions: require the match to still be open (kickoff in the
-- future) at insert time, and the submitting member to be approved.
drop policy predictions_insert_own on predictions;

create policy predictions_insert_own on predictions
  for insert with check (
    member_id in (
      select id from members
      where auth_user_id = auth.uid() and registration_status = 'approved'
    )
    and exists (select 1 from matches m where m.id = match_id and m.kickoff_at > now())
  );

-- 2. giveaway_entries: require an approved member, an open giveaway, and
-- tier eligibility — matching the giveaway's own state, not just ownership.
drop policy giveaway_entries_insert_own on giveaway_entries;

create policy giveaway_entries_insert_own on giveaway_entries
  for insert with check (
    member_id in (
      select m.id from members m, giveaways g
      where m.auth_user_id = auth.uid()
        and m.registration_status = 'approved'
        and g.id = giveaway_id
        and g.status = 'open'
        and m.activity_tier = any(g.eligibility_tiers)
    )
  );

-- 3. leaderboard_member_names: also require the *caller* to be an approved
-- member, not just the rows being returned.
create or replace function leaderboard_member_names(member_ids uuid[])
returns table (id uuid, full_name text)
language sql
security definer
set search_path = public
as $$
  select m.id, m.full_name
  from members m
  where m.id = any(member_ids)
    and m.registration_status = 'approved'
    and exists (
      select 1 from members caller
      where caller.auth_user_id = auth.uid() and caller.registration_status = 'approved'
    );
$$;

-- 4. giveaway_winners: hide disqualified entries entirely from members (not
-- just their reason) and don't reveal winners before they're announced.
drop policy giveaway_winners_select_for_members on giveaway_winners;

create policy giveaway_winners_select_for_members on giveaway_winners
  for select using (
    disqualified_at is null
    and exists (select 1 from giveaways g where g.id = giveaway_id and g.status in ('winner_selected', 'completed'))
    and exists (select 1 from members m where m.auth_user_id = auth.uid() and m.registration_status = 'approved')
  );
