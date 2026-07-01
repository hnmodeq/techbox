"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/design/icons";

function ipToInt(ip: string) { return ip.split(".").reduce((a, o) => (a << 8) + parseInt(o || "0"), 0) >>> 0; }
function intToIp(n: number) { return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join("."); }
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
      {/* What is it? */}
      <div className="card p-5 space-y-2">
        <div className="flex items-center gap-2 tb-text-lg text-[var(--tb-subnet)]">
          <Icon name="server" size={20} strokeWidth={1.75} />
          ماشین‌حساب ساب‌نت (Subnet) چیست؟
        </div>
        <p className="tb-text-md text-[var(--tb-fg-muted)] leading-8">
          «ساب‌نت» یعنی تقسیم یک شبکه بزرگ به چند شبکه کوچک‌تر. با این ابزار کافیست یک
          آدرس IP و یک «پیشوند» (CIDR مثل <span dir="ltr" className="font-mono">/24</span>) وارد کنید تا
          ببینید شبکه شما از کجا شروع و به کجا ختم می‌شود، چه ماسکی دارد و چند دستگاه
          می‌توانند در آن IP بگیرند. مناسب برای طراحی شبکه، پیکربندی روتر/سوییچ و
          آدرس‌دهی سرورها.
        </p>
      </div>

      {/* Inputs */}
      <div className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-1 block">
            <span className="tb-text-sm text-[var(--tb-fg-muted)]">آدرس IP</span>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className={`input font-mono text-left ${!valid ? "border-[var(--tb-danger)]" : ""}`}
              dir="ltr"
              placeholder="192.168.1.0"
            />
            {!valid && <span className="tb-text-sm text-[var(--tb-danger)]">آدرس IP معتبر نیست (مثال: 192.168.1.0)</span>}
          </label>
          <label className="space-y-2 block">
            <span className="tb-text-sm text-[var(--tb-fg-muted)]">
              پیشوند شبکه: <span dir="ltr" className="font-mono text-[var(--tb-subnet)]">/{cidr}</span>
              {out && <span className="text-[var(--tb-fg-muted)]"> — ماسک <span dir="ltr" className="font-mono">{out.mask}</span></span>}
            </span>
            <input
              type="range"
              min={8}
              max={30}
              value={cidr}
              onChange={(e) => setCidr(parseInt(e.target.value))}
              className="w-full accent-[var(--tb-subnet)]"
            />
            <div className="flex justify-between tb-text-sm text-[var(--tb-fg-muted)]" dir="ltr">
              <span>/8</span><span>/30</span>
            </div>
          </label>
        </div>
      </div>

      {/* Results */}
      {out && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(["network", "broadcast", "mask", "first", "last", "hosts"] as const).map((k) => (
            <div key={k} className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] px-3 py-2.5">
              <div className="tb-text-sm text-[var(--tb-fg-muted)]">{RESULT_LABELS[k]}</div>
              <div className="mt-1 font-mono text-[var(--tb-fg-primary)]" dir="ltr">{out[k]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
