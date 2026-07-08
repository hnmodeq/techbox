const palette = [
  ['#0f172a', '#38bdf8'],
  ['#111827', '#a78bfa'],
  ['#18181b', '#f472b6'],
  ['#0f172a', '#34d399'],
  ['#1f2937', '#f59e0b'],
  ['#111827', '#fb7185'],
];

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(31, h) + input.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function imagePlaceholder(seed = 'techbox') {
  const [from, to] = palette[hash(seed) % palette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
        <filter id="b"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="24" height="16" fill="url(#g)"/>
      <circle cx="18" cy="4" r="7" fill="${to}" opacity=".45" filter="url(#b)"/>
      <circle cx="5" cy="13" r="6" fill="${from}" opacity=".55" filter="url(#b)"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

export function blurProps(src?: string | null) {
  return {
    placeholder: 'blur' as const,
    blurDataURL: imagePlaceholder(src || 'techbox'),
  };
}
