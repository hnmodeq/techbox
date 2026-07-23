"use client";
import * as React from "react";
import { useEffect, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction, acceptAnswerAction, unacceptAnswerAction, getForumTopicMetaAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/like-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/design/icons";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { AuthorLink } from "@/components/ui/author-link";
import { formatRelativeTime } from "@/lib/date-format";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { toast } from "sonner";
import { useAuth } from "@/providers/auth.provider";
import { CommentFormSkeleton, CommentListSkeleton, CommentSectionSkeleton } from "@/components/ui/skeleton-layouts";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function CommentSection({ module, slug, initialComments, compact }: { module: string; slug: string; initialComments?: number; compact?: boolean }) {
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

  // ─── Forum topic meta (for accept-best-answer) ───────────────
  const [topicMeta, setTopicMeta] = useState<{ id: string; authorId: string | null; acceptedCommentId: string | null } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (module !== "forum") return;
    let mounted = true;
    getForumTopicMetaAction(module, slug).then((meta) => {
      if (mounted && meta) setTopicMeta(meta);
    });
    return () => { mounted = false; };
  }, [module, slug]);

  const isTopicAuthor = !!(user && topicMeta && topicMeta.authorId === user.id);
  const canManageAnswer = isTopicAuthor || user?.role === "super_admin";

  const handleAccept = async (commentId: string) => {
    setAcceptingId(commentId);
    try {
      const res = await acceptAnswerAction(commentId);
      if (res.ok) {
        toast.success("این پاسخ به‌عنوان پاسخ برتر انتخاب شد و پرسش بسته شد.");
        setTopicMeta((m) => (m ? { ...m, acceptedCommentId: commentId } : m));
        startTransition(() => { load(); });
      } else {
        toast.error(res.error || "خطا در انتخاب پاسخ برتر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUnaccept = async () => {
    if (!topicMeta) return;
    setAcceptingId(topicMeta.acceptedCommentId);
    try {
      const res = await unacceptAnswerAction(topicMeta.id);
      if (res.ok) {
        toast.success("پاسخ برتر لغو شد و پرسش دوباره باز شد.");
        setTopicMeta((m) => (m ? { ...m, acceptedCommentId: null } : m));
        startTransition(() => { load(); });
      } else {
        toast.error(res.error || "خطا در لغو پاسخ برتر");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setAcceptingId(null);
    }
  };

  // ─── Top-level comment form state ───────────────────────────
  const [topText, setTopText] = React.useState("");
  const [topSubmitting, setTopSubmitting] = React.useState(false);
  const [pros, setPros] = React.useState<string[]>([""]);
  const [cons, setCons] = React.useState<string[]>([""]);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [myRating, setMyRating] = React.useState(0);
  const [ratingSubmitting, setRatingSubmitting] = React.useState(false);

  // Load existing rating
  useEffect(() => {
    if (module !== "shop") return;
    fetch(`/api/rating?module=${module}&slug=${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.myRating) setMyRating(d.myRating); })
      .catch(() => {});
  }, [module, slug]);

  const handleRating = async (value: number) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("tb_open_auth"));
      return;
    }
    setRatingSubmitting(true);
    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, slug, value }),
      });
      if (res.ok) {
        setMyRating(value);
        toast.success("امتیاز شما ثبت شد");
      }
    } catch {
      toast.error("خطا در ثبت امتیاز");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleTopSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Build the full text with pros/cons prepended
    let fullText = formData.get("text") as string;
    const prosList = pros.map((p) => p.trim()).filter(Boolean);
    const consList = cons.map((c) => c.trim()).filter(Boolean);

    let prefix = "";
    if (prosList.length > 0) {
      prefix += "نقاط قوت\n" + prosList.map((p) => `• ${p}`).join("\n") + "\n\n";
    }
    if (consList.length > 0) {
      prefix += "نقاط ضعف\n" + consList.map((c) => `• ${c}`).join("\n") + "\n\n";
    }
    if (prefix) {
      fullText = prefix + (fullText || "").trim();
    }

    if (!fullText?.trim() || fullText.trim().length < 2) return;
    formData.set("text", fullText);

    setTopSubmitting(true);
    try {
      const res = await createCommentAction(null, formData);
      if ((res as any)?.ok) {
        setTopText("");
        setPros([""]);
        setCons([""]);
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
    const isAccepted = !!(topicMeta && topicMeta.acceptedCommentId === (c as any).id);
    // Only the topic author/admin can accept; you can't accept your own comment.
    const canAcceptThis =
      module === "forum" &&
      canManageAnswer &&
      !deleted &&
      !(isTopicAuthor && (c as any).authorId === user?.id);

    return (
      <div key={c.id} className={depth ? "py-3" : ""} style={{ marginTop: depth ? 0 : 12 }}>
        <div className={depth ? "ps-3 pe-4" : "pe-0"} style={{ marginRight: depth ? 16 : 0 }}>
          <div className={`bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 relative ${isAccepted ? "border-[color-mix(in_oklch,var(--success)_45%,transparent)] ring-1 ring-[color-mix(in_oklch,var(--success)_30%,transparent)]" : "border-[var(--border-color)]"}`}>
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
                  <AuthorLink name={(c as any).authorName || "کاربر"} username={(c as any).author?.username} avatar={(c as any).author?.avatar || ""} verifiedType={(c as any).author?.verifiedType} verifiedLabel={(c as any).author?.verifiedLabel} />
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
                {isAccepted && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklch,var(--success)_15%,transparent)] border border-[color-mix(in_oklch,var(--success)_30%,transparent)] px-2 py-0.5 text-[11px] font-bold text-[var(--success)]">
                      پاسخ برتر ✓
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-3">
                  <AuthorLink name={(c as any).authorName || "کاربر"} username={(c as any).author?.username} avatar={(c as any).author?.avatar || ""} verifiedType={(c as any).author?.verifiedType} verifiedLabel={(c as any).author?.verifiedLabel} />
                  <div className="flex items-center gap-2 shrink-0">
                    {hasBeenEdited && (
                      <Tooltip>
                        <TooltipTrigger render={<span className="text-[11px] paragraph-color cursor-default italic" />}>
                          (ویرایش شده)
                        </TooltipTrigger>
                        <TooltipContent>ویرایش شده در {formatRelativeTime((c as any).editedAt)}</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger render={<span className="text-[11px] paragraph-color shrink-0 cursor-default" />}>
                        {formatRelativeTime((c as any).createdAt)}
                      </TooltipTrigger>
                      <TooltipContent>تاریخ انتشار این دیدگاه</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {/* Parsed comment: show text above strength/weakness */}
                {(() => {
                  const raw = (c as any).text || "";
                  const consBlock = raw.match(/نقاط ضعف\n([\s\S]*?)(?=\nنقاط قوت|$)/);
                  const prosBlock = raw.match(/نقاط قوت\n([\s\S]*?)(?=\nنقاط ضعف|$)/);
                  // Main text is everything before the first "نقاط"
                  let mainText = raw;
                  const splitPoint = raw.indexOf("نقاط");
                  if (splitPoint > 0) {
                    mainText = raw.slice(0, splitPoint).trim();
                  }
                  const weaknessLines = consBlock ? consBlock[1].split("\n").map((line: string) => line.replace(/^•\s*/, "").trim()).filter(Boolean) : [];
                  const strengthLines = prosBlock ? prosBlock[1].split("\n").map((line: string) => line.replace(/^•\s*/, "").trim()).filter(Boolean) : [];

                  return (
                    <div className="space-y-2">
                      {mainText && (
                        <p className="whitespace-pre-wrap text-sm text-[var(--paragraph-color)] paragraph-color leading-7">
                          {mainText}
                        </p>
                      )}
                      {/* Weakness first */}
                      {weaknessLines.length > 0 && (
                        <div className="rounded-md bg-red-500/5 border border-red-500/20 p-3 mt-2">
                          <p className="text-[11px] font-bold text-red-500 mb-1">نقاط ضعف</p>
                          <ul className="space-y-0.5">
                            {weaknessLines.map((line: string, i: number) => (
                              <li key={i} className="text-[12px] text-red-600 leading-5">{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Strength second */}
                      {strengthLines.length > 0 && (
                        <div className="rounded-md bg-emerald-600/5 border border-emerald-600/20 p-3 mt-2">
                          <p className="text-[11px] font-bold text-emerald-600 mb-1">نقاط قوت</p>
                          <ul className="space-y-0.5">
                            {strengthLines.map((line: string, i: number) => (
                              <li key={i} className="text-[12px] text-emerald-600 leading-5">{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center gap-4 mt-3">
                  <CommentVote
                    id={c.id}
                    initialLikes={(c as any).likes ?? 0}
                    initialDislikes={(c as any).dislikes ?? 0
                  }
                  />
                  {module === "forum" && canAcceptThis && !isAccepted && (
                    <Tooltip>
                      <TooltipTrigger render={
                        <Button
                          onClick={() => handleAccept((c as any).id)}
                          variant="link"
                          size="xs"
                          className="text-[11px] text-[var(--success)] font-bold"
                          type="button"
                          disabled={acceptingId === (c as any).id}
                        />
                      }>
                        {acceptingId === (c as any).id ? "در حال ثبت…" : "پاسخ برتر"}
                      </TooltipTrigger>
                      <TooltipContent>انتخاب این پاسخ به‌عنوان پاسخ برتر و بستن پرسش</TooltipContent>
                    </Tooltip>
                  )}
                  {module === "forum" && isAccepted && canManageAnswer && (
                    <Tooltip>
                      <TooltipTrigger render={
                        <Button
                          onClick={() => handleUnaccept()}
                          variant="link"
                          size="xs"
                          className="text-[11px] text-[var(--warning)] font-bold"
                          type="button"
                          disabled={!!acceptingId}
                        />
                      }>
                        لغو پاسخ برتر
                      </TooltipTrigger>
                      <TooltipContent>لغو انتخاب و باز کردن دوباره پرسش</TooltipContent>
                    </Tooltip>
                  )}
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
            <div className="border-r-2 border-[var(--border-color)] pe-4 ps-3" style={{ marginRight: 16 }}>
              <div className="space-y-0 divide-y-[length:var(--border-size)] divide-[var(--border-color)]">
                {c.replies.map((r: any) => renderNode(r, depth + 1))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const [sortBy, setSortBy] = useState<"popular" | "newest" | "oldest">("popular");

  const sortedComments = React.useMemo(() => {
    const list = [...comments];
    switch (sortBy) {
      case "newest":
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "popular":
      default:
        list.sort((a, b) => ((b.likes ?? 0) + (b.dislikes ?? 0) * -0.5) - ((a.likes ?? 0) + (a.dislikes ?? 0) * -0.5));
        break;
    }
    return list;
  }, [comments, sortBy]);

  const totalCount = sortedComments.reduce((s, c: any) => {
    if (isSoftDeleted(c)) return s;
    const replyCount = (c.replies || []).filter((r: any) => !isSoftDeleted(r)).length;
    return s + 1 + replyCount;
  }, 0);

  return (
    <section className={compact ? "mt-2 pt-2" : "mt-14 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-10"}>
      {!compact && (
        <div className="flex items-center justify-between mb-6">
          {loading ? (
            <Skeleton className="h-7 w-48 rounded-md" />
          ) : (
            <div className="flex items-center gap-3">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">
                دیدگاه شما{" "}
                <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                  ({totalCount.toLocaleString("fa-IR")})
                </span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">مرتب‌سازی:</span>
                {(["popular", "newest", "oldest"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition font-medium ${
                      sortBy === key ? "bg-foreground text-background font-bold" : "text-foreground/70 hover:text-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {key === "popular" ? "محبوب‌ترین" : key === "newest" ? "جدیدترین" : "قدیمی‌ترین"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {authLoading ? (
        <CommentFormSkeleton />
      ) : user ? (
        <form onSubmit={handleTopSubmit} className={compact ? "space-y-3 mb-4" : "bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 space-y-4 mb-8"}>
          <input type="hidden" name="module" value={module} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="parentId" value="" />
          <div className={`flex items-center gap-3 ${compact ? "pb-2" : "border-b-[length:var(--border-size)] border-[var(--border-color)] pb-3"}`}>
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

          {/* Star rating (item 8) — only for shop module */}
          {module === "shop" && (
            <div className="flex items-center gap-3 py-2">
              <span className="text-[12px] font-medium text-[var(--paragraph-color)]">امتیاز شما:</span>
              <div className="flex items-center gap-1" dir="rtl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    disabled={ratingSubmitting}
                    className="p-0.5 transition-transform hover:scale-110 relative"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <svg
                      className={`size-6 ${(star <= (hoverRating || myRating)) ? "fill-[#f9bc00] text-[#f9bc00]" : "fill-transparent text-muted-foreground hover:text-[#f9bc00]"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground pointer-events-none opacity-0 group-hover:opacity-100">{star}</span>
                  </button>
                ))}
              </div>
              {myRating > 0 && (
                <span className="text-[11px] text-muted-foreground">({myRating.toLocaleString("fa-IR")} از ۵)</span>
              )}
            </div>
          )}

          {/* Strength / Weakness — dynamic single-line fields (item 9) */}
          {module === "shop" && !compact && (
            <div className="space-y-4">
              {/* Weakness first */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                  نقاط ضعف
                </label>
                {cons.map((val, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const updated = [...cons];
                        updated[idx] = e.target.value;
                        setCons(updated);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const updated = [...cons];
                          updated[idx] = e.currentTarget.value.trim();
                          updated.push("");
                          setCons(updated);
                          setTimeout(() => {
                            const el = document.getElementById(`cons-field-${idx + 1}`);
                            if (el) (el as HTMLInputElement).focus();
                          }, 10);
                        }
                      }}
                      id={`cons-field-${idx}`}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 text-red-600"
                      placeholder="هر مورد در یک خط..."
                      disabled={topSubmitting}
                    />
                  </div>
                ))}
              </div>
              {/* Strength second */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  نقاط قوت
                </label>
                {pros.map((val, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const updated = [...pros];
                        updated[idx] = e.target.value;
                        setPros(updated);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const updated = [...pros];
                          updated[idx] = e.currentTarget.value.trim();
                          updated.push("");
                          setPros(updated);
                          setTimeout(() => {
                            const el = document.getElementById(`pros-field-${idx + 1}`);
                            if (el) (el as HTMLInputElement).focus();
                          }, 10);
                        }
                      }}
                      id={`pros-field-${idx}`}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 text-emerald-600"
                      placeholder="هر مورد در یک خط..."
                      disabled={topSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea
            name="text"
            placeholder={compact ? "دیدگاه شما..." : "دیدگاه خود را درباره این مطلب بنویسید..."}
            className={compact ? "min-h-[40px] h-[40px] w-full text-sm text-[var(--paragraph-color)] resize-none overflow-hidden" : "min-h-[100px] w-full text-sm text-[var(--paragraph-color)]"}
            onInput={(e) => {
              if (compact) {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '40px';
                target.style.height = `${target.scrollHeight}px`;
              }
            }}
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
        <div className={compact ? "text-center py-2 mb-4" : "bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 text-center space-y-3 mb-8 bg-[var(--card-background)]/40 border-dashed"}>
          {!compact && (
            <>
              <h4 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--primary-text)]">برای ثبت دیدگاه وارد شوید</h4>
              <p className="text-sm text-[var(--paragraph-color)] paragraph-color max-w-md mx-auto">
                برای ثبت دیدگاه، پاسخ به نظرات دیگران و پسندیدن مطالب، ابتدا باید وارد حساب کاربری خود شوید یا در کمتر از یک دقیقه ثبت‌نام کنید.
              </p>
            </>
          )}
          <div className={compact ? "" : "pt-2"}>
            <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent("tb_open_auth"))} size="sm">ورود یا ثبت‌نام</Button>
          </div>
        </div>
      )}

      <div className="space-y-1 min-h-[60px]">
        {loading ? (
          <CommentListSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-sm font-semibold paragraph-color text-center py-6">هنوز دیدگاهی برای این مطلب ثبت نشده است. اولین نفر باشید!</p>
        ) : (
          sortedComments.map(c => renderNode(c, 0))
        )}
      </div>
    </section>
  );
}
