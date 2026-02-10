// ============================================
// AGENDA / ROADMAP - Progress indicator through sections
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AgendaProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const Agenda: React.FC<AgendaProps> = ({
  title = 'Agenda',
  items,
  orientation = 'horizontal',
  showProgress = true,
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

  const isHorizontal = orientation === 'horizontal';
  const containerWidth = width || (isHorizontal ? 800 : 350);
  const containerHeight = height || (isHorizontal ? 150 : items.length * 70 + 80);

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
      ? { position: 'absolute', left: x - containerWidth / 2, top: y }
      : {};

  // Calculate progress
  const completedCount = items.filter((i) => i.completed).length;
  const activeIndex = items.findIndex((i) => i.active);
  const progress = completedCount / items.length;

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        opacity: containerOpacity,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Title with progress */}
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            opacity: interpolate(
              frame,
              [animationDelay, animationDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}
        >
          <h2
            style={{
              fontFamily: FONTS.heading,
              fontSize: 22,
              fontWeight: 700,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
            }}
          >
            {title}
          </h2>
          {showProgress && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 6,
                  borderRadius: 3,
                  background: DATA_DISPLAY_COLORS.textDim + '40',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${DATA_DISPLAY_COLORS.green}, ${DATA_DISPLAY_COLORS.cyan})`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 12,
                  color: DATA_DISPLAY_COLORS.textMuted,
                }}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: isHorizontal ? 'flex-start' : 'stretch',
          gap: isHorizontal ? 16 : 12,
          position: 'relative',
        }}
      >
        {/* Connection line */}
        {isHorizontal && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              right: 24,
              height: 2,
              background: DATA_DISPLAY_COLORS.textDim + '30',
              zIndex: 0,
            }}
          >
            <div
              style={{
                width: `${((activeIndex >= 0 ? activeIndex : completedCount) / (items.length - 1)) * 100}%`,
                height: '100%',
                background: DATA_DISPLAY_COLORS.green,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}

        {items.map((item, i) => {
          const itemDelay = animationDelay + 15 + i * 8;
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

          const isActive = item.active;
          const isCompleted = item.completed;

          const statusColor = isCompleted
            ? DATA_DISPLAY_COLORS.green
            : isActive
              ? DATA_DISPLAY_COLORS.cyan
              : DATA_DISPLAY_COLORS.textDim;

          const rgb = hexToRgb(statusColor);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: isHorizontal ? 'column' : 'row',
                alignItems: 'center',
                gap: isHorizontal ? 10 : 14,
                flex: isHorizontal ? 1 : undefined,
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
                zIndex: 10,
              }}
            >
              {/* Step indicator */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: isCompleted
                    ? `linear-gradient(135deg, ${statusColor}, ${DATA_DISPLAY_COLORS.cyan})`
                    : isActive
                      ? `rgba(${rgb}, 0.2)`
                      : DATA_DISPLAY_COLORS.cardBg,
                  border: `2px solid ${statusColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive || isCompleted
                    ? `0 0 15px rgba(${rgb}, 0.3)`
                    : 'none',
                  flexShrink: 0,
                }}
              >
                {isCompleted ? (
                  renderIcon('check', 20, '#fff')
                ) : item.icon ? (
                  renderIcon(item.icon, 20, statusColor)
                ) : (
                  <span
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 16,
                      fontWeight: 700,
                      color: isActive ? statusColor : DATA_DISPLAY_COLORS.textMuted,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: FONTS.body,
                  fontSize: isHorizontal ? 13 : 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive || isCompleted
                    ? DATA_DISPLAY_COLORS.text
                    : DATA_DISPLAY_COLORS.textMuted,
                  textAlign: isHorizontal ? 'center' : 'left',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  textDecorationColor: DATA_DISPLAY_COLORS.textDim,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Agenda;
