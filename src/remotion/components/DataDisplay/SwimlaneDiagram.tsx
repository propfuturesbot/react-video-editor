// ============================================
// SWIMLANE DIAGRAM - Horizontal lanes by owner/service
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SwimlaneDiagramProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const SwimlaneDiagram: React.FC<SwimlaneDiagramProps> = ({
  title,
  lanes,
  nodes,
  connections,
  width = 900,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const laneHeight = 100;
  const headerWidth = 120;
  const contentWidth = width - headerWidth - 40;
  const containerHeight = height || lanes.length * laneHeight + (title ? 80 : 40);

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

  // Get lane by ID
  const getLane = (laneId: string) => lanes.find((l) => l.id === laneId);
  const getLaneIndex = (laneId: string) => lanes.findIndex((l) => l.id === laneId);

  // Get node by ID
  const getNode = (nodeId: string) => nodes.find((n) => n.id === nodeId);

  // Calculate node position
  const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
    const node = getNode(nodeId);
    if (!node) return null;

    const laneIndex = getLaneIndex(node.laneId);
    if (laneIndex === -1) return null;

    const nodeX = headerWidth + 40 + (node.x / 100) * (contentWidth - 100);
    const nodeY = (title ? 60 : 20) + laneIndex * laneHeight + laneHeight / 2;

    return { x: nodeX, y: nodeY };
  };

  // Render connections
  const renderConnections = () => {
    return connections.map((conn, i) => {
      const fromPos = getNodePosition(conn.from);
      const toPos = getNodePosition(conn.to);
      if (!fromPos || !toPos) return null;

      const connDelay = animationDelay + 30 + i * 5;
      const connProgress = interpolate(
        frame,
        [connDelay, connDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const fromNode = getNode(conn.from);
      const color = getLane(fromNode?.laneId || '')?.color || DATA_DISPLAY_COLORS.cyan;

      // Calculate curved path
      const midX = (fromPos.x + toPos.x) / 2;
      const pathD = `M ${fromPos.x + 40} ${fromPos.y} Q ${midX} ${fromPos.y}, ${midX} ${(fromPos.y + toPos.y) / 2} Q ${midX} ${toPos.y}, ${toPos.x - 40} ${toPos.y}`;

      // Arrow
      const arrowSize = 8;
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);

      return (
        <g key={`conn-${i}`}>
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={300}
            strokeDashoffset={300 * (1 - connProgress)}
            opacity={0.6}
          />
          {/* Arrow */}
          <polygon
            points={`
              ${toPos.x - 40},${toPos.y}
              ${toPos.x - 40 - arrowSize},${toPos.y - arrowSize / 2}
              ${toPos.x - 40 - arrowSize},${toPos.y + arrowSize / 2}
            `}
            fill={color}
            opacity={connProgress}
          />
          {/* Connection label */}
          {conn.label && (
            <text
              x={midX}
              y={(fromPos.y + toPos.y) / 2 - 10}
              textAnchor="middle"
              fill={DATA_DISPLAY_COLORS.textMuted}
              fontSize={10}
              fontFamily={FONTS.body}
              opacity={connProgress}
            >
              {conn.label}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div
      style={{
        width,
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

      {/* Diagram container */}
      <div
        style={{
          position: 'relative',
          background: `${DATA_DISPLAY_COLORS.cardBg}50`,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Lanes */}
        {lanes.map((lane, laneIndex) => {
          const laneDelay = animationDelay + 5 + laneIndex * 8;
          const laneOpacity = interpolate(
            frame,
            [laneDelay, laneDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const color = lane.color || DATA_DISPLAY_COLORS.cyan;
          const rgb = hexToRgb(color);

          return (
            <div
              key={lane.id}
              style={{
                display: 'flex',
                height: laneHeight,
                borderBottom:
                  laneIndex < lanes.length - 1
                    ? `1px dashed ${DATA_DISPLAY_COLORS.textDim}30`
                    : 'none',
                opacity: laneOpacity,
              }}
            >
              {/* Lane header */}
              <div
                style={{
                  width: headerWidth,
                  height: laneHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: `rgba(${rgb}, 0.1)`,
                  borderRight: `2px solid ${color}40`,
                }}
              >
                {lane.icon && (
                  <div>{renderIcon(lane.icon, 22, color)}</div>
                )}
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 13,
                    fontWeight: 600,
                    color: color,
                    textAlign: 'center',
                  }}
                >
                  {lane.label}
                </span>
              </div>

              {/* Lane content area */}
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                }}
              />
            </div>
          );
        })}

        {/* SVG for connections */}
        <svg
          width={width}
          height={lanes.length * laneHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          {renderConnections()}
        </svg>

        {/* Nodes */}
        {nodes.map((node, nodeIndex) => {
          const pos = getNodePosition(node.id);
          if (!pos) return null;

          const lane = getLane(node.laneId);
          const color = lane?.color || DATA_DISPLAY_COLORS.cyan;
          const rgb = hexToRgb(color);

          const nodeDelay = animationDelay + 15 + nodeIndex * 6;
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

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: pos.x - 40,
                top: pos.y - 25,
                width: 80,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                background: `rgba(${rgb}, 0.15)`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 15px rgba(${rgb}, 0.2)`,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
              }}
            >
              {node.icon && (
                <div style={{ flexShrink: 0 }}>
                  {renderIcon(node.icon, 16, color)}
                </div>
              )}
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
          );
        })}
      </div>
    </div>
  );
};

export default SwimlaneDiagram;
