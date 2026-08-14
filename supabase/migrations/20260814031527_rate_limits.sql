-- M6 hardening: fixed-window rate limiting for public, unauthenticated
-- endpoints (currently: registration). Bucketing + the atomic increment both
-- happen inside check_rate_limit() so concurrent requests from the same
-- key never race past the limit via a read-then-write gap.
create table rate_limits (
  key           text not null,
  window_start  timestamptz not null,
  count         int not null default 1,
  primary key (key, window_start)
);

alter table rate_limits enable row level security;
-- No policies: service-role only.

create or replace function check_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count int;
begin
  -- Opportunistic cleanup — keeps the table small without needing a cron.
  delete from rate_limits where window_start < now() - interval '1 hour';

  insert into rate_limits (key, window_start, count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

grant all on rate_limits to service_role;
grant execute on function check_rate_limit(text, int, int) to service_role;
