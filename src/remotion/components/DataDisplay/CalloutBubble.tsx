// ============================================
// CALLOUT BUBBLE - Speech/thought bubble with pointer
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { CalloutBubbleProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const CalloutBubble: React.FC<CalloutBubbleProps> = ({
  text,
  icon,
  variant = 'speech',
  pointerDirection = 'bottom',
  accentColor,
  width = 320,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get variant-specific styles
  const getVariantConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          color: accentColor || DATA_DISPLAY_COLORS.orange,
          icon: icon || 'alert-triangle',
          bgOpacity: 0.15,
        };
      case 'tip':
        return {
          color: accentColor || DATA_DISPLAY_COLORS.green,
          icon: icon || 'lightbulb',
          bgOpacity: 0.12,
        };
      case 'thought':
        return {
          color: accentColor || DATA_DISPLAY_COLORS.purple,
          icon: icon || 'brain',
          bgOpacity: 0.1,
        };
      case 'speech':
      default:
        return {
          color: accentColor || DATA_DISPLAY_COLORS.cyan,
          icon: icon || 'message-circle',
          bgOpacity: 0.12,
        };
    }
  };

  const config = getVariantConfig();
  const color = config.color;
  const rgb = hexToRgb(color);

  // Animation
  const bubbleSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const bubbleOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const bubbleScale = animateIn
    ? interpolate(bubbleSpring, [0, 1], [0.8, 1])
    : 1;

  // Calculate origin based on pointer direction
  const getTransformOrigin = () => {
    switch (pointerDirection) {
      case 'top':
        return 'center top';
      case 'bottom':
        return 'center bottom';
      case 'left':
        return 'left center';
      case 'right':
        return 'right center';
      default:
        return 'center center';
    }
  };

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Pointer styles
  const getPointerStyles = (): React.CSSProperties => {
    const pointerSize = 16;
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    switch (pointerDirection) {
      case 'top':
        return {
          ...base,
          top: -pointerSize,
          left: '50%',
          marginLeft: -pointerSize,
          borderLeft: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid transparent`,
          borderBottom: `${pointerSize}px solid rgba(${rgb}, ${config.bgOpacity + 0.1})`,
        };
      case 'bottom':
        return {
          ...base,
          bottom: -pointerSize,
          left: '50%',
          marginLeft: -pointerSize,
          borderLeft: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid transparent`,
          borderTop: `${pointerSize}px solid rgba(${rgb}, ${config.bgOpacity + 0.1})`,
        };
      case 'left':
        return {
          ...base,
          left: -pointerSize,
          top: '50%',
          marginTop: -pointerSize,
          borderTop: `${pointerSize}px solid transparent`,
          borderBottom: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid rgba(${rgb}, ${config.bgOpacity + 0.1})`,
        };
      case 'right':
        return {
          ...base,
          right: -pointerSize,
          top: '50%',
          marginTop: -pointerSize,
          borderTop: `${pointerSize}px solid transparent`,
          borderBottom: `${pointerSize}px solid transparent`,
          borderLeft: `${pointerSize}px solid rgba(${rgb}, ${config.bgOpacity + 0.1})`,
        };
      default:
        return base;
    }
  };

  // Thought bubble circles
  const renderThoughtCircles = () => {
    if (variant !== 'thought') return null;

    const circlePositions = [
      { size: 12, offset: 20 },
      { size: 8, offset: 35 },
      { size: 5, offset: 48 },
    ];

    const getCirclePos = (idx: number) => {
      const { size, offset } = circlePositions[idx];
      switch (pointerDirection) {
        case 'top':
          return { bottom: `calc(100% + ${offset}px)`, left: '50%', marginLeft: -size / 2 };
        case 'bottom':
          return { top: `calc(100% + ${offset}px)`, left: '50%', marginLeft: -size / 2 };
        case 'left':
          return { right: `calc(100% + ${offset}px)`, top: '50%', marginTop: -size / 2 };
        case 'right':
          return { left: `calc(100% + ${offset}px)`, top: '50%', marginTop: -size / 2 };
        default:
          return {};
      }
    };

    return circlePositions.map((circle, idx) => (
      <div
        key={idx}
        style={{
          position: 'absolute',
          width: circle.size,
          height: circle.size,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.3)`,
          border: `1px solid ${color}50`,
          ...getCirclePos(idx),
        }}
      />
    ));
  };

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        position: 'relative',
        opacity: bubbleOpacity,
        transform: `scale(${bubbleScale})`,
        transformOrigin: getTransformOrigin(),
        ...positionStyles,
        ...style,
      }}
    >
      {/* Main bubble */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: variant === 'thought' ? 24 : 16,
          background: `rgba(${rgb}, ${config.bgOpacity})`,
          border: `2px solid ${color}60`,
          boxShadow: `
            0 0 20px rgba(${rgb}, 0.2),
            0 0 40px rgba(${rgb}, 0.1),
            inset 0 0 20px rgba(${rgb}, 0.05)
          `,
          position: 'relative',
        }}
      >
        {/* Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icon */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: variant === 'thought' ? '50%' : 8,
              background: `rgba(${rgb}, 0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${color}40`,
            }}
          >
            {renderIcon(config.icon, 18, color)}
          </div>

          {/* Text */}
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 15,
              lineHeight: 1.6,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
              flex: 1,
            }}
          >
            {text}
          </p>
        </div>

        {/* Pointer (for speech variant) */}
        {variant === 'speech' && <div style={getPointerStyles()} />}
      </div>

      {/* Thought circles */}
      {renderThoughtCircles()}
    </div>
  );
};

export default CalloutBubble;
