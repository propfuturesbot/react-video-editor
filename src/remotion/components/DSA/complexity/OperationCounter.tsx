import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS } from '../constants';

interface OperationCounterProps {
  operations: OperationCount[];
  showTotal?: boolean;
  showFormula?: boolean;
  formula?: string;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical' | 'grid';
  animated?: boolean;
  animationStartFrame?: number;
  incrementFrame?: number;
  incrementOperation?: string;
  style?: React.CSSProperties;
}

interface OperationCount {
  name: string;
  count: number;
  icon?: string;
  color?: string;
}

export const OperationCounter: React.FC<OperationCounterProps> = ({
  operations,
  showTotal = true,
  showFormula = false,
  formula,
  size = 'medium',
  layout = 'horizontal',
  animated = true,
  animationStartFrame = 0,
  incrementFrame,
  incrementOperation,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Size configurations
  const sizeConfig = {
    small: { fontSize: 14, counterSize: 28, iconSize: 16, padding: 12 },
    medium: { fontSize: 16, counterSize: 36, iconSize: 20, padding: 16 },
    large: { fontSize: 20, counterSize: 48, iconSize: 26, padding: 20 },
  }[size];

  // Animation progress
  const entranceProgress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  // Increment animation
  const getIncrementEffect = (opName: string) => {
    if (!incrementFrame || incrementOperation !== opName) return { scale: 1, glow: 0 };

    const elapsed = frame - incrementFrame;
    if (elapsed < 0 || elapsed > 30) return { scale: 1, glow: 0 };

    const scale = interpolate(elapsed, [0, 8, 30], [1, 1.3, 1], {
      extrapolateRight: 'clamp',
    });
    const glow = interpolate(elapsed, [0, 8, 30], [0, 1, 0], {
      extrapolateRight: 'clamp',
    });

    return { scale, glow };
  };

  // Calculate total
  const total = operations.reduce((sum, op) => sum + op.count, 0);

  // Default icons
  const getDefaultIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('compar')) return '⚖️';
    if (lower.includes('swap')) return '🔄';
    if (lower.includes('assign')) return '📝';
    if (lower.includes('access')) return '📊';
    if (lower.includes('insert')) return '➕';
    if (lower.includes('delete')) return '➖';
    if (lower.includes('search')) return '🔍';
    if (lower.includes('call')) return '📞';
    return '📌';
  };

  // Layout styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    flexWrap: layout === 'grid' ? 'wrap' : 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeConfig.padding,
    padding: sizeConfig.padding,
    background: DSA_COLORS.ui.card,
    borderRadius: 12,
    border: `1px solid ${DSA_COLORS.ui.border}`,
    opacity: entranceProgress,
    transform: `scale(${0.9 + 0.1 * entranceProgress})`,
    ...style,
  };

  return (
    <div style={containerStyle}>
      {/* Operation counters */}
      {operations.map((op, index) => {
        const icon = op.icon || getDefaultIcon(op.name);
        const color = op.color || DSA_COLORS.syntax.number;
        const { scale, glow } = getIncrementEffect(op.name);

        return (
          <div
            key={op.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              transform: `scale(${scale})`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: sizeConfig.iconSize }}>{icon}</span>

            {/* Counter */}
            <div
              style={{
                minWidth: sizeConfig.counterSize * 1.5,
                height: sizeConfig.counterSize,
                borderRadius: 8,
                background: `${color}20`,
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: sizeConfig.fontSize * 1.3,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: color,
                boxShadow: glow > 0 ? `0 0 ${15 * glow}px ${color}60` : 'none',
              }}
            >
              {op.count}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: sizeConfig.fontSize * 0.75,
                color: DSA_COLORS.ui.textMuted,
                fontWeight: 500,
              }}
            >
              {op.name}
            </span>
          </div>
        );
      })}

      {/* Divider */}
      {(showTotal || showFormula) && operations.length > 0 && (
        <div
          style={{
            width: layout === 'vertical' ? '80%' : 1,
            height: layout === 'vertical' ? 1 : 50,
            background: DSA_COLORS.ui.border,
            margin: layout === 'vertical' ? '8px 0' : '0 8px',
          }}
        />
      )}

      {/* Total */}
      {showTotal && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: sizeConfig.iconSize }}>📊</span>
          <div
            style={{
              minWidth: sizeConfig.counterSize * 2,
              height: sizeConfig.counterSize,
              borderRadius: 8,
              background: `${DSA_COLORS.ui.success}20`,
              border: `2px solid ${DSA_COLORS.ui.success}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: sizeConfig.fontSize * 1.4,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.ui.success,
            }}
          >
            {total}
          </div>
          <span
            style={{
              fontSize: sizeConfig.fontSize * 0.75,
              color: DSA_COLORS.ui.textMuted,
              fontWeight: 600,
            }}
          >
            Total Ops
          </span>
        </div>
      )}

      {/* Formula */}
      {showFormula && formula && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '8px 16px',
            background: DSA_COLORS.ui.background,
            borderRadius: 8,
          }}
        >
          <span
            style={{
              fontSize: sizeConfig.fontSize * 0.7,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            Complexity
          </span>
          <span
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: DSA_COLORS.syntax.keyword,
            }}
          >
            {formula}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================
// Simple Counter
// ============================================

interface SimpleCounterProps {
  label: string;
  value: number;
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const SimpleCounter: React.FC<SimpleCounterProps> = ({
  label,
  value,
  icon,
  color = DSA_COLORS.syntax.number,
  size = 'medium',
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizeConfig = {
    small: { fontSize: 14, height: 28 },
    medium: { fontSize: 18, height: 36 },
    large: { fontSize: 24, height: 48 },
  }[size];

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px',
        background: DSA_COLORS.ui.card,
        borderRadius: 8,
        border: `1px solid ${DSA_COLORS.ui.border}`,
        transform: `scale(${progress})`,
        opacity: progress,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: sizeConfig.fontSize }}>{icon}</span>}
      <span
        style={{
          fontSize: sizeConfig.fontSize * 0.8,
          color: DSA_COLORS.ui.textMuted,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: color,
        }}
      >
        {value}
      </span>
    </div>
  );
};

// ============================================
// Step Counter
// ============================================

interface StepCounterProps {
  current: number;
  total?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  current,
  total,
  label = 'Step',
  size = 'medium',
  showProgress = true,
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sizeConfig = {
    small: { fontSize: 14, barHeight: 4 },
    medium: { fontSize: 18, barHeight: 6 },
    large: { fontSize: 24, barHeight: 8 },
  }[size];

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  const percentage = total ? (current / total) * 100 : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        background: DSA_COLORS.ui.card,
        borderRadius: 10,
        border: `1px solid ${DSA_COLORS.ui.border}`,
        opacity: progress,
        ...style,
      }}
    >
      {/* Step display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: sizeConfig.fontSize * 0.8,
            color: DSA_COLORS.ui.textMuted,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: sizeConfig.fontSize * 1.5,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            color: DSA_COLORS.syntax.number,
          }}
        >
          {current}
        </span>
        {total && (
          <span
            style={{
              fontSize: sizeConfig.fontSize * 0.9,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            / {total}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {showProgress && total && (
        <div
          style={{
            width: 120,
            height: sizeConfig.barHeight,
            background: DSA_COLORS.ui.border,
            borderRadius: sizeConfig.barHeight / 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: DSA_COLORS.cell.current,
              borderRadius: sizeConfig.barHeight / 2,
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OperationCounter;
