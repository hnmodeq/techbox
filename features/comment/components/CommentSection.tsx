"use client";
import * as React from "react";
import { useActionState, useEffect, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/LikeButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CommentNode = any;

function nestFlat(rows: any[]): CommentNode[] {
  const map = new Map<string, any>();
  rows.forEach((r: any) => map.set(r.id, { ...r, replies: [] }));
  const roots: any[] = [];
  map.forEach((n) => {
    if (n.parentId && map.has(n.parentId)) map.get(n.parentId)!.replies.push(n);
    else roots.push(n);
  });
  return roots;
}

export default function CommentSection({ module, slug }: { module: string; slug: string }) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommentsAction(module, slug);
      setComments(nestFlat(data as any));
    } finally {
      setLoading(false);
    }
  }, [module, slug]);

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setUser(d?.user || null))
      .catch(() => {});
  }, [load]);

  const [state, formAction, isSubmitting] = useActionState(
    async (_prev: any, formData: FormData) => {
      if (!user) {
        return { ok: false, error: "برای ثبت نظر ابتدا باید وارد حساب کاربری شوید." };
      }
      const res = await createCommentAction(null, formData);
      if ((res as any)?.ok) {
        startTransition(() => { load(); });
        return { ok: true, ts: Date.now() };
      }
      return res;
    },
    { ok: false }
  );

  const [replyOpen, setReplyOpen] = React.useState<string | null>(null);

  const handleReplyClick = (commentId: string) => {
    if (!user) {
      router.push("/account");
      return;
    }
    setReplyOpen(replyOpen === commentId ? null : commentId);
  };

  const renderNode = (c: CommentNode, depth = 0) => (
    <div key={c.id} style={{ marginRight: depth ? 16 : 0, marginTop: 12 }}>
      <div className={depth ? "border-r-2 border-[var(--tb-border)] pe-3" : "pe-0"} style={{ marginRight: depth ? 12 : 0 }}>
        <div className="card p-4">
          <div className="flex justify-between items-center gap-2">
            <div className="tb-text-sm font-semibold text-[var(--tb-fg-primary)]">{(c as any).authorName || "کاربر"}</div>
            <div className="tb-text-sm text-[var(--tb-fg-muted)]">
              {new Date((c as any).createdAt).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap tb-text-sm text-[var(--tb-fg-muted)]">{(c as any).text}</p>
          <div className="flex items-center gap-4 mt-3">
            <CommentVote
              id={c.id}
              initialLikes={(c as any).likes ?? 0}
              initialDislikes={(c as any).dislikes ?? 0}
            />
            <Button
              onClick={() => handleReplyClick(c.id)}
              variant="link"
              size="xs"
              className="tb-text-sm text-[var(--tb-fg-muted)] hover:text-[var(--tb-primary)]"
              type="button"
            >
              {replyOpen === c.id ? "بستن" : "پاسخ"}
            </Button>
          </div>

          {replyOpen === c.id && (
            <form action={formAction} className="mt-3 space-y-2 border-t border-[var(--tb-border)] pt-3">
              <input type="hidden" name="module" value={module} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="parentId" value={c.id} />
              <textarea name="text" required className="input min-h-[80px] w-full tb-text-sm" placeholder={`پاسخ شما به ${(c as any).authorName}…`} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="xs" onClick={() => setReplyOpen(null)}>انصراف</Button>
                <Button disabled={isSubmitting || isPending} size="xs">
                  {isSubmitting ? "در حال ارسال…" : "ارسال پاسخ"}
                </Button>
              </div>
            </form>
          )}
        </div>
        {c.replies && c.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {c.replies.map((r: any) => renderNode(r, depth + 1))}
          </div>
        )}
      </div>
    </div>
  );

  const totalCount = comments.reduce((s, c: any) => s + 1 + ((c.replies?.length) || 0), 0);

  return (
    <section className="mt-14 border-t border-[var(--tb-border)] pt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="tb-text-lg font-bold">دیدگاه‌ها و گفتگو <span className="tb-text-sm text-[var(--tb-fg-muted)]">({(totalCount ?? 0).toLocaleString("fa-IR")})</span></h3>
        <Badge variant="secondary" className="tb-text-sm">ذخیره در Neon PostgreSQL</Badge>
      </div>

      {user ? (
        <form action={formAction} className="card p-5 space-y-4 mb-8">
          <input type="hidden" name="module" value={module} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="parentId" value="" />
          <div className="flex items-center gap-3 border-b border-[var(--tb-border)] pb-3">
            <Image src={user.avatar || "/assets/hooman.png"} width={36} height={36} alt={user.name} className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--tb-border)]" />
            <div>
              <div className="tb-text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-[var(--tb-fg-muted)] font-mono" dir="ltr">@{user.username}</div>
            </div>
            <Badge variant="info" className="ms-auto text-xs">حساب متصل</Badge>
          </div>
          <textarea name="text" required placeholder="دیدگاه خود را درباره این مطلب بنویسید..." className="input min-h-[100px] w-full tb-text-sm" />
          <div className="flex justify-between items-center">
            <span className="tb-text-sm text-[var(--tb-fg-muted)]">
              {state?.ok ? <span className="text-[var(--tb-success)] font-semibold">✓ دیدگاه شما با موفقیت در پایگاه داده ثبت شد</span> : (state as any)?.error ? <span className="text-[var(--tb-danger)]">{(state as any).error}</span> : ""}
            </span>
            <Button disabled={isSubmitting || isPending} size="sm">
              {isSubmitting ? "در حال ثبت..." : "ارسال دیدگاه"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="card p-6 text-center space-y-3 mb-8 bg-[var(--tb-bg-secondary)]/40 border-dashed">
          <h4 className="tb-text-md font-semibold text-[var(--tb-fg-primary)]">برای ثبت دیدگاه وارد شوید</h4>
          <p className="tb-text-sm text-[var(--tb-fg-muted)] max-w-md mx-auto">
            برای ثبت دیدگاه، پاسخ به نظرات دیگران و پسندیدن مطالب، ابتدا باید وارد حساب کاربری خود شوید یا در کمتر از یک دقیقه ثبت‌نام کنید.
          </p>
          <div className="pt-2">
            <Button onClick={() => router.push("/account")} size="sm">ورود یا ثبت‌نام در تکباکس</Button>
          </div>
        </div>
      )}

      <div className="space-y-1 min-h-[60px]">
        {loading ? (
          <p className="tb-text-md text-[var(--tb-fg-muted)] text-center py-6 animate-pulse">در حال بارگذاری دیدگاه‌ها از پایگاه داده Neon...</p>
        ) : comments.length === 0 ? (
          <p className="tb-text-md text-[var(--tb-fg-muted)] text-center py-6">هنوز دیدگاهی برای این مطلب ثبت نشده است. اولین نفر باشید!</p>
        ) : (
          comments.map(c => renderNode(c, 0))
        )}
      </div>
    </section>
  );
}
