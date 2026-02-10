import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from '../arrays/ArrayCell';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { LinearSearchAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface LinearSearchProps extends DSAStepsProps<LinearSearchAnimationStep> {
  values: (string | number)[];
  target: string | number;
  currentIndex: number;
  found?: boolean;
  foundIndex?: number;
  visited?: number[];
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  showComplexity?: boolean;
  showComparison?: boolean;
  animationStartFrame?: number;
  scanFrame?: number;
  style?: React.CSSProperties;
}

export const LinearSearch: React.FC<LinearSearchProps> = ({
  values,
  target,
  currentIndex: staticCurrentIndex,
  found: staticFound = false,
  foundIndex: staticFoundIndex,
  visited: staticVisited = [],
  cellSize = 'medium',
  title,
  showComplexity = true,
  showComparison = true,
  animationStartFrame = 0,
  scanFrame,
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: LinearSearchAnimationStep = useMemo(() => ({
    currentIndex: staticCurrentIndex,
    visitedIndices: staticVisited,
    found: staticFound ? staticFoundIndex ?? -1 : -1,
  }), [staticCurrentIndex, staticVisited, staticFound, staticFoundIndex]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Interpolate current index for smooth scanning effect
  const currentIndex = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.currentIndex;
    }
    return interpolateNumeric(currentState.currentIndex, nextState.currentIndex, stepProgress);
  }, [animationSteps, interpolationMode, currentState.currentIndex, nextState.currentIndex, stepProgress]);

  // Derive other values
  const visited = currentState.visitedIndices ?? staticVisited;
  const found = currentState.found !== undefined ? currentState.found >= 0 : staticFound;
  const foundIndex = currentState.found !== undefined && currentState.found >= 0 ? currentState.found : staticFoundIndex;

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

  // Scanning animation
  const getScanProgress = () => {
    if (scanFrame === undefined) return 1;
    return spring({
      frame: frame - scanFrame,
      fps,
      config: DSA_SPRINGS.smooth,
    });
  };

  // Scanning glow effect
  const getScanGlow = (index: number) => {
    if (index !== currentIndex) return 0;

    const pulse = Math.sin(frame * 0.2) * 0.3 + 0.7;
    return pulse;
  };

  // Get highlight type
  const getHighlightType = (index: number) => {
    if (found && index === foundIndex) return 'sorted' as const;
    if (index === currentIndex) return 'current' as const;
    if (visited.includes(index)) return 'comparing' as const;
    return 'none' as const;
  };

  // Get cell color
  const getCellColor = (index: number) => {
    if (found && index === foundIndex) return DSA_COLORS.ui.success;
    if (index === currentIndex) return DSA_COLORS.cell.current;
    if (visited.includes(index)) return `${DSA_COLORS.ui.textMuted}60`;
    return undefined;
  };

  const scanProgress = getScanProgress();

  // Current comparison
  const currentValue = values[currentIndex];
  const isMatch = currentValue === target;

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

      {/* Target and progress display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '12px 24px',
          background: DSA_COLORS.ui.card,
          borderRadius: 10,
          border: `1px solid ${DSA_COLORS.ui.border}`,
        }}
      >
        {/* Target */}
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
            height: 40,
            background: DSA_COLORS.ui.border,
          }}
        />

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
            Checked:
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.ui.text,
            }}
          >
            {visited.length + 1} / {values.length}
          </span>
        </div>

        {showComplexity && (
          <>
            <div
              style={{
                width: 1,
                height: 40,
                background: DSA_COLORS.ui.border,
              }}
            />
            <div>
              <div style={{ fontSize: 11, color: DSA_COLORS.ui.textMuted }}>
                Time Complexity
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#eab308',
                }}
              >
                O(n)
              </div>
            </div>
          </>
        )}
      </div>

      {/* Array with scanner */}
      <div style={{ position: 'relative' }}>
        {/* Scanning beam effect */}
        <div
          style={{
            position: 'absolute',
            left: currentIndex * cellWidth - 8,
            top: -15,
            width: sizeConfig.width + 16,
            height: sizeConfig.height + 60,
            background: `linear-gradient(180deg, ${DSA_COLORS.cell.current}30 0%, ${DSA_COLORS.cell.current}10 100%)`,
            borderRadius: 12,
            border: `2px solid ${DSA_COLORS.cell.current}`,
            opacity: scanProgress * getScanGlow(currentIndex),
            boxShadow: `0 0 20px ${DSA_COLORS.cell.current}40`,
            transition: 'left 0.3s ease-out',
          }}
        />

        {/* Array cells */}
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {values.map((value, index) => {
            const progress = getCellProgress(index);
            const highlightType = getHighlightType(index);
            const color = getCellColor(index);
            const isVisited = visited.includes(index);

            return (
              <div
                key={index}
                style={{ position: 'relative' }}
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

                {/* Checked indicator */}
                {isVisited && !found && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: DSA_COLORS.ui.error,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: 'white',
                      fontWeight: 700,
                    }}
                  >
                    ✗
                  </div>
                )}

                {/* Found indicator */}
                {found && index === foundIndex && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: DSA_COLORS.ui.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: `0 0 10px ${DSA_COLORS.ui.success}80`,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current position pointer */}
        <div
          style={{
            position: 'absolute',
            left: currentIndex * cellWidth + cellWidth / 2,
            bottom: -50,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: scanProgress,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: `14px solid ${DSA_COLORS.cell.current}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: DSA_COLORS.cell.current,
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: 4,
            }}
          >
            i = {currentIndex}
          </span>
        </div>
      </div>

      {/* Comparison display */}
      {showComparison && !found && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 10,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span style={{ color: DSA_COLORS.syntax.variable }}>arr</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>[</span>
            <span style={{ color: DSA_COLORS.cell.current }}>{currentIndex}</span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>]</span>
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.cell.current,
            }}
          >
            {currentValue}
          </span>
          <span
            style={{
              fontSize: 18,
              color: isMatch ? DSA_COLORS.ui.success : DSA_COLORS.ui.error,
            }}
          >
            {isMatch ? '==' : '!='}
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
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: isMatch ? DSA_COLORS.ui.success : DSA_COLORS.ui.error,
            }}
          >
            {isMatch ? '✓' : '✗'}
          </span>
        </div>
      )}

      {/* Found message */}
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
              {target} found at index {foundIndex} after checking{' '}
              {visited.length + 1} element{visited.length > 0 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Not found message */}
      {!found && currentIndex >= values.length - 1 && (
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
              Searched all {values.length} elements
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          width: Math.min(400, values.length * cellWidth),
          height: 8,
          background: DSA_COLORS.ui.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${((visited.length + 1) / values.length) * 100}%`,
            height: '100%',
            background: found ? DSA_COLORS.ui.success : DSA_COLORS.cell.current,
            borderRadius: 4,
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default LinearSearch;
