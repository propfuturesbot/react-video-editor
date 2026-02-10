import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { DSA_SPRINGS, DSA_TIMING } from '../constants';

interface AnimationOptions {
  startFrame?: number;
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  springConfig?: keyof typeof DSA_SPRINGS;
}

interface SwapAnimationResult {
  element1: { x: number; y: number; scale: number };
  element2: { x: number; y: number; scale: number };
  progress: number;
}

interface PointerAnimationResult {
  x: number;
  opacity: number;
  scale: number;
  bounce: number;
}

/**
 * Core DSA animation hook providing common animation utilities
 */
export function useDSAAnimation() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /**
   * Get spring value for smooth animations
   */
  const getSpring = (
    targetFrame: number,
    config: keyof typeof DSA_SPRINGS = 'smooth'
  ): number => {
    const springConfig = DSA_SPRINGS[config];
    return spring({
      frame: frame - targetFrame,
      fps,
      config: springConfig,
    });
  };

  /**
   * Get interpolated value with easing
   */
  const getInterpolated = (
    inputRange: [number, number],
    outputRange: [number, number],
    options: AnimationOptions = {}
  ): number => {
    const { easing = 'ease-out' } = options;

    const easingFn = {
      'linear': undefined,
      'ease-in': Easing.in(Easing.cubic),
      'ease-out': Easing.out(Easing.cubic),
      'ease-in-out': Easing.inOut(Easing.cubic),
      'spring': Easing.out(Easing.back(1.5)),
    }[easing];

    return interpolate(frame, inputRange, outputRange, {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easingFn,
    });
  };

  /**
   * Get staggered animation progress for an item
   */
  const getStaggeredProgress = (
    itemIndex: number,
    totalItems: number,
    startFrame: number,
    options: {
      pattern?: 'linear' | 'center-out' | 'edges-in' | 'random';
      staggerDelay?: number;
      duration?: number;
    } = {}
  ): number => {
    const {
      pattern = 'linear',
      staggerDelay = DSA_TIMING.stagger.normal,
      duration = DSA_TIMING.normal,
    } = options;

    let adjustedIndex: number;

    switch (pattern) {
      case 'center-out': {
        const center = (totalItems - 1) / 2;
        adjustedIndex = Math.abs(itemIndex - center);
        break;
      }
      case 'edges-in': {
        const center = (totalItems - 1) / 2;
        adjustedIndex = center - Math.abs(itemIndex - center);
        break;
      }
      case 'random': {
        // Seeded random for consistency
        adjustedIndex = ((itemIndex * 7 + 3) % totalItems);
        break;
      }
      default:
        adjustedIndex = itemIndex;
    }

    const itemStartFrame = startFrame + adjustedIndex * staggerDelay;
    const itemEndFrame = itemStartFrame + duration;

    return interpolate(frame, [itemStartFrame, itemEndFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  };

  /**
   * Swap animation for two elements
   */
  const getSwapAnimation = (
    index1: number,
    index2: number,
    cellWidth: number,
    startFrame: number,
    duration: number = DSA_TIMING.medium
  ): SwapAnimationResult => {
    const distance = (index2 - index1) * cellWidth;
    const midFrame = startFrame + duration / 2;
    const endFrame = startFrame + duration;

    // Progress through the swap
    const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    // Arc motion - elements go up and over each other
    const arcHeight = Math.min(60, Math.abs(distance) * 0.3);

    // Element 1 moves right
    const x1 = interpolate(frame, [startFrame, endFrame], [0, distance], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });

    // Element 2 moves left
    const x2 = interpolate(frame, [startFrame, endFrame], [0, -distance], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });

    // Arc motion (parabola)
    const y1 = -arcHeight * Math.sin(progress * Math.PI);
    const y2 = arcHeight * Math.sin(progress * Math.PI);

    // Scale pulse at midpoint
    const scalePulse = interpolate(
      frame,
      [startFrame, midFrame, endFrame],
      [1, 1.1, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      element1: { x: x1, y: y1, scale: scalePulse },
      element2: { x: x2, y: y2, scale: scalePulse },
      progress,
    };
  };

  /**
   * Pointer movement animation
   */
  const getPointerAnimation = (
    fromIndex: number,
    toIndex: number,
    cellWidth: number,
    startFrame: number,
    duration: number = DSA_TIMING.normal
  ): PointerAnimationResult => {
    const endFrame = startFrame + duration;

    const x = interpolate(
      frame,
      [startFrame, endFrame],
      [fromIndex * cellWidth, toIndex * cellWidth],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      }
    );

    // Bounce effect at the end
    const bounce = spring({
      frame: frame - endFrame,
      fps,
      config: { damping: 12, stiffness: 200, mass: 0.5 },
    });

    const opacity = interpolate(
      frame,
      [startFrame, startFrame + 5],
      [0.7, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const scale = interpolate(
      frame,
      [startFrame, startFrame + 8, endFrame],
      [0.8, 1.1, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return { x, opacity, scale, bounce: Math.max(0, bounce) };
  };

  /**
   * Pulse animation (for highlighting)
   */
  const getPulse = (
    startFrame: number,
    pulseCount: number = 2,
    pulseDuration: number = DSA_TIMING.normal
  ): number => {
    const totalDuration = pulseCount * pulseDuration;
    if (frame < startFrame || frame > startFrame + totalDuration) {
      return 1;
    }

    const localFrame = frame - startFrame;
    const pulseProgress = (localFrame % pulseDuration) / pulseDuration;
    return 1 + 0.15 * Math.sin(pulseProgress * Math.PI * 2);
  };

  /**
   * Fade animation
   */
  const getFade = (
    startFrame: number,
    direction: 'in' | 'out',
    duration: number = DSA_TIMING.quick
  ): number => {
    const endFrame = startFrame + duration;
    const [from, to] = direction === 'in' ? [0, 1] : [1, 0];

    return interpolate(frame, [startFrame, endFrame], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: direction === 'in' ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  };

  /**
   * Slide animation
   */
  const getSlide = (
    startFrame: number,
    direction: 'left' | 'right' | 'up' | 'down',
    distance: number = 50,
    duration: number = DSA_TIMING.normal
  ): { x: number; y: number; opacity: number } => {
    const endFrame = startFrame + duration;

    const progress = spring({
      frame: frame - startFrame,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    const directionMultiplier = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
    }[direction];

    const x = (1 - progress) * distance * directionMultiplier.x;
    const y = (1 - progress) * distance * directionMultiplier.y;
    const opacity = Math.min(1, progress * 2);

    return { x, y, opacity };
  };

  /**
   * Highlight flash effect
   */
  const getHighlightFlash = (
    startFrame: number,
    duration: number = DSA_TIMING.quick
  ): number => {
    const endFrame = startFrame + duration;

    if (frame < startFrame) return 0;
    if (frame > endFrame) return 0;

    return interpolate(
      frame,
      [startFrame, startFrame + duration / 2, endFrame],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  };

  /**
   * Compare animation (two elements)
   */
  const getCompareAnimation = (
    startFrame: number,
    duration: number = DSA_TIMING.normal
  ): { scale: number; glow: number } => {
    const midFrame = startFrame + duration / 2;
    const endFrame = startFrame + duration;

    const scale = interpolate(
      frame,
      [startFrame, midFrame, endFrame],
      [1, 1.15, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const glow = interpolate(
      frame,
      [startFrame, midFrame, endFrame],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return { scale, glow };
  };

  return {
    frame,
    fps,
    getSpring,
    getInterpolated,
    getStaggeredProgress,
    getSwapAnimation,
    getPointerAnimation,
    getPulse,
    getFade,
    getSlide,
    getHighlightFlash,
    getCompareAnimation,
  };
}

export default useDSAAnimation;
