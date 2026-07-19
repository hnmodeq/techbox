import { Resend } from "resend";
import nodemailer from "nodemailer";
import { getSetting } from "@/lib/settings";

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "TechBox <techboxnoreply@gmail.com>";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  // Check settings dynamically so admin can switch without restarting server
  const provider = await getSetting("email.provider"); // "resend" | "nodemailer"

  if (provider === "nodemailer") {
    try {
      const user = await getSetting("email.nodemailer_user");
      const pass = await getSetting("email.nodemailer_pass");
      const host = await getSetting("email.nodemailer_host");
      const port = parseInt(await getSetting("email.nodemailer_port"), 10) || 465;
      const secure = await getSetting("email.nodemailer_secure") === "true";
      const fromAddr = await getSetting("email.from_address") || DEFAULT_FROM;

      if (!user || !pass) {
        console.log("[EMAIL] Nodemailer missing credentials. Skipped.");
        return { success: false, reason: "not_configured" };
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      const result = await transporter.sendMail({
        from: from || fromAddr,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
      });

      return { success: true, id: result.messageId };
    } catch (error: any) {
      console.error("[EMAIL] Nodemailer failed to send:", error);
      return { success: false, error: error.message };
    }
  }

  // Fallback to Resend (default)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log("[EMAIL] Resend API key missing. Skipped.");
    return { success: false, reason: "not_configured" };
  }

  try {
    const resend = new Resend(resendApiKey);
    const fromAddr = await getSetting("email.from_address") || DEFAULT_FROM;
    
    const result = await resend.emails.send({
      from: from || fromAddr,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return { success: true, id: result.data?.id };
  } catch (error: any) {
    console.error("[EMAIL] Resend failed to send:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Email templates
export const emailTemplates = {
  newComment: (params: {
    postTitle: string;
    postUrl: string;
    commentAuthor: string;
    commentText: string;
  }) => ({
    subject: `دیدگاه جدید روی "${escapeHtml(params.postTitle)}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111;">دیدگاه جدید</h2>
        <p>کاربر <strong>${escapeHtml(params.commentAuthor)}</strong> روی پست شما دیدگاه گذاشت:</p>
        <blockquote style="border-left: 4px solid #ddd; padding-left: 16px; color: #555;">
          ${escapeHtml(params.commentText)}
        </blockquote>
        <a href="${escapeHtml(params.postUrl)}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111; color: white; text-decoration: none; border-radius: 6px;">
          مشاهده دیدگاه
        </a>
      </div>
    `,
  }),

  welcome: (name: string) => ({
    subject: "خوش آمدید به تکباکس",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #111;">خوش آمدید، ${escapeHtml(name)}!</h1>
        <p>از ثبت‌نام شما در تکباکس ممنونیم.</p>
        <p>حالا می‌توانید در بحث‌ها شرکت کنید، محتوا بخوانید و از ابزارها استفاده کنید.</p>
      </div>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: "بازیابی رمز عبور تکباکس",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>درخواست بازیابی رمز عبور</h2>
        <p>برای تنظیم رمز عبور جدید روی دکمه زیر کلیک کنید:</p>
        <a href="${escapeHtml(resetLink)}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          تنظیم رمز عبور جدید
        </a>
        <p style="color: #666; font-size: 13px;">این لینک ۱ ساعت معتبر است.</p>
      </div>
    `,
  }),

  emailVerification: (verifyLink: string) => ({
    subject: "تأیید ایمیل در تکباکس",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
        <h2>تأیید ایمیل شما</h2>
        <p>برای فعال‌سازی حساب کاربری و تکمیل ثبت‌نام، روی دکمه زیر کلیک کنید:</p>
        <a href="${escapeHtml(verifyLink)}" style="display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          تأیید ایمیل
        </a>
        <p style="color: #666; font-size: 13px;">این لینک ۲۴ ساعت معتبر است. اگر شما این درخواست را ارسال نکرده‌اید، می‌توانید این پیام را نادیده بگیرید.</p>
      </div>
    `,
  }),
};
