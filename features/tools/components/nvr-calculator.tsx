"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HardDrive, Wifi, ArrowLeft, RotateCcw } from "lucide-react";

const RESOLUTIONS = [
  { value: "720p", label: "720p (HD)", mbps: 2 },
  { value: "1080p", label: "1080p (فول‌اچ‌دی)", mbps: 4 },
  { value: "2k", label: "2K (کواد‌اچ‌دی)", mbps: 8 },
  { value: "4k", label: "4K (اولترا‌اچ‌دی)", mbps: 16 },
];

const HOURS = [
  { value: 8, label: "۸ ساعت (روزانه)" },
  { value: 12, label: "۱۲ ساعت (نیمه‌وقت)" },
  { value: 24, label: "۲۴ ساعت (شبانه‌روزی)" },
];

function formatSize(gb: number): string {
  if (gb < 1000) return `${gb.toLocaleString("fa-IR")} گیگابایت`;
  return `${(gb / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ترابایت`;
}

export function NvrCalculator() {
  const [cameras, setCameras] = useState(8);
  const [days, setDays] = useState(30);
  const [hours, setHours] = useState(24);
  const [resolution, setResolution] = useState("1080p");

  const selectedRes = RESOLUTIONS.find((r) => r.value === resolution) || RESOLUTIONS[1];

  const result = useMemo(() => {
    // Storage: cameras × hours × days × bitrate(Mbps) × 3600(seconds) / 8(to bytes) / 1024(to GB)
    const totalGb = Math.ceil((cameras * hours * days * selectedRes.mbps * 3600) / 8 / 1024 / 1024);
    // Bandwidth: cameras × bitrate
    const bandwidthMbps = cameras * selectedRes.mbps;
    // Recommended RAID (suggestion)
    const raid = cameras >= 16 ? "رید ۶" : cameras >= 4 ? "رید ۵" : "رید ۱";
    // Recommended Bay count
    const driveSizeTb = 4; // Assume 4TB drives
    const baysNeeded = Math.ceil(totalGb / 1024 / driveSizeTb);
    const recommendedBays = baysNeeded <= 1 ? 2 : baysNeeded <= 2 ? 4 : baysNeeded <= 4 ? 8 : 12;

    return { totalGb, bandwidthMbps, raid, recommendedBays };
  }, [cameras, days, hours, selectedRes.mbps]);

  return (
    <div className="w-full max-w-xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">محاسبه‌گر فضای ذخیره‌سازی دوربین</h1>
        <p className="text-sm text-muted-foreground">
          مشخصات سیستم دوربین مداربسته خود را وارد کنید تا فضای مورد نیاز را محاسبه کنیم.
        </p>
      </div>

      {/* Inputs */}
      <Card className="p-5 space-y-5">
        {/* Cameras */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">تعداد دوربین‌ها</Label>
            <Badge variant="secondary">{cameras.toLocaleString("fa-IR")} عدد</Badge>
          </div>
          <input
            type="range"
            min={1}
            max={64}
            value={cameras}
            onChange={(e) => setCameras(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>۱</span>
            <span>۶۴</span>
          </div>
        </div>

        <Separator />

        {/* Days */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">مدت نگهداری تصاویر</Label>
            <Badge variant="secondary">{days.toLocaleString("fa-IR")} روز</Badge>
          </div>
          <input
            type="range"
            min={1}
            max={365}
            step={1}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>۱ روز</span>
            <span>۳۶۵ روز</span>
          </div>
        </div>

        <Separator />

        {/* Hours */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">ساعات ضبط روزانه</Label>
          <div className="grid grid-cols-3 gap-2">
            {HOURS.map((h) => (
              <button
                key={h.value}
                type="button"
                onClick={() => setHours(h.value)}
                className={`rounded-lg border-2 p-2 text-xs font-medium text-center transition-all ${
                  hours === h.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">رزولوشن دوربین‌ها</Label>
          <div className="grid grid-cols-2 gap-2">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setResolution(r.value)}
                className={`rounded-lg border-2 p-2 text-xs font-medium text-center transition-all ${
                  resolution === r.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                {r.label}
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.mbps} مگابیت/ثانیه</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold">نتیجه محاسبه</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <HardDrive className="size-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{formatSize(result.totalGb)}</div>
            <div className="text-[10px] text-muted-foreground">فضای مورد نیاز</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <Wifi className="size-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{result.bandwidthMbps.toLocaleString("fa-IR")} مگابیت/ثانیه</div>
            <div className="text-[10px] text-muted-foreground">پهنای باند مورد نیاز</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">تعداد دوربین:</span>
            <span className="font-medium">{cameras.toLocaleString("fa-IR")} عدد</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">رزولوشن:</span>
            <span className="font-medium">{selectedRes.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ساعات ضبط:</span>
            <span className="font-medium">{hours.toLocaleString("fa-IR")} ساعت در روز</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">مدت نگهداری:</span>
            <span className="font-medium">{days.toLocaleString("fa-IR")} روز</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">پیشنهاد رید:</span>
            <span className="font-medium">{result.raid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">پیشنهاد تعداد درایو:</span>
            <span className="font-medium">بالای {result.recommendedBays.toLocaleString("fa-IR")} درایو</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => { setCameras(8); setDays(30); setHours(24); setResolution("1080p"); }} className="gap-1.5">
          <RotateCcw className="size-3" />
          بازنشانی
        </Button>
        <Button onClick={() => window.open("/consultation", "_self")} className="gap-1.5">
          مشاوره رایگان
          <ArrowLeft className="size-3" />
        </Button>
      </div>
    </div>
  );
}
