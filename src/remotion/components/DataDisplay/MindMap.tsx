// ============================================
// MIND MAP - Central concept with branches
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { MindMapProps, MindMapNode } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

interface NodePosition {
  node: MindMapNode;
  x: number;
  y: number;
  level: number;
  angle: number;
  parentX?: number;
  parentY?: number;
}

export const MindMap: React.FC<MindMapProps> = ({
  title,
  root: rawRoot,
  layout = 'radial',
  width = 800,
  height = 600,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ensure root is always defined
  const root: MindMapNode = rawRoot || { label: 'Center', children: [] };

  const centerX = width / 2;
  const centerY = (height - (title ? 50 : 0)) / 2 + (title ? 50 : 0);

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

  // Calculate positions for all nodes
  const calculatePositions = (): NodePosition[] => {
    const positions: NodePosition[] = [];
    const levelRadius = [0, 140, 260, 350];

    const processNode = (
      node: MindMapNode,
      level: number,
      startAngle: number,
      angleSpan: number,
      parentX?: number,
      parentY?: number
    ) => {
      const angle = startAngle + angleSpan / 2;
      const radius = levelRadius[Math.min(level, levelRadius.length - 1)];
      const nodeX = centerX + radius * Math.cos(angle);
      const nodeY = centerY + radius * Math.sin(angle);

      positions.push({
        node,
        x: nodeX,
        y: nodeY,
        level,
        angle,
        parentX,
        parentY,
      });

      if (node.children && node.children.length > 0) {
        const childAngleSpan = angleSpan / node.children.length;
        node.children.forEach((child, i) => {
          const childStartAngle = startAngle + i * childAngleSpan;
          processNode(child, level + 1, childStartAngle, childAngleSpan, nodeX, nodeY);
        });
      }
    };

    processNode(root, 0, 0, Math.PI * 2);
    return positions;
  };

  const positions = calculatePositions();

  // Render connections
  const renderConnections = () => {
    return positions
      .filter((p) => p.parentX !== undefined && p.parentY !== undefined)
      .map((pos, i) => {
        const lineDelay = animationDelay + 10 + pos.level * 8;
        const lineProgress = interpolate(
          frame,
          [lineDelay, lineDelay + 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const color = pos.node.color || DATA_DISPLAY_COLORS.cyan;

        // Bezier curve for smooth connection
        const midX = (pos.parentX! + pos.x) / 2;
        const midY = (pos.parentY! + pos.y) / 2;
        const controlX = midX + (pos.y - pos.parentY!) * 0.2;
        const controlY = midY - (pos.x - pos.parentX!) * 0.2;

        const pathLength = Math.sqrt(
          Math.pow(pos.x - pos.parentX!, 2) + Math.pow(pos.y - pos.parentY!, 2)
        );

        return (
          <path
            key={`line-${i}`}
            d={`M ${pos.parentX} ${pos.parentY} Q ${controlX} ${controlY} ${pos.x} ${pos.y}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - lineProgress)}
            opacity={0.5}
          />
        );
      });
  };

  // Render nodes
  const renderNodes = () => {
    return positions.map((pos, i) => {
      const nodeDelay = animationDelay + 15 + pos.level * 12;
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

      const color = pos.node.color || DATA_DISPLAY_COLORS.cyan;
      const rgb = hexToRgb(color);
      const isRoot = pos.level === 0;
      const nodeSize = isRoot ? 100 : 70 - pos.level * 8;

      return (
        <g
          key={`node-${i}`}
          transform={`translate(${pos.x}, ${pos.y})`}
          style={{
            opacity: nodeOpacity,
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${nodeScale})`,
          }}
        >
          {/* Node background */}
          <circle
            cx={0}
            cy={0}
            r={nodeSize / 2}
            fill={`rgba(${rgb}, ${isRoot ? 0.3 : 0.15})`}
            stroke={color}
            strokeWidth={isRoot ? 3 : 2}
            filter={`drop-shadow(0 0 ${isRoot ? 20 : 10}px rgba(${rgb}, ${isRoot ? 0.5 : 0.3}))`}
          />

          {/* Icon */}
          {pos.node.icon && (
            <foreignObject
              x={-12}
              y={isRoot ? -20 : -10}
              width={24}
              height={24}
              style={{ overflow: 'visible' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderIcon(pos.node.icon, isRoot ? 24 : 18, color)}
              </div>
            </foreignObject>
          )}

          {/* Label */}
          <text
            x={0}
            y={pos.node.icon ? (isRoot ? 12 : 8) : 0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={DATA_DISPLAY_COLORS.text}
            fontSize={isRoot ? 14 : 11}
            fontFamily={FONTS.heading}
            fontWeight={isRoot ? 700 : 600}
          >
            {pos.node.label}
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
      <svg
        width={width}
        height={height - (title ? 50 : 0)}
        style={{ overflow: 'visible' }}
      >
        {renderConnections()}
        {renderNodes()}
      </svg>
    </div>
  );
};

export default MindMap;
