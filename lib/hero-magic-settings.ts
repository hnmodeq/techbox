export const HERO_MAGIC_DEFAULTS = {
  "hero.magic.example": "Basic",
  "hero.magic.color": "#fc42ff",
  "hero.magic.colorTwo": "#42fcff",
  "hero.magic.ringCount": "6",
  "hero.magic.speed": "1",
  "hero.magic.attenuation": "10",
  "hero.magic.lineThickness": "2",
  "hero.magic.baseRadius": "0.35",
  "hero.magic.radiusStep": "0.1",
  "hero.magic.scaleRate": "0.1",
  "hero.magic.opacity": "1",
  "hero.magic.blur": "0",
  "hero.magic.noiseAmount": "0.1",
  "hero.magic.rotation": "0",
  "hero.magic.ringGap": "1.5",
  "hero.magic.fadeIn": "0.7",
  "hero.magic.fadeOut": "0.5",
  "hero.magic.mouseInfluence": "0.2",
  "hero.magic.hoverScale": "1.2",
  "hero.magic.parallax": "0.05",
  "hero.magic.followMouse": "false",
  "hero.magic.clickBurst": "false",
} as const

export type HeroMagicSettings = Record<keyof typeof HERO_MAGIC_DEFAULTS, string>

export function toNumberSetting(settings: Partial<Record<keyof typeof HERO_MAGIC_DEFAULTS, string>>, key: keyof typeof HERO_MAGIC_DEFAULTS) {
  const value = Number(settings[key] ?? HERO_MAGIC_DEFAULTS[key])
  return Number.isFinite(value) ? value : Number(HERO_MAGIC_DEFAULTS[key])
}

export function toBooleanSetting(settings: Partial<Record<keyof typeof HERO_MAGIC_DEFAULTS, string>>, key: keyof typeof HERO_MAGIC_DEFAULTS) {
  return String(settings[key] ?? HERO_MAGIC_DEFAULTS[key]) === "true"
}
