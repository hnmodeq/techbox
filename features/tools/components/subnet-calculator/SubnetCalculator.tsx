"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/design/icons";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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

const RESULT_LABELS: Record<string, string> = {
  network: "آدرس شبکه",
  broadcast: "آدرس Broadcast",
  mask: "Subnet Mask",
  first: "اولین IP قابل استفاده",
  last: "آخرین IP قابل استفاده",
  hosts: "تعداد میزبان قابل استفاده",
};

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
      hosts: hosts.toLocaleString("fa-IR"),
    };
  }, [ip, cidr, valid]);

  return (
    <div className="space-y-5" dir="rtl">
      <Card className="p-5 space-y-2">
        <CardHeader className="p-0 flex flex-row items-center gap-2">
          <Icon name="server" size={20} strokeWidth={1.75} className="text-[var(--subnet)]" />
          <CardTitle className="text-[var(--subnet)]">ماشین‌حساب ساب‌نت (Subnet) چیست؟</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <CardDescription className="leading-8 text-sm">
            «ساب‌نت» یعنی تقسیم یک شبکه بزرگ به چند شبکه کوچک‌تر. با این ابزار کافیست یک آدرس IP و یک «پیشوند» (CIDR مثل <span dir="ltr" className="font-mono">/24</span>) وارد کنید تا ببینید شبکه شما از کجا شروع و به کجا ختم می‌شود، چه ماسکی دارد و چند دستگاه می‌توانند در آن IP بگیرند. مناسب برای طراحی شبکه، پیکربندی روتر/سوییچ و آدرس‌دهی سرورها.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>آدرس IP</Label>
            <Input value={ip} onChange={(e) => setIp(e.target.value)} className={`font-mono text-left ${!valid ? "border-destructive" : ""}`} dir="ltr" placeholder="192.168.1.0" />
            {!valid && <span className="text-xs text-destructive">آدرس IP معتبر نیست (مثال: 192.168.1.0)</span>}
          </div>
          <div className="space-y-3">
            <Label>
              پیشوند شبکه: <Badge variant="outline" dir="ltr">/{cidr}</Badge>
              {out && <span className="ms-2 text-xs text-muted-foreground">— ماسک <span dir="ltr" className="font-mono">{out.mask}</span></span>}
            </Label>
            <Slider min={8} max={30} step={1} value={[cidr]} onValueChange={(v: any) => { const val = Array.isArray(v) ? v[0] : v; setCidr(val); }} />
            <div className="flex justify-between text-xs text-muted-foreground" dir="ltr"><span>/8</span><span>/30</span></div>
          </div>
        </div>
      </Card>

      {out && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(["network", "broadcast", "mask", "first", "last", "hosts"] as const).map((k) => (
            <Card key={k} className="px-3 py-2.5">
              <div className="text-xs text-muted-foreground">{RESULT_LABELS[k]}</div>
              <div className="mt-1 font-mono text-sm" dir="ltr">{out[k]}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
