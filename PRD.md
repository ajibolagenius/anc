# Arsenal Nigeria Community (ANC) Platform — Product Requirements Document

## 1. Overview

Arsenal Nigeria Community (ANC) is a Nigerian WhatsApp-based Arsenal FC fan
community, run today entirely inside a WhatsApp group with informal roles
(admins, active, semi-active, and general members). The community runs
conversational debates/banter, an annual jersey giveaway, and other fun
activities.

This platform extends ANC beyond WhatsApp with a web presence — a member
registry with a shareable digital "Gunner Fan Pass," automated birthday
wishes (email + WhatsApp), newsletters, structured giveaway tooling, matchday
predictions, and a watch-party locator — while keeping the WhatsApp group
itself as the social heart of the community. The web platform feeds *into*
the group (via bot posts); it doesn't replace it.

The project lives at `~/Desktop/ANC` (greenfield, empty git repo, no
commits yet).

## 2. Goals & Non-Goals

**Goals**
- Give ANC a real, queryable member registry beyond WhatsApp's contact list.
- Automate birthday recognition (email + WhatsApp group shoutout) reliably
  and without spamming the group.
- Make the annual jersey giveaway (and other giveaways) fair, auditable, and
  low-effort for admins to run.
- Add lightweight matchday engagement (predictions leaderboard) and
  real-world coordination (watch parties) without turning this into a
  full social network.
- Keep running cost near-zero (free-tier-friendly) and ops manageable for a
  solo/small admin team.

**Non-Goals (v1)**
- Not replacing WhatsApp as the community's primary communication channel.
- Not building a full social network (no feeds, comments, DMs between
  members).
- Not integrating the official WhatsApp Business Cloud API in v1 (accepted
  trade-off: unofficial Baileys automation, see §9).

## 3. User Roles & Personas

| Role | Where it lives | Meaning |
|---|---|---|
| **Platform Admin** | `admin_users` table, real Supabase Auth login | Can log into the dashboard: approve members, run giveaways, send newsletters, manage predictions/watch parties. |
| **Community Admin** (`is_group_admin`) | Flag on `members` | The informal WhatsApp-group admin role. Deliberately **separate** from Platform Admin — being a WhatsApp admin does not itself grant dashboard access, avoiding a conflated-privilege bug. |
| **Activity Tier**: Active / Semi-Active / Inactive | `members.activity_tier` | Informal engagement level, admin-assigned (not self-reported) after registration review. Used for giveaway eligibility and community stats. |
| **Member** | `members` table, real Supabase Auth login (magic-link) | Registers, gets a Digital Fan Pass, views/edits own profile, enters giveaways, submits match predictions. |

## 4. Feature Modules

### 4.1 Member Onboarding & Digital "Gunner Fan Pass"

Registration captures:
- Full name, WhatsApp number (+234 E.164), email
- Birthday (day + month only — no year, for data minimization)
- State of origin (optional) and state of residence (Lagos, Abuja, PH,
  Ibadan, etc. — supports the Watch Party Locator)
- Favorite current Arsenal player, favorite all-time Arsenal player
  (optional, fun/profile flavor)
- Jersey size (S, M, L, XL, XXL) — captured up front so giveaway fulfillment
  never has to chase this down later
- Explicit consent checkbox (NDPR — see §9)

New registrations land as `pending` until an admin reviews and assigns the
real `activity_tier` — self-reported activity level is stored but never
trusted as authoritative.

**Digital ANC ID**: on approval, each member is issued a membership number
following `ANC-{STATE_CODE}-{SEQUENCE}` (e.g. `ANC-LAG-0142`), and a
shareable, Arsenal-themed digital fan card is generated (member name, ANC
number, avatar, join date) that members can save and post to WhatsApp
Status / X. Rendered server-side as an image (e.g. via `@vercel/og` /
`satori`) from the member's data — no separate design tool needed.

### 4.2 Automated Birthday Engine

- Daily cron at **07:00 WAT** (`Africa/Lagos`, no DST — computed explicitly,
  never relying on server-default UTC).
- **Email wish**: branded Arsenal-themed HTML email via **React Email +
  Resend**, personalized per member.
- **WhatsApp group shoutout**: the bot posts a celebratory message into the
  ANC group, **@mentioning** the celebrant(s) directly (Baileys supports
  WhatsApp mentions via the message's `mentions` array). If multiple members
  share a birthday, they're batched into a single message that mentions all
  of them — never one message per person, to keep the group from feeling
  spammed and to reduce the bot's ban-risk profile.
- Idempotent by design (`birthday_notifications` unique per member/year/
  channel) so a cron retry never double-sends.
- Both the email and the WhatsApp message close with the shared signature
  block (see §8).

### 4.3 Giveaway & Jersey Raffle Hub

- Eligibility filtering by `activity_tier` and `registration_status`.
- Jersey sizes are already on file from registration — no separate
  collection step needed at giveaway time.
- Provably-fair random draw (`crypto.randomInt`, logged) rather than a raw
  SQL `ORDER BY random()` guess — auditable if a winner is ever questioned.
- Full winner history archive and a general audit log (entries, draws,
  re-draws) — supports the annual jersey giveaway and any other one-off
  giveaway.
- **Multi-winner giveaways**: `giveaway_winners.rank` supports multiple
  winners per giveaway (e.g. 3 jerseys → 3 rows, rank 1/2/3).
- **Re-draws**: if a winner is unreachable or turns out ineligible, the
  admin marks that winner's row `disqualified` (with a reason — the row is
  never deleted, preserving the audit trail) and triggers "draw
  replacement," which picks a new winner at the same rank from the
  remaining eligible entrants, excluding everyone already selected or
  disqualified. The replacement row references the one it replaces, so full
  lineage stays visible in the winner history.

### 4.4 Newsletter / Broadcast

- Admin composes subject + body, picks an audience filter (e.g. all
  approved members, or a specific state/tier), sends via Resend.
- Optional: also post a short summary to the WhatsApp group.
- Per-recipient delivery status tracked (sent/failed/bounced).
- Closes with the shared signature block in the email footer (see §8).

### 4.5 Matchday Prediction Hub & Leaderboard

- Admin creates upcoming fixtures (`matches`: opponent, kickoff time,
  competition).
- Logged-in members submit a prediction per match: score prediction +
  first-goalscorer guess, before kickoff.
- After the match, an admin enters the actual result; points are computed
  automatically using a stacking formula (kept simple since this is just
  for fan fun, not a serious competition): **exact scoreline = 3 points**;
  **correct outcome only** (win/draw/loss, without the exact score) **= 1
  point**; **correct first goalscorer = +1 bonus**, stacking with either of
  the above. Maximum 4 points per match.
- A season leaderboard aggregates points per member — lightweight banter
  fuel, not a full fantasy-football system.

### 4.6 Watch Party Locator

- Admins can post listings directly (auto-approved). Trusted `active`-tier
  members can also submit listings, which land as `pending` until an admin
  approves them — only `approved` listings appear in the public browse view.
- Physical match-viewing locations tied to a state/city (using the same
  state list as registration), with venue name, address/map link, and
  contact info.
- Members browse watch parties filtered by their own state of residence —
  helps coordinate real-world meetups around big matches.
- Can optionally tie a watch party listing to a specific `match_id`, or
  stand alone as a recurring venue.

### 4.7 Admin Dashboard

- Member directory with filtering/tagging by state, tier, jersey size, etc.
- Pending-registration approval queue.
- Birthday calendar view.
- Giveaway creation, entry monitoring, and randomizer/draw UI.
- Newsletter composer + delivery status.
- Predictions/fixture management and leaderboard view.
- Watch party management.
- CSV export of the member directory (for offline reference, e.g. ahead of
  jersey fulfillment).
- WhatsApp bot health indicator (connected/disconnected).

### 4.8 Daily Arsenal News Digest

- Runs on the same daily-cron pattern as the birthday engine, offset to
  **08:00 WAT** (after the 07:00 birthday post) so the group doesn't get two
  automated messages back-to-back.
- **Sources**: RSS-friendly Arsenal-focused outlets and forums — official
  Arsenal.com news feed, BBC Sport's Arsenal team feed, Sky Sports Arsenal
  feed, Arseblog (popular independent Arsenal blog/podcast), and the
  r/Gunners subreddit RSS (filtered to high-upvote/flaired posts).
  Deliberately **not** scraping X/Twitter for journalists like David
  Ornstein or Fabrizio Romano — X's API is paid/restricted and scraping
  violates its ToS; if their voices are wanted later, the practical route is
  a paid X API tier or picking up their reporting via an outlet that already
  syndicates it in RSS (e.g. The Athletic).
- **Aggregation**: fetch all feeds, keep items published in the last ~24h,
  dedupe near-identical stories (the same transfer rumor from multiple
  outlets), rank by recency/source priority, cap at ~5 stories so the digest
  stays one readable WhatsApp message.
- **Summarization**: a single Claude Haiku 4.5 API call condenses the day's
  top stories into 1–2 line summaries each, always preserving a link back to
  the original article — summarizing rather than republishing verbatim
  avoids any copyright concern.
- **Delivery**: one formatted message posted to the group via the same
  `wa-bot` `/internal/send-group-message` endpoint already built for
  birthdays — no new bot infrastructure needed.
- **Idempotency/audit**: `news_digest_log` (one row per day) prevents a cron
  retry from double-posting; if zero relevant stories that day, the job
  skips sending rather than posting an empty digest.
- **Graceful degradation**: if the summarization call fails, fall back to
  posting raw headlines + links rather than blocking the whole digest.
- Closes with the shared signature block (see §8).

## 5. System Architecture

```
                   ┌──────────────────────────────────────────────────────┐
                   │            Arsenal Nigeria Community (ANC)           │
                   │            Web Portal (Next.js, App Router)          │
                   └───────────────────────────┬───────────────────────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
           ┌─────────────────────────┐                     ┌─────────────────────────┐
           │   Member Web Portal      │                     │   Admin Dashboard        │
           │ • Digital Fan Pass       │                     │ • Member directory       │
           │ • Profile & Jersey Size  │                     │ • Birthday calendar      │
           │ • Giveaway entry         │                     │ • Giveaway randomizer    │
           │ • Match predictions      │                     │ • Newsletter broadcast   │
           │ • Watch party locator    │                     │ • Predictions/fixtures   │
           └────────────┬─────────────┘                     └────────────┬─────────────┘
                        │                                                │
                        └───────────────────────┬────────────────────────┘
                                                 ▼
                        ┌──────────────────────────────────────────────┐
                        │        Supabase (Postgres + Auth + Storage)  │
                        │   RLS-enforced; service-role key server-side │
                        └───────────────┬────────────────┬─────────────┘
                                        │                │
                ┌───────────────────────┘                └───────────────────────┐
                ▼                                                                 ▼
     ┌──────────────────────────┐                                       ┌─────────────────────┐
     │  Vercel Cron              │                                       │  wa-bot (Baileys)    │
     │  07:00 WAT: birthdays     │ ────────────────────────────────────► │  Oracle Cloud VM     │
     │  08:00 WAT: news digest   │    internal HTTPS API (bearer secret) │  (Always Free, Ampere │
     │ • Find birthdays          │                                       │   A1) + systemd+Caddy │
     │ • Curate & summarize      │                                       │                      │
     │   Arsenal news (RSS feeds │                                       │                      │
     │   + Claude Haiku)         │                                       │                      │
     └──────────┬────────────────┘                                       └─────────────────────┘
                │
                ▼ (birthdays only)
     ┌─────────────────────┐
     │  Resend (Email)      │
     │  React Email templates│
     └─────────────────────┘
```

**Service boundaries** (pnpm monorepo):
```
ANC/
  apps/
    web/       # Next.js: public registration, member portal, admin dashboard, API routes, cron endpoint
    wa-bot/    # Standalone Baileys service on the Oracle Cloud VM — session + internal API only, no business logic
  packages/
    shared/    # zod schemas, generated Supabase types, shared enums, outbound-message signature template
  supabase/
    migrations/
```

**WhatsApp group JID**: WhatsApp addresses every chat — including groups —
by an internal identifier called a JID, never by its display name. The ANC
group's JID has already been obtained (`120363206409553106@g.us`) and will
be set directly as the `WA_GROUP_JID` environment variable when `apps/wa-bot`
is scaffolded — no discovery step needed. (The bot's dedicated WhatsApp
number still needs to be added to the group as a normal member before it
can post there.)

## 6. Tech Stack

| Component | Chosen Stack | Notes / Alternatives Considered |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) on Vercel (free tier) | Alt: Vite+React / Express — rejected, Next.js gives cron + API routes + hosting in one. |
| Styling | Tailwind CSS | Arsenal palette tokens (see §8) layered on top. |
| Database | PostgreSQL via **Supabase** (free tier) | Alt considered: Neon, MongoDB, Turso/SQLite — Supabase chosen for bundled Auth + Storage + RLS. |
| Data access | `@supabase/supabase-js` + generated types, **no ORM** | Deliberate deviation from an earlier Prisma/Drizzle idea — Supabase's RLS-first model plus generated types covers type-safety without an ORM layer to keep in sync. |
| Validation | `zod` (shared in `packages/shared`) | Client + server shared schemas. |
| Auth | Supabase Auth — magic-link for members, same for admins (+ `admin_users` row check) | Real accounts for both roles, no password-reset flow to build. |
| Scheduling | Vercel Cron → `/api/cron/birthdays` | Alt: Trigger.dev / Inngest — viable if cron needs grow beyond daily; not needed for v1. |
| Email | Resend + React Email | Alt: Brevo, Postmark. |
| WhatsApp bot | Baileys (Node/TS, standalone service) | Alt: official WhatsApp Business Cloud API — deferred; Baileys avoids business verification and template-approval overhead at the cost of ToS/ban risk (mitigated via dedicated number + low volume). |
| WhatsApp bot host | Oracle Cloud Always Free VM (Ampere A1) + systemd + Caddy (auto TLS) | Genuinely free forever, ample headroom for a Puppeteer-free bot. Fallback: Railway (~$5/mo) if OCI signup/capacity is a blocker. |
| Monitoring | Sentry (free tier), both `web` and `wa-bot` | wa-bot is the most fragile component — alert on disconnect. |
| Spam mitigation | Cloudflare Turnstile + honeypot + `libphonenumber-js` | On the public registration form. |
| News aggregation | `rss-parser` (Node) + Claude Haiku 4.5 (Anthropic API) for summarization | Cheap/fast model suits short daily summarization; RSS avoids fragile scraping and X/Twitter ToS issues. |

## 7. Data Model (Postgres, via Supabase migrations)

```sql
-- Core registry
members (
  id                          uuid pk default gen_random_uuid(),
  auth_user_id                uuid unique references auth.users(id),
  anc_number                  text unique,              -- e.g. ANC-LAG-0142, assigned on approval
  full_name                   text not null,
  whatsapp_number              text not null unique,     -- E.164
  email                       text not null unique,
  birthday_day                smallint not null check (birthday_day between 1 and 31),
  birthday_month              smallint not null check (birthday_month between 1 and 12),
  state_of_origin             text,
  state_of_residence          text not null,
  favorite_player_current     text,
  favorite_player_alltime     text,
  jersey_size                 text check (jersey_size in ('S','M','L','XL','XXL')),
  self_reported_tier          text check (self_reported_tier in ('active','semi_active','inactive')),
  activity_tier               text not null default 'pending'
                              check (activity_tier in ('pending','active','semi_active','inactive')),
  is_group_admin              boolean not null default false,   -- WhatsApp role, NOT platform admin access
  registration_status         text not null default 'pending'
                              check (registration_status in ('pending','approved','rejected','suspended')),
  reviewed_by                 uuid references admin_users(id),
  reviewed_at                 timestamptz,
  last_birthday_greeted_year  smallint,
  consent_given_at            timestamptz not null,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Platform admins (dashboard access — distinct from is_group_admin)
admin_users (
  id             uuid pk references auth.users(id),
  member_id      uuid references members(id),
  display_name   text not null,
  role           text not null default 'admin' check (role in ('super_admin','admin')),
  created_at     timestamptz not null default now()
);

-- Birthday automation (idempotency + audit)
birthday_notifications (
  id, member_id, greeted_year smallint,
  channel text check (channel in ('email','whatsapp')),
  status text check (status in ('sent','failed','skipped')),
  provider_message_id, error, sent_at,
  unique (member_id, greeted_year, channel)
);

-- Giveaways
giveaways (
  id, title, description, type text default 'jersey' check (type in ('jersey','poll','other')),
  entry_opens_at, entry_closes_at,
  status text default 'draft' check (status in ('draft','open','closed','winner_selected','completed')),
  eligibility_tiers text[] default '{active,semi_active,inactive}',
  created_by -> admin_users, created_at
);
giveaway_entries (
  id, giveaway_id -> giveaways, member_id -> members, entered_at,
  unique (giveaway_id, member_id)
);
giveaway_winners (
  id, giveaway_id, member_id, rank int default 1,
  selection_method text check (selection_method in ('random_auto','manual_override')),
  selected_by -> admin_users, selected_at, prize_note,
  disqualified_at timestamptz, disqualified_reason text,
  replaces_winner_id uuid references giveaway_winners(id)   -- set when this row is a re-draw replacement
);
giveaway_audit_log (
  id, giveaway_id, event_type text check (event_type in
    ('created','opened','closed','entry_added','winner_selected','notified','reopened')),
  actor_admin_id, metadata jsonb, created_at
);

-- Newsletter
newsletters (
  id, subject, body_html, body_text,
  status text default 'draft' check (status in ('draft','scheduled','sending','sent','failed')),
  audience_filter jsonb default '{"registration_status":"approved"}',
  also_post_to_whatsapp boolean, whatsapp_summary_text,
  scheduled_for, created_by -> admin_users, sent_at, created_at, updated_at
);
newsletter_deliveries (
  id, newsletter_id, member_id, email, status text check (status in ('queued','sent','failed','bounced')),
  provider_message_id, error, sent_at, created_at,
  unique (newsletter_id, member_id)
);

-- Matchday predictions
matches (
  id, opponent text not null, kickoff_at timestamptz not null, competition text,
  actual_home_score int, actual_away_score int, actual_first_scorer text,
  status text default 'upcoming' check (status in ('upcoming','completed')),
  created_at
);
predictions (
  id, match_id -> matches, member_id -> members,
  predicted_home_score int not null, predicted_away_score int not null,
  predicted_first_scorer text,
  points_awarded int,
  created_at,
  unique (match_id, member_id)
);

-- Watch parties
watch_parties (
  id, match_id -> matches,        -- nullable: can stand alone as a recurring venue
  state text not null, city text not null,
  venue_name text not null, address text, map_link text,
  contact_name text, contact_whatsapp text,
  is_recurring boolean default false,
  submitted_by text not null check (submitted_by in ('admin','member')),
  submitted_by_member_id uuid references members(id),  -- set when submitted_by = 'member'
  status text not null default 'approved'
         check (status in ('pending','approved','rejected')),  -- admin submissions auto-'approved'; member submissions start 'pending'
  approved_by -> admin_users,
  created_at
);

-- WhatsApp outbound audit
wa_bot_message_log (
  id, purpose text check (purpose in ('birthday','newsletter','giveaway_winner','news_digest','manual')),
  reference_id uuid, message_text, status text check (status in ('sent','failed')),
  error, created_at
);

-- Daily Arsenal news digest
news_digest_log (
  id, digest_date date not null unique,
  items jsonb not null,      -- [{title, url, source, summary}, ...]
  status text check (status in ('sent','skipped','failed')),
  whatsapp_message_id text, error, created_at
);
```

**RLS**: enabled on every table. Admin/cron/newsletter/giveaway writes use
the Supabase service-role key server-side. Member-facing reads/writes
(profile, giveaway entry, predictions) are scoped via RLS to
`auth.uid() = members.auth_user_id`, with `activity_tier`,
`registration_status`, and `anc_number` excluded from member-writable
columns.

## 8. Design Language

- **Colors**: Arsenal Red `#DB0007`, Gold `#9C824A`, Navy `#023474`.
- Digital Fan Pass and email templates should use this palette consistently
  so the "brand" feels the same across web, email, and WhatsApp graphics.
- **Signature / Attribution**: this platform is a volunteer, fan-love
  project — not commissioned or paid work. Every automated outbound
  message (WhatsApp birthday shoutout, news digest, giveaway winner
  announcement) and every newsletter email closes with a separated
  signature block — **appended to the same message**, not sent as a
  separate one — e.g.:

  ```
  -------------------------
  Built with love by Ajibola Don_Genius
  ```

  Implemented as a single shared template
  (`packages/shared/signature.ts`, one plain-text version for WhatsApp and
  one HTML `<hr/>`-based version for email) so every message-composing code
  path pulls from the same source and the wording only ever changes in one
  place.

## 9. Non-Functional Requirements

- **NDPR (Nigeria Data Protection Act)**: explicit consent capture
  (`consent_given_at`), a plain-language privacy notice on the registration
  form, a member-initiated deletion/opt-out path, least-privilege on
  `admin_users`, HTTPS everywhere. Excluding birth year is deliberate
  data-minimization.
- **WhatsApp session fragility**: Baileys sessions can be logged out
  (device limits, anti-automation detection). Mitigations: dedicated/burner
  number (never an admin's personal number), low message volume (batched,
  not per-person), `/internal/health` endpoint monitored via Sentry/alerting
  so an admin is notified to re-scan the QR pairing code if disconnected.
- **Rate limits at scale**: Resend free tier (~100/day, ~3,000/month) may be
  exceeded by a single newsletter blast once approved membership passes
  ~100 — budget for a paid tier as the community grows.
- **Public registration abuse**: Cloudflare Turnstile + honeypot +
  server-side phone validation (`libphonenumber-js`).
- **Cost target**: ~$0–5/month + ~$12/year domain, per the free-tier-first
  stack above.

## 10. Roadmap / Phased Rollout

- **M0 — Scaffold**: pnpm workspace, Supabase project linked, first
  migration (`members`, `admin_users`), shared zod schemas/types.
- **M1 — Member registry, accounts & Digital Fan Pass**: registration form
  (all fields above, Turnstile, consent), magic-link auth, member profile
  page, ANC number assignment + fan-pass card generation on approval, admin
  approval dashboard with directory filtering/tagging and CSV export.
- **M2 — Birthday automation & news digest**: Resend + React Email
  template, `wa-bot` scaffold (pairing, health/send-with-mentions endpoints)
  deployed to the Oracle Cloud VM, Vercel Cron wired end-to-end for both the
  07:00 birthday job and the 08:00 news-digest job (RSS fetch + dedupe +
  Claude Haiku summarization), manual test-send in admin dashboard for both.
- **M3 — Newsletter**: compose UI, audience filter, send flow, delivery
  status, optional WhatsApp note.
- **M4 — Giveaway tools**: creation, logged-in member entry, random draw +
  audit log, winners history.
- **M5 — Predictions & Watch Parties**: fixture management, prediction
  submission + scoring + leaderboard, watch party listing/browsing by state.
- **M6 — Hardening**: rate limiting, NDPR pass, admin action audit log,
  Sentry on both apps, e2e tests, WhatsApp session-recovery runbook.

## 11. Verification / Testing Plan

Each milestone below is checked end-to-end before moving to the next:

- **M0**: `pnpm install` succeeds across the workspace; `supabase link` +
  first migration apply cleanly against the Supabase project; generated
  TypeScript types compile in both `apps/web` and `apps/wa-bot`.
- **M1**: register a test member end-to-end (form → Turnstile → DB row as
  `pending`) → admin approves → `activity_tier` set, `anc_number` assigned,
  fan-pass card renders correctly → member logs in via magic link and sees
  their own profile (and cannot edit `activity_tier`/`registration_status`).
- **M2**: manually trigger `/api/cron/birthdays` against a seeded test
  member with today's birthday; confirm exactly one email arrives (Resend
  dashboard or test inbox) and one WhatsApp group message posts with a
  correct `@mention` of the celebrant (checked against the real test group);
  re-run the cron and confirm no duplicate send (idempotency).
- **M2 (news digest)**: manually trigger the news-digest job; confirm it
  fetches and dedupes stories from at least two sources, the Claude Haiku
  summary reads coherently with correct source links, exactly one message
  posts to the test group, and a `news_digest_log` row is created; re-run
  same-day and confirm no duplicate post; simulate a zero-story day and
  confirm the job skips sending rather than posting an empty digest.
- **M3**: send a test newsletter to a small filtered audience; confirm
  `newsletter_deliveries` rows update to `sent` and check inbox delivery.
- **M4**: run a full giveaway cycle against seeded entries — open, close,
  draw — confirm `giveaway_winners` + `giveaway_audit_log` rows are correct
  and the winner notification fires.
- **M5**: create a test fixture, submit predictions as two seeded members,
  enter an actual result as admin, confirm `points_awarded` computes
  correctly for each prediction type and the leaderboard reflects it; create
  a watch party for a given state and confirm it's only visible/filterable
  to members browsing that state.
- **M6**: kill the `wa-bot` process on the Oracle Cloud VM and confirm
  systemd restarts it and Baileys reconnects using the persisted session
  (no re-scan needed); trigger rate-limiting on the public registration
  endpoint and confirm it blocks as expected; walk through the NDPR
  opt-out/deletion flow as a test member and confirm the row is removed
  (or anonymized, per whatever the final deletion policy is).

## 12. Open Questions / Risks

All prior open items have been resolved and folded into their respective
sections above (news digest sources/cadence in §4.8, prediction scoring in
§4.5, watch party moderation in §4.6, Digital Fan Pass distribution in §4.1,
giveaway multi-winner/re-draw in §4.3, WhatsApp group JID setup in §5). No
open items remain as of this revision; new ones will be added here if they
come up during scaffolding/build.
