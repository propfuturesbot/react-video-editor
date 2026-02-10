// ============================================
// SECTION HEADER - Stylized section title with gradient
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SectionHeaderProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  accentColor = DATA_DISPLAY_COLORS.cyan,
  variant = 'gradient',
  alignment = 'center',
  width,
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
  const containerWidth = width || 800;

  // Animation
  const headerSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const headerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const headerScale = animateIn
    ? interpolate(headerSpring, [0, 1], [0.95, 1])
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - containerWidth / 2, top: y }
      : {};

  // Alignment
  const alignmentStyles: React.CSSProperties = {
    textAlign: alignment,
    alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
  };

  // Underline animation
  const underlineWidth = interpolate(
    frame,
    [animationDelay + 10, animationDelay + 35],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtitle animation
  const subtitleOpacity = interpolate(
    frame,
    [animationDelay + 20, animationDelay + 35],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Icon animation
  const iconOpacity = interpolate(
    frame,
    [animationDelay + 5, animationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const iconScale = interpolate(headerSpring, [0, 1], [0.5, 1]);

  // Render based on variant
  const renderTitle = () => {
    switch (variant) {
      case 'gradient':
        return (
          <h1
            style={{
              fontFamily: FONTS.heading,
              fontSize: 48,
              fontWeight: 800,
              margin: 0,
              background: `linear-gradient(135deg, ${accentColor}, ${DATA_DISPLAY_COLORS.purple}, ${DATA_DISPLAY_COLORS.pink})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: `drop-shadow(0 0 20px rgba(${rgb}, 0.3))`,
            }}
          >
            {title}
          </h1>
        );

      case 'underline':
        return (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                color: DATA_DISPLAY_COLORS.text,
                textShadow: `0 0 30px rgba(${rgb}, 0.2)`,
              }}
            >
              {title}
            </h1>
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                left: alignment === 'center' ? '50%' : alignment === 'right' ? 'auto' : 0,
                right: alignment === 'right' ? 0 : 'auto',
                transform: alignment === 'center' ? 'translateX(-50%)' : 'none',
                width: `${underlineWidth}%`,
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${accentColor}, ${DATA_DISPLAY_COLORS.purple})`,
                boxShadow: `0 0 15px rgba(${rgb}, 0.5)`,
              }}
            />
          </div>
        );

      case 'boxed':
        return (
          <div
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: 12,
              background: `linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.05))`,
              border: `2px solid ${accentColor}60`,
              boxShadow: `
                0 0 30px rgba(${rgb}, 0.2),
                inset 0 0 30px rgba(${rgb}, 0.05)
              `,
            }}
          >
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 44,
                fontWeight: 700,
                margin: 0,
                color: accentColor,
                textShadow: `0 0 20px rgba(${rgb}, 0.3)`,
              }}
            >
              {title}
            </h1>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: containerWidth,
        height: height || 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity: headerOpacity,
        transform: `scale(${headerScale})`,
        ...alignmentStyles,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `rgba(${rgb}, 0.15)`,
            border: `2px solid ${accentColor}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 25px rgba(${rgb}, 0.25)`,
            marginBottom: 8,
            opacity: iconOpacity,
            transform: `scale(${iconScale})`,
          }}
        >
          {renderIcon(icon, 30, accentColor)}
        </div>
      )}

      {/* Title */}
      {renderTitle()}

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 20,
            color: DATA_DISPLAY_COLORS.textMuted,
            margin: 0,
            marginTop: variant === 'underline' ? 16 : 4,
            opacity: subtitleOpacity,
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
