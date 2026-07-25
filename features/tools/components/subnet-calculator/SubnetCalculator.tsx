"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Network, RotateCcw } from "lucide-react";
import { calculateSubnet, isValidIpv4 } from "@/lib/subnet";

const CIDR_PRESETS = [24, 25, 26, 27, 28, 29, 30, 31, 32].map((cidr) => ({ cidr, label: `/${cidr}` }));

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const valid = isValidIpv4(ip);

  const out = useMemo(() => {
    if (!valid) return null;
    return calculateSubnet(ip, cidr);
  }, [ip, cidr, valid]);

  return (
    <div className="w-full max-w-xl space-y-6" dir="rtl">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Network className="size-6" />
          محاسبه زیرشبکه
        </h1>
        <p className="text-sm text-muted-foreground">
          آدرس IP و پیشوند شبکه را وارد کنید تا اطلاعات شبکه محاسبه شود.
        </p>
      </div>

      {/* Inputs */}
      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <label htmlFor="subnet-ip" className="text-sm font-medium">آدرس IP</label>
          <Input
            id="subnet-ip"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className={`font-mono ${!valid ? "border-destructive" : ""}`}
            dir="ltr"
            placeholder="192.168.1.0"
          />
          {!valid && <p className="text-xs text-destructive">آدرس IP معتبر نیست</p>}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="subnet-cidr" className="text-sm font-medium">پیشوند شبکه</label>
            <Badge variant="secondary" dir="ltr">/{cidr}</Badge>
          </div>
          <input
            id="subnet-cidr"
            aria-label="پیشوند CIDR"
            type="range"
            min={0}
            max={32}
            step={1}
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground" dir="ltr">
            <span>/0</span>
            <span>/32</span>
          </div>
        </div>

        {/* Quick presets */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">پیشوندهای رایج</label>
          <div className="flex flex-wrap gap-1.5">
            {CIDR_PRESETS.map((p) => (
              <button
                key={p.cidr}
                type="button"
                onClick={() => setCidr(p.cidr)}
                className={`rounded-md border px-2 py-1 text-[10px] font-mono transition-colors ${
                  cidr === p.cidr
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {out && (
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold">نتیجه محاسبه</h3>
          <div className="space-y-2">
            {[
              { label: "آدرس شبکه", value: out.network },
              { label: "Broadcast", value: out.broadcast },
              { label: "Subnet Mask", value: out.mask },
              { label: "اولین IP قابل استفاده", value: out.first },
              { label: "آخرین IP قابل استفاده", value: out.last },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-mono" dir="ltr">{row.value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">تعداد کل آدرس‌ها</span>
              <span className="font-bold">{out.totalAddresses.toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">تعداد میزبان قابل استفاده</span>
              <span className="font-bold text-primary">{out.usableHosts.toLocaleString("fa-IR")}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Reset */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => { setIp("192.168.1.0"); setCidr(24); }} className="gap-1.5">
          <RotateCcw className="size-3" />
          بازنشانی
        </Button>
      </div>
    </div>
  );
}
