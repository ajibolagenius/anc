# Arsenal Nigeria Community (ANC) — UI Surface Inventory

## 1. Purpose & Scope

`PRD.md` defines *what* the platform does. This document is its companion:
a complete inventory of every **page, layout shell, modal/dialog pattern,
and reusable UI primitive** the product needs — whether it's built,
half-built, or not started — so gaps are visible in one place instead of
being discovered page by page.

Scope is `apps/web` (the Next.js app). `apps/wa-bot` has no UI (it only
posts plain-text WhatsApp messages) and is out of scope here.

**Status legend**: ✅ Implemented · ⚠️ Partial / needs work · ❌ Missing

---

## 2. Design Foundations ("UI Kit")

There is **no component library** in this codebase — no shadcn/ui, no
Radix, no Headless UI, no Material/Chakra/Ant. Every page hand-writes
Tailwind utility strings directly on native HTML elements (`<button>`,
`<select>`, `<table>`), and the only shared pieces are a handful of small
files under `apps/web/src/components/`. This is fine at the current size
but means there's no single source of truth for a button, badge, or card —
each page repeats (and can drift from) the same class strings.

| Foundation | Where | Status |
|---|---|---|
| Color tokens | `app/globals.css` — `--arsenal-red #DB0007`, `--arsenal-red-bright #FF1A24`, `--arsenal-gold #9C824A`, `--arsenal-navy #023474`, `--arsenal-navy-deep #01142E`, `--whatsapp-green #25D366`, plus `--background/--surface/--surface-border/--foreground/--muted` semantic aliases | ✅ |
| Typography | `Bebas_Neue` (display, `.font-display`) + `Manrope` (body), loaded via `next/font/google` in `app/layout.tsx` | ✅ |
| Iconography | `components/icons.tsx` — 18 hand-drawn inline SVGs (Chat, ArrowRight, Gift, Calendar, MapPin, Cake, Bell, Shield, Trophy, Users, Lock, Gear, UsersList, Mail, Activity, Menu, X, Sparkle) | ✅ but ❌ no icon library — every new icon is a hand-drawn SVG; `BellIcon` is defined but **never used anywhere** (no notifications feature) |
| Motion | Three CSS keyframe utilities in `globals.css`: `animate-fade-in-up`, `animate-glow`, `animate-float` | ⚠️ only used on the public homepage; zero motion anywhere in the admin/portal apps (no skeleton shimmer, no transition on route change, no list-item enter animation) |
| Texture/decoration | `.texture-dots`, `.icon-spotlight`, `.section-glow-*`, `.stat-gradient` utility classes | ✅ marketing-page-only |
| `PageHeader` | `components/page-header.tsx` — icon + title + optional subtitle + colored "spotlight" glow behind the icon | ✅ used on every admin/portal interior page |
| `FormField` + `inputClassName` | `components/form-field.tsx` — label/error/optional wrapper + one shared input/select/textarea class string | ✅ used everywhere a form exists |
| `SidebarShell` | `components/sidebar-shell.tsx` — turns a fixed sidebar into a mobile slide-in drawer (backdrop + hamburger + auto-close on navigation) | ✅ shared by both admin and portal shells |
| `SidebarLink` | `components/sidebar-link.tsx` — active-route-aware nav item | ✅ |
| `SignOutButton` | **Duplicated**: `components/sign-out-button.tsx` (no props, hardcoded `/admin/login` redirect) vs. `app/admin/(protected)/sign-out-button.tsx` (no props, same hardcoded redirect) vs. the portal layout importing the shared one with a `redirectTo` prop it doesn't accept in one of the two copies | ⚠️ two near-identical files; should be one component with a `redirectTo` prop |

**Missing UI-kit primitives** (needed by more than one page today, built ad hoc every time or not at all):

- ❌ **Button** — every button is a hand-written `rounded-full bg-arsenal-red px-6 py-3...` string, duplicated dozens of times with minor drift (padding/scale-on-hover vary slightly page to page)
- ❌ **Badge/Pill** (status chips like "pending", "sent", "disqualified") — always a bespoke `<span>`
- ❌ **Card** — the `rounded-2xl border border-surface-border bg-surface/40 p-5` pattern is repeated on nearly every page by hand
- ❌ **Table** — every admin table is a full hand-rolled `<table>` with its own header/empty-state markup; no shared `<DataTable>` with built-in empty/loading/sort states
- ❌ **Select / Combobox** — native `<select>` styled via `inputClassName` everywhere; no searchable/multi-select
- ❌ **Toast / Snackbar** — no feedback system at all (see §9)
- ❌ **Modal / Dialog / Drawer** (content overlay, not the mobile nav drawer) — zero exist (see §9)
- ❌ **Tooltip / Popover**
- ❌ **Tabs** — the Members status filter (`/admin/members`) hand-rolls tab-like `<Link>`s instead of a reusable `<Tabs>`
- ❌ **Skeleton / Spinner** — no loading UI anywhere; server components just resolve or the page is blank

---

## 3. Layout Shells

| Shell | File | Notes |
|---|---|---|
| Root | `app/layout.tsx` | Fonts + metadata only, no chrome |
| Public marketing | `app/page.tsx` (inline header/footer, not a real `layout.tsx`) | Sticky blurred header, footer with community/legal link columns |
| Admin | `app/admin/(protected)/layout.tsx` | `SidebarShell` + nav (Members, Giveaways, Newsletters, Matches, Watch Parties, Automations) + `BotHealth` indicator + admin identity + sign-out |
| Member portal | `app/portal/layout.tsx` | `SidebarShell` + nav (Fan Pass, Giveaways, Predictions, Leaderboard, Watch Parties, Settings) + member identity + sign-out |
| Auth pages | No shared layout — `/login` and `/admin/login` each independently reimplement the same centered-card-with-glow page shell | ⚠️ candidate for a shared `AuthShell` |

Gaps:
- ❌ No breadcrumbs anywhere (flat one-level nav, so low priority today — would matter once giveaway/newsletter/match detail pages get deeper)
- ❌ No global search (admin or portal)
- ❌ No notification bell / activity inbox for either admins or members, despite `BellIcon` existing
- ❌ No `not-found.tsx`, `error.tsx`, or `loading.tsx` anywhere in the route tree — a thrown Server Action error or an unmatched route falls through to Next.js's default (unstyled) error/404 page, breaking the brand experience
- ❌ No dark/light theme toggle (app is dark-only by design — fine, just noting it's not a "missing" gap, it's intentional)

---

## 4. Public / Marketing Pages

| Route | Status | What's there |
|---|---|---|
| `/` | ✅ | Sticky header, hero with two CTAs, animated stat band, 6-tile feature bento grid, 3-step "how it works", quiet leaderboard teaser card, closing CTA band, footer |
| `/register` | ✅ | 3-section card form (About you / Nigeria / Arsenal side) built on `FormField`, honeypot anti-bot field, NDPR consent checkbox, `useActionState` pending/error states, dedicated success screen with a numbered "what happens next" list |
| `/privacy` | ✅ | Static NDPR privacy notice, 5 sections |

Gaps vs. what a fan-facing marketing site typically needs:
- ❌ No public giveaway-winners showcase (all giveaway data is gated behind `/admin` or `/portal`)
- ❌ No public read-only leaderboard/watch-party pages for a visitor who isn't a member yet (both are portal-only) — the homepage's leaderboard "teaser" card is just a link to `/login`, not an actual preview
- ❌ No `/about` / community-story page
- ❌ No public FAQ page (registration flow, jersey sizing, giveaway rules, etc. aren't documented anywhere public)

---

## 5. Auth Pages

| Route | Status | Notes |
|---|---|---|
| `/login` (member) | ✅ | Email input → Supabase magic-link OTP, inline `idle/sending/sent/error` state machine |
| `/admin/login` | ✅ | Same pattern, near-duplicate markup of `/login` with a different icon/copy |
| `/auth/callback`, `/admin/auth/callback` | ✅ (route handlers) | No UI — token exchange + redirect |

Gaps:
- ⚠️ `/login` and `/admin/login` are ~90% identical JSX — worth extracting a shared `AuthCard`/`MagicLinkForm` component
- ❌ No "resend link" affordance once in the `sent` state
- ❌ No password-based fallback (intentional per PRD — magic-link only)

---

## 6. Member Portal (`/portal/*`)

| Route | Status | What's there | Gaps |
|---|---|---|---|
| `/portal` | ✅ | Redirects to `/portal/giveaways` | — |
| `/portal/fan-pass` | ✅ | Renders the server-generated Fan Pass PNG (`/api/fan-pass/[token]`), membership number, save/share instructions; "still generating" empty state if not yet approved/numbered | ❌ no "regenerate/refresh card" action, ❌ no direct "share to WhatsApp/X" button (relies on manual long-press save) |
| `/portal/giveaways` | ✅ | Card list per giveaway with status pill, contextual CTA (Enter / already entered / won / not eligible / closed) | ❌ no giveaway detail/history page, ❌ no "past giveaways I entered" archive separate from the flat list |
| `/portal/predictions` | ✅ | Upcoming fixtures with an inline predict form (home/away score + optional scorer) once per match; past-results list showing your prediction + points earned | ❌ no countdown-to-kickoff, ❌ no edit-after-submit (predictions are write-once), ❌ no per-match "how prediction points work" tooltip |
| `/portal/leaderboard` | ✅ | Ranked table (medal emoji for top 3, points, matches scored) | ❌ no pagination (fine at current scale), ❌ no "your rank" highlight if you're outside a visible top-N (not an issue yet since it's unpaginated, but will be) |
| `/portal/watch-parties` | ✅ | State filter chips (All / My state), approved-listing cards, "your pending/rejected submissions" section, submission form gated to `active`-tier members | ❌ no map view (list-only, despite each listing carrying a `map_link`), ❌ no way to edit/withdraw your own pending submission |
| `/portal/settings` | ⚠️ | Read-only name/tier display + a "Danger zone" delete-account flow | ❌ **no profile-edit form at all** — despite the PRD (§3, §7) explicitly calling for a member profile page members can "view/edit," a member currently cannot update their WhatsApp number, email, jersey size, favorite players, or state of residence anywhere in the UI once registered |

---

## 7. Admin Dashboard (`/admin/*`)

| Route | Status | What's there | Gaps |
|---|---|---|---|
| `/admin` | ✅ | Redirects to `/admin/members` | ❌ no actual overview/stats dashboard (member counts, pending queue size, upcoming fixtures, open giveaways at a glance) |
| `/admin/members` | ✅ | Status tabs (pending/approved/rejected/suspended/all), search + tier/state filters, CSV export button, table with inline Approve(+tier)/Reject actions | ❌ no pagination (unbounded query — will degrade once the directory grows), ❌ no bulk approve/reject, ❌ no member detail/edit page (admins can't correct a typo'd phone number, reassign tier later, or view a single member's full history in one place), ❌ Reject fires with **zero confirmation** |
| `/admin/giveaways` | ✅ | Create-giveaway form (title/description/type/eligible tiers) + list table with entry counts | ❌ no pagination |
| `/admin/giveaways/[id]` | ✅ | Lifecycle buttons (Open → Close → Draw N winners → Mark completed), winners table with per-winner Disqualify & redraw, scrollable entries table, audit log feed | ❌ the "draw" is an instant DB write with no reveal/suspense moment — for something explicitly meant to feel fair and exciting to the community, there's no animation, countdown, or drumroll state, ❌ Disqualify fires with only a free-text reason field, no confirmation step |
| `/admin/newsletters` | ✅ | List with status + sent timestamp | ❌ no pagination |
| `/admin/newsletters/new` | ✅ | Subject + plain-textarea body, optional tier/state audience filter, optional "also post to WhatsApp" with its own summary textarea | ❌ plain `<textarea>` only — no rich text/WYSIWYG editor despite the PRD (§6) naming **React Email** as the intended templating approach (actual implementation is hand-built HTML string wrapping, see §10) |
| `/admin/newsletters/[id]` | ✅ | Live HTML email preview (rendered on a white card to mimic an inbox), Send/Retry button, per-recipient delivery status table | ❌ no scheduled-send UI (PRD's `newsletters.status` supports `scheduled` but there's no date/time picker anywhere), ❌ no pagination on deliveries |
| `/admin/matches` | ✅ | Create-fixture form (opponent/competition/kickoff datetime), table with prediction counts | — |
| `/admin/matches/[id]` | ✅ | Enter/update actual result form, predictions table sorted by points | — |
| `/admin/watch-parties` | ✅ | Create-listing form (auto-approved), a distinct "Pending approval" card section with Approve/Reject, full listings table | ❌ Reject fires with zero confirmation |
| `/admin/automations` | ✅ | Manual "Send birthdays now" / "Send news digest now" test buttons (raw JSON result dump), recent-birthday-notifications table, recent-news-digest table, admin action audit log | ❌ **no birthday calendar view** — the PRD (§4.7) explicitly calls for one; today the closest thing is a flat list of already-sent notifications, there's no forward-looking "who has a birthday this week/month" view |
| *(no route)* | ❌ | — | **No admin-user management page** — `admin_users` has no UI at all; granting/revoking dashboard access is a manual DB/migration operation, not something an admin can do from the app |

---

## 8. Modals, Dialogs & Confirmation Patterns

This deserves its own section because the finding is stark: **there is no
modal/dialog primitive anywhere in this codebase** — no `<dialog>` element,
no portal-rendered overlay, nothing resembling a Radix/shadcn `Dialog`.
Every "are you sure" moment that exists today is either a full page
navigation, an inline state swap, or (most commonly) doesn't exist at all.

| Interaction | Current pattern | Status |
|---|---|---|
| Delete my account (`/portal/settings`) | Two-step **inline confirm**: click reveals a warning paragraph + Confirm/Cancel buttons in place, via `useState` (`_delete-account-button.tsx`) | ⚠️ works, but isn't a reusable pattern — copy/pasted logic, not a component |
| Reject member (`/admin/members`) | Single click, **no confirmation of any kind** | ❌ |
| Reject watch party (`/admin/watch-parties`) | Single click, **no confirmation** | ❌ |
| Disqualify & redraw a giveaway winner | Free-text reason field + submit, **no "are you sure"** | ❌ |
| Sign out | Single click, immediate | ✅ acceptable (low-risk, reversible) |
| Mobile nav | `SidebarShell`'s slide-in drawer + backdrop-click-to-close | ✅ the only true overlay in the app, but it's navigation chrome, not a content dialog |
| Newsletter email preview | Rendered inline in the page flow, not a modal | ✅ fine as-is |

**Missing, in priority order:**

1. ❌ **`ConfirmDialog` component** — every destructive/irreversible-ish admin action (reject a member, reject a watch party, disqualify a winner) currently fires on a single click with no undo. Highest-priority gap given these actions touch real people's membership status.
2. ❌ **Toast/snackbar system** — Server Actions redirect or `revalidatePath` silently; the only feedback a user gets is the page re-rendering (a row disappearing, a status pill changing) or, on failure, an unhandled thrown error surfacing Next.js's raw error overlay. There is no "Approved ✓" / "Something went wrong" transient message anywhere.
3. ❌ **Generic error boundary** (`error.tsx`) — pairs with the above; right now a thrown Server Action error has no friendly recovery UI.
4. ❌ **A real content `Dialog`/`Drawer`** for anything that will eventually need to happen "on top of" a page without a full navigation — e.g. a future member quick-edit, a giveaway winner detail popup, or an image/avatar cropper.

---

## 9. Non-Page UI Surfaces

| Surface | File | Notes |
|---|---|---|
| Digital Fan Pass image | `app/api/fan-pass/[token]/route.tsx` | Server-rendered PNG via `next/og`'s `ImageResponse` (Satori), Arsenal gradient card with initials avatar, name, state, ANC number, member-since date. Publicly reachable via an expiring random token — correct by design since it's meant to be shared to WhatsApp Status/X. |
| Transactional emails | `lib/email-template.ts` | Three hand-built HTML-string templates: newsletter wrapper, member-approved welcome, birthday wish — all closing with the shared signature block from `packages/shared`. ⚠️ **Deviates from PRD §6**, which specifies Resend **+ React Email**; the actual implementation is plain string interpolation, not React Email components. Functionally fine, but worth reconciling the PRD or migrating if richer email layouts are ever needed. |
| WhatsApp bot messages | `apps/wa-bot` (out of scope) | Plain text only — birthday shoutouts, news digest, newsletter summaries, giveaway-winner announcements. No "UI" per se, but shares the same signature-block convention as email. |

---

## 10. Gap Summary — Prioritized

1. **`ConfirmDialog` primitive** — reject member / reject watch party / disqualify winner all fire irreversibly on one click.
2. **Toast/feedback system** + **`error.tsx` boundary** — no success/failure feedback loop anywhere; thrown errors are unstyled.
3. **Member profile-edit form** (`/portal/settings`) — PRD calls for view/edit; only delete exists today.
4. **Admin-user management page** — `admin_users` is DB-only; no in-app way to grant/revoke dashboard access.
5. **Birthday calendar view** (`/admin`) — PRD-specified, not built; only a retrospective notifications log exists.
6. **Pagination** on every admin/portal table (members, giveaways, newsletters, deliveries, leaderboard) — currently unbounded queries.
7. **Custom `not-found.tsx`** — no branded 404.
8. **Shared `Button`/`Badge`/`Card` primitives** — reduce the copy-pasted Tailwind strings before the page count grows further.
9. **Admin overview/stats dashboard** (`/admin` currently just redirects) — at-a-glance counts (pending members, open giveaways, upcoming fixtures).
10. **Giveaway draw "moment"** — the fairness story (crypto-random, audited) deserves a reveal animation, not an instant table update.
11. **Watch-party map view** — every listing has a `map_link`; there's no embedded/aggregate map, list-only.
12. Consolidate the **duplicated `SignOutButton`** and near-duplicate **auth pages** into shared components.

---

## 11. Full Route Inventory (Appendix)

| Route | Audience | Status |
|---|---|---|
| `/` | Public | ✅ |
| `/register` | Public | ✅ |
| `/privacy` | Public | ✅ |
| `/login` | Public → member | ✅ |
| `/auth/callback` | — (handler) | ✅ |
| `/portal` | Member | ✅ (redirect) |
| `/portal/fan-pass` | Member | ✅ |
| `/portal/giveaways` | Member | ✅ |
| `/portal/predictions` | Member | ✅ |
| `/portal/leaderboard` | Member | ✅ |
| `/portal/watch-parties` | Member | ✅ |
| `/portal/settings` | Member | ⚠️ (view + delete only) |
| `/admin/login` | Public → admin | ✅ |
| `/admin/auth/callback` | — (handler) | ✅ |
| `/admin` | Admin | ✅ (redirect only, no dashboard) |
| `/admin/members` | Admin | ✅ |
| `/admin/giveaways` | Admin | ✅ |
| `/admin/giveaways/[id]` | Admin | ✅ |
| `/admin/newsletters` | Admin | ✅ |
| `/admin/newsletters/new` | Admin | ✅ |
| `/admin/newsletters/[id]` | Admin | ✅ |
| `/admin/matches` | Admin | ✅ |
| `/admin/matches/[id]` | Admin | ✅ |
| `/admin/watch-parties` | Admin | ✅ |
| `/admin/automations` | Admin | ✅ |
| `/admin/members/export` | Admin (API) | ✅ |
| `/api/fan-pass/[token]` | Public (tokenized) | ✅ |
| `/api/admin/bot-health` | Admin (API) | ✅ |
| `/api/cron/birthdays` | System | ✅ |
| `/api/cron/news-digest` | System | ✅ |
| *(admin user management)* | Admin | ❌ not built |
| *(member profile edit)* | Member | ❌ not built |
| *(birthday calendar)* | Admin | ❌ not built |
| *(public giveaway winners / leaderboard preview)* | Public | ❌ not built |
| `not-found` / `error` / `loading` | All | ❌ not built anywhere |
