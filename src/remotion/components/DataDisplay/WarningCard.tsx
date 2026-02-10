// ============================================
// WARNING CARD - Anti-pattern with red glow/shake
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { WarningCardProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const WarningCard: React.FC<WarningCardProps> = ({
  title = 'Warning',
  message,
  severity = 'warning',
  icon,
  shake = true,
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

  // Severity colors
  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          color: DATA_DISPLAY_COLORS.red,
          icon: icon || 'alert-octagon',
          bgOpacity: 0.2,
        };
      case 'error':
        return {
          color: '#FF6B6B',
          icon: icon || 'x-circle',
          bgOpacity: 0.15,
        };
      case 'warning':
      default:
        return {
          color: DATA_DISPLAY_COLORS.orange,
          icon: icon || 'alert-triangle',
          bgOpacity: 0.12,
        };
    }
  };

  const config = getSeverityConfig();
  const color = config.color;
  const rgb = hexToRgb(color);

  // Container animation
  const cardSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const cardOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const cardScale = animateIn
    ? interpolate(cardSpring, [0, 1], [0.9, 1])
    : 1;

  // Shake animation
  const shakeIntensity = shake && frame > animationDelay + 20
    ? Math.sin((frame - animationDelay) * 0.8) * 2 * Math.exp(-(frame - animationDelay - 20) * 0.05)
    : 0;

  // Pulsing glow
  const pulsePhase = (frame - animationDelay) * 0.1;
  const glowIntensity = 0.3 + Math.sin(pulsePhase) * 0.1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        padding: 20,
        borderRadius: 14,
        background: `rgba(${rgb}, ${config.bgOpacity})`,
        border: `2px solid ${color}`,
        boxShadow: `
          0 0 ${30 * glowIntensity}px rgba(${rgb}, ${glowIntensity}),
          0 0 ${60 * glowIntensity}px rgba(${rgb}, ${glowIntensity * 0.5}),
          inset 0 0 20px rgba(${rgb}, 0.1)
        `,
        opacity: cardOpacity,
        transform: `scale(${cardScale}) translateX(${shakeIntensity}px)`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        {/* Icon with pulse */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `rgba(${rgb}, 0.25)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${color}60`,
            boxShadow: `0 0 ${15 * glowIntensity}px rgba(${rgb}, ${glowIntensity})`,
          }}
        >
          {renderIcon(config.icon, 24, color)}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: FONTS.heading,
            fontSize: 24,  // Larger for visibility
            fontWeight: 700,
            color: color,
            margin: 0,
            textShadow: `0 0 10px rgba(${rgb}, 0.5)`,
          }}
        >
          {title}
        </h3>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          marginBottom: 16,
          borderRadius: 1,
          opacity: 0.5,
        }}
      />

      {/* Message */}
      <p
        style={{
          fontFamily: FONTS.body,
          fontSize: 18,  // Larger for readability
          lineHeight: 1.7,
          color: DATA_DISPLAY_COLORS.text,
          margin: 0,
        }}
      >
        {message}
      </p>

      {/* Corner decoration */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '30px solid transparent',
          borderTop: `30px solid ${color}40`,
          borderTopRightRadius: 12,
        }}
      />
    </div>
  );
};

export default WarningCard;
