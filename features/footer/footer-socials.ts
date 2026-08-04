export type FooterSocialKey = "instagram" | "youtube" | "telegram";
export type FooterSocialConfig = Record<FooterSocialKey, { enabled: boolean; url: string }>;

export const DEFAULT_FOOTER_SOCIALS: FooterSocialConfig = {
  instagram: { enabled: true, url: "https://instagram.com/techbox" },
  youtube: { enabled: true, url: "https://youtube.com/@techbox" },
  telegram: { enabled: true, url: "https://t.me/techbox" },
};

export function parseFooterSocials(value: unknown): FooterSocialConfig {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { parsed = null; }
  }
  const source = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  const output = structuredClone(DEFAULT_FOOTER_SOCIALS);
  for (const key of Object.keys(output) as FooterSocialKey[]) {
    const candidate = source[key];
    if (!candidate || typeof candidate !== "object") continue;
    const row = candidate as Record<string, unknown>;
    if (typeof row.enabled === "boolean") output[key].enabled = row.enabled;
    if (typeof row.url === "string") {
      try {
        const url = new URL(row.url);
        if (url.protocol === "https:") output[key].url = url.toString();
      } catch {}
    }
  }
  return output;
}
