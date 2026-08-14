# Arsenal Nigeria Community (ANC) — UI Inventory & Component Spec

Companion to `PRD.md`. Where the PRD says *what the product does*, this
document says *what screen, overlay, or piece of UI kit that requires* —
and whether it exists in `apps/web` today. Audited directly against the
codebase on 2026-08-14.

**Status legend**
- ✅ Built — matches or reasonably covers the need
- ⚠️ Partial — exists but incomplete, inline where it should be an overlay, or missing a piece the PRD implies
- ❌ Missing — no implementation at all

---

## 1. UI Kit Foundation

### 1.1 Design tokens — ✅ defined

`apps/web/src/app/globals.css`, Tailwind v4 `@theme inline`:

| Token | Value | Use |
|---|---|---|
| `--arsenal-red` | `#DB0007` | primary brand / CTAs |
| `--arsenal-red-bright` | `#FF1A24` | hover/glow accents, error text |
| `--arsenal-gold` | `#9C824A` | secondary accent, pending/warning states |
| `--arsenal-navy` | `#023474` | surfaces |
| `--arsenal-navy-deep` | `#01142E` | page background |
| `--whatsapp-green` | `#25D366` | WhatsApp-linked actions, "connected" status |
| `--surface`, `--surface-border`, `--foreground`, `--muted` | — | card/text neutrals |
| `--font-display` (Bebas Neue) / `--font-body` (Manrope) | — | headings / body |

Custom utilities: `.texture-dots`, `.icon-spotlight`, `.section-glow-red/gold`,
`.stat-gradient`, `animate-fade-in-up` / `animate-glow` / `animate-float`.
Single dark theme by design — no light mode, no theme toggle.

**Gap:** tokens are solid, but there is no component layer on top of them.
No `shadcn`/Radix/Headless UI or any other kit is installed — every button,
card, pill, and input is hand-styled Tailwind, repeated inline at each call
site. That repetition is the single biggest structural gap in this
inventory (see §4).

### 1.2 Primitives that exist

| Component | File | What it does |
|---|---|---|
| `FormField` | `components/form-field.tsx` | Label + `<input>`/`<select>`/`<textarea>` + inline error text. The only real input primitive in the app — used inconsistently (admin forms mostly bypass it and hand-roll labels). |
| `PageHeader` | `components/page-header.tsx` | Icon tile (with `.icon-spotlight` glow, colorable) + title + optional subtitle. Used consistently across every portal and admin page. |
| `SidebarShell` | `components/sidebar-shell.tsx` | Responsive nav shell: desktop fixed sidebar + mobile hamburger drawer (backdrop, slide-in `<aside>`, close on backdrop click or X). Shared by portal and admin. |
| `SidebarLink` | `components/sidebar-link.tsx` | Nav item with active-route highlighting via `usePathname`. |
| `SignOutButton` | `components/sign-out-button.tsx` | Text link, calls `supabase.auth.signOut()`. Duplicated separately for admin. |
| `icons.tsx` | `components/icons.tsx` | Flat set of hand-drawn SVG icons — no icon library. |
| `BotHealth` | `admin/(protected)/_components/bot-health.tsx` | Polls `/api/admin/bot-health` every 30s; colored dot + status text (connected/not-paired/offline). This **is** the PRD's bot-health indicator, correctly implemented. |
| `global-error.tsx` | `app/global-error.tsx` | Root error boundary — exists. |

### 1.3 Primitives that do **not** exist yet

These are needed by multiple pages already built (not hypothetical future
work) — each is currently reimplemented inline, differently, at every call
site:

| Missing primitive | Where it's needed today (already duplicated) |
|---|---|
| `Button` (primary / secondary / danger / ghost, with a `pending` state) | Every page — register, login×2, giveaways, predictions, watch-parties, every admin form |
| `Card` / `SectionCard` | Register form groups it locally; giveaway cards, watch-party cards, member cards all hand-styled per page |
| `Badge` / `StatusPill` | Registration status, activity tier, giveaway status, delivery status, watch-party status — five different inline pill implementations |
| `Select` (styled) | Tier/state filters, jersey size, audience filters — raw `<select>` + `inputClassName` everywhere |
| `Checkbox` | Consent checkbox, eligibility-tier checkboxes, "also post to WhatsApp" — no shared control |
| `Table` (generic, sortable, paginated) | Members, giveaway entries/winners, deliveries, predictions, audit logs — six hand-rolled tables, none paginated |
| `Modal` / `Dialog` | **Zero exist anywhere in the app.** See §3 — this is the largest single gap. |
| `ConfirmDialog` | Needed for every destructive/irreversible admin action (see §3) |
| `Toast` / notification system | **Zero exist.** All feedback today is inline text that replaces the page/section — no transient, non-blocking success/error messaging anywhere |
| `Skeleton` / loading spinner | No loading state anywhere except one `useTransition`-driven button (`AutomationTestButtons`); no page shows a skeleton while data loads |
| `EmptyState` (component, not just text) | Every list page has a plain "No X yet" text line — never a designed empty state |
| `Pagination` | No page paginates — Members, Giveaways, Matches, Newsletters, Watch Parties, Leaderboard all load full result sets |
| `Tabs` | Admin members status filter is plain underlined `<Link>`s (full page reload), not a real tab component |
| `Calendar` / date-grid | Needed for the PRD's birthday calendar view (§4.7) — doesn't exist in any form |
| Avatar / image upload control | Fan Pass avatar is initials-only; no photo upload UI exists anywhere |

---

## 2. Page Inventory

### 2.1 Public / Marketing

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/` | Landing page | ✅ Built | Sticky header, animated hero, stat band, feature bento grid, "how it works", leaderboard teaser (static, not live data), closing CTA, footer with attribution. No live counts pulled from DB despite the data existing. |
| `/privacy` | Privacy notice (NDPR) | ✅ Built | Static prose, sectioned. |

### 2.2 Auth

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/login` | Member magic-link sign-in | ✅ Built | `idle→sending→sent→error` state machine, single email field, inline error, success swaps to "check your email". |
| `/admin/login` | Admin magic-link sign-in | ⚠️ Partial | Functionally identical to `/login`, copy-pasted rather than a shared `<MagicLinkForm variant="member"\|"admin">`. |
| `/auth/callback` | Member OTP exchange + redirect | ✅ Built | No UI (route handler). |
| `/admin/auth/callback` | Admin OTP exchange + redirect | ✅ Built | No UI (route handler). |

### 2.3 Registration

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/register` | Member registration form | ⚠️ Partial | Full PRD §4.1 field set present (name, WhatsApp, email, birthday day/month, state origin/residence, favorite players, jersey size, self-reported tier, consent). Honeypot + rate-limit (5/hr/IP) + `libphonenumber-js` validation server-side. Inline field errors, banner for top-level errors, success state replaces form with numbered next-steps. **Missing: Cloudflare Turnstile** — named explicitly in PRD §6/§9 as the anti-abuse mechanism, not present anywhere in the codebase (verified via grep, zero hits). No client-side/live validation beyond native HTML attributes. |

### 2.4 Member Portal (`/portal/**`)

Layout: session-gated (`getMemberSession()`), `SidebarShell` + 6 nav links
(Fan Pass, Giveaways, Predictions, Leaderboard, Watch Parties, Settings) +
member name/tier footer + sign-out.

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/portal` | Portal home | ❌ Missing | Bare `redirect("/portal/giveaways")` — no actual dashboard (no summary of upcoming predictions, open giveaways, birthday countdown, fan-pass shortcut). |
| `/portal/fan-pass` | View/share Digital Fan Pass | ⚠️ Partial | Renders server-generated PNG (`next/og` `ImageResponse`, gradient card, initials avatar, name/state/ANC number/member-since) via `<img>`. Instructional copy only ("press and hold to save") — **no `navigator.share()`, no Download button, no Copy-link button**, no loading shimmer while the image streams. |
| `/portal/giveaways` | Browse/enter giveaways | ✅ Built | Status-pill cards, server-computed CTA state (enter/entered/won/ineligible/closed), plain form-button entry (no confirm needed — low stakes), empty state. No pagination. |
| `/portal/predictions` | Submit match predictions | ✅ Built | Upcoming/Past sections, inline per-match prediction form, read-only once submitted, points shown for past matches. No kickoff countdown or "locks at kickoff" visual cue. |
| `/portal/leaderboard` | Season points leaderboard | ⚠️ Partial | Plain `<table>`, medal emoji top 3. No pagination, no search, no "your rank" highlight — fine at current scale, will need it. |
| `/portal/watch-parties` | Browse/submit watch parties | ⚠️ Partial | Approved listings as cards; "your submissions" status list (no edit/withdraw action); submission form gated to `active` tier, shown inline. State filter is two shortcut pills ("All" / "My state") via query param — **no way to browse an arbitrary one of the 36 states without hand-editing the URL**. No map — it's a filtered list despite "Locator" naming. |
| `/portal/settings` | Profile summary + account deletion | ⚠️ Partial | Member summary card + "danger zone" delete flow (the one real confirm-style interaction in the whole portal — see §3). **No profile-editing UI at all** — members cannot update jersey size, favorite players, or state after registering. |

### 2.5 Admin Dashboard (`/admin/(protected)/**`)

Layout: same `SidebarShell` pattern, 6 nav links (Members, Giveaways,
Newsletters, Matches, Watch Parties, Automations) + `BotHealth` + sign-out.

| Route | Purpose | Status | Notes |
|---|---|---|---|
| `/admin` | Admin home | ❌ Missing | Bare `redirect("/admin/members")` — no overview page (pending-count, open giveaways, bot status, upcoming fixtures at a glance). |
| `/admin/members` | Member directory + approval queue | ⚠️ Partial | Most complete admin page. Status tabs (pending/approved/rejected/suspended/all) as plain links; filter form (search + tier + state, GET params, full reload — no live filtering); 7-column table; inline Approve (with tier select) / Reject actions — **no confirmation on Reject**; CSV export (fully spec-compliant, incl. formula-injection guarding). No pagination. |
| `/admin/giveaways` | List + create giveaways | ✅ Built | Inline "new giveaway" form above the table (not a modal); table with entry counts; empty state. |
| `/admin/giveaways/[id]` | Giveaway lifecycle + draw | ⚠️ Partial | State-machine actions (Open → Close → Draw → Complete) via `crypto.randomInt` Fisher-Yates — this **is** the PRD's randomizer/draw UI, correctly implemented server-side. Winners table with inline "disqualify & redraw" form. Entries table (scrollable). Audit log renders raw `JSON.stringify` blobs, not formatted text. **No confirmation dialog on any lifecycle action**, including closing entries or drawing winners. |
| `/admin/matches` | Fixture management | ✅ Built | Inline "new fixture" form, table with prediction counts. |
| `/admin/matches/[id]` | Enter result + review predictions | ⚠️ Partial | Result-entry form (also triggers point computation). Predictions table sorted by points. **No admin leaderboard view** — leaderboard exists member-side only; PRD §4.7's "predictions/fixtures management **and leaderboard view**" is half-built. |
| `/admin/newsletters` | Newsletter list | ✅ Built | Table + "New newsletter" link (navigates to a separate page, not a modal). |
| `/admin/newsletters/new` | Compose newsletter | ✅ Built | Subject, body textarea, tier/state audience filters, conditional "also post to WhatsApp" summary field. Saves as draft only. |
| `/admin/newsletters/[id]` | Preview, send, track delivery | ⚠️ Partial | Genuine rendered-HTML email preview (white card on dark theme, deliberate). Delivery status table, color-coded. This **is** the PRD's delivery-status tracking, correctly implemented. **No confirmation before "Send now"** — an irreversible send-to-N-people action. |
| `/admin/watch-parties` | Manage listings + approvals | ⚠️ Partial | Inline "new (auto-approved)" form; distinct gold-bordered "pending approval" card section with inline Approve/Reject — **no confirmation dialog**. |
| `/admin/automations` | Cron/ops visibility | ⚠️ Partial | Manual test-trigger buttons (birthdays, news digest) with `useTransition` + disabled-while-pending — the *only* pending state in the whole admin surface. Results dumped as raw `<pre>{JSON.stringify}</pre>`. Recent-notifications and recent-digests tables, plus a full admin action audit log. **No birthday calendar view** — PRD §4.7 explicitly calls for one; only a flat notification-history table exists. |
| `/admin/login` | see §2.2 | ⚠️ Partial | — |

### 2.6 Non-UI routes (listed for completeness — no screen, but shape UI-adjacent behavior)

`api/fan-pass/[token]` (PNG generator feeding `/portal/fan-pass`),
`api/admin/bot-health` (feeds `BotHealth`), `api/cron/birthdays`,
`api/cron/news-digest`, `auth/callback`, `admin/auth/callback`.

---

## 3. Modal / Overlay Inventory

**Finding: there are zero true modal, dialog, drawer (besides mobile
nav), or popover components anywhere in the codebase** — confirmed by
direct grep across `apps/web/src` for `modal`, `dialog`, `role="dialog"`,
`<dialog`, and `window.confirm` (all zero hits). Every "new X" form is
inline on its list page; every state-changing admin action fires
immediately from a plain `<form action>` button.

### 3.1 What exists today

| Pattern | Where | Type |
|---|---|---|
| Mobile nav drawer | `SidebarShell` (portal + admin) | Real overlay (backdrop + slide-in panel) — the only one in the app |
| Delete-account confirm | `/portal/settings`, local `_delete-account-button.tsx` | **Inline**, not an overlay — `useState` swaps the button for a two-step warning block in place |

### 3.2 Modals that should exist but don't

Grouped by risk — these are actions that are destructive, irreversible, or
send external communications, currently one click with zero confirmation:

| Needed modal | Triggering action | Why it matters |
|---|---|---|
| `ConfirmDialog: Reject member` | `/admin/members` Reject | Rejects a real applicant, no undo path shown |
| `ConfirmDialog: Close giveaway entries` | `/admin/giveaways/[id]` | Locks out further entries irreversibly |
| `ConfirmDialog: Draw winner(s)` | `/admin/giveaways/[id]` | Immediately commits a random, audited outcome |
| `ConfirmDialog: Disqualify & redraw` | `/admin/giveaways/[id]` | Changes a payout outcome |
| `ConfirmDialog: Send newsletter now` | `/admin/newsletters/[id]` | Sends email to every matched recipient, no undo |
| `ConfirmDialog: Approve / Reject watch party` | `/admin/watch-parties` | Public-facing content goes live or is rejected |
| `Dialog: Delete account` (upgrade from inline) | `/portal/settings` | Currently inline; a true modal better matches the weight of the action and prevents accidental confirm via scroll-click |
| `Sheet/Modal: Fan Pass share` | `/portal/fan-pass` | Native share sheet (`navigator.share`) or a share/download modal, replacing "press and hold" instructions |
| `Toast (non-blocking)` for every server-action result | app-wide | Not strictly a "modal," but the same missing category of transient feedback — see §1.3 |

---

## 4. Component Inventory (cross-cutting)

| Category | Exists | Missing / needed |
|---|---|---|
| **Layout & navigation** | `SidebarShell`, `SidebarLink`, `PageHeader`, marketing header/footer (page-local) | `Tabs` (status filters currently plain links), breadcrumb (not needed at current depth) |
| **Forms & inputs** | `FormField`, raw `inputClassName` string, honeypot field | `Button` (variants + pending state), styled `Select`, `Checkbox`, `Textarea` wrapper, phone input mask, `datetime-local` wrapper, avatar/file upload |
| **Data display** | Six page-specific hand-rolled tables, `SectionCard` (register-only) | Generic `Table` (sort/paginate), `Card`, `Badge`/`StatusPill` (5 duplicated inline versions today: registration status, activity tier, giveaway status, delivery status, watch-party status), `StatCard`/stat-chip for dashboard summaries |
| **Feedback & status** | Inline error paragraphs, plain empty-state text, root `global-error.tsx` | `Toast`, `EmptyState` component, `Skeleton`/spinner, pending/disabled button state (only 1 of ~15 action buttons has one) |
| **Overlay** | Mobile nav drawer | `Modal`/`Dialog`, `ConfirmDialog`, dropdown/`Popover` |
| **Ops/data-viz** | `BotHealth` indicator, leaderboard table, delivery-status table | Birthday calendar grid, admin leaderboard view, formatted (non-raw-JSON) audit-log renderer |
| **Brand/media** | Fan Pass server-rendered image card | Native share integration, avatar upload, watch-party map view |

---

## 5. Consolidated Gap Punch List

**A — Missing screens named in the PRD**
1. Admin birthday calendar view (§4.7) — flat table exists, no calendar
2. Admin predictions leaderboard view (§4.7) — member-side only today
3. Watch Party map view (§4.6 "Locator") — currently a filtered list

**B — Missing PRD-named infrastructure**
4. Cloudflare Turnstile on `/register` (§6, §9) — not present at all
5. Member-initiated NDPR deletion/opt-out — account deletion exists; confirm it satisfies the full "opt-out" language in §9, not just deletion

**C — UX risk (no code changes to feature scope, but real gaps)**
6. Zero confirmation dialogs on ~8 destructive/irreversible admin actions (§3.2)
7. Zero toast/notification system — all feedback is inline, page-replacing text
8. Zero loading/pending states on ~14 of ~15 server-action buttons — risk of duplicate submits on slow networks
9. No profile-editing page for members (name/jersey/favorites/state are frozen after registration)
10. No portal or admin home/dashboard — both roots are bare redirects

**D — Consistency / tech debt**
11. `/login` and `/admin/login` are copy-pasted, not a shared component
12. No `Button`/`Card`/`Badge`/`Select` primitives — every instance is duplicated inline Tailwind (5+ duplicated status-pill implementations alone)
13. Audit logs (`giveaway_audit_log`, admin action log) render raw `JSON.stringify` blobs instead of formatted text
14. No pagination anywhere — Members, Giveaways, Matches, Newsletters, Watch Parties, Leaderboard all load full result sets

**E — Scale-readiness (fine today, will bite as membership grows)**
15. Watch-party state filter only offers "All" / "My state" shortcuts, not a real picker across all 36 states
16. No search debouncing / live filtering — admin member search is a full-page GET reload
