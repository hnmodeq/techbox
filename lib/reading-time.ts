const WORDS_PER_MINUTE = 180;

function plainText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~\-[\]()]/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countReadableWords(value?: string | null) {
  if (!value) return 0;
  const text = plainText(value);
  if (!text) return 0;
  return text.split(/[\s،؛؛,.!?؟:;\/\\]+/).filter(Boolean).length;
}

export function estimateReadingMinutes(...parts: Array<string | null | undefined>) {
  const words = parts.reduce((total, part) => total + countReadableWords(part), 0);
  if (words <= 0) return 1;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number) {
  const value = Number.isFinite(minutes) && minutes > 0 ? Math.ceil(minutes) : 1;
  return `${value.toLocaleString("fa-IR")} دقیقه مطالعه`;
}

export function getReadingTimeLabel(...parts: Array<string | null | undefined>) {
  return formatReadingTime(estimateReadingMinutes(...parts));
}
