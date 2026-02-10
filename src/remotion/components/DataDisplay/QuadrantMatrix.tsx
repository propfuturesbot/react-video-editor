// ============================================
// QUADRANT MATRIX - 2x2 grid with labeled axes
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { QuadrantMatrixProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

// Helper to detect if string is emoji vs icon name
const isEmoji = (str: string): boolean => {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str) && str.length <= 4;
};

export const QuadrantMatrix: React.FC<QuadrantMatrixProps> = ({
  title,
  xAxisLabel,
  yAxisLabel,
  xAxisLabelPositive,
  xAxisLabelNegative,
  yAxisLabelPositive,
  yAxisLabelNegative,
  quadrants,
  axisColor = DATA_DISPLAY_COLORS.textMuted,
  labelColor = DATA_DISPLAY_COLORS.text,
  width = 500,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation values
  const axisProgress = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 25],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const labelOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay + 15, animationDelay + 30],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Grid dimensions
  const padding = 60;
  const gridWidth = width - padding * 2;
  const gridHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y - height / 2 }
      : {};

  // Get quadrant position
  const getQuadrantPosition = (position: string) => {
    switch (position) {
      case 'top-left':
        return { x: padding + gridWidth * 0.25, y: padding + gridHeight * 0.25 };
      case 'top-right':
        return { x: padding + gridWidth * 0.75, y: padding + gridHeight * 0.25 };
      case 'bottom-left':
        return { x: padding + gridWidth * 0.25, y: padding + gridHeight * 0.75 };
      case 'bottom-right':
        return { x: padding + gridWidth * 0.75, y: padding + gridHeight * 0.75 };
      default:
        return { x: centerX, y: centerY };
    }
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        ...positionStyles,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: labelOpacity,
          }}
        >
          <h3
            style={{
              fontFamily: FONTS.heading,
              fontSize: 20,
              fontWeight: 600,
              color: labelColor,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
      )}

      {/* SVG for axes and quadrants */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Quadrant backgrounds */}
        {quadrants.map((q, i) => {
          const pos = getQuadrantPosition(q.position);
          const quadWidth = gridWidth / 2 - 4;
          const quadHeight = gridHeight / 2 - 4;
          const color = q.color || DATA_DISPLAY_COLORS.purple;
          const rgb = hexToRgb(color);
          const opacity = q.opacity || 0.15;

          const quadrantSpring = spring({
            frame: Math.max(0, frame - animationDelay - 20 - i * 5),
            fps,
            config: { damping: 15, mass: 0.5, stiffness: 80 },
          });

          return (
            <g key={i}>
              <rect
                x={pos.x - quadWidth / 2}
                y={pos.y - quadHeight / 2}
                width={quadWidth}
                height={quadHeight}
                fill={`rgba(${rgb}, ${opacity * quadrantSpring})`}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.3 * quadrantSpring}
                rx={12}
              />
              {/* Quadrant label */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={labelColor}
                fontFamily={FONTS.body}
                fontSize={14}
                fontWeight={500}
                opacity={quadrantSpring}
              >
                {q.label}
              </text>
              {/* Optional icon */}
              {q.icon && (
                <foreignObject
                  x={pos.x - 12}
                  y={pos.y - 32}
                  width={24}
                  height={24}
                  opacity={quadrantSpring}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {typeof q.icon === 'string' && isEmoji(q.icon)
                      ? <span style={{ fontSize: 20, lineHeight: 1 }}>{q.icon}</span>
                      : renderIcon(q.icon as string, 20, color)
                    }
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* X Axis */}
        <line
          x1={padding}
          y1={centerY}
          x2={padding + gridWidth * axisProgress}
          y2={centerY}
          stroke={axisColor}
          strokeWidth={2}
        />
        {/* X Axis arrow */}
        <polygon
          points={`${padding + gridWidth - 8},${centerY - 5} ${padding + gridWidth},${centerY} ${padding + gridWidth - 8},${centerY + 5}`}
          fill={axisColor}
          opacity={axisProgress}
        />

        {/* Y Axis */}
        <line
          x1={centerX}
          y1={height - padding}
          x2={centerX}
          y2={height - padding - gridHeight * axisProgress}
          stroke={axisColor}
          strokeWidth={2}
        />
        {/* Y Axis arrow */}
        <polygon
          points={`${centerX - 5},${padding + 8} ${centerX},${padding} ${centerX + 5},${padding + 8}`}
          fill={axisColor}
          opacity={axisProgress}
        />

        {/* Axis labels */}
        {/* X Axis main label */}
        <text
          x={centerX}
          y={height - 15}
          textAnchor="middle"
          fill={axisColor}
          fontFamily={FONTS.body}
          fontSize={12}
          fontWeight={500}
          opacity={labelOpacity}
        >
          {xAxisLabel}
        </text>

        {/* Y Axis main label (rotated) */}
        <text
          x={15}
          y={centerY}
          textAnchor="middle"
          fill={axisColor}
          fontFamily={FONTS.body}
          fontSize={12}
          fontWeight={500}
          opacity={labelOpacity}
          transform={`rotate(-90, 15, ${centerY})`}
        >
          {yAxisLabel}
        </text>

        {/* X Axis direction labels */}
        {xAxisLabelNegative && (
          <text
            x={padding + 20}
            y={centerY + 20}
            textAnchor="start"
            fill={DATA_DISPLAY_COLORS.textDim}
            fontFamily={FONTS.body}
            fontSize={10}
            opacity={labelOpacity * 0.8}
          >
            {xAxisLabelNegative}
          </text>
        )}
        {xAxisLabelPositive && (
          <text
            x={width - padding - 20}
            y={centerY + 20}
            textAnchor="end"
            fill={DATA_DISPLAY_COLORS.textDim}
            fontFamily={FONTS.body}
            fontSize={10}
            opacity={labelOpacity * 0.8}
          >
            {xAxisLabelPositive}
          </text>
        )}

        {/* Y Axis direction labels */}
        {yAxisLabelNegative && (
          <text
            x={centerX + 10}
            y={height - padding - 10}
            textAnchor="start"
            fill={DATA_DISPLAY_COLORS.textDim}
            fontFamily={FONTS.body}
            fontSize={10}
            opacity={labelOpacity * 0.8}
          >
            {yAxisLabelNegative}
          </text>
        )}
        {yAxisLabelPositive && (
          <text
            x={centerX + 10}
            y={padding + 20}
            textAnchor="start"
            fill={DATA_DISPLAY_COLORS.textDim}
            fontFamily={FONTS.body}
            fontSize={10}
            opacity={labelOpacity * 0.8}
          >
            {yAxisLabelPositive}
          </text>
        )}
      </svg>
    </div>
  );
};

export default QuadrantMatrix;
