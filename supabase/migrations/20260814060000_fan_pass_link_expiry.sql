-- Fan Pass card image URL expiry.
--
-- The image route (apps/web/src/app/api/fan-pass/[token]/route.tsx) is
-- unauthenticated by necessity — it's the shareable card members save and
-- post to WhatsApp Status / X (PRD §4.1). It previously keyed off the raw
-- member UUID directly, which meant the link (if ever copied rather than
-- the image itself being saved — e.g. "copy image address" instead of
-- "save image") stayed live forever, exposing a member's name, state, and
-- ANC number indefinitely with no way to revoke it.
--
-- This replaces the raw member id in the URL with a random, expiring,
-- revocable token. One row per member (not a growing log) — visiting the
-- portal Fan Pass page always resolves to the current token, minted lazily
-- and reused until it expires, then replaced. Reusing an existing valid
-- token (rather than rotating on every view) matters: rotating on every
-- view would invalidate a link the member already shared to WhatsApp
-- Status/X the moment they revisit their own portal.

create table fan_pass_links (
  member_id   uuid primary key references members(id) on delete cascade,
  token       text not null unique,
  expires_at  timestamptz not null
);

alter table fan_pass_links enable row level security;
-- No policies: service-role only, same posture as rate_limits/admin_audit_log.

grant all on fan_pass_links to service_role;

create or replace function get_or_create_fan_pass_token(p_member_id uuid, p_ttl_seconds int default 2592000)
returns table (token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_expires_at timestamptz;
begin
  select f.token, f.expires_at into v_token, v_expires_at
  from fan_pass_links f
  where f.member_id = p_member_id and f.expires_at > now();

  if v_token is null then
    v_token := encode(gen_random_bytes(24), 'hex');
    v_expires_at := now() + (p_ttl_seconds || ' seconds')::interval;

    insert into fan_pass_links (member_id, token, expires_at)
    values (p_member_id, v_token, v_expires_at)
    on conflict (member_id) do update
      set token = excluded.token, expires_at = excluded.expires_at
    returning fan_pass_links.token, fan_pass_links.expires_at into v_token, v_expires_at;
  end if;

  return query select v_token, v_expires_at;
end;
$$;

grant execute on function get_or_create_fan_pass_token(uuid, int) to service_role;
