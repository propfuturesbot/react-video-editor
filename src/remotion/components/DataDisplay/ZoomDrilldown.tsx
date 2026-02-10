// ============================================
// ZOOM DRILLDOWN - Macro to micro zoom
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ZoomDrilldownProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const ZoomDrilldown: React.FC<ZoomDrilldownProps> = ({
  title,
  levels,
  currentLevel,
  width = 600,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Auto-animate through levels if currentLevel not specified
  const framesPerLevel = 60;
  const autoLevel =
    currentLevel !== undefined
      ? currentLevel
      : Math.min(
          Math.floor((frame - animationDelay - 30) / framesPerLevel),
          levels.length - 1
        );

  const activeLevel = Math.max(0, autoLevel);

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Calculate transition progress within current level
  const levelStartFrame = animationDelay + 30 + activeLevel * framesPerLevel;
  const transitionProgress = interpolate(
    frame,
    [levelStartFrame, levelStartFrame + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Zoom effect
  const zoomSpring = spring({
    frame: Math.max(0, frame - levelStartFrame),
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 80 },
  });

  const zoomScale = interpolate(zoomSpring, [0, 1], [0.8, 1]);

  const contentHeight = height - (title ? 80 : 40);

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
            marginBottom: 16,
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

      {/* Level indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {levels.map((level, i) => {
          const isActive = i === activeLevel;
          const isPast = i < activeLevel;
          const color = isActive
            ? DATA_DISPLAY_COLORS.cyan
            : isPast
              ? DATA_DISPLAY_COLORS.green
              : DATA_DISPLAY_COLORS.textDim;

          const indicatorDelay = animationDelay + 10 + i * 5;
          const indicatorOpacity = interpolate(
            frame,
            [indicatorDelay, indicatorDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: indicatorOpacity,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: isActive ? 12 : 8,
                  height: isActive ? 12 : 8,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 12,
                  color: isActive ? DATA_DISPLAY_COLORS.text : DATA_DISPLAY_COLORS.textMuted,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {level.label}
              </span>
              {/* Connector */}
              {i < levels.length - 1 && (
                <div
                  style={{
                    width: 30,
                    height: 2,
                    background: isPast
                      ? DATA_DISPLAY_COLORS.green
                      : DATA_DISPLAY_COLORS.textDim + '40',
                    marginLeft: 4,
                    marginRight: 4,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content container with zoom effect */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: contentHeight,
          borderRadius: 16,
          overflow: 'hidden',
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Zoom frame effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: `2px solid ${DATA_DISPLAY_COLORS.cyan}30`,
            borderRadius: 14,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Current level content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: transitionProgress,
            transform: `scale(${zoomScale})`,
          }}
        >
          {levels[activeLevel]?.content}
        </div>

        {/* Zoom icon overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 8,
            background: `${DATA_DISPLAY_COLORS.cardBg}90`,
            border: `1px solid ${DATA_DISPLAY_COLORS.textDim}40`,
            opacity: 0.8,
          }}
        >
          {renderIcon('zoom-in', 14, DATA_DISPLAY_COLORS.cyan)}
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: DATA_DISPLAY_COLORS.textMuted,
            }}
          >
            Level {activeLevel + 1}/{levels.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ZoomDrilldown;
