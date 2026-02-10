// ============================================
// TIMELINE - Linear progression with step markers
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TimelineProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const Timeline: React.FC<TimelineProps> = ({
  title,
  items: rawItems,
  orientation = 'horizontal',
  connectorStyle = 'solid',
  defaultColor = DATA_DISPLAY_COLORS.cyan,
  activeStep,
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

  // Ensure items is always an array
  const items = rawItems || [];

  const isHorizontal = orientation === 'horizontal';
  const containerWidth = width || (isHorizontal ? 900 : 400);
  const containerHeight = height || (isHorizontal ? 200 : items.length * 120 + 60);

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

  // Calculate positions
  const stepSpacing = isHorizontal
    ? (containerWidth - 100) / Math.max(items.length - 1, 1)
    : (containerHeight - 140) / Math.max(items.length - 1, 1);

  // Line animation
  const lineDelay = animationDelay + 10;
  const lineProgress = interpolate(
    frame,
    [lineDelay, lineDelay + items.length * 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Connector line style
  const getConnectorStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      background:
        connectorStyle === 'solid'
          ? `linear-gradient(${isHorizontal ? '90deg' : '180deg'}, ${defaultColor}, ${DATA_DISPLAY_COLORS.purple})`
          : 'transparent',
    };

    if (connectorStyle !== 'solid') {
      const dashColor = defaultColor;
      base.backgroundImage = isHorizontal
        ? `repeating-linear-gradient(90deg, ${dashColor} 0px, ${dashColor} ${connectorStyle === 'dashed' ? '12px' : '4px'}, transparent ${connectorStyle === 'dashed' ? '12px' : '4px'}, transparent ${connectorStyle === 'dashed' ? '20px' : '10px'})`
        : `repeating-linear-gradient(180deg, ${dashColor} 0px, ${dashColor} ${connectorStyle === 'dashed' ? '12px' : '4px'}, transparent ${connectorStyle === 'dashed' ? '12px' : '4px'}, transparent ${connectorStyle === 'dashed' ? '20px' : '10px'})`;
    }

    return base;
  };

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

      {/* Timeline container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isHorizontal ? 160 : containerHeight - (title ? 60 : 0),
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isHorizontal ? '0 50px' : '30px 0',
        }}
      >
        {/* Connector line */}
        <div
          style={{
            ...getConnectorStyle(),
            ...(isHorizontal
              ? {
                  top: 28,
                  left: 50,
                  height: 4,
                  width: `${lineProgress * (containerWidth - 100)}px`,
                  borderRadius: 2,
                }
              : {
                  left: 28,
                  top: 30,
                  width: 4,
                  height: `${lineProgress * (containerHeight - 140)}px`,
                  borderRadius: 2,
                }),
          }}
        />

        {/* Steps */}
        {items.map((item, idx) => {
          const stepDelay = animationDelay + 15 + idx * 12;
          const stepSpring = spring({
            frame: Math.max(0, frame - stepDelay),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 100 },
          });

          const stepOpacity = interpolate(
            frame,
            [stepDelay, stepDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const stepScale = interpolate(stepSpring, [0, 1], [0.5, 1]);
          const color = item.color || defaultColor;
          const rgb = hexToRgb(color);
          const isActive = activeStep === idx;

          return (
            <div
              key={idx}
              style={{
                position: isHorizontal ? 'relative' : 'relative',
                display: 'flex',
                flexDirection: isHorizontal ? 'column' : 'row',
                alignItems: 'center',
                gap: isHorizontal ? 12 : 16,
                opacity: stepOpacity,
                transform: `scale(${stepScale})`,
                zIndex: 10,
              }}
            >
              {/* Step marker */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: isActive
                    ? `linear-gradient(135deg, ${color}, ${DATA_DISPLAY_COLORS.purple})`
                    : `rgba(${rgb}, 0.15)`,
                  border: `3px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? `0 0 25px rgba(${rgb}, 0.5), 0 0 50px rgba(${rgb}, 0.25)`
                    : `0 0 15px rgba(${rgb}, 0.2)`,
                  flexShrink: 0,
                }}
              >
                {item.icon ? (
                  renderIcon(item.icon, 24, isActive ? '#fff' : color)
                ) : (
                  <span
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 20,
                      fontWeight: 700,
                      color: isActive ? '#fff' : color,
                    }}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Step content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isHorizontal ? 'center' : 'flex-start',
                  textAlign: isHorizontal ? 'center' : 'left',
                  maxWidth: isHorizontal ? stepSpacing - 20 : 280,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.heading,
                    fontSize: 16,
                    fontWeight: 600,
                    color: isActive ? color : DATA_DISPLAY_COLORS.text,
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
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
