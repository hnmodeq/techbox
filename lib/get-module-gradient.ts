export function getModuleGradient(color: string): [string, string, string] {
  const normalized = color.startsWith("text-[")
    ? color.slice(6, -1)
    : color;
  return [normalized, `color-mix(in oklch, ${normalized} 80%, transparent)`, `color-mix(in oklch, ${normalized} 42%, transparent)`];
}
