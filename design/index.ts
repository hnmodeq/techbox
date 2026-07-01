// Public design exports — JS-side only.
// Visual tokens (color/radius/shadow/blur/opacity/border/motion/typography) live as
// CSS variables / utility classes under design/tokens/*.css and are the single source
// of truth. The only JS exports are things components need at runtime:
//   • zIndex  — layer ordering for inline styles
//   • motion  — Framer Motion variants/transitions
export * from "./tokens/z-index";
export * from "./tokens/motion";
