/**
 * Shared primitives for the homepage sections.
 *
 * Every section composes from these rather than hand-rolling markup, so
 * the Spiceworks / Tom's Guide spacing and type scale stay consistent
 * across all 14 sections.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md
 */
export { SectionHeader, type SectionHeaderProps } from "./SectionHeader";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { Byline, type BylineProps, type BylineAuthor } from "./Byline";
export { InsetBand, SectionShell, type InsetBandProps, type SectionShellProps } from "./InsetBand";
export { ScrollRail, type ScrollRailProps } from "./ScrollRail";
export { CardShell, CardMedia, type CardShellProps } from "./CardShell";
