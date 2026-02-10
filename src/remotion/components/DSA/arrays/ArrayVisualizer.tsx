import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from './ArrayCell';
import { ArrayPointer, ArrayWindow, ArrayHighlight, ArrayOperation, ArrayAnimationStep, DSAStepsProps } from '../types';
import { DSA_COLORS, DSA_DIMENSIONS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { useDSAAnimation, useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface ArrayVisualizerProps extends DSAStepsProps<ArrayAnimationStep> {
  // Data
  values: (string | number)[];

  // Visual options
  showIndices?: boolean;
  cellSize?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  gap?: number;

  // Highlighting
  highlightIndices?: { index: number; type: ArrayHighlight }[];
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
  pivot?: number;

  // Pointers
  pointers?: ArrayPointer[];

  // Window highlight
  window?: ArrayWindow;

  // Animation
  animationType?: 'staggered' | 'simultaneous' | 'none';
  animationStartFrame?: number;
  staggerDelay?: number;

  // Operations (for animated operations)
  operations?: ArrayOperation[];
  operationFrame?: number;

  // Labels
  title?: string;
  subtitle?: string;

  // Style
  style?: React.CSSProperties;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  values: staticValues,
  showIndices = true,
  cellSize = 'medium',
  layout = 'horizontal',
  gap,
  highlightIndices: staticHighlightIndices = [],
  comparing: staticComparing,
  swapping: staticSwapping,
  sorted: staticSorted = [],
  pivot: staticPivot,
  pointers: staticPointers = [],
  window: staticWindowHighlight,
  animationType = 'staggered',
  animationStartFrame = 0,
  staggerDelay = DSA_TIMING.stagger.normal,
  operations = [],
  operationFrame = 0,
  title,
  subtitle,
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'discrete',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { getSwapAnimation } = useDSAAnimation();

  // Use step animation hook for animated states
  const staticState: ArrayAnimationStep = useMemo(() => ({
    values: staticValues,
    highlightTypes: staticHighlightIndices,
    comparing: staticComparing,
    swapping: staticSwapping,
    sorted: staticSorted,
    pivot: staticPivot,
    pointers: staticPointers,
    window: staticWindowHighlight,
  }), [staticValues, staticHighlightIndices, staticComparing, staticSwapping, staticSorted, staticPivot, staticPointers, staticWindowHighlight]);

  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive actual values from animation state
  const values = currentState.values ?? staticValues;
  const highlightIndices = currentState.highlightTypes ?? staticHighlightIndices;
  const comparing = currentState.comparing ?? staticComparing;
  const swapping = currentState.swapping ?? staticSwapping;
  const sorted = currentState.sorted ?? staticSorted;
  const pivot = currentState.pivot ?? staticPivot;
  const windowHighlight = currentState.window ?? staticWindowHighlight;

  // For pointers, interpolate positions if in smooth mode
  const pointers = useMemo(() => {
    if (!animationSteps || animationSteps.length === 0) {
      return staticPointers;
    }

    const currentPointers = currentState.pointers ?? staticPointers;
    const nextPointers = nextState.pointers ?? staticPointers;

    if (interpolationMode === 'discrete' || !nextPointers.length) {
      return currentPointers;
    }

    // Interpolate pointer positions
    return currentPointers.map((pointer, idx) => {
      const nextPointer = nextPointers.find(p => p.label === pointer.label) ?? nextPointers[idx];
      if (!nextPointer) return pointer;

      return {
        ...pointer,
        index: interpolateNumeric(pointer.index, nextPointer.index, stepProgress),
      };
    });
  }, [currentState.pointers, nextState.pointers, staticPointers, animationSteps, interpolationMode, stepProgress]);

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, gap: gap ?? 6 },
    medium: { width: 60, height: 60, gap: gap ?? 8 },
    large: { width: 80, height: 80, gap: gap ?? 10 },
  }[cellSize];

  const cellWidth = sizeConfig.width + sizeConfig.gap;

  // Calculate swap animations
  const swapAnim = useMemo(() => {
    if (!swapping) return null;
    return getSwapAnimation(
      swapping[0],
      swapping[1],
      cellWidth,
      operationFrame,
      DSA_TIMING.medium
    );
  }, [swapping, cellWidth, operationFrame, getSwapAnimation]);

  // Get highlight type for a specific index
  const getHighlightType = (index: number): ArrayHighlight => {
    // Check explicit highlights first
    const explicit = highlightIndices.find(h => h.index === index);
    if (explicit) return explicit.type;

    // Check comparing
    if (comparing && (comparing[0] === index || comparing[1] === index)) {
      return 'comparing';
    }

    // Check swapping
    if (swapping && (swapping[0] === index || swapping[1] === index)) {
      return 'swapping';
    }

    // Check pivot
    if (pivot === index) {
      return 'pivot';
    }

    // Check sorted
    if (sorted.includes(index)) {
      return 'sorted';
    }

    return 'none';
  };

  // Get swap transform for a specific index
  const getSwapTransform = (index: number) => {
    if (!swapping || !swapAnim) return undefined;

    if (index === swapping[0]) {
      return swapAnim.element1;
    }
    if (index === swapping[1]) {
      return swapAnim.element2;
    }
    return undefined;
  };

  // Calculate compare glow
  const getCompareGlow = (index: number): number => {
    if (!comparing) return 0;
    if (comparing[0] !== index && comparing[1] !== index) return 0;

    const progress = interpolate(
      frame - operationFrame,
      [0, DSA_TIMING.normal / 2, DSA_TIMING.normal],
      [0, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return progress;
  };

  // Animation delay for each cell
  const getAnimationDelay = (index: number): number => {
    if (animationType === 'none') return 0;
    if (animationType === 'simultaneous') return animationStartFrame;
    return animationStartFrame + index * staggerDelay;
  };

  // Total array width
  const totalWidth = values.length * cellWidth - sizeConfig.gap;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 16,
            color: DSA_COLORS.ui.textMuted,
            marginBottom: 16,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Step Annotation */}
      {annotationText && (
        <div
          style={{
            fontSize: 18,
            color: DSA_COLORS.ui.text,
            marginBottom: 16,
            padding: '8px 16px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            opacity: annotationOpacity,
            transition: 'opacity 0.1s ease-out',
          }}
        >
          {annotationText}
        </div>
      )}

      {/* Array container with pointers */}
      <div style={{ position: 'relative' }}>
        {/* Window highlight */}
        {windowHighlight && (
          <WindowHighlight
            window={windowHighlight}
            cellWidth={cellWidth}
            cellHeight={sizeConfig.height}
            frame={frame}
            startFrame={animationStartFrame}
          />
        )}

        {/* Cells */}
        <div
          style={{
            display: 'flex',
            flexDirection: layout === 'horizontal' ? 'row' : 'column',
            gap: sizeConfig.gap,
          }}
        >
          {values.map((value, index) => (
            <ArrayCell
              key={index}
              value={value}
              index={index}
              highlight={getHighlightType(index)}
              showIndex={showIndices}
              size={cellSize}
              animationDelay={getAnimationDelay(index)}
              animation={animationType === 'none' ? 'none' : 'enter'}
              compareGlow={getCompareGlow(index)}
              swapTransform={getSwapTransform(index)}
            />
          ))}
        </div>

        {/* Pointers */}
        {pointers.map((pointer, idx) => (
          <ArrayPointerArrow
            key={`pointer-${idx}`}
            pointer={pointer}
            cellWidth={cellWidth}
            cellHeight={sizeConfig.height}
            frame={frame}
            startFrame={animationStartFrame}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

interface WindowHighlightProps {
  window: ArrayWindow;
  cellWidth: number;
  cellHeight: number;
  frame: number;
  startFrame: number;
}

const WindowHighlight: React.FC<WindowHighlightProps> = ({
  window: w,
  cellWidth,
  cellHeight,
  frame,
  startFrame,
}) => {
  const progress = spring({
    frame: frame - startFrame,
    fps: 30,
    config: DSA_SPRINGS.smooth,
  });

  const left = w.start * cellWidth;
  const width = (w.end - w.start + 1) * cellWidth - 8;

  return (
    <div
      style={{
        position: 'absolute',
        left: left - 4,
        top: -8,
        width: width + 8,
        height: cellHeight + 40,
        background: w.color || DSA_COLORS.cell.window,
        borderRadius: 12,
        opacity: progress * 0.4,
        border: `2px solid ${w.color || DSA_COLORS.pointer.left}`,
        pointerEvents: 'none',
      }}
    >
      {/* Window label */}
      {w.label && (
        <div
          style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 14,
            fontWeight: 600,
            color: w.color || DSA_COLORS.pointer.left,
            whiteSpace: 'nowrap',
          }}
        >
          {w.label}
        </div>
      )}

      {/* Window sum */}
      {w.showSum && w.sum !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: -24,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 14,
            fontWeight: 600,
            color: DSA_COLORS.ui.text,
            background: DSA_COLORS.ui.card,
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          sum = {w.sum}
        </div>
      )}
    </div>
  );
};

interface ArrayPointerArrowProps {
  pointer: ArrayPointer;
  cellWidth: number;
  cellHeight: number;
  frame: number;
  startFrame: number;
}

const ArrayPointerArrow: React.FC<ArrayPointerArrowProps> = ({
  pointer,
  cellWidth,
  cellHeight,
  frame,
  startFrame,
}) => {
  const progress = spring({
    frame: frame - startFrame - pointer.index * 2,
    fps: 30,
    config: DSA_SPRINGS.bouncy,
  });

  const isTop = pointer.position !== 'bottom';
  const left = pointer.index * cellWidth + cellWidth / 2 - 4;
  const top = isTop ? -35 : cellHeight + 25;

  // Bounce animation
  const bounce = Math.sin(frame * 0.15) * 3 * progress;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: top + (isTop ? -bounce : bounce),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: progress,
        transform: `scale(${progress})`,
      }}
    >
      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          ...(isTop
            ? { borderTop: `12px solid ${pointer.color}` }
            : { borderBottom: `12px solid ${pointer.color}` }),
          order: isTop ? 1 : 0,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: pointer.color,
          fontFamily: 'JetBrains Mono, monospace',
          marginTop: isTop ? 0 : 4,
          marginBottom: isTop ? 4 : 0,
          order: isTop ? 0 : 1,
        }}
      >
        {pointer.label}
      </div>
    </div>
  );
};

export default ArrayVisualizer;
