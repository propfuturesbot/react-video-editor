// ============================================
// BEFORE AFTER TOGGLE - Comparison slider
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BeforeAfterToggleProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

export const BeforeAfterToggle: React.FC<BeforeAfterToggleProps> = ({
  title,
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeContent,
  afterContent,
  splitPosition,
  orientation = 'horizontal',
  width = 700,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isHorizontal = orientation === 'horizontal';

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Animated split position
  const animatedSplit =
    splitPosition !== undefined
      ? splitPosition
      : interpolate(
          frame,
          [animationDelay + 30, animationDelay + 90],
          [10, 50],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  const beforeColor = DATA_DISPLAY_COLORS.red;
  const afterColor = DATA_DISPLAY_COLORS.green;
  const beforeRgb = hexToRgb(beforeColor);
  const afterRgb = hexToRgb(afterColor);

  const contentHeight = title ? height - 60 : height;

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
            fontSize: 24,
            fontWeight: 700,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            marginBottom: 20,
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
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Before side */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: isHorizontal ? `${animatedSplit}%` : '100%',
            height: isHorizontal ? '100%' : `${animatedSplit}%`,
            overflow: 'hidden',
            background: `${DATA_DISPLAY_COLORS.cardBg}`,
          }}
        >
          <div
            style={{
              width: isHorizontal ? `${(100 / animatedSplit) * 100}%` : '100%',
              height: isHorizontal ? '100%' : `${(100 / animatedSplit) * 100}%`,
            }}
          >
            {beforeContent}
          </div>

          {/* Before label */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '6px 12px',
              borderRadius: 6,
              background: `rgba(${beforeRgb}, 0.2)`,
              border: `1px solid ${beforeColor}60`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                fontWeight: 600,
                color: beforeColor,
              }}
            >
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* After side */}
        <div
          style={{
            position: 'absolute',
            top: isHorizontal ? 0 : `${animatedSplit}%`,
            left: isHorizontal ? `${animatedSplit}%` : 0,
            right: 0,
            bottom: isHorizontal ? 0 : undefined,
            height: isHorizontal ? '100%' : `${100 - animatedSplit}%`,
            overflow: 'hidden',
            background: `${DATA_DISPLAY_COLORS.cardBgAlt}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: isHorizontal ? `-${(animatedSplit / (100 - animatedSplit)) * 100}%` : 0,
              width: isHorizontal ? `${(100 / (100 - animatedSplit)) * 100}%` : '100%',
              height: isHorizontal ? '100%' : `${(100 / (100 - animatedSplit)) * 100}%`,
            }}
          >
            {afterContent}
          </div>

          {/* After label */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '6px 12px',
              borderRadius: 6,
              background: `rgba(${afterRgb}, 0.2)`,
              border: `1px solid ${afterColor}60`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                fontWeight: 600,
                color: afterColor,
              }}
            >
              {afterLabel}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            top: isHorizontal ? 0 : `${animatedSplit}%`,
            left: isHorizontal ? `${animatedSplit}%` : 0,
            width: isHorizontal ? 4 : '100%',
            height: isHorizontal ? '100%' : 4,
            background: DATA_DISPLAY_COLORS.text,
            boxShadow: `0 0 20px ${DATA_DISPLAY_COLORS.text}`,
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: DATA_DISPLAY_COLORS.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${DATA_DISPLAY_COLORS.text}80`,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: `6px solid ${DATA_DISPLAY_COLORS.cardBg}`,
                }}
              />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: `6px solid ${DATA_DISPLAY_COLORS.cardBg}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterToggle;
