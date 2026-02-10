// @ts-nocheck
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrayHighlight } from '../types';
import { DSA_COLORS, DSA_DIMENSIONS, DSA_SPRINGS } from '../constants';

interface ArrayCellProps {
  value: string | number;
  index: number;
  highlight?: ArrayHighlight;
  showIndex?: boolean;
  color?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  animationDelay?: number;
  animation?: 'enter' | 'pulse' | 'shake' | 'bounce' | 'none';
  style?: React.CSSProperties;
  compareGlow?: number; // 0-1 for compare animation intensity
  swapTransform?: { x: number; y: number; scale: number };
}

export const ArrayCell: React.FC<ArrayCellProps> = ({
  value,
  index,
  highlight = 'none',
  showIndex = true,
  color,
  label,
  size = 'medium',
  animationDelay = 0,
  animation = 'enter',
  style,
  compareGlow = 0,
  swapTransform,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, fontSize: 16, indexFontSize: 10 },
    medium: { width: 60, height: 60, fontSize: 20, indexFontSize: 12 },
    large: { width: 80, height: 80, fontSize: 26, indexFontSize: 14 },
  }[size];

  // Get highlight color
  const getHighlightColor = (): string => {
    if (color) return color;
    if (highlight === 'none') return DSA_COLORS.cell.default;
    return DSA_COLORS.cell[highlight] || DSA_COLORS.cell.default;
  };

  // Get border color
  const getBorderColor = (): string => {
    if (highlight === 'none') return DSA_COLORS.cell.border;
    return getHighlightColor();
  };

  // Animation calculations
  const enterProgress = animation === 'enter'
    ? spring({
        frame: frame - animationDelay,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  const pulseScale = animation === 'pulse'
    ? 1 + 0.08 * Math.sin((frame - animationDelay) * 0.3)
    : 1;

  const shakeX = animation === 'shake'
    ? interpolate(
        (frame - animationDelay) % 10,
        [0, 2, 4, 6, 8, 10],
        [0, -3, 3, -3, 3, 0],
        { extrapolateRight: 'clamp' }
      ) * Math.max(0, 1 - (frame - animationDelay) / 30)
    : 0;

  const bounceY = animation === 'bounce'
    ? -10 * Math.abs(Math.sin((frame - animationDelay) * 0.2)) *
      Math.max(0, 1 - (frame - animationDelay) / 40)
    : 0;

  // Combined transforms
  const baseScale = enterProgress * pulseScale;
  const opacity = interpolate(enterProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });

  // Apply swap transform if provided
  const transformX = (swapTransform?.x || 0) + shakeX;
  const transformY = (swapTransform?.y || 0) + bounceY;
  const finalScale = baseScale * (swapTransform?.scale || 1);

  // Glow effect for compare animation
  const glowStyle = compareGlow > 0
    ? {
        boxShadow: `0 0 ${20 * compareGlow}px ${10 * compareGlow}px ${getHighlightColor()}`,
      }
    : {};

  // Background gradient for highlighted cells
  const isHighlighted = highlight !== 'none';
  const bgStyle = isHighlighted
    ? {
        background: `linear-gradient(135deg, ${getHighlightColor()}dd, ${getHighlightColor()}99)`,
      }
    : {
        background: DSA_COLORS.cell.default,
      };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translate(${transformX}px, ${transformY}px) scale(${finalScale})`,
        opacity,
        ...style,
      }}
    >
      {/* Label above cell */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -24,
            fontSize: sizeConfig.indexFontSize + 2,
            fontWeight: 600,
            color: getHighlightColor(),
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}

      {/* Main cell */}
      <div
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderRadius: DSA_DIMENSIONS.cell.borderRadius,
          border: `2px solid ${getBorderColor()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
          color: DSA_COLORS.cell.text,
          transition: 'background 0.15s ease',
          ...bgStyle,
          ...glowStyle,
        }}
      >
        {value}
      </div>

      {/* Index below cell */}
      {showIndex && (
        <div
          style={{
            marginTop: 4,
            fontSize: sizeConfig.indexFontSize,
            color: DSA_COLORS.ui.textMuted,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {index}
        </div>
      )}
    </div>
  );
};

export default ArrayCell;
