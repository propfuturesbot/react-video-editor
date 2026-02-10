// ============================================
// ARRAY VISUALIZER - Array with indices, highlights, pointers
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ArrayVisualizerProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  title,
  values,
  highlightIndices = [],
  pointers = [],
  showIndices = true,
  cellSize = 60,
  highlightColor = DATA_DISPLAY_COLORS.green,
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
  const containerWidth = width || values.length * (cellSize + cellGap) + 40;
  const containerHeight = height || cellSize + (showIndices ? 30 : 0) + (pointers.length > 0 ? 50 : 0) + 40;

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

  // Get pointer for an index
  const getPointerForIndex = (idx: number) => {
    return pointers.find((p) => p.index === idx);
  };

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

      {/* Array container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Pointers row (above array) */}
        {pointers.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: cellGap,
              height: 40,
              position: 'relative',
            }}
          >
            {values.map((_, idx) => {
              const pointer = getPointerForIndex(idx);
              if (!pointer) {
                return (
                  <div key={idx} style={{ width: cellSize, height: 40 }} />
                );
              }

              const pointerColor = pointer.color || DATA_DISPLAY_COLORS.purple;
              const rgb = hexToRgb(pointerColor);
              const pointerDelay = animationDelay + 30 + idx * 3;
              const pointerSpring = spring({
                frame: Math.max(0, frame - pointerDelay),
                fps,
                config: { damping: 10, mass: 0.3, stiffness: 150 },
              });

              const pointerOpacity = interpolate(
                frame,
                [pointerDelay, pointerDelay + 12],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const pointerBounce = interpolate(pointerSpring, [0, 1], [-15, 0]);

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
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 600,
                      color: pointerColor,
                      textShadow: `0 0 10px rgba(${rgb}, 0.5)`,
                    }}
                  >
                    {pointer.label}
                  </span>
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: `12px solid ${pointerColor}`,
                      marginTop: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Cells row */}
        <div
          style={{
            display: 'flex',
            gap: cellGap,
            padding: '10px 20px',
            background: `${DATA_DISPLAY_COLORS.cardBg}80`,
            borderRadius: 12,
            border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
          }}
        >
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
            const isHighlighted = highlightIndices.includes(idx);
            const color = isHighlighted ? highlightColor : DATA_DISPLAY_COLORS.cyan;
            const rgb = hexToRgb(color);

            return (
              <div
                key={idx}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 8,
                  background: isHighlighted
                    ? `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.15))`
                    : `rgba(${rgb}, 0.1)`,
                  border: `2px solid ${isHighlighted ? color : `rgba(${rgb}, 0.4)`}`,
                  boxShadow: isHighlighted
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
                    color: isHighlighted ? color : DATA_DISPLAY_COLORS.text,
                    textShadow: isHighlighted
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

        {/* Indices row */}
        {showIndices && (
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
        )}
      </div>
    </div>
  );
};

export default ArrayVisualizer;
