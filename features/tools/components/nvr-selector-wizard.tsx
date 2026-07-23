"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RotateCcw, Check, HardDrive, Wifi } from "lucide-react";

type Product = {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  brand: string | null;
  price: number | null;
  specs: Record<string, unknown>;
  availability: string | null;
};

type Answers = {
  cameras: number;
  days: number;
  hours: number;
  resolution: string;
};

// ─── Step definitions ──────────────────────────────────────────────────────

type SliderStep = {
  id: keyof Answers;
  question: string;
  desc: string;
  type: "slider";
  min: number;
  max: number;
  unit: string;
  formatValue: (v: number) => string;
};

type OptionsStep = {
  id: keyof Answers;
  question: string;
  desc: string;
  type: "options";
  options: { value: string; label: string; desc: string }[];
};

type Step = SliderStep | OptionsStep;

const STEPS: Step[] = [
  {
    id: "cameras",
    question: "چند دوربین دارید؟",
    desc: "تعداد کل دوربین‌های مداربسته‌ای که قرار است تصاویرشان ضبط شود.",
    type: "slider",
    min: 1,
    max: 64,
    unit: "عدد",
    formatValue: (v) => v.toLocaleString("fa-IR"),
  },
  {
    id: "days",
    question: "تصاویر چند روز نگهداری شوند؟",
    desc: "مدت زمانی که تصاویر ضبط‌شده قبل از بازنویسی نگهداری می‌شوند.",
    type: "slider",
    min: 1,
    max: 365,
    unit: "روز",
    formatValue: (v) => v.toLocaleString("fa-IR"),
  },
  {
    id: "hours",
    question: "روزانه چند ساعت ضبط انجام می‌شود؟",
    desc: "آیا دوربین‌ها ۲۴ ساعته ضبط می‌کنند یا فقط ساعات خاصی؟",
    type: "options",
    options: [
      { value: "8", label: "۸ ساعت", desc: "مثلاً فقط ساعات اداری" },
      { value: "12", label: "۱۲ ساعت", desc: "نیمه‌وقت، مثلاً صبح تا شب" },
      { value: "24", label: "۲۴ ساعت", desc: "ضبط شبانه‌روزی و پیوسته" },
    ],
  },
  {
    id: "resolution",
    question: "رزولوشن دوربین‌ها چقدر است؟",
    desc: "رزولوشن بالاتر = کیفیت بهتر + فضای بیشتر + پهنای باند بیشتر.",
    type: "options",
    options: [
      { value: "720p", label: "720p (HD)", desc: "۲ مگابیت/ثانیه – کیفیت پایه، فضای کم" },
      { value: "1080p", label: "1080p (فول‌اچ‌دی)", desc: "۴ مگابیت/ثانیه – رایج‌ترین انتخاب" },
      { value: "2k", label: "2K (کواد‌اچ‌دی)", desc: "۸ مگابیت/ثانیه – جزئیات بالا" },
      { value: "4k", label: "4K (اولترا‌اچ‌دی)", desc: "۱۶ مگابیت/ثانیه – حداکثر کیفیت" },
    ],
  },
];

const RESOLUTION_MBPS: Record<string, number> = {
  "720p": 2,
  "1080p": 4,
  "2k": 8,
  "4k": 16,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBayCount(product: Product): number {
  const specs = product.specs || {};
  const bay = specs["Bay"] || specs["bay"] || specs["Bays"];
  if (!bay) return 0;
  const m = String(bay).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function getCpu(product: Product): string {
  const specs = product.specs || {};
  return String(specs["CPU"] || specs["cpu"] || specs["پردازنده"] || "").toLowerCase();
}

function getRam(product: Product): number {
  const specs = product.specs || {};
  const raw = specs["RAM"] || specs["ram"] || specs["رم"] || specs["Memory"];
  if (!raw) return 0;
  const m = String(raw).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function getNetworkSpeed(product: Product): string {
  const specs = product.specs || {};
  return String(specs["Network Card"] || specs["شبکه"] || specs["network"] || "").toLowerCase();
}

function formatSize(gb: number): string {
  if (gb < 1000) return `${gb.toLocaleString("fa-IR")} گیگابایت`;
  return `${(gb / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ترابایت`;
}

function getStepLabel(stepId: keyof Answers, value: string | number): string {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) return String(value);
  if (step.type === "slider") return `${(step as SliderStep).formatValue(value as number)} ${(step as SliderStep).unit}`;
  const opt = (step as OptionsStep).options.find((o) => o.value === String(value));
  return opt?.label || String(value);
}

// ─── Calculation ─────────────────────────────────────────────────────────────

function calculate(answers: Answers) {
  const mbps = RESOLUTION_MBPS[answers.resolution] || 4;
  const cameras = answers.cameras;
  const hours = answers.hours;
  const days = answers.days;

  // Storage: cameras × (Mbps/8 → MB/s) × 3600 × hours × days → MB, /1024 → GB
  const totalGb = Math.ceil((cameras * (mbps / 8) * 3600 * hours * days) / 1024);
  const totalTb = totalGb / 1024;
  const bandwidthMbps = cameras * mbps;

  // Recommended bays based on storage (assuming 4TB drives with RAID overhead)
  const driveSizeTb = 4;
  const rawBaysNeeded = Math.ceil(totalTb / driveSizeTb);
  // Add overhead for RAID parity + system reserve (~20%)
  const baysWithOverhead = Math.ceil(rawBaysNeeded * 1.25);
  const recommendedBays =
    baysWithOverhead <= 1 ? 2 :
    baysWithOverhead <= 2 ? 4 :
    baysWithOverhead <= 4 ? 8 :
    baysWithOverhead <= 8 ? 12 : 16;

  // RAID recommendation
  let raid: string;
  if (cameras >= 16) raid = "رید ۶";
  else if (cameras >= 4) raid = "رید ۵";
  else raid = "رید ۱";

  // Network recommendation
  let network: string;
  if (bandwidthMbps >= 100) network = "۱۰ گیگابیت اترنت";
  else if (bandwidthMbps >= 30) network = "۲.۵ گیگابیت اترنت";
  else network = "۱ گیگابیت اترنت";

  // CPU recommendation
  let cpu: string;
  if (cameras >= 32 || (cameras >= 16 && answers.resolution === "4k")) cpu = "پردازنده قوی (Xeon / Ryzen)";
  else if (cameras >= 16 || (cameras >= 8 && answers.resolution === "4k")) cpu = "پردازنده میان‌رده (Core i3 / Celeron N5105)";
  else cpu = "پردازنده پایه (Celeron / ARM)";

  // RAM recommendation
  let ram: string;
  if (cameras >= 32) ram = "حداقل ۱۶ گیگابایت";
  else if (cameras >= 16) ram = "حداقل ۸ گیگابایت";
  else ram = "حداقل ۴ گیگابایت";

  return { totalGb, totalTb, bandwidthMbps, recommendedBays, raid, network, cpu, ram };
}

// ─── Product Scoring ─────────────────────────────────────────────────────────
// This is the key: scoring is based on ACTUAL calculation results,
// so different inputs produce genuinely different product rankings.

function scoreProduct(product: Product, answers: Answers, calc: ReturnType<typeof calculate>): number {
  let score = 20;
  const bay = getBayCount(product);
  const cpu = getCpu(product);
  const ram = getRam(product);
  const net = getNetworkSpeed(product);
  const title = (product.title || "").toLowerCase();

  // ── Bay count: most important factor ──
  // Product must have enough bays for the recommended count
  if (bay >= calc.recommendedBays) {
    // Closer to ideal = higher score (don't massively oversize)
    const diff = bay - calc.recommendedBays;
    score += diff === 0 ? 30 : diff <= 2 ? 25 : 15;
  } else if (bay === calc.recommendedBays - 1) {
    score += 5; // slightly undersized, still possible
  } else {
    score -= 15; // too few bays
  }

  // ── Network: high camera count or high resolution needs fast network ──
  if (calc.bandwidthMbps >= 100) {
    // Need 10GbE
    if (net.includes("10") || title.includes("10g")) score += 15;
    else if (net.includes("2.5") || title.includes("2.5g")) score += 5;
    else score -= 8;
  } else if (calc.bandwidthMbps >= 30) {
    // Need 2.5GbE+
    if (net.includes("10") || net.includes("2.5") || title.includes("10g") || title.includes("2.5g")) score += 10;
    else score += 0;
  } else {
    // 1GbE is fine
    score += 5;
  }

  // ── CPU: more cameras + higher res = stronger CPU needed ──
  const needsStrongCpu = answers.cameras >= 16 || (answers.cameras >= 8 && answers.resolution === "4k");
  const needsMidCpu = answers.cameras >= 8;

  if (needsStrongCpu) {
    if (cpu.includes("xeon") || cpu.includes("ryzen") || cpu.includes("i5") || cpu.includes("i7")) score += 12;
    else if (cpu.includes("i3") || cpu.includes("n5105") || cpu.includes("celeron")) score += 4;
    else if (cpu.includes("arm") || cpu.includes("realtek")) score -= 8;
    // Also check title for CPU hints
    if (title.includes("xeon") || title.includes("ryzen")) score += 5;
  } else if (needsMidCpu) {
    if (cpu.includes("i3") || cpu.includes("n5105") || cpu.includes("celeron") || cpu.includes("xeon") || cpu.includes("ryzen")) score += 8;
    else score += 3;
  } else {
    // Low camera count – any CPU is fine
    score += 5;
  }

  // ── RAM: more cameras need more RAM ──
  if (answers.cameras >= 32) {
    if (ram >= 16) score += 10;
    else if (ram >= 8) score += 3;
    else score -= 5;
  } else if (answers.cameras >= 16) {
    if (ram >= 8) score += 8;
    else if (ram >= 4) score += 3;
  } else {
    if (ram >= 4) score += 5;
  }

  // ── Brand: NAS brands are suitable for NVR ──
  const brand = (product.brand || "").toLowerCase();
  const isNasBrand = ["qnap", "synology"].some((b) => brand.includes(b) || title.includes(b));
  if (isNasBrand) score += 8;

  // ── Surveillance features ──
  // Check if product has surveillance-related specs or title mentions
  const hasSurveillance = title.includes("surveillance") || title.includes("nvr") || title.includes("دوربین");
  if (hasSurveillance) score += 6;

  // ── Availability ──
  if (product.availability?.includes("موجود")) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ─── Explanation Generator ───────────────────────────────────────────────────

function generateExplanation(answers: Answers, calc: ReturnType<typeof calculate>): string[] {
  const lines: string[] = [];

  lines.push(
    `با ${answers.cameras.toLocaleString("fa-IR")} دوربین ${answers.resolution} و ${answers.hours.toLocaleString("fa-IR")} ساعت ضبط روزانه به مدت ${answers.days.toLocaleString("fa-IR")} روز، فضای کل مورد نیاز حدود ${formatSize(calc.totalGb)} است.`
  );

  lines.push(`پهنای باند مورد نیاز: ${calc.bandwidthMbps.toLocaleString("fa-IR")} مگابیت بر ثانیه → شبکه ${calc.network} پیشنهاد می‌شود.`);

  if (calc.recommendedBays >= 8) {
    lines.push(`فضای ذخیره‌سازی بالا است. حداقل ${calc.recommendedBays.toLocaleString("fa-IR")} درایو با ${calc.raid} و هارد ۴ ترابایتی نیاز دارید.`);
  } else if (calc.recommendedBays >= 4) {
    lines.push(`فضای متوسط. ${calc.recommendedBays.toLocaleString("fa-IR")} درایو با ${calc.raid} کافی است.`);
  } else {
    lines.push(`فضای نسبتاً کم. ${calc.recommendedBays.toLocaleString("fa-IR")} درایو کافی است.`);
  }

  lines.push(`${calc.cpu} و ${calc.ram} رم برای این تعداد دوربین مناسب است.`);

  if (answers.cameras >= 16 && answers.resolution !== "720p") {
    lines.push("با این تعداد دوربین و رزولوشن بالا، پردازنده قوی برای رمزگشایی ویدیو ضروری است.");
  }

  if (answers.days >= 90) {
    lines.push(`نگهداری ${answers.days.toLocaleString("fa-IR")} روزه فضای زیادی مصرف می‌کند. هارد با ظرفیت بالا (۸ ترابایت یا بیشتر) انتخاب کنید.`);
  }

  return lines;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function NvrSelectorWizard({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});

  const currentStep = STEPS[step];
  const isComplete = step >= STEPS.length;

  // For slider steps, we need local state to track the slider value before advancing
  const [sliderValue, setSliderValue] = useState<number | null>(null);

  // Initialize slider value when entering a slider step
  const effectiveSliderValue = useMemo(() => {
    if (currentStep?.type === "slider") {
      const s = currentStep as SliderStep;
      return sliderValue ?? (answers[s.id] as number) ?? s.min;
    }
    return 0;
  }, [currentStep, sliderValue, answers]);

  const goToStep = (newStep: number) => {
    setStep(newStep);
    setSliderValue(null);
  };

  const confirmSlider = () => {
    if (currentStep?.type !== "slider") return;
    const s = currentStep as SliderStep;
    const val = sliderValue ?? (answers[s.id] as number) ?? s.min;
    const newAnswers = { ...answers, [s.id]: val };
    setAnswers(newAnswers);
    setSliderValue(null);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(STEPS.length);
    }
  };

  const selectOption = (value: string) => {
    if (!currentStep || currentStep.type !== "options") return;
    const numValue = Number(value);
    const newAnswers = { ...answers, [currentStep.id]: isNaN(numValue) ? value : numValue };
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(STEPS.length);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setSliderValue(null);
      setStep(step - 1);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setSliderValue(null);
  };

  // ── Results ──
  const calc = useMemo(() => {
    if (!isComplete || !answers.cameras || !answers.days || !answers.hours || !answers.resolution) return null;
    return calculate(answers as Answers);
  }, [answers, isComplete]);

  const rankedProducts = useMemo(() => {
    if (!isComplete || !calc) return [];
    return products
      .map((p) => ({ ...p, score: scoreProduct(p, answers as Answers, calc) }))
      .filter((p) => p.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [products, answers, isComplete, calc]);

  const explanation = useMemo(() => {
    if (!isComplete || !calc) return [];
    return generateExplanation(answers as Answers, calc);
  }, [answers, isComplete, calc]);

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Progress bar */}
      {!isComplete && (
        <div className="flex items-center gap-2 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 max-w-16 rounded-full transition-colors ${
                i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      {/* Steps */}
      {!isComplete && currentStep && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              سؤال {step + 1} از {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold">{currentStep.question}</h2>
            <p className="text-sm text-muted-foreground">{currentStep.desc}</p>
          </div>

          {/* Slider type */}
          {currentStep.type === "slider" && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-4xl font-black text-primary">
                {effectiveSliderValue.toLocaleString("fa-IR")} {(currentStep as SliderStep).unit}
              </div>
              <input
                type="range"
                min={(currentStep as SliderStep).min}
                max={(currentStep as SliderStep).max}
                value={effectiveSliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{(currentStep as SliderStep).formatValue((currentStep as SliderStep).min)}</span>
                <span>{(currentStep as SliderStep).formatValue((currentStep as SliderStep).max)}</span>
              </div>
              <Button onClick={confirmSlider} className="min-w-[140px]">
                مرحله بعد
              </Button>
            </div>
          )}

          {/* Options type */}
          {currentStep.type === "options" && (
            <div className="grid grid-cols-1 gap-3">
              {(currentStep as OptionsStep).options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className="group flex items-center gap-4 rounded-xl border-2 border-border/50 p-4 text-right hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold group-hover:text-primary transition-colors">
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
              مرحله قبل
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {isComplete && calc && (
        <div className="space-y-8">
          {/* 1. Q&A Summary */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">پاسخ‌های شما</h3>
            <div className="space-y-2">
              {STEPS.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.question}</span>
                  <Badge variant="secondary">{getStepLabel(s.id, answers[s.id] as string | number)}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Calculation Results */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold">نتیجه محاسبه</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <HardDrive className="size-5 mx-auto text-primary mb-1" />
                <div className="text-lg font-bold">{formatSize(calc.totalGb)}</div>
                <div className="text-[10px] text-muted-foreground">فضای مورد نیاز</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Wifi className="size-5 mx-auto text-primary mb-1" />
                <div className="text-lg font-bold">{calc.bandwidthMbps.toLocaleString("fa-IR")} مگابیت/ثانیه</div>
                <div className="text-[10px] text-muted-foreground">پهنای باند مورد نیاز</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">پیشنهاد رید:</span><span className="font-medium">{calc.raid}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تعداد درایو:</span><span className="font-medium">حداقل {calc.recommendedBays.toLocaleString("fa-IR")} درایو</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">شبکه:</span><span className="font-medium">{calc.network}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">پردازنده:</span><span className="font-medium">{calc.cpu}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">رم:</span><span className="font-medium">{calc.ram}</span></div>
            </div>
          </Card>

          {/* 3. Explanation */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-3">تحلیل نیاز شما</h3>
            <div className="space-y-2">
              {explanation.map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </Card>

          <Separator />

          {/* 4. Product Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">پیشنهادات ما</h3>

            {rankedProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">محصولی با مشخصات شما یافت نشد.</p>
                <p className="text-xs text-muted-foreground mt-2">لطفاً با مشاوران ما تماس بگیرید.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {rankedProducts.map((product, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <Link
                      key={product.slug}
                      href={`/shop/${product.slug}`}
                      className="group block"
                    >
                      <Card className={`overflow-hidden transition-colors ${isTop3 ? "border-primary/30" : "hover:border-primary/20"}`}>
                        <div className="flex gap-4 p-4">
                          {product.image && (
                            <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-muted">
                              <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {idx === 0 && <Badge className="text-[9px]">⭐ بهترین</Badge>}
                              {idx === 1 && <Badge variant="secondary" className="text-[9px]">🥈 دوم</Badge>}
                              {idx === 2 && <Badge variant="secondary" className="text-[9px]">🥉 سوم</Badge>}
                              {product.brand && <Badge variant="outline" className="text-[9px]">{product.brand}</Badge>}
                            </div>
                            <div className="text-sm font-bold mt-1 group-hover:text-primary transition-colors truncate">
                              {product.title}
                            </div>
                            {product.excerpt && (
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.excerpt}</div>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                              {getBayCount(product) > 0 && <span>{getBayCount(product).toLocaleString("fa-IR")} درایو</span>}
                              {product.price && <span className="font-bold text-primary">{product.price.toLocaleString("fa-IR")} تومان</span>}
                            </div>
                          </div>
                          {/* Match percentage */}
                          <div className="flex flex-col items-center justify-center shrink-0">
                            <div className={`text-lg font-black ${product.score >= 80 ? "text-green-500" : product.score >= 60 ? "text-yellow-500" : "text-muted-foreground"}`}>
                              {product.score}%
                            </div>
                            <div className="text-[10px] text-muted-foreground">تطابق</div>
                          </div>
                          <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center" />
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* 5. Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={restart} className="gap-1.5">
              <RotateCcw className="size-3" />
              شروع مجدد
            </Button>
            <ButtonLink href="/consultation" className="gap-1.5">
              مشاوره رایگان
              <ArrowLeft className="size-3" />
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
