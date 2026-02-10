// ============================================
// PROS CONS GRID - Two-column comparison
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ProsConsGridProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const ProsConsGrid: React.FC<ProsConsGridProps> = ({
  title,
  pros = [],
  cons = [],
  prosTitle = 'Pros',
  consTitle = 'Cons',
  prosColor = DATA_DISPLAY_COLORS.green,
  consColor = DATA_DISPLAY_COLORS.red,
  width = 700,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prosRgb = hexToRgb(prosColor);
  const consRgb = hexToRgb(consColor);
  const columnWidth = (width - 24) / 2;

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
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Header animation
  const headerOpacity = interpolate(
    frame,
    [animationDelay + 5, animationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const renderColumn = (
    items: { text: string; icon?: string }[] | undefined | null,
    isPros: boolean
  ) => {
    const safeItems = items || [];
    const color = isPros ? prosColor : consColor;
    const rgb = isPros ? prosRgb : consRgb;
    const defaultIcon = isPros ? 'check' : 'x';
    const colTitle = isPros ? prosTitle : consTitle;
    const baseDelay = isPros ? animationDelay + 15 : animationDelay + 20;

    return (
      <div
        style={{
          width: columnWidth,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Column header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            background: `linear-gradient(135deg, rgba(${rgb}, 0.2), rgba(${rgb}, 0.1))`,
            border: `2px solid ${color}60`,
            opacity: headerOpacity,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `rgba(${rgb}, 0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderIcon(isPros ? 'thumbs-up' : 'thumbs-down', 18, color)}
          </div>
          <span
            style={{
              fontFamily: FONTS.heading,
              fontSize: 18,
              fontWeight: 700,
              color: color,
            }}
          >
            {colTitle}
          </span>
        </div>

        {/* Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {safeItems.map((item, idx) => {
            const itemDelay = baseDelay + idx * 8;
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

            const itemTranslateX = isPros
              ? interpolate(itemSpring, [0, 1], [-20, 0])
              : interpolate(itemSpring, [0, 1], [20, 0]);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: `rgba(${rgb}, 0.05)`,
                  border: `1px solid rgba(${rgb}, 0.2)`,
                  opacity: itemOpacity,
                  transform: `translateX(${itemTranslateX}px)`,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: `rgba(${rgb}, 0.15)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {renderIcon(item.icon || defaultIcon, 14, color)}
                </div>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    color: DATA_DISPLAY_COLORS.text,
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

      {/* Grid container */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          padding: 20,
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          borderRadius: 16,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {/* Pros column */}
        {renderColumn(pros, true)}

        {/* Divider */}
        <div
          style={{
            width: 2,
            background: `linear-gradient(180deg, transparent, ${DATA_DISPLAY_COLORS.textDim}40, transparent)`,
            borderRadius: 1,
          }}
        />

        {/* Cons column */}
        {renderColumn(cons, false)}
      </div>
    </div>
  );
};

export default ProsConsGrid;
