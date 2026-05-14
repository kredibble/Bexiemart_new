export const fonts = {
  heading: 'Rubik_700Bold',
  headingSemi: 'Rubik_600SemiBold',
  headingMedium: 'Rubik_500Medium',
  headingLight: 'Rubik_400Regular',
  body: 'NunitoSans_400Regular',
  bodyMedium: 'NunitoSans_500Medium',
  bodySemi: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
  light: 'NunitoSans_300Light',
} as const;

export const fontSizes = {
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
  '7xl': 40,
  '8xl': 48,
  '9xl': 56,
  hero: 72,
} as const;

export const typePresets = {
  hero: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.hero,
    lineHeight: 80,
    letterSpacing: -1.5,
  },
  display: {
    fontFamily: fonts.headingSemi,
    fontSize: fontSizes['6xl'],
    lineHeight: 40,
    letterSpacing: -0.75,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['4xl'],
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['3xl'],
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fonts.headingSemi,
    fontSize: fontSizes['2xl'],
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: fonts.headingSemi,
    fontSize: fontSizes.xl,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  h5: {
    fontFamily: fonts.headingSemi,
    fontSize: fontSizes.lg,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.lg,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSizes.base,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSizes.sm,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: 16,
  },
  price: {
    fontFamily: fonts.headingSemi,
    fontSize: fontSizes.xl,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  priceSm: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.base,
    lineHeight: 20,
  },
  priceLg: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['5xl'],
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  stat: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['4xl'],
    lineHeight: 30,
    letterSpacing: -0.5,
  },
} as const;

export type TypePreset = keyof typeof typePresets;
