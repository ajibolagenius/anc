-- M6 hardening: a generic audit trail for admin actions that don't already
-- have their own dedicated log (giveaways have giveaway_audit_log, which
-- stays as-is — this table covers everything else: member approvals,
-- newsletter sends, match/prediction scoring, watch party moderation, and
-- the manual cron test-send buttons).
create table admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid references admin_users(id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

alter table admin_audit_log enable row level security;
-- No policies: service-role only, same posture as every other admin-only table.

grant all on admin_audit_log to service_role;
