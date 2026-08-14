// Grants platform-admin (dashboard) access to an existing Supabase auth user.
//
// Admins aren't self-service by design (see PRD §3) — bootstrap flow:
//   1. Have the person request a magic link at /admin/login once (creates
//      their auth.users row; they don't need to click the link yet).
//   2. Run this script to add their admin_users row.
//   3. They request a fresh magic link and sign in — now recognized as admin.
//
// Usage:
//   node --env-file=.env.local scripts/promote-admin.mjs <email> "<display name>" [role]
//   (role defaults to "admin"; pass "super_admin" or "moderator" for the other tiers)

import { createClient } from "@supabase/supabase-js";

const [, , email, displayName, role = "admin"] = process.argv;

if (!email || !displayName) {
  console.error(
    'Usage: node --env-file=.env.local scripts/promote-admin.mjs <email> "<display name>" [admin|super_admin|moderator]',
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function findUserByEmail(targetEmail) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) break; // last page
  }
  return null;
}

const user = await findUserByEmail(email);

if (!user) {
  console.error(
    `No auth user found for ${email}.\n` +
      `Ask them to request a magic link at /admin/login first (they don't need to click it), then re-run this script.`,
  );
  process.exit(1);
}

const { error: upsertError } = await supabase
  .from("admin_users")
  .upsert({ id: user.id, display_name: displayName, role }, { onConflict: "id" });

if (upsertError) {
  console.error("Failed to grant admin access:", upsertError.message);
  process.exit(1);
}

console.log(`${email} is now a platform admin (${role}). They can sign in at /admin/login.`);
