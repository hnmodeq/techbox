"use client";
import * as React from "react";
import { useActionState, useEffect, useOptimistic, useTransition, useState } from "react";
import { getCommentsAction, createCommentAction, voteCommentAction } from "@/features/comment/actions/comments";
import { CommentVote } from "@/components/ui/LikeButton";

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
      <div className="border-r-2 pe-3" style={{ borderColor: depth ? "var(--border)" : "transparent", paddingRight: depth ? 12 : 0 }}>
        <div className="card p-4" style={{background:"var(--card)"}}>
          <div className="flex justify-between items-center gap-2">
            <div className="font-bold text-[13px]">{(c as any).authorName || "کاربر"}</div>
            <div className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
              {new Date((c as any).createdAt).toLocaleString("fa-IR", { dateStyle:"medium", timeStyle:"short" })}
            </div>
          </div>
          <p className="text-[13px] leading-7 mt-2" style={{color:"var(--muted-foreground)", whiteSpace:"pre-wrap"}}>{(c as any).text}</p>
          <div className="flex items-center gap-4 mt-3">
            <CommentVote
              id={c.id}
              initialLikes={(c as any).likes ?? 0}
              initialDislikes={(c as any).dislikes ?? 0}
            />
            <button
              onClick={()=> setReplyOpen(replyOpen===c.id ? null : c.id)}
              className="text-[11px] hover:underline"
              style={{color:"var(--muted-foreground)"}}
              type="button"
            >
              {replyOpen===c.id ? "بستن" : "پاسخ"}
            </button>
          </div>

          {replyOpen===c.id && (
            <form action={formAction} className="mt-3 space-y-2">
              <input type="hidden" name="module" value={module} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="parentId" value={c.id} />
              <input type="hidden" name="authorName" value="مهمان" />
              <textarea name="text" required className="input min-h-[90px] text-[12px]" placeholder={`پاسخ به ${(c as any).authorName}…`} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setReplyOpen(null)} className="btn btn-ghost text-[11px]">انصراف</button>
                <button disabled={isSubmitting || isPending} className="btn btn-primary text-[11px]">
                  {isSubmitting ? "در حال ارسال…" : "ارسال پاسخ"}
                </button>
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
    <section className="mt-14 border-t pt-10" style={{borderColor:"var(--border)"}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-black">نظرات <span style={{color:"var(--muted-foreground)"}} className="text-[12px] font-normal">({totalCount.toLocaleString("fa-IR")})</span></h3>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{background:"var(--muted)", color:"var(--muted-foreground)"}}>Server Actions • Prisma</span>
      </div>

      {/* new top-level comment – Server Action */}
      <form action={formAction} className="card p-4 space-y-3 mb-7">
        <input type="hidden" name="module" value={module} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="parentId" value="" />
        <div className="grid sm:grid-cols-3 gap-2">
          <input name="authorName" placeholder="نام شما" className="input text-sm" />
          <input name="email" type="email" placeholder="ایمیل (اختیاری)" className="input text-sm sm:col-span-2" />
        </div>
        <textarea name="text" required placeholder="نظر خود را بنویسید… (Server Action – app/actions/comments.ts)" className="input min-h-[110px] text-[13px]" />
        <div className="flex justify-between items-center">
          <span className="text-[10px]" style={{color:"var(--muted-foreground)"}}>
            {state?.ok ? <span className="text-[var(--tb-success)]">✓ ثبت شد – revalidatePath انجام شد</span> : "ارسال → createCommentAction → Prisma → revalidatePath"}
          </span>
          <button disabled={isSubmitting || isPending} className="btn btn-primary text-[13px]">
            {isSubmitting ? "…" : "ارسال نظر"}
          </button>
        </div>
      </form>

      <div className="space-y-1 min-h-[60px]">
        {loading ? (
          <p style={{color:"var(--muted-foreground)"}} className="text-sm">در حال بارگذاری نظرات از Prisma…</p>
        ) : comments.length === 0 ? (
          <p style={{color:"var(--muted-foreground)"}} className="text-sm">اولین نظر را شما ثبت کنید.</p>
        ) : (
          comments.map(c => renderNode(c, 0))
        )}
      </div>
    </section>
  );
}
