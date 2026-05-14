import { Platform } from 'react-native';

export const colors = {
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  primaryActive: '#5B21B6',
  primarySoft: '#F5F3FF',
  primarySoftDark: '#EDE9FE',
  primaryLight: '#7C3AED00',
  primaryLight33: '#7C3AED33',
  primaryLight66: '#7C3AED66',
  primaryLight99: '#7C3AED99',
  primaryGlow: 'rgba(124, 58, 237, 0.15)',

  secondary: '#A78BFA',
  secondaryHover: '#8B5CF6',

  accent: '#22C55E',
  accentSoft: '#F0FDF4',
  accentDark: '#166534',
  accentGreen: '#06C760',
  accentGreen2: '#17BE5A',
  accentGreen3: '#12B76A',
  accentGreen4: '#0DD14B',
  accentGreen5: '#08C514',
  accentGlow: 'rgba(34, 197, 94, 0.15)',

  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  textLighter: '#CBD5E1',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  surface: '#FAFAFA',
  surfaceDark: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  white: '#FFFFFF',
  black: '#000000',

  success: '#10B981',
  successSoft: '#D1FAE5',
  successDark: '#065F46',

  error: '#EF4444',
  errorSoft: '#FEF2F2',
  errorDark: '#991B1B',

  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  warningDark: '#92400E',

  info: '#7C3AED',
  infoSoft: '#F5F3FF',
  infoDark: '#4C1D95',

  pending: '#FEF3C7',
  pendingText: '#92400E',
  confirmed: '#DBEAFE',
  confirmedText: '#1E3A8A',
  processing: '#EDE9FE',
  processingText: '#5B21B6',
  shipped: '#E0F2FE',
  shippedText: '#075985',
  delivered: '#D1FAE5',
  deliveredText: '#065F46',
  cancelled: '#FEE2E2',
  cancelledText: '#991B1B',

  overlay: 'rgba(15, 23, 42, 0.5)',
  backdrop: 'rgba(15, 23, 42, 0.3)',

  tabActive: '#7C3AED',
  tabInactive: '#94A3B8',

  skeleton: '#E2E8F0',
  skeletonShine: '#F1F5F9',

  glassLight: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
} as const;

export type ColorToken = keyof typeof colors;

const isWeb = Platform.OS === 'web';

const shadow = (y: number, blur: number, opacity: number, spread = 0) =>
  isWeb
    ? { boxShadow: `0 ${y}px ${blur}px ${spread > 0 ? `${spread}px` : ''} rgba(15, 23, 42, ${opacity})`.trim() }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: y },
        shadowOpacity: opacity,
        shadowRadius: blur,
        elevation: Math.max(1, Math.round((y + blur) / 4)),
      };

export const shadows = {
  none: {},
  sm: shadow(1, 2, 0.05),
  md: shadow(2, 4, 0.06),
  lg: shadow(4, 8, 0.08),
  xl: shadow(6, 16, 0.1),
  '2xl': shadow(8, 24, 0.12),
  inner: isWeb
    ? { boxShadow: 'inset 0 2px 4px rgba(15, 23, 42, 0.04)' }
    : { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
  focus: isWeb
    ? { boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.2)' }
    : { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  premium: isWeb
    ? { boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(124, 58, 237, 0.06)' }
    : {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 8,
      },
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  full: 9999,
} as const;

export const walletColors = {
  success: '#10B981',
  successSoft: '#D1FAE5',
  error: '#EF4444',
  errorSoft: '#FEF2F2',
  pending: '#F59E0B',
  pendingSoft: '#FFFBEB',
  credit: '#10B981',
  debit: '#EF4444',
  walletCardBg: '#7C3AED',
  walletCardText: '#FFFFFF',
  walletCardAccent: '#A78BFA',
} as const;
