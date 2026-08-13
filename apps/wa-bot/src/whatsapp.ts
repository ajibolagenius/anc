import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

export type BotStatus = {
  connection: "connecting" | "open" | "close";
  lastConnectedAt: string | null;
  lastDisconnectReason: string | null;
};

let sock: WASocket | null = null;
const status: BotStatus = {
  connection: "connecting",
  lastConnectedAt: null,
  lastDisconnectReason: null,
};

export function getStatus(): BotStatus {
  return status;
}

/**
 * ANC is a low-volume bot by design (a handful of messages a day — see
 * PRD §9 on WhatsApp session fragility). Never call this in a loop; always
 * batch same-event messages into one send.
 */
export async function sendGroupMessage(text: string): Promise<void> {
  if (!sock || status.connection !== "open") {
    throw new Error("WhatsApp socket is not connected");
  }
  await sock.sendMessage(config.groupJid, { text });
}

export async function connectToWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);

  sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nScan this QR code with the ANC bot's dedicated WhatsApp number:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection) {
      status.connection = connection;
    }

    if (connection === "open") {
      status.lastConnectedAt = new Date().toISOString();
      status.lastDisconnectReason = null;
      console.log("wa-bot connected.");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      status.lastDisconnectReason = loggedOut
        ? "logged_out"
        : `disconnected (code ${statusCode ?? "unknown"})`;

      if (loggedOut) {
        console.error(
          "wa-bot was logged out. Delete the auth directory and re-scan the QR code to re-pair.",
        );
        return;
      }

      console.warn("wa-bot disconnected, reconnecting...", status.lastDisconnectReason);
      void connectToWhatsApp();
    }
  });
}
