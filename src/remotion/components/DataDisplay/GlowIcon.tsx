// ============================================
// GLOW ICON - Reusable icon in a glowing box
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GlowIconProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

// Helper to detect if string is emoji vs icon name
const isEmoji = (str: string): boolean => {
  // Check for emoji characters using Unicode property escapes
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str) && str.length <= 4;
};

export const GlowIcon: React.FC<GlowIconProps> = ({
  icon,
  color,
  size = 48,
  iconScale = 0.6,
  variant = 'box',
  glowIntensity = 0.3,
  style = {},
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation
  const springValue = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const opacity = interpolate(
    frame,
    [animationDelay, animationDelay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(springValue, [0, 1], [0.3, 1]);

  const rgb = hexToRgb(color);
  const borderRadius = variant === 'circle' ? '50%' : size * 0.25;

  // Render icon content based on type
  const renderIconContent = () => {
    // If it's already a React node (not a string), render directly
    if (typeof icon !== 'string') {
      return icon;
    }

    // If it's an emoji, render as text
    if (isEmoji(icon)) {
      return (
        <span style={{ fontSize: size * iconScale, lineHeight: 1 }}>
          {icon}
        </span>
      );
    }

    // Otherwise, treat as Lucide icon name
    return renderIcon(icon, size * iconScale, color);
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius,
        background: `rgba(${rgb}, 0.15)`,
        border: `1px solid ${color}`,
        boxShadow: `
          0 0 ${15 * glowIntensity}px rgba(${rgb}, ${glowIntensity}),
          0 0 ${30 * glowIntensity}px rgba(${rgb}, ${glowIntensity * 0.5}),
          inset 0 0 ${15 * glowIntensity}px rgba(${rgb}, ${glowIntensity * 0.2})
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {renderIconContent()}
    </div>
  );
};

// Variant with label below
interface GlowIconWithLabelProps extends GlowIconProps {
  label?: string;
  labelColor?: string;
  labelSize?: number;
}

export const GlowIconWithLabel: React.FC<GlowIconWithLabelProps> = ({
  label,
  labelColor = DATA_DISPLAY_COLORS.text,
  labelSize = 12,
  ...iconProps
}) => {
  const frame = useCurrentFrame();
  const { animationDelay = 0 } = iconProps;

  const labelOpacity = interpolate(
    frame,
    [animationDelay + 10, animationDelay + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <GlowIcon {...iconProps} />
      {label && (
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: labelSize,
            fontWeight: 500,
            color: labelColor,
            opacity: labelOpacity,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default GlowIcon;
