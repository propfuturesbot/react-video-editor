// ============================================
// INTRO FRAME - Logo + tagline intro
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { IntroFrameProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const IntroFrame: React.FC<IntroFrameProps> = ({
  logo,
  title,
  tagline,
  accentColor = DATA_DISPLAY_COLORS.cyan,
  variant = 'tech',
  width = 800,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rgb = hexToRgb(accentColor);

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 30],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Logo animation
  const logoSpring = spring({
    frame: Math.max(0, frame - animationDelay),
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 80 },
  });

  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(
    frame,
    [animationDelay, animationDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Title animation
  const titleDelay = animationDelay + 15;
  const titleOpacity = interpolate(
    frame,
    [titleDelay, titleDelay + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const titleY = interpolate(
    frame,
    [titleDelay, titleDelay + 25],
    [30, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Tagline animation
  const taglineDelay = animationDelay + 35;
  const taglineOpacity = interpolate(
    frame,
    [taglineDelay, taglineDelay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Decorative elements animation
  const decorDelay = animationDelay + 10;
  const decorProgress = interpolate(
    frame,
    [decorDelay, decorDelay + 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const renderVariant = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 24,
            }}
          >
            {/* Logo */}
            {logo && (
              <div
                style={{
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                }}
              >
                {renderIcon(logo, 64, accentColor)}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 800,
                color: DATA_DISPLAY_COLORS.text,
                margin: 0,
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
              }}
            >
              {title}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 20,
                  color: DATA_DISPLAY_COLORS.textMuted,
                  margin: 0,
                  opacity: taglineOpacity,
                }}
              >
                {tagline}
              </p>
            )}
          </div>
        );

      case 'dramatic':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 32,
              position: 'relative',
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(${rgb}, 0.2), transparent 70%)`,
                filter: 'blur(40px)',
                opacity: decorProgress,
              }}
            />

            {/* Logo with ring */}
            {logo && (
              <div
                style={{
                  position: 'relative',
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(${rgb}, 0.3), rgba(${rgb}, 0.1))`,
                    border: `3px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 40px rgba(${rgb}, 0.4)`,
                  }}
                >
                  {renderIcon(logo, 56, accentColor)}
                </div>
                {/* Orbiting ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: -20,
                    border: `2px solid ${accentColor}30`,
                    borderRadius: '50%',
                    transform: `rotate(${frame * 0.5}deg)`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: accentColor,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 10px ${accentColor}`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 56,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${DATA_DISPLAY_COLORS.text}, ${accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
              }}
            >
              {title}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 22,
                  color: accentColor,
                  margin: 0,
                  opacity: taglineOpacity,
                }}
              >
                {tagline}
              </p>
            )}
          </div>
        );

      case 'tech':
      default:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 28,
              position: 'relative',
            }}
          >
            {/* Grid background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(${accentColor}08 1px, transparent 1px),
                  linear-gradient(90deg, ${accentColor}08 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
                opacity: decorProgress,
              }}
            />

            {/* Scan lines */}
            <div
              style={{
                position: 'absolute',
                top: `${((frame * 2) % 100)}%`,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
                opacity: 0.5,
              }}
            />

            {/* Logo */}
            {logo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: logoOpacity,
                  transform: `scale(${logoScale})`,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: `rgba(${rgb}, 0.15)`,
                    border: `2px solid ${accentColor}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 30px rgba(${rgb}, 0.3)`,
                  }}
                >
                  {renderIcon(logo, 40, accentColor)}
                </div>
              </div>
            )}

            {/* Title with bracket decoration */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 48,
                  color: accentColor,
                  opacity: 0.5,
                }}
              >
                {'<'}
              </span>
              <h1
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 52,
                  fontWeight: 800,
                  color: DATA_DISPLAY_COLORS.text,
                  margin: 0,
                }}
              >
                {title}
              </h1>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 48,
                  color: accentColor,
                  opacity: 0.5,
                }}
              >
                {'/>'}
              </span>
            </div>

            {/* Tagline with typing effect */}
            {tagline && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: taglineOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    color: accentColor,
                  }}
                >
                  //
                </span>
                <p
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 18,
                    color: DATA_DISPLAY_COLORS.textMuted,
                    margin: 0,
                  }}
                >
                  {tagline}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        opacity: containerOpacity,
        ...positionStyles,
        ...style,
      }}
    >
      {renderVariant()}
    </div>
  );
};

export default IntroFrame;
