/**
 * Paleta minimalista: negro como color principal, blancos y grises como apoyo.
 */
export const colors = {
  bg: '#000000',
  surface: '#0B0B0B',
  surfaceAlt: '#151515',
  border: '#222222',
  borderStrong: '#3A3A3A',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  textDim: '#5A5A5E',
  accent: '#FFFFFF',
  onAccent: '#000000',
  danger: '#FF453A',
  success: '#FFFFFF',
  paper: '#FFFFFF',
  paperText: '#000000',
  paperMuted: '#6B6B6B',
  paperLine: '#D6D6D6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 34, fontWeight: '200' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '300' as const, letterSpacing: -0.2 },
  section: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.6 },
  body: { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.8 },
  mono: {
    fontSize: 13,
    fontFamily: undefined as string | undefined, // se asigna en runtime (ver monoFont)
  },
} as const;
