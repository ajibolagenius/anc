import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { config } from "./config.js";
import { getStatus, sendGroupMessage } from "./whatsapp.js";

function send(res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const MAX_BODY_BYTES = 64 * 1024; // 64 KB limit for JSON payloads

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    size += buf.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error("Payload too large");
    }
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// Hashing both sides to a fixed-length digest before comparing avoids both a
// naive `===` (variable-time string comparison) and a length-dependent
// timing signal on the raw secret.
const expectedAuthHash = createHash("sha256").update(`Bearer ${config.internalKey}`).digest();

function isAuthorized(req: IncomingMessage): boolean {
  const header = req.headers.authorization ?? "";
  const headerHash = createHash("sha256").update(header).digest();
  return timingSafeEqual(headerHash, expectedAuthHash);
}

// The server binds to loopback only (see startServer), so every caller here
// is either Caddy's reverse proxy or a local process — there's no useful
// per-client IP to key off. This just throttles repeated bad-key attempts
// (e.g. a leaked/guessed key, or a compromised admin session hammering the
// endpoint) regardless of source.
const FAILED_AUTH_WINDOW_MS = 60_000;
const FAILED_AUTH_MAX = 10;
let failedAuthCount = 0;
let failedAuthWindowStart = 0;

function isBlockedByFailedAuthRate(): boolean {
  if (Date.now() - failedAuthWindowStart > FAILED_AUTH_WINDOW_MS) return false;
  return failedAuthCount >= FAILED_AUTH_MAX;
}

function recordFailedAuth(): void {
  if (Date.now() - failedAuthWindowStart > FAILED_AUTH_WINDOW_MS) {
    failedAuthWindowStart = Date.now();
    failedAuthCount = 0;
  }
  failedAuthCount += 1;
}

export function startServer(): void {
  const server = createServer((req, res) => {
    void handleRequest(req, res);
  });

  // Loopback-only: Caddy (or any other public-facing entry point) reverse
  // proxies to this from the same host. Binding "0.0.0.0" here would make
  // the internal API directly reachable on the VM's public IP, bypassing
  // Caddy's TLS termination entirely.
  server.listen(config.port, "127.0.0.1", () => {
    console.log(`wa-bot internal API listening on 127.0.0.1:${config.port}`);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    // Health is intentionally unauthenticated (nothing sensitive in it) so
    // uptime monitors don't need the internal key.
    if (req.method === "GET" && req.url === "/internal/health") {
      send(res, 200, getStatus());
      return;
    }

    if (isBlockedByFailedAuthRate()) {
      send(res, 429, { error: "Too many failed attempts, try again later" });
      return;
    }

    if (!isAuthorized(req)) {
      recordFailedAuth();
      send(res, 401, { error: "Unauthorized" });
      return;
    }

    if (req.method === "POST" && req.url === "/internal/send-group-message") {
      const body = (await readJsonBody(req)) as { text?: unknown; mentions?: unknown };
      if (typeof body.text !== "string" || body.text.trim().length === 0) {
        send(res, 400, { error: "Body must include a non-empty 'text' string" });
        return;
      }
      const mentions = Array.isArray(body.mentions) ? body.mentions.filter((m): m is string => typeof m === "string") : [];
      await sendGroupMessage(body.text, mentions);
      send(res, 200, { sent: true });
      return;
    }

    send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("wa-bot request error:", err);
    send(res, 500, { error: "Internal error", message: (err as Error).message });
  }
}
