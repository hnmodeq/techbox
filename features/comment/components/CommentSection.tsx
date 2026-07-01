"use client";
import * as React from "react";
import { useActionState, useEffect, useOptimistic, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction, voteCommentAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/LikeButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
 const [isPending, startTransition] = useTransition();

 const load = React.useCallback(async () => {
 setLoading(true);
 try {
 const data = await getCommentsAction(module, slug);
 setComments(nestFlat(data as any));
 } finally {
 setLoading(false);
 }
 }, [module, slug]);

 useEffect(() => { load(); }, [load]);

 // Server Action form – useActionState (React 19)
 const [state, formAction, isSubmitting] = useActionState(
 async (_prev: any, formData: FormData) => {
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

 const renderNode = (c: CommentNode, depth = 0) => (
 <div key={c.id} style={{ marginRight: depth ? 16 : 0, marginTop: 12 }}>
 <div className={depth ? "border-r-2 border-[var(--tb-border)] pe-3" : "pe-0"} style={{ marginRight: depth ? 12 : 0 }}>
 <div className="card p-4">
 <div className="flex justify-between items-center gap-2">
 <div className=" tb-text-sm">{(c as any).authorName || "کاربر"}</div>
 <div className="tb-text-sm text-[var(--tb-fg-muted)]">
 {new Date((c as any).createdAt).toLocaleString("fa-IR", { dateStyle:"medium", timeStyle:"short" })}
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
 onClick={()=> setReplyOpen(replyOpen===c.id ? null : c.id)}
 variant="link"
 size="xs"
 className="tb-text-sm text-[var(--tb-fg-muted)]"
 type="button"
 >
 {replyOpen===c.id ? "بستن" : "پاسخ"}
 </Button>
 </div>

 {replyOpen===c.id && (
 <form action={formAction} className="mt-3 space-y-2">
 <input type="hidden" name="module" value={module} />
 <input type="hidden" name="slug" value={slug} />
 <input type="hidden" name="parentId" value={c.id} />
 <input type="hidden" name="authorName" value="مهمان" />
 <textarea name="text" required className="input min-h-[90px] tb-text-sm" placeholder={`پاسخ به ${(c as any).authorName}…`} />
 <div className="flex justify-end gap-2">
 <Button type="button" variant="ghost" size="xs" onClick={()=>setReplyOpen(null)}>انصراف</Button>
 <Button disabled={isSubmitting || isPending} size="xs">
 {isSubmitting ? "در حال ارسال…" : "ارسال پاسخ"}
 </Button>
 </div>
 </form>
 )}
 </div>
 {c.replies && c.replies.length > 0 && (
 <div className="mt-2 space-y-2">
 {c.replies.map((r:any) => renderNode(r, depth+1))}
 </div>
 )}
 </div>
 </div>
 );

 const totalCount = comments.reduce((s, c:any) => s + 1 + ((c.replies?.length)||0), 0);

 return (
 <section className="mt-14 border-t border-[var(--tb-border)] pt-10">
 <div className="flex items-center justify-between mb-4">
 <h3 className="tb-text-lg ">نظرات <span className="tb-text-sm text-[var(--tb-fg-muted)]">({totalCount.toLocaleString("fa-IR")})</span></h3>
 <Badge variant="secondary" className="tb-text-sm">Server Actions • Prisma</Badge>
 </div>

 {/* new top-level comment – Server Action */}
 <form action={formAction} className="card p-4 space-y-3 mb-7">
 <input type="hidden" name="module" value={module} />
 <input type="hidden" name="slug" value={slug} />
 <input type="hidden" name="parentId" value="" />
 <div className="grid sm:grid-cols-3 gap-2">
 <input name="authorName" placeholder="نام شما" className="input tb-text-md" />
 <input name="email" type="email" placeholder="ایمیل (اختیاری)" className="input tb-text-md sm:col-span-2" />
 </div>
 <textarea name="text" required placeholder="نظر خود را بنویسید… (Server Action – app/actions/comments.ts)" className="input min-h-[110px] tb-text-sm" />
 <div className="flex justify-between items-center">
 <span className="tb-text-sm text-[var(--tb-fg-muted)]">
 {state?.ok ? <span className="text-[var(--tb-success)]">✓ ثبت شد – revalidatePath انجام شد</span> : "ارسال → createCommentAction → Prisma → revalidatePath"}
 </span>
 <Button disabled={isSubmitting || isPending} size="sm">
 {isSubmitting ? "…" : "ارسال نظر"}
 </Button>
 </div>
 </form>

 <div className="space-y-1 min-h-[60px]">
 {loading ? (
 <p className="tb-text-md text-[var(--tb-fg-muted)]">در حال بارگذاری نظرات از Prisma…</p>
 ) : comments.length === 0 ? (
 <p className="tb-text-md text-[var(--tb-fg-muted)]">اولین نظر را شما ثبت کنید.</p>
 ) : (
 comments.map(c => renderNode(c, 0))
 )}
 </div>
 </section>
 );
}
