// ============================================
// LAYERED STACK - Vertical architecture stack
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { LayeredStackProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const LayeredStack: React.FC<LayeredStackProps> = ({
  title,
  layers: rawLayers,
  direction = 'top-down',
  showArrows = true,
  highlightLayer,
  width = 500,
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ensure layers is always an array
  const layers = rawLayers || [];

  const layerHeight = 70;
  const arrowHeight = 40;
  const totalHeight =
    height ||
    layers.length * layerHeight +
      (showArrows ? Math.max(layers.length - 1, 0) * arrowHeight : 0) +
      (title ? 60 : 20);

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

  // Order layers based on direction
  const orderedLayers = direction === 'bottom-up' ? [...layers].reverse() : layers;
  const orderedIndices = direction === 'bottom-up'
    ? layers.map((_, i) => layers.length - 1 - i)
    : layers.map((_, i) => i);

  return (
    <div
      style={{
        width,
        height: totalHeight,
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

      {/* Layers */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {orderedLayers.map((layer, idx) => {
          const originalIdx = orderedIndices[idx];
          const layerDelay =
            animationDelay + 15 + (direction === 'bottom-up' ? (layers.length - 1 - idx) : idx) * 10;

          const layerSpring = spring({
            frame: Math.max(0, frame - layerDelay),
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 100 },
          });

          const layerOpacity = interpolate(
            frame,
            [layerDelay, layerDelay + 15],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const layerTranslateY =
            direction === 'bottom-up'
              ? interpolate(layerSpring, [0, 1], [30, 0])
              : interpolate(layerSpring, [0, 1], [-30, 0]);

          const layerScale = interpolate(layerSpring, [0, 1], [0.95, 1]);

          const color = layer.color || DATA_DISPLAY_COLORS.cyan;
          const rgb = hexToRgb(color);
          const isHighlighted = highlightLayer === originalIdx;

          // Arrow animation
          const arrowDelay = layerDelay + 8;
          const arrowOpacity = interpolate(
            frame,
            [arrowDelay, arrowDelay + 10],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <React.Fragment key={idx}>
              {/* Layer */}
              <div
                style={{
                  width: width - 40,
                  height: layerHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  borderRadius: 12,
                  background: isHighlighted
                    ? `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.15))`
                    : `linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.05))`,
                  border: `2px solid ${isHighlighted ? color : `rgba(${rgb}, 0.4)`}`,
                  boxShadow: isHighlighted
                    ? `0 0 30px rgba(${rgb}, 0.4), 0 0 60px rgba(${rgb}, 0.2), inset 0 0 30px rgba(${rgb}, 0.1)`
                    : `0 0 15px rgba(${rgb}, 0.15)`,
                  opacity: layerOpacity,
                  transform: `translateY(${layerTranslateY}px) scale(${layerScale})`,
                  position: 'relative',
                  zIndex: layers.length - idx,
                }}
              >
                {/* Icon */}
                {layer.icon && (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `rgba(${rgb}, 0.2)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid rgba(${rgb}, 0.3)`,
                    }}
                  >
                    {renderIcon(layer.icon, 22, color)}
                  </div>
                )}

                {/* Label & sublabel */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: layer.icon ? 'flex-start' : 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.heading,
                      fontSize: 16,
                      fontWeight: 600,
                      color: isHighlighted ? color : DATA_DISPLAY_COLORS.text,
                    }}
                  >
                    {layer.label}
                  </span>
                  {layer.sublabel && (
                    <span
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: 12,
                        color: DATA_DISPLAY_COLORS.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {layer.sublabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow between layers */}
              {showArrows && idx < orderedLayers.length - 1 && (
                <div
                  style={{
                    height: arrowHeight,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: arrowOpacity,
                  }}
                >
                  <div
                    style={{
                      width: 2,
                      height: 16,
                      background: `linear-gradient(180deg, ${color}80, ${orderedLayers[idx + 1]?.color || DATA_DISPLAY_COLORS.cyan}80)`,
                    }}
                  />
                  <div style={{ marginTop: -2 }}>
                    {renderIcon(
                      direction === 'bottom-up' ? 'chevron-up' : 'chevron-down',
                      20,
                      orderedLayers[idx + 1]?.color || DATA_DISPLAY_COLORS.cyan
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LayeredStack;
