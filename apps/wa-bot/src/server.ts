import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { config } from "./config.js";
import { getStatus, sendGroupMessage } from "./whatsapp.js";

function send(res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function isAuthorized(req: IncomingMessage): boolean {
  const header = req.headers.authorization ?? "";
  return header === `Bearer ${config.internalKey}`;
}

export function startServer(): void {
  const server = createServer((req, res) => {
    void handleRequest(req, res);
  });

  server.listen(config.port, () => {
    console.log(`wa-bot internal API listening on :${config.port}`);
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

    if (!isAuthorized(req)) {
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
