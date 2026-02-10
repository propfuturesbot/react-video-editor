// ============================================
// MODULE VIEW - Folder/package structure
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ModuleViewProps, ModuleItem } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

interface ModuleItemComponentProps {
  item: ModuleItem;
  path: string;
  level: number;
  isExpanded: boolean;
  expandedPaths: string[];
  animationDelay: number;
  frame: number;
  fps: number;
}

const ModuleItemComponent: React.FC<ModuleItemComponentProps> = ({
  item,
  path,
  level,
  isExpanded,
  expandedPaths,
  animationDelay,
  frame,
  fps,
}) => {
  const itemDelay = animationDelay + level * 6;
  const itemSpring = spring({
    frame: Math.max(0, frame - itemDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const itemOpacity = interpolate(
    frame,
    [itemDelay, itemDelay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const itemTranslateX = interpolate(itemSpring, [0, 1], [-20, 0]);

  // Get icon and color based on type
  const getTypeConfig = () => {
    switch (item.type) {
      case 'folder':
        return {
          icon: item.icon || (isExpanded ? 'folder-open' : 'folder'),
          color: item.color || DATA_DISPLAY_COLORS.yellow,
        };
      case 'module':
        return {
          icon: item.icon || 'package',
          color: item.color || DATA_DISPLAY_COLORS.purple,
        };
      case 'file':
      default:
        return {
          icon: item.icon || 'file-code',
          color: item.color || DATA_DISPLAY_COLORS.cyan,
        };
    }
  };

  const config = getTypeConfig();
  const rgb = hexToRgb(config.color);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Item row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          marginLeft: level * 24,
          borderRadius: 8,
          background: level === 0 ? `rgba(${rgb}, 0.1)` : 'transparent',
          opacity: itemOpacity,
          transform: `translateX(${itemTranslateX}px)`,
        }}
      >
        {/* Expand indicator */}
        {hasChildren && (
          <div
            style={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            {renderIcon(isExpanded ? 'chevron-down' : 'chevron-right', 14, DATA_DISPLAY_COLORS.textMuted)}
          </div>
        )}
        {!hasChildren && <div style={{ width: 16 }} />}

        {/* Icon */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: `rgba(${rgb}, 0.15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderIcon(config.icon, 16, config.color)}
        </div>

        {/* Name */}
        <span
          style={{
            fontFamily: item.type === 'file' ? FONTS.mono : FONTS.body,
            fontSize: 13,
            fontWeight: item.type === 'folder' || item.type === 'module' ? 600 : 400,
            color: item.type === 'file' ? DATA_DISPLAY_COLORS.textMuted : DATA_DISPLAY_COLORS.text,
          }}
        >
          {item.name}
        </span>

        {/* Type badge for modules */}
        {item.type === 'module' && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: `rgba(${rgb}, 0.2)`,
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: config.color,
              textTransform: 'uppercase',
            }}
          >
            module
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div
          style={{
            borderLeft: `1px dashed ${DATA_DISPLAY_COLORS.textDim}30`,
            marginLeft: level * 24 + 20,
            paddingLeft: 4,
          }}
        >
          {item.children!.map((child, idx) => {
            const childPath = `${path}/${child.name}`;
            return (
              <ModuleItemComponent
                key={childPath}
                item={child}
                path={childPath}
                level={level + 1}
                isExpanded={expandedPaths.includes(childPath)}
                expandedPaths={expandedPaths}
                animationDelay={animationDelay + (level + 1) * 6 + idx * 3}
                frame={frame}
                fps={fps}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ModuleView: React.FC<ModuleViewProps> = ({
  title,
  root,
  expandedPaths = [],
  width = 400,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // By default, expand root and first level
  const effectiveExpandedPaths =
    expandedPaths.length > 0 ? expandedPaths : getAllPaths(root, '');

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

  return (
    <div
      style={{
        width,
        height: height || 'auto',
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
            fontSize: 22,
            fontWeight: 700,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            marginBottom: 16,
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

      {/* Module tree */}
      <div
        style={{
          padding: 16,
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          borderRadius: 12,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        <ModuleItemComponent
          item={root}
          path={root.name}
          level={0}
          isExpanded={effectiveExpandedPaths.includes(root.name)}
          expandedPaths={effectiveExpandedPaths}
          animationDelay={animationDelay + 10}
          frame={frame}
          fps={fps}
        />
      </div>
    </div>
  );
};

// Helper to get all paths for default expansion
function getAllPaths(item: ModuleItem, parentPath: string): string[] {
  const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;
  const paths = [currentPath];

  if (item.children) {
    item.children.forEach((child) => {
      paths.push(...getAllPaths(child, currentPath));
    });
  }

  return paths;
}

export default ModuleView;
