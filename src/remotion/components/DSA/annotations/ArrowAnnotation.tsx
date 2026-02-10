import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS } from '../constants';

interface ArrowAnnotationProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  color?: string;
  curved?: boolean;
  curvature?: number;
  strokeWidth?: number;
  arrowSize?: number;
  dashed?: boolean;
  animated?: boolean;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const ArrowAnnotation: React.FC<ArrowAnnotationProps> = ({
  from,
  to,
  label,
  color = DSA_COLORS.ui.text,
  curved = false,
  curvature = 50,
  strokeWidth = 2,
  arrowSize = 10,
  dashed = false,
  animated = true,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  // Calculate path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Calculate midpoint for curved arrow
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Perpendicular offset for curve
  const perpX = -dy / length;
  const perpY = dx / length;

  // Control point for curve
  const ctrlX = midX + perpX * curvature;
  const ctrlY = midY + perpY * curvature;

  // Path
  const path = curved
    ? `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

  // Arrow head angle
  let angle: number;
  if (curved) {
    // Angle at end of curve
    const t = 0.99;
    const endTangentX = 2 * (1 - t) * (ctrlX - from.x) + 2 * t * (to.x - ctrlX);
    const endTangentY = 2 * (1 - t) * (ctrlY - from.y) + 2 * t * (to.y - ctrlY);
    angle = Math.atan2(endTangentY, endTangentX);
  } else {
    angle = Math.atan2(dy, dx);
  }

  // Arrow head points
  const arrowPoints = [
    { x: to.x, y: to.y },
    {
      x: to.x - arrowSize * Math.cos(angle - Math.PI / 6),
      y: to.y - arrowSize * Math.sin(angle - Math.PI / 6),
    },
    {
      x: to.x - arrowSize * Math.cos(angle + Math.PI / 6),
      y: to.y - arrowSize * Math.sin(angle + Math.PI / 6),
    },
  ];

  // Label position
  const labelX = curved ? ctrlX : midX;
  const labelY = curved ? ctrlY - 15 : midY - 15;

  // Calculate bounding box
  const minX = Math.min(from.x, to.x, curved ? ctrlX : midX) - 50;
  const minY = Math.min(from.y, to.y, curved ? ctrlY : midY) - 50;
  const maxX = Math.max(from.x, to.x, curved ? ctrlX : midX) + 50;
  const maxY = Math.max(from.y, to.y, curved ? ctrlY : midY) + 50;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        overflow: 'visible',
        pointerEvents: 'none',
        opacity: progress,
        ...style,
      }}
    >
      {/* Glow effect */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 4}
        strokeLinecap="round"
        opacity={0.2}
        transform={`translate(${-minX}, ${-minY})`}
        style={{
          filter: 'blur(4px)',
        }}
      />

      {/* Main path */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? '6,4' : 'none'}
        transform={`translate(${-minX}, ${-minY})`}
        strokeDashoffset={dashed ? (1 - progress) * length : 0}
      />

      {/* Arrow head */}
      <polygon
        points={arrowPoints
          .map((p) => `${p.x - minX},${p.y - minY}`)
          .join(' ')}
        fill={color}
        opacity={progress}
      />

      {/* Label */}
      {label && (
        <text
          x={labelX - minX}
          y={labelY - minY}
          fill={color}
          fontSize={14}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          opacity={progress}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

// ============================================
// Circle Highlight
// ============================================

interface CircleHighlightProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
  dashed?: boolean;
  animated?: boolean;
  pulse?: boolean;
  animationStartFrame?: number;
}

export const CircleHighlight: React.FC<CircleHighlightProps> = ({
  x,
  y,
  radius = 30,
  color = DSA_COLORS.cell.current,
  label,
  strokeWidth = 3,
  dashed = false,
  animated = true,
  pulse = true,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  const pulseScale = pulse ? 1 + Math.sin(frame * 0.15) * 0.05 : 1;

  return (
    <svg
      width={radius * 2 + 40}
      height={radius * 2 + 40}
      style={{
        position: 'absolute',
        left: x - radius - 20,
        top: y - radius - 20,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {/* Glow */}
      <circle
        cx={radius + 20}
        cy={radius + 20}
        r={radius * progress * pulseScale}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth + 6}
        opacity={0.2}
        style={{ filter: 'blur(6px)' }}
      />

      {/* Main circle */}
      <circle
        cx={radius + 20}
        cy={radius + 20}
        r={radius * progress * pulseScale}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '8,4' : 'none'}
        opacity={progress}
      />

      {/* Label */}
      {label && (
        <text
          x={radius + 20}
          y={-5}
          fill={color}
          fontSize={14}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
          opacity={progress}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

// ============================================
// Box Highlight
// ============================================

interface BoxHighlightProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
  strokeWidth?: number;
  dashed?: boolean;
  cornerRadius?: number;
  animated?: boolean;
  animationStartFrame?: number;
}

export const BoxHighlight: React.FC<BoxHighlightProps> = ({
  x,
  y,
  width,
  height,
  color = DSA_COLORS.cell.window,
  label,
  strokeWidth = 3,
  dashed = false,
  cornerRadius = 8,
  animated = true,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        border: `${strokeWidth}px ${dashed ? 'dashed' : 'solid'} ${color}`,
        borderRadius: cornerRadius,
        background: `${color}15`,
        opacity: progress,
        transform: `scale(${progress})`,
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}
    >
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 14,
            fontWeight: 600,
            color,
            whiteSpace: 'nowrap',
            background: DSA_COLORS.ui.background,
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

// ============================================
// Checkmark / XMark
// ============================================

interface CheckmarkProps {
  x: number;
  y: number;
  type: 'check' | 'x';
  size?: number;
  color?: string;
  animated?: boolean;
  animationStartFrame?: number;
}

export const CheckXMark: React.FC<CheckmarkProps> = ({
  x,
  y,
  type,
  size = 24,
  color,
  animated = true,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  const defaultColor = type === 'check' ? DSA_COLORS.ui.success : DSA_COLORS.ui.error;
  const displayColor = color || defaultColor;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${displayColor}20`,
        border: `2px solid ${displayColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        fontWeight: 700,
        color: displayColor,
        transform: `scale(${progress})`,
        opacity: progress,
        boxShadow: `0 0 10px ${displayColor}40`,
      }}
    >
      {type === 'check' ? '✓' : '✗'}
    </div>
  );
};

// ============================================
// Number Badge
// ============================================

interface NumberBadgeProps {
  x: number;
  y: number;
  number: number;
  size?: number;
  color?: string;
  animated?: boolean;
  animationStartFrame?: number;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({
  x,
  y,
  number,
  size = 28,
  color = DSA_COLORS.syntax.number,
  animated = true,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      })
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color: 'white',
        transform: `scale(${progress})`,
        opacity: progress,
        boxShadow: `0 2px 8px ${color}60`,
      }}
    >
      {number}
    </div>
  );
};

// ============================================
// Tooltip
// ============================================

interface TooltipProps {
  x: number;
  y: number;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
  animated?: boolean;
  animationStartFrame?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  x,
  y,
  text,
  position = 'top',
  color = DSA_COLORS.ui.text,
  animated = true,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 8,
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 8,
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 8,
    },
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
      }}
    >
      <div
        style={{
          position: 'absolute',
          ...positionStyles[position],
          padding: '6px 12px',
          background: DSA_COLORS.ui.card,
          border: `1px solid ${DSA_COLORS.ui.border}`,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color,
          whiteSpace: 'nowrap',
          opacity: progress,
          transform: `${positionStyles[position].transform} scale(${progress})`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ArrowAnnotation;
