import { colors, gradients } from './colors';
import { scaleFont, scaleSize } from './responsive';

// Compact spacing — matches the reference without feeling zoomed on small phones.
export const spacing = {
  xs: scaleSize(4),
  sm: scaleSize(6),
  md: scaleSize(10),
  lg: scaleSize(14),
  xl: scaleSize(18),
  '2xl': scaleSize(22),
  '3xl': scaleSize(28),
  '4xl': scaleSize(36),
  '5xl': scaleSize(52),
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  full: 9999,
};

// Tightened typography. Display sizes are 22 / 20 / 18 (was 32 / 28 / 22)
// so headings read at a normal mobile scale.
export const typography = {
  displayXl: { fontSize: scaleFont(24), fontWeight: '800', letterSpacing: -0.5 },
  displayLg: { fontSize: scaleFont(22), fontWeight: '800', letterSpacing: -0.4 },
  displayMd: { fontSize: scaleFont(18), fontWeight: '700', letterSpacing: -0.2 },
  titleLg: { fontSize: scaleFont(16), fontWeight: '700' },
  titleMd: { fontSize: scaleFont(14), fontWeight: '600' },
  bodyLg: { fontSize: scaleFont(14), fontWeight: '500' },
  body: { fontSize: scaleFont(13), fontWeight: '400' },
  caption: { fontSize: scaleFont(11), fontWeight: '500' },
  micro: { fontSize: scaleFont(9), fontWeight: '700', letterSpacing: 0.6 },
  label: { fontSize: scaleFont(10), fontWeight: '700', letterSpacing: 1 },
};

// Soft shadow system.  Tints slightly purple to match the reference.
export const shadow = {
  sm: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  // Strong violet glow reserved for gradient-primary CTAs and hero cards
  glow: {
    shadowColor: '#6D4DE6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

export { colors, gradients };
export * from './responsive';

export const theme = { colors, gradients, spacing, radius, typography, shadow };
export default theme;
