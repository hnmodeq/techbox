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
 <section className="relative overflow-hidden px-4 py-14 md:py-16" aria-labelledby="tech-stack-title">
 <div className="mx-auto max-w-6xl">
 <div className="mb-6 text-center">
 <h2 id="tech-stack-title" className="tb-text-lg md:tb-text-lg">زیرساخت مدرن تکباکس</h2>
 <p className="mt-1 tb-text-sm text-[var(--tb-fg-muted)]">ساخته‌شده با ابزارهای مدرن وب و زیرساخت</p>
 </div>
 <LogoLoop
 logos={techLogos}
 speed={120}
 direction="left"
 logoHeight={60}
 gap={64}
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
