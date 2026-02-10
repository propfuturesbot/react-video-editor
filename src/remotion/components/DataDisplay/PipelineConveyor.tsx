// ============================================
// PIPELINE CONVEYOR - Animated left→right flow
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { PipelineConveyorProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const PipelineConveyor: React.FC<PipelineConveyorProps> = ({
  title,
  stages,
  showPackets = true,
  packetColor = DATA_DISPLAY_COLORS.cyan,
  width = 900,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stageWidth = 120;
  const stageHeight = 80;
  const connectorWidth = (width - stages.length * stageWidth - 80) / Math.max(stages.length - 1, 1);
  const containerHeight = height || stageHeight + (title ? 100 : 60);

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

  // Get status color
  const getStatusColor = (status?: 'pending' | 'active' | 'completed') => {
    switch (status) {
      case 'completed':
        return DATA_DISPLAY_COLORS.green;
      case 'active':
        return DATA_DISPLAY_COLORS.orange;
      case 'pending':
      default:
        return DATA_DISPLAY_COLORS.cyan;
    }
  };

  // Packet animation (continuous loop)
  const packetCycle = 120; // frames per cycle
  const packetProgress = ((frame - animationDelay) % packetCycle) / packetCycle;

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

      {/* Pipeline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          position: 'relative',
        }}
      >
        {stages.map((stage, i) => {
          const stageDelay = animationDelay + 10 + i * 12;
          const stageSpring = spring({
            frame: Math.max(0, frame - stageDelay),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 100 },
          });

          const stageOpacity = interpolate(
            frame,
            [stageDelay, stageDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const stageScale = interpolate(stageSpring, [0, 1], [0.8, 1]);

          const color = stage.color || getStatusColor(stage.status);
          const rgb = hexToRgb(color);
          const isActive = stage.status === 'active';
          const isCompleted = stage.status === 'completed';

          return (
            <React.Fragment key={i}>
              {/* Stage box */}
              <div
                style={{
                  width: stageWidth,
                  height: stageHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 12,
                  background: isActive
                    ? `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.15))`
                    : `rgba(${rgb}, 0.1)`,
                  border: `2px solid ${isActive ? color : `rgba(${rgb}, 0.4)`}`,
                  boxShadow: isActive
                    ? `0 0 30px rgba(${rgb}, 0.4), inset 0 0 20px rgba(${rgb}, 0.1)`
                    : `0 0 15px rgba(${rgb}, 0.15)`,
                  opacity: stageOpacity,
                  transform: `scale(${stageScale})`,
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                {/* Status indicator */}
                {isCompleted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: DATA_DISPLAY_COLORS.green,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderIcon('check', 14, '#fff')}
                  </div>
                )}

                {/* Icon */}
                {stage.icon && (
                  <div>{renderIcon(stage.icon, 24, color)}</div>
                )}

                {/* Label */}
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    fontWeight: 600,
                    color: isActive ? color : DATA_DISPLAY_COLORS.text,
                    textAlign: 'center',
                  }}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector with animated packet */}
              {i < stages.length - 1 && (
                <div
                  style={{
                    width: connectorWidth,
                    height: 4,
                    background: `linear-gradient(90deg, ${color}40, ${stages[i + 1]?.color || DATA_DISPLAY_COLORS.cyan}40)`,
                    borderRadius: 2,
                    position: 'relative',
                    marginLeft: -2,
                    marginRight: -2,
                  }}
                >
                  {/* Arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: -4,
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: `8px solid ${stages[i + 1]?.color || DATA_DISPLAY_COLORS.cyan}60`,
                    }}
                  />

                  {/* Animated packet */}
                  {showPackets && frame > animationDelay + 40 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: `${packetProgress * 100}%`,
                        transform: 'translateX(-50%)',
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: packetColor,
                        boxShadow: `0 0 10px ${packetColor}`,
                        opacity: 0.8,
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineConveyor;
