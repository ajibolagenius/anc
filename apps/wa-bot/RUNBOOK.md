# wa-bot session-recovery runbook

The ANC WhatsApp bot (`apps/wa-bot`) is the single most fragile part of this
platform — it holds one persistent WhatsApp Web session via Baileys, which
WhatsApp can invalidate at any time (device limits, anti-automation
detection, or the operator manually logging the linked device out). This
doc covers every failure mode and the exact recovery step for each.

## How to tell something's wrong

- **`GET /internal/health`** (unauthenticated, safe for uptime monitors)
  returns `{ connection, lastConnectedAt, lastDisconnectReason }`. The admin
  dashboard's "Bot Health" widget (`/admin`) polls this every 30s.
- **Sentry** (once `SENTRY_DSN` is set — see `.env.example`) captures an
  `error`-level message the moment the bot is logged out, and captures any
  unhandled exception. This is the "page a human" signal — see below.

## Failure mode 1: transient disconnect (network blip, WhatsApp server hiccup)

**Symptom:** `connection: "close"`, `lastDisconnectReason` is something like
`disconnected (code 428)`, not `"logged_out"`.

**What happens automatically:** `whatsapp.ts`'s `connection.update` handler
calls `connectToWhatsApp()` again immediately — Baileys resumes using the
same persisted auth state (`WA_AUTH_DIR`, default `./auth`), no QR re-scan
needed. This is the common case and needs no human intervention.

**If it keeps looping:** check the VM's network connectivity and
`journalctl -u anc-wa-bot -f` for repeated disconnects — this usually means
an actual outage on the host, not a WhatsApp-side problem.

## Failure mode 2: process crash

**What happens automatically:** systemd's `Restart=on-failure` /
`RestartSec=5` (see `deploy/anc-wa-bot.service`) restarts the process within
5 seconds. Baileys reconnects using the persisted auth state on boot, same
as failure mode 1 — still no QR re-scan needed, since the session lives in
`WA_AUTH_DIR` on disk, not in process memory.

**Verify:** `systemctl status anc-wa-bot` and `curl localhost:8787/internal/health`.

## Failure mode 3: logged out (needs a human)

**Symptom:** `lastDisconnectReason: "logged_out"`. This fires when the
linked device is removed from the phone's WhatsApp (Settings → Linked
Devices), the number is banned/restricted, or WhatsApp's anti-automation
system force-logs-out the session. **This is the one case that never
self-heals** — Baileys deliberately does NOT attempt to reconnect on
`logged_out` (see the `if (loggedOut) { ...; return; }` branch in
`whatsapp.ts`), because retrying with an invalidated session just spins
forever.

**This is what Sentry alerts on** (`Sentry.captureMessage("wa-bot logged
out — needs QR re-pair", "error")`) — treat a Sentry alert from wa-bot as a
"go re-pair the bot" task, not a "go investigate a bug" task.

**Recovery steps:**
1. SSH into the VM.
2. Stop the service: `sudo systemctl stop anc-wa-bot`
3. Delete the stale session: `rm -rf /opt/anc/apps/wa-bot/auth`
4. Run the bot interactively so you can scan the QR code:
   `cd /opt/anc && pnpm --filter @anc/wa-bot start`
5. On the **dedicated ANC bot number's phone** (never an admin's personal
   number — see PRD §9), scan the QR code printed in the terminal via
   WhatsApp → Linked Devices → Link a Device.
6. Once you see `wa-bot connected.` in the terminal, `Ctrl+C` and restart
   under systemd: `sudo systemctl start anc-wa-bot`
7. Confirm via `curl localhost:8787/internal/health` → `"connection":"open"`,
   and via the admin dashboard's Bot Health widget.

## Failure mode 4: WA_GROUP_JID changes or is wrong

If the ANC group is ever recreated (not just renamed), its JID changes and
every send will fail with a clear error surfaced through
`wa_bot_message_log`/`news_digest_log`/`birthday_notifications` (the
`sendWhatsAppGroupMessage` wrapper never throws — failures are always
logged, never silent). Get the new JID from the bot's own logs the next
time it receives a message in the group (Baileys logs the remoteJid of
incoming messages at higher log levels), update `WA_GROUP_JID` in
`apps/wa-bot/.env`, and restart the service.

## Why this design is resilient by default

- **Low message volume** (a handful of batched messages a day — birthdays,
  news digest, occasional newsletter/giveaway announcements) keeps the
  bot's automation-detection risk profile low.
- **A dedicated/burner number**, never an admin's personal WhatsApp,
  bounds the blast radius of a ban to the bot alone.
- **Every send path is best-effort and logged**, never blocking a more
  reliable channel (e.g. birthday emails still go out via Resend even if
  WhatsApp is down) — see `sendWhatsAppGroupMessage` in
  `apps/web/src/lib/wa-bot-client.ts`.
