// ============================================
// SUMMARY RECAP - Takeaway cards for video endings
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SummaryRecapProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const SummaryRecap: React.FC<SummaryRecapProps> = ({
  title = 'Key Takeaways',
  items,
  variant = 'cards',
  width = 800,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate container height based on variant
  const itemHeight = variant === 'cards' ? 100 : 60;
  const containerHeight = height || items.length * (itemHeight + 16) + (title ? 80 : 40);

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

  // Default colors
  const defaultColors = [
    DATA_DISPLAY_COLORS.cyan,
    DATA_DISPLAY_COLORS.green,
    DATA_DISPLAY_COLORS.purple,
    DATA_DISPLAY_COLORS.orange,
    DATA_DISPLAY_COLORS.pink,
  ];

  // Render card variant
  const renderCards = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        {items.map((item, i) => {
          const itemDelay = animationDelay + 20 + i * 12;
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

          const itemScale = interpolate(itemSpring, [0, 1], [0.8, 1]);
          const itemTranslateY = interpolate(itemSpring, [0, 1], [20, 0]);

          const color = item.color || defaultColors[i % defaultColors.length];
          const rgb = hexToRgb(color);
          const cardWidth = items.length <= 3 ? (width - 32) / items.length - 8 : (width - 32) / 2 - 8;

          return (
            <div
              key={i}
              style={{
                width: cardWidth,
                minWidth: 200,
                padding: 20,
                borderRadius: 12,
                background: `linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.05))`,
                border: `2px solid ${color}50`,
                boxShadow: `0 0 25px rgba(${rgb}, 0.2)`,
                opacity: itemOpacity,
                transform: `translateY(${itemTranslateY}px) scale(${itemScale})`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `rgba(${rgb}, 0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {item.icon ? renderIcon(item.icon, 22, color) : (
                    <span
                      style={{
                        fontFamily: FONTS.heading,
                        fontSize: 18,
                        fontWeight: 700,
                        color: color,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 15,
                      fontWeight: 600,
                      color: DATA_DISPLAY_COLORS.text,
                      margin: 0,
                      marginBottom: item.description ? 6 : 0,
                    }}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 13,
                        color: DATA_DISPLAY_COLORS.textMuted,
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render list variant
  const renderList = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 20,
          background: `${DATA_DISPLAY_COLORS.cardBg}80`,
          borderRadius: 12,
          border: `1px solid ${DATA_DISPLAY_COLORS.textDim}30`,
        }}
      >
        {items.map((item, i) => {
          const itemDelay = animationDelay + 20 + i * 8;
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const itemTranslateX = interpolate(
            frame,
            [itemDelay, itemDelay + 15],
            [-20, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const color = item.color || defaultColors[i % defaultColors.length];
          const rgb = hexToRgb(color);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 8,
                background: `rgba(${rgb}, 0.05)`,
                borderLeft: `3px solid ${color}`,
                opacity: itemOpacity,
                transform: `translateX(${itemTranslateX}px)`,
              }}
            >
              {item.icon && (
                <div style={{ flexShrink: 0 }}>
                  {renderIcon(item.icon, 20, color)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    fontWeight: 600,
                    color: DATA_DISPLAY_COLORS.text,
                  }}
                >
                  {item.title}
                </span>
                {item.description && (
                  <span
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 13,
                      color: DATA_DISPLAY_COLORS.textMuted,
                      marginLeft: 8,
                    }}
                  >
                    — {item.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render numbered variant
  const renderNumbered = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {items.map((item, i) => {
          const itemDelay = animationDelay + 20 + i * 10;
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

          const itemScale = interpolate(itemSpring, [0, 1], [0.9, 1]);

          const color = item.color || defaultColors[i % defaultColors.length];
          const rgb = hexToRgb(color);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${color}, ${DATA_DISPLAY_COLORS.purple})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 20px rgba(${rgb}, 0.4)`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <h4
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 18,
                    fontWeight: 600,
                    color: DATA_DISPLAY_COLORS.text,
                    margin: 0,
                    marginBottom: item.description ? 6 : 0,
                  }}
                >
                  {item.title}
                </h4>
                {item.description && (
                  <p
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      color: DATA_DISPLAY_COLORS.textMuted,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
            fontSize: 28,
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

      {/* Content based on variant */}
      {variant === 'cards' && renderCards()}
      {variant === 'list' && renderList()}
      {variant === 'numbered' && renderNumbered()}
    </div>
  );
};

export default SummaryRecap;
