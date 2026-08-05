"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent, type ReactNode, type SVGProps } from "react";
import {
  BookOpenCheck,
  Calculator,
  MessagesSquare,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_FOOTER_SOCIALS, parseFooterSocials, type FooterSocialKey } from "@/features/footer/footer-socials";
import { sharedJsonRequest } from "@/lib/client-request-dedupe";

const companyLinks = [
  { name: "درباره ما", href: "/about" },
  { name: "ارتباط با ما", href: "/contact" },
  { name: "فرصت‌های شغلی", href: "/work-with-us" },
] as const;

const userLinks = [
  { name: "حساب کاربری", href: "/account" },
  { name: "مشاوره زیرساخت", href: "/consultation" },
  { name: "قوانین و مقررات", href: "/terms" },
] as const;

const discoveryLinks = [
  { name: "فروشگاه ذخیره‌ساز", href: "/shop/storage" },
  { name: "فروشگاه HDD و SSD", href: "/shop/drive" },
  { name: "نقد و بررسی", href: "/review" },
  { name: "ابزارهای زیرساخت", href: "/tools" },
  { name: "گاه‌شمار فناوری", href: "/timeline" },
] as const;

const assurances = [
  { title: "ابزارهای رایگان", description: "محاسبه و انتخاب زیرساخت", href: "/tools", icon: Calculator },
  { title: "مشاوره زیرساخت", description: "گفت‌وگوی فنی قابل پیگیری", href: "/consultation", icon: MessagesSquare },
  { title: "فروشگاه تخصصی", description: "ذخیره‌ساز و درایو سازمانی", href: "/shop/storage", icon: ShoppingBag },
  { title: "محتوای تخصصی", description: "مقاله و بررسی دیتاسنتری", href: "/blog", icon: BookOpenCheck },
  { title: "جامعه فناوری", description: "پرسش و تجربه اعضا", href: "/forum", icon: Users },
] as const;

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <defs>
        <linearGradient id="footer-instagram-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD600" />
          <stop offset="0.42" stopColor="#FF0169" />
          <stop offset="0.78" stopColor="#D300C5" />
          <stop offset="1" stopColor="#7638FA" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#footer-instagram-gradient)" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.8" r="1.15" fill="white" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#FF0000" d="M21.58 7.19a2.73 2.73 0 0 0-1.92-1.93C17.97 4.8 12 4.8 12 4.8s-5.97 0-7.66.46a2.73 2.73 0 0 0-1.92 1.93C1.96 8.89 1.96 12 1.96 12s0 3.11.46 4.81a2.73 2.73 0 0 0 1.92 1.93c1.69.46 7.66.46 7.66.46s5.97 0 7.66-.46a2.73 2.73 0 0 0 1.92-1.93c.46-1.7.46-4.81.46-4.81s0-3.11-.46-4.81Z" />
      <path fill="white" d="m10 15.1 5.2-3.1L10 8.9v6.2Z" />
    </svg>
  );
}

function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="#229ED9" />
      <path fill="white" d="M17.75 7.35 15.8 17c-.15.68-.54.85-1.1.53l-2.97-2.19-1.43 1.38c-.16.16-.29.29-.6.29l.21-3.02 5.5-4.97c.24-.21-.05-.33-.37-.12l-6.8 4.28-2.93-.92c-.64-.2-.65-.64.13-.95l11.45-4.41c.53-.2.99.13.86.45Z" />
    </svg>
  );
}

const socialItems: Array<{
  key: FooterSocialKey;
  name: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}> = [
  { key: "instagram", name: "Instagram", icon: InstagramIcon },
  { key: "youtube", name: "YouTube", icon: YouTubeIcon },
  { key: "telegram", name: "Telegram", icon: TelegramIcon },
];

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function FooterTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <ButtonLink
      href={href}
      variant="ghost"
      size="sm"
      className="h-auto justify-start bg-transparent px-0 py-1 text-xs font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground dark:hover:bg-transparent!"
    >
      {children}
    </ButtonLink>
  );
}

export default function FooterSection() {
  const [socials, setSocials] = useState(DEFAULT_FOOTER_SOCIALS);
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    sharedJsonRequest<Record<string, string | null>>("footer-socials:get", "/api/settings?key=footer.socials", { cache: "no-store" })
      .then(({ data }) => setSocials(parseFooterSocials(data?.["footer.socials"])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const subscribe = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || newsletterStatus === "loading") return;
    setNewsletterStatus("loading");
    setNewsletterMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new Error(data?.message || "ثبت عضویت انجام نشد.");
      setNewsletterStatus("success");
      setNewsletterMessage(data.message || "عضویت شما ثبت شد.");
      setEmail("");
    } catch (error) {
      setNewsletterStatus("error");
      setNewsletterMessage(error instanceof Error ? error.message : "ارتباط برقرار نشد.");
    }
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <footer className="mt-auto w-full bg-white text-foreground dark:bg-black">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-7 pt-8 sm:px-6">
        {/* Digikala-inspired assurance rail, adapted to services TechBox truly provides. */}
        <section aria-label="خدمات تکباکس" className="border-b border-border pb-8">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {assurances.map(({ title, description, href, icon: Icon }) => (
              <li key={title}>
                <a href={href} className="group flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Icon className="size-7 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.5} />
                  <span className="mt-2 text-xs font-bold text-foreground">{title}</span>
                  <span className="mt-1 text-[10px] leading-5 text-muted-foreground">{description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Full navigation/newsletter body. */}
        <section aria-label="پیوندها و خبرنامه" className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-[.8fr_.9fr_1fr_1.35fr]">
          <div className="flex flex-col items-start" dir="rtl">
            <p className="mb-3 text-sm font-black">با تکباکس</p>
            {companyLinks.map((item) => <FooterTextLink key={item.href} href={item.href}>{item.name}</FooterTextLink>)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent("tb_open_feedback"))}
              className="h-auto justify-start bg-transparent px-0 py-1 text-xs font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground dark:hover:bg-transparent!"
            >
              پیشنهادات
            </Button>
          </div>

          <div className="flex flex-col items-start" dir="rtl">
            <p className="mb-3 text-sm font-black">خدمات کاربران</p>
            {userLinks.map((item) => <FooterTextLink key={item.href} href={item.href}>{item.name}</FooterTextLink>)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent("tb_open_faq"))}
              className="h-auto justify-start bg-transparent px-0 py-1 text-xs font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground dark:hover:bg-transparent!"
            >
              سوالات پرتکرار
            </Button>
          </div>

          <div className="flex flex-col items-start" dir="rtl">
            <p className="mb-3 text-sm font-black">فروشگاه و محتوا</p>
            {discoveryLinks.map((item) => <FooterTextLink key={item.href} href={item.href}>{item.name}</FooterTextLink>)}
          </div>

          <div dir="rtl">
            <p className="text-sm font-black">همراه تکباکس باشید</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">خبرهای مهم فناوری زیرساخت را خلاصه و منظم دریافت کنید.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">ایمیل خبرنامه</label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ایمیل شما"
                dir="ltr"
                className="h-9 min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-3 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <Button type="submit" size="lg" disabled={newsletterStatus === "loading"} className="h-9 px-4">
                {newsletterStatus === "loading" ? <Spinner /> : "ثبت"}
              </Button>
            </form>
            {newsletterMessage && (
              <p className={`mt-2 text-[11px] ${newsletterStatus === "error" ? "text-destructive" : "text-emerald-600"}`} role="status">
                {newsletterMessage}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2" dir="ltr">
              {socialItems.map((item) => {
                const setting = socials[item.key];
                if (!setting.enabled) return null;
                return (
                  <a
                    key={item.key}
                    href={setting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="group/social inline-flex size-9 items-center justify-center bg-transparent outline-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <item.icon className="size-5 grayscale opacity-60 transition-[filter,opacity] duration-200 group-hover/social:grayscale-0 group-hover/social:opacity-100 group-focus-visible/social:grayscale-0 group-focus-visible/social:opacity-100" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real PWA install surface instead of fake app-store badges. */}
        <section className="flex flex-col items-center justify-between gap-4 rounded-lg bg-slate-800 px-5 py-4 text-white sm:flex-row" aria-label="وب‌اپلیکیشن تکباکس">
          <div className="flex items-center gap-3" dir="rtl">
            <span className="flex size-10 items-center justify-center rounded-md bg-white">
              <Image src="/logo.png" alt="" width={30} height={30} className="size-[30px] object-contain" />
            </span>
            <div>
              <p className="text-sm font-black">وب‌اپلیکیشن تکباکس</p>
              <p className="mt-1 text-[11px] text-white/65">دسترسی سریع به محتوا، ابزارها و حساب کاربری</p>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={installApp}
            disabled={!installPrompt}
            className="w-full bg-white font-bold text-slate-900 hover:bg-white/90 disabled:bg-white/15 disabled:text-white/55 sm:w-auto"
          >
            {installPrompt ? "نصب وب‌اپلیکیشن" : "از منوی مرورگر نصب کنید"}
          </Button>
        </section>

        {/* Honest identity block—no invented trust seals. */}
        <section className="grid items-start gap-5 border-b border-border py-8 lg:grid-cols-[1fr_auto]" aria-label="درباره تکباکس">
          <div dir="rtl">
            <p className="text-base font-black">تکباکس؛ رسانه، جامعه و فروشگاه تخصصی زیرساخت</p>
            <p className="mt-2 max-w-4xl text-xs leading-7 text-muted-foreground">
              تکباکس برای کنار هم قرار دادن دانش فنی دیتاسنتر، تجربه اعضای جامعه، ابزارهای محاسباتی و انتخاب آگاهانه تجهیزات ساخته شده است. اطلاعات فنی و قیمت‌ها از مسیرهای واقعی سایت مدیریت می‌شوند و برای تصمیم‌های حساس می‌توانید گفت‌وگوی مشاوره قابل پیگیری ثبت کنید.
            </p>
            <FooterTextLink href="/about">بیشتر درباره تکباکس</FooterTextLink>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground" dir="rtl">
            <span className="rounded-full border border-border px-3 py-1.5">محتوای تخصصی IT</span>
            <span className="rounded-full border border-border px-3 py-1.5">ابزارهای رایگان</span>
            <span className="rounded-full border border-border px-3 py-1.5">جامعه فناوری</span>
          </div>
        </section>

        <div className="grid gap-3 pt-6 text-[11px] text-muted-foreground sm:grid-cols-2 sm:items-center">
          <p className="text-center sm:text-right" dir="rtl">
            © 1405 تمامی حقوق مادی و معنوی این وب‌سایت محفوظ و متعلق به شرکت{" "}
            <Tooltip>
              <TooltipTrigger render={<span tabIndex={0} className="cursor-help font-semibold text-sky-500" />}>
                هونامیک ارتباط رستاک
              </TooltipTrigger>
              <TooltipContent>در دست طراحی</TooltipContent>
            </Tooltip>{" "}
            می‌باشد.
          </p>
          <p className="text-center sm:text-left" dir="rtl">
            طراحی شده توسط{" "}
            <Tooltip>
              <TooltipTrigger render={<span tabIndex={0} className="cursor-help font-semibold text-[#f5b301]" />}>
                بومیم
              </TooltipTrigger>
              <TooltipContent>در دست طراحی</TooltipContent>
            </Tooltip>
          </p>
        </div>
      </div>
    </footer>
  );
}
