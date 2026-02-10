// ============================================
// GRADIENT CARD - Card with colorful gradient border glow
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GradientCardProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { GlowIcon } from './GlowIcon';

export const GradientCard: React.FC<GradientCardProps> = ({
  icon,
  title,
  description,
  borderColor,
  variant = 'default',
  iconSize = 64,  // Larger icon
  titleSize = 28,  // Larger title
  descriptionSize = 18,  // Larger description
  width = 800,  // Much larger default for visual impact
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation
  const springValue = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const opacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const translateY = animateIn
    ? interpolate(springValue, [0, 1], [30, 0])
    : 0;

  const scale = animateIn
    ? interpolate(springValue, [0, 1], [0.95, 1])
    : 1;

  const rgb = hexToRgb(borderColor);

  // Variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'minimal':
        return {
          background: 'transparent',
          border: `1px solid rgba(${rgb}, 0.3)`,
          boxShadow: `0 0 20px rgba(${rgb}, 0.1)`,
        };
      case 'filled':
        return {
          background: `linear-gradient(135deg, rgba(${rgb}, 0.2), rgba(${rgb}, 0.05))`,
          border: `2px solid ${borderColor}`,
          boxShadow: `
            0 0 30px rgba(${rgb}, 0.4),
            0 0 60px rgba(${rgb}, 0.2),
            inset 0 0 30px rgba(${rgb}, 0.1)
          `,
        };
      default: // 'default'
        return {
          background: DATA_DISPLAY_COLORS.cardBg,
          border: `2px solid ${borderColor}`,
          boxShadow: `
            0 0 20px rgba(${rgb}, 0.3),
            0 0 40px rgba(${rgb}, 0.15),
            inset 0 0 20px rgba(${rgb}, 0.05)
          `,
        };
    }
  };

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        borderRadius: 20,  // Larger border radius
        padding: 40,  // More padding for larger cards
        ...getVariantStyles(),
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Icon */}
      <GlowIcon
        icon={icon}
        color={borderColor}
        size={iconSize}
        variant="box"
        glowIntensity={0.35}
        animationDelay={animationDelay + 5}
        style={{ marginBottom: 24 }}
      />

      {/* Title */}
      <h4
        style={{
          fontFamily: FONTS.heading,
          fontSize: titleSize,
          fontWeight: 700,
          color: DATA_DISPLAY_COLORS.text,
          margin: 0,
          marginBottom: 16,
          textShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: descriptionSize,
          lineHeight: 1.8,
          color: DATA_DISPLAY_COLORS.textMuted,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
};

// Horizontal variant of the card
export const GradientCardHorizontal: React.FC<GradientCardProps> = ({
  icon,
  title,
  description,
  borderColor,
  variant = 'default',
  iconSize = 44,
  titleSize = 16,
  descriptionSize = 13,
  width = 400,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springValue = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const opacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const translateX = animateIn
    ? interpolate(springValue, [0, 1], [-30, 0])
    : 0;

  const rgb = hexToRgb(borderColor);

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        background: variant === 'filled'
          ? `linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.05))`
          : DATA_DISPLAY_COLORS.cardBg,
        border: `2px solid ${borderColor}`,
        boxShadow: `
          0 0 20px rgba(${rgb}, 0.25),
          0 0 40px rgba(${rgb}, 0.1),
          inset 0 0 20px rgba(${rgb}, 0.05)
        `,
        opacity,
        transform: `translateX(${translateX}px)`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Icon */}
      <GlowIcon
        icon={icon}
        color={borderColor}
        size={iconSize}
        variant="box"
        glowIntensity={0.25}
        animationDelay={animationDelay + 5}
      />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontFamily: FONTS.heading,
            fontSize: titleSize,
            fontWeight: 600,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            marginBottom: 4,
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: descriptionSize,
            lineHeight: 1.5,
            color: DATA_DISPLAY_COLORS.textMuted,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default GradientCard;
