import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from '../arrays/ArrayCell';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { BinarySearchAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface BinarySearchProps extends DSAStepsProps<BinarySearchAnimationStep> {
  values: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  found?: boolean;
  foundIndex?: number;
  eliminated?: 'left' | 'right' | null;
  iterations?: number;
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  showFormula?: boolean;
  showComplexity?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const BinarySearch: React.FC<BinarySearchProps> = ({
  values,
  target,
  left: staticLeft,
  right: staticRight,
  mid: staticMid,
  found: staticFound = false,
  foundIndex: staticFoundIndex,
  eliminated: staticEliminated = null,
  iterations: staticIterations = 0,
  cellSize = 'medium',
  title,
  showFormula = true,
  showComplexity = true,
  animationStartFrame = 0,
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: BinarySearchAnimationStep = useMemo(() => ({
    left: staticLeft,
    right: staticRight,
    mid: staticMid,
    found: staticFoundIndex,
    comparisonResult: staticFound ? 'equal' : values[staticMid] < target ? 'less' : 'greater',
  }), [staticLeft, staticRight, staticMid, staticFound, staticFoundIndex, values, target]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress, stepIndex } = stepAnimation;
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

  const mid = useMemo(() => {
    if (!animationSteps || currentState.mid === undefined) {
      return staticMid;
    }
    if (interpolationMode === 'discrete' || nextState.mid === undefined) {
      return currentState.mid;
    }
    return interpolateNumeric(currentState.mid, nextState.mid, stepProgress);
  }, [animationSteps, interpolationMode, currentState.mid, nextState.mid, stepProgress, staticMid]);

  // Derive other values
  const found = currentState.found !== undefined ? currentState.found >= 0 : staticFound;
  const foundIndex = currentState.found !== undefined && currentState.found >= 0 ? currentState.found : staticFoundIndex;
  const comparisonResult = currentState.comparisonResult;
  const eliminated = currentState.eliminated;
  const iterations = animationSteps ? stepIndex + 1 : staticIterations;

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, gap: 6 },
    medium: { width: 55, height: 55, gap: 8 },
    large: { width: 70, height: 70, gap: 10 },
  }[cellSize];

  const cellWidth = sizeConfig.width + sizeConfig.gap;

  // Animation progress
  const getCellProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 2,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Pointer animation
  const getPointerProgress = () => {
    return spring({
      frame: frame - animationStartFrame - values.length * 2 - 10,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Elimination animation
  const getEliminationOpacity = (index: number) => {
    if (!eliminated) return 1;

    const isEliminated =
      (eliminated === 'left' && index < mid) ||
      (eliminated === 'right' && index > mid);

    if (!isEliminated) return 1;

    return interpolate(
      frame - animationStartFrame - values.length * 2 - 30,
      [0, DSA_TIMING.normal],
      [1, 0.3],
      { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );
  };

  // Get highlight type for cell
  const getHighlightType = (index: number) => {
    if (found && index === foundIndex) return 'sorted' as const;
    if (index === mid) return 'current' as const;
    if (index === left || index === right) return 'comparing' as const;
    if (index >= left && index <= right) return 'window' as const;
    return 'none' as const;
  };

  // Get cell color
  const getCellColor = (index: number) => {
    if (found && index === foundIndex) return DSA_COLORS.ui.success;
    if (index === mid) return DSA_COLORS.cell.current;
    if (index === left) return DSA_COLORS.pointer.left;
    if (index === right) return DSA_COLORS.pointer.right;
    if (index >= left && index <= right) return `${DSA_COLORS.cell.window}60`;
    return undefined;
  };

  const pointerProgress = getPointerProgress();

  // Calculate mid formula
  const midFormula = `mid = (${left} + ${right}) / 2 = ${mid}`;

  // Comparison result
  const comparison = found
    ? `arr[${mid}] = ${values[mid]} = ${target} ✓`
    : values[mid] < target
    ? `arr[${mid}] = ${values[mid]} < ${target} → search right`
    : `arr[${mid}] = ${values[mid]} > ${target} → search left`;

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '10px 24px',
          background: DSA_COLORS.ui.card,
          borderRadius: 10,
          border: `1px solid ${DSA_COLORS.ui.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
            Target:
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.syntax.number,
            }}
          >
            {target}
          </span>
        </div>

        <div
          style={{
            width: 1,
            height: 35,
            background: DSA_COLORS.ui.border,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
            Iteration:
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.ui.text,
            }}
          >
            {iterations}
          </span>
        </div>

        {showComplexity && (
          <>
            <div
              style={{
                width: 1,
                height: 35,
                background: DSA_COLORS.ui.border,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
                Max Steps:
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#84cc16',
                }}
              >
                log₂({values.length}) ≈ {Math.ceil(Math.log2(values.length))}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Array with pointers */}
      <div style={{ position: 'relative' }}>
        {/* Search range highlight */}
        {left <= right && (
          <div
            style={{
              position: 'absolute',
              left: left * cellWidth - 6,
              top: -10,
              width: (right - left + 1) * cellWidth - sizeConfig.gap + 12,
              height: sizeConfig.height + 48,
              background: `${DSA_COLORS.cell.window}20`,
              borderRadius: 10,
              border: `2px solid ${DSA_COLORS.cell.window}40`,
              opacity: pointerProgress * 0.6,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -22,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 12,
                fontWeight: 600,
                color: DSA_COLORS.cell.window,
                whiteSpace: 'nowrap',
              }}
            >
              Search Range [{left}, {right}]
            </div>
          </div>
        )}

        {/* Array cells */}
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {values.map((value, index) => {
            const progress = getCellProgress(index);
            const opacity = getEliminationOpacity(index);
            const highlightType = getHighlightType(index);
            const color = getCellColor(index);

            return (
              <div
                key={index}
                style={{
                  opacity: opacity,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <ArrayCell
                  value={value}
                  index={index}
                  highlight={highlightType}
                  color={color}
                  size={cellSize}
                  animationDelay={animationStartFrame + index * 2}
                  showIndex={true}
                />
              </div>
            );
          })}
        </div>

        {/* Left pointer */}
        <Pointer
          index={left}
          label="L"
          sublabel="left"
          color={DSA_COLORS.pointer.left}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          progress={pointerProgress}
          position="bottom"
        />

        {/* Mid pointer */}
        <Pointer
          index={mid}
          label="M"
          sublabel="mid"
          color={DSA_COLORS.cell.current}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          progress={pointerProgress}
          position="top"
          isMain
        />

        {/* Right pointer */}
        <Pointer
          index={right}
          label="R"
          sublabel="right"
          color={DSA_COLORS.pointer.right}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          progress={pointerProgress}
          position="bottom"
        />
      </div>

      {/* Formula display */}
      {showFormula && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 10,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {/* Mid calculation */}
          <div
            style={{
              fontSize: 16,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.ui.text,
            }}
          >
            <span style={{ color: DSA_COLORS.syntax.keyword }}>mid</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}> = </span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>(</span>
            <span style={{ color: DSA_COLORS.pointer.left }}>{left}</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}> + </span>
            <span style={{ color: DSA_COLORS.pointer.right }}>{right}</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>) // 2 = </span>
            <span style={{ color: DSA_COLORS.cell.current, fontWeight: 700 }}>
              {mid}
            </span>
          </div>

          {/* Comparison */}
          <div
            style={{
              fontSize: 15,
              fontFamily: 'JetBrains Mono, monospace',
              padding: '6px 14px',
              borderRadius: 6,
              background: found
                ? `${DSA_COLORS.ui.success}20`
                : `${DSA_COLORS.syntax.keyword}15`,
            }}
          >
            <span style={{ color: DSA_COLORS.syntax.variable }}>arr</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>[</span>
            <span style={{ color: DSA_COLORS.cell.current }}>{mid}</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>] = </span>
            <span style={{ color: DSA_COLORS.syntax.number }}>{values[mid]}</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>
              {found
                ? ` == ${target} `
                : values[mid] < target
                ? ` < ${target} `
                : ` > ${target} `}
            </span>
            {found ? (
              <span style={{ color: DSA_COLORS.ui.success, fontWeight: 700 }}>
                ✓ Found!
              </span>
            ) : (
              <span style={{ color: DSA_COLORS.syntax.keyword }}>
                → search {values[mid] < target ? 'right' : 'left'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Found indicator */}
      {found && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 28px',
            background: `${DSA_COLORS.ui.success}15`,
            borderRadius: 12,
            border: `2px solid ${DSA_COLORS.ui.success}`,
          }}
        >
          <span style={{ fontSize: 28 }}>🎯</span>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: DSA_COLORS.ui.success,
              }}
            >
              Target Found!
            </div>
            <div
              style={{
                fontSize: 14,
                color: DSA_COLORS.ui.textMuted,
              }}
            >
              {target} is at index {foundIndex} in {iterations} iteration
              {iterations !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Not found indicator */}
      {!found && left > right && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 28px',
            background: `${DSA_COLORS.ui.error}15`,
            borderRadius: 12,
            border: `2px solid ${DSA_COLORS.ui.error}`,
          }}
        >
          <span style={{ fontSize: 28 }}>❌</span>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: DSA_COLORS.ui.error,
              }}
            >
              Target Not Found
            </div>
            <div
              style={{
                fontSize: 14,
                color: DSA_COLORS.ui.textMuted,
              }}
            >
              {target} is not in the array (searched in {iterations} iterations)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

interface PointerProps {
  index: number;
  label: string;
  sublabel: string;
  color: string;
  cellWidth: number;
  cellHeight: number;
  progress: number;
  position: 'top' | 'bottom';
  isMain?: boolean;
}

const Pointer: React.FC<PointerProps> = ({
  index,
  label,
  sublabel,
  color,
  cellWidth,
  cellHeight,
  progress,
  position,
  isMain = false,
}) => {
  const isTop = position === 'top';
  // Support smooth interpolation for non-integer indices
  const left = index * cellWidth + cellWidth / 2 - 4;
  const top = isTop ? -55 : cellHeight + 40;
  // Enhanced glow when pointer is moving
  const isMoving = index !== Math.round(index);
  const glowIntensity = isMoving ? 12 : 8;

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
      {/* Label */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          order: isTop ? 0 : 1,
          marginBottom: isTop ? 4 : 0,
          marginTop: isTop ? 0 : 4,
        }}
      >
        <span
          style={{
            fontSize: isMain ? 18 : 14,
            fontWeight: 700,
            color,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            color: DSA_COLORS.ui.textMuted,
          }}
        >
          {sublabel}
        </span>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${isMain ? 12 : 8}px solid transparent`,
          borderRight: `${isMain ? 12 : 8}px solid transparent`,
          ...(isTop
            ? { borderTop: `${isMain ? 16 : 12}px solid ${color}` }
            : { borderBottom: `${isMain ? 16 : 12}px solid ${color}` }),
          order: isTop ? 1 : 0,
          filter: isMain || isMoving ? `drop-shadow(0 0 ${glowIntensity}px ${color}60)` : 'none',
          transition: 'filter 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default BinarySearch;
