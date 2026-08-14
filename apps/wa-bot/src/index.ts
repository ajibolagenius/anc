import { Sentry } from "./sentry.js";
import { connectToWhatsApp } from "./whatsapp.js";
import { startServer } from "./server.js";

startServer();
void connectToWhatsApp();

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in wa-bot:", reason);
  Sentry.captureException(reason);
});
