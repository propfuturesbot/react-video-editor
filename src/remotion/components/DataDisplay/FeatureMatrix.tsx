// ============================================
// FEATURE MATRIX - NxM comparison grid
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { FeatureMatrixProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { GlowIcon } from './GlowIcon';
import { renderIcon } from '../../utils/lucideIconMap';

export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({
  title,
  rows,
  columns,
  values,
  highlightColumn,
  rowIcons,
  width = 700,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main container animation
  const containerSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const containerScale = animateIn
    ? interpolate(containerSpring, [0, 1], [0.95, 1])
    : 1;

  // Calculate column width
  const labelColWidth = 180;
  const valueColWidth = (width - labelColWidth) / columns.length;
  const rowHeight = 52;
  const headerHeight = 60;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Helper to render cell value
  const renderCellValue = (value: 'check' | 'cross' | 'partial' | string | number, colIdx: number) => {
    const colColor = columns[colIdx]?.color || DATA_DISPLAY_COLORS.cyan;

    if (value === 'check') {
      return renderIcon('check', 22, DATA_DISPLAY_COLORS.green);
    }
    if (value === 'cross') {
      return renderIcon('x', 22, DATA_DISPLAY_COLORS.red);
    }
    if (value === 'partial') {
      return renderIcon('minus', 22, DATA_DISPLAY_COLORS.yellow);
    }
    return (
      <span
        style={{
          fontFamily: FONTS.body,
          fontSize: 14,
          fontWeight: 500,
          color: typeof value === 'number' ? colColor : DATA_DISPLAY_COLORS.text,
        }}
      >
        {value}
      </span>
    );
  };

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
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

      {/* Table */}
      <div
        style={{
          background: DATA_DISPLAY_COLORS.cardBg,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}40`,
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            height: headerHeight,
            borderBottom: `1px solid ${DATA_DISPLAY_COLORS.textDim}40`,
          }}
        >
          {/* Empty corner cell */}
          <div
            style={{
              width: labelColWidth,
              height: headerHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${DATA_DISPLAY_COLORS.cardBgAlt}`,
            }}
          />

          {/* Column headers */}
          {columns.map((col, colIdx) => {
            const colDelay = animationDelay + 10 + colIdx * 8;
            const colOpacity = interpolate(
              frame,
              [colDelay, colDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const isHighlighted = highlightColumn === colIdx;
            const colColor = col.color || DATA_DISPLAY_COLORS.cyan;
            const rgb = hexToRgb(colColor);

            return (
              <div
                key={colIdx}
                style={{
                  width: valueColWidth,
                  height: headerHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  opacity: colOpacity,
                  background: isHighlighted
                    ? `linear-gradient(180deg, rgba(${rgb}, 0.2) 0%, transparent 100%)`
                    : 'transparent',
                  borderLeft: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
                }}
              >
                {col.icon && (
                  <div style={{ marginBottom: 2 }}>
                    {renderIcon(col.icon, 18, colColor)}
                  </div>
                )}
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 14,
                    fontWeight: 600,
                    color: isHighlighted ? colColor : DATA_DISPLAY_COLORS.text,
                    textAlign: 'center',
                  }}
                >
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Data Rows */}
        {rows.map((rowLabel, rowIdx) => {
          const rowDelay = animationDelay + 25 + rowIdx * 6;
          const rowOpacity = interpolate(
            frame,
            [rowDelay, rowDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                height: rowHeight,
                borderBottom:
                  rowIdx < rows.length - 1
                    ? `1px solid ${DATA_DISPLAY_COLORS.textDim}20`
                    : 'none',
                opacity: rowOpacity,
              }}
            >
              {/* Row label */}
              <div
                style={{
                  width: labelColWidth,
                  height: rowHeight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  paddingLeft: 16,
                  background: `${DATA_DISPLAY_COLORS.cardBgAlt}50`,
                }}
              >
                {rowIcons?.[rowIdx] && (
                  <div style={{ opacity: 0.7 }}>
                    {renderIcon(rowIcons[rowIdx], 16, DATA_DISPLAY_COLORS.textMuted)}
                  </div>
                )}
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    fontWeight: 500,
                    color: DATA_DISPLAY_COLORS.text,
                  }}
                >
                  {rowLabel}
                </span>
              </div>

              {/* Value cells */}
              {columns.map((col, colIdx) => {
                const isHighlighted = highlightColumn === colIdx;
                const colColor = col.color || DATA_DISPLAY_COLORS.cyan;
                const rgb = hexToRgb(colColor);

                return (
                  <div
                    key={colIdx}
                    style={{
                      width: valueColWidth,
                      height: rowHeight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isHighlighted
                        ? `rgba(${rgb}, 0.05)`
                        : 'transparent',
                      borderLeft: `1px solid ${DATA_DISPLAY_COLORS.textDim}20`,
                    }}
                  >
                    {values[rowIdx]?.[colIdx] !== undefined &&
                      renderCellValue(values[rowIdx][colIdx], colIdx)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureMatrix;
