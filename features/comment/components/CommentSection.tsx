"use client";
import * as React from "react";
import { useEffect, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/like-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/design/icons";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { AuthorLink } from "@/components/ui/author-link";
import { gregorianToJalali, getPersianMonthName } from "@/lib/jalali";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth.provider";

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

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const toFa = (n: number) => n.toLocaleString("fa-IR");

  if (diffDays >= 7) {
    const jalali = gregorianToJalali(date);
    const monthName = getPersianMonthName(jalali.month);
    return `${toFa(jalali.year)} ${monthName} ${toFa(jalali.day)}`;
  }

  if (diffDays >= 1) return `${toFa(diffDays)} روز پیش`;
  if (diffHours >= 1) return `${toFa(diffHours)} ساعت پیش`;
  if (diffMinutes >= 1) return `${toFa(diffMinutes)} دقیقه پیش`;
  return "لحظاتی پیش";
}

/** Skeleton that mimics a comment card shape while auth/comments load */
function CommentSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--muted-background)]" />
            <div className="h-3 w-24 rounded bg-[var(--muted-background)]" />
            <div className="h-3 w-16 rounded bg-[var(--muted-background)] mr-auto" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-[var(--muted-background)]" />
            <div className="h-3 w-3/4 rounded bg-[var(--muted-background)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommentSection({ module, slug }: { module: string; slug: string }) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Use the shared AuthProvider — reads user from localStorage instantly
  const { user, loading: authLoading } = useAuth();

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
  }, [load]);

  // ─── Top-level comment form state ───────────────────────────
  const [topText, setTopText] = React.useState("");
  const [topSubmitting, setTopSubmitting] = React.useState(false);

  const handleTopSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;
    if (!text?.trim() || text.trim().length < 2) return;

    setTopSubmitting(true);
    try {
      const res = await createCommentAction(null, formData);
      if ((res as any)?.ok) {
        setTopText("");
        toast.success((res as any)?.message || "دیدگاه شما با موفقیت ثبت شد");
        startTransition(() => { load(); });
      } else {
        toast.error((res as any)?.error || "خطا در ثبت دیدگاه");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setTopSubmitting(false);
    }
  };

  // ─── Reply form state ───────────────────────────────────────
  const [replyOpen, setReplyOpen] = React.useState<string | null>(null);
  const [replySubmitting, setReplySubmitting] = React.useState(false);

  const handleReplyClick = (commentId: string) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("tb_open_auth"));
      return;
    }
    setReplyOpen(replyOpen === commentId ? null : commentId);
  };

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>, parentId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;
    if (!text?.trim() || text.trim().length < 2) return;

    setReplySubmitting(true);
    try {
      const res = await createCommentAction(null, formData);
      if ((res as any)?.ok) {
        setReplyOpen(null);
        toast.success((res as any)?.message || "پاسخ شما با موفقیت ثبت شد");
        startTransition(() => { load(); });
      } else {
        toast.error((res as any)?.error || "خطا در ثبت پاسخ");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setReplySubmitting(false);
    }
  };

  // ─── Edit state ─────────────────────────────────────────────
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  const handleEditClick = (commentId: string, currentText: string) => {
    setEditingId(commentId);
    setEditText(currentText);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditSave = async (commentId: string) => {
    if (!editText.trim() || editText.trim().length < 2) return;
    setEditSubmitting(true);
    try {
      const res = await fetch("/api/comments/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, text: editText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingId(null);
        setEditText("");
        toast.success("دیدگاه شما با موفقیت ویرایش شد");
        startTransition(() => { load(); });
      } else {
        toast.error(data.message || "خطا در ویرایش دیدگاه");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─── Delete state ───────────────────────────────────────────
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    if (!confirm("آیا از حذف این دیدگاه مطمئن هستید؟")) return;
    setDeletingId(commentId);
    try {
      const res = await fetch("/api/comments/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("دیدگاه شما حذف شد");
        startTransition(() => { load(); });
      } else {
        toast.error(data.message || "خطا در حذف دیدگاه");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
    }
  };

  const isSoftDeleted = (c: CommentNode) => !!(c as any).deletedAt;

  const renderNode = (c: CommentNode, depth = 0) => {
    const deleted = isSoftDeleted(c);
    const isOwner = user && (c as any).authorId === user.id;
    const hasBeenEdited = !!(c as any).editedAt;
    const isEditing = editingId === (c as any).id;
    const isDeleting = deletingId === (c as any).id;

    return (
      <div key={c.id} style={{ marginRight: depth ? 12 : 0, marginTop: 12 }}>
        <div className={depth ? "border-r-2 border-[var(--border-color)] pe-4 ps-3" : "pe-0"} style={{ marginRight: depth ? 16 : 0 }}>
          <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 relative">
            {isDeleting && (
              <div className="absolute inset-0 bg-[var(--card-background)]/60 rounded-[var(--corner-radius)] flex items-center justify-center z-10">
                <Spinner className="h-5 w-5" />
                <span className="mr-2 text-sm paragraph-color">در حال حذف…</span>
              </div>
            )}

            {deleted ? (
              <div className="flex items-center gap-2 py-2 paragraph-color">
                <Icon name="trash" size={16} className="shrink-0 opacity-50" />
                <span className="text-sm italic opacity-60">این نظر حذف شده است</span>
              </div>
            ) : isEditing ? (
              <>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <AuthorLink name={(c as any).authorName || "کاربر"} username={(c as any).author?.username} avatar={(c as any).author?.avatar || ""} />
                </div>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] w-full text-sm text-[var(--paragraph-color)]"
                  autoFocus
                  disabled={editSubmitting}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="ghost" size="xs" onClick={handleEditCancel} disabled={editSubmitting}>انصراف</Button>
                  <Button type="button" size="xs" onClick={() => handleEditSave((c as any).id)} disabled={editSubmitting}>
                    {editSubmitting ? "در حال ثبت تغییرات…" : "ذخیره تغییرات"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start gap-3">
                  <AuthorLink name={(c as any).authorName || "کاربر"} username={(c as any).author?.username} avatar={(c as any).author?.avatar || ""} />
                  <div className="flex items-center gap-2 shrink-0">
                    {hasBeenEdited && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="text-[11px] paragraph-color cursor-default italic" />}>
                          (ویرایش شده)
                        </TooltipTrigger>
                        <TooltipContent>ویرایش شده در {formatCommentDate((c as any).editedAt)}</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger render={<span className="text-[11px] paragraph-color shrink-0 cursor-default" />}>
                        {formatCommentDate((c as any).createdAt)}
                      </TooltipTrigger>
                      <TooltipContent>تاریخ انتشار این دیدگاه</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--paragraph-color)] paragraph-color leading-7">
                  {(c as any).text}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <CommentVote
                    id={c.id}
                    initialLikes={(c as any).likes ?? 0}
                    initialDislikes={(c as any).dislikes ?? 0}
                  />
                  <Tooltip>
                    <TooltipTrigger render={
                      <Button
                        onClick={() => handleReplyClick(c.id)}
                        variant="link"
                        size="xs"
                        className="text-[11px] text-[var(--paragraph-color)] paragraph-color hover:text-[var(--home)]"
                        type="button"
                      />
                    }>
                      {replyOpen === c.id ? "بستن" : "پاسخ"}
                    </TooltipTrigger>
                    <TooltipContent>پاسخ به این دیدگاه</TooltipContent>
                  </Tooltip>

                  {isOwner && (
                    <>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button
                            onClick={() => handleEditClick((c as any).id, (c as any).text)}
                            variant="link"
                            size="xs"
                            className="text-[11px] text-[var(--paragraph-color)] paragraph-color hover:text-[var(--home)]"
                            type="button"
                          />
                        }>
                          ویرایش
                        </TooltipTrigger>
                        <TooltipContent>ویرایش این دیدگاه</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger render={
                          <Button
                            onClick={() => handleDelete((c as any).id)}
                            variant="link"
                            size="xs"
                            className="text-[11px] text-[var(--danger)] hover:text-[var(--danger)]"
                            type="button"
                          />
                        }>
                          حذف
                        </TooltipTrigger>
                        <TooltipContent>حذف این دیدگاه</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </>
            )}

            {!deleted && replyOpen === c.id && (
              <form
                onSubmit={(e) => handleReplySubmit(e, c.id)}
                className="mt-3 space-y-2 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-3"
              >
                <input type="hidden" name="module" value={module} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="parentId" value={c.id} />
                <Textarea
                  name="text"
                  required
                  className="min-h-[80px] w-full text-sm text-[var(--paragraph-color)]"
                  defaultValue={`@${(c as any).author?.username || (c as any).authorName || "کاربر"} `}
                  key={`reply-${c.id}-${replyOpen}`}
                  disabled={replySubmitting}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="xs" onClick={() => setReplyOpen(null)} disabled={replySubmitting}>انصراف</Button>
                  <Button type="submit" disabled={replySubmitting} size="xs">
                    {replySubmitting ? "در حال ارسال…" : "ارسال پاسخ"}
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
  };

  const totalCount = comments.reduce((s, c: any) => {
    if (isSoftDeleted(c)) return s;
    const replyCount = (c.replies || []).filter((r: any) => !isSoftDeleted(r)).length;
    return s + 1 + replyCount;
  }, 0);

  return (
    <section className="mt-14 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">دیدگاه شما <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">({(totalCount ?? 0).toLocaleString("fa-IR")})</span></h3>
      </div>

      {authLoading ? (
        /* Show skeleton while auth resolves — prevents "not logged in" flash */
        <div className="mb-8">
          <div className="bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] p-5 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[var(--muted-background)]" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-[var(--muted-background)]" />
                <div className="h-3 w-14 rounded bg-[var(--muted-background)]" />
              </div>
            </div>
            <div className="h-24 rounded bg-[var(--muted-background)]" />
            <div className="flex justify-end"><div className="h-8 w-28 rounded bg-[var(--muted-background)]" /></div>
          </div>
        </div>
      ) : user ? (
        <form onSubmit={handleTopSubmit} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 space-y-4 mb-8">
          <input type="hidden" name="module" value={module} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="parentId" value="" />
          <div className="flex items-center gap-3 border-b-[length:var(--border-size)] border-[var(--border-color)] pb-3">
            {user.avatar && user.avatar !== "/assets/hooman.png" ? (
              <Image src={user.avatar} width={36} height={36} alt={user.name || "کاربر"} className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--border-color)]" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[var(--muted-background)] border-[length:var(--border-size)] border-[var(--border-color)] flex items-center justify-center paragraph-color shrink-0">
                <Icon name="user" size={18} />
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-[var(--paragraph-color)]">{user.name}</div>
              <div className="text-[11px] paragraph-color font-mono" dir="ltr">@{user.username}</div>
            </div>
          </div>
          <Textarea
            name="text"
            required
            placeholder="دیدگاه خود را درباره این مطلب بنویسید..."
            className="min-h-[100px] w-full text-sm text-[var(--paragraph-color)]"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            disabled={topSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={topSubmitting} size="sm">
              {topSubmitting ? "در حال ارسال…" : "ارسال دیدگاه"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 text-center space-y-3 mb-8 bg-[var(--card-background)]/40 border-dashed">
          <h4 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--primary-text)]">برای ثبت دیدگاه وارد شوید</h4>
          <p className="text-sm text-[var(--paragraph-color)] paragraph-color max-w-md mx-auto">
            برای ثبت دیدگاه، پاسخ به نظرات دیگران و پسندیدن مطالب، ابتدا باید وارد حساب کاربری خود شوید یا در کمتر از یک دقیقه ثبت‌نام کنید.
          </p>
          <div className="pt-2">
            <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent("tb_open_auth"))} size="sm">ورود یا ثبت‌نام در تکباکس</Button>
          </div>
        </div>
      )}

      <div className="space-y-1 min-h-[60px]">
        {loading ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-sm font-semibold paragraph-color text-center py-6">هنوز دیدگاهی برای این مطلب ثبت نشده است. اولین نفر باشید!</p>
        ) : (
          comments.map(c => renderNode(c, 0))
        )}
      </div>
    </section>
  );
}
