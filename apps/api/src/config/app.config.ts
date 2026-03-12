export function getAppConfig() {
  return {
    port: Number(process.env.PORT ?? 4000),
    sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "facturator_session",
    sessionDurationDays: Number(process.env.SESSION_TTL_DAYS ?? 30),
  };
}
