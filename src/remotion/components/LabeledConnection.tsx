import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { hexToRgb, getGlassBackground } from '../styles/theme';

// ============================================
// LABELED CONNECTION COMPONENT
// SVG-based connection with labels, arrows, and animations
// ============================================

interface LabeledConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  labelPosition?: 'start' | 'middle' | 'end';
  type?: 'solid' | 'dashed' | 'dotted';
  bidirectional?: boolean;
  animated?: boolean;
  color?: string;
  curved?: boolean;
  delayFrames?: number;
  strokeWidth?: number;
}

export const LabeledConnectionSVG: React.FC<LabeledConnectionProps> = ({
  from,
  to,
  label,
  labelPosition = 'middle',
  type = 'solid',
  bidirectional = false,
  animated = true,
  color = '#8B5CF6',
  curved = false,
  delayFrames = 0,
  strokeWidth = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation progress
  const drawProgress = interpolate(
    frame,
    [delayFrames, delayFrames + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const labelOpacity = interpolate(
    frame,
    [delayFrames + 15, delayFrames + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Calculate path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point for curved path (perpendicular offset)
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const curveOffset = curved ? Math.min(distance * 0.3, 80) : 0;

  // Perpendicular direction for curve
  const perpX = -dy / distance;
  const perpY = dx / distance;
  const controlX = midX + perpX * curveOffset;
  const controlY = midY + perpY * curveOffset;

  // Path definition
  const pathD = curved
    ? `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  // Calculate total path length for dash animation
  const pathLength = curved
    ? distance * 1.2 // Approximate for quadratic bezier
    : distance;

  // Dash array based on type
  const getDashArray = () => {
    switch (type) {
      case 'dashed':
        return '12 6';
      case 'dotted':
        return '4 4';
      default:
        return 'none';
    }
  };

  // Calculate label position along the path with perpendicular offset
  const getLabelPosition = () => {
    const t = labelPosition === 'start' ? 0.2 : labelPosition === 'end' ? 0.8 : 0.5;

    // Offset perpendicular to the line so label doesn't sit on top of it
    const labelOffset = 18; // pixels above/below the line

    if (curved) {
      // Quadratic bezier interpolation
      const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * controlX + t * t * to.x;
      const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y;
      // For curved paths, offset away from the curve's bulge direction
      const offsetY = curveOffset > 0 ? -labelOffset : labelOffset;
      return { x, y: y + offsetY };
    }

    // For straight lines, offset perpendicular (above the line)
    // Use the perpendicular direction we already calculated
    const baseX = from.x + dx * t;
    const baseY = from.y + dy * t;

    // Apply perpendicular offset (negative perpY moves label above horizontal lines)
    return {
      x: baseX - perpX * labelOffset,
      y: baseY - perpY * labelOffset,
    };
  };

  const labelPos = getLabelPosition();

  // Unique ID for this connection's markers
  const markerId = `arrow-${from.x}-${from.y}-${to.x}-${to.y}`.replace(/\./g, '-');

  if (drawProgress === 0) return null;

  return (
    <g>
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${markerId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Arrow marker */}
        <marker
          id={`arrowhead-${markerId}`}
          markerWidth="12"
          markerHeight="9"
          refX="11"
          refY="4.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4.5, 0 9"
            fill={color}
            opacity={drawProgress >= 0.9 ? 1 : 0}
          />
        </marker>

        {/* Reverse arrow marker for bidirectional */}
        {bidirectional && (
          <marker
            id={`arrowhead-reverse-${markerId}`}
            markerWidth="12"
            markerHeight="9"
            refX="1"
            refY="4.5"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <polygon
              points="12 0, 0 4.5, 12 9"
              fill={color}
              opacity={drawProgress >= 0.9 ? 1 : 0}
            />
          </marker>
        )}
      </defs>

      {/* Main path with draw animation */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={type === 'solid' ? pathLength : getDashArray()}
        strokeDashoffset={type === 'solid' ? pathLength * (1 - drawProgress) : 0}
        opacity={type === 'solid' ? 1 : drawProgress}
        strokeLinecap="round"
        filter={`url(#glow-${markerId})`}
        markerEnd={`url(#arrowhead-${markerId})`}
        markerStart={bidirectional ? `url(#arrowhead-reverse-${markerId})` : undefined}
      />

      {/* Animated traveling dot during draw */}
      {animated && type === 'solid' && drawProgress > 0 && drawProgress < 1 && (
        <circle
          cx={curved
            ? (1 - drawProgress) * (1 - drawProgress) * from.x + 2 * (1 - drawProgress) * drawProgress * controlX + drawProgress * drawProgress * to.x
            : from.x + dx * drawProgress
          }
          cy={curved
            ? (1 - drawProgress) * (1 - drawProgress) * from.y + 2 * (1 - drawProgress) * drawProgress * controlY + drawProgress * drawProgress * to.y
            : from.y + dy * drawProgress
          }
          r={5}
          fill={color}
          filter={`url(#glow-${markerId})`}
        />
      )}

      {/* Continuous flowing particles after draw completes */}
      {animated && drawProgress >= 1 && [0, 0.33, 0.66].map((offset, i) => {
        const cycleFrames = 60;
        const t = ((frame / cycleFrames) + offset) % 1;
        const px = curved
          ? (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * controlX + t * t * to.x
          : from.x + dx * t;
        const py = curved
          ? (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y
          : from.y + dy * t;
        // Fade near edges for smooth appearance
        const edgeFade = Math.min(t / 0.1, (1 - t) / 0.1, 1);
        return (
          <circle
            key={`particle-${i}`}
            cx={px}
            cy={py}
            r={4}
            fill={color}
            opacity={edgeFade * 0.8}
            filter={`url(#glow-${markerId})`}
          />
        );
      })}

      {/* Label with background */}
      {label && (
        <g opacity={labelOpacity}>
          {/* Label background */}
          <rect
            x={labelPos.x - label.length * 4.5 - 12}
            y={labelPos.y - 14}
            width={label.length * 9 + 24}
            height={28}
            rx={8}
            fill={`rgba(${hexToRgb(color)}, 0.18)`}
            stroke={`${color}60`}
            strokeWidth={1}
          />
          {/* Label text */}
          <text
            x={labelPos.x}
            y={labelPos.y + 5}
            textAnchor="middle"
            fill={color}
            fontSize={13}
            fontFamily="'JetBrains Mono', monospace"
            fontWeight={500}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// ============================================
// CONNECTION HELPER FOR ABSOLUTE POSITIONING
// Calculates positions from node IDs
// ============================================

interface ConnectionCanvasProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

export const ConnectionCanvas: React.FC<ConnectionCanvasProps> = ({
  width,
  height,
  children,
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  );
};

export default LabeledConnectionSVG;
