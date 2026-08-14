import type {
  ActivityTier,
  GiveawayStatus,
  RegistrationStatus,
  WatchPartyStatus,
} from "@anc/shared";
import type { AdminRole } from "@/lib/supabase/server-session";
import type { BadgeTone } from "./badge";

// Match/newsletter/delivery status are plain `text` + `CHECK` columns in
// Supabase (see supabase/migrations/20260813210717_init_schema.sql) with no
// shared-package enum today — defined locally here since this is purely a
// presentation-layer concern (which Badge tone a status renders as).
export const MATCH_STATUSES = ["upcoming", "completed"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const NEWSLETTER_STATUSES = ["draft", "scheduled", "sending", "sent", "failed"] as const;
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];

export const NEWSLETTER_DELIVERY_STATUSES = ["queued", "sent", "failed", "bounced"] as const;
export type NewsletterDeliveryStatus = (typeof NEWSLETTER_DELIVERY_STATUSES)[number];

/** Admin-confirmed activity tier — color-coded (distinct from `selfReportedTierTone`, which is always neutral). */
export function activityTierTone(tier: ActivityTier): BadgeTone {
  switch (tier) {
    case "active":
      return "red";
    case "semi_active":
      return "blue";
    case "inactive":
    case "pending":
      return "neutral";
  }
}

/** A member's own self-reported tier at registration — always neutral, never the admin-confirmed red/blue treatment. */
export function selfReportedTierTone(_tier: ActivityTier): BadgeTone {
  void _tier;
  return "neutral";
}

export function registrationStatusTone(status: RegistrationStatus): BadgeTone {
  switch (status) {
    case "approved":
      return "green";
    case "pending":
      return "gold";
    case "rejected":
      return "red";
    case "suspended":
      return "neutral";
  }
}

export function giveawayStatusTone(status: GiveawayStatus): BadgeTone {
  switch (status) {
    case "draft":
      return "neutral";
    case "open":
      return "green";
    case "closed":
      return "gold";
    case "winner_selected":
      return "gold";
    case "completed":
      return "green";
  }
}

export function watchPartyStatusTone(status: WatchPartyStatus): BadgeTone {
  switch (status) {
    case "pending":
      return "gold";
    case "approved":
      return "green";
    case "rejected":
      return "red";
  }
}

export function matchStatusTone(status: MatchStatus): BadgeTone {
  return status === "completed" ? "green" : "gold";
}

export function newsletterStatusTone(status: NewsletterStatus): BadgeTone {
  switch (status) {
    case "sent":
      return "green";
    case "failed":
      return "red";
    case "scheduled":
    case "sending":
      return "gold";
    case "draft":
      return "neutral";
  }
}

export function deliveryStatusTone(status: NewsletterDeliveryStatus): BadgeTone {
  switch (status) {
    case "sent":
      return "green";
    case "failed":
      return "red";
    case "bounced":
      return "gold";
    case "queued":
      return "neutral";
  }
}

export function adminRoleTone(role: AdminRole): BadgeTone {
  switch (role) {
    case "super_admin":
      return "gold";
    case "moderator":
      return "blue";
    case "admin":
      return "neutral";
  }
}

export function adminRoleLabel(role: AdminRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "moderator":
      return "Moderator";
    case "admin":
      return "Admin";
  }
}

