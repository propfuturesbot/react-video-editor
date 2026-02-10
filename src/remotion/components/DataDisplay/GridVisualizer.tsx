// ============================================
// GRID VISUALIZER - 2D matrix with cell highlighting
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GridVisualizerProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

export const GridVisualizer: React.FC<GridVisualizerProps> = ({
  title,
  rows,
  cols,
  cells = [],
  highlightCells = [],
  showCoordinates = true,
  cellSize = 50,
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

  const gap = 4;
  const coordWidth = showCoordinates ? 30 : 0;
  const gridWidth = cols * (cellSize + gap) - gap;
  const gridHeight = rows * (cellSize + gap) - gap;
  const containerWidth = width || gridWidth + coordWidth + 40;
  const containerHeight = height || gridHeight + coordWidth + (title ? 70 : 30);

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
      ? { position: 'absolute', left: x - containerWidth / 2, top: y }
      : {};

  // Get cell value
  const getCellValue = (row: number, col: number) => {
    const cell = cells.find((c) => c.row === row && c.col === col);
    return cell?.value;
  };

  // Get cell color
  const getCellColor = (row: number, col: number) => {
    const cell = cells.find((c) => c.row === row && c.col === col);
    return cell?.color || DATA_DISPLAY_COLORS.cyan;
  };

  // Check if cell is highlighted
  const isCellHighlighted = (row: number, col: number) => {
    const cell = cells.find((c) => c.row === row && c.col === col);
    if (cell?.highlighted) return true;
    return highlightCells.some((h) => h.row === row && h.col === col);
  };

  return (
    <div
      style={{
        width: containerWidth,
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
            fontSize: 22,
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

      {/* Grid container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Column headers */}
        {showCoordinates && (
          <div
            style={{
              display: 'flex',
              marginLeft: coordWidth,
              marginBottom: 8,
            }}
          >
            {Array.from({ length: cols }, (_, col) => (
              <div
                key={col}
                style={{
                  width: cellSize,
                  marginRight: col < cols - 1 ? gap : 0,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: DATA_DISPLAY_COLORS.textMuted,
                  }}
                >
                  {col}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grid rows */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {/* Row headers */}
          {showCoordinates && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginRight: 8,
              }}
            >
              {Array.from({ length: rows }, (_, row) => (
                <div
                  key={row}
                  style={{
                    width: coordWidth - 8,
                    height: cellSize,
                    marginBottom: row < rows - 1 ? gap : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: DATA_DISPLAY_COLORS.textMuted,
                    }}
                  >
                    {row}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              gap: gap,
              padding: 8,
              background: `${DATA_DISPLAY_COLORS.cardBg}80`,
              borderRadius: 12,
              border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
            }}
          >
            {Array.from({ length: rows * cols }, (_, idx) => {
              const row = Math.floor(idx / cols);
              const col = idx % cols;
              const cellDelay = animationDelay + 10 + (row + col) * 2;

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

              const value = getCellValue(row, col);
              const highlighted = isCellHighlighted(row, col);
              const color = getCellColor(row, col);
              const rgb = hexToRgb(color);

              return (
                <div
                  key={idx}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 6,
                    background: highlighted
                      ? `linear-gradient(135deg, rgba(${rgb}, 0.35), rgba(${rgb}, 0.2))`
                      : `rgba(${rgb}, 0.1)`,
                    border: `2px solid ${highlighted ? color : `rgba(${rgb}, 0.3)`}`,
                    boxShadow: highlighted
                      ? `0 0 15px rgba(${rgb}, 0.4), 0 0 30px rgba(${rgb}, 0.2)`
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cellOpacity,
                    transform: `scale(${cellScale})`,
                  }}
                >
                  {value !== undefined && (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: cellSize * 0.35,
                        fontWeight: 700,
                        color: highlighted ? color : DATA_DISPLAY_COLORS.text,
                        textShadow: highlighted
                          ? `0 0 8px rgba(${rgb}, 0.5)`
                          : 'none',
                      }}
                    >
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridVisualizer;
