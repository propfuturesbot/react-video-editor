import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

/**
 * Result returned by useDSAStepAnimation hook
 */
export interface StepAnimationResult<TState> {
  /** Current step's state */
  currentState: TState;
  /** Next step's state (for interpolation) */
  nextState: TState;
  /** Current step index (0-based) */
  stepIndex: number;
  /** Progress within current step (0-1) */
  stepProgress: number;
  /** Whether animation is complete */
  isComplete: boolean;
  /** Whether animation has started */
  hasStarted: boolean;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Configuration for step animation
 */
export interface StepAnimationConfig {
  /** Number of frames per step (default: 45) */
  stepDurationFrames?: number;
  /** Frame at which animation starts (default: 0) */
  animationStartFrame?: number;
  /** How to calculate step progress easing (default: 'ease-out') */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Easing function for smooth progress calculation
 */
const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

const easeInCubic = (x: number): number => {
  return x * x * x;
};

const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/**
 * Core hook for animating through DSA visualization steps.
 *
 * This hook enables any DSA component to animate through a sequence of states
 * by providing step snapshots and calculating which step to show based on the
 * current frame.
 *
 * @param steps - Array of state snapshots to animate through
 * @param staticState - Fallback state when no steps are provided
 * @param config - Animation configuration
 * @returns StepAnimationResult with current state and progress information
 *
 * @example
 * ```tsx
 * const { currentState, stepProgress, stepIndex } = useDSAStepAnimation(
 *   animationSteps,
 *   { left: 0, right: arr.length - 1 }, // fallback state
 *   { stepDurationFrames: 45, animationStartFrame: 10 }
 * );
 *
 * // Use currentState to render, stepProgress for interpolation
 * const interpolatedLeft = interpolateNumeric(
 *   currentState.left,
 *   nextState.left,
 *   stepProgress
 * );
 * ```
 */
export function useDSAStepAnimation<TState>(
  steps: TState[] | undefined,
  staticState: TState,
  config: StepAnimationConfig = {}
): StepAnimationResult<TState> {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    stepDurationFrames = 45,
    animationStartFrame = 0,
    easing = 'ease-out',
  } = config;

  // If no steps provided, return static state
  if (!steps || steps.length === 0) {
    return {
      currentState: staticState,
      nextState: staticState,
      stepIndex: 0,
      stepProgress: 1,
      isComplete: true,
      hasStarted: true,
      totalSteps: 0,
    };
  }

  // Calculate adjusted frame relative to animation start
  const adjustedFrame = Math.max(0, frame - animationStartFrame);

  // Check if animation hasn't started yet
  if (frame < animationStartFrame) {
    return {
      currentState: steps[0],
      nextState: steps[0],
      stepIndex: 0,
      stepProgress: 0,
      isComplete: false,
      hasStarted: false,
      totalSteps: steps.length,
    };
  }

  // Calculate which step we're on
  const rawStepIndex = adjustedFrame / stepDurationFrames;
  const stepIndex = Math.min(Math.floor(rawStepIndex), steps.length - 1);

  // Calculate progress within current step (0-1)
  let rawProgress = rawStepIndex - stepIndex;

  // Clamp progress for final step
  if (stepIndex >= steps.length - 1) {
    rawProgress = 1;
  }

  // Apply easing to progress
  let stepProgress: number;
  switch (easing) {
    case 'linear':
      stepProgress = rawProgress;
      break;
    case 'ease-in':
      stepProgress = easeInCubic(rawProgress);
      break;
    case 'ease-in-out':
      stepProgress = easeInOutCubic(rawProgress);
      break;
    case 'ease-out':
    default:
      stepProgress = easeOutCubic(rawProgress);
  }

  // Get current and next states
  const currentState = steps[stepIndex];
  const nextState = steps[Math.min(stepIndex + 1, steps.length - 1)];
  const isComplete = stepIndex >= steps.length - 1 && rawProgress >= 1;

  return {
    currentState,
    nextState,
    stepIndex,
    stepProgress,
    isComplete,
    hasStarted: true,
    totalSteps: steps.length,
  };
}

/**
 * Interpolate a numeric value between current and next step
 * Use this for smooth pointer movements, positions, etc.
 */
export function interpolateNumeric(
  current: number,
  next: number,
  progress: number
): number {
  return current + (next - current) * progress;
}

/**
 * Interpolate numeric value with optional snapping
 * When progress > threshold, snap to next value
 */
export function interpolateNumericWithSnap(
  current: number,
  next: number,
  progress: number,
  snapThreshold: number = 0.9
): number {
  if (progress >= snapThreshold) {
    return next;
  }
  const adjustedProgress = progress / snapThreshold;
  return current + (next - current) * adjustedProgress;
}

/**
 * Determine which value to use based on discrete stepping
 * Use this for properties that shouldn't interpolate (like highlight types)
 */
export function discreteStep<T>(
  current: T,
  next: T,
  progress: number,
  threshold: number = 0.5
): T {
  return progress >= threshold ? next : current;
}

/**
 * Merge arrays with animation effect
 * Items from next that aren't in current will fade in
 */
export function mergeArraysWithProgress<T>(
  current: T[],
  next: T[],
  progress: number
): T[] {
  if (progress >= 1) return next;
  if (progress <= 0) return current;

  // For arrays, we typically want discrete transitions
  // unless specifically handling element-level animations
  return progress >= 0.5 ? next : current;
}

/**
 * Calculate spring-based interpolation for more natural movement
 */
export function springInterpolation(
  current: number,
  next: number,
  progress: number,
  overshoot: number = 0.1
): number {
  // Add slight overshoot for spring effect
  const overshotValue = next + (next - current) * overshoot;

  if (progress < 0.7) {
    // Move towards overshoot target
    const adjustedProgress = progress / 0.7;
    return current + (overshotValue - current) * easeOutCubic(adjustedProgress);
  } else {
    // Settle back to target
    const settleProgress = (progress - 0.7) / 0.3;
    return overshotValue + (next - overshotValue) * easeInOutCubic(settleProgress);
  }
}

/**
 * Helper to get interpolated position for array pointers
 */
export function getInterpolatedPointerPosition(
  currentIndex: number,
  nextIndex: number,
  progress: number,
  cellWidth: number,
  cellGap: number = 8
): number {
  const currentPos = currentIndex * (cellWidth + cellGap);
  const nextPos = nextIndex * (cellWidth + cellGap);
  return interpolateNumeric(currentPos, nextPos, progress);
}

/**
 * Hook to get the current step annotation
 * Returns the annotation text and its opacity based on progress
 */
export function useStepAnnotation<TState extends { annotation?: string }>(
  result: StepAnimationResult<TState>
): { text: string | undefined; opacity: number } {
  const { currentState, nextState, stepProgress } = result;

  // Fade out current annotation near end of step, fade in next
  let opacity = 1;
  let text = currentState.annotation;

  if (stepProgress > 0.8 && nextState.annotation !== currentState.annotation) {
    // Fade to next annotation
    opacity = 1 - (stepProgress - 0.8) / 0.2;
    if (stepProgress > 0.9) {
      text = nextState.annotation;
      opacity = (stepProgress - 0.9) / 0.1;
    }
  }

  return { text, opacity };
}

export default useDSAStepAnimation;
