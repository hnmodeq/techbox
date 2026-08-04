"use client";

import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_FOOTER_SOCIALS, parseFooterSocials, type FooterSocialKey } from "@/features/footer/footer-socials";

const links = [
  { name: "درباره ما", href: "/about" },
  { name: "ارتباط با ما", href: "/contact" },
  { name: "فرصت‌های شغلی", href: "/work-with-us" },
  { name: "قوانین و مقررات", href: "/terms" },
];

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

export default function FooterSection() {
  const [socials, setSocials] = useState(DEFAULT_FOOTER_SOCIALS);

  useEffect(() => {
    fetch("/api/settings?key=footer.socials", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setSocials(parseFooterSocials(data?.["footer.socials"])))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto w-full bg-white dark:bg-black">
      <div
        className="mx-auto grid w-full max-w-[1280px] gap-x-10 gap-y-6 px-6 pb-7 pt-8 md:grid-cols-2 md:grid-rows-2 md:items-center"
        dir="ltr"
      >
        {/* Top right */}
        <p className="text-center text-[11px] leading-6 text-muted-foreground md:col-start-2 md:row-start-1 md:text-right" dir="rtl">
          © 1405 تمامی حقوق مادی و معنوی این وب‌سایت محفوظ و متعلق به شرکت{" "}
          <Tooltip>
            <TooltipTrigger render={<span tabIndex={0} className="cursor-help font-semibold text-sky-500" />}>
              هونامیک ارتباط رستاک
            </TooltipTrigger>
            <TooltipContent>در دست طراحی</TooltipContent>
          </Tooltip>{" "}
          می‌باشد.
        </p>

        {/* Top left: four navigation links + Suggestions = five controls. */}
        <div className="flex flex-wrap items-center justify-center gap-1 md:col-start-1 md:row-start-1 md:justify-start" dir="rtl">
          {links.map((item) => (
            <ButtonLink
              key={item.name}
              href={item.href}
              variant="ghost"
              size="sm"
              className="bg-transparent text-xs font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground dark:hover:bg-transparent!"
            >
              {item.name}
            </ButtonLink>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("tb_open_feedback"))}
            className="bg-transparent text-xs font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground dark:hover:bg-transparent!"
          >
            <MessageSquarePlus className="size-3.5" />
            پیشنهادات
          </Button>
        </div>

        {/* Bottom right */}
        <p className="text-center text-[11px] text-muted-foreground md:col-start-2 md:row-start-2 md:text-right" dir="rtl">
          طراحی شده توسط{" "}
          <Tooltip>
            <TooltipTrigger render={<span tabIndex={0} className="cursor-help font-semibold text-[#f5b301]" />}>
              بومیم
            </TooltipTrigger>
            <TooltipContent>در دست طراحی</TooltipContent>
          </Tooltip>
        </p>

        {/* Bottom left */}
        <div className="flex items-center justify-center gap-2 md:col-start-1 md:row-start-2 md:justify-start">
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
    </footer>
  );
}
