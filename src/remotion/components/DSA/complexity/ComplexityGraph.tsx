import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, COMPLEXITY_COLORS } from '../constants';

interface ComplexityCurve {
  name: string;
  complexity: string;
  color?: string;
  highlight?: boolean;
}

interface ComplexityGraphProps {
  curves: ComplexityCurve[];
  inputRange?: [number, number];
  outputRange?: [number, number];
  highlightCurve?: string;
  currentN?: number;
  showOperationCount?: boolean;
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

// Complexity functions
const complexityFunctions: Record<string, (n: number) => number> = {
  'O(1)': () => 1,
  'O(log n)': (n) => Math.log2(Math.max(1, n)),
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * Math.log2(Math.max(1, n)),
  'O(n²)': (n) => n * n,
  'O(n³)': (n) => n * n * n,
  'O(2^n)': (n) => Math.pow(2, Math.min(n, 10)),
  'O(n!)': (n) => {
    let result = 1;
    for (let i = 2; i <= Math.min(n, 6); i++) result *= i;
    return result;
  },
};

export const ComplexityGraph: React.FC<ComplexityGraphProps> = ({
  curves,
  inputRange = [0, 20],
  outputRange,
  highlightCurve,
  currentN,
  showOperationCount = true,
  width = 500,
  height = 300,
  title,
  showLegend = true,
  showGrid = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate actual output range if not provided
  const maxOutput = outputRange
    ? outputRange[1]
    : Math.max(
        ...curves.map((curve) => {
          const fn = complexityFunctions[curve.complexity];
          return fn ? fn(inputRange[1]) : inputRange[1];
        })
      );

  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Animation progress
  const drawProgress = spring({
    frame: frame - animationStartFrame,
    fps,
    config: { ...DSA_SPRINGS.smooth, mass: 2 },
  });

  // Generate path for a complexity curve
  const generatePath = (complexity: string, progress: number) => {
    const fn = complexityFunctions[complexity];
    if (!fn) return '';

    const points: string[] = [];
    const steps = 50;

    for (let i = 0; i <= steps * progress; i++) {
      const n = inputRange[0] + (inputRange[1] - inputRange[0]) * (i / steps);
      const value = fn(n);

      const x = padding.left + (i / steps) * chartWidth;
      const y = padding.top + chartHeight - (value / maxOutput) * chartHeight;

      // Clamp y to chart bounds
      const clampedY = Math.max(padding.top, Math.min(padding.top + chartHeight, y));

      points.push(i === 0 ? `M ${x} ${clampedY}` : `L ${x} ${clampedY}`);
    }

    return points.join(' ');
  };

  // Calculate operation count at currentN
  const getOperationCount = (complexity: string, n: number) => {
    const fn = complexityFunctions[complexity];
    if (!fn) return 0;
    return Math.round(fn(n));
  };

  // Get X position for currentN
  const getXForN = (n: number) => {
    const ratio = (n - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return padding.left + ratio * chartWidth;
  };

  // Get Y position for value
  const getYForValue = (value: number) => {
    return padding.top + chartHeight - (value / maxOutput) * chartHeight;
  };

  // Grid lines
  const xTicks = 5;
  const yTicks = 5;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
          }}
        >
          {title}
        </div>
      )}

      {/* Chart */}
      <svg width={width} height={height}>
        {/* Background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill={DSA_COLORS.ui.card}
          rx={4}
        />

        {/* Grid */}
        {showGrid && (
          <g opacity={0.3}>
            {/* Vertical grid lines */}
            {Array.from({ length: xTicks + 1 }).map((_, i) => {
              const x = padding.left + (i / xTicks) * chartWidth;
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={DSA_COLORS.ui.border}
                  strokeWidth={1}
                />
              );
            })}
            {/* Horizontal grid lines */}
            {Array.from({ length: yTicks + 1 }).map((_, i) => {
              const y = padding.top + (i / yTicks) * chartHeight;
              return (
                <line
                  key={`h-${i}`}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={DSA_COLORS.ui.border}
                  strokeWidth={1}
                />
              );
            })}
          </g>
        )}

        {/* Curves */}
        {curves.map((curve, index) => {
          const color =
            curve.color || COMPLEXITY_COLORS[curve.complexity] || DSA_COLORS.ui.text;
          const isHighlighted =
            highlightCurve === curve.complexity || curve.highlight;
          const opacity = highlightCurve
            ? isHighlighted
              ? 1
              : 0.3
            : 1;

          return (
            <g key={curve.complexity}>
              {/* Curve path */}
              <path
                d={generatePath(curve.complexity, drawProgress)}
                fill="none"
                stroke={color}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeLinecap="round"
                opacity={opacity}
              />

              {/* Glow effect for highlighted curve */}
              {isHighlighted && (
                <path
                  d={generatePath(curve.complexity, drawProgress)}
                  fill="none"
                  stroke={color}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={0.2}
                  filter="blur(4px)"
                />
              )}
            </g>
          );
        })}

        {/* Current N indicator */}
        {currentN !== undefined && drawProgress > 0.5 && (
          <g opacity={drawProgress}>
            {/* Vertical line at currentN */}
            <line
              x1={getXForN(currentN)}
              y1={padding.top}
              x2={getXForN(currentN)}
              y2={padding.top + chartHeight}
              stroke={DSA_COLORS.ui.text}
              strokeWidth={2}
              strokeDasharray="4,4"
            />

            {/* Points on curves */}
            {curves.map((curve) => {
              const fn = complexityFunctions[curve.complexity];
              if (!fn) return null;

              const value = fn(currentN);
              const x = getXForN(currentN);
              const y = getYForValue(value);
              const color =
                curve.color || COMPLEXITY_COLORS[curve.complexity] || DSA_COLORS.ui.text;

              if (y < padding.top || y > padding.top + chartHeight) return null;

              return (
                <g key={`point-${curve.complexity}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill={color}
                    stroke={DSA_COLORS.ui.background}
                    strokeWidth={2}
                  />
                  {/* Value label */}
                  {showOperationCount && (
                    <text
                      x={x + 12}
                      y={y + 4}
                      fill={color}
                      fontSize={12}
                      fontWeight={600}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {getOperationCount(curve.complexity, currentN)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* N label */}
            <text
              x={getXForN(currentN)}
              y={padding.top + chartHeight + 30}
              fill={DSA_COLORS.ui.text}
              fontSize={14}
              fontWeight={600}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              n = {currentN}
            </text>
          </g>
        )}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke={DSA_COLORS.ui.text}
          strokeWidth={2}
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke={DSA_COLORS.ui.text}
          strokeWidth={2}
        />

        {/* X-axis labels */}
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const value = inputRange[0] + ((inputRange[1] - inputRange[0]) * i) / xTicks;
          const x = padding.left + (i / xTicks) * chartWidth;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={padding.top + chartHeight + 20}
              fill={DSA_COLORS.ui.textMuted}
              fontSize={12}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              {Math.round(value)}
            </text>
          );
        })}

        {/* Axis labels */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 5}
          fill={DSA_COLORS.ui.text}
          fontSize={14}
          fontWeight={600}
          textAnchor="middle"
        >
          Input Size (n)
        </text>
        <text
          x={15}
          y={padding.top + chartHeight / 2}
          fill={DSA_COLORS.ui.text}
          fontSize={14}
          fontWeight={600}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
        >
          Operations
        </text>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '10px 20px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {curves.map((curve) => {
            const color =
              curve.color || COMPLEXITY_COLORS[curve.complexity] || DSA_COLORS.ui.text;
            const isHighlighted =
              highlightCurve === curve.complexity || curve.highlight;

            return (
              <div
                key={curve.complexity}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: highlightCurve ? (isHighlighted ? 1 : 0.5) : 1,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 4,
                    background: color,
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isHighlighted ? 700 : 500,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isHighlighted ? color : DSA_COLORS.ui.text,
                  }}
                >
                  {curve.name} - {curve.complexity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplexityGraph;
