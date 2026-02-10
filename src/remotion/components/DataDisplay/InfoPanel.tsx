// ============================================
// INFO PANEL - Large content box for explanations
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { InfoPanelProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { GlowIcon } from './GlowIcon';

export const InfoPanel: React.FC<InfoPanelProps> = ({
  icon,
  title,
  body,
  variant = 'glass',
  accentColor = DATA_DISPLAY_COLORS.purple,
  headerAlignment = 'left',
  width = 800,  // Larger default for visual impact
  height,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation
  const springValue = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 100 },
  });

  const opacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const scale = animateIn
    ? interpolate(springValue, [0, 1], [0.95, 1])
    : 1;

  const translateY = animateIn
    ? interpolate(springValue, [0, 1], [20, 0])
    : 0;

  const rgb = hexToRgb(accentColor);

  // Get variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, rgba(${rgb}, 0.2) 0%, rgba(${rgb}, 0.05) 100%)`,
          border: `2px solid ${accentColor}`,
          boxShadow: `
            0 0 40px rgba(${rgb}, 0.3),
            0 0 80px rgba(${rgb}, 0.15),
            inset 0 0 40px rgba(${rgb}, 0.1)
          `,
        };
      case 'solid':
        return {
          background: DATA_DISPLAY_COLORS.cardBg,
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 30px rgba(${rgb}, 0.2)`,
        };
      case 'outlined':
        return {
          background: 'transparent',
          border: `2px solid rgba(${rgb}, 0.5)`,
          boxShadow: `
            0 0 20px rgba(${rgb}, 0.1),
            inset 0 0 20px rgba(${rgb}, 0.05)
          `,
        };
      case 'glass':
      default:
        return {
          background: `linear-gradient(135deg, rgba(${rgb}, 0.1) 0%, rgba(22, 22, 42, 0.9) 100%)`,
          border: `1px solid rgba(${rgb}, 0.3)`,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(${rgb}, 0.15),
            inset 0 0 30px rgba(${rgb}, 0.05)
          `,
          backdropFilter: 'blur(10px)',
        };
    }
  };

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [animationDelay + 5, animationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Body animation
  const bodyOpacity = interpolate(
    frame,
    [animationDelay + 15, animationDelay + 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height: height || 'auto',
        borderRadius: 20,
        padding: 28,
        ...getVariantStyles(),
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
          justifyContent: headerAlignment === 'center' ? 'center' : 'flex-start',
        }}
      >
        {/* Icon */}
        {icon && (
          <GlowIcon
            icon={icon}
            color={accentColor}
            size={64}  // Larger icon
            variant="box"
            glowIntensity={0.35}
            animationDelay={animationDelay + 5}
          />
        )}

        {/* Title */}
        <h3
          style={{
            fontFamily: FONTS.heading,
            fontSize: 28,  // Larger for visibility
            fontWeight: 700,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            opacity: titleOpacity,
            textShadow: `0 0 20px rgba(${rgb}, 0.3)`,
          }}
        >
          {title}
        </h3>
      </div>

      {/* Accent line */}
      <div
        style={{
          width: '100%',
          height: 2,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          marginBottom: 24,
          opacity: titleOpacity,
          borderRadius: 1,
        }}
      />

      {/* Body content - supports both paragraph and bullet points */}
      {body && !body.includes('•') && !/^-\s|\n-\s/.test(body) ? (
        // Single paragraph mode
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: 20,
            lineHeight: 1.8,
            color: DATA_DISPLAY_COLORS.textMuted,
            margin: 0,
            opacity: bodyOpacity,
            whiteSpace: 'pre-wrap',
          }}
        >
          {body}
        </p>
      ) : (
        // Bullet points mode - render as staggered colored boxes
        // Split on • or on - at start of line (not hyphens in middle of words)
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: bodyOpacity,
          }}
        >
          {body?.split(/•|(?:^|\n)-\s*/).filter(item => item.trim()).map((point, idx) => {
            const colors = [
              DATA_DISPLAY_COLORS.cyan,
              DATA_DISPLAY_COLORS.purple,
              DATA_DISPLAY_COLORS.green,
              DATA_DISPLAY_COLORS.orange,
              DATA_DISPLAY_COLORS.pink,
            ];
            const pointColor = colors[idx % colors.length];
            const pointRgb = hexToRgb(pointColor);
            const pointDelay = animationDelay + 20 + idx * 8;

            const pointOpacity = interpolate(
              frame,
              [pointDelay, pointDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const pointX = interpolate(
              frame,
              [pointDelay, pointDelay + 15],
              [-20, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: `rgba(${pointRgb}, 0.12)`,
                  border: `1px solid rgba(${pointRgb}, 0.35)`,
                  opacity: pointOpacity,
                  transform: `translateX(${pointX}px)`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: pointColor,
                    boxShadow: `0 0 12px ${pointColor}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 17,
                    lineHeight: 1.5,
                    color: DATA_DISPLAY_COLORS.text,
                    fontWeight: 500,
                  }}
                >
                  {point.trim()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Compact variant for smaller info boxes
export const InfoBox: React.FC<Omit<InfoPanelProps, 'variant'> & { compact?: boolean }> = ({
  icon,
  title,
  body,
  accentColor = DATA_DISPLAY_COLORS.cyan,
  compact = true,
  width = 300,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const springValue = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 120 },
  });

  const opacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  const scale = animateIn
    ? interpolate(springValue, [0, 1], [0.9, 1])
    : 1;

  const rgb = hexToRgb(accentColor);

  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  return (
    <div
      style={{
        width,
        padding: compact ? 16 : 20,
        borderRadius: 12,
        background: DATA_DISPLAY_COLORS.cardBg,
        border: `1px solid rgba(${rgb}, 0.3)`,
        boxShadow: `0 0 20px rgba(${rgb}, 0.15)`,
        opacity,
        transform: `scale(${scale})`,
        ...positionStyles,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {icon && (
          <GlowIcon
            icon={icon}
            color={accentColor}
            size={compact ? 36 : 44}
            variant="box"
            glowIntensity={0.2}
            animationDelay={animationDelay + 3}
          />
        )}
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontFamily: FONTS.heading,
              fontSize: compact ? 14 : 16,
              fontWeight: 600,
              color: DATA_DISPLAY_COLORS.text,
              margin: 0,
              marginBottom: 4,
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: compact ? 12 : 13,
              lineHeight: 1.5,
              color: DATA_DISPLAY_COLORS.textMuted,
              margin: 0,
            }}
          >
            {body}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
