"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PALETTE = [
  "#1d4ed8", "#6d28d9", "#be185d", "#b91c1c", "#b45309",
  "#047857", "#0f766e", "#0e7490", "#334155", "#111827",
];

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
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>رنگ {moduleName}</DialogTitle>
          <DialogDescription>
            یک رنگ را از پالت انتخاب کنید یا با انتخاب‌گر رنگ، رنگ دلخواهتان را بسازید. تغییر در پیش‌نمایش و پس از ذخیره در سایت اعمال می‌شود.
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
            <legend className="mb-2 text-xs font-semibold text-foreground">پالت پیشنهادی</legend>
            <div className="grid grid-cols-5 gap-2">
              {PALETTE.map((color) => {
                const selected = color.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`انتخاب رنگ ${color}`}
                    aria-pressed={selected}
                    onClick={() => onChange(color)}
                    className="group relative grid aspect-square place-items-center rounded-md border border-border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: color }}
                  >
                    {selected && <span aria-hidden="true" className="size-2 rounded-full bg-white shadow" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <label htmlFor="module-color-picker" className="text-xs font-semibold text-foreground">
              رنگ سفارشی
            </label>
            <input
              id="module-color-picker"
              type="color"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="size-10 cursor-pointer rounded-md border border-border bg-transparent p-1"
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
