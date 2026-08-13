function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  groupJid: requireEnv("WA_GROUP_JID"),
  internalKey: requireEnv("WA_BOT_INTERNAL_KEY"),
  authDir: process.env.WA_AUTH_DIR ?? "./auth",
};
