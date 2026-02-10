// DSA Component Type Definitions

// ============================================
// ANIMATION STEP SYSTEM TYPES
// ============================================

/**
 * Base interface for all DSA animation steps.
 * Animation steps allow components to animate through a sequence of states.
 */
export interface BaseDSAAnimationStep {
  /** Optional annotation/description for this step */
  annotation?: string;
  /** Optional label shown during this step */
  stepLabel?: string;
}

/**
 * Animation step for array-based visualizations.
 * Used by ArrayVisualizer, and as a base for pointer-based components.
 */
export interface ArrayAnimationStep extends BaseDSAAnimationStep {
  /** Array values (can change between steps for insert/delete operations) */
  values?: (string | number)[];
  /** Indices to highlight */
  highlightIndices?: number[];
  /** Highlight types per index */
  highlightTypes?: { index: number; type: ArrayHighlight }[];
  /** Pointer positions */
  pointers?: ArrayPointer[];
  /** Window to display */
  window?: ArrayWindow;
  /** Two indices being compared */
  comparing?: [number, number];
  /** Two indices being swapped */
  swapping?: [number, number];
  /** Indices that are sorted */
  sorted?: number[];
  /** Pivot index */
  pivot?: number;
  /** Operation being performed */
  operation?: 'compare' | 'swap' | 'insert' | 'delete' | 'shift' | 'copy' | 'none';
  /** Index where insertion happens */
  insertIndex?: number;
  /** Value being inserted */
  insertValue?: string | number;
  /** Index being deleted */
  deleteIndex?: number;
}

/**
 * Animation step for two-pointer technique visualization.
 */
export interface TwoPointersAnimationStep extends BaseDSAAnimationStep {
  /** Left pointer position */
  left: number;
  /** Right pointer position */
  right: number;
  /** Current sum of elements at pointers */
  sum?: number;
  /** Comparison result */
  comparisonResult?: 'less' | 'greater' | 'equal';
  /** Direction of pointers */
  direction?: 'converging' | 'diverging' | 'same';
  /** Whether to show the window between pointers */
  showWindow?: boolean;
  /** Highlighted indices */
  highlightIndices?: number[];
}

/**
 * Animation step for sliding window visualization.
 */
export interface SlidingWindowAnimationStep extends BaseDSAAnimationStep {
  /** Window start position */
  windowStart: number;
  /** Window end position */
  windowEnd: number;
  /** Sum of elements in window */
  windowSum?: number;
  /** Max element in window */
  windowMax?: number;
  /** Min element in window */
  windowMin?: number;
  /** Element frequency in window */
  windowFrequency?: Record<string | number, number>;
  /** Whether current window is valid */
  isValid?: boolean;
  /** Operation being performed: expand, shrink, or slide */
  operation?: 'expand' | 'shrink' | 'slide' | 'none';
  /** Whether this is the optimal window */
  isOptimal?: boolean;
}

/**
 * Animation step for fast/slow pointer visualization.
 */
export interface FastSlowPointersAnimationStep extends BaseDSAAnimationStep {
  /** Slow pointer position */
  slow: number;
  /** Fast pointer position */
  fast: number;
  /** Whether a cycle has been detected */
  cycleDetected?: boolean;
  /** Meeting point index (if cycle detected) */
  meetingPoint?: number;
  /** Start of cycle */
  cycleStart?: number;
  /** Whether to show the path */
  showPath?: boolean;
}

/**
 * Animation step for linked list visualization.
 */
export interface LinkedListAnimationStep extends BaseDSAAnimationStep {
  /** Index of node being pointed to by current pointer */
  currentPointerIndex?: number;
  /** Indices of highlighted nodes */
  highlightedNodes?: number[];
  /** Highlight type for nodes */
  highlightTypes?: { index: number; type: 'current' | 'visited' | 'target' | 'found' | 'slow' | 'fast' }[];
  /** Operation being performed */
  operation?: 'traverse' | 'insert' | 'delete' | 'reverse' | 'find' | 'none';
  /** Target node index for operations */
  operationTarget?: number;
  /** New node being inserted */
  newNode?: { value: string | number; insertAt: number };
  /** Pointer labels to show */
  pointerLabels?: { index: number; label: string; color?: string }[];
  /** For reversal: show reversed connections up to this index */
  reversedUpTo?: number;
}

/**
 * Animation step for stack visualization.
 */
export interface StackAnimationStep extends BaseDSAAnimationStep {
  /** Current items in stack (bottom to top) */
  items: (string | number)[];
  /** Current operation */
  operation?: 'push' | 'pop' | 'peek' | 'none';
  /** Item being operated on (for push/pop animation) */
  operationItem?: string | number;
  /** Whether to highlight the top */
  highlightTop?: boolean;
  /** Highlighted indices */
  highlightIndices?: number[];
}

/**
 * Animation step for queue visualization.
 */
export interface QueueAnimationStep extends BaseDSAAnimationStep {
  /** Current items in queue (front to rear) */
  items: (string | number)[];
  /** Current operation */
  operation?: 'enqueue' | 'dequeue' | 'peek' | 'none';
  /** Item being operated on */
  operationItem?: string | number;
  /** Front pointer position */
  front?: number;
  /** Rear pointer position */
  rear?: number;
  /** Highlighted indices */
  highlightIndices?: number[];
}

/**
 * Animation step for binary search visualization.
 */
export interface BinarySearchAnimationStep extends BaseDSAAnimationStep {
  /** Left boundary */
  left: number;
  /** Right boundary */
  right: number;
  /** Middle index */
  mid?: number;
  /** Which half was eliminated */
  eliminated?: 'left' | 'right' | null;
  /** Index where target was found (-1 if not found yet) */
  found?: number;
  /** Comparison result */
  comparisonResult?: 'less' | 'greater' | 'equal';
  /** Current search space size */
  searchSpaceSize?: number;
}

/**
 * Animation step for linear search visualization.
 */
export interface LinearSearchAnimationStep extends BaseDSAAnimationStep {
  /** Current index being checked */
  currentIndex: number;
  /** Indices already visited */
  visitedIndices?: number[];
  /** Index where target was found (-1 if not found yet) */
  found?: number;
}

/**
 * Animation step for sorting visualizations.
 */
export interface SortingAnimationStep extends BaseDSAAnimationStep {
  /** Current array state */
  array: (string | number)[];
  /** Indices being compared */
  comparing?: [number, number];
  /** Indices being swapped */
  swapping?: [number, number];
  /** Indices that are in final sorted position */
  sorted?: number[];
  /** Current pivot index */
  pivot?: number;
  /** Current minimum index (for selection sort) */
  minIndex?: number;
  /** Insert position (for insertion sort) */
  insertPosition?: number;
  /** Merge ranges being processed */
  mergeRanges?: [number, number][];
  /** Partition boundaries */
  partitionBoundaries?: { low: number; high: number };
  /** Active code line number */
  codeLine?: number;
}

/**
 * Animation step for hash table visualization.
 */
export interface HashTableAnimationStep extends BaseDSAAnimationStep {
  /** Bucket being highlighted */
  highlightBucket?: number;
  /** Current operation */
  operation?: 'insert' | 'search' | 'lookup' | 'delete' | 'resize' | 'none';
  /** Key being operated on */
  key?: string | number;
  /** Computed hash value */
  computedHash?: number;
  /** Whether there's a collision */
  collision?: boolean;
  /** Probing sequence for collision resolution */
  probingSequence?: number[];
  /** Current probe step */
  currentProbeStep?: number;
  /** Items in the table (sparse array or entries) */
  tableState?: ({ key: string | number; value: any } | null)[];
}

/**
 * Animation step for dynamic programming table visualization.
 */
export interface DPTableAnimationStep extends BaseDSAAnimationStep {
  /** Current cell being computed [row, col] */
  currentCell?: [number, number];
  /** Cells that have been filled */
  filledCells?: [number, number][];
  /** Value being placed in current cell */
  cellValue?: number | string;
  /** Cells being referenced for current computation */
  referencedCells?: [number, number][];
  /** Arrows showing transitions/dependencies */
  transitions?: { from: [number, number]; to: [number, number]; label?: string; color?: string }[];
  /** Formula being applied */
  formula?: string;
  /** Current row labels */
  rowLabels?: (string | number)[];
  /** Current column labels */
  colLabels?: (string | number)[];
  /** Table values (2D array) */
  tableValues?: (number | string | null)[][];
  /** Optimal path for traceback visualization */
  optimalPath?: [number, number][];
}

/**
 * Animation step for tree visualization.
 */
export interface TreeAnimationStep extends BaseDSAAnimationStep {
  /** Node IDs being highlighted */
  highlightedNodes?: (string | number)[];
  /** Current path being traversed */
  currentPath?: (string | number)[];
  /** Operation being performed */
  operation?: 'insert' | 'delete' | 'search' | 'balance' | 'traverse' | 'rotate' | 'none';
  /** Traversal order (sequence of node IDs) */
  traversalOrder?: (string | number)[];
  /** New node being inserted */
  newNode?: { value: any; parentId?: string | number };
  /** Node being deleted */
  deletingNode?: string | number;
  /** Type of rotation for balanced trees */
  rotationType?: 'left' | 'right' | 'left-right' | 'right-left';
  /** Nodes involved in rotation */
  rotationNodes?: (string | number)[];
  /** Comparison being made */
  comparing?: { nodeId: string | number; value: any };
}

/**
 * Animation step for graph visualization.
 */
export interface GraphAnimationStep extends BaseDSAAnimationStep {
  /** Node IDs being highlighted */
  highlightedNodes?: string[];
  /** Edges being highlighted [from, to] */
  highlightedEdges?: [string, string][];
  /** Nodes that have been visited */
  visitedNodes?: string[];
  /** Edges that have been visited */
  visitedEdges?: [string, string][];
  /** Current queue (for BFS) */
  queue?: string[];
  /** Current stack (for DFS) */
  stack?: string[];
  /** Distance values (for Dijkstra/BFS) */
  distances?: Record<string, number>;
  /** Parent pointers for path reconstruction */
  parents?: Record<string, string>;
  /** Current node being processed */
  currentNode?: string;
  /** Neighbors being explored */
  exploringNeighbors?: string[];
}

/**
 * Common props interface for animation steps support.
 * All DSA components should extend their props with this.
 */
export interface DSAStepsProps<TStep> {
  /** Array of animation steps to animate through */
  animationSteps?: TStep[];
  /** Number of frames per step (default: 45) */
  stepDurationFrames?: number;
  /** Frame at which animation starts (default: 0) */
  animationStartFrame?: number;
  /** How to transition between steps */
  interpolationMode?: 'smooth' | 'discrete';
}

// ============================================
// ARRAY TYPES
// ============================================

export interface ArrayCell {
  value: string | number;
  index: number;
  highlight?: ArrayHighlight;
  color?: string;
  label?: string;
  metadata?: Record<string, any>;
}

export type ArrayHighlight =
  | 'none'
  | 'current'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'pivot'
  | 'minimum'
  | 'maximum'
  | 'found'
  | 'visited'
  | 'target'
  | 'window'
  | 'left'
  | 'right'
  | 'mid';

export interface ArrayPointer {
  index: number;
  label: string;
  color: string;
  position?: 'top' | 'bottom';
  style?: 'arrow' | 'bracket' | 'underline';
}

export interface ArrayWindow {
  start: number;
  end: number;
  color?: string;
  label?: string;
  showSum?: boolean;
  sum?: number;
}

export type ArrayAnimation =
  | 'none'
  | 'enter'
  | 'exit'
  | 'swap'
  | 'shift_left'
  | 'shift_right'
  | 'highlight'
  | 'compare'
  | 'insert'
  | 'delete'
  | 'bounce'
  | 'pulse'
  | 'fade';

export interface ArrayOperation {
  type: 'swap' | 'compare' | 'insert' | 'delete' | 'highlight' | 'shift';
  indices: number[];
  value?: any;
  delay?: number;
}

// ============================================
// POINTER TYPES
// ============================================

export interface TwoPointerState {
  left: number;
  right: number;
  direction: 'converging' | 'diverging' | 'same';
}

export interface SlidingWindowState {
  start: number;
  end: number;
  windowSize: number;
  isValid: boolean;
  sum?: number;
  max?: number;
  min?: number;
  frequency?: Record<string | number, number>;
}

export interface FastSlowState {
  slow: number;
  fast: number;
  cycleDetected: boolean;
  meetingPoint?: number;
}

export type PointerAnimation =
  | 'move_left'
  | 'move_right'
  | 'expand'
  | 'shrink'
  | 'jump'
  | 'bounce'
  | 'pulse';

// ============================================
// SORTING TYPES
// ============================================

export type SortingAlgorithm =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'merge'
  | 'quick'
  | 'heap'
  | 'counting'
  | 'radix'
  | 'bucket';

export interface SortingStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
  pivot?: number;
  minIndex?: number;
  insertPosition?: number;
  mergeRanges?: [number, number][];
  description: string;
  codeLine?: number;
}

export interface SortingStats {
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}

// ============================================
// SEARCHING TYPES
// ============================================

export type SearchingAlgorithm =
  | 'linear'
  | 'binary'
  | 'ternary'
  | 'exponential'
  | 'jump'
  | 'interpolation';

export interface SearchStep {
  array: number[];
  left?: number;
  right?: number;
  mid?: number;
  target: number;
  eliminated?: [number, number];
  found?: number;
  description: string;
  codeLine?: number;
}

// ============================================
// COMPLEXITY TYPES
// ============================================

export type Complexity =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)';

export interface ComplexityInfo {
  time: {
    best: Complexity;
    average: Complexity;
    worst: Complexity;
  };
  space: Complexity;
  stable?: boolean;
  inPlace?: boolean;
}

export interface ComplexityCurve {
  name: string;
  complexity: Complexity;
  color: string;
  highlighted?: boolean;
}

// ============================================
// CODE DISPLAY TYPES
// ============================================

export interface CodeLine {
  lineNumber: number;
  code: string;
  indent: number;
  highlighted?: boolean;
  annotation?: string;
}

export interface CodeAnnotation {
  line: number;
  text: string;
  position: 'left' | 'right' | 'above' | 'below';
  style: 'comment' | 'callout' | 'arrow';
  color?: string;
}

export interface VariableState {
  name: string;
  value: any;
  type: string;
  changed?: boolean;
}

// ============================================
// ANIMATION TYPES
// ============================================

export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  spring?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export interface StaggerConfig {
  delayPerItem: number;
  pattern: 'linear' | 'center-out' | 'edges-in' | 'random';
}

// ============================================
// TEACHING TYPES
// ============================================

export interface InterviewQuestion {
  main: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  followUps: string[];
  edgeCases: string[];
  commonMistakes: string[];
  optimalTime: Complexity;
  optimalSpace: Complexity;
  interviewTime: string;
}

export interface RealWorldApplication {
  name: string;
  industry: string;
  icon: string;
  description: string;
}

// ============================================
// SCENE TYPES
// ============================================

export type DSASceneType =
  | 'hook'
  | 'analogy'
  | 'abstraction'
  | 'naive_approach'
  | 'optimal_approach'
  | 'dry_run'
  | 'complexity_analysis'
  | 'real_life_applications'
  | 'interview_questions'
  | 'code_walkthrough'
  | 'pattern_recognition'
  | 'comparison';
