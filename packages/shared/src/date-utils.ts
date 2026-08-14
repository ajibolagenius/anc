/**
 * Africa/Lagos (WAT) never observes DST, but we still resolve "today" via
 * Intl rather than a hardcoded UTC+1 offset — the birthday and news-digest
 * crons must never drift onto the wrong day just because the host runs in UTC.
 */
export function todayInLagos(): { day: number; month: number; year: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}
