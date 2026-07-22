"use client";

import PageHeader from "@/components/effects/PageHeader";
import { ButtonLink } from "@/components/ui/button";
import { BlobUploadField, type BlobUploadResult } from "@/components/admin/BlobUploadField";
import { useState } from "react";

export default function AdminUploadPage() {
  const [last, setLast] = useState<BlobUploadResult | null>(null);
  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-6">
        <PageHeader colorVar="--admin" title="آپلود فایل به Vercel Blob" titleClassName="text-[var(--admin)]" description="آپلود امن برای تصاویر، ویدیوها، دانلودها و آواتارها">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/blob" variant="ghost" size="sm">فایل‌های Blob</ButtonLink>
          </div>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <BlobUploadField label="تصویر مقاله/خبر" kind="image" folder="article-images" accept="image/*" onUploaded={setLast} />
          <BlobUploadField label="تصویر نقد و بررسی" kind="image" folder="review-images" accept="image/*" onUploaded={setLast} />
          <BlobUploadField label="Thumbnail ویدیو" kind="image" folder="thumbnails" accept="image/*" onUploaded={setLast} />
          <BlobUploadField label="ویدیو" kind="video" folder="videos" accept="video/mp4,video/webm,video/quicktime" onUploaded={setLast} />
          <BlobUploadField label="فایل دانلود" kind="download" folder="archive/uploads" accept=".pdf,.zip,.7z,.rar,.iso,.txt,.ts,.js,.json,application/pdf,application/zip" onUploaded={setLast} />
          <BlobUploadField label="آواتار کاربر" kind="avatar" folder="avatars" accept="image/jpeg,image/png,image/webp" onUploaded={setLast} />
        </div>

        {last && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-2 font-bold">آخرین فایل آپلودشده</div>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs" dir="ltr">{JSON.stringify(last, null, 2)}</pre>
          </div>
        )}
      </section>
    </main>
  );
}
