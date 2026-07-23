"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Network, RotateCcw } from "lucide-react";

function ipToInt(ip: string) {
  return ip.split(".").reduce((a, o) => (a << 8) + parseInt(o || "0"), 0) >>> 0;
}
function intToIp(n: number) {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
}
function isValidIp(ip: string) {
  const p = ip.split(".");
  return p.length === 4 && p.every((o) => /^\d+$/.test(o) && +o >= 0 && +o <= 255);
}

const CIDR_PRESETS = [
  { cidr: 24, label: "/24", mask: "255.255.255.0", hosts: "۲۵۴" },
  { cidr: 25, label: "/25", mask: "255.255.255.128", hosts: "۱۲۶" },
  { cidr: 26, label: "/26", mask: "255.255.255.192", hosts: "۶۲" },
  { cidr: 27, label: "/27", mask: "255.255.255.224", hosts: "۳۰" },
  { cidr: 28, label: "/28", mask: "255.255.255.240", hosts: "۱۴" },
  { cidr: 29, label: "/29", mask: "255.255.255.248", hosts: "۶" },
  { cidr: 30, label: "/30", mask: "255.255.255.252", hosts: "۲" },
];

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const valid = isValidIp(ip);

  const out = useMemo(() => {
    if (!valid) return null;
    const mask = (~((1 << (32 - cidr)) - 1)) >>> 0;
    const net = ipToInt(ip) & mask;
    const broadcast = net | (~mask >>> 0);
    const hosts = Math.max(0, (1 << (32 - cidr)) - 2);
    return {
      network: intToIp(net),
      broadcast: intToIp(broadcast),
      mask: intToIp(mask),
      first: hosts > 0 ? intToIp(net + 1) : "—",
      last: hosts > 0 ? intToIp(broadcast - 1) : "—",
      hosts,
    };
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
          <label className="text-sm font-medium">آدرس IP</label>
          <Input
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
            <label className="text-sm font-medium">پیشوند شبکه</label>
            <Badge variant="secondary" dir="ltr">/{cidr}</Badge>
          </div>
          <input
            type="range"
            min={8}
            max={30}
            step={1}
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground" dir="ltr">
            <span>/8</span>
            <span>/30</span>
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
              <span className="text-muted-foreground">تعداد میزبان قابل استفاده</span>
              <span className="font-bold text-primary">{out.hosts.toLocaleString("fa-IR")}</span>
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
