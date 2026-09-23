/**
 * Paleta minimalista: negro/blanco como color principal según el tema,
 * grises como apoyo. Misma filosofía de diseño en claro y oscuro.
 */
export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  onAccent: string;
  danger: string;
  success: string;
  /** El papel del recibo es siempre blanco, como uno impreso de verdad. */
  paper: string;
  paperText: string;
  paperMuted: string;
  paperLine: string;
}

export const darkColors: Palette = {
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
};

export const lightColors: Palette = {
  bg: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceAlt: '#EFEFF0',
  border: '#E2E2E4',
  borderStrong: '#C7C7CC',
  text: '#000000',
  textMuted: '#6B6B70',
  textDim: '#9A9AA0',
  accent: '#000000',
  onAccent: '#FFFFFF',
  danger: '#FF3B30',
  success: '#000000',
  paper: '#FFFFFF',
  paperText: '#000000',
  paperMuted: '#6B6B6B',
  paperLine: '#D6D6D6',
};

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
} as const;
