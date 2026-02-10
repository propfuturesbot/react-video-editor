import { interpolate, spring, Easing } from 'remotion';

// ============================================
// FRAME & TIME UTILITIES
// ============================================

/**
 * Convert seconds to frames
 */
export function secondsToFrames(seconds: number, fps: number = 30): number {
  return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds
 */
export function framesToSeconds(frames: number, fps: number = 30): number {
  return frames / fps;
}

/**
 * Check if current frame is within a range
 */
export function isInRange(frame: number, start: number, end: number): boolean {
  return frame >= start && frame < end;
}

/**
 * Get local frame within a range (0-based)
 */
export function getLocalFrame(frame: number, start: number): number {
  return Math.max(0, frame - start);
}

/**
 * Get progress through a range (0 to 1)
 */
export function getProgress(frame: number, start: number, end: number): number {
  if (frame < start) return 0;
  if (frame >= end) return 1;
  return (frame - start) / (end - start);
}

// ============================================
// ANIMATION HELPERS
// ============================================

interface FadeOptions {
  frame: number;
  start: number;
  duration?: number;
  initialValue?: number;
  finalValue?: number;
}

/**
 * Fade in animation
 */
export function fadeIn({
  frame,
  start,
  duration = 20,
  initialValue = 0,
  finalValue = 1,
}: FadeOptions): number {
  return interpolate(
    frame,
    [start, start + duration],
    [initialValue, finalValue],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

/**
 * Fade out animation
 */
export function fadeOut({
  frame,
  start,
  duration = 10,
  initialValue = 1,
  finalValue = 0,
}: FadeOptions): number {
  return interpolate(
    frame,
    [start, start + duration],
    [initialValue, finalValue],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
}

interface SlideOptions {
  frame: number;
  start: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Slide in animation
 */
export function slideIn({
  frame,
  start,
  duration = 25,
  distance = 100,
  direction = 'up',
}: SlideOptions): { x: number; y: number } {
  const progress = interpolate(
    frame,
    [start, start + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const directionMap = {
    up: { x: 0, y: distance * (1 - progress) },
    down: { x: 0, y: -distance * (1 - progress) },
    left: { x: distance * (1 - progress), y: 0 },
    right: { x: -distance * (1 - progress), y: 0 },
  };

  return directionMap[direction];
}

interface ScaleOptions {
  frame: number;
  start: number;
  duration?: number;
  initialScale?: number;
  finalScale?: number;
}

/**
 * Scale animation
 */
export function scaleIn({
  frame,
  start,
  duration = 20,
  initialScale = 0.5,
  finalScale = 1,
}: ScaleOptions): number {
  return interpolate(
    frame,
    [start, start + duration],
    [initialScale, finalScale],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.5)),
    }
  );
}

interface SpringOptions {
  frame: number;
  fps: number;
  start: number;
  config?: {
    damping?: number;
    mass?: number;
    stiffness?: number;
  };
}

/**
 * Spring animation
 */
export function springIn({
  frame,
  fps,
  start,
  config = { damping: 12, mass: 0.5, stiffness: 100 },
}: SpringOptions): number {
  if (frame < start) return 0;

  return spring({
    frame: frame - start,
    fps,
    config,
  });
}

// ============================================
// COMBINED ANIMATIONS
// ============================================

interface AnimateInOptions {
  frame: number;
  fps: number;
  start: number;
  type?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'spring';
  duration?: number;
}

/**
 * Combined animate in with multiple effects
 */
export function animateIn({
  frame,
  fps,
  start,
  type = 'fade',
  duration = 20,
}: AnimateInOptions): {
  opacity: number;
  transform: string;
} {
  const opacity = fadeIn({ frame, start, duration });

  // Debug: log animation values (only for first few frames to avoid spam)
  if (frame < 5 || (frame >= start && frame <= start + duration + 5)) {
    console.log(`animateIn: frame=${frame}, start=${start}, duration=${duration}, type=${type}, opacity=${opacity.toFixed(2)}`);
  }

  switch (type) {
    case 'slide-up': {
      const { y } = slideIn({ frame, start, duration, direction: 'up' });
      return { opacity, transform: `translateY(${y}px)` };
    }
    case 'slide-left': {
      const { x } = slideIn({ frame, start, duration, direction: 'left' });
      return { opacity, transform: `translateX(${x}px)` };
    }
    case 'slide-right': {
      const { x } = slideIn({ frame, start, duration, direction: 'right' });
      return { opacity, transform: `translateX(${x}px)` };
    }
    case 'scale': {
      const scale = scaleIn({ frame, start, duration });
      return { opacity, transform: `scale(${scale})` };
    }
    case 'spring': {
      const progress = springIn({ frame, fps, start });
      const scale = interpolate(progress, [0, 1], [0.3, 1]);
      return { opacity: progress, transform: `scale(${scale})` };
    }
    default:
      return { opacity, transform: 'none' };
  }
}

// ============================================
// STAGGER ANIMATIONS
// ============================================

/**
 * Calculate staggered delay for a list of items
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  staggerAmount: number = 8
): number {
  return baseDelay + index * staggerAmount;
}

/**
 * Animate a list of items with stagger
 */
export function staggeredAnimation(
  frame: number,
  fps: number,
  itemCount: number,
  baseStart: number,
  staggerAmount: number = 8,
  animationType: 'fade' | 'slide-up' | 'scale' | 'spring' = 'slide-up'
): Array<{ opacity: number; transform: string }> {
  return Array.from({ length: itemCount }, (_, index) => {
    const start = baseStart + index * staggerAmount;
    return animateIn({ frame, fps, start, type: animationType });
  });
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

/**
 * Typewriter animation for text
 */
export function typewriter(
  text: string,
  frame: number,
  start: number,
  charsPerFrame: number = 0.5
): string {
  const localFrame = getLocalFrame(frame, start);
  const charCount = Math.floor(localFrame * charsPerFrame);
  return text.slice(0, Math.min(charCount, text.length));
}

/**
 * Typewriter with cursor
 */
export function typewriterWithCursor(
  text: string,
  frame: number,
  start: number,
  fps: number,
  charsPerFrame: number = 0.5
): { text: string; showCursor: boolean } {
  const displayText = typewriter(text, frame, start, charsPerFrame);
  const isComplete = displayText.length >= text.length;
  const showCursor = !isComplete || Math.floor(frame / (fps / 2)) % 2 === 0;

  return { text: displayText, showCursor };
}

// ============================================
// PATH ANIMATION (for SVG)
// ============================================

/**
 * Get stroke-dashoffset for path animation
 */
export function pathDraw(
  pathLength: number,
  frame: number,
  start: number,
  duration: number
): { strokeDasharray: number; strokeDashoffset: number } {
  const progress = getProgress(frame, start, start + duration);
  const easedProgress = Easing.out(Easing.cubic)(progress);

  return {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - easedProgress),
  };
}
