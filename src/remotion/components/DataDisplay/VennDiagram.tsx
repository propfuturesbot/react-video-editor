// ============================================
// VENN DIAGRAM - Overlapping circles
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { VennDiagramProps, VennCircle } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

// Helper to detect if string is emoji vs icon name
const isEmoji = (str: string): boolean => {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(str) && str.length <= 4;
};

export const VennDiagram: React.FC<VennDiagramProps> = ({
  title,
  centerLabel,
  centerIcon,
  circles,
  showIntersection = true,
  width = 500,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate circle positions based on count
  const getCirclePositions = (count: number, centerX: number, centerY: number, radius: number) => {
    const positions: Array<{ cx: number; cy: number }> = [];
    const offset = radius * 0.5; // Overlap amount

    if (count === 2) {
      // Two circles side by side
      positions.push({ cx: centerX - offset, cy: centerY });
      positions.push({ cx: centerX + offset, cy: centerY });
    } else if (count === 3) {
      // Three circles in triangle formation
      const angleOffset = -Math.PI / 2; // Start from top
      for (let i = 0; i < 3; i++) {
        const angle = angleOffset + (i * 2 * Math.PI) / 3;
        positions.push({
          cx: centerX + Math.cos(angle) * offset,
          cy: centerY + Math.sin(angle) * offset,
        });
      }
    } else if (count === 4) {
      // Four circles in diamond formation
      positions.push({ cx: centerX, cy: centerY - offset });
      positions.push({ cx: centerX + offset, cy: centerY });
      positions.push({ cx: centerX, cy: centerY + offset });
      positions.push({ cx: centerX - offset, cy: centerY });
    } else {
      // Single circle
      positions.push({ cx: centerX, cy: centerY });
    }

    return positions;
  };

  const padding = 60;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2 + (title ? 15 : 0);
  const circleRadius = Math.min(availableWidth, availableHeight) / (circles.length > 2 ? 3 : 2.5);

  const positions = getCirclePositions(circles.length, centerX, centerY, circleRadius);

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y - height / 2 }
      : {};

  // Title animation
  const titleOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        ...positionStyles,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: titleOpacity,
          }}
        >
          <h3
            style={{
              fontFamily: FONTS.heading,
              fontSize: 20,
              fontWeight: 600,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
      )}

      {/* SVG for circles */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Glow filter definitions */}
        <defs>
          {circles.map((circle, i) => {
            const rgb = hexToRgb(circle.color);
            return (
              <filter key={`glow-${i}`} id={`venn-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feFlood floodColor={circle.color} floodOpacity="0.5" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>

        {/* Circles */}
        {circles.map((circle, i) => {
          const pos = positions[i];
          const rgb = hexToRgb(circle.color);

          const circleSpring = spring({
            frame: Math.max(0, frame - animationDelay - 10 - i * 8),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 80 },
          });

          const labelOpacity = interpolate(
            frame,
            [animationDelay + 25 + i * 8, animationDelay + 40 + i * 8],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Calculate label position (outside the circle)
          const labelAngle = Math.atan2(pos.cy - centerY, pos.cx - centerX);
          const labelDistance = circleRadius + 30;
          const labelX = pos.cx + Math.cos(labelAngle) * labelDistance;
          const labelY = pos.cy + Math.sin(labelAngle) * labelDistance;

          return (
            <g key={i}>
              {/* Circle with glow */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={circleRadius * circleSpring}
                fill={`rgba(${rgb}, 0.15)`}
                stroke={circle.color}
                strokeWidth={2}
                filter={`url(#venn-glow-${i})`}
                style={{ mixBlendMode: 'screen' }}
              />

              {/* Icon inside circle */}
              {circle.icon && (
                <foreignObject
                  x={pos.cx - 14}
                  y={pos.cy - 14 - (circle.description ? 10 : 0)}
                  width={28}
                  height={28}
                  opacity={circleSpring}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    {typeof circle.icon === 'string' && isEmoji(circle.icon)
                      ? <span style={{ fontSize: 24, lineHeight: 1 }}>{circle.icon}</span>
                      : renderIcon(circle.icon as string, 24, circle.color)
                    }
                  </div>
                </foreignObject>
              )}

              {/* Label */}
              <text
                x={circles.length === 1 ? pos.cx : labelX}
                y={circles.length === 1 ? pos.cy + circleRadius + 25 : labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={circle.color}
                fontFamily={FONTS.heading}
                fontSize={14}
                fontWeight={600}
                opacity={labelOpacity}
              >
                {circle.label}
              </text>

              {/* Description (if single circle) */}
              {circle.description && circles.length === 1 && (
                <text
                  x={pos.cx}
                  y={pos.cy + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={DATA_DISPLAY_COLORS.textMuted}
                  fontFamily={FONTS.body}
                  fontSize={12}
                  opacity={labelOpacity}
                >
                  {circle.description}
                </text>
              )}
            </g>
          );
        })}

        {/* Center intersection label */}
        {(centerLabel || centerIcon) && showIntersection && circles.length > 1 && (
          <g>
            {centerIcon && (
              <foreignObject
                x={centerX - 12}
                y={centerY - 12 - (centerLabel ? 8 : 0)}
                width={24}
                height={24}
                opacity={interpolate(
                  frame,
                  [animationDelay + 40, animationDelay + 55],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                )}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  {typeof centerIcon === 'string' && isEmoji(centerIcon)
                    ? <span style={{ fontSize: 20, lineHeight: 1 }}>{centerIcon}</span>
                    : renderIcon(centerIcon as string, 20, DATA_DISPLAY_COLORS.text)
                  }
                </div>
              </foreignObject>
            )}
            {centerLabel && (
              <text
                x={centerX}
                y={centerY + (centerIcon ? 12 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={DATA_DISPLAY_COLORS.text}
                fontFamily={FONTS.body}
                fontSize={12}
                fontWeight={600}
                opacity={interpolate(
                  frame,
                  [animationDelay + 45, animationDelay + 60],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                )}
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

export default VennDiagram;
