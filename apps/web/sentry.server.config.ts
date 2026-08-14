import * as Sentry from "@sentry/nextjs";

// Unset SENTRY_DSN => Sentry.init is a safe no-op (matches every other
// optional integration in this codebase: Resend, wa-bot, Anthropic).
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
