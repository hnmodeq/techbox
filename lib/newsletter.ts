import { escapeHtml } from "./email";

/** A single selected item to include in a newsletter. */
export interface NewsletterItem {
  module: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  url: string; // absolute link to the post
  dateFa?: string | null;
}

export interface NewsletterTemplateSettings {
  headerHtml: string;
  footerHtml: string;
  subject: string;
}

/** Sensible default header/footer so the panel works before any customization. */
export const DEFAULT_NEWSLETTER_SUBJECT = "خبرنامه هفتگی تکباکس";
export const DEFAULT_NEWSLETTER_HEADER = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
  <tr><td style="font-family:system-ui,sans-serif;font-size:22px;font-weight:900;color:#ffffff;">خبرنامه تکباکس</td></tr>
  <tr><td style="font-family:system-ui,sans-serif;font-size:13px;color:#94a3b8;padding-top:6px;">آخرین اخبار و تحولات دنیای زیرساخت</td></tr>
</table>`;
export const DEFAULT_NEWSLETTER_FOOTER = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:0 0 12px 12px;padding:20px;text-align:center;">
  <tr><td style="font-family:system-ui,sans-serif;font-size:12px;color:#94a3b8;">© تکباکس — این ایمیل به‌صورت ایمیلی برای شما ارسال شده است.</td></tr>
</table>`;

function stripForExcerpt(value: string, max = 180): string {
  const clean = (value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~\-[\]()]/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}…`;
}

function renderItem(item: NewsletterItem): string {
  const title = escapeHtml(item.title);
  const excerpt = escapeHtml(stripForExcerpt(item.excerpt || ""));
  const url = escapeHtml(item.url);
  const date = item.dateFa ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${escapeHtml(item.dateFa)}</div>` : "";
  const img = item.image
    ? `<img src="${escapeHtml(item.image)}" alt="${title}" width="100%" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;display:block;margin-bottom:12px;" />`
    : "";

  return `<a href="${url}" style="display:block;text-decoration:none;color:inherit;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;">
      <tr><td style="padding:14px;">
        ${img}
        ${date}
        <div style="font-family:system-ui,sans-serif;font-size:16px;font-weight:800;color:#0f172a;line-height:1.5;margin-bottom:6px;">${title}</div>
        <div style="font-family:system-ui,sans-serif;font-size:13px;color:#475569;line-height:1.7;">${excerpt}</div>
        <div style="font-family:system-ui,sans-serif;font-size:13px;font-weight:700;color:#2563eb;margin-top:10px;">ادامه مطلب ←</div>
      </td></tr>
    </table>
  </a>`;
}

export interface RenderNewsletterOptions {
  subject: string;
  headerHtml: string;
  footerHtml: string;
  items: NewsletterItem[];
  /** Absolute URL the recipient clicks to unsubscribe. */
  unsubscribeUrl: string;
  /** Recipient email (for the "sent to" line + List-Unsubscribe header). */
  recipientEmail: string;
}

/**
 * Render a complete newsletter email. Header + footer are the admin-editable
 * static blocks; the items are rendered between them. An unsubscribe link is
 * always appended — required for bulk email and CAN-SPAM/GDPR friendliness.
 */
export function renderNewsletterEmail(opts: RenderNewsletterOptions): string {
  const { subject, headerHtml, footerHtml, items, unsubscribeUrl, recipientEmail } = opts;
  const itemsHtml = items.length > 0
    ? items.map(renderItem).join("")
    : `<p style="font-family:system-ui,sans-serif;font-size:14px;color:#475569;">این هفته مورد جدیدی برای ارسال انتخاب نشده است.</p>`;

  const unsub = escapeHtml(unsubscribeUrl);

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 10px rgba(15,23,42,0.06);overflow:hidden;">
        <tr><td>
          ${headerHtml}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
            <tr><td>
              <div style="font-family:system-ui,sans-serif;font-size:20px;font-weight:900;color:#0f172a;margin-bottom:16px;">${escapeHtml(subject)}</div>
              ${itemsHtml}
            </td></tr>
          </table>
          ${footerHtml}
        </td></tr>
      </table>

      <!-- Unsubscribe block: always present, clearly labeled, token-based link. -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;padding:16px;text-align:center;">
        <tr><td style="font-family:system-ui,sans-serif;font-size:12px;color:#64748b;">
          این ایمیل برای ${escapeHtml(recipientEmail)} ارسال شده است.
          <br />
          اگر نمی‌خواهید ایمیل‌های بیشتری دریافت کنید،
          <a href="${unsub}" style="color:#2563eb;font-weight:700;">لغو عضویت</a>
          کنید.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Build the absolute unsubscribe URL for a given subscriber token. */
export function buildUnsubscribeUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
