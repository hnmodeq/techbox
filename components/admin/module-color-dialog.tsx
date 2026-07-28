"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const QUICK_COLORS = [
  "#1d4ed8", "#6d28d9", "#be185d", "#b91c1c", "#b45309",
  "#047857", "#0f766e", "#0e7490", "#334155", "#111827",
];

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - chroma / 2;
  const [r, g, b] = hue < 60
    ? [chroma, x, 0]
    : hue < 120
      ? [x, chroma, 0]
      : hue < 180
        ? [0, chroma, x]
        : hue < 240
          ? [0, x, chroma]
          : hue < 300
            ? [x, 0, chroma]
            : [chroma, 0, x];
  const channel = (value: number) => Math.round((value + m) * 255).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** A broad in-app hue/lightness spectrum; the native picker below covers every RGB value. */
const FULL_PALETTE = Array.from({ length: 24 }, (_, hueIndex) => {
  const hue = hueIndex * 15;
  return [26, 36, 46, 56, 66].map((lightness) => hslToHex(hue, 78, lightness));
}).flat();

function ColorSwatch({
  color,
  value,
  onChange,
  compact = false,
}: {
  color: string;
  value: string;
  onChange: (color: string) => void;
  compact?: boolean;
}) {
  const selected = color.toLowerCase() === value.toLowerCase();
  return (
    <button
      type="button"
      aria-label={`انتخاب رنگ ${color}`}
      aria-pressed={selected}
      onClick={() => onChange(color)}
      className={compact
        ? "group relative grid aspect-square place-items-center rounded-sm border border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        : "group relative grid aspect-square place-items-center rounded-md border border-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"}
      style={{ backgroundColor: color }}
    >
      {selected && <span aria-hidden="true" className="size-2 rounded-full bg-white shadow ring-1 ring-black/25" />}
    </button>
  );
}

export function ModuleColorDialog({
  open,
  onOpenChange,
  moduleName,
  value,
  defaultValue,
  onChange,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>رنگ {moduleName}</DialogTitle>
          <DialogDescription>
            از طیف کامل رنگ انتخاب کنید یا با انتخاب‌گر رنگ، هر رنگ دلخواه را بسازید. تغییر پس از ذخیره در تمام عناصر مرتبط با این ماژول اعمال می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <span
              aria-hidden="true"
              className="size-14 shrink-0 rounded-full border-4 border-background shadow-sm"
              style={{ backgroundColor: value }}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">رنگ انتخاب‌شده</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">رنگ پیش‌فرض: <span dir="ltr">{defaultValue}</span></p>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-foreground">رنگ‌های پیشنهادی</legend>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {QUICK_COLORS.map((color) => (
                <ColorSwatch key={color} color={color} value={value} onChange={onChange} />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-foreground">طیف کامل رنگ</legend>
            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12">
              {FULL_PALETTE.map((color) => (
                <ColorSwatch key={color} color={color} value={value} onChange={onChange} compact />
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <label htmlFor="module-color-picker" className="text-xs font-semibold text-foreground">
                انتخاب‌گر رنگ دلخواه
              </label>
              <p className="mt-1 text-[11px] text-muted-foreground">برای انتخاب هر رنگ خارج از پالت.</p>
            </div>
            <input
              id="module-color-picker"
              type="color"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="size-12 cursor-pointer rounded-md border border-border bg-transparent p-1"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onReset}>
            بازگردانی رنگ پیش‌فرض
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            تأیید
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
