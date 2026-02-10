// ============================================
// CIRCULAR FLOW - Looping/feedback process
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { CircularFlowProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const CircularFlow: React.FC<CircularFlowProps> = ({
  title,
  nodes,
  centerLabel,
  centerIcon,
  showArrows = true,
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
  const nodeRadius = 45;

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

  // Calculate node positions
  const angleStep = (2 * Math.PI) / nodes.length;
  const nodePositions = nodes.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  });

  // Animated flow indicator
  const flowProgress = ((frame - animationDelay) % 90) / 90;

  // Render arrows between nodes
  const renderArrows = () => {
    if (!showArrows) return null;

    return nodePositions.map((pos, i) => {
      const nextPos = nodePositions[(i + 1) % nodes.length];
      const arrowDelay = animationDelay + 20 + i * 8;
      const arrowOpacity = interpolate(
        frame,
        [arrowDelay, arrowDelay + 15],
        [0, 0.6],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const node = nodes[i];
      const color = node.color || DATA_DISPLAY_COLORS.cyan;

      // Calculate arc path
      const startAngle = pos.angle + 0.3;
      const endAngle = nodePositions[(i + 1) % nodes.length].angle - 0.3;

      const startX = centerX + radius * Math.cos(startAngle);
      const startY = centerY + radius * Math.sin(startAngle);
      const endX = centerX + radius * Math.cos(endAngle);
      const endY = centerY + radius * Math.sin(endAngle);

      // Arrow head
      const arrowAngle = endAngle + Math.PI / 2;
      const arrowSize = 8;

      return (
        <g key={`arrow-${i}`} opacity={arrowOpacity}>
          {/* Arc path */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="8 4"
          />
          {/* Arrow head */}
          <polygon
            points={`
              ${endX},${endY}
              ${endX - arrowSize * Math.cos(arrowAngle - 0.5)},${endY - arrowSize * Math.sin(arrowAngle - 0.5)}
              ${endX - arrowSize * Math.cos(arrowAngle + 0.5)},${endY - arrowSize * Math.sin(arrowAngle + 0.5)}
            `}
            fill={color}
          />
        </g>
      );
    });
  };

  // Render nodes
  const renderNodes = () => {
    return nodePositions.map((pos, i) => {
      const node = nodes[i];
      const nodeDelay = animationDelay + 10 + i * 10;
      const nodeSpring = spring({
        frame: Math.max(0, frame - nodeDelay),
        fps,
        config: { damping: 12, mass: 0.5, stiffness: 100 },
      });

      const nodeOpacity = interpolate(
        frame,
        [nodeDelay, nodeDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const nodeScale = interpolate(nodeSpring, [0, 1], [0.5, 1]);

      const color = node.color || DATA_DISPLAY_COLORS.cyan;
      const rgb = hexToRgb(color);

      return (
        <g key={`node-${i}`}>
          <foreignObject
            x={pos.x - nodeRadius}
            y={pos.y - nodeRadius}
            width={nodeRadius * 2}
            height={nodeRadius * 2}
            style={{ overflow: 'visible' }}
          >
            <div
              style={{
                width: nodeRadius * 2,
                height: nodeRadius * 2,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: `linear-gradient(135deg, rgba(${rgb}, 0.2), rgba(${rgb}, 0.1))`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px rgba(${rgb}, 0.3)`,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
              }}
            >
              {node.icon && renderIcon(node.icon, 22, color)}
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 11,
                  fontWeight: 600,
                  color: DATA_DISPLAY_COLORS.text,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {node.label}
              </span>
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Render center
  const renderCenter = () => {
    if (!centerLabel && !centerIcon) return null;

    const centerDelay = animationDelay + 5;
    const centerSpring = spring({
      frame: Math.max(0, frame - centerDelay),
      fps,
      config: { damping: 12, mass: 0.5, stiffness: 100 },
    });

    const centerOpacity = interpolate(
      frame,
      [centerDelay, centerDelay + 15],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const centerScale = interpolate(centerSpring, [0, 1], [0.5, 1]);

    const rgb = hexToRgb(DATA_DISPLAY_COLORS.purple);

    return (
      <foreignObject
        x={centerX - 50}
        y={centerY - 50}
        width={100}
        height={100}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: `radial-gradient(circle, rgba(${rgb}, 0.2), rgba(${rgb}, 0.05))`,
            border: `2px solid ${DATA_DISPLAY_COLORS.purple}60`,
            boxShadow: `0 0 30px rgba(${rgb}, 0.2)`,
            opacity: centerOpacity,
            transform: `scale(${centerScale})`,
          }}
        >
          {centerIcon && renderIcon(centerIcon, 28, DATA_DISPLAY_COLORS.purple)}
          {centerLabel && (
            <span
              style={{
                fontFamily: FONTS.heading,
                fontSize: 12,
                fontWeight: 600,
                color: DATA_DISPLAY_COLORS.purple,
                textAlign: 'center',
              }}
            >
              {centerLabel}
            </span>
          )}
        </div>
      </foreignObject>
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

      {/* SVG */}
      <svg width={width} height={height - (title ? 50 : 0)} style={{ overflow: 'visible' }}>
        {renderArrows()}
        {renderCenter()}
        {renderNodes()}
      </svg>
    </div>
  );
};

export default CircularFlow;
