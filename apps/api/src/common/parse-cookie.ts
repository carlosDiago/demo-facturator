export function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, item) => {
      const [key, ...valueParts] = item.split("=");
      accumulator[key] = decodeURIComponent(valueParts.join("="));
      return accumulator;
    }, {});
}
