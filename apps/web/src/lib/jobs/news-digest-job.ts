import "server-only";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { todayInLagos } from "@anc/shared";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendWhatsAppGroupMessage } from "@/lib/wa-bot-client";

type DigestItem = { title: string; link: string; source: string; publishedAt: string };

/**
 * PRD §4.8 source list, in priority order (used both to rank and to decide
 * which side of a near-duplicate story to keep). Sky Sports' team-specific
 * RSS feed could not be confirmed working as of writing (returns a generic
 * sports feed / 404 depending on the guessed URL) and is deliberately
 * omitted rather than shipping a broken endpoint — add it back once a real
 * feed URL is confirmed. Every source here is fetched independently and a
 * failure on one never blocks the others (Promise.allSettled below).
 */
const RSS_SOURCES: { name: string; url: string }[] = [
  { name: "Arsenal.com", url: "https://www.arsenal.com/rss.xml" },
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/teams/arsenal/rss.xml" },
  { name: "Arseblog", url: "https://www.arseblog.com/feed/" },
];
const REDDIT_SOURCE = { name: "r/Gunners", url: "https://www.reddit.com/r/Gunners/top/.json?t=day&limit=15" };
const REDDIT_MIN_UPVOTES = 50;
const MAX_AGE_HOURS = 24;
const MAX_ITEMS = 5;

const parser = new Parser();

async function fetchRssItems(source: { name: string; url: string }): Promise<DigestItem[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!.trim(),
      link: item.link!.trim(),
      source: source.name,
      publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
    }));
}

async function fetchRedditTopItems(): Promise<DigestItem[]> {
  const res = await fetch(REDDIT_SOURCE.url, {
    headers: { "user-agent": "ANC-NewsDigest/1.0 (Arsenal Nigeria Community bot)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Reddit returned HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: { children?: { data: { title: string; permalink: string; ups: number; link_flair_text: string | null; created_utc: number } }[] };
  };
  return (json.data?.children ?? [])
    .map((c) => c.data)
    .filter((d) => d.ups >= REDDIT_MIN_UPVOTES || Boolean(d.link_flair_text))
    .map((d) => ({
      title: d.title.trim(),
      link: `https://www.reddit.com${d.permalink}`,
      source: REDDIT_SOURCE.name,
      publishedAt: new Date(d.created_utc * 1000).toISOString(),
    }));
}

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((w) => b.has(w)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Keeps the first (highest source-priority) occurrence of each near-duplicate story cluster. */
function dedupeByTitleSimilarity(items: DigestItem[]): DigestItem[] {
  const kept: { item: DigestItem; words: Set<string> }[] = [];
  for (const item of items) {
    const words = normalizeTitle(item.title);
    const isDuplicate = kept.some((k) => jaccardSimilarity(k.words, words) >= 0.5);
    if (!isDuplicate) kept.push({ item, words });
  }
  return kept.map((k) => k.item);
}

async function gatherItems(): Promise<{ items: DigestItem[]; sourceErrors: string[] }> {
  const sourceErrors: string[] = [];

  const results = await Promise.allSettled([...RSS_SOURCES.map((s) => fetchRssItems(s)), fetchRedditTopItems()]);
  const allSourceNames = [...RSS_SOURCES.map((s) => s.name), REDDIT_SOURCE.name];

  const items: DigestItem[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      sourceErrors.push(`${allSourceNames[i]}: ${(result.reason as Error).message}`);
    }
  });

  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const recent = items.filter((item) => new Date(item.publishedAt).getTime() >= cutoff);
  const deduped = dedupeByTitleSimilarity(recent);
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return { items: deduped.slice(0, MAX_ITEMS), sourceErrors };
}

async function summarizeItems(items: DigestItem[]): Promise<{ text: string; usedFallback: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { text: rawHeadlinesFallback(items), usedFallback: true };
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = [
      "Summarize each of these Arsenal FC news items in 1-2 short, punchy lines for a WhatsApp group of Nigerian Arsenal fans.",
      "Keep every summary factual (no speculation beyond what's in the title/source), preserve the link on its own line right after each summary, and separate items with a blank line. Do not add any preamble or sign-off.",
      "",
      ...items.map((item, i) => `${i + 1}. [${item.source}] ${item.title}\n${item.link}`),
    ].join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content.find((block) => block.type === "text")?.text?.trim();
    if (!text) throw new Error("Empty summarization response");
    return { text, usedFallback: false };
  } catch {
    // PRD §4.8: never let a summarization failure block the whole digest.
    return { text: rawHeadlinesFallback(items), usedFallback: true };
  }
}

function rawHeadlinesFallback(items: DigestItem[]): string {
  return items.map((item) => `[${item.source}] ${item.title}\n${item.link}`).join("\n\n");
}

export type NewsDigestJobSummary = {
  digestDate: string;
  status: "sent" | "failed" | "skipped";
  reason?: string;
  itemCount: number;
  usedFallback?: boolean;
  sourceErrors: string[];
  whatsappError?: string | null;
};

/**
 * Core news digest job — shared by the daily cron route and the admin
 * "send test digest now" button. `force: true` (test-send) bypasses the
 * once-a-day idempotency check and upserts news_digest_log instead of
 * inserting, so QA re-runs never hit the unique(digest_date) constraint.
 */
export async function runNewsDigestJob({ force = false }: { force?: boolean } = {}): Promise<NewsDigestJobSummary> {
  const { day, month, year } = todayInLagos();
  const digestDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const supabase = createServiceRoleClient();

  if (!force) {
    const { data: existing } = await supabase.from("news_digest_log").select("id").eq("digest_date", digestDate).maybeSingle();
    if (existing) return { digestDate, status: "skipped", reason: "already sent today", itemCount: 0, sourceErrors: [] };
  }

  const { items, sourceErrors } = await gatherItems();

  if (items.length === 0) {
    await supabase
      .from("news_digest_log")
      .upsert({ digest_date: digestDate, items: [], status: "skipped" }, { onConflict: "digest_date" });
    return { digestDate, status: "skipped", reason: "no fresh stories found", itemCount: 0, sourceErrors };
  }

  const { text, usedFallback } = await summarizeItems(items);
  const message = `📰 *ANC Daily Arsenal Digest*\n\n${text}`;
  const result = await sendWhatsAppGroupMessage(message);

  await supabase.from("wa_bot_message_log").insert({
    purpose: "news_digest",
    message_text: message,
    status: result.ok ? "sent" : "failed",
    error: result.error ?? null,
  });
  await supabase.from("news_digest_log").upsert(
    {
      digest_date: digestDate,
      items,
      status: result.ok ? "sent" : "failed",
      error: result.error ?? null,
    },
    { onConflict: "digest_date" },
  );

  return {
    digestDate,
    status: result.ok ? "sent" : "failed",
    itemCount: items.length,
    usedFallback,
    sourceErrors,
    whatsappError: result.error ?? null,
  };
}
