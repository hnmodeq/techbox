import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import { sendEmail, escapeHtml } from "@/lib/email";

const applySchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  email: z.string().email("ایمیل نامعتبر است"),
  phone: z.string().min(10, "شماره تماس نامعتبر است").max(15),
  message: z.string().max(1000, "پیام نباید بیشتر از ۱۰۰۰ کاراکتر باشد").optional(),
});

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "jobs");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ساعتی دیگر تلاش کنید." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const job = await prisma.job.findFirst({
      where: { slug, active: true },
    });

    if (!job) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const formData = await req.formData();
    
    // Validate text fields
    const data = applySchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    });

    // Validate file
    const file = formData.get("resume");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "resume_required", message: "ارسال رزومه الزامی است." }, { status: 400 });
    }

    if (file.size > MAX_RESUME_SIZE) {
      return NextResponse.json({ error: "file_too_large", message: "حجم فایل رزومه نباید بیشتر از ۵ مگابایت باشد." }, { status: 413 });
    }

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "unsupported_file_type", message: "فرمت فایل رزومه باید PDF یا Word باشد." }, { status: 415 });
    }

    // Upload to Vercel Blob — private access where possible
    // Note: free tier forces public URLs, but we add unguessable paths
    // and do NOT list resumes in any public API
    const blob = await put(`resumes/${job.slug}/${Date.now()}-${file.name}`, file, {
      access: "public", // Free tier limitation; use unguessable path
      addRandomSuffix: true,
    });

    // Save to DB
    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        resumeUrl: blob.url,
        resumeName: file.name,
      },
    });

    // Notify admin about new application (fire-and-forget)
    sendEmail({
      to: process.env.CONTACT_EMAIL || "info@techbox.ir",
      subject: `رزومه جدید: ${escapeHtml(data.name)} – ${escapeHtml(job.title)}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
          <h2 style="color: #111;">رزومه جدید دریافت شد</h2>
          <p><strong>${escapeHtml(data.name)}</strong> برای موقعیت شغلی <strong>${escapeHtml(job.title)}</strong> رزومه ارسال کرد.</p>
          <p>ایمیل: ${escapeHtml(data.email)}</p>
          <p>تلفن: ${escapeHtml(data.phone)}</p>
          ${data.message ? `<p>پیام: ${escapeHtml(data.message)}</p>` : ""}
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://techbox.ir"}/admin/jobs/applications" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111; color: white; text-decoration: none; border-radius: 6px;">
            مشاهده رزومه‌ها
          </a>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: application.id }, { status: 201, headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    console.error("Job application error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_failed", issues: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "internal_error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
