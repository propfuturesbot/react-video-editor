// ============================================
// BEST PRACTICE STAMP - Green checkmark approval
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BestPracticeStampProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const BestPracticeStamp: React.FC<BestPracticeStampProps> = ({
  label = 'Best Practice',
  variant = 'approved',
  size = 'medium',
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

  // Size config
  const sizeConfig = {
    small: { container: 80, icon: 24, font: 10 },
    medium: { container: 120, icon: 36, font: 12 },
    large: { container: 160, icon: 48, font: 14 },
  }[size];

  // Variant config
  const getVariantConfig = () => {
    switch (variant) {
      case 'certified':
        return {
          color: DATA_DISPLAY_COLORS.purple,
          icon: 'award',
          text: label,
        };
      case 'recommended':
        return {
          color: DATA_DISPLAY_COLORS.cyan,
          icon: 'thumbs-up',
          text: label,
        };
      case 'approved':
      default:
        return {
          color: DATA_DISPLAY_COLORS.green,
          icon: 'badge-check',
          text: label,
        };
    }
  };

  const config = getVariantConfig();
  const color = config.color;
  const rgb = hexToRgb(color);

  const containerSize = width || sizeConfig.container;

  // Animation
  const stampSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 8, mass: 0.3, stiffness: 200 },
  });

  const stampOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 10],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const stampScale = animateIn
    ? interpolate(stampSpring, [0, 1], [1.5, 1])
    : 1;

  const stampRotation = animateIn
    ? interpolate(stampSpring, [0, 1], [-15, 0])
    : 0;

  // Glow pulse
  const pulsePhase = (frame - animationDelay) * 0.08;
  const glowIntensity = 0.4 + Math.sin(pulsePhase) * 0.1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - containerSize / 2, top: y }
      : {};

  return (
    <div
      style={{
        width: containerSize,
        height: height || containerSize,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: stampOpacity,
        transform: `scale(${stampScale}) rotate(${stampRotation}deg)`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Stamp circle */}
      <div
        style={{
          width: containerSize * 0.7,
          height: containerSize * 0.7,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, rgba(${rgb}, 0.3), rgba(${rgb}, 0.1))`,
          border: `3px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 ${30 * glowIntensity}px rgba(${rgb}, ${glowIntensity}),
            0 0 ${60 * glowIntensity}px rgba(${rgb}, ${glowIntensity * 0.5}),
            inset 0 0 20px rgba(${rgb}, 0.2)
          `,
          position: 'relative',
        }}
      >
        {/* Inner ring */}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: '50%',
            border: `2px dashed ${color}60`,
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderIcon(config.icon, sizeConfig.icon, color)}
        </div>

        {/* Shine effect */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '30%',
            height: '30%',
            background: `linear-gradient(135deg, rgba(255,255,255,0.3), transparent)`,
            borderRadius: '50%',
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: FONTS.heading,
          fontSize: sizeConfig.font,
          fontWeight: 700,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: 1,
          textShadow: `0 0 10px rgba(${rgb}, 0.5)`,
        }}
      >
        {config.text}
      </span>
    </div>
  );
};

export default BestPracticeStamp;
