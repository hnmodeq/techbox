"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, RotateCcw, Check, HardDrive } from "lucide-react";

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
  description: string;
  options: { value: string; label: string; desc: string; icon: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "useCase",
    question: "NAS را برای چه کاری می‌خواهید؟",
    description: "نوع استفاده شما بهترین گزینه را مشخص می‌کند",
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
    description: "تعداد کاربران همزمان روی عملکرد تأثیر می‌گذارد",
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
    description: "حجم داده‌هایی که می‌خواهید ذخیره کنید",
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
    description: "اولویت اصلی شما در انتخاب NAS",
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
    description: "سرعت انتقال داده بین NAS و دستگاه‌های شما",
    options: [
      { value: "1gbe", label: "۱ گیگابیت", desc: "کافی برای اشتراک‌گذاری فایل معمولی", icon: "🔌" },
      { value: "2.5gbe", label: "۲.۵ گیگابیت", desc: "استاندارد برای اکثر کاربردها", icon: "🔌" },
      { value: "10gbe", label: "۱۰ گیگابیت", desc: "ویرایش ویدیو، VM، I/O سنگین", icon: "⚡" },
      { value: "any", label: "مطمئن نیستم", desc: "مشاوره رایگان دریافت کنید", icon: "❓" },
    ],
  },
];

// ─── Scoring ────────────────────────────────────────────────────────────────

function getBayCount(product: Product): number {
  const specs = product.specs || {};
  const bay = specs["Bay"] || specs["bay"] || specs["Bays"];
  if (!bay) return 0;
  const m = String(bay).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function scoreProduct(product: Product, answers: Answer): number {
  let score = 40; // base
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

  // Availability bonus
  if (product.availability?.includes("موجود")) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ─── Description Generator ───────────────────────────────────────────────────

function generateDescription(answers: Answer): { title: string; body: string; specs: string[] } {
  const parts: string[] = [];
  const specs: string[] = [];

  // Use case
  const useCaseMap: Record<string, { desc: string; spec: string }> = {
    home: { desc: "استفاده خانگی شامل ذخیره عکس، فیلم و بکاپ شخصی", spec: "CPU اقتصادی، ۲-۴ Bay" },
    office: { desc: "اشتراک‌گذاری فایل در محیط اداری و همکاری تیمی", spec: "CPU متوسط، ۴-۸ Bay، شبکه ۲.۵GbE" },
    surveillance: { desc: "ضبط و مدیریت تصاویر دوربین‌های امنیتی", spec: "CPU قوی، ۴+ Bay، ظرفیت بالا" },
    enterprise: { desc: "مجازی‌سازی، دیتابیس، Docker و سرویس‌های سازمانی", spec: "CPU Xeon/Ryzen، ۶+ Bay، ۱۰GbE، RAM بالا" },
  };
  const uc = useCaseMap[answers.useCase] || useCaseMap.home;
  parts.push(uc.desc);
  specs.push(uc.spec);

  // Users
  const userMap: Record<string, string> = {
    "1-5": "۱-۵ کاربر همزمان → CPU دو هسته‌ای کافی است",
    "5-20": "۵-۲۰ کاربر همزمان → CPU چهار هسته‌ای و ۸GB+ RAM پیشنهاد می‌شود",
    "20-50": "۲۰-۵۰ کاربر همزمان → CPU قوی و ۱۶GB+ RAM نیاز است",
    "50+": "بیش از ۵۰ کاربر → CPU سروری و ۳۲GB+ RAM ضروری است",
  };
  specs.push(userMap[answers.users] || "");

  // Storage
  const storageMap: Record<string, string> = {
    small: "ظرفیت تا ۱۰TB → ۲-۴ Bay با دیسک ۴-۸TB کافی است",
    medium: "ظرفیت ۱۰-۵۰TB → ۴-۸ Bay با دیسک ۸-۱۶TB پیشنهاد می‌شود",
    large: "ظرفیت ۵۰-۱۰۰TB → ۸-۱۲ Bay با RAID 6 توصیه می‌شود",
    enterprise: "ظرفیت ۱۰۰TB+ → ۱۲+ Bay با RAID 6 و بکاپ خارجی ضروری است",
  };
  specs.push(storageMap[answers.storage] || "");

  // Priority
  const priorityMap: Record<string, string> = {
    speed: "اولویت: سرعت → NVMe cache، شبکه ۱۰GbE، CPU قوی",
    capacity: "اولویت: ظرفیت → تعداد Bay بالا، دیسک‌های بزرگ",
    reliability: "اولویت: اطمینان → RAID 6/SHR-2، Hot-swap، Redundancy",
    balanced: "اولویت: تعادل → ترکیب مناسب همه ویژگی‌ها",
  };
  specs.push(priorityMap[answers.priority] || "");

  // Network
  const networkMap: Record<string, string> = {
    "1gbe": "شبکه ۱GbE → کافی برای اشتراک‌گذاری فایل معمولی",
    "2.5gbe": "شبکه ۲.۵GbE → استاندارد برای اکثر کاربردها",
    "10gbe": "شبکه ۱۰GbE → ضروری برای ویرایش ویدیو و I/O سنگین",
    any: "شبکه → هر سرعتی قابل قبول است",
  };
  specs.push(networkMap[answers.network] || "");

  const title = parts[0];
  const body = `بر اساس نیازهای شما، یک NAS با مشخصات زیر پیشنهاد می‌شود:`;

  return { title, body, specs: specs.filter(Boolean) };
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
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [products, answers, isComplete]);

  const description = useMemo(() => {
    if (!isComplete) return null;
    return generateDescription(answers as Answer);
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
            <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
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
              <ArrowRight className="size-3" />
              مرحله قبل
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {isComplete && description && (
        <div className="space-y-6">
          {/* Description */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">نتیجه تحلیل نیاز شما</h2>
                <p className="text-xs text-muted-foreground">بر اساس ۵ سؤال انتخاب شده</p>
              </div>
            </div>

            <p className="text-sm leading-6">{description.body}</p>

            <div className="space-y-2">
              {description.specs.map((spec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Product recommendations */}
          {rankedProducts.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-bold">پیشنهادات ما بر اساس نیاز شما</h3>
              {rankedProducts.map((product, idx) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="group block"
                >
                  <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="flex gap-4 p-4">
                      {product.image && (
                        <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-muted">
                          <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={idx === 0 ? "default" : "secondary"} className="text-[9px]">
                            {idx === 0 ? "⭐ بهترین پیشنهاد" : `#${idx + 1}`}
                          </Badge>
                          {product.brand && <Badge variant="outline" className="text-[9px]">{product.brand}</Badge>}
                          <span className="text-[10px] font-bold text-primary">{product.score}% تطابق</span>
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
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">محصولی با مشخصات شما یافت نشد.</p>
              <p className="text-xs text-muted-foreground mt-2">لطفاً با مشاوران ما تماس بگیرید.</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
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
