"use server";

import { requireRole } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/admin-audit-log";
import { runBirthdayJob, type BirthdayJobSummary } from "@/lib/jobs/birthday-job";
import { runNewsDigestJob, type NewsDigestJobSummary } from "@/lib/jobs/news-digest-job";

// Both actions force-trigger real outbound comms jobs outside their normal
// schedule — restricted to super_admin, same tier as newsletter sends.
export async function testSendBirthdays(): Promise<BirthdayJobSummary> {
  const admin = await requireRole("super_admin");
  const summary = await runBirthdayJob();
  await logAdminAction({ adminId: admin.userId, action: "birthday_test_send", entityType: "birthday_job", metadata: summary });
  return summary;
}

export async function testSendNewsDigest(): Promise<NewsDigestJobSummary> {
  const admin = await requireRole("super_admin");
  const summary = await runNewsDigestJob({ force: true });
  await logAdminAction({ adminId: admin.userId, action: "news_digest_test_send", entityType: "news_digest_job", metadata: summary });
  return summary;
}
