// ============================================
// PROGRESSIVE DISCLOSURE - Blur to reveal animation
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ProgressiveDisclosureProps } from './types';
import { DATA_DISPLAY_COLORS, FONTS } from './constants';

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  content,
  blurAmount = 20,
  revealProgress,
  width = 600,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Calculate reveal progress
  const progress =
    revealProgress !== undefined
      ? revealProgress
      : interpolate(
          frame,
          [animationDelay + 30, animationDelay + 90],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  // Blur decreases as progress increases
  const currentBlur = blurAmount * (1 - progress);

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

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

      {/* Content container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: title ? height - 60 : height,
          borderRadius: 16,
          overflow: 'hidden',
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Content with blur */}
        <div
          style={{
            width: '100%',
            height: '100%',
            filter: `blur(${currentBlur}px)`,
            transition: 'filter 0.1s ease-out',
          }}
        >
          {content}
        </div>

        {/* Overlay gradient that fades out */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, transparent ${progress * 100}%, ${DATA_DISPLAY_COLORS.cardBg}80 100%)`,
            pointerEvents: 'none',
            opacity: 1 - progress,
          }}
        />

        {/* Reveal indicator */}
        {progress < 1 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              opacity: 1 - progress,
            }}
          >
            {/* Animated rings */}
            <div style={{ position: 'relative', width: 60, height: 60 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `2px solid ${DATA_DISPLAY_COLORS.cyan}`,
                  opacity: 0.3,
                  animation: 'pulse 2s infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 10,
                  borderRadius: '50%',
                  border: `2px solid ${DATA_DISPLAY_COLORS.cyan}`,
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 20,
                  borderRadius: '50%',
                  background: `${DATA_DISPLAY_COLORS.cyan}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    fontWeight: 700,
                    color: DATA_DISPLAY_COLORS.cyan,
                  }}
                >
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 14,
                color: DATA_DISPLAY_COLORS.textMuted,
              }}
            >
              Revealing...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveDisclosure;
