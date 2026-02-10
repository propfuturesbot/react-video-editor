import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from '../arrays/ArrayCell';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { SlidingWindowAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface SlidingWindowProps extends DSAStepsProps<SlidingWindowAnimationStep> {
  values: (string | number)[];
  windowStart: number;
  windowEnd: number;
  windowSum?: number;
  windowMax?: number;
  windowMin?: number;
  windowFrequency?: Record<string | number, number>;
  target?: number;
  constraint?: string;
  isValid?: boolean;
  optimalWindow?: { start: number; end: number };
  showOptimalBadge?: boolean;
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  operation?: 'expand' | 'shrink' | 'slide' | 'none';
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const SlidingWindow: React.FC<SlidingWindowProps> = ({
  values,
  windowStart: staticWindowStart,
  windowEnd: staticWindowEnd,
  windowSum: staticWindowSum,
  windowMax: staticWindowMax,
  windowMin: staticWindowMin,
  windowFrequency: staticWindowFrequency,
  target,
  constraint,
  isValid: staticIsValid,
  optimalWindow,
  showOptimalBadge = true,
  cellSize = 'medium',
  title,
  operation: staticOperation,
  animationStartFrame = 0,
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, gap: 6 },
    medium: { width: 60, height: 60, gap: 8 },
    large: { width: 80, height: 80, gap: 10 },
  }[cellSize];

  const cellWidth = sizeConfig.width + sizeConfig.gap;

  // Create static state for fallback
  const staticState: SlidingWindowAnimationStep = useMemo(() => ({
    windowStart: staticWindowStart,
    windowEnd: staticWindowEnd,
    windowSum: staticWindowSum,
    windowMax: staticWindowMax,
    windowMin: staticWindowMin,
    windowFrequency: staticWindowFrequency,
    isValid: staticIsValid,
    operation: staticOperation,
  }), [staticWindowStart, staticWindowEnd, staticWindowSum, staticWindowMax, staticWindowMin, staticWindowFrequency, staticIsValid, staticOperation]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Interpolate window positions for smooth movement
  const windowStart = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.windowStart;
    }
    return interpolateNumeric(currentState.windowStart, nextState.windowStart, stepProgress);
  }, [animationSteps, interpolationMode, currentState.windowStart, nextState.windowStart, stepProgress]);

  const windowEnd = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.windowEnd;
    }
    return interpolateNumeric(currentState.windowEnd, nextState.windowEnd, stepProgress);
  }, [animationSteps, interpolationMode, currentState.windowEnd, nextState.windowEnd, stepProgress]);

  // Derive other values from current state
  const windowSum = currentState.windowSum ?? staticWindowSum;
  const windowMax = currentState.windowMax ?? staticWindowMax;
  const windowMin = currentState.windowMin ?? staticWindowMin;
  const windowFrequency = currentState.windowFrequency ?? staticWindowFrequency;
  const isValid = currentState.isValid ?? staticIsValid;
  const operation = currentState.operation ?? staticOperation;
  const isOptimal = currentState.isOptimal ?? false;

  const windowSize = Math.ceil(windowEnd) - Math.floor(windowStart) + 1;

  // Animation progress for cells
  const getCellProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 3,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Window animation
  const windowProgress = spring({
    frame: frame - animationStartFrame - values.length * 3,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Bracket animation for expand/shrink
  const getBracketAnimation = () => {
    if (!operation) return { leftOffset: 0, rightOffset: 0 };

    const animDuration = DSA_TIMING.medium;
    const elapsed = frame - animationStartFrame - values.length * 3 - 20;

    if (elapsed < 0) return { leftOffset: 0, rightOffset: 0 };

    const progress = Math.min(1, elapsed / animDuration);
    const eased = 1 - Math.pow(1 - progress, 3);

    switch (operation) {
      case 'expand':
        return { leftOffset: 0, rightOffset: eased * cellWidth };
      case 'shrink':
        return { leftOffset: eased * cellWidth, rightOffset: 0 };
      case 'slide':
        return { leftOffset: eased * cellWidth, rightOffset: eased * cellWidth };
      default:
        return { leftOffset: 0, rightOffset: 0 };
    }
  };

  const bracketAnim = getBracketAnimation();

  // Check if index is in window
  const isInWindow = (index: number) => {
    return index >= windowStart && index <= windowEnd;
  };

  // Check if index is in optimal window
  const isInOptimalWindow = (index: number) => {
    if (!optimalWindow) return false;
    return index >= optimalWindow.start && index <= optimalWindow.end;
  };

  // Calculate window left position (supports smooth interpolation)
  const windowLeft = windowStart * cellWidth - 8 + bracketAnim.leftOffset;
  const windowWidth = (windowEnd - windowStart + 1) * cellWidth - sizeConfig.gap + 16 - bracketAnim.leftOffset + bracketAnim.rightOffset;

  // For display, use rounded values
  const displayWindowStart = Math.round(windowStart);
  const displayWindowEnd = Math.round(windowEnd);

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

      {/* Target/Constraint display */}
      {(target !== undefined || constraint) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 20px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {target !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
                Target:
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: DSA_COLORS.syntax.number,
                }}
              >
                {target}
              </span>
            </div>
          )}
          {constraint && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
                Constraint:
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: DSA_COLORS.syntax.keyword,
                }}
              >
                {constraint}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Array with window */}
      <div style={{ position: 'relative' }}>
        {/* Window bracket highlight */}
        <div
          style={{
            position: 'absolute',
            left: windowLeft,
            top: -16,
            width: Math.max(0, windowWidth),
            height: sizeConfig.height + 60,
            background: isValid === false
              ? `${DSA_COLORS.ui.error}15`
              : `${DSA_COLORS.cell.window}30`,
            borderRadius: 12,
            border: `3px solid ${
              isValid === false
                ? DSA_COLORS.ui.error
                : DSA_COLORS.cell.window
            }`,
            opacity: windowProgress,
            transition: 'left 0.2s ease-out, width 0.2s ease-out',
          }}
        >
          {/* Top brackets */}
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: -4,
              width: 20,
              height: 20,
              borderLeft: `4px solid ${DSA_COLORS.cell.window}`,
              borderTop: `4px solid ${DSA_COLORS.cell.window}`,
              borderRadius: '8px 0 0 0',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -8,
              right: -4,
              width: 20,
              height: 20,
              borderRight: `4px solid ${DSA_COLORS.cell.window}`,
              borderTop: `4px solid ${DSA_COLORS.cell.window}`,
              borderRadius: '0 8px 0 0',
            }}
          />

          {/* Window size label */}
          <div
            style={{
              position: 'absolute',
              top: -32,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 13,
              fontWeight: 600,
              color: isOptimal ? DSA_COLORS.ui.success : DSA_COLORS.cell.window,
              background: DSA_COLORS.ui.background,
              padding: '2px 10px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            Window [{displayWindowStart}:{displayWindowEnd}] size={windowSize}
            {isOptimal && ' ★'}
          </div>

          {/* Valid/Invalid badge */}
          {isValid !== undefined && (
            <div
              style={{
                position: 'absolute',
                top: -32,
                right: -10,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {isValid ? (
                <span style={{ color: DSA_COLORS.ui.success }}>✓</span>
              ) : (
                <span style={{ color: DSA_COLORS.ui.error }}>✗</span>
              )}
            </div>
          )}
        </div>

        {/* Optimal window indicator */}
        {optimalWindow && showOptimalBadge && (
          <div
            style={{
              position: 'absolute',
              left: optimalWindow.start * cellWidth - 4,
              top: sizeConfig.height + 50,
              width: (optimalWindow.end - optimalWindow.start + 1) * cellWidth - sizeConfig.gap + 8,
              height: 4,
              background: DSA_COLORS.ui.success,
              borderRadius: 2,
              opacity: windowProgress * 0.8,
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 11,
                fontWeight: 600,
                color: DSA_COLORS.ui.success,
                whiteSpace: 'nowrap',
              }}
            >
              Optimal
            </div>
          </div>
        )}

        {/* Array cells */}
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {values.map((value, index) => {
            const progress = getCellProgress(index);
            const inWindow = isInWindow(index);
            const inOptimal = isInOptimalWindow(index);

            return (
              <ArrayCell
                key={index}
                value={value}
                index={index}
                highlight={inWindow ? 'window' : inOptimal ? 'sorted' : 'none'}
                color={
                  inWindow
                    ? DSA_COLORS.cell.window
                    : inOptimal
                    ? `${DSA_COLORS.ui.success}40`
                    : undefined
                }
                size={cellSize}
                animationDelay={animationStartFrame + index * 3}
                showIndex={true}
              />
            );
          })}
        </div>

        {/* Left/Right pointer labels - positioned using interpolated values */}
        <div
          style={{
            position: 'absolute',
            left: windowStart * cellWidth + cellWidth / 2,
            bottom: -50,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: windowProgress,
            transition: 'left 0.05s ease-out',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `12px solid ${DSA_COLORS.pointer.left}`,
              filter: `drop-shadow(0 0 4px ${DSA_COLORS.pointer.left}60)`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: DSA_COLORS.pointer.left,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            L
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: windowEnd * cellWidth + cellWidth / 2,
            bottom: -50,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: windowProgress,
            transition: 'left 0.05s ease-out',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `12px solid ${DSA_COLORS.pointer.right}`,
              filter: `drop-shadow(0 0 4px ${DSA_COLORS.pointer.right}60)`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: DSA_COLORS.pointer.right,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            R
          </span>
        </div>
      </div>

      {/* Window statistics */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        {windowSum !== undefined && (
          <StatBox label="Sum" value={windowSum} target={target} />
        )}
        {windowMax !== undefined && (
          <StatBox label="Max" value={windowMax} />
        )}
        {windowMin !== undefined && (
          <StatBox label="Min" value={windowMin} />
        )}
        {windowFrequency && Object.keys(windowFrequency).length > 0 && (
          <FrequencyBox frequency={windowFrequency} />
        )}
      </div>

      {/* Operation indicator */}
      {operation && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: DSA_COLORS.ui.card,
            borderRadius: 6,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
            Operation:
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.syntax.function,
            }}
          >
            {operation === 'expand' && '→ Expand Right'}
            {operation === 'shrink' && '← Shrink Left'}
            {operation === 'slide' && '→ Slide Window'}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

interface StatBoxProps {
  label: string;
  value: number;
  target?: number;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, target }) => {
  const matchesTarget = target !== undefined && value === target;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 20px',
        background: matchesTarget
          ? `${DSA_COLORS.ui.success}20`
          : DSA_COLORS.ui.card,
        borderRadius: 8,
        border: `1px solid ${
          matchesTarget ? DSA_COLORS.ui.success : DSA_COLORS.ui.border
        }`,
        minWidth: 80,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: DSA_COLORS.ui.textMuted,
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: matchesTarget
            ? DSA_COLORS.ui.success
            : DSA_COLORS.syntax.number,
        }}
      >
        {value}
      </span>
      {matchesTarget && (
        <span style={{ fontSize: 14, marginTop: 2 }}>✓</span>
      )}
    </div>
  );
};

interface FrequencyBoxProps {
  frequency: Record<string | number, number>;
}

const FrequencyBox: React.FC<FrequencyBoxProps> = ({ frequency }) => {
  const entries = Object.entries(frequency);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 16px',
        background: DSA_COLORS.ui.card,
        borderRadius: 8,
        border: `1px solid ${DSA_COLORS.ui.border}`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: DSA_COLORS.ui.textMuted,
          marginBottom: 6,
        }}
      >
        Frequency
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {entries.map(([key, count]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              background: DSA_COLORS.ui.background,
              borderRadius: 4,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                color: DSA_COLORS.syntax.string,
              }}
            >
              {key}
            </span>
            <span style={{ fontSize: 12, color: DSA_COLORS.ui.textMuted }}>
              :
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: DSA_COLORS.syntax.number,
              }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidingWindow;
