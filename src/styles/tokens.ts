export const Colors = {
  primary: '#6B21A8',
  secondary: '#0D9488',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  text: '#F1F0F5',
  textMuted: '#9CA3AF',
  ohang: {
    목: '#22C55E',
    화: '#EF4444',
    토: '#EAB308',
    금: '#F59E0B',
    수: '#3B82F6',
  },
} as const;

/** 크림 라이트 테마 (온보딩 + 로비 공용) */
export const AppColors = {
  cream: '#F5F0E8',
  purpleMain: '#6B21A8',
  purpleLight: '#C4B5D9',
  purpleBg: '#E8E0F0',
  purpleDark: '#4C1D95',
  goldBorder: '#C9B87A',
  goldAccent: '#D4AF37',
  cardBg: 'rgba(255,255,255,0.80)',
  surface: '#FFFFFF',
  textDark: '#2D2D2D',
  textMuted: '#9CA3AF',
  textLight: '#6B7280',
  inputBg: '#F9F7F4',
  inputBorder: '#E5E2DC',
  tabBorder: '#E5E2DC',
} as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const FontSize = { sm: 12, md: 14, lg: 18, xl: 24, xxl: 32 } as const;

export const Radius = { sm: 8, md: 12, lg: 20, full: 999 } as const;
