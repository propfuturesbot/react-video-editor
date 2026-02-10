// ============================================
// RADAR CHART - Multi-axis comparison
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { RadarChartProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

export const RadarChart: React.FC<RadarChartProps> = ({
  title,
  axes,
  datasets,
  showLabels = true,
  showGrid = true,
  gridLevels = 5,
  width = 500,
  height = 500,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const centerX = width / 2;
  const centerY = (height - (title ? 50 : 0)) / 2 + (title ? 50 : 0);
  const radius = Math.min(width, height - (title ? 50 : 0)) * 0.35;
  const numAxes = axes.length;
  const angleStep = (2 * Math.PI) / numAxes;

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

  // Calculate point position
  const getPoint = (axisIndex: number, value: number, maxValue: number = 100): { x: number; y: number } => {
    const angle = axisIndex * angleStep - Math.PI / 2;
    const normalizedValue = value / maxValue;
    return {
      x: centerX + radius * normalizedValue * Math.cos(angle),
      y: centerY + radius * normalizedValue * Math.sin(angle),
    };
  };

  // Grid animation
  const gridOpacity = interpolate(
    frame,
    [animationDelay + 5, animationDelay + 25],
    [0, 0.3],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Dataset animation
  const datasetProgress = interpolate(
    frame,
    [animationDelay + 20, animationDelay + 60],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Generate grid paths
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];

    // Concentric polygons
    for (let level = 1; level <= gridLevels; level++) {
      const levelRadius = (radius * level) / gridLevels;
      const points = axes.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return `${centerX + levelRadius * Math.cos(angle)},${centerY + levelRadius * Math.sin(angle)}`;
      });

      gridLines.push(
        <polygon
          key={`grid-${level}`}
          points={points.join(' ')}
          fill="none"
          stroke={DATA_DISPLAY_COLORS.textDim}
          strokeWidth={1}
          opacity={gridOpacity}
        />
      );
    }

    // Axis lines
    axes.forEach((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);

      gridLines.push(
        <line
          key={`axis-${i}`}
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke={DATA_DISPLAY_COLORS.textDim}
          strokeWidth={1}
          opacity={gridOpacity}
        />
      );
    });

    return gridLines;
  };

  // Render axis labels
  const renderLabels = () => {
    if (!showLabels) return null;

    return axes.map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 30;
      const lx = centerX + labelRadius * Math.cos(angle);
      const ly = centerY + labelRadius * Math.sin(angle);

      const labelDelay = animationDelay + 30 + i * 5;
      const labelOpacity = interpolate(
        frame,
        [labelDelay, labelDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      return (
        <text
          key={`label-${i}`}
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={DATA_DISPLAY_COLORS.text}
          fontSize={12}
          fontFamily={FONTS.body}
          fontWeight={500}
          opacity={labelOpacity}
        >
          {axis.label}
        </text>
      );
    });
  };

  // Render datasets
  const renderDatasets = () => {
    return datasets.map((dataset, datasetIndex) => {
      const rgb = hexToRgb(dataset.color);
      const fillOpacity = dataset.fillOpacity ?? 0.2;

      // Calculate animated points
      const points = axes.map((axis, i) => {
        const maxValue = axis.maxValue || 100;
        const animatedValue = dataset.values[i] * datasetProgress;
        return getPoint(i, animatedValue, maxValue);
      });

      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

      return (
        <g key={`dataset-${datasetIndex}`}>
          {/* Fill */}
          <path
            d={pathD}
            fill={`rgba(${rgb}, ${fillOpacity * datasetProgress})`}
            stroke="none"
          />
          {/* Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={dataset.color}
            strokeWidth={2}
            opacity={datasetProgress}
          />
          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r={5}
              fill={dataset.color}
              stroke={DATA_DISPLAY_COLORS.cardBg}
              strokeWidth={2}
              opacity={datasetProgress}
            />
          ))}
        </g>
      );
    });
  };

  // Legend
  const renderLegend = () => {
    if (datasets.length <= 1) return null;

    return (
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 20,
        }}
      >
        {datasets.map((dataset, i) => {
          const legendDelay = animationDelay + 50 + i * 5;
          const legendOpacity = interpolate(
            frame,
            [legendDelay, legendDelay + 15],
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
                opacity: legendOpacity,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: dataset.color,
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 12,
                  color: DATA_DISPLAY_COLORS.textMuted,
                }}
              >
                {dataset.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

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

      {/* SVG Chart */}
      <svg width={width} height={height - (title ? 50 : 0)}>
        {renderGrid()}
        {renderDatasets()}
        {renderLabels()}
      </svg>

      {renderLegend()}
    </div>
  );
};

export default RadarChart;
