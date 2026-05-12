/**
 * BexieMart Color System
 * Inspired by: Airbnb (Rausch coral restraint), Shopify (surface hierarchy),
 * Stripe (semantic depth), Material 3 (soft tonal backgrounds)
 *
 * Principles:
 * - One accent (#004CFF), used sparingly (≤2 per screen)
 * - Semantic colors have soft background variants for badges/chips
 * - Neutrals are blue-gray for warmth, not cold gray
 */

export const colors = {
  /* ─── Brand ───────────────────────────────────── */
  primary: '#004CFF',
  primaryHover: '#0040E0',
  primarySoft: '#EEF2FF',    // 8% tint for chips, active states
  primarySoftDark: '#D4DCFF', // 16% tint for selected rows

  /* ─── Neutrals (blue-gray scale, not cold gray) ─ */
  text: '#111322',           // Near-black for headings
  textSecondary: '#5F6C7B',  // Muted labels
  textLight: '#9BA5B0',      // Disabled, timestamps
  textLighter: '#C8CFD6',    // Placeholders
  border: '#E4E7EC',         // Hairline dividers
  borderLight: '#F0F2F5',    // Subtle separators
  surface: '#F8F9FA',        // Page background (off-white for depth)
  surfaceDark: '#F0F2F5',    // Elevated subsurface
  white: '#FFFFFF',

  /* ─── Semantic ────────────────────────────────── */
  success: '#08A81D',
  successSoft: '#D1FAE5',
  successDark: '#065F46',

  error: '#B3261E',
  errorSoft: '#FEE2E2',
  errorDark: '#7F1D1D',

  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningDark: '#78350F',

  info: '#004CFF',
  infoSoft: '#DBEAFE',
  infoDark: '#1E3A5F',

  /* ─── Status (for badges, order states) ──────── */
  pending: '#FEF3C7',
  pendingText: '#92400E',
  confirmed: '#DBEAFE',
  confirmedText: '#1E40AF',
  processing: '#EDE9FE',
  processingText: '#5B21B6',
  shipped: '#E0F2FE',
  shippedText: '#075985',
  delivered: '#D1FAE5',
  deliveredText: '#065F46',
  cancelled: '#FEE2E2',
  cancelledText: '#991B1B',

  /* ─── Overlay & Elevation ────────────────────── */
  overlay: 'rgba(0, 0, 0, 0.4)',
  backdrop: 'rgba(0, 0, 0, 0.24)',

  /* ─── Utility ────────────────────────────────── */
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Elevation System
 * Inspired by Airbnb (stacked 3-layer), Shopify (multi-layer with inset glow),
 * Material 3 (ambient + directional keys)
 *
 * Philosophy: shadows are layered — multiple low-opacity shadows create
 * a natural, premium lift that single shadows can't achieve.
 */

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const shadows = {
  /* ─── Shadow presets for StyleSheet ─────────── */
  none: {},

  sm: isWeb
    ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },

  md: isWeb
    ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },

  lg: isWeb
    ? { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },

  xl: isWeb
    ? { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.10)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
      },

  '2xl': isWeb
    ? { boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.12)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      },

  inner: isWeb
    ? { boxShadow: 'inset 0px 2px 4px rgba(0, 0, 0, 0.04)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },

  focus: isWeb
    ? { boxShadow: '0px 0px 4px rgba(0, 76, 255, 0.20)' }
    : {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
} as const;

/**
 * Border Radius Scale
 * Inspired by Airbnb (14px cards, 32px pills), Shopify (8px standard),
 * Uber (999px full pills)
 */
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;
