import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Fire-and-forget audit trail for admin actions without their own dedicated
 * log (giveaways already have giveaway_audit_log — leave that alone). Never
 * throws: an audit-log failure should never block the admin action itself.
 */
export async function logAdminAction(entry: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: unknown;
}): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("admin_audit_log").insert({
      admin_id: entry.adminId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // best-effort only
  }
}
