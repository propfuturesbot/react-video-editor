// ============================================
// TREE VIEW - Hierarchical tree with expandable nodes
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TreeViewProps, TreeNode } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  expandedIds: string[];
  highlightPath: string[];
  animationDelay: number;
  frame: number;
  fps: number;
  isHorizontal: boolean;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  isExpanded,
  isHighlighted,
  expandedIds,
  highlightPath,
  animationDelay,
  frame,
  fps,
  isHorizontal,
}) => {
  const nodeDelay = animationDelay + level * 8;
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

  const nodeScale = interpolate(nodeSpring, [0, 1], [0.8, 1]);
  const color = node.color || DATA_DISPLAY_COLORS.cyan;
  const rgb = hexToRgb(color);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? 'flex-start' : 'flex-start',
        gap: isHorizontal ? 30 : 8,
      }}
    >
      {/* Node */}
      <div
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'column' : 'row',
          alignItems: 'center',
          gap: 8,
          opacity: nodeOpacity,
          transform: `scale(${nodeScale})`,
        }}
      >
        {/* Node box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 10,
            background: isHighlighted
              ? `linear-gradient(135deg, rgba(${rgb}, 0.25), rgba(${rgb}, 0.1))`
              : `rgba(${rgb}, 0.1)`,
            border: `2px solid ${isHighlighted ? color : `rgba(${rgb}, 0.4)`}`,
            boxShadow: isHighlighted
              ? `0 0 20px rgba(${rgb}, 0.3), 0 0 40px rgba(${rgb}, 0.15)`
              : `0 0 10px rgba(${rgb}, 0.1)`,
            whiteSpace: 'nowrap',
          }}
        >
          {node.icon && (
            <div style={{ flexShrink: 0 }}>
              {renderIcon(node.icon, 18, color)}
            </div>
          )}
          <span
            style={{
              fontFamily: FONTS.heading,
              fontSize: 14,
              fontWeight: 600,
              color: isHighlighted ? color : DATA_DISPLAY_COLORS.text,
            }}
          >
            {node.label}
          </span>
          {hasChildren && (
            <div style={{ marginLeft: 4, opacity: 0.6 }}>
              {renderIcon(isExpanded ? 'chevron-down' : 'chevron-right', 14, DATA_DISPLAY_COLORS.textMuted)}
            </div>
          )}
        </div>

        {/* Connector line to children (vertical layout) */}
        {!isHorizontal && hasChildren && isExpanded && (
          <div
            style={{
              width: 2,
              height: 16,
              background: `linear-gradient(180deg, ${color}, transparent)`,
              marginLeft: 28,
            }}
          />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'column' : 'column',
            gap: isHorizontal ? 12 : 8,
            marginLeft: isHorizontal ? 0 : 28,
            paddingLeft: isHorizontal ? 0 : 20,
            borderLeft: isHorizontal ? 'none' : `2px solid ${DATA_DISPLAY_COLORS.textDim}30`,
            position: 'relative',
          }}
        >
          {/* Horizontal connector */}
          {isHorizontal && (
            <div
              style={{
                position: 'absolute',
                left: -30,
                top: '50%',
                width: 30,
                height: 2,
                background: `linear-gradient(90deg, ${color}50, ${color})`,
              }}
            />
          )}

          {node.children!.map((child, idx) => (
            <div key={child.id} style={{ position: 'relative' }}>
              {/* Horizontal branch line to child (vertical layout) */}
              {!isHorizontal && (
                <div
                  style={{
                    position: 'absolute',
                    left: -20,
                    top: 20,
                    width: 18,
                    height: 2,
                    background: DATA_DISPLAY_COLORS.textDim + '50',
                  }}
                />
              )}

              <TreeNodeComponent
                node={child}
                level={level + 1}
                isExpanded={expandedIds.includes(child.id)}
                isHighlighted={highlightPath.includes(child.id)}
                expandedIds={expandedIds}
                highlightPath={highlightPath}
                animationDelay={animationDelay + (level + 1) * 8 + idx * 5}
                frame={frame}
                fps={fps}
                isHorizontal={isHorizontal}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  title,
  root,
  expandedIds = [],
  highlightPath = [],
  orientation = 'vertical',
  width,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // By default, expand all nodes for animation
  const effectiveExpandedIds =
    expandedIds.length > 0 ? expandedIds : getAllNodeIds(root);

  const isHorizontal = orientation === 'horizontal';
  const containerWidth = width || (isHorizontal ? 800 : 500);
  const containerHeight = height || 'auto';

  // Main container animation
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
      ? { position: 'absolute', left: x - containerWidth / 2, top: y }
      : {};

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
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
            marginBottom: 24,
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

      {/* Tree */}
      <div
        style={{
          padding: 20,
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          borderRadius: 16,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        <TreeNodeComponent
          node={root}
          level={0}
          isExpanded={effectiveExpandedIds.includes(root.id)}
          isHighlighted={highlightPath.includes(root.id)}
          expandedIds={effectiveExpandedIds}
          highlightPath={highlightPath}
          animationDelay={animationDelay + 10}
          frame={frame}
          fps={fps}
          isHorizontal={isHorizontal}
        />
      </div>
    </div>
  );
};

// Helper to get all node IDs for default expansion
function getAllNodeIds(node: TreeNode): string[] {
  const ids = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids.push(...getAllNodeIds(child));
    });
  }
  return ids;
}

export default TreeView;
