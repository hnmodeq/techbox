import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, canEditModule } from "@/lib/auth-server";
import { sendEmail, escapeHtml } from "@/lib/email";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUserPublic();
  if (!user || !canEditModule(user as any, "workwithus")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["pending", "reviewed", "contacted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  try {
    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: { job: { select: { title: true, slug: true } } },
    });

    // Send email notification to applicant on status change
    const statusLabels: Record<string, string> = {
      reviewed: "بررسی شد",
      contacted: "تماس گرفته شد",
      rejected: "رد شد",
    };
    const statusLabel = statusLabels[status];
    if (statusLabel && application.email) {
      sendEmail({
        to: application.email,
        subject: `بروزرسانی وضعیت درخواست همکاری – ${application.job?.title || "تکباکس"}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
            <h2 style="color: #111;">سلام ${escapeHtml(application.name)}،</h2>
            <p>وضعیت درخواست شما برای موقعیت شغلی <strong>${escapeHtml(application.job?.title || "")}</strong> به <strong>${escapeHtml(statusLabel)}</strong> تغییر کرد.</p>
            ${status === "contacted" ? "<p>به زودی با شما تماس خواهیم گرفت.</p>" : ""}
            ${status === "rejected" ? "<p>متأسفانه در این مرحله امکان همکاری وجود ندارد. از علاقه شما ممنونیم.</p>" : ""}
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://techbox.ir"}/work-with-us" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #111; color: white; text-decoration: none; border-radius: 6px;">
              مشاهده موقعیت‌های شغلی
            </a>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json(application, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
