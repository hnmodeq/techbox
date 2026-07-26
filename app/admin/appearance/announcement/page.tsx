"use client";

/**
 * Admin · Homepage announcement bar.
 *
 * Decision D7: the bar is for campaigns and events only, so it ships
 * disabled and the toggle is the primary control. Everything writes to
 * the single `home.announcement` SiteSetting key through the existing
 * /api/admin/settings endpoint — no bespoke route.
 *
 * The live preview renders in BOTH themes side by side, because the bar
 * is one of the few places where a tone choice can look fine in light and
 * unreadable in dark.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §0
 */
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

type Tone = "brand" | "accent" | "deal";

type Announcement = {
  enabled: boolean;
  version: number;
  textFa: string;
  boldLeadFa: string;
  ctaLabelFa: string;
  href: string;
  startsAt: string;
  endsAt: string;
  tone: Tone;
};

const EMPTY: Announcement = {
  enabled: false,
  version: 1,
  textFa: "",
  boldLeadFa: "",
  ctaLabelFa: "",
  href: "",
  startsAt: "",
  endsAt: "",
  tone: "brand",
};

const TONE_LABEL: Record<Tone, string> = {
  brand: "برند (سرمه‌ای)",
  accent: "تأکید",
  deal: "تخفیف (قرمز)",
};

export default function AnnouncementAdminPage() {
  const [value, setValue] = useState<Announcement>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((map) => {
        try {
          const parsed = JSON.parse(map["home.announcement"] || "{}");
          setValue({ ...EMPTY, ...parsed });
        } catch {
          setValue(EMPTY);
        }
      })
      .catch(() => toast.error("خواندن تنظیمات ناموفق بود"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Announcement>(k: K, v: Announcement[K]) =>
    setValue((s) => ({ ...s, [k]: v }));

  async function save(next: Announcement = value) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "home.announcement": JSON.stringify(next) }),
      });
      if (!res.ok) throw new Error();
      setValue(next);
      toast.success("اطلاعیه ذخیره شد");
    } catch {
      toast.error("ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  /** Bumping the version re-shows the bar to everyone who dismissed it. */
  const bumpVersion = () => save({ ...value, version: (value.version || 1) + 1 });

  if (loading) {
    return (
      <AdminGuard>
        {() => <div className="p-6 text-sm text-muted-foreground">در حال بارگذاری…</div>}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      {() => (
      <div dir="rtl" className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <PageHeader
          title="نوار اطلاعیه صفحه اصلی"
          description="فقط برای کمپین‌ها و رویدادها. وقتی غیرفعال است، هیچ عنصری در صفحه رندر نمی‌شود."
        />

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>وضعیت</CardTitle>
              <CardDescription>
                نسخه فعلی: {value.version} — با افزایش نسخه، اطلاعیه دوباره به
                کاربرانی که آن را بسته‌اند نمایش داده می‌شود.
              </CardDescription>
            </div>
            <Switch
              checked={value.enabled}
              onCheckedChange={(v: boolean) => set("enabled", v)}
              aria-label="فعال‌سازی اطلاعیه"
            />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متن</CardTitle>
            <CardDescription>
              بخش پررنگ در ابتدای جمله می‌آید، سپس متن اصلی و در انتها لینک دعوت به اقدام.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field id="boldLeadFa" label="بخش پررنگ (اختیاری)" value={value.boldLeadFa}
              onChange={(v) => set("boldLeadFa", v)} placeholder="الکامپ ۱۴۰۵" />
            <Field id="textFa" label="متن اطلاعیه" value={value.textFa}
              onChange={(v) => set("textFa", v)} placeholder="تکباکس غرفه B12 — منتظر شما هستیم" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ctaLabelFa" label="برچسب لینک (اختیاری)" value={value.ctaLabelFa}
                onChange={(v) => set("ctaLabelFa", v)} placeholder="ثبت‌نام کنید «" />
              <Field id="href" label="آدرس لینک" value={value.href} dir="ltr"
                onChange={(v) => set("href", v)} placeholder="/landing/elecomp" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ظاهر و زمان‌بندی</CardTitle>
            <CardDescription>
              خارج از بازه زمانی، اطلاعیه به‌صورت خودکار پنهان می‌شود — نیازی به
              خاموش کردن دستی نیست.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">رنگ</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TONE_LABEL) as Tone[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={value.tone === t ? "primary" : "outline"}
                    size="sm"
                    onClick={() => set("tone", t)}
                  >
                    {TONE_LABEL[t]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="startsAt" label="شروع (اختیاری)" type="datetime-local"
                value={value.startsAt} onChange={(v) => set("startsAt", v)} />
              <Field id="endsAt" label="پایان (اختیاری)" type="datetime-local"
                value={value.endsAt} onChange={(v) => set("endsAt", v)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>پیش‌نمایش</CardTitle>
            <CardDescription>در هر دو حالت روشن و تاریک</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Preview value={value} />
            <div className="dark">
              <Preview value={value} />
            </div>
            {!value.enabled && (
              <p className="text-xs text-muted-foreground">
                اطلاعیه غیرفعال است و در صفحه اصلی رندر نمی‌شود.
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => save()} disabled={saving}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
          <Button variant="outline" onClick={bumpVersion} disabled={saving}>
            نمایش مجدد به همه (افزایش نسخه)
          </Button>
        </div>
      </div>
      )}
    </AdminGuard>
  );
}

function Field({
  id, label, value, onChange, placeholder, type = "text", dir,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string; type?: string; dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      <Input id={id} type={type} value={value} dir={dir}
        placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Mirrors the real bar's markup so what you see is what ships. */
function Preview({ value }: { value: Announcement }) {
  const tone =
    value.tone === "accent"
      ? "bg-[color:var(--hp-accent)] text-[color:var(--hp-on-accent)]"
      : value.tone === "deal"
        ? "bg-[color:var(--hp-deal)] text-white"
        : "bg-[color:var(--hp-brand-ink)] text-[color:var(--hp-on-brand)]";

  return (
    <div className={`rounded-md ${tone}`}>
      <div className="relative flex min-h-11 items-center justify-center px-12 py-2">
        <p className="text-center text-[14px] leading-6">
          {value.boldLeadFa && <strong className="font-bold">{value.boldLeadFa}</strong>}
          {value.boldLeadFa ? " " : null}
          {value.textFa || <span className="opacity-60">متن اطلاعیه…</span>}
          {value.href && value.ctaLabelFa ? (
            <> <span className="underline underline-offset-2">{value.ctaLabelFa}</span></>
          ) : null}
        </p>
        <span aria-hidden="true" className="absolute end-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
          ×
        </span>
      </div>
    </div>
  );
}
