-- PRD §4.6: only "active"-tier members are trusted to submit watch party
-- listings (they still land as 'pending' pending admin approval). The
-- original policy only checked that the submission was self-attributed, not
-- that the submitter is active-tier — tighten it to match the PRD.
drop policy watch_parties_insert_member on watch_parties;

create policy watch_parties_insert_member on watch_parties
  for insert with check (
    submitted_by = 'member'
    and status = 'pending'
    and submitted_by_member_id in (
      select id from members
      where auth_user_id = auth.uid()
        and activity_tier = 'active'
        and registration_status = 'approved'
    )
  );
