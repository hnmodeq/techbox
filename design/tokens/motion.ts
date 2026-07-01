// Framer Motion – central tokens – Next 16 / React 19
// No Tailwind / no DOM – pure JS – safe to import in hooks/services

export const duration = {
  instant: 0.08,
  fast: 0.15,
  normal: 0.22,
  slow: 0.34,
  slower: 0.52,
} as const; // seconds – mirrors design/tokens/motion.css (--tb-motion-sm/md/lg)

export const ease = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  out: [0, 0, 0.38, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

export const transition = {
  fast: { duration: duration.fast, ease: ease.standard },
  normal: { duration: duration.normal, ease: ease.standard },
  slow: { duration: duration.slow, ease: ease.emphasized },
};

// Framer Motion variants – reusable
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transition.normal,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: transition.normal,
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: transition.fast,
};

export const hoverScale = {
  whileHover: { scale: 1.015, y: -2 },
  whileTap: { scale: 0.99 },
  transition: transition.fast,
};

export const slideIn = fadeInUp;
export const slideInLeft = { initial:{opacity:0,x:-24}, animate:{opacity:1,x:0}, exit:{opacity:0,x:-24}, transition: transition.normal };
export const slideInRight = { initial:{opacity:0,x:24}, animate:{opacity:1,x:0}, exit:{opacity:0,x:24}, transition: transition.normal };
