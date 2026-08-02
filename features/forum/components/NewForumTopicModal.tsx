"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type NewForumTopicModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function makeSlug(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "topic"}-${Date.now().toString(36)}`;
}

/** Homepage question composer. Stays on the homepage after submission. */
export function NewForumTopicModal({ open, onOpenChange }: NewForumTopicModalProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5 || cleanBody.length < 10) {
      setError("عنوان و جزئیات پرسش را کامل‌تر بنویسید.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "forum",
          slug: makeSlug(cleanTitle),
          title: cleanTitle,
          excerpt: cleanBody.slice(0, 180),
          content: cleanBody,
          tags: ["پرسش", "تکباکس"],
          category: "پرسش",
          published: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setError("برای طرح پرسش ابتدا وارد حساب کاربری شوید.");
        window.dispatchEvent(new CustomEvent("tb_open_auth"));
        return;
      }
      if (!response.ok) {
        setError(data?.message || data?.error || "ثبت پرسش ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      setTitle("");
      setBody("");
      onOpenChange(false);
      toast.success("پرسش شما در انجمن ثبت شد.");
      // The API invalidates home-data; refreshing lets this topic become an
      // eligible active discussion without forcing the reader onto /forum.
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>طرح پرسش جدید</DialogTitle>
          <DialogDescription>
            مسئله، توپولوژی، خطاها و کارهایی که تا حالا انجام داده‌اید را روشن بنویسید تا پاسخ دقیق‌تری بگیرید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="hp-forum-topic-title" className="text-sm font-bold text-foreground">عنوان پرسش</label>
            <Input
              id="hp-forum-topic-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثلاً: بهترین راه بازیابی بکاپ Immutable چیست؟"
              maxLength={200}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hp-forum-topic-body" className="text-sm font-bold text-foreground">جزئیات</label>
            <Textarea
              id="hp-forum-topic-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="جزئیات محیط، پیام خطا، توپولوژی و راه‌حل‌هایی که امتحان کرده‌اید را بنویسید..."
              className="min-h-40"
              maxLength={5000}
              disabled={submitting}
            />
          </div>

          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>انصراف</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "در حال ثبت…" : "ثبت پرسش"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewForumTopicModal;
