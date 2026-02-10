// ============================================
// MENTAL MODEL CARD - Analogy visualization
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { MentalModelCardProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const MentalModelCard: React.FC<MentalModelCardProps> = ({
  title,
  analogy,
  explanation,
  icon,
  accentColor = DATA_DISPLAY_COLORS.purple,
  width = 450,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rgb = hexToRgb(accentColor);

  // Animation
  const cardSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const cardOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const cardScale = animateIn
    ? interpolate(cardSpring, [0, 1], [0.95, 1])
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Staggered content animations
  const analogyDelay = animationDelay + 15;
  const analogyOpacity = interpolate(
    frame,
    [analogyDelay, analogyDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const explanationDelay = animationDelay + 30;
  const explanationOpacity = interpolate(
    frame,
    [explanationDelay, explanationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        borderRadius: 20,
        background: `linear-gradient(135deg, rgba(${rgb}, 0.1), ${DATA_DISPLAY_COLORS.cardBg})`,
        border: `2px solid ${accentColor}40`,
        boxShadow: `
          0 0 40px rgba(${rgb}, 0.15),
          inset 0 0 40px rgba(${rgb}, 0.05)
        `,
        overflow: 'hidden',
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Header with icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 24px',
          background: `linear-gradient(90deg, rgba(${rgb}, 0.15), transparent)`,
          borderBottom: `1px solid ${accentColor}30`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.1))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${accentColor}60`,
            boxShadow: `0 0 20px rgba(${rgb}, 0.3)`,
          }}
        >
          {icon ? renderIcon(icon, 28, accentColor) : renderIcon('brain', 28, accentColor)}
        </div>

        {/* Title */}
        <div>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Mental Model
          </span>
          <h3
            style={{
              fontFamily: FONTS.heading,
              fontSize: 20,
              fontWeight: 700,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
              marginTop: 4,
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Analogy section */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${DATA_DISPLAY_COLORS.textDim}20`,
          opacity: analogyOpacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `rgba(${rgb}, 0.1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {renderIcon('lightbulb', 16, accentColor)}
          </div>
          <div>
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                color: DATA_DISPLAY_COLORS.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Think of it like
            </span>
            <p
              style={{
                fontFamily: FONTS.heading,
                fontSize: 18,
                fontWeight: 600,
                color: accentColor,
                margin: 0,
                marginTop: 6,
                lineHeight: 1.4,
                fontStyle: 'italic',
              }}
            >
              "{analogy}"
            </p>
          </div>
        </div>
      </div>

      {/* Explanation section */}
      <div
        style={{
          padding: '20px 24px',
          opacity: explanationOpacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `rgba(${rgb}, 0.1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {renderIcon('arrow-right', 16, DATA_DISPLAY_COLORS.textMuted)}
          </div>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentalModelCard;
