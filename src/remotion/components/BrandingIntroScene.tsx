/**
 * BrandingIntroScene - Full-screen branding intro with animated title
 *
 * Features:
 * - Full-screen branding image with Ken Burns zoom effect
 * - Title with gradient text and neon glow
 * - Subtitle with fade-in delay
 * - Animated particle overlay
 * - Smooth fade-out transition at the end
 */

import React, { useState, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, interpolate, spring, delayRender, continueRender } from 'remotion';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb, neonColors } from '../styles/theme';

interface BrandingIntroSceneProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  animation?: {
    imageZoom?: {
      enabled: boolean;
      startScale?: number;
      endScale?: number;
    };
    titleFade?: boolean;
    particleOverlay?: boolean;
    glowEffect?: boolean;
  };
  theme?: ThemeColors;
}

// Particle component for the animated overlay
const Particle: React.FC<{
  index: number;
  totalParticles: number;
  frame: number;
  fps: number;
}> = ({ index, totalParticles, frame, fps }) => {
  // Deterministic positioning based on index
  const baseX = ((index * 137) % 100);
  const baseY = ((index * 197) % 100);
  const size = 2 + (index % 4);
  const speed = 0.3 + (index % 5) * 0.15;

  // Animate position
  const yOffset = (frame * speed) % 120;
  const currentY = baseY - yOffset + (yOffset > baseY ? 100 : 0);

  // Fade based on position
  const opacity = interpolate(
    currentY,
    [0, 20, 80, 100],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Entry animation
  const entryOpacity = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: `${baseX}%`,
        top: `${currentY}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)',
        opacity: opacity * entryOpacity,
      }}
    />
  );
};

export const BrandingIntroScene: React.FC<BrandingIntroSceneProps> = ({
  imageUrl,
  title,
  subtitle,
  animation = {},
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Handle image loading with delayRender
  const [imageLoaded, setImageLoaded] = useState(false);
  const [handle] = useState(() => delayRender('Loading branding image'));

  useEffect(() => {
    if (!imageUrl) {
      continueRender(handle);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      continueRender(handle);
    };
    img.onerror = () => {
      console.error('Failed to load branding image:', imageUrl);
      continueRender(handle);
    };
    img.src = imageUrl;
  }, [imageUrl, handle]);

  // Default animation settings
  const imageZoom = animation.imageZoom ?? { enabled: true, startScale: 1.0, endScale: 1.15 };
  const titleFade = animation.titleFade ?? true;
  const particleOverlay = animation.particleOverlay ?? true;
  const glowEffect = animation.glowEffect ?? true;

  // Ken Burns zoom effect for image
  const imageScale = interpolate(
    frame,
    [0, durationInFrames],
    [imageZoom.startScale || 1.0, imageZoom.endScale || 1.15],
    { extrapolateRight: 'clamp' }
  );

  // Title animation
  const titleProgress = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.8 },
  });
  const titleOpacity = titleFade ? interpolate(titleProgress, [0, 1], [0, 1]) : 1;
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  // Subtitle animation (delayed)
  const subtitleProgress = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 18, stiffness: 70, mass: 0.6 },
  });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleProgress, [0, 1], [20, 0]);

  // Fade out at the end
  const fadeOutStart = durationInFrames - fps * 0.5;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Glow pulse animation
  const glowPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background image with Ken Burns effect */}
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          transform: `scale(${imageScale})`,
        }}
      >
        {/* Fallback gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.primary}40 0%, #000 50%, ${neonColors.cyan}30 100%)`,
          }}
        />
        {/* Image - render if URL exists */}
        {imageUrl && (
          <Img
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
            }}
          />
        )}
        {/* Gradient overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 100%)',
          }}
        />
      </AbsoluteFill>

      {/* Particle overlay */}
      {particleOverlay && (
        <AbsoluteFill style={{ opacity: fadeOut * 0.5 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} index={i} totalParticles={30} frame={frame} fps={fps} />
          ))}
        </AbsoluteFill>
      )}

      {/* Content container */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          opacity: fadeOut,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontSize: 72,
            fontWeight: 800,
            textAlign: 'center',
            margin: 0,
            marginBottom: subtitle ? 24 : 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 50%, ${neonColors.cyan} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: glowEffect
              ? `0 0 ${30 * glowPulse}px rgba(${hexToRgb(theme.primary)}, ${0.5 * glowPulse}), 0 0 ${60 * glowPulse}px rgba(${hexToRgb(neonColors.cyan)}, ${0.3 * glowPulse})`
              : 'none',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            maxWidth: '90%',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 28,
              fontWeight: 500,
              color: theme.textMuted,
              textAlign: 'center',
              margin: 0,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              maxWidth: '70%',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Decorative line under title */}
        <div
          style={{
            marginTop: 40,
            width: interpolate(titleProgress, [0, 1], [0, 200]),
            height: 3,
            background: `linear-gradient(90deg, transparent, ${theme.primary}, ${neonColors.cyan}, ${theme.primary}, transparent)`,
            borderRadius: 2,
            opacity: titleOpacity,
            boxShadow: glowEffect
              ? `0 0 15px rgba(${hexToRgb(theme.primary)}, 0.6)`
              : 'none',
          }}
        />
      </AbsoluteFill>

      {/* Corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 80,
          height: 80,
          borderLeft: `3px solid ${theme.primary}`,
          borderTop: `3px solid ${theme.primary}`,
          opacity: fadeOut * titleOpacity * 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          right: 40,
          width: 80,
          height: 80,
          borderRight: `3px solid ${neonColors.cyan}`,
          borderBottom: `3px solid ${neonColors.cyan}`,
          opacity: fadeOut * titleOpacity * 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

export default BrandingIntroScene;
