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

/**
 * 3-letter code per state of residence, used to build a member's ANC number
 * on approval: `ANC-{CODE}-{SEQUENCE}` (PRD §4.1, e.g. `ANC-LAG-0142`). This
 * is the single source of truth for the mapping — the one-time SQL backfill
 * in supabase/migrations/20260814050000_anc_number_assignment.sql mirrors it
 * for members approved before this feature existed, but every assignment
 * from here on passes the code computed from this map.
 */
export const STATE_CODES: Record<NigerianState, string> = {
  "Abia": "ABI",
  "Adamawa": "ADA",
  "Akwa Ibom": "AKW",
  "Anambra": "ANA",
  "Bauchi": "BAU",
  "Bayelsa": "BAY",
  "Benue": "BEN",
  "Borno": "BOR",
  "Cross River": "CRO",
  "Delta": "DEL",
  "Ebonyi": "EBO",
  "Edo": "EDO",
  "Ekiti": "EKI",
  "Enugu": "ENU",
  "FCT (Abuja)": "ABJ",
  "Gombe": "GOM",
  "Imo": "IMO",
  "Jigawa": "JIG",
  "Kaduna": "KAD",
  "Kano": "KAN",
  "Katsina": "KAT",
  "Kebbi": "KEB",
  "Kogi": "KOG",
  "Kwara": "KWA",
  "Lagos": "LAG",
  "Nasarawa": "NAS",
  "Niger": "NIG",
  "Ogun": "OGU",
  "Ondo": "OND",
  "Osun": "OSU",
  "Oyo": "OYO",
  "Plateau": "PLA",
  "Rivers": "RIV",
  "Sokoto": "SOK",
  "Taraba": "TAR",
  "Yobe": "YOB",
  "Zamfara": "ZAM",
};

/** Prediction scoring formula (PRD §4.5) — kept simple, it's fan fun, not fantasy football. */
export const PREDICTION_POINTS = {
  exactScore: 3,
  correctOutcomeOnly: 1,
  correctScorerBonus: 1,
} as const;
