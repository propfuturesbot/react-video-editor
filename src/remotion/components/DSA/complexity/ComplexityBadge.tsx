import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, COMPLEXITY_COLORS } from '../constants';

interface ComplexityBadgeProps {
  complexity: string;
  type: 'time' | 'space';
  label?: string;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

// Complexity descriptions
const complexityDescriptions: Record<string, string> = {
  'O(1)': 'Constant - Independent of input size',
  'O(log n)': 'Logarithmic - Halves input each step',
  'O(n)': 'Linear - Proportional to input size',
  'O(n log n)': 'Linearithmic - Efficient divide & conquer',
  'O(n²)': 'Quadratic - Nested iterations',
  'O(n³)': 'Cubic - Triple nested loops',
  'O(2^n)': 'Exponential - Doubles each step',
  'O(n!)': 'Factorial - All permutations',
};

// Complexity ratings
const complexityRatings: Record<string, { rating: string; emoji: string }> = {
  'O(1)': { rating: 'Excellent', emoji: '🚀' },
  'O(log n)': { rating: 'Great', emoji: '⚡' },
  'O(n)': { rating: 'Good', emoji: '✅' },
  'O(n log n)': { rating: 'Acceptable', emoji: '👍' },
  'O(n²)': { rating: 'Fair', emoji: '⚠️' },
  'O(n³)': { rating: 'Poor', emoji: '🐢' },
  'O(2^n)': { rating: 'Bad', emoji: '💥' },
  'O(n!)': { rating: 'Terrible', emoji: '☠️' },
};

export const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({
  complexity,
  type,
  label,
  showDescription = false,
  size = 'medium',
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const color = COMPLEXITY_COLORS[complexity] || DSA_COLORS.ui.text;
  const description = complexityDescriptions[complexity] || '';
  const rating = complexityRatings[complexity] || { rating: 'Unknown', emoji: '❓' };

  // Size configurations
  const sizeConfig = {
    small: { fontSize: 14, padding: '6px 12px', iconSize: 16 },
    medium: { fontSize: 18, padding: '10px 20px', iconSize: 20 },
    large: { fontSize: 24, padding: '14px 28px', iconSize: 28 },
  }[size];

  // Animation
  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  const displayLabel = label || (type === 'time' ? 'Time' : 'Space');
  const typeIcon = type === 'time' ? '⏱️' : '💾';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transform: `scale(${progress})`,
        opacity: progress,
        ...style,
      }}
    >
      {/* Main badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: sizeConfig.padding,
          background: `${color}15`,
          borderRadius: 12,
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        {/* Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: sizeConfig.iconSize }}>{typeIcon}</span>
          <span
            style={{
              fontSize: sizeConfig.fontSize * 0.7,
              color: DSA_COLORS.ui.textMuted,
              fontWeight: 500,
            }}
          >
            {displayLabel} Complexity
          </span>
        </div>

        {/* Complexity value */}
        <div
          style={{
            fontSize: sizeConfig.fontSize,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            color: color,
          }}
        >
          {complexity}
        </div>

        {/* Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: sizeConfig.iconSize * 0.8 }}>
            {rating.emoji}
          </span>
          <span
            style={{
              fontSize: sizeConfig.fontSize * 0.6,
              fontWeight: 600,
              color: color,
            }}
          >
            {rating.rating}
          </span>
        </div>
      </div>

      {/* Description */}
      {showDescription && description && (
        <div
          style={{
            fontSize: sizeConfig.fontSize * 0.6,
            color: DSA_COLORS.ui.textMuted,
            textAlign: 'center',
            maxWidth: 200,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
};

// ============================================
// Combined Time & Space Badge
// ============================================

interface ComplexityPairProps {
  timeComplexity: string;
  spaceComplexity: string;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const ComplexityPair: React.FC<ComplexityPairProps> = ({
  timeComplexity,
  spaceComplexity,
  showDescription = false,
  size = 'medium',
  layout = 'horizontal',
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: 20,
        padding: '16px 24px',
        background: DSA_COLORS.ui.card,
        borderRadius: 12,
        border: `1px solid ${DSA_COLORS.ui.border}`,
        opacity: progress,
        ...style,
      }}
    >
      <ComplexityBadge
        complexity={timeComplexity}
        type="time"
        showDescription={showDescription}
        size={size}
        animated={animated}
        animationStartFrame={animationStartFrame}
      />

      {layout === 'horizontal' && (
        <div
          style={{
            width: 1,
            height: 60,
            background: DSA_COLORS.ui.border,
          }}
        />
      )}

      <ComplexityBadge
        complexity={spaceComplexity}
        type="space"
        showDescription={showDescription}
        size={size}
        animated={animated}
        animationStartFrame={animationStartFrame + 10}
      />
    </div>
  );
};

// ============================================
// Inline Complexity Tag
// ============================================

interface ComplexityTagProps {
  complexity: string;
  type?: 'time' | 'space';
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const ComplexityTag: React.FC<ComplexityTagProps> = ({
  complexity,
  type,
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const color = COMPLEXITY_COLORS[complexity] || DSA_COLORS.ui.text;

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        background: `${color}20`,
        borderRadius: 6,
        border: `1px solid ${color}`,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'JetBrains Mono, monospace',
        color: color,
        transform: `scale(${progress})`,
        opacity: progress,
        ...style,
      }}
    >
      {type && (
        <span style={{ fontSize: 12 }}>
          {type === 'time' ? '⏱️' : '💾'}
        </span>
      )}
      {complexity}
    </span>
  );
};

export default ComplexityBadge;
