/**
 * TECHBOX · TOOL ILLUSTRATIONS
 * ────────────────────────────────────────────────────────────────────────
 * Flat duotone SVGs for the homepage Tools section (§8), which copies the
 * Spiceworks "Tools & Apps" grid. Spiceworks uses flat coloured
 * illustrations rather than line icons — that weight is the look, so these
 * are solid fills with no strokes and no gradients.
 *
 * Deliberately NOT `currentColor`: they are polychrome by design. Every
 * fill is a mid-tone that reads on both the light (#F8FAFC) and dark
 * (#0B1017) page background, so one asset serves both themes and there is
 * no second set to keep in sync.
 *
 * Palette (decision D1):
 *   base  #0F4C81  brand blue      — chassis, structure
 *   mid   #4A9EDE  lifted blue     — secondary surfaces
 *   pale  #A8CDEA  tint            — highlights
 *   hot   #E85D04  accent orange   — the one element that matters
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §8
 */
import * as React from "react";

/*
 * Tonal, not polychrome.
 *
 * The original set used four fixed brand colours. After D1 was reversed
 * the site palette is achromatic, so hard-coded blues and orange looked
 * foreign and ignored the theme entirely.
 *
 * These now draw entirely in `currentColor` at four opacities, so an icon
 * takes the colour of whatever text context it sits in and follows both
 * light and dark automatically. Depth comes from tone, not hue.
 */
const BASE = "currentColor";       // solid — main mass
const MID = "currentColor";        // 55%   — secondary surfaces
const PALE = "currentColor";       // 28%   — highlights
const HOT = "currentColor";        // solid — the one element that matters

export type ToolIconProps = {
  size?: number;
  className?: string;
  title?: string;
};

function svgProps(size: number, className?: string, title?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 72 72",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    role: title ? ("img" as const) : ("presentation" as const),
    "aria-hidden": title ? undefined : true,
    focusable: false,
  };
}

/** RAID / storage capacity calculator — stacked platters, one is parity. */
export function RaidToolIcon({ size = 72, className, title }: ToolIconProps) {
  return (
    <svg {...svgProps(size, className, title)}>
      {title && <title>{title}</title>}
      {/* bottom platter */}
      <ellipse cx="36" cy="52" rx="24" ry="8" fill={BASE} />
      <rect x="12" y="44" width="48" height="8" fill={BASE} />
      <ellipse cx="36" cy="44" rx="24" ry="8" fill={MID} opacity="0.55" />
      {/* middle platter */}
      <rect x="12" y="32" width="48" height="8" fill={BASE} />
      <ellipse cx="36" cy="32" rx="24" ry="8" fill={MID} opacity="0.55" />
      {/* top platter — the parity disk */}
      <rect x="12" y="20" width="48" height="8" fill={HOT} opacity="0.85" />
      <ellipse cx="36" cy="20" rx="24" ry="8" fill={HOT} />
      <ellipse cx="36" cy="20" rx="7" ry="2.5" fill={PALE} opacity="0.35" />
    </svg>
  );
}

/** NAS selector — 4-bay chassis with drive fronts and an activity LED. */
export function NasToolIcon({ size = 72, className, title }: ToolIconProps) {
  return (
    <svg {...svgProps(size, className, title)}>
      {title && <title>{title}</title>}
      {/* chassis outline — stroked, so the body reads as a container
          rather than a filled block when every fill is the same colour */}
      <rect x="15" y="9" width="42" height="54" rx="5" fill="none" stroke={BASE} strokeWidth="3" />
      {/* drive bays */}
      <rect x="22" y="16" width="22" height="8" rx="2" fill={MID} opacity="0.55" />
      <rect x="22" y="27" width="22" height="8" rx="2" fill={MID} opacity="0.55" />
      <rect x="22" y="38" width="22" height="8" rx="2" fill={MID} opacity="0.55" />
      <rect x="22" y="49" width="22" height="8" rx="2" fill={PALE} opacity="0.3" />
      {/* activity LEDs — the solid one is the focal element */}
      <circle cx="51" cy="20" r="2.5" fill={HOT} />
      <circle cx="51" cy="31" r="2.5" fill={PALE} opacity="0.4" />
      <circle cx="51" cy="42" r="2.5" fill={PALE} opacity="0.4" />
    </svg>
  );
}

/** NVR selector — wall-mount security camera with signal waves. */
export function NvrToolIcon({ size = 72, className, title }: ToolIconProps) {
  return (
    <svg {...svgProps(size, className, title)}>
      {title && <title>{title}</title>}
      {/* signal waves — behind the body, fully inside the canvas */}
      <path
        d="M20 47 A 15 15 0 0 0 33 60"
        stroke={MID}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M14 52 A 22 22 0 0 0 34 66"
        stroke={HOT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* wall plate + arm */}
      <rect x="10" y="12" width="6" height="26" rx="3" fill={BASE} />
      <rect x="16" y="22" width="9" height="5" rx="2.5" fill={MID} opacity="0.55" />
      {/* sun shield */}
      <rect x="23" y="11" width="34" height="6" rx="3" fill={MID} opacity="0.55" />
      {/* camera body */}
      <rect x="23" y="15" width="34" height="22" rx="6" fill={BASE} />
      {/* lens */}
      <circle cx="47" cy="26" r="8" fill={MID} opacity="0.55" />
      <circle cx="47" cy="26" r="4.5" fill={PALE} opacity="0.28" />
      <circle cx="47" cy="26" r="1.8" fill={BASE} />
      {/* rec indicator */}
      <circle cx="31" cy="26" r="2.6" fill={HOT} />
    </svg>
  );
}

/** Subnet calculator — one network splitting into three subnets. */
export function SubnetToolIcon({ size = 72, className, title }: ToolIconProps) {
  return (
    <svg {...svgProps(size, className, title)}>
      {title && <title>{title}</title>}
      {/* trunk down from the root */}
      <rect x="34.5" y="21" width="3" height="11" rx="1.5" fill={MID} opacity="0.55" />
      {/* horizontal bus */}
      <rect x="14.5" y="31" width="43" height="3" rx="1.5" fill={MID} opacity="0.55" />
      {/* drops to each leaf */}
      <rect x="14.5" y="33" width="3" height="9" rx="1.5" fill={MID} opacity="0.55" />
      <rect x="34.5" y="33" width="3" height="9" rx="1.5" fill={MID} opacity="0.55" />
      <rect x="54.5" y="33" width="3" height="9" rx="1.5" fill={MID} opacity="0.55" />
      {/* root network */}
      <rect x="24" y="8" width="24" height="14" rx="4" fill={BASE} />
      <rect x="29" y="13" width="14" height="3.5" rx="1.75" fill={PALE} opacity="0.28" />
      {/* three subnets, evenly spaced, no overlap */}
      <rect x="6" y="42" width="19" height="14" rx="4" fill={MID} opacity="0.55" />
      <rect x="10" y="47" width="11" height="3.5" rx="1.75" fill={PALE} opacity="0.28" />
      <rect x="26.5" y="42" width="19" height="14" rx="4" fill={HOT} />
      <rect x="30.5" y="47" width="11" height="3.5" rx="1.75" fill={PALE} opacity="0.35" />
      <rect x="47" y="42" width="19" height="14" rx="4" fill={MID} opacity="0.55" />
      <rect x="51" y="47" width="11" height="3.5" rx="1.75" fill={PALE} opacity="0.28" />
    </svg>
  );
}

/** UPS / rack power calculator — rack silhouette with a power bolt. */
export function UpsToolIcon({ size = 72, className, title }: ToolIconProps) {
  return (
    <svg {...svgProps(size, className, title)}>
      {title && <title>{title}</title>}
      {/* rack frame, stroked for the same reason as the NAS chassis */}
      <rect x="13" y="8" width="46" height="56" rx="5" fill="none" stroke={BASE} strokeWidth="3" />
      {/* rack units */}
      <rect x="20" y="15" width="32" height="7" rx="2" fill={MID} opacity="0.55" />
      <rect x="20" y="25" width="32" height="7" rx="2" fill={MID} opacity="0.55" />
      {/* battery unit with charge cells */}
      <rect x="20" y="48" width="32" height="10" rx="2.5" fill={PALE} opacity="0.3" />
      <rect x="23" y="51" width="6" height="4" rx="1" fill={MID} opacity="0.55" />
      <rect x="31" y="51" width="6" height="4" rx="1" fill={MID} opacity="0.55" />
      <rect x="39" y="51" width="6" height="4" rx="1" fill={HOT} />
      {/* power bolt — solid focal element */}
      <path d="M38 34 L27 44 L34 44 L31 54 L44 42 L36 42 Z" fill={HOT} />
    </svg>
  );
}

/** Registry keyed by the `slug` in config/modules.config.ts → toolRoutes. */
export const toolIcons = {
  "raid-calculator": RaidToolIcon,
  "nas-selector": NasToolIcon,
  "nvr-selector": NvrToolIcon,
  "subnet-calculator": SubnetToolIcon,
  "ups-calculator": UpsToolIcon,
} as const;

export type ToolIconSlug = keyof typeof toolIcons;

/**
 * Renders the illustration for a tool slug.
 * Returns `null` for an unknown slug rather than a placeholder glyph —
 * a missing icon should be visible in review, not papered over.
 */
export function ToolIcon({
  slug,
  ...props
}: { slug: string } & ToolIconProps) {
  const Cmp = toolIcons[slug as ToolIconSlug];
  return Cmp ? <Cmp {...props} /> : null;
}
