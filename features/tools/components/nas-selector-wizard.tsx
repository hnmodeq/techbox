"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, RotateCcw, HardDrive, Check } from "lucide-react";

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
  storage: string;
  budget: string;
  priority: string;
};

type Question = {
  id: keyof Answer;
  question: string;
  description: string;
  options: { value: string; label: string; desc: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: "useCase",
    question: "NAS را برای چه کاری می‌خواهید؟",
    description: "نوع استفاده شما بهترین گزینه را مشخص می‌کند",
    options: [
      { value: "home", label: "خانگی", desc: "ذخیره عکس، فیلم و بکاپ شخصی" },
      { value: "office", label: "اداری", desc: "اشتراک‌گذاری فایل در تیم کوچک" },
      { value: "enterprise", label: "سازمانی", desc: "مجازی‌سازی، دیتابیس و سرویس‌ها" },
      { value: "surveillance", label: "دوربین مداربسته", desc: "ضبط و مدیریت تصاویر دوربین‌ها" },
    ],
  },
  {
    id: "storage",
    question: "چقدر فضا نیاز دارید؟",
    description: "حجم داده‌هایی که می‌خواهید ذخیره کنید",
    options: [
      { value: "small", label: "تا ۱۰ ترابایت", desc: "عکس، اسناد، بکاپ شخصی" },
      { value: "medium", label: "۱۰ تا ۵۰ ترابایت", desc: "آرشیو ویدیو، پروژه‌های تیم" },
      { value: "large", label: "۵۰ تا ۱۰۰ ترابایت", desc: "آرشیو بزرگ، سرویس‌های سازمانی" },
      { value: "enterprise", label: "بیش از ۱۰۰ ترابایت", desc: "دیتاسنتر، زیرساخت بزرگ" },
    ],
  },
  {
    id: "budget",
    question: "بودجه شما چقدر است؟",
    description: "قیمت تقریبی به تومان",
    options: [
      { value: "low", label: "تا ۳۰ میلیون", desc: "اقتصادی و کاربردی" },
      { value: "mid", label: "۳۰ تا ۸۰ میلیون", desc: "تعادل قیمت و عملکرد" },
      { value: "high", label: "۸۰ تا ۲۰۰ میلیون", desc: "عملکرد بالا و قابلیت اطمینان" },
      { value: "premium", label: "بیش از ۲۰۰ میلیون", desc: "بهترین کیفیت و پشتیبانی" },
    ],
  },
  {
    id: "priority",
    question: "کدام ویژگی برای شما مهم‌تر است؟",
    description: "اولویت اصلی شما در انتخاب NAS",
    options: [
      { value: "speed", label: "سرعت بالا", desc: "NVMe، شبکه ۱۰GbE، پردازنده قوی" },
      { value: "capacity", label: "ظرفیت زیاد", desc: "تعداد Bay بالا، پشتیبانی از دیسک‌های بزرگ" },
      { value: "reliability", label: "قابلیت اطمینان", desc: "RAID، بکاپ، Redundancy" },
      { value: "balanced", label: "متعادل", desc: "ترکیب سرعت، ظرفیت و اطمینان" },
    ],
  },
];

function scoreProduct(product: Product, answers: Answer): number {
  let score = 50;
  const bay = parseInt(String((product.specs as any)?.Bay || "0"), 10) || 0;
  const price = product.price || 0;

  // Use case scoring
  if (answers.useCase === "home") { score += bay <= 4 ? 15 : -5; }
  if (answers.useCase === "office") { score += bay >= 4 && bay <= 8 ? 15 : 0; }
  if (answers.useCase === "enterprise") { score += bay >= 6 ? 15 : -10; }
  if (answers.useCase === "surveillance") { score += bay >= 4 ? 10 : -5; }

  // Storage scoring
  if (answers.storage === "small") { score += bay <= 4 ? 10 : 0; }
  if (answers.storage === "medium") { score += bay >= 4 && bay <= 8 ? 10 : 0; }
  if (answers.storage === "large") { score += bay >= 8 ? 10 : -5; }
  if (answers.storage === "enterprise") { score += bay >= 12 ? 10 : -10; }

  // Budget scoring (rough)
  if (answers.budget === "low" && price > 0 && price < 30000000) score += 15;
  if (answers.budget === "mid" && price >= 30000000 && price < 80000000) score += 15;
  if (answers.budget === "high" && price >= 80000000 && price < 200000000) score += 15;
  if (answers.budget === "premium" && price >= 200000000) score += 15;

  // Priority scoring
  const specs = product.specs || {};
  if (answers.priority === "speed") {
    if (specs["NVMe"] || specs["اسلات M.2"]) score += 10;
    if (specs["Network Card"]?.includes("10GbE")) score += 10;
  }
  if (answers.priority === "capacity") { score += bay >= 8 ? 15 : 0; }
  if (answers.priority === "reliability") {
    if (specs["انواع RAID پشتیبانی شده"]) score += 10;
  }

  // Availability bonus
  if (product.availability?.includes("موجود")) score += 10;

  return Math.max(0, Math.min(100, score));
}

function getResultDescription(answers: Answer): string {
  const parts: string[] = [];

  if (answers.useCase === "home") parts.push("یک NAS خانگی");
  else if (answers.useCase === "office") parts.push("یک NAS اداری");
  else if (answers.useCase === "enterprise") parts.push("یک NAS سازمانی");
  else parts.push("یک سیستم ذخیره‌سازی دوربین");

  if (answers.storage === "small") parts.push("با ظرفیت کم");
  else if (answers.storage === "medium") parts.push("با ظرفیت متوسط");
  else if (answers.storage === "large") parts.push("با ظرفیت بالا");
  else parts.push("با ظرفیت بسیار بالا");

  if (answers.priority === "speed") parts.push("و سرعت بالا");
  else if (answers.priority === "capacity") parts.push("و فضای زیاد");
  else if (answers.priority === "reliability") parts.push("و قابلیت اطمینان بالا");
  else parts.push("و عملکرد متعادل");

  return parts.join(" ") + " نیاز دارید.";
}

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
      setStep(QUESTIONS.length); // Go to results
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
  };

  const rankedProducts = useMemo(() => {
    if (!isComplete) return [];
    return products
      .map((p) => ({ ...p, score: scoreProduct(p, answers as Answer) }))
      .filter((p) => p.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [products, answers, isComplete]);

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Progress */}
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

      {/* Question */}
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
      {isComplete && (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="text-xs">نتیجه انتخاب‌گر</Badge>
            <h2 className="text-2xl font-bold">{getResultDescription(answers as Answer)}</h2>
            <p className="text-sm text-muted-foreground">
              بر اساس پاسخ‌های شما، این محصولات را پیشنهاد می‌کنیم:
            </p>
          </div>

          {rankedProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">محصولی با مشخصات شما یافت نشد.</p>
              <p className="text-xs text-muted-foreground mt-2">لطفاً با مشاوران ما تماس بگیرید.</p>
            </Card>
          ) : (
            <div className="space-y-3">
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
                          {idx === 0 && <Badge className="text-[9px]">بهترین پیشنهاد</Badge>}
                          {product.brand && <Badge variant="outline" className="text-[9px]">{product.brand}</Badge>}
                        </div>
                        <div className="text-sm font-bold mt-1 group-hover:text-primary transition-colors truncate">
                          {product.title}
                        </div>
                        {product.excerpt && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.excerpt}</div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          {(product.specs as any)?.Bay && <span>{(product.specs as any).Bay} Bay</span>}
                          {product.price && <span className="font-bold text-primary">{product.price.toLocaleString("fa-IR")} تومان</span>}
                        </div>
                      </div>
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

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
