// ============================================
// SEGMENTED WHEEL - Radial diagram with center hub
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SegmentedWheelProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

// Helper to detect if string is emoji vs icon name
const isEmoji = (str: string): boolean => {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str) && str.length <= 4;
};

export const SegmentedWheel: React.FC<SegmentedWheelProps> = ({
  centerIcon,
  centerLabel,
  segments,
  radius = 180,
  connectionStyle = 'line',
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

  // Calculate dimensions
  const padding = 100;
  const componentWidth = width || radius * 2 + padding * 2;
  const componentHeight = height || radius * 2 + padding * 2;
  const centerX = componentWidth / 2;
  const centerY = componentHeight / 2;

  // Center hub radius
  const hubRadius = radius * 0.25;

  // Segment positions around the wheel
  const getSegmentPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      angle,
    };
  };

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - componentWidth / 2, top: y - componentHeight / 2 }
      : {};

  // Center hub animation
  const hubSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  return (
    <div
      style={{
        width: componentWidth,
        height: componentHeight,
        position: 'relative',
        ...positionStyles,
        ...style,
      }}
    >
      <svg
        width={componentWidth}
        height={componentHeight}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Glow filter */}
        <defs>
          {segments.map((segment, i) => (
            <filter key={`glow-${i}`} id={`wheel-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor={segment.color} floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Center glow */}
          <filter id="wheel-center-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor={DATA_DISPLAY_COLORS.purple} floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connectionStyle !== 'none' && segments.map((segment, i) => {
          const pos = getSegmentPosition(i, segments.length);
          const rgb = hexToRgb(segment.color);

          const lineProgress = animateIn
            ? interpolate(
                frame,
                [animationDelay + 15 + i * 5, animationDelay + 35 + i * 5],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )
            : 1;

          // Calculate line endpoints
          const startX = centerX + Math.cos(pos.angle) * (hubRadius + 5);
          const startY = centerY + Math.sin(pos.angle) * (hubRadius + 5);
          const endX = centerX + Math.cos(pos.angle) * (radius - 35);
          const endY = centerY + Math.sin(pos.angle) * (radius - 35);

          // Animated endpoint
          const currentEndX = startX + (endX - startX) * lineProgress;
          const currentEndY = startY + (endY - startY) * lineProgress;

          return (
            <g key={`line-${i}`}>
              {/* Glow line */}
              <line
                x1={startX}
                y1={startY}
                x2={currentEndX}
                y2={currentEndY}
                stroke={segment.color}
                strokeWidth={3}
                strokeOpacity={0.3}
                strokeLinecap="round"
              />
              {/* Main line */}
              <line
                x1={startX}
                y1={startY}
                x2={currentEndX}
                y2={currentEndY}
                stroke={segment.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={connectionStyle === 'arc' ? '4 2' : 'none'}
              />
            </g>
          );
        })}

        {/* Segment nodes */}
        {segments.map((segment, i) => {
          const pos = getSegmentPosition(i, segments.length);
          const rgb = hexToRgb(segment.color);

          const segmentSpring = spring({
            frame: Math.max(0, frame - animationDelay - 20 - i * 8),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 80 },
          });

          const labelOpacity = interpolate(
            frame,
            [animationDelay + 35 + i * 8, animationDelay + 50 + i * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Node size
          const nodeSize = 32;

          return (
            <g key={`segment-${i}`}>
              {/* Segment node background */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeSize * segmentSpring}
                fill={`rgba(${rgb}, 0.15)`}
                stroke={segment.color}
                strokeWidth={2}
                filter={`url(#wheel-glow-${i})`}
              />

              {/* Segment icon */}
              <foreignObject
                x={pos.x - nodeSize * 0.35}
                y={pos.y - nodeSize * 0.35}
                width={nodeSize * 0.7}
                height={nodeSize * 0.7}
                opacity={segmentSpring}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {typeof segment.icon === 'string' && isEmoji(segment.icon)
                    ? <span style={{ fontSize: nodeSize * 0.55, lineHeight: 1 }}>{segment.icon}</span>
                    : renderIcon(segment.icon as string, nodeSize * 0.55, segment.color)
                  }
                </div>
              </foreignObject>

              {/* Segment title */}
              <text
                x={pos.x}
                y={pos.y + nodeSize + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={segment.color}
                fontFamily={FONTS.heading}
                fontSize={13}
                fontWeight={600}
                opacity={labelOpacity}
              >
                {segment.title}
              </text>

              {/* Segment description */}
              {segment.description && (
                <text
                  x={pos.x}
                  y={pos.y + nodeSize + 32}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={DATA_DISPLAY_COLORS.textMuted}
                  fontFamily={FONTS.body}
                  fontSize={10}
                  opacity={labelOpacity * 0.8}
                >
                  {segment.description}
                </text>
              )}
            </g>
          );
        })}

        {/* Center hub */}
        <g>
          {/* Hub glow circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={hubRadius * hubSpring}
            fill={`rgba(${hexToRgb(DATA_DISPLAY_COLORS.purple)}, 0.2)`}
            stroke={DATA_DISPLAY_COLORS.purple}
            strokeWidth={3}
            filter="url(#wheel-center-glow)"
          />

          {/* Center icon */}
          <foreignObject
            x={centerX - hubRadius * 0.4}
            y={centerY - hubRadius * 0.4 - (centerLabel ? 5 : 0)}
            width={hubRadius * 0.8}
            height={hubRadius * 0.8}
            opacity={hubSpring}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              {typeof centerIcon === 'string' && isEmoji(centerIcon)
                ? <span style={{ fontSize: hubRadius * 0.6, lineHeight: 1 }}>{centerIcon}</span>
                : renderIcon(centerIcon as string, hubRadius * 0.6, DATA_DISPLAY_COLORS.purple)
              }
            </div>
          </foreignObject>

          {/* Center label */}
          {centerLabel && (
            <text
              x={centerX}
              y={centerY + hubRadius + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={DATA_DISPLAY_COLORS.text}
              fontFamily={FONTS.heading}
              fontSize={14}
              fontWeight={600}
              opacity={interpolate(
                frame,
                [animationDelay + 10, animationDelay + 25],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )}
            >
              {centerLabel}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

export default SegmentedWheel;
