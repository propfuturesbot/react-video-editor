// ============================================
// POINTER ANIMATION - Two-pointer / sliding window visualization
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { PointerAnimationProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

export const PointerAnimation: React.FC<PointerAnimationProps> = ({
  title,
  values,
  leftPointer,
  rightPointer,
  windowHighlight = true,
  windowColor = DATA_DISPLAY_COLORS.purple,
  cellSize = 60,
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

  const cellGap = 4;
  const containerWidth = width || values.length * (cellSize + cellGap) + 60;
  const containerHeight = height || cellSize + 100 + (title ? 50 : 0);

  // Main container animation
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
      ? { position: 'absolute', left: x - containerWidth / 2, top: y }
      : {};

  // Get window range
  const leftIdx = leftPointer?.index ?? 0;
  const rightIdx = rightPointer?.index ?? values.length - 1;
  const leftColor = leftPointer?.color || DATA_DISPLAY_COLORS.green;
  const rightColor = rightPointer?.color || DATA_DISPLAY_COLORS.orange;

  // Window highlight box dimensions
  const windowLeft = leftIdx * (cellSize + cellGap);
  const windowWidth = (rightIdx - leftIdx + 1) * (cellSize + cellGap) - cellGap;
  const windowRgb = hexToRgb(windowColor);

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
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
            fontSize: 20,
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

      {/* Array container with pointers */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Top pointers row */}
        <div
          style={{
            display: 'flex',
            gap: cellGap,
            height: 45,
            position: 'relative',
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          {values.map((_, idx) => {
            const isLeft = idx === leftIdx;
            const isRight = idx === rightIdx;

            if (!isLeft && !isRight) {
              return <div key={idx} style={{ width: cellSize }} />;
            }

            const pointerColor = isLeft ? leftColor : rightColor;
            const pointerLabel = isLeft
              ? leftPointer?.label || 'L'
              : rightPointer?.label || 'R';
            const rgb = hexToRgb(pointerColor);

            const pointerDelay = animationDelay + 30;
            const pointerSpring = spring({
              frame: Math.max(0, frame - pointerDelay),
              fps,
              config: { damping: 10, mass: 0.3, stiffness: 150 },
            });

            const pointerOpacity = interpolate(
              frame,
              [pointerDelay, pointerDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const pointerBounce = interpolate(pointerSpring, [0, 1], [-20, 0]);

            return (
              <div
                key={idx}
                style={{
                  width: cellSize,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: pointerOpacity,
                  transform: `translateY(${pointerBounce}px)`,
                }}
              >
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: `rgba(${rgb}, 0.2)`,
                    border: `2px solid ${pointerColor}`,
                    boxShadow: `0 0 15px rgba(${rgb}, 0.4)`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: pointerColor,
                    }}
                  >
                    {pointerLabel}
                  </span>
                </div>
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `10px solid ${pointerColor}`,
                    marginTop: 4,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Cells row with window highlight */}
        <div
          style={{
            position: 'relative',
            padding: '10px 20px',
            background: `${DATA_DISPLAY_COLORS.cardBg}80`,
            borderRadius: 12,
            border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
          }}
        >
          {/* Window highlight overlay */}
          {windowHighlight && leftPointer && rightPointer && (
            <div
              style={{
                position: 'absolute',
                left: windowLeft + 20,
                top: 10,
                width: windowWidth,
                height: cellSize,
                borderRadius: 8,
                background: `rgba(${windowRgb}, 0.15)`,
                border: `2px dashed ${windowColor}60`,
                boxShadow: `inset 0 0 20px rgba(${windowRgb}, 0.1)`,
                opacity: interpolate(
                  frame,
                  [animationDelay + 35, animationDelay + 50],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                ),
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Cells */}
          <div style={{ display: 'flex', gap: cellGap, position: 'relative' }}>
            {values.map((value, idx) => {
              const cellDelay = animationDelay + 10 + idx * 5;
              const cellSpring = spring({
                frame: Math.max(0, frame - cellDelay),
                fps,
                config: { damping: 12, mass: 0.5, stiffness: 100 },
              });

              const cellOpacity = interpolate(
                frame,
                [cellDelay, cellDelay + 12],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const cellScale = interpolate(cellSpring, [0, 1], [0.5, 1]);

              const isInWindow = idx >= leftIdx && idx <= rightIdx;
              const isPointerCell = idx === leftIdx || idx === rightIdx;
              const cellColor = isPointerCell
                ? idx === leftIdx
                  ? leftColor
                  : rightColor
                : isInWindow
                  ? windowColor
                  : DATA_DISPLAY_COLORS.cyan;
              const rgb = hexToRgb(cellColor);

              return (
                <div
                  key={idx}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 8,
                    background: isPointerCell
                      ? `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.15))`
                      : `rgba(${rgb}, 0.1)`,
                    border: `2px solid ${isPointerCell ? cellColor : `rgba(${rgb}, 0.4)`}`,
                    boxShadow: isPointerCell
                      ? `0 0 20px rgba(${rgb}, 0.4), 0 0 40px rgba(${rgb}, 0.2)`
                      : `0 0 10px rgba(${rgb}, 0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cellOpacity,
                    transform: `scale(${cellScale})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: cellSize * 0.35,
                      fontWeight: 700,
                      color: isPointerCell ? cellColor : DATA_DISPLAY_COLORS.text,
                      textShadow: isPointerCell
                        ? `0 0 10px rgba(${rgb}, 0.5)`
                        : 'none',
                    }}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Index row */}
        <div
          style={{
            display: 'flex',
            gap: cellGap,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          {values.map((_, idx) => {
            const indexDelay = animationDelay + 20 + idx * 3;
            const indexOpacity = interpolate(
              frame,
              [indexDelay, indexDelay + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={idx}
                style={{
                  width: cellSize,
                  textAlign: 'center',
                  opacity: indexOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    color: DATA_DISPLAY_COLORS.textMuted,
                  }}
                >
                  {idx}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PointerAnimation;
