-- Adds a third admin tier, "moderator", below "admin" and "super_admin".
-- Permitted-action tiering itself lives in app code (lib/admin-guard.ts);
-- this migration only widens the column's allowed values.

alter table admin_users drop constraint admin_users_role_check;

alter table admin_users
  add constraint admin_users_role_check
  check (role in ('super_admin', 'admin', 'moderator'));
