// ============================================
// DECISION TREE - Branching yes/no flow
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { DecisionTreeProps, DecisionNode } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

interface NodePosition {
  node: DecisionNode;
  x: number;
  y: number;
  level: number;
  parentX?: number;
  parentY?: number;
  branch?: 'yes' | 'no';
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({
  title,
  root,
  yesLabel = 'Yes',
  noLabel = 'No',
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

  const startY = title ? 80 : 30;

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
    const levelHeight = 120;
    const MAX_DEPTH = 20; // Prevent infinite recursion

    const processNode = (
      node: DecisionNode | undefined | null,
      level: number,
      xMin: number,
      xMax: number,
      parentX?: number,
      parentY?: number,
      branch?: 'yes' | 'no'
    ) => {
      // Defensive check: skip if node is undefined/null or max depth reached
      if (!node || level >= MAX_DEPTH) {
        return;
      }

      const nodeX = (xMin + xMax) / 2;
      const nodeY = startY + level * levelHeight;

      positions.push({
        node,
        x: nodeX,
        y: nodeY,
        level,
        parentX,
        parentY,
        branch,
      });

      const midX = (xMin + xMax) / 2;

      // Only process children if they exist and are valid objects
      if (node.yes && typeof node.yes === 'object') {
        processNode(node.yes, level + 1, xMin, midX, nodeX, nodeY, 'yes');
      }
      if (node.no && typeof node.no === 'object') {
        processNode(node.no, level + 1, midX, xMax, nodeX, nodeY, 'no');
      }
    };

    // Only process if root is valid
    if (root && typeof root === 'object') {
      processNode(root, 0, 0, width);
    }
    return positions;
  };

  const positions = calculatePositions();

  // Render connections
  const renderConnections = () => {
    return positions
      .filter((p) => p.parentX !== undefined && p.parentY !== undefined)
      .map((pos, i) => {
        const lineDelay = animationDelay + 10 + pos.level * 10;
        const lineProgress = interpolate(
          frame,
          [lineDelay, lineDelay + 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const isYes = pos.branch === 'yes';
        const color = isYes ? DATA_DISPLAY_COLORS.green : DATA_DISPLAY_COLORS.red;

        // Calculate path
        const startX = pos.parentX!;
        const startY = pos.parentY! + 30;
        const endX = pos.x;
        const endY = pos.y - 30;
        const midY = (startY + endY) / 2;

        const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

        // Arrow at end
        const arrowSize = 8;

        return (
          <g key={`conn-${i}`}>
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray={200}
              strokeDashoffset={200 * (1 - lineProgress)}
              opacity={0.7}
            />
            {/* Branch label */}
            <text
              x={(startX + endX) / 2 + (isYes ? -20 : 20)}
              y={midY - 5}
              textAnchor="middle"
              fill={color}
              fontSize={11}
              fontFamily={FONTS.body}
              fontWeight={600}
              opacity={lineProgress}
            >
              {isYes ? yesLabel : noLabel}
            </text>
            {/* Arrow */}
            <polygon
              points={`${endX},${endY} ${endX - arrowSize},${endY - arrowSize} ${endX + arrowSize},${endY - arrowSize}`}
              fill={color}
              opacity={lineProgress}
            />
          </g>
        );
      });
  };

  // Render nodes
  const renderNodes = () => {
    return positions.map((pos, i) => {
      const nodeDelay = animationDelay + 5 + pos.level * 12;
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

      const isQuestion = pos.node.type === 'question';
      const color = pos.node.color || (isQuestion ? DATA_DISPLAY_COLORS.purple : DATA_DISPLAY_COLORS.cyan);
      const rgb = hexToRgb(color);

      const nodeWidth = isQuestion ? 160 : 120;
      const nodeHeight = isQuestion ? 60 : 50;

      return (
        <g key={`node-${i}`}>
          <foreignObject
            x={pos.x - nodeWidth / 2}
            y={pos.y - nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            style={{ overflow: 'visible' }}
          >
            <div
              style={{
                width: nodeWidth,
                height: nodeHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: isQuestion ? 12 : 25,
                background: `rgba(${rgb}, 0.15)`,
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px rgba(${rgb}, 0.25)`,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
              }}
            >
              {pos.node.icon && (
                <div style={{ flexShrink: 0 }}>
                  {renderIcon(pos.node.icon, 18, color)}
                </div>
              )}
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: isQuestion ? 13 : 12,
                  fontWeight: 600,
                  color: DATA_DISPLAY_COLORS.text,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {pos.node.label}
              </span>
            </div>
          </foreignObject>
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

export default DecisionTree;
