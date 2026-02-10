import { ThemeColors, AnimationTiming } from '../types';

// ============================================
// DEFAULT THEME - Modern Dark
// ============================================
export const defaultTheme: ThemeColors = {
  primary: '#A855F7',      // Vibrant Purple
  secondary: '#06B6D4',    // Cyan
  accent: '#F59E0B',       // Amber/Orange
  success: '#22C55E',      // Bright Green
  warning: '#F97316',      // Orange
  error: '#EF4444',        // Red
  background: '#0a0a14',   // Deep dark
  surface: '#12121f',      // Surface background
  cardBg: '#16162a',       // Card background
  text: '#F1F5F9',         // Bright text
  textMuted: '#94A3B8',    // Muted text
  code: {
    keyword: '#C792EA',    // Purple
    string: '#A5D6FF',     // Light blue
    number: '#F7931E',     // Orange
    function: '#FFD43B',   // Yellow
    comment: '#6A737D',    // Gray
    property: '#79C0FF',   // Cyan
    bracket: '#94A3B8',    // Muted
  },
};

// Neon color palette for diagrams
export const neonColors = {
  purple: '#A855F7',
  cyan: '#06B6D4',
  orange: '#F97316',
  green: '#22C55E',
  pink: '#EC4899',
  yellow: '#FBBF24',
  blue: '#3B82F6',
  red: '#EF4444',
};

// Get neon box shadow
export function getNeonBoxShadow(color: string, intensity: number = 0.5): string {
  const rgb = hexToRgb(color);
  return `0 0 20px rgba(${rgb}, ${intensity}), 0 0 40px rgba(${rgb}, ${intensity * 0.5}), inset 0 0 20px rgba(${rgb}, 0.1)`;
}

// Get neon border
export function getNeonBorder(color: string, width: number = 2): string {
  return `${width}px solid ${color}`;
}

// Get glass effect background
export function getGlassBackground(color: string, opacity: number = 0.1): string {
  const rgb = hexToRgb(color);
  return `linear-gradient(135deg, rgba(${rgb}, ${opacity}), rgba(${rgb}, ${opacity * 0.5}))`;
}

// Alternative themes
export const pythonTheme: ThemeColors = {
  ...defaultTheme,
  primary: '#3776AB',      // Python blue
  accent: '#FFD43B',       // Python yellow
  warning: '#F7931E',
  cardBg: '#16162a',
};

export const jsonTheme: ThemeColors = {
  ...defaultTheme,
  primary: '#F7931E',      // JSON orange
  accent: '#8B5CF6',
  cardBg: '#16162a',
};

export const tronTheme: ThemeColors = {
  ...defaultTheme,
  primary: '#00FF88',      // Neon green
  secondary: '#FF0080',    // Neon pink
  accent: '#00FFFF',       // Cyan
  background: '#000000',
  cardBg: '#0a0a0a',
};

// ============================================
// ANIMATION TIMING
// ============================================
export const defaultTiming: AnimationTiming = {
  fadeIn: 15,              // frames
  fadeOut: 10,             // frames
  stagger: 8,              // frames between elements
  spring: {
    damping: 12,
    mass: 0.5,
    stiffness: 100,
  },
};

// ============================================
// COMMON STYLES (as CSS-in-JS objects)
// ============================================
export const commonStyles = {
  // Containers
  fullScreen: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text styles
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 64,
    lineHeight: 1.2,
  },

  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 24,
    lineHeight: 1.5,
  },

  code: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 18,
    lineHeight: 1.8,
  },

  badge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    padding: '8px 16px',
    borderRadius: 50,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 24,
  },

  glowBox: (color: string, intensity: number = 0.2) => ({
    background: `rgba(${hexToRgb(color)}, 0.05)`,
    border: `1px solid rgba(${hexToRgb(color)}, 0.25)`,
    boxShadow: `0 0 30px rgba(${hexToRgb(color)}, ${intensity})`,
    borderRadius: 16,
  }),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Convert hex to RGB
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Get glow shadow
export function getGlow(color: string, intensity: number = 0.6): string {
  return `0 0 10px rgba(${hexToRgb(color)}, ${intensity}), 0 0 20px rgba(${hexToRgb(color)}, ${intensity * 0.5})`;
}

// Get neon text shadow
export function getNeonText(color: string): string {
  const rgb = hexToRgb(color);
  return `0 0 5px rgba(${rgb}, 0.8), 0 0 10px rgba(${rgb}, 0.6), 0 0 20px rgba(${rgb}, 0.4), 0 0 40px rgba(${rgb}, 0.2)`;
}

// Interpolate color
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1).split(', ').map(Number);
  const rgb2 = hexToRgb(color2).split(', ').map(Number);

  const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor);
  const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor);
  const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// FONT IMPORTS (for reference)
// ============================================
export const fontImports = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');
`;

// Default font stack
export const fonts = {
  heading: "'Poppins', 'Inter', sans-serif",
  body: "'Inter', sans-serif",
  code: "'JetBrains Mono', 'Fira Code', monospace",
};
