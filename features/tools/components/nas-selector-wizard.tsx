"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RotateCcw, Check, HardDrive } from "lucide-react";

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

type Answer = {
  useCase: string;
  users: string;
  storage: string;
  priority: string;
  network: string;
};

type Question = {
  id: keyof Answer;
  question: string;
  options: { value: string; label: string; desc: string; icon: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "useCase",
    question: "NAS را برای چه کاری می‌خواهید؟",
    options: [
      { value: "home", label: "خانگی", desc: "ذخیره عکس، فیلم، بکاپ شخصی و استریم", icon: "🏠" },
      { value: "office", label: "اداری", desc: "اشتراک‌گذاری فایل، همکاری تیمی، بکاپ سازمانی", icon: "🏢" },
      { value: "surveillance", label: "دوربین مداربسته", desc: "ضبط و مدیریت تصاویر دوربین‌های امنیتی", icon: "📹" },
      { value: "enterprise", label: "سازمانی", desc: "مجازی‌سازی، دیتابیس، Docker و سرویس‌های سنگین", icon: "🏗️" },
    ],
  },
  {
    id: "users",
    question: "چند نفر همزمان از NAS استفاده می‌کنند؟",
    options: [
      { value: "1-5", label: "۱ تا ۵ نفر", desc: "خانواده یا تیم کوچک", icon: "👤" },
      { value: "5-20", label: "۵ تا ۲۰ نفر", desc: "دفتر کوچک یا استارتاپ", icon: "👥" },
      { value: "20-50", label: "۲۰ تا ۵۰ نفر", desc: "شرکت متوسط", icon: "🏢" },
      { value: "50+", label: "بیش از ۵۰ نفر", desc: "سازمان بزرگ یا دیتاسنتر", icon: "🏗️" },
    ],
  },
  {
    id: "storage",
    question: "چقدر فضای ذخیره‌سازی نیاز دارید؟",
    options: [
      { value: "small", label: "تا ۱۰ ترابایت", desc: "اسناد، عکس، بکاپ شخصی", icon: "📁" },
      { value: "medium", label: "۱۰ تا ۵۰ ترابایت", desc: "آرشیو ویدیو، پروژه‌های تیمی", icon: "📂" },
      { value: "large", label: "۵۰ تا ۱۰۰ ترابایت", desc: "آرشیو بزرگ، چندین سرویس", icon: "🗃️" },
      { value: "enterprise", label: "بیش از ۱۰۰ ترابایت", desc: "زیرساخت سازمانی، دوربین متعدد", icon: "🏛️" },
    ],
  },
  {
    id: "priority",
    question: "کدام ویژگی برای شما مهم‌تر است؟",
    options: [
      { value: "speed", label: "سرعت بالا", desc: "NVMe cache، پردازنده قوی، ۱۰GbE", icon: "⚡" },
      { value: "capacity", label: "ظرفیت زیاد", desc: "تعداد Bay بالا، پشتیبانی از دیسک‌های بزرگ", icon: "📦" },
      { value: "reliability", label: "قابلیت اطمینان", desc: "RAID 6، Redundancy، Hot-swap", icon: "🛡️" },
      { value: "balanced", label: "متعادل", desc: "ترکیب مناسب سرعت، ظرفیت و اطمینان", icon: "⚖️" },
    ],
  },
  {
    id: "network",
    question: "چه سرعت شبکه‌ای نیاز دارید؟",
    options: [
      { value: "1gbe", label: "۱ گیگابیت", desc: "کافی برای اشتراک‌گذاری فایل معمولی", icon: "🔌" },
      { value: "2.5gbe", label: "۲.۵ گیگابیت", desc: "استاندارد برای اکثر کاربردها", icon: "🔌" },
      { value: "10gbe", label: "۱۰ گیگابیت", desc: "ویرایش ویدیو، VM، I/O سنگین", icon: "⚡" },
      { value: "any", label: "مطمئن نیستم", desc: "مشاوره رایگان دریافت کنید", icon: "❓" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBayCount(product: Product): number {
  const specs = product.specs || {};
  const bay = specs["Bay"] || specs["bay"] || specs["Bays"];
  if (!bay) return 0;
  const m = String(bay).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function getAnswerLabel(questionId: keyof Answer, value: string): string {
  const q = QUESTIONS.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.value === value);
  return opt?.label || value;
}

// ─── Scoring ────────────────────────────────────────────────────────────────

function scoreProduct(product: Product, answers: Answer): number {
  let score = 40;
  const bay = getBayCount(product);
  const specs = product.specs || {};
  const title = (product.title || "").toLowerCase();

  // Use case
  if (answers.useCase === "home") score += bay <= 4 ? 12 : bay <= 6 ? 8 : 0;
  if (answers.useCase === "office") score += bay >= 4 && bay <= 8 ? 12 : 5;
  if (answers.useCase === "surveillance") score += bay >= 4 ? 10 : 0;
  if (answers.useCase === "enterprise") score += bay >= 6 ? 15 : bay >= 4 ? 5 : -5;

  // Users
  if (answers.users === "1-5") score += 10;
  if (answers.users === "5-20") score += bay >= 4 ? 10 : 5;
  if (answers.users === "20-50") score += bay >= 6 ? 10 : 0;
  if (answers.users === "50+") score += bay >= 8 ? 10 : -5;

  // Storage
  if (answers.storage === "small") score += bay <= 4 ? 10 : 5;
  if (answers.storage === "medium") score += bay >= 4 && bay <= 8 ? 10 : 5;
  if (answers.storage === "large") score += bay >= 8 ? 10 : 0;
  if (answers.storage === "enterprise") score += bay >= 12 ? 10 : bay >= 8 ? 5 : -5;

  // Priority
  if (answers.priority === "speed") {
    if (specs["NVMe"] || specs["اسلات M.2"]) score += 8;
    if (title.includes("nvme") || title.includes("ssd")) score += 5;
  }
  if (answers.priority === "capacity") score += bay >= 8 ? 12 : bay >= 4 ? 6 : 0;
  if (answers.priority === "reliability") {
    if (specs["انواع RAID پشتیبانی شده"]) score += 8;
    if (title.includes("rack")) score += 4;
  }
  if (answers.priority === "balanced") score += bay >= 4 && bay <= 8 ? 8 : 4;

  // Network
  if (answers.network === "10gbe") {
    const netCard = String(specs["Network Card"] || "");
    if (netCard.includes("10") || title.includes("10g")) score += 12;
    else score -= 5;
  }
  if (answers.network === "2.5gbe") {
    const netCard = String(specs["Network Card"] || "");
    if (netCard.includes("2.5") || netCard.includes("10") || title.includes("2.5g")) score += 8;
  }

  if (product.availability?.includes("موجود")) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ─── Explanation Generator ──────────────────────────────────────────────────

function generateExplanation(answers: Answer): string[] {
  const lines: string[] = [];

  // Use case
  if (answers.useCase === "home")
    lines.push("برای استفاده خانگی، یک ذخیره‌ساز با ۲ تا ۴ درایو و پردازنده پایه کافی است.");
  if (answers.useCase === "office")
    lines.push("برای محیط اداری، ذخیره‌ساز با ۴ تا ۸ درایو، پردازنده میان‌رده و شبکه ۲.۵ گیگابیت اترنت نیاز دارید.");
  if (answers.useCase === "surveillance")
    lines.push("برای دوربین مداربسته، ذخیره‌ساز با ۴ درایو یا بیشتر، ظرفیت بالا و پردازنده قوی لازم است.");
  if (answers.useCase === "enterprise")
    lines.push("برای کاربردهای سازمانی، ذخیره‌ساز با پردازنده پرچم‌دار، ۶ درایو یا بیشتر، رم بالا و شبکه ۱۰ گیگابیت اترنت ضروری است.");

  // Users
  if (answers.users === "1-5")
    lines.push("با ۱ تا ۵ کاربر همزمان، پردازنده پایه و ۴ گیگابایت رم کافی است.");
  if (answers.users === "5-20")
    lines.push("با ۵ تا ۲۰ کاربر همزمان، پردازنده میان‌رده و حداقل ۸ گیگابایت رم پیشنهاد می‌شود.");
  if (answers.users === "20-50")
    lines.push("با ۲۰ تا ۵۰ کاربر همزمان، پردازنده قوی و حداقل ۱۶ گیگابایت رم نیاز است.");
  if (answers.users === "50+")
    lines.push("با بیش از ۵۰ کاربر، پردازنده پرچم‌دار و حداقل ۳۲ گیگابایت رم ضروری است.");

  // Storage
  if (answers.storage === "small")
    lines.push("برای ذخیره‌سازی تا ۱۰ ترابایت، ۲ تا ۴ درایو کافی است.");
  if (answers.storage === "medium")
    lines.push("برای ۱۰ تا ۵۰ ترابایت، ۴ تا ۸ درایو پیشنهاد می‌شود.");
  if (answers.storage === "large")
    lines.push("برای ۵۰ تا ۱۰۰ ترابایت، ۸ تا ۱۲ درایو با رید ۶ توصیه می‌شود.");
  if (answers.storage === "enterprise")
    lines.push("برای بیش از ۱۰۰ ترابایت، بالای ۱۲ درایو با رید ۶ و بکاپ خارجی ضروری است.");

  // Priority
  if (answers.priority === "speed")
    lines.push("اولویت شما سرعت است → کش پرسرعت، شبکه ۱۰ گیگابیت اترنت و پردازنده قوی انتخاب کنید.");
  if (answers.priority === "capacity")
    lines.push("اولویت شما ظرفیت است → تعداد درایو بالا مهم‌تر است.");
  if (answers.priority === "reliability")
    lines.push("اولویت شما اطمینان است → رید ۶ و قابلیت تعویض داغ توصیه می‌شود.");
  if (answers.priority === "balanced")
    lines.push("اولویت شما تعادل است → ترکیب مناسب سرعت، ظرفیت و اطمینان.");

  // Network
  if (answers.network === "1gbe")
    lines.push("شبکه ۱ گیگابیت اترنت برای اشتراک‌گذاری فایل معمولی کافی است.");
  if (answers.network === "2.5gbe")
    lines.push("شبکه ۲.۵ گیگابیت اترنت استاندارد فعلی برای اکثر کاربردها است.");
  if (answers.network === "10gbe")
    lines.push("شبکه ۱۰ گیگابیت اترنت برای ویرایش ویدیو و ورودی/خروجی سنگین ضروری است.");
  if (answers.network === "any")
    lines.push("هر سرعت شبکه‌ای قابل قبول است — ۲.۵ گیگابیت اترنت پیش‌فرض خوبی است.");

  return lines;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function NasSelectorWizard({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answer>>({});

  const currentQuestion = QUESTIONS[step];
  const isComplete = step >= QUESTIONS.length;

  const selectOption = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const goBack = () => { if (step > 0) setStep(step - 1); };
  const restart = () => { setStep(0); setAnswers({}); };

  const rankedProducts = useMemo(() => {
    if (!isComplete) return [];
    return products
      .map((p) => ({ ...p, score: scoreProduct(p, answers as Answer) }))
      .filter((p) => p.score > 35)
      .sort((a, b) => b.score - a.score);
  }, [products, answers, isComplete]);

  const explanation = useMemo(() => {
    if (!isComplete) return [];
    return generateExplanation(answers as Answer);
  }, [answers, isComplete]);

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Progress bar */}
      {!isComplete && (
        <div className="flex items-center gap-2 justify-center">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 max-w-16 rounded-full transition-colors ${
                i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      {/* Questions */}
      {!isComplete && currentQuestion && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              سؤال {step + 1} از {QUESTIONS.length}
            </p>
            <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectOption(option.value)}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-border/50 p-5 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="text-sm font-bold group-hover:text-primary transition-colors">
                  {option.label}
                </div>
                <div className="text-xs text-muted-foreground leading-5">
                  {option.desc}
                </div>
              </button>
            ))}
          </div>

          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
              مرحله قبل
            </Button>
          )}
        </div>
      )}

      {/* Results — all below the questions */}
      {isComplete && (
        <div className="space-y-8">
          {/* 1. Questions & Answers Summary */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">پاسخ‌های شما</h3>
            <div className="space-y-2">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{q.question}</span>
                  <Badge variant="secondary">{getAnswerLabel(q.id, (answers as any)[q.id])}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Explanation */}
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

          {/* 3. Product Recommendations */}
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
                              {getBayCount(product) > 0 && <span>{getBayCount(product)} Bay</span>}
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

          {/* 4. Actions */}
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
