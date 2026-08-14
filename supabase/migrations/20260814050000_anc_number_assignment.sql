-- PRD §4.1 Digital ANC ID: on approval, each member is issued a membership
-- number following ANC-{STATE_CODE}-{SEQUENCE} (e.g. ANC-LAG-0142). This was
-- never implemented — approveMember only set registration_status/
-- activity_tier. This migration adds:
--
-- 1. anc_number_sequences: one row per state code, holding the next sequence
--    number to hand out. A single atomic UPSERT (insert .. on conflict ..
--    returning) is what makes numbering race-safe under concurrent
--    approvals for the same state — two admins approving Lagos members at
--    the same moment can never be handed the same sequence number.
-- 2. approve_member(): wraps the registration_status/activity_tier update
--    AND the ANC number assignment in one function call (one transaction),
--    so a failure partway through can never leave a member "approved" with
--    no ANC number and no way back to pending — the admin UI only shows the
--    Approve button for pending members, so there'd be no way to retry.
-- 3. A one-time backfill for members already approved before this existed.

create table anc_number_sequences (
  state_code  text primary key,
  next_seq    int not null default 1
);

alter table anc_number_sequences enable row level security;
-- No policies: service-role only, same posture as rate_limits/admin_audit_log.

grant all on anc_number_sequences to service_role;

create or replace function approve_member(
  p_member_id uuid,
  p_activity_tier text,
  p_reviewed_by uuid,
  p_state_code text
)
returns table (anc_number text, full_name text, email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_anc text;
  v_seq int;
  v_anc_number text;
begin
  -- Row lock: if two requests somehow raced on the same member, the second
  -- waits here rather than double-assigning a sequence number.
  select m.anc_number into v_existing_anc from members m where m.id = p_member_id for update;
  if not found then
    raise exception 'Member % not found', p_member_id;
  end if;

  update members
  set registration_status = 'approved',
      activity_tier = p_activity_tier,
      reviewed_by = p_reviewed_by,
      reviewed_at = now()
  where id = p_member_id;

  if v_existing_anc is not null then
    -- Already numbered (e.g. a replayed/duplicate approval) — never
    -- reassign, just report the existing number back to the caller.
    v_anc_number := v_existing_anc;
  else
    insert into anc_number_sequences (state_code, next_seq)
    values (p_state_code, 2)
    on conflict (state_code) do update set next_seq = anc_number_sequences.next_seq + 1
    returning next_seq - 1 into v_seq;

    v_anc_number := 'ANC-' || p_state_code || '-' || lpad(v_seq::text, 4, '0');

    update members set anc_number = v_anc_number where id = p_member_id;
  end if;

  return query select v_anc_number, m.full_name, m.email from members m where m.id = p_member_id;
end;
$$;

grant execute on function approve_member(uuid, text, uuid, text) to service_role;

-- One-time backfill for members approved before this feature existed.
-- Ordered by reviewed_at (fallback created_at) so earlier approvals get
-- earlier sequence numbers, matching what would have happened had this
-- existed from the start. This CASE mirrors packages/shared/src/enums.ts'
-- STATE_CODES exactly — it's a one-time-only consumer of that mapping, kept
-- here as a literal because a migration must not depend on application code.
do $$
declare
  r record;
  v_seq int;
  v_state_code text;
  v_anc_number text;
begin
  for r in
    select id, state_of_residence
    from members
    where registration_status = 'approved' and anc_number is null
    order by reviewed_at nulls last, created_at
  loop
    v_state_code := case r.state_of_residence
      when 'Abia' then 'ABI'
      when 'Adamawa' then 'ADA'
      when 'Akwa Ibom' then 'AKW'
      when 'Anambra' then 'ANA'
      when 'Bauchi' then 'BAU'
      when 'Bayelsa' then 'BAY'
      when 'Benue' then 'BEN'
      when 'Borno' then 'BOR'
      when 'Cross River' then 'CRO'
      when 'Delta' then 'DEL'
      when 'Ebonyi' then 'EBO'
      when 'Edo' then 'EDO'
      when 'Ekiti' then 'EKI'
      when 'Enugu' then 'ENU'
      when 'FCT (Abuja)' then 'ABJ'
      when 'Gombe' then 'GOM'
      when 'Imo' then 'IMO'
      when 'Jigawa' then 'JIG'
      when 'Kaduna' then 'KAD'
      when 'Kano' then 'KAN'
      when 'Katsina' then 'KAT'
      when 'Kebbi' then 'KEB'
      when 'Kogi' then 'KOG'
      when 'Kwara' then 'KWA'
      when 'Lagos' then 'LAG'
      when 'Nasarawa' then 'NAS'
      when 'Niger' then 'NIG'
      when 'Ogun' then 'OGU'
      when 'Ondo' then 'OND'
      when 'Osun' then 'OSU'
      when 'Oyo' then 'OYO'
      when 'Plateau' then 'PLA'
      when 'Rivers' then 'RIV'
      when 'Sokoto' then 'SOK'
      when 'Taraba' then 'TAR'
      when 'Yobe' then 'YOB'
      when 'Zamfara' then 'ZAM'
      else null
    end;

    if v_state_code is not null then
      insert into anc_number_sequences (state_code, next_seq)
      values (v_state_code, 2)
      on conflict (state_code) do update set next_seq = anc_number_sequences.next_seq + 1
      returning next_seq - 1 into v_seq;

      v_anc_number := 'ANC-' || v_state_code || '-' || lpad(v_seq::text, 4, '0');
      update members set anc_number = v_anc_number where id = r.id;
    end if;
  end loop;
end $$;
