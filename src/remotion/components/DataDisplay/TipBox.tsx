// ============================================
// TIP BOX - Compact tip/note callout
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TipBoxProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const TipBox: React.FC<TipBoxProps> = ({
  title,
  text,
  icon,
  variant = 'tip',
  width = 700,  // Larger default for visual impact
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Variant configuration
  const getVariantConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          color: DATA_DISPLAY_COLORS.orange,
          icon: icon || 'alert-triangle',
          title: title || 'Warning',
          bgOpacity: 0.12,
        };
      case 'info':
        return {
          color: DATA_DISPLAY_COLORS.blue,
          icon: icon || 'info',
          title: title || 'Info',
          bgOpacity: 0.1,
        };
      case 'note':
        return {
          color: DATA_DISPLAY_COLORS.purple,
          icon: icon || 'bookmark',
          title: title || 'Note',
          bgOpacity: 0.1,
        };
      case 'tip':
      default:
        return {
          color: DATA_DISPLAY_COLORS.green,
          icon: icon || 'lightbulb',
          title: title || 'Pro Tip',
          bgOpacity: 0.12,
        };
    }
  };

  const config = getVariantConfig();
  const color = config.color;
  const rgb = hexToRgb(color);

  // Animation
  const boxSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const boxOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const boxScale = animateIn
    ? interpolate(boxSpring, [0, 1], [0.9, 1])
    : 1;

  // Glow animation
  const glowIntensity = interpolate(
    frame,
    [animationDelay + 15, animationDelay + 30],
    [0.2, 0.35],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Icon animation
  const iconOpacity = interpolate(
    frame,
    [animationDelay + 5, animationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const iconScale = interpolate(boxSpring, [0, 1], [0.5, 1]);

  // Text animation
  const textOpacity = interpolate(
    frame,
    [animationDelay + 10, animationDelay + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: 18,
        borderRadius: 14,
        background: `rgba(${rgb}, ${config.bgOpacity})`,
        border: `2px solid ${color}50`,
        boxShadow: `
          0 0 ${25 * glowIntensity}px rgba(${rgb}, ${glowIntensity}),
          0 0 ${50 * glowIntensity}px rgba(${rgb}, ${glowIntensity * 0.5}),
          inset 0 0 20px rgba(${rgb}, 0.05)
        `,
        opacity: boxOpacity,
        transform: `scale(${boxScale})`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56,  // Larger icon box
          height: 56,
          borderRadius: 12,
          background: `rgba(${rgb}, 0.2)`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: iconOpacity,
          transform: `scale(${iconScale})`,
          boxShadow: `0 0 20px rgba(${rgb}, 0.25)`,
        }}
      >
        {renderIcon(config.icon, 28, color)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, opacity: textOpacity }}>
        {/* Title */}
        <h4
          style={{
            fontFamily: FONTS.heading,
            fontSize: 22,  // Larger for visibility
            fontWeight: 700,
            color: color,
            margin: 0,
            marginBottom: 10,
            textShadow: `0 0 10px rgba(${rgb}, 0.3)`,
          }}
        >
          {config.title}
        </h4>

        {/* Text */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 18,  // Larger for readability
            lineHeight: 1.7,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>

      {/* Decorative corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          overflow: 'hidden',
          borderTopRightRadius: 12,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 60,
            height: 60,
            background: `linear-gradient(135deg, ${color}30, transparent)`,
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
};

export default TipBox;
