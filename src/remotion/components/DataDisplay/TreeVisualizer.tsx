// ============================================
// TREE VISUALIZER - Binary tree with animations
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TreeVisualizerProps, BinaryTreeNode } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';

interface NodePosition {
  node: BinaryTreeNode;
  x: number;
  y: number;
  level: number;
  parentX?: number;
  parentY?: number;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  title,
  root,
  highlightNodes = [],
  nodeSize = 50,
  width = 700,
  height = 450,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startY = title ? 70 : 40;
  const levelHeight = 80;

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

  // Calculate tree depth
  const getTreeDepth = (node: BinaryTreeNode | undefined): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
  };

  const treeDepth = getTreeDepth(root);

  // Calculate positions for all nodes
  const calculatePositions = (): NodePosition[] => {
    const positions: NodePosition[] = [];

    const processNode = (
      node: BinaryTreeNode | undefined,
      level: number,
      xMin: number,
      xMax: number,
      parentX?: number,
      parentY?: number
    ) => {
      if (!node) return;

      const nodeX = (xMin + xMax) / 2;
      const nodeY = startY + level * levelHeight;

      positions.push({
        node,
        x: nodeX,
        y: nodeY,
        level,
        parentX,
        parentY,
      });

      const midX = (xMin + xMax) / 2;
      processNode(node.left, level + 1, xMin, midX, nodeX, nodeY);
      processNode(node.right, level + 1, midX, xMax, nodeX, nodeY);
    };

    processNode(root, 0, 50, width - 50);
    return positions;
  };

  const positions = calculatePositions();

  // Check if node value is highlighted
  const isHighlighted = (value: number | string) =>
    highlightNodes.includes(value);

  // Render connections
  const renderConnections = () => {
    return positions
      .filter((p) => p.parentX !== undefined && p.parentY !== undefined)
      .map((pos, i) => {
        const lineDelay = animationDelay + 5 + pos.level * 8;
        const lineProgress = interpolate(
          frame,
          [lineDelay, lineDelay + 15],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const nodeHighlighted = pos.node.highlighted || isHighlighted(pos.node.value);
        const color = pos.node.color || (nodeHighlighted ? DATA_DISPLAY_COLORS.green : DATA_DISPLAY_COLORS.cyan);

        // Line from parent to current node
        const x1 = pos.parentX!;
        const y1 = pos.parentY! + nodeSize / 2;
        const x2 = pos.x;
        const y2 = pos.y - nodeSize / 2;

        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * lineProgress}
            y2={y1 + (y2 - y1) * lineProgress}
            stroke={color}
            strokeWidth={2}
            opacity={0.6}
          />
        );
      });
  };

  // Render nodes
  const renderNodes = () => {
    return positions.map((pos, i) => {
      const nodeDelay = animationDelay + 10 + pos.level * 10;
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

      const nodeHighlighted = pos.node.highlighted || isHighlighted(pos.node.value);
      const color = pos.node.color || (nodeHighlighted ? DATA_DISPLAY_COLORS.green : DATA_DISPLAY_COLORS.cyan);
      const rgb = hexToRgb(color);

      return (
        <g key={`node-${i}`}>
          {/* Glow for highlighted */}
          {nodeHighlighted && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeSize / 2 + 6}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.4 * nodeOpacity}
              filter="blur(3px)"
            />
          )}

          {/* Node circle */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={(nodeSize / 2) * nodeScale}
            fill={`rgba(${rgb}, ${nodeHighlighted ? 0.3 : 0.15})`}
            stroke={color}
            strokeWidth={nodeHighlighted ? 3 : 2}
            opacity={nodeOpacity}
            filter={nodeHighlighted ? `drop-shadow(0 0 15px rgba(${rgb}, 0.5))` : undefined}
          />

          {/* Value */}
          <text
            x={pos.x}
            y={pos.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={nodeHighlighted ? color : DATA_DISPLAY_COLORS.text}
            fontSize={nodeSize * 0.4}
            fontFamily={FONTS.mono}
            fontWeight={700}
            opacity={nodeOpacity}
          >
            {pos.node.value}
          </text>
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
      <svg width={width} height={height - (title ? 40 : 0)} style={{ overflow: 'visible' }}>
        {renderConnections()}
        {renderNodes()}
      </svg>
    </div>
  );
};

export default TreeVisualizer;
