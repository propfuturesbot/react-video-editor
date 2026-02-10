// DSA Component Constants

import { Complexity } from './types';

// ============================================
// COLORS
// ============================================

export const DSA_COLORS = {
  // Array cell states
  cell: {
    default: '#1e293b',
    border: '#475569',
    text: '#f8fafc',
    current: '#3b82f6',
    comparing: '#f59e0b',
    swapping: '#ef4444',
    sorted: '#22c55e',
    pivot: '#8b5cf6',
    minimum: '#06b6d4',
    maximum: '#f97316',
    found: '#22c55e',
    visited: '#6366f1',
    target: '#ec4899',
    window: 'rgba(59, 130, 246, 0.3)',
    // Additional state colors
    success: '#22c55e',
    error: '#ef4444',
    empty: '#334155',
  },

  // Pointer colors
  pointer: {
    left: '#3b82f6',
    right: '#ef4444',
    mid: '#f59e0b',
    slow: '#22c55e',
    fast: '#ef4444',
    i: '#8b5cf6',
    j: '#06b6d4',
    k: '#f97316',
    // Generic pointer colors
    primary: '#3b82f6',
    secondary: '#8b5cf6',
  },

  // Complexity colors
  complexity: {
    'O(1)': '#22c55e',
    'O(log n)': '#84cc16',
    'O(n)': '#eab308',
    'O(n log n)': '#f97316',
    'O(n²)': '#ef4444',
    'O(n³)': '#dc2626',
    'O(2^n)': '#991b1b',
    'O(n!)': '#7f1d1d',
  } as Record<Complexity, string>,

  // Python syntax (Dracula theme)
  syntax: {
    keyword: '#ff79c6',
    builtin: '#8be9fd',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    class: '#ffb86c',
    operator: '#ff79c6',
    punctuation: '#f8f8f2',
    variable: '#f8f8f2',
    decorator: '#ff79c6',
    parameter: '#ffb86c',
    type_hint: '#8be9fd',
    background: '#282a36',
    lineNumber: '#6272a4',
    lineHighlight: 'rgba(68, 71, 90, 0.5)',
  },

  // UI colors
  ui: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    cardBg: '#1e293b', // Alias for card
    border: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  },

  // Company badge colors
  company: {
    Google: '#4285f4',
    Amazon: '#ff9900',
    Facebook: '#1877f2',
    Meta: '#1877f2',
    Microsoft: '#00a4ef',
    Apple: '#555555',
    Netflix: '#e50914',
    LinkedIn: '#0a66c2',
    Twitter: '#1da1f2',
    Uber: '#000000',
  } as Record<string, string>,

  // Difficulty badge colors
  difficulty: {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444',
  },

  // Code editor colors
  code: {
    background: '#282a36',
    text: '#f8f8f2',
    lineNumber: '#6272a4',
    currentLine: '#44475a',
    highlight: '#bd93f9',
  },
};

// ============================================
// TIMING (in frames at 30fps)
// ============================================

export const DSA_TIMING = {
  // Basic animations
  instant: 3,
  fast: 6,
  quick: 9,
  normal: 15,
  medium: 24,
  slow: 30,
  verySlow: 45,
  dramatic: 60,

  // Stagger delays
  stagger: {
    rapid: 2,
    quick: 4,
    normal: 6,
    relaxed: 10,
    dramatic: 15,
  },

  // Scene durations (in seconds)
  scene: {
    hook: 10,
    analogy: 45,
    abstraction: 20,
    naive: 45,
    optimal: 90,
    dryRun: 90,
    complexity: 40,
    applications: 45,
    interview: 60,
  },

  // Pause durations
  pause: {
    brief: 10,
    short: 20,
    medium: 30,
    long: 45,
  },
};

// ============================================
// SPRING CONFIGS
// ============================================

export const DSA_SPRINGS = {
  snappy: { damping: 30, stiffness: 500, mass: 1 },
  smooth: { damping: 20, stiffness: 200, mass: 1 },
  bouncy: { damping: 10, stiffness: 150, mass: 1 },
  stiff: { damping: 25, stiffness: 400, mass: 1 },
  gentle: { damping: 15, stiffness: 100, mass: 1 },
  elastic: { damping: 8, stiffness: 200, mass: 0.8 },
};

// ============================================
// DIMENSIONS
// ============================================

export const DSA_DIMENSIONS = {
  // Array cell sizes
  cell: {
    width: 60,
    height: 60,
    gap: 8,
    borderRadius: 8,
    fontSize: 20,
    indexFontSize: 12,
  },

  // Pointer sizes
  pointer: {
    arrowSize: 12,
    labelFontSize: 14,
    offset: 20,
  },

  // Code display
  code: {
    fontSize: 18,
    lineHeight: 28,
    padding: 24,
    borderRadius: 12,
  },

  // Complexity graph
  complexity: {
    width: 400,
    height: 300,
    padding: 40,
  },
};

// ============================================
// PYTHON KEYWORDS
// ============================================

export const PYTHON_KEYWORDS = [
  'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return',
  'import', 'from', 'as', 'try', 'except', 'finally', 'raise',
  'with', 'assert', 'yield', 'lambda', 'pass', 'break', 'continue',
  'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
  'global', 'nonlocal', 'del', 'async', 'await',
];

export const PYTHON_BUILTINS = [
  'len', 'range', 'print', 'int', 'str', 'float', 'list', 'dict',
  'set', 'tuple', 'bool', 'type', 'isinstance', 'issubclass',
  'abs', 'min', 'max', 'sum', 'sorted', 'reversed', 'enumerate',
  'zip', 'map', 'filter', 'reduce', 'any', 'all', 'open', 'input',
  'ord', 'chr', 'hex', 'bin', 'oct', 'round', 'pow', 'divmod',
  'hash', 'id', 'repr', 'format', 'slice', 'super', 'object',
  'staticmethod', 'classmethod', 'property', 'getattr', 'setattr',
  'hasattr', 'delattr', 'callable', 'iter', 'next', 'vars', 'dir',
];

// ============================================
// SORTING ALGORITHM INFO
// ============================================

export const SORTING_INFO: Record<string, {
  name: string;
  type: string;
  time: { best: string; average: string; worst: string };
  space: string;
  stable: boolean;
  inPlace: boolean;
}> = {
  bubble: {
    name: 'Bubble Sort',
    type: 'Comparison Sort',
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: true,
    inPlace: true,
  },
  selection: {
    name: 'Selection Sort',
    type: 'Comparison Sort',
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: false,
    inPlace: true,
  },
  insertion: {
    name: 'Insertion Sort',
    type: 'Comparison Sort',
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    stable: true,
    inPlace: true,
  },
  merge: {
    name: 'Merge Sort',
    type: 'Divide & Conquer',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    stable: true,
    inPlace: false,
  },
  quick: {
    name: 'Quick Sort',
    type: 'Divide & Conquer',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    stable: false,
    inPlace: true,
  },
  heap: {
    name: 'Heap Sort',
    type: 'Selection Sort',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
    stable: false,
    inPlace: true,
  },
  counting: {
    name: 'Counting Sort',
    type: 'Non-Comparison',
    time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
    space: 'O(k)',
    stable: true,
    inPlace: false,
  },
  radix: {
    name: 'Radix Sort',
    type: 'Non-Comparison',
    time: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
    space: 'O(n + k)',
    stable: true,
    inPlace: false,
  },
  bucket: {
    name: 'Bucket Sort',
    type: 'Distribution Sort',
    time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n²)' },
    space: 'O(n)',
    stable: true,
    inPlace: false,
  },
};

// ============================================
// REAL-WORLD APPLICATIONS
// ============================================

export const ARRAY_APPLICATIONS = [
  { name: 'Image pixels storage', industry: 'Graphics', icon: 'Image', description: 'Digital images are stored as 2D arrays of pixel values' },
  { name: 'Audio sample buffers', industry: 'Audio Processing', icon: 'Music', description: 'Audio data is processed as arrays of sample values' },
  { name: 'Database rows', industry: 'Databases', icon: 'Database', description: 'Query results are returned as arrays of records' },
  { name: 'Stock price history', industry: 'Finance', icon: 'TrendingUp', description: 'Time-series data stored in sequential arrays' },
  { name: 'Game leaderboards', industry: 'Gaming', icon: 'Trophy', description: 'Sorted arrays of player scores' },
  { name: 'Shopping cart items', industry: 'E-commerce', icon: 'ShoppingCart', description: 'List of items in user cart' },
];

export const TWO_POINTER_APPLICATIONS = [
  { name: 'Palindrome checking', industry: 'Text Processing', icon: 'Type', description: 'Compare characters from both ends' },
  { name: 'Merge sorted arrays', industry: 'Databases', icon: 'Database', description: 'Efficient merging of sorted data' },
  { name: 'Finding pairs', industry: 'Analytics', icon: 'Users', description: 'Find matching pairs in datasets' },
  { name: 'Container problems', industry: 'Logistics', icon: 'Package', description: 'Optimize container capacity' },
];

export const SLIDING_WINDOW_APPLICATIONS = [
  { name: 'Network packet analysis', industry: 'Networking', icon: 'Wifi', description: 'Analyze packets in time windows' },
  { name: 'Stock trading signals', industry: 'Finance', icon: 'TrendingUp', description: 'Moving averages and trend detection' },
  { name: 'Rate limiting', industry: 'Web Services', icon: 'Shield', description: 'Track requests within time windows' },
  { name: 'Substring problems', industry: 'Text Search', icon: 'Search', description: 'Find patterns in text' },
];

// ============================================
// INTERVIEW QUESTIONS
// ============================================

export const ARRAY_INTERVIEW_QUESTIONS = {
  two_sum: {
    main: 'Find two numbers that add up to target',
    difficulty: 'Easy' as const,
    companies: ['Google', 'Amazon', 'Facebook', 'Microsoft', 'Apple'],
    followUps: [
      'What if the array is sorted?',
      'What if there are multiple valid pairs?',
      'Can you do it in one pass?',
      'What if we need indices vs values?',
    ],
    edgeCases: ['Empty array', 'Single element', 'No valid pair', 'Duplicate numbers', 'Negative numbers'],
    commonMistakes: ['Using same element twice', 'Not handling duplicates', 'O(n²) brute force'],
    optimalTime: 'O(n)' as const,
    optimalSpace: 'O(n)' as const,
    interviewTime: '15-20 minutes',
  },
  container_water: {
    main: 'Container With Most Water',
    difficulty: 'Medium' as const,
    companies: ['Amazon', 'Google', 'Facebook', 'Bloomberg'],
    followUps: [
      'Can you solve it in O(n)?',
      'What is the greedy insight?',
      'Why move the shorter line?',
    ],
    edgeCases: ['Two elements', 'All same height', 'Decreasing heights', 'Increasing heights'],
    commonMistakes: ['Moving both pointers', 'Wrong area calculation', 'Not considering all cases'],
    optimalTime: 'O(n)' as const,
    optimalSpace: 'O(1)' as const,
    interviewTime: '20-25 minutes',
  },
  max_subarray: {
    main: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium' as const,
    companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Apple'],
    followUps: [
      'Can you return the subarray indices?',
      'What if all numbers are negative?',
      'Divide and conquer approach?',
    ],
    edgeCases: ['All negative', 'Single element', 'All positive', 'Mixed signs'],
    commonMistakes: ['Resetting at wrong time', 'Not handling all negatives', 'Wrong initialization'],
    optimalTime: 'O(n)' as const,
    optimalSpace: 'O(1)' as const,
    interviewTime: '15-20 minutes',
  },
};

// ============================================
// COMPLEXITY COLORS (convenience export)
// ============================================

export const COMPLEXITY_COLORS: Record<string, string> = {
  'O(1)': '#22c55e',
  'O(log n)': '#84cc16',
  'O(n)': '#eab308',
  'O(n log n)': '#f97316',
  'O(n²)': '#ef4444',
  'O(n³)': '#dc2626',
  'O(2^n)': '#991b1b',
  'O(n!)': '#7f1d1d',
};

// ============================================
// PYTHON SYNTAX (convenience export)
// ============================================

export const PYTHON_SYNTAX = {
  keywords: [
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return',
    'import', 'from', 'as', 'try', 'except', 'finally', 'raise',
    'with', 'assert', 'yield', 'lambda', 'pass', 'break', 'continue',
    'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
    'global', 'nonlocal', 'del', 'async', 'await',
  ],
  builtins: [
    'len', 'range', 'print', 'int', 'str', 'float', 'list', 'dict',
    'set', 'tuple', 'bool', 'type', 'isinstance', 'issubclass',
    'abs', 'min', 'max', 'sum', 'sorted', 'reversed', 'enumerate',
    'zip', 'map', 'filter', 'reduce', 'any', 'all', 'open', 'input',
    'ord', 'chr', 'hex', 'bin', 'oct', 'round', 'pow', 'divmod',
    'hash', 'id', 'repr', 'format', 'slice', 'super', 'object',
  ],
  colors: {
    keyword: '#ff79c6',
    builtin: '#8be9fd',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    class: '#ffb86c',
    operator: '#ff79c6',
    punctuation: '#f8f8f2',
    default: '#f8f8f2',
    decorator: '#ff79c6',
  },
};

// ============================================
// CODE THEME COLORS (convenience export)
// ============================================

export const CODE_COLORS = {
  background: '#282a36',
  text: '#f8f8f2',
  lineNumber: '#6272a4',
  currentLine: '#44475a',
  highlight: '#bd93f9',
};
