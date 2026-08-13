export const ACTIVITY_TIERS = ["pending", "active", "semi_active", "inactive"] as const;
export type ActivityTier = (typeof ACTIVITY_TIERS)[number];

export const REGISTRATION_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type JerseySize = (typeof JERSEY_SIZES)[number];

export const GIVEAWAY_STATUSES = ["draft", "open", "closed", "winner_selected", "completed"] as const;
export type GiveawayStatus = (typeof GIVEAWAY_STATUSES)[number];

export const WATCH_PARTY_STATUSES = ["pending", "approved", "rejected"] as const;
export type WatchPartyStatus = (typeof WATCH_PARTY_STATUSES)[number];

/** Nigerian states + FCT, for state-of-origin / state-of-residence selects. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;
export type NigerianState = (typeof NIGERIAN_STATES)[number];

/** Prediction scoring formula (PRD §4.5) — kept simple, it's fan fun, not fantasy football. */
export const PREDICTION_POINTS = {
  exactScore: 3,
  correctOutcomeOnly: 1,
  correctScorerBonus: 1,
} as const;
