export const TIMELINE_CONFIG = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3,
  ZOOM_STEP: 0.1,
  INITIAL_ZOOM: 1,
  INITIAL_PAN_X: 200,
  INITIAL_PAN_Y: 0,
  PIXELS_PER_YEAR: 100,
  CARD_GAP: 32,
} as const;

export const IMPORTANCE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'کم', color: 'bg-slate-600' },
  2: { label: 'کم', color: 'bg-slate-600' },
  3: { label: 'متوسط', color: 'bg-blue-600' },
  4: { label: 'متوسط', color: 'bg-blue-600' },
  5: { label: 'معمولی', color: 'bg-blue-500' },
  6: { label: 'زیاد', color: 'bg-purple-600' },
  7: { label: 'زیاد', color: 'bg-purple-600' },
  8: { label: 'خیلی زیاد', color: 'bg-orange-600' },
  9: { label: 'خیلی زیاد', color: 'bg-orange-600' },
  10: { label: 'تاریخی', color: 'bg-red-600' },
} as const;
