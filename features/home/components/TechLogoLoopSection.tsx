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
 { node: <SiReact />, title: "React", href: "https://react.dev" },
 { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
 { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
 { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
 { node: <SiPrisma />, title: "Prisma", href: "https://www.prisma.io" },
 { node: <SiVercel />, title: "Vercel", href: "https://vercel.com" },
 { node: <SiFramer />, title: "Framer Motion", href: "https://www.framer.com/motion" },
];

export default function TechLogoLoopSection() {
 return (
 <section className="relative w-full max-w-full overflow-x-hidden overflow-hidden px-4 py-20 md:py-24 border-t border-[var(--tb-border)] bg-[var(--tb-bg-primary)]" aria-labelledby="tech-stack-title">
 <div className="mx-auto max-w-7xl w-full max-w-full overflow-x-hidden">
 <div className="mb-10 text-center">
 <h2 id="tech-stack-title" className="tb-text-big-title text-[var(--tb-fg-primary)]">شرکت‌های همکار</h2>
 </div>
 <LogoLoop
 logos={techLogos}
 speed={120}
 direction="left"
          logoHeight={130}
          gap={110}
 pauseOnHover
 scaleOnHover
 fadeOut
 fadeOutColor="var(--tb-bg-primary)"
 ariaLabel="Technology stack"
 />
 </div>
 </section>
 );
}
