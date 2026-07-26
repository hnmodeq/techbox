"use client";

/**
 * §0 · Announcement Bar — Spiceworks announcement strip
 *
 * Spiceworks renders a single centred sentence: a bolded lead, running
 * text, then an inline CTA link. One line, dismissible.
 *
 * Decision D7: this is for campaigns and events ONLY. It is disabled by
 * default and renders `null` — no element, no reserved height, no layout
 * shift — so the homepage normally starts at the tick bar exactly as it
 * does today.
 *
 * Client Component: dismissal state lives in localStorage, keyed by the
 * announcement's version so bumping the version re-shows it to everyone
 * who previously dismissed it.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §0
 */
import * as React from "react";
import Link from "next/link";

export type Announcement = {
  enabled: boolean;
  version: number;
  textFa: string;
  boldLeadFa?: string;
  ctaLabelFa?: string;
  href?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  tone?: "brand" | "accent" | "deal";
};

const TONE: Record<NonNullable<Announcement["tone"]>, string> = {
  brand: "bg-[color:var(--hp-brand-ink)] text-[color:var(--hp-on-brand)]",
  accent: "bg-[color:var(--hp-accent)] text-[color:var(--hp-on-accent)]",
  deal: "bg-[color:var(--hp-deal)] text-white",
};

/** True when now falls inside the optional schedule window. */
export function isAnnouncementLive(a: Announcement, now = new Date()): boolean {
  if (!a?.enabled) return false;
  if (!a.textFa?.trim()) return false;
  if (a.startsAt) {
    const s = new Date(a.startsAt);
    if (!Number.isNaN(s.getTime()) && now < s) return false;
  }
  if (a.endsAt) {
    const e = new Date(a.endsAt);
    if (!Number.isNaN(e.getTime()) && now > e) return false;
  }
  return true;
}

export function AnnouncementBar({ announcement }: { announcement?: Announcement | null }) {
  const a = announcement;
  const storageKey = a ? `tb_ann_v${a.version ?? 1}` : "";

  // Start dismissed so the server-rendered markup and the first client
  // render agree; the effect reveals it once localStorage has been read.
  // The alternative — rendering it then hiding — flashes the bar on every
  // page load for users who already dismissed it.
  const [ready, setReady] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false); // private mode: show it rather than hide it
    }
    setReady(true);
  }, [storageKey]);

  if (!a || !isAnnouncementLive(a)) return null;
  if (!ready || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* non-fatal */
    }
  };

  const body = (
    <>
      {a.boldLeadFa && <strong className="font-bold">{a.boldLeadFa}</strong>}
      {a.boldLeadFa ? " " : null}
      {a.textFa}
      {a.href && a.ctaLabelFa ? (
        <>
          {" "}
          <Link href={a.href} className="underline underline-offset-2 hover:opacity-80">
            {a.ctaLabelFa}
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <div role="region" aria-label="اطلاعیه" className={TONE[a.tone ?? "brand"]}>
      <div className="relative mx-auto flex min-h-11 max-w-[1280px] items-center justify-center px-12 py-2">
        <p className="text-center text-[14px] leading-6">{body}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن اطلاعیه"
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1 text-lg leading-none opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
