/**
 * BexieMart Typography System
 * Inspired by Airbnb (Cereal VF single-family, 500 as "new 400"),
 * Shopify (display at light weight, precise variable scales)
 *
 * Rules:
 * - Raleway for display/headings (700 for bold, 600 for emphasis, 400 for light display)
 * - Nunito for body/UI (500 as default body weight — confident, not light)
 * - Tight line-heights for headings (1.1-1.3), generous for body (1.5+)
 * - Tracking: negative on display only, neutral on body
 */

export const fonts = {
  heading: 'Raleway_700Bold',
  headingSemi: 'Raleway_600SemiBold',
  headingLight: 'Raleway_400Regular',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  light: 'Nunito_300Light',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
} as const;

/**
 * Pre-composed type presets for consistent usage across screens.
 * Use these instead of composing size + weight + lineHeight manually.
 */
export const typePresets = {
  /* ─── Display (hero, splash) ──────────────── */
  display: {
    fontFamily: fonts.headingSemi,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as const,

  /* ─── Headings ────────────────────────────── */
  h1: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  } as const,

  h2: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  } as const,

  h3: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.1,
  } as const,

  h4: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    lineHeight: 24,
  } as const,

  h5: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 22,
  } as const,

  /* ─── Body ────────────────────────────────── */
  bodyLg: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
  } as const,

  body: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
  } as const,

  bodySm: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  } as const,

  /* ─── Labels & Metadata ───────────────────── */
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  } as const,

  labelSm: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
  } as const,

  muted: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  } as const,

  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  } as const,

  /* ─── Numeric (prices, counts, stats) ─────── */
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    lineHeight: 24,
  } as const,

  priceSm: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  } as const,

  priceLg: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  } as const,

  stat: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  } as const,
} as const;

export type TypePreset = keyof typeof typePresets;
