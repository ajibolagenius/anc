export const WHATSAPP_GROUP_INVITE_URL = "https://chat.whatsapp.com/H0XvrxuyplcIqqTnzFqrcu";

export const SITE = {
  name: "Arsenal Nigeria Community",
  shortName: "ANC",
  tagline: "North London's pride. Nigeria's own.",
} as const;

/** Absolute origin for links inside emails (no request context to read window.location from there). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arsenalnigeria.community";
