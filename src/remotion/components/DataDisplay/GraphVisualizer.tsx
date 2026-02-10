// ============================================
// GRAPH VISUALIZER - Network/graph algorithms
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GraphVisualizerProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  title,
  nodes,
  edges,
  showWeights = true,
  highlightPath = [],
  width = 700,
  height = 500,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  // Check if node is in highlight path
  const isNodeHighlighted = (nodeId: string) => highlightPath.includes(nodeId);

  // Check if edge is in highlight path
  const isEdgeHighlighted = (from: string, to: string) => {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      if (
        (highlightPath[i] === from && highlightPath[i + 1] === to) ||
        (highlightPath[i] === to && highlightPath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  // Get node by ID
  const getNode = (id: string) => nodes.find((n) => n.id === id);

  // Render edges
  const renderEdges = () => {
    return edges.map((edge, i) => {
      const fromNode = getNode(edge.from);
      const toNode = getNode(edge.to);
      if (!fromNode || !toNode) return null;

      const edgeDelay = animationDelay + 5 + i * 3;
      const edgeProgress = interpolate(
        frame,
        [edgeDelay, edgeDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const isHighlighted = edge.highlighted || isEdgeHighlighted(edge.from, edge.to);
      const color = edge.color || (isHighlighted ? DATA_DISPLAY_COLORS.green : DATA_DISPLAY_COLORS.textDim);
      const rgb = hexToRgb(color);

      // Calculate line
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;

      // Shorten line to not overlap with nodes
      const nodeRadius = 25;
      const x1 = fromNode.x + unitX * nodeRadius;
      const y1 = fromNode.y + unitY * nodeRadius;
      const x2 = toNode.x - unitX * nodeRadius;
      const y2 = toNode.y - unitY * nodeRadius;

      // Midpoint for weight label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Arrow for directed edges
      const arrowSize = 10;
      const arrowAngle = Math.atan2(dy, dx);

      return (
        <g key={`edge-${i}`}>
          {/* Edge line */}
          <line
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * edgeProgress}
            y2={y1 + (y2 - y1) * edgeProgress}
            stroke={color}
            strokeWidth={isHighlighted ? 3 : 2}
            opacity={isHighlighted ? 1 : 0.5}
            filter={isHighlighted ? `drop-shadow(0 0 8px rgba(${rgb}, 0.5))` : undefined}
          />

          {/* Arrow for directed edges */}
          {edge.directed && edgeProgress > 0.8 && (
            <polygon
              points={`
                ${x2},${y2}
                ${x2 - arrowSize * Math.cos(arrowAngle - 0.4)},${y2 - arrowSize * Math.sin(arrowAngle - 0.4)}
                ${x2 - arrowSize * Math.cos(arrowAngle + 0.4)},${y2 - arrowSize * Math.sin(arrowAngle + 0.4)}
              `}
              fill={color}
              opacity={edgeProgress}
            />
          )}

          {/* Weight label */}
          {showWeights && edge.weight !== undefined && (
            <g opacity={edgeProgress}>
              <rect
                x={midX - 15}
                y={midY - 10}
                width={30}
                height={20}
                rx={4}
                fill={DATA_DISPLAY_COLORS.cardBg}
                stroke={color}
                strokeWidth={1}
              />
              <text
                x={midX}
                y={midY + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={12}
                fontFamily={FONTS.mono}
                fontWeight={600}
              >
                {edge.weight}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  // Render nodes
  const renderNodes = () => {
    return nodes.map((node, i) => {
      const nodeDelay = animationDelay + 15 + i * 5;
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

      const isHighlighted = node.highlighted || isNodeHighlighted(node.id);
      const color = node.color || (isHighlighted ? DATA_DISPLAY_COLORS.green : DATA_DISPLAY_COLORS.cyan);
      const rgb = hexToRgb(color);
      const nodeRadius = 25;

      return (
        <g
          key={`node-${i}`}
          style={{
            opacity: nodeOpacity,
          }}
        >
          {/* Glow for highlighted */}
          {isHighlighted && (
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius + 8}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.3}
              filter={`blur(4px)`}
            />
          )}

          {/* Node circle */}
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius * nodeScale}
            fill={`rgba(${rgb}, ${isHighlighted ? 0.3 : 0.15})`}
            stroke={color}
            strokeWidth={isHighlighted ? 3 : 2}
            filter={isHighlighted ? `drop-shadow(0 0 15px rgba(${rgb}, 0.5))` : undefined}
          />

          {/* Icon or label */}
          {node.icon ? (
            <foreignObject
              x={node.x - 12}
              y={node.y - 12}
              width={24}
              height={24}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderIcon(node.icon, 20, color)}
              </div>
            </foreignObject>
          ) : (
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={DATA_DISPLAY_COLORS.text}
              fontSize={14}
              fontFamily={FONTS.heading}
              fontWeight={600}
            >
              {node.label}
            </text>
          )}

          {/* Label below node if has icon */}
          {node.icon && (
            <text
              x={node.x}
              y={node.y + nodeRadius + 16}
              textAnchor="middle"
              fill={DATA_DISPLAY_COLORS.text}
              fontSize={12}
              fontFamily={FONTS.body}
              fontWeight={500}
              opacity={nodeOpacity}
            >
              {node.label}
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
      <svg width={width} height={height - (title ? 50 : 0)} style={{ overflow: 'visible' }}>
        {renderEdges()}
        {renderNodes()}
      </svg>
    </div>
  );
};

export default GraphVisualizer;
