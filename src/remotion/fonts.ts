/**
 * Font configuration stubs for Remotion components
 * These are simplified versions that work in the browser preview
 */

// Common fonts used in video generation
export const FONT_GEIST_SANS = 'Inter, system-ui, sans-serif';
export const FONT_GEIST_MONO = 'JetBrains Mono, Consolas, monospace';

// Font loading function (stub - fonts are loaded via CSS in video editor)
export function loadFonts() {
  // In the video editor preview, fonts are loaded via CSS
  // This is a no-op stub
  return Promise.resolve();
}

// Font face definitions (for reference)
export const fontFaces = {
  inter: FONT_GEIST_SANS,
  mono: FONT_GEIST_MONO,
};

// Exported as object for compatibility with existing imports
export const fonts = {
  geistSans: FONT_GEIST_SANS,
  geistMono: FONT_GEIST_MONO,
  inter: FONT_GEIST_SANS,
  mono: FONT_GEIST_MONO,
  jetbrains: 'JetBrains Mono, Consolas, monospace',
  orbitron: 'Inter, system-ui, sans-serif',
};
