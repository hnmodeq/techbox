"use client";

import LogoLoop from "@/components/effects/LogoLoop";
import {
 SiReact,
 SiNextdotjs,
 SiTypescript,
 SiTailwindcss,
 SiPrisma,
 SiVercel,
 SiFramer,
} from "react-icons/si";

const techLogos = [
 { node: <SiReact className="w-14 h-14 sm:w-16 sm:h-16" />, title: "React", href: "https://react.dev" },
 { node: <SiNextdotjs className="w-14 h-14 sm:w-16 sm:h-16" />, title: "Next.js", href: "https://nextjs.org" },
 { node: <SiTypescript className="w-14 h-14 sm:w-16 sm:h-16" />, title: "TypeScript", href: "https://www.typescriptlang.org" },
 { node: <SiTailwindcss className="w-14 h-14 sm:w-16 sm:h-16" />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
 { node: <SiPrisma className="w-14 h-14 sm:w-16 sm:h-16" />, title: "Prisma", href: "https://www.prisma.io" },
 { node: <SiVercel className="w-14 h-14 sm:w-16 sm:h-16" />, title: "Vercel", href: "https://vercel.com" },
 { node: <SiFramer className="w-14 h-14 sm:w-16 sm:h-16" />, title: "Framer Motion", href: "https://www.framer.com/motion" },
];

export default function TechLogoLoopSection() {
 return (
 <section className="relative w-full max-w-full overflow-x-hidden overflow-hidden px-4 py-20 md:py-24 border-t border-[var(--border-color)] bg-[var(--main-background)]" aria-labelledby="tech-stack-title">
 <div className="mx-auto max-w-7xl w-full max-w-full overflow-x-hidden">
 <div className="mb-10 text-center">
 <h2 id="tech-stack-title" className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold text-[var(--primary-text)]">شرکت‌های همکار</h2>
 </div>
 <LogoLoop
 logos={techLogos}
 speed={120}
 direction="left"
          logoHeight={180}
          gap={130}
 pauseOnHover
 scaleOnHover
 fadeOut
 fadeOutColor="var(--main-background)"
 ariaLabel="Technology stack"
 />
 </div>
 </section>
 );
}
