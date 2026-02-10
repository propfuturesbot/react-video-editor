// ============================================
// DATA DISPLAY CONSTANTS
// ============================================

// Color palette for data display components
export const DATA_DISPLAY_COLORS = {
  // Primary gradient colors
  green: '#22C55E',
  orange: '#F97316',
  cyan: '#06B6D4',
  purple: '#A855F7',
  pink: '#EC4899',
  yellow: '#EAB308',
  blue: '#3B82F6',
  red: '#EF4444',
  teal: '#14B8A6',
  indigo: '#6366F1',

  // Semantic colors
  success: '#22C55E',
  warning: '#F97316',
  error: '#EF4444',
  info: '#3B82F6',

  // Background colors
  cardBg: '#16162a',
  cardBgAlt: '#1a1a2e',
  surface: '#12121f',
  background: '#0a0a14',

  // Text colors
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textDim: '#64748B',
};

// Preset gradient color sets for cards
export const GRADIENT_PRESETS = {
  primary: [DATA_DISPLAY_COLORS.purple, DATA_DISPLAY_COLORS.pink],
  secondary: [DATA_DISPLAY_COLORS.cyan, DATA_DISPLAY_COLORS.blue],
  success: [DATA_DISPLAY_COLORS.green, DATA_DISPLAY_COLORS.teal],
  warning: [DATA_DISPLAY_COLORS.orange, DATA_DISPLAY_COLORS.yellow],
  danger: [DATA_DISPLAY_COLORS.red, DATA_DISPLAY_COLORS.pink],
};

// Font configuration
export const FONTS = {
  heading: "'Poppins', 'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// Animation configuration
export const ANIMATION_CONFIG = {
  defaultDuration: 20,           // frames
  staggerDelay: 8,               // frames between staggered items
  spring: {
    damping: 12,
    mass: 0.5,
    stiffness: 100,
  },
};

// Common box shadows
export const BOX_SHADOWS = {
  // Get a glow shadow for a color
  glow: (color: string, intensity: number = 0.3) => {
    const rgb = hexToRgb(color);
    return `0 0 20px rgba(${rgb}, ${intensity}), 0 0 40px rgba(${rgb}, ${intensity * 0.5})`;
  },

  // Inset glow for cards
  insetGlow: (color: string, intensity: number = 0.1) => {
    const rgb = hexToRgb(color);
    return `inset 0 0 30px rgba(${rgb}, ${intensity})`;
  },

  // Combined glow with inset
  cardGlow: (color: string, intensity: number = 0.3) => {
    const rgb = hexToRgb(color);
    return `
      0 0 20px rgba(${rgb}, ${intensity}),
      0 0 40px rgba(${rgb}, ${intensity * 0.5}),
      inset 0 0 20px rgba(${rgb}, ${intensity * 0.15})
    `;
  },

  // Soft shadow for depth
  soft: '0 4px 20px rgba(0, 0, 0, 0.3)',

  // Elevated shadow
  elevated: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
};

// Border styles
export const BORDERS = {
  // Glowing border
  glow: (color: string, width: number = 2) => `${width}px solid ${color}`,

  // Subtle border
  subtle: (color: string) => `1px solid ${color}33`,

  // Gradient border (requires pseudo-element for full effect)
  gradientWidth: 2,
};

// Helper function to convert hex to RGB
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Helper to create rgba from hex
export function hexToRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)}, ${alpha})`;
}

// Helper to darken a hex color
export function darkenHex(hex: string, amount: number = 0.2): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = Math.max(0, Math.round(parseInt(result[1], 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(result[2], 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(result[3], 16) * (1 - amount)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper to lighten a hex color
export function lightenHex(hex: string, amount: number = 0.2): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = Math.min(255, Math.round(parseInt(result[1], 16) + (255 - parseInt(result[1], 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(result[2], 16) + (255 - parseInt(result[2], 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(result[3], 16) + (255 - parseInt(result[3], 16)) * amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Default theme for data display components
export const DATA_DISPLAY_THEME = {
  colors: DATA_DISPLAY_COLORS,
  fonts: FONTS,
  animation: ANIMATION_CONFIG,
  shadows: BOX_SHADOWS,
  borders: BORDERS,
};
