import * as Sentry from "@sentry/node";

// Unset SENTRY_DSN => safe no-op, same convention as every other optional
// integration in this project (Resend, Anthropic summarization, etc).
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});

export { Sentry };
