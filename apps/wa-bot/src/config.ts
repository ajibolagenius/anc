function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const internalKey = requireEnv("WA_BOT_INTERNAL_KEY");
if (internalKey.length < 32) {
  throw new Error(
    "WA_BOT_INTERNAL_KEY is too short to be a safe shared secret — generate one with `openssl rand -hex 32`",
  );
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  groupJid: requireEnv("WA_GROUP_JID"),
  internalKey,
  authDir: process.env.WA_AUTH_DIR ?? "./auth",
};
