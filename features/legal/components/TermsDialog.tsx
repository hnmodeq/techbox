"use client";

/**
 * TermsDialog — the terms, shown without leaving the page.
 *
 * Used in two places, deliberately sharing one component:
 *   - the newsletter card, where sending someone to /terms to read two
 *     paragraphs would abandon a half-filled form;
 *   - /terms itself, so the same presentation is available there.
 *
 * The content is authored in the admin panel and stored as HTML in
 * SiteSetting["terms.content"] — the same row app/terms/page.tsx reads.
 * It is fetched on FIRST OPEN, not on mount: this renders on the homepage,
 * and adding a query to every homepage load is how connection-pool problems
 * start here.
 */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type TermsDialogProps = {
  /** The clickable element. Rendered inside DialogTrigger. */
  children: React.ReactNode;
  title?: string;
  /** Pre-loaded HTML. When given, no fetch happens. */
  content?: string;
};

export function TermsDialog({
  children,
  title = "قوانین و حریم خصوصی",
  content,
}: TermsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [html, setHtml] = React.useState(content ?? "");
  const [loading, setLoading] = React.useState(false);
  const loadedRef = React.useRef(Boolean(content));

  React.useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch("/api/terms", { cache: "force-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setHtml(typeof data?.content === "string" ? data.content : ""))
      .catch(() => setHtml(""))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4" aria-live="polite">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        ) : html ? (
          // Admin-authored HTML, same as app/terms/page.tsx renders.
          <article
            className="prose prose-sm max-w-none leading-8 text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            محتوای این بخش هنوز تنظیم نشده است.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TermsDialog;
