import Image from "next/image";
import { cn } from "@/lib/utils";

function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-bounce rounded-full bg-[color:var(--module-tools-color,var(--primary))]"
          style={{ animationDelay: `${index * 120}ms`, animationDuration: "850ms" }}
        />
      ))}
    </span>
  );
}

export function TechboxLoader({
  className,
  label = "در حال بارگذاری",
  fullPage = false,
}: {
  className?: string;
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden bg-background p-6",
        fullPage ? "min-h-[70svh]" : "min-h-56",
        className,
      )}
      dir="rtl"
    >
      <Image
        src="/logo.png"
        alt=""
        width={420}
        height={420}
        aria-hidden="true"
        className="pointer-events-none absolute -start-20 top-1/2 -z-20 size-[26rem] -translate-y-1/2 object-contain opacity-[0.06] blur-sm"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_80%,color-mix(in_srgb,var(--module-tools-color,var(--primary))_20%,transparent),transparent_35%),radial-gradient(circle_at_75%_20%,rgba(239,68,68,.12),transparent_32%)]" />
      <div className="flex min-h-36 w-full max-w-[260px] flex-col items-center justify-center rounded-md border border-border bg-card/95 px-8 py-7 shadow-xl backdrop-blur">
        <Image src="/logo.png" alt="تکباکس" width={48} height={48} className="size-12 object-contain" loading="eager" />
        <LoadingDots className="mt-4" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

export function TechboxInlineLoader({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span role="status" aria-label="در حال بارگذاری" className={cn("inline-flex items-center", className)} {...props}>
      <LoadingDots />
    </span>
  );
}
