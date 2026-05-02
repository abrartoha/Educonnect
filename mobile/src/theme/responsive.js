import { Dimensions, PixelRatio } from 'react-native';

// The reference artboards were drawn at ~390pt. On most modern iPhones this
// matches exactly — we should NOT scale up. Scale DOWN slightly on small phones
// (iPhone SE at 320/375pt) so cards don't get congested.
const BASE_WIDTH = 390;

// Conservative clamp: never upscale, only gently downscale for small screens.
export function scaleSize(size) {
  const { width } = Dimensions.get('window');
  const factor = Math.min(1, Math.max(0.92, width / BASE_WIDTH));
  return Math.round(size * factor);
}

// Keep fonts honest with the design. Don't multiply by OS font scale — that
// was making everything look zoomed on devices with accessibility bumps. The
// system will still scale via OS accessibility settings when allowFontScaling
// is left at default (true) on Text.
export function scaleFont(size) {
  return scaleSize(size);
}

export function breakpoint() {
  const { width } = Dimensions.get('window');
  if (width < 360) return 'xs';
  if (width < 400) return 'sm';
  if (width < 480) return 'md';
  if (width < 768) return 'lg';
  return 'xl';
}

export const BREAKPOINTS = { xs: 360, sm: 400, md: 480, lg: 768 };

// Expose PixelRatio in case a screen really needs it
export { PixelRatio };
