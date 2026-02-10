import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from '../arrays/ArrayCell';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { FastSlowPointersAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface FastSlowPointersProps extends DSAStepsProps<FastSlowPointersAnimationStep> {
  values: (string | number)[];
  slow: number;
  fast: number;
  slowLabel?: string;
  fastLabel?: string;
  slowColor?: string;
  fastColor?: string;
  showPath?: boolean;
  pathColor?: string;
  cycleDetected?: boolean;
  cycleStart?: number;
  meetingPoint?: number;
  showIcons?: boolean;
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  animationStartFrame?: number;
  moveFrame?: number;
  speed?: { slow: number; fast: number };
  style?: React.CSSProperties;
}

export const FastSlowPointers: React.FC<FastSlowPointersProps> = ({
  values,
  slow: staticSlow,
  fast: staticFast,
  slowLabel = 'Slow',
  fastLabel = 'Fast',
  slowColor,
  fastColor,
  showPath: staticShowPath = true,
  pathColor,
  cycleDetected: staticCycleDetected = false,
  cycleStart: staticCycleStart,
  meetingPoint: staticMeetingPoint,
  showIcons = true,
  cellSize = 'medium',
  title,
  animationStartFrame = 0,
  moveFrame,
  speed = { slow: 1, fast: 2 },
  style,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: FastSlowPointersAnimationStep = useMemo(() => ({
    slow: staticSlow,
    fast: staticFast,
    cycleDetected: staticCycleDetected,
    cycleStart: staticCycleStart,
    meetingPoint: staticMeetingPoint,
    showPath: staticShowPath,
  }), [staticSlow, staticFast, staticCycleDetected, staticCycleStart, staticMeetingPoint, staticShowPath]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, nextState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Interpolate pointer positions
  const slow = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.slow;
    }
    return interpolateNumeric(currentState.slow, nextState.slow, stepProgress);
  }, [animationSteps, interpolationMode, currentState.slow, nextState.slow, stepProgress]);

  const fast = useMemo(() => {
    if (!animationSteps || interpolationMode === 'discrete') {
      return currentState.fast;
    }
    return interpolateNumeric(currentState.fast, nextState.fast, stepProgress);
  }, [animationSteps, interpolationMode, currentState.fast, nextState.fast, stepProgress]);

  // Derive other values
  const cycleDetected = currentState.cycleDetected ?? staticCycleDetected;
  const cycleStart = currentState.cycleStart ?? staticCycleStart;
  const meetingPoint = currentState.meetingPoint ?? staticMeetingPoint;
  const showPath = currentState.showPath ?? staticShowPath;

  // Colors
  const sColor = slowColor || DSA_COLORS.pointer.slow || '#f59e0b';
  const fColor = fastColor || DSA_COLORS.pointer.fast || '#ef4444';
  const pColor = pathColor || `${sColor}40`;

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

  // Pointer animation with bounce
  const getPointerAnimation = (index: number, isSlow: boolean) => {
    const baseDelay = animationStartFrame + values.length * 3 + 10;
    const pointerDelay = isSlow ? 0 : 5;

    const progress = spring({
      frame: frame - baseDelay - pointerDelay,
      fps,
      config: DSA_SPRINGS.bouncy,
    });

    // Bouncing animation
    const bounceSpeed = isSlow ? 0.1 : 0.15;
    const bounce = Math.sin(frame * bounceSpeed) * 4 * Math.min(1, progress);

    return { progress, bounce };
  };

  // Movement animation if moveFrame is provided
  const getMovementOffset = (isSlow: boolean) => {
    if (moveFrame === undefined) return 0;

    const elapsed = frame - moveFrame;
    if (elapsed < 0) return 0;

    const steps = isSlow ? speed.slow : speed.fast;
    const progress = spring({
      frame: elapsed,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    return progress * steps * cellWidth;
  };

  // Check if index is in the visited path
  const isInPath = (index: number) => {
    if (!showPath) return false;
    return index <= Math.max(slow, fast) && index >= 0;
  };

  // Check if this is the meeting point
  const isMeetingPoint = (index: number) => {
    return meetingPoint !== undefined && index === meetingPoint;
  };

  // Check if this is the cycle start
  const isCycleStart = (index: number) => {
    return cycleStart !== undefined && index === cycleStart;
  };

  const slowAnim = getPointerAnimation(slow, true);
  const fastAnim = getPointerAnimation(fast, false);

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

      {/* Speed indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '8px 20px',
          background: DSA_COLORS.ui.card,
          borderRadius: 8,
          border: `1px solid ${DSA_COLORS.ui.border}`,
        }}
      >
        <SpeedBadge
          label={slowLabel}
          speed={speed.slow}
          color={sColor}
          icon={showIcons ? '🐢' : undefined}
        />
        <div
          style={{
            width: 1,
            height: 30,
            background: DSA_COLORS.ui.border,
          }}
        />
        <SpeedBadge
          label={fastLabel}
          speed={speed.fast}
          color={fColor}
          icon={showIcons ? '🐇' : undefined}
        />
      </div>

      {/* Array with pointers */}
      <div style={{ position: 'relative' }}>
        {/* Path highlight */}
        {showPath && (
          <div
            style={{
              position: 'absolute',
              left: -4,
              top: -4,
              width: (Math.max(slow, fast) + 1) * cellWidth - sizeConfig.gap + 8,
              height: sizeConfig.height + 8,
              background: pColor,
              borderRadius: 10,
              opacity: spring({
                frame: frame - animationStartFrame - values.length * 3,
                fps,
                config: DSA_SPRINGS.smooth,
              }) * 0.3,
            }}
          />
        )}

        {/* Array cells */}
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {values.map((value, index) => {
            const progress = getCellProgress(index);
            const inPath = isInPath(index);
            const meeting = isMeetingPoint(index);
            const cycleNode = isCycleStart(index);

            let highlight: 'none' | 'current' | 'sorted' | 'comparing' = 'none';
            let color: string | undefined = undefined;

            if (index === slow && index === fast) {
              highlight = 'current';
              color = DSA_COLORS.ui.success;
            } else if (index === slow) {
              highlight = 'comparing';
              color = sColor;
            } else if (index === fast) {
              highlight = 'comparing';
              color = fColor;
            } else if (meeting) {
              highlight = 'current';
              color = DSA_COLORS.ui.success;
            } else if (cycleNode) {
              highlight = 'sorted';
              color = DSA_COLORS.cell.window;
            }

            return (
              <div
                key={index}
                style={{ position: 'relative' }}
              >
                <ArrayCell
                  value={value}
                  index={index}
                  highlight={highlight}
                  color={color}
                  size={cellSize}
                  animationDelay={animationStartFrame + index * 3}
                  showIndex={true}
                />

                {/* Meeting point indicator */}
                {meeting && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: DSA_COLORS.ui.success,
                      background: `${DSA_COLORS.ui.success}20`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Meeting Point
                  </div>
                )}

                {/* Cycle start indicator */}
                {cycleNode && !meeting && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: DSA_COLORS.cell.window,
                      background: `${DSA_COLORS.cell.window}20`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Cycle Start
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Slow pointer */}
        <PointerArrow
          index={slow}
          label={slowLabel}
          color={sColor}
          icon={showIcons ? '🐢' : undefined}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          progress={slowAnim.progress}
          bounce={slowAnim.bounce}
          offset={getMovementOffset(true)}
          position="bottom"
        />

        {/* Fast pointer */}
        <PointerArrow
          index={fast}
          label={fastLabel}
          color={fColor}
          icon={showIcons ? '🐇' : undefined}
          cellWidth={cellWidth}
          cellHeight={sizeConfig.height}
          progress={fastAnim.progress}
          bounce={fastAnim.bounce}
          offset={getMovementOffset(false)}
          position="top"
        />
      </div>

      {/* Cycle detected indicator */}
      {cycleDetected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            background: `${DSA_COLORS.ui.success}15`,
            borderRadius: 10,
            border: `2px solid ${DSA_COLORS.ui.success}`,
          }}
        >
          <span style={{ fontSize: 24 }}>🔄</span>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: DSA_COLORS.ui.success,
              }}
            >
              Cycle Detected!
            </div>
            <div
              style={{
                fontSize: 13,
                color: DSA_COLORS.ui.textMuted,
              }}
            >
              Fast and slow pointers met at index {meetingPoint}
            </div>
          </div>
        </div>
      )}

      {/* Position display */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          padding: '10px 20px',
          background: DSA_COLORS.ui.card,
          borderRadius: 8,
          border: `1px solid ${DSA_COLORS.ui.border}`,
        }}
      >
        <PositionDisplay
          label={slowLabel}
          index={Math.round(slow)}
          value={values[Math.round(slow)]}
          color={sColor}
          icon={showIcons ? '🐢' : undefined}
        />
        <div
          style={{
            width: 1,
            height: 40,
            background: DSA_COLORS.ui.border,
          }}
        />
        <PositionDisplay
          label={fastLabel}
          index={Math.round(fast)}
          value={values[Math.round(fast)]}
          color={fColor}
          icon={showIcons ? '🐇' : undefined}
        />
      </div>
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

interface SpeedBadgeProps {
  label: string;
  speed: number;
  color: string;
  icon?: string;
}

const SpeedBadge: React.FC<SpeedBadgeProps> = ({ label, speed, color, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: color,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: DSA_COLORS.ui.textMuted,
        }}
      >
        {speed} step{speed > 1 ? 's' : ''}/iter
      </div>
    </div>
  </div>
);

interface PointerArrowProps {
  index: number;
  label: string;
  color: string;
  icon?: string;
  cellWidth: number;
  cellHeight: number;
  progress: number;
  bounce: number;
  offset: number;
  position: 'top' | 'bottom';
}

const PointerArrow: React.FC<PointerArrowProps> = ({
  index,
  label,
  color,
  icon,
  cellWidth,
  cellHeight,
  progress,
  bounce,
  offset,
  position,
}) => {
  const isTop = position === 'top';
  const left = index * cellWidth + cellWidth / 2 - 4 + offset;
  const top = isTop ? -50 - bounce : cellHeight + 40 + bounce;

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
        transition: 'left 0.3s ease-out',
      }}
    >
      {/* Icon and label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          order: isTop ? 0 : 1,
          marginBottom: isTop ? 4 : 0,
          marginTop: isTop ? 0 : 4,
        }}
      >
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: color,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {label}
        </span>
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
          filter: `drop-shadow(0 0 6px ${color}60)`,
        }}
      />
    </div>
  );
};

interface PositionDisplayProps {
  label: string;
  index: number;
  value: string | number;
  color: string;
  icon?: string;
}

const PositionDisplay: React.FC<PositionDisplayProps> = ({
  label,
  index,
  value,
  color,
  icon,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
    <div>
      <div
        style={{
          fontSize: 13,
          color: DSA_COLORS.ui.textMuted,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            color: DSA_COLORS.ui.textMuted,
          }}
        >
          [{index}]
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            color: color,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  </div>
);

export default FastSlowPointers;
