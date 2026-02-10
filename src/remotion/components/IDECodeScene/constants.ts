// ============================================
// IDE CODE SCENE - CONSTANTS
// ============================================

// IDE color palette (IntelliJ Darcula theme inspired)
export const IDE_COLORS = {
  bgVoid: '#0d0d0d',
  bgEditor: '#2b2b2b',
  bgTitleBar: '#3c3f41',
  bgGutter: '#313335',
  textPrimary: '#A9B7C6',
  textMuted: '#606366',
  textLineNum: '#606366',
  borderColor: '#3c3f41',
};

// Syntax highlighting colors
export const SYNTAX_COLORS = {
  keyword: '#CC7832',      // Orange - public, class, if, return
  string: '#6A8759',       // Green - "Hello World"
  number: '#6897BB',       // Blue - 42, 3.14
  method: '#FFC66D',       // Yellow - getInstance(), connect()
  type: '#A9B7C6',         // Light gray - DatabaseConnection, String
  comment: '#808080',      // Gray - // comments
  property: '#9876AA',     // Purple - fields
  bracket: '#A9B7C6',      // Light gray - (), {}, []
};

// Default annotation colors
export const ANNOTATION_COLORS = {
  red: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  green: '#95E1D3',
  purple: '#DDA0DD',
  blue: '#6BB5FF',
  orange: '#FF9F43',
};

// Animation timing constants (at 30fps)
export const TIMING = {
  // Intro phase
  INTRO_DURATION: 90,          // 3 seconds

  // Zoom phase
  ZOOM_START: 60,              // Start zoom at 2 seconds
  ZOOM_END: 120,               // Complete zoom by 4 seconds
  ZOOM_INITIAL_SCALE: 0.15,    // Start very small
  ZOOM_FINAL_SCALE: 1.0,       // End at full size

  // Typing phase
  TYPING_START_OFFSET: 10,     // Frames after zoom completes
  TYPING_SPEED: 1.5,           // Characters per frame

  // Annotation phase
  ANNOTATION_DURATION: 135,    // ~4.5 seconds per annotation
  ANNOTATION_DELAY: 18,        // Frames before showing annotation box
  ANNOTATION_FADE_OUT: 24,     // Frames to fade out annotation
  ANNOTATION_CYCLE_PAUSE: 60,  // Pause between annotation cycles

  // Scrolling
  SCROLL_THRESHOLD_PERCENT: 0.6, // Start scrolling when cursor passes 60%
  SCROLL_DAMPING: 50,          // Spring damping for smooth scroll
};

// Layout constants
export const LAYOUT = {
  IDE_WIDTH: 1000,               // Narrower to make room for external annotation (was 1400)
  LINE_HEIGHT: 24,
  GUTTER_WIDTH: 55,
  CODE_AREA_MAX_X: 650,          // Max X for laser pointer in code area (adjusted for narrower IDE)
  DEFAULT_VISIBLE_LINES: 18,
  DEFAULT_FONT_SIZE: 18,
  LINE_NUMBER_FONT_SIZE: 16,
  ANNOTATION_TITLE_SIZE: 14,
  ANNOTATION_DESC_SIZE: 16,
  // External annotation panel constants
  ANNOTATION_GAP: 40,            // Gap between IDE and annotation panel
  EXTERNAL_ANNOTATION_WIDTH: 380, // Width of external annotation panel
};

// Language keywords for syntax highlighting
export const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  java: [
    'public', 'private', 'protected', 'static', 'final', 'volatile',
    'synchronized', 'class', 'interface', 'extends', 'implements',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'return', 'try', 'catch', 'finally', 'throw', 'throws',
    'new', 'this', 'super', 'null', 'true', 'false', 'void',
    'import', 'package', 'abstract', 'enum', 'instanceof', 'default',
  ],
  python: [
    'def', 'class', 'import', 'from', 'as', 'return', 'yield',
    'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
    'try', 'except', 'finally', 'raise', 'with', 'assert',
    'lambda', 'pass', 'None', 'True', 'False', 'and', 'or', 'not',
    'in', 'is', 'global', 'nonlocal', 'async', 'await', 'self',
  ],
  javascript: [
    'const', 'let', 'var', 'function', 'class', 'extends',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'return', 'try', 'catch', 'finally', 'throw',
    'new', 'this', 'super', 'null', 'undefined', 'true', 'false',
    'import', 'export', 'default', 'from', 'as', 'typeof', 'instanceof',
    'async', 'await', 'yield', 'of', 'in', 'delete', 'void',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'class', 'extends', 'implements',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'return', 'try', 'catch', 'finally', 'throw',
    'new', 'this', 'super', 'null', 'undefined', 'true', 'false',
    'import', 'export', 'default', 'from', 'as', 'typeof', 'instanceof',
    'async', 'await', 'yield', 'of', 'in', 'delete', 'void',
    'interface', 'type', 'enum', 'namespace', 'module', 'declare',
    'public', 'private', 'protected', 'readonly', 'static', 'abstract',
  ],
  go: [
    'func', 'package', 'import', 'var', 'const', 'type', 'struct',
    'interface', 'map', 'chan', 'range', 'if', 'else', 'for',
    'switch', 'case', 'default', 'break', 'continue', 'return',
    'go', 'defer', 'select', 'fallthrough', 'nil', 'true', 'false',
    'make', 'new', 'append', 'len', 'cap', 'copy', 'delete',
  ],
};

// Language file icons
export const LANGUAGE_ICONS: Record<string, { color: string; letter: string }> = {
  java: { color: '#CC7832', letter: 'J' },
  python: { color: '#3776AB', letter: 'Py' },
  javascript: { color: '#F7DF1E', letter: 'JS' },
  typescript: { color: '#3178C6', letter: 'TS' },
  go: { color: '#00ADD8', letter: 'Go' },
};
