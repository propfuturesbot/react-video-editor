// ============================================
// RECURSION STACK - Call stack visualization
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { RecursionStackProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const RecursionStack: React.FC<RecursionStackProps> = ({
  title,
  frames,
  maxVisibleFrames = 8,
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

  const frameHeight = 60;
  const frameGap = 8;
  const visibleFrames = frames.slice(-maxVisibleFrames);
  const containerHeight = height || visibleFrames.length * (frameHeight + frameGap) + (title ? 60 : 20);

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

  // Get status color
  const getStatusColor = (status?: 'active' | 'waiting' | 'returned') => {
    switch (status) {
      case 'active':
        return DATA_DISPLAY_COLORS.green;
      case 'returned':
        return DATA_DISPLAY_COLORS.purple;
      case 'waiting':
      default:
        return DATA_DISPLAY_COLORS.cyan;
    }
  };

  // Get status icon
  const getStatusIcon = (status?: 'active' | 'waiting' | 'returned') => {
    switch (status) {
      case 'active':
        return 'play';
      case 'returned':
        return 'check';
      case 'waiting':
      default:
        return 'pause';
    }
  };

  return (
    <div
      style={{
        width,
        height: containerHeight,
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

      {/* Stack container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: frameGap,
          padding: 16,
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          borderRadius: 12,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Stack base label */}
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0',
            borderTop: `2px dashed ${DATA_DISPLAY_COLORS.textDim}40`,
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: DATA_DISPLAY_COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Stack Base
          </span>
        </div>

        {/* Stack frames */}
        {visibleFrames.map((stackFrame, i) => {
          const frameDelay = animationDelay + 15 + i * 8;
          const frameSpring = spring({
            frame: Math.max(0, frame - frameDelay),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 100 },
          });

          const frameOpacity = interpolate(
            frame,
            [frameDelay, frameDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const frameTranslateY = interpolate(frameSpring, [0, 1], [-20, 0]);
          const frameScale = interpolate(frameSpring, [0, 1], [0.9, 1]);

          const color = stackFrame.color || getStatusColor(stackFrame.status);
          const rgb = hexToRgb(color);
          const isActive = stackFrame.status === 'active';

          return (
            <div
              key={i}
              style={{
                height: frameHeight,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 16px',
                borderRadius: 8,
                background: `rgba(${rgb}, ${isActive ? 0.2 : 0.1})`,
                border: `2px solid ${isActive ? color : `rgba(${rgb}, 0.4)`}`,
                boxShadow: isActive
                  ? `0 0 20px rgba(${rgb}, 0.3), inset 0 0 20px rgba(${rgb}, 0.1)`
                  : 'none',
                opacity: frameOpacity,
                transform: `translateY(${frameTranslateY}px) scale(${frameScale})`,
              }}
            >
              {/* Status indicator */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: `rgba(${rgb}, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {renderIcon(getStatusIcon(stackFrame.status), 14, color)}
              </div>

              {/* Function info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 14,
                      fontWeight: 600,
                      color: isActive ? color : DATA_DISPLAY_COLORS.text,
                    }}
                  >
                    {stackFrame.functionName}
                  </span>
                  {stackFrame.args && (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 12,
                        color: DATA_DISPLAY_COLORS.textMuted,
                      }}
                    >
                      ({stackFrame.args})
                    </span>
                  )}
                </div>
                {stackFrame.returnValue && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        color: DATA_DISPLAY_COLORS.textDim,
                      }}
                    >
                      return:
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 12,
                        fontWeight: 600,
                        color: DATA_DISPLAY_COLORS.purple,
                      }}
                    >
                      {stackFrame.returnValue}
                    </span>
                  </div>
                )}
              </div>

              {/* Frame number */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: `rgba(${rgb}, 0.15)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    fontWeight: 600,
                    color: DATA_DISPLAY_COLORS.textMuted,
                  }}
                >
                  {i}
                </span>
              </div>
            </div>
          );
        })}

        {/* Stack top label */}
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0',
            borderBottom: `2px solid ${DATA_DISPLAY_COLORS.green}50`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: DATA_DISPLAY_COLORS.green,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Stack Top (Active)
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecursionStack;
