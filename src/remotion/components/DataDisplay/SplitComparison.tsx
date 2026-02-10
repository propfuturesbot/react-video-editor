// ============================================
// SPLIT COMPARISON - Vertical divider with sliding animation
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SplitComparisonProps, SplitComparisonItem } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const SplitComparison: React.FC<SplitComparisonProps> = ({
  title,
  leftLabel,
  rightLabel,
  leftItems = [],
  rightItems = [],
  leftColor = DATA_DISPLAY_COLORS.red,
  rightColor = DATA_DISPLAY_COLORS.green,
  dividerPosition = 50,
  width = 900,
  height = 500,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftRgb = hexToRgb(leftColor);
  const rightRgb = hexToRgb(rightColor);

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Animated divider position
  const animatedPosition = interpolate(
    frame,
    [animationDelay + 20, animationDelay + 50],
    [0, dividerPosition],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const contentHeight = title ? height - 60 : height;

  // Label animations
  const leftLabelDelay = animationDelay + 30;
  const rightLabelDelay = animationDelay + 35;

  const leftLabelOpacity = interpolate(
    frame,
    [leftLabelDelay, leftLabelDelay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rightLabelOpacity = interpolate(
    frame,
    [rightLabelDelay, rightLabelDelay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Render a single item
  const renderItem = (item: SplitComparisonItem, index: number, color: string, side: 'left' | 'right') => {
    const itemDelay = animationDelay + 50 + index * 8;
    const itemOpacity = interpolate(
      frame,
      [itemDelay, itemDelay + 15],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const itemTranslateX = interpolate(
      frame,
      [itemDelay, itemDelay + 15],
      [side === 'left' ? -20 : 20, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const rgb = hexToRgb(color);

    return (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 16px',
          marginBottom: 8,
          borderRadius: 10,
          background: `rgba(${rgb}, 0.1)`,
          border: `1px solid ${color}30`,
          opacity: itemOpacity,
          transform: `translateX(${itemTranslateX}px)`,
        }}
      >
        {item.icon && (
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            {renderIcon(item.icon, 20, color)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 15,
              fontWeight: 600,
              color: DATA_DISPLAY_COLORS.text,
              marginBottom: item.description ? 4 : 0,
            }}
          >
            {item.text}
          </div>
          {item.description && (
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 13,
                color: DATA_DISPLAY_COLORS.textMuted,
                lineHeight: 1.4,
              }}
            >
              {item.description}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        opacity: containerOpacity,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: 28,
            fontWeight: 700,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            marginBottom: 24,
            textAlign: 'center',
            opacity: interpolate(
              frame,
              [animationDelay, animationDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}
        >
          {title}
        </h2>
      )}

      {/* Comparison container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: contentHeight,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Left side */}
        <div
          style={{
            flex: 1,
            padding: 20,
            paddingTop: 60,
            background: `linear-gradient(135deg, rgba(${leftRgb}, 0.15), rgba(${leftRgb}, 0.05))`,
            borderRight: `2px solid ${DATA_DISPLAY_COLORS.textDim}20`,
            overflow: 'auto',
          }}
        >
          {/* Left label */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              padding: '10px 20px',
              borderRadius: 10,
              background: `rgba(${leftRgb}, 0.25)`,
              border: `2px solid ${leftColor}60`,
              opacity: leftLabelOpacity,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.heading,
                fontSize: 16,
                fontWeight: 700,
                color: leftColor,
              }}
            >
              {leftLabel}
            </span>
          </div>

          {/* Left items */}
          <div style={{ marginTop: 10 }}>
            {leftItems.map((item, index) => renderItem(item, index, leftColor, 'left'))}
          </div>
        </div>

        {/* Right side */}
        <div
          style={{
            flex: 1,
            padding: 20,
            paddingTop: 60,
            background: `linear-gradient(225deg, rgba(${rightRgb}, 0.15), rgba(${rightRgb}, 0.05))`,
            overflow: 'auto',
          }}
        >
          {/* Right label */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: '10px 20px',
              borderRadius: 10,
              background: `rgba(${rightRgb}, 0.25)`,
              border: `2px solid ${rightColor}60`,
              opacity: rightLabelOpacity,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.heading,
                fontSize: 16,
                fontWeight: 700,
                color: rightColor,
              }}
            >
              {rightLabel}
            </span>
          </div>

          {/* Right items */}
          <div style={{ marginTop: 10 }}>
            {rightItems.map((item, index) => renderItem(item, index, rightColor, 'right'))}
          </div>
        </div>

        {/* Center divider with VS badge */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '12px 24px',
            borderRadius: 30,
            background: DATA_DISPLAY_COLORS.cardBg,
            border: `3px solid ${DATA_DISPLAY_COLORS.textDim}50`,
            boxShadow: `0 0 30px rgba(0,0,0,0.5)`,
            zIndex: 10,
            opacity: interpolate(
              frame,
              [animationDelay + 40, animationDelay + 55],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}
        >
          <span
            style={{
              fontFamily: FONTS.heading,
              fontSize: 16,
              fontWeight: 800,
              color: DATA_DISPLAY_COLORS.text,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            VS
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplitComparison;
