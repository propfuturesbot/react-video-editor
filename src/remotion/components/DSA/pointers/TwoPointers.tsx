import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from '../arrays/ArrayCell';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { TwoPointersAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface TwoPointersProps extends DSAStepsProps<TwoPointersAnimationStep> {
  values: (string | number)[];
  left: number;
  right: number;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  direction?: 'converging' | 'diverging' | 'same';
  showWindow?: boolean;
  windowColor?: string;
  windowLabel?: string;
  sum?: number;
  target?: number;
  showComparison?: boolean;
  comparisonResult?: 'less' | 'greater' | 'equal';
  highlightIndices?: number[];
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  animationStartFrame?: number;
  pointerMoveFrame?: number;
  style?: React.CSSProperties;
}

export const TwoPointers: React.FC<TwoPointersProps> = ({
  values,
  left: staticLeft,
  right: staticRight,
  leftLabel = 'L',
  rightLabel = 'R',
  leftColor,
  rightColor,
  direction: staticDirection = 'converging',
  showWindow: staticShowWindow = false,
  windowColor,
  windowLabel,
  sum: staticSum,
  target,
  showComparison = false,
  comparisonResult: staticComparisonResult,
  highlightIndices: staticHighlightIndices = [],
  cellSize = 'medium',
  title,
  animationStartFrame = 0,
  pointerMoveFrame,
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: TwoPointersAnimationStep = useMemo(() => ({
    left: staticLeft,
    right: staticRight,
    direction: staticDirection,
    showWindow: staticShowWindow,
    sum: staticSum,
    comparisonResult: staticComparisonResult,
    highlightIndices: staticHighlightIndices,
  }), [staticLeft, staticRight, staticDirection, staticShowWindow, staticSum, staticComparisonResult, staticHighlightIndices]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress, hasStarted } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Interpolate pointer positions for smooth movement
  const left = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.left;
    }
    return interpolateNumeric(currentState.left, nextState.left, stepProgress);
  }, [animationSteps, interpolationMode, currentState.left, nextState.left, stepProgress]);

  const right = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.right;
    }
    return interpolateNumeric(currentState.right, nextState.right, stepProgress);
  }, [animationSteps, interpolationMode, currentState.right, nextState.right, stepProgress]);

  // Derive other values from current state
  const direction = currentState.direction ?? staticDirection;
  const showWindow = currentState.showWindow ?? staticShowWindow;
  const sum = currentState.sum ?? staticSum;
  const comparisonResult = currentState.comparisonResult ?? staticComparisonResult;
  const highlightIndices = currentState.highlightIndices ?? staticHighlightIndices;

  // Colors
  const lColor = leftColor || DSA_COLORS.pointer.left;
  const rColor = rightColor || DSA_COLORS.pointer.right;
  const wColor = windowColor || `${lColor}30`;

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, gap: 6 },
    medium: { width: 60, height: 60, gap: 8 },
    large: { width: 80, height: 80, gap: 10 },
  }[cellSize];

  const cellWidth = sizeConfig.width + sizeConfig.gap;

  // Animation progress for cells
  const getCellProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 3,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Pointer animation
  const getPointerAnimation = (index: number, isLeft: boolean) => {
    const baseDelay = animationStartFrame + values.length * 3 + 10;
    const progress = spring({
      frame: frame - baseDelay - (isLeft ? 0 : 5),
      fps,
      config: DSA_SPRINGS.bouncy,
    });

    // Bounce effect
    const bounce = Math.sin(frame * 0.12) * 4 * Math.min(1, progress);

    return { progress, bounce };
  };

  // Direction arrows
  const getDirectionArrows = () => {
    switch (direction) {
      case 'converging':
        return { leftArrow: '→', rightArrow: '←' };
      case 'diverging':
        return { leftArrow: '←', rightArrow: '→' };
      case 'same':
        return { leftArrow: '→', rightArrow: '→' };
    }
  };

  const { leftArrow, rightArrow } = getDirectionArrows();

  // Comparison symbol
  const getComparisonSymbol = () => {
    if (!comparisonResult) return null;
    switch (comparisonResult) {
      case 'less':
        return '<';
      case 'greater':
        return '>';
      case 'equal':
        return '=';
    }
  };

  // Check if index is between pointers
  const isInWindow = (index: number) => {
    if (!showWindow) return false;
    return index >= left && index <= right;
  };

  // Get highlight type
  const getHighlightType = (index: number) => {
    if (index === left) return 'left' as const;
    if (index === right) return 'right' as const;
    if (highlightIndices.includes(index)) return 'current' as const;
    return 'none' as const;
  };

  const leftAnim = getPointerAnimation(left, true);
  const rightAnim = getPointerAnimation(right, false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
          }}
        >
          {title}
        </div>
      )}

      {/* Step Annotation */}
      {annotationText && (
        <div
          style={{
            fontSize: 18,
            color: DSA_COLORS.ui.text,
            padding: '8px 16px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            opacity: annotationOpacity,
          }}
        >
          {annotationText}
        </div>
      )}

      {/* Target display */}
      {target !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 20px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
            Target:
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.syntax.number,
            }}
          >
            {target}
          </span>
        </div>
      )}

      {/* Array container */}
      <div style={{ position: 'relative' }}>
        {/* Window highlight */}
        {showWindow && Math.floor(left) <= Math.ceil(right) && (
          <div
            style={{
              position: 'absolute',
              left: Math.floor(left) * cellWidth - 6,
              top: -12,
              width: (Math.ceil(right) - Math.floor(left) + 1) * cellWidth - sizeConfig.gap + 12,
              height: sizeConfig.height + 50,
              background: wColor,
              borderRadius: 12,
              border: `2px solid ${lColor}60`,
              opacity: spring({
                frame: frame - animationStartFrame - values.length * 3,
                fps,
                config: DSA_SPRINGS.smooth,
              }) * 0.5,
            }}
          >
            {/* Window label */}
            {windowLabel && (
              <div
                style={{
                  position: 'absolute',
                  top: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: lColor,
                  whiteSpace: 'nowrap',
                }}
              >
                {windowLabel}
              </div>
            )}
          </div>
        )}

        {/* Array cells */}
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {values.map((value, index) => {
            const progress = getCellProgress(index);
            const highlightType = getHighlightType(index);
            const inWindow = isInWindow(index);

            return (
              <ArrayCell
                key={index}
                value={value}
                index={index}
                highlight={highlightType}
                color={
                  index === left
                    ? lColor
                    : index === right
                    ? rColor
                    : inWindow
                    ? `${lColor}40`
                    : undefined
                }
                size={cellSize}
                animationDelay={animationStartFrame + index * 3}
                showIndex={true}
              />
            );
          })}
        </div>

        {/* Left pointer */}
        <Pointer
          index={left}
          label={leftLabel}
          color={lColor}
          direction={leftArrow}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          position="top"
          progress={leftAnim.progress}
          bounce={leftAnim.bounce}
        />

        {/* Right pointer */}
        <Pointer
          index={right}
          label={rightLabel}
          color={rColor}
          direction={rightArrow}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          position="top"
          progress={rightAnim.progress}
          bounce={rightAnim.bounce}
        />
      </div>

      {/* Sum and comparison display */}
      {(sum !== undefined || showComparison) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '12px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 10,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {/* Current sum */}
          {sum !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: lColor,
                }}
              >
                {values[Math.round(left)]}
              </span>
              <span style={{ color: DSA_COLORS.ui.textMuted }}>+</span>
              <span
                style={{
                  fontSize: 16,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: rColor,
                }}
              >
                {values[Math.round(right)]}
              </span>
              <span style={{ color: DSA_COLORS.ui.textMuted }}>=</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: DSA_COLORS.ui.text,
                }}
              >
                {sum}
              </span>
            </div>
          )}

          {/* Comparison */}
          {showComparison && target !== undefined && comparisonResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: comparisonResult === 'equal'
                  ? `${DSA_COLORS.ui.success}20`
                  : `${DSA_COLORS.ui.warning}20`,
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: comparisonResult === 'equal'
                    ? DSA_COLORS.ui.success
                    : DSA_COLORS.ui.warning,
                }}
              >
                {sum} {getComparisonSymbol()} {target}
              </span>
              {comparisonResult === 'equal' && (
                <span style={{ fontSize: 16 }}>✓</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Pointer Sub-component
// ============================================

interface PointerProps {
  index: number;
  label: string;
  color: string;
  direction?: string;
  cellWidth: number;
  cellHeight: number;
  position: 'top' | 'bottom';
  progress: number;
  bounce: number;
}

const Pointer: React.FC<PointerProps> = ({
  index,
  label,
  color,
  direction,
  cellWidth,
  cellHeight,
  position,
  progress,
  bounce,
}) => {
  const isTop = position === 'top';
  // Support smooth interpolation for non-integer indices
  const left = index * cellWidth + cellWidth / 2 - 4;
  const top = isTop ? -45 - bounce : cellHeight + 35 + bounce;
  // Add glow effect when pointer is moving (index is not an integer)
  const isMoving = index !== Math.round(index);
  const glowIntensity = isMoving ? 8 : 6;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: progress,
        transform: `scale(${progress}) translateX(-50%)`,
      }}
    >
      {/* Label and direction */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 16,
          fontWeight: 700,
          color: color,
          fontFamily: 'JetBrains Mono, monospace',
          order: isTop ? 0 : 1,
          marginBottom: isTop ? 4 : 0,
          marginTop: isTop ? 0 : 4,
        }}
      >
        {label}
        {direction && (
          <span style={{ fontSize: 14, opacity: 0.7 }}>{direction}</span>
        )}
      </div>

      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          ...(isTop
            ? { borderTop: `14px solid ${color}` }
            : { borderBottom: `14px solid ${color}` }),
          order: isTop ? 1 : 0,
          filter: `drop-shadow(0 0 ${glowIntensity}px ${color}60)`,
          transition: 'filter 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default TwoPointers;
