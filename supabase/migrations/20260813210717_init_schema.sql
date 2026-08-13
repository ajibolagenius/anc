-- Arsenal Nigeria Community (ANC) platform — initial schema
-- See ~/Desktop/ANC/PRD.md for the full product spec this implements.

create extension if not exists pgcrypto;

-- ============================================================================
-- Helpers
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- members — core registry (PRD §7, §4.1)
-- ============================================================================

create table members (
  id                          uuid primary key default gen_random_uuid(),
  auth_user_id                uuid unique references auth.users(id) on delete set null,
  anc_number                  text unique,
  full_name                   text not null,
  whatsapp_number             text not null unique,
  email                       text not null unique,
  birthday_day                smallint not null check (birthday_day between 1 and 31),
  birthday_month              smallint not null check (birthday_month between 1 and 12),
  state_of_origin             text,
  state_of_residence          text not null,
  favorite_player_current     text,
  favorite_player_alltime     text,
  jersey_size                 text check (jersey_size in ('S', 'M', 'L', 'XL', 'XXL')),
  self_reported_tier          text check (self_reported_tier in ('active', 'semi_active', 'inactive')),
  activity_tier               text not null default 'pending'
                              check (activity_tier in ('pending', 'active', 'semi_active', 'inactive')),
  is_group_admin              boolean not null default false,
  registration_status         text not null default 'pending'
                              check (registration_status in ('pending', 'approved', 'rejected', 'suspended')),
  reviewed_by                 uuid, -- FK to admin_users added after that table exists
  reviewed_at                 timestamptz,
  last_birthday_greeted_year  smallint,
  consent_given_at            timestamptz not null default now(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create trigger trg_members_updated_at
  before update on members
  for each row execute function set_updated_at();

comment on column members.activity_tier is
  'Admin-authoritative engagement tier. Deliberately separate from is_group_admin '
  '(informal WhatsApp role) and from admin_users (platform dashboard access) — '
  'a member''s tier must never itself grant dashboard access.';

-- ============================================================================
-- admin_users — platform dashboard access (PRD §3, §7)
-- ============================================================================

create table admin_users (
  id             uuid primary key references auth.users(id) on delete cascade,
  member_id      uuid references members(id) on delete set null,
  display_name   text not null,
  role           text not null default 'admin' check (role in ('super_admin', 'admin')),
  created_at     timestamptz not null default now()
);

alter table members
  add constraint members_reviewed_by_fkey
  foreign key (reviewed_by) references admin_users(id) on delete set null;

-- ============================================================================
-- Defense-in-depth: block member self-service edits to admin-authoritative fields.
-- The web app's member-facing update path should never touch these columns anyway;
-- this trigger makes that a hard guarantee even if RLS/application logic has a bug.
-- ============================================================================

create or replace function prevent_protected_member_field_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    if new.activity_tier is distinct from old.activity_tier
      or new.registration_status is distinct from old.registration_status
      or new.anc_number is distinct from old.anc_number
      or new.is_group_admin is distinct from old.is_group_admin
      or new.auth_user_id is distinct from old.auth_user_id
      or new.reviewed_by is distinct from old.reviewed_by
      or new.reviewed_at is distinct from old.reviewed_at
    then
      raise exception 'Not permitted to modify admin-authoritative member fields';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_member_fields
  before update on members
  for each row execute function prevent_protected_member_field_changes();

-- ============================================================================
-- birthday_notifications — idempotency + audit for the daily birthday job (PRD §4.2)
-- ============================================================================

create table birthday_notifications (
  id                   uuid primary key default gen_random_uuid(),
  member_id            uuid not null references members(id) on delete cascade,
  greeted_year         smallint not null,
  channel              text not null check (channel in ('email', 'whatsapp')),
  status               text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id  text,
  error                text,
  sent_at              timestamptz not null default now(),
  unique (member_id, greeted_year, channel)
);

-- ============================================================================
-- Giveaways (PRD §4.3, §7)
-- ============================================================================

create table giveaways (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  type                text not null default 'jersey' check (type in ('jersey', 'poll', 'other')),
  entry_opens_at      timestamptz,
  entry_closes_at     timestamptz,
  status              text not null default 'draft'
                      check (status in ('draft', 'open', 'closed', 'winner_selected', 'completed')),
  eligibility_tiers   text[] not null default '{active,semi_active,inactive}',
  created_by          uuid references admin_users(id) on delete set null,
  created_at          timestamptz not null default now()
);

create table giveaway_entries (
  id            uuid primary key default gen_random_uuid(),
  giveaway_id   uuid not null references giveaways(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  entered_at    timestamptz not null default now(),
  unique (giveaway_id, member_id)
);

create table giveaway_winners (
  id                    uuid primary key default gen_random_uuid(),
  giveaway_id           uuid not null references giveaways(id) on delete cascade,
  member_id             uuid not null references members(id) on delete cascade,
  rank                  int not null default 1,
  selection_method      text not null default 'random_auto'
                        check (selection_method in ('random_auto', 'manual_override')),
  selected_by           uuid references admin_users(id) on delete set null,
  selected_at           timestamptz not null default now(),
  prize_note            text,
  notified_at           timestamptz,
  disqualified_at       timestamptz,
  disqualified_reason   text,
  replaces_winner_id    uuid references giveaway_winners(id) on delete set null
);

create table giveaway_audit_log (
  id               uuid primary key default gen_random_uuid(),
  giveaway_id      uuid not null references giveaways(id) on delete cascade,
  event_type       text not null check (event_type in
                    ('created', 'opened', 'closed', 'entry_added', 'winner_selected', 'notified', 'reopened')),
  actor_admin_id   uuid references admin_users(id) on delete set null,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);

-- ============================================================================
-- Newsletters (PRD §4.4, §7)
-- ============================================================================

create table newsletters (
  id                       uuid primary key default gen_random_uuid(),
  subject                  text not null,
  body_html                text not null,
  body_text                text,
  status                   text not null default 'draft'
                           check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  audience_filter          jsonb not null default '{"registration_status":"approved"}'::jsonb,
  also_post_to_whatsapp    boolean not null default false,
  whatsapp_summary_text    text,
  scheduled_for            timestamptz,
  created_by               uuid references admin_users(id) on delete set null,
  sent_at                  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger trg_newsletters_updated_at
  before update on newsletters
  for each row execute function set_updated_at();

create table newsletter_deliveries (
  id                    uuid primary key default gen_random_uuid(),
  newsletter_id         uuid not null references newsletters(id) on delete cascade,
  member_id             uuid not null references members(id) on delete cascade,
  email                 text not null,
  status                text not null default 'queued'
                        check (status in ('queued', 'sent', 'failed', 'bounced')),
  provider_message_id   text,
  error                 text,
  sent_at               timestamptz,
  created_at            timestamptz not null default now(),
  unique (newsletter_id, member_id)
);

-- ============================================================================
-- Matchday predictions (PRD §4.5, §7)
-- ============================================================================

create table matches (
  id                    uuid primary key default gen_random_uuid(),
  opponent              text not null,
  kickoff_at            timestamptz not null,
  competition           text,
  actual_home_score     int,
  actual_away_score     int,
  actual_first_scorer   text,
  status                text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  created_at            timestamptz not null default now()
);

create table predictions (
  id                        uuid primary key default gen_random_uuid(),
  match_id                  uuid not null references matches(id) on delete cascade,
  member_id                 uuid not null references members(id) on delete cascade,
  predicted_home_score      int not null,
  predicted_away_score      int not null,
  predicted_first_scorer    text,
  points_awarded            int,
  created_at                timestamptz not null default now(),
  unique (match_id, member_id)
);

-- ============================================================================
-- Watch parties (PRD §4.6, §7)
-- ============================================================================

create table watch_parties (
  id                        uuid primary key default gen_random_uuid(),
  match_id                  uuid references matches(id) on delete set null,
  state                     text not null,
  city                      text not null,
  venue_name                text not null,
  address                   text,
  map_link                  text,
  contact_name              text,
  contact_whatsapp          text,
  is_recurring              boolean not null default false,
  submitted_by              text not null check (submitted_by in ('admin', 'member')),
  submitted_by_member_id    uuid references members(id) on delete set null,
  status                    text not null default 'approved'
                            check (status in ('pending', 'approved', 'rejected')),
  approved_by               uuid references admin_users(id) on delete set null,
  created_at                timestamptz not null default now()
);

-- ============================================================================
-- WhatsApp bot outbound audit + daily news digest (PRD §4.8, §7)
-- ============================================================================

create table wa_bot_message_log (
  id            uuid primary key default gen_random_uuid(),
  purpose       text not null check (purpose in ('birthday', 'newsletter', 'giveaway_winner', 'news_digest', 'manual')),
  reference_id  uuid,
  message_text  text not null,
  status        text not null check (status in ('sent', 'failed')),
  error         text,
  created_at    timestamptz not null default now()
);

create table news_digest_log (
  id                    uuid primary key default gen_random_uuid(),
  digest_date           date not null unique,
  items                 jsonb not null,
  status                text not null check (status in ('sent', 'skipped', 'failed')),
  whatsapp_message_id   text,
  error                 text,
  created_at            timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
--
-- Default posture: RLS enabled everywhere, no grants to anon/authenticated.
-- The web app's admin/cron/newsletter/giveaway/news-digest code paths use the
-- Supabase service-role key server-side, which bypasses RLS by design — so
-- this section only adds the narrow member-self-service policies the member
-- portal actually needs (profile view, giveaway entry, predictions, watch
-- party submission). Everything else stays service-role-only.
-- ============================================================================

alter table members enable row level security;
alter table admin_users enable row level security;
alter table birthday_notifications enable row level security;
alter table giveaways enable row level security;
alter table giveaway_entries enable row level security;
alter table giveaway_winners enable row level security;
alter table giveaway_audit_log enable row level security;
alter table newsletters enable row level security;
alter table newsletter_deliveries enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table watch_parties enable row level security;
alter table wa_bot_message_log enable row level security;
alter table news_digest_log enable row level security;

-- members: a member may read and update their own row (protected fields are
-- still blocked by trg_protect_member_fields above, regardless of this policy).
create policy members_select_own on members
  for select using (auth.uid() = auth_user_id);

create policy members_update_own on members
  for update using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- admin_users: an admin may read their own row (dashboard access check).
create policy admin_users_select_own on admin_users
  for select using (auth.uid() = id);

-- giveaways/matches: approved members may browse open giveaways and fixtures.
create policy giveaways_select_open on giveaways
  for select using (
    status in ('open', 'winner_selected', 'completed')
    and exists (select 1 from members m where m.auth_user_id = auth.uid() and m.registration_status = 'approved')
  );

create policy matches_select_all on matches
  for select using (
    exists (select 1 from members m where m.auth_user_id = auth.uid() and m.registration_status = 'approved')
  );

-- giveaway_entries: a member may enter (insert) and view their own entries.
create policy giveaway_entries_insert_own on giveaway_entries
  for insert with check (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy giveaway_entries_select_own on giveaway_entries
  for select using (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

-- predictions: a member may submit and view their own predictions.
create policy predictions_insert_own on predictions
  for insert with check (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy predictions_select_own on predictions
  for select using (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

-- watch_parties: approved members may browse approved listings (plus their
-- own pending/rejected submissions), and submit new listings as 'member'
-- (always landing as 'pending' — enforced by the default + application logic,
-- since only the service-role path is allowed to flip status to 'approved').
create policy watch_parties_select on watch_parties
  for select using (
    status = 'approved'
    or submitted_by_member_id in (select id from members where auth_user_id = auth.uid())
  );

create policy watch_parties_insert_member on watch_parties
  for insert with check (
    submitted_by = 'member'
    and status = 'pending'
    and submitted_by_member_id in (select id from members where auth_user_id = auth.uid())
  );

-- ============================================================================
-- Base table grants.
--
-- RLS policies filter *rows*; Postgres still requires the base table-level
-- GRANT before a role may attempt the operation at all — without this,
-- every query gets a flat "permission denied for table" regardless of RLS.
--
-- service_role: full access (it's the role the web app's server-side code
-- uses via the service-role key; Supabase's own bypassrls attribute on this
-- role is what skips RLS, but the base grant is still required).
--
-- authenticated: granted the same broad base privileges, but real access is
-- still governed entirely by the RLS policies above — a table with RLS
-- enabled and no matching policy for a role is effectively inaccessible to
-- it regardless of this grant.
--
-- anon: intentionally granted nothing beyond schema usage — every feature in
-- this app requires an approved member account, so there is no anonymous
-- read/write surface by design.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
