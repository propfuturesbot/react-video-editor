import React, { useCallback, useEffect, useState } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Loop,
  delayRender,
  continueRender,
  getRemotionEnvironment,
} from 'remotion';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb } from '../styles/theme';

// ============================================
// BACKGROUND CONFIG TYPE
// ============================================

export type BackgroundType = 'gradient' | 'solid' | 'image' | 'video';
export type GradientVariant = 'default' | 'grid' | 'tron' | 'custom';

export interface CustomGradientConfig {
  backgroundColor?: string;          // Base background color (default: #0a0a0f)
  primaryColor?: string;             // Primary accent color (default: #06b6d4)
  secondaryColor?: string;           // Secondary accent color (default: #8b5cf6)
  showGrid?: boolean;                // Whether to show grid lines (default: true)
  gridColor?: string;                // Grid line color (default: uses primaryColor)
  gridOpacity?: number;              // Grid line opacity 0-1 (default: 0.1)
  gridSize?: number;                 // Grid cell size in pixels (default: 50)
  gridThickness?: number;            // Grid line thickness in pixels (default: 1)
  showScanLine?: boolean;            // Animated scan line (default: false)
  orbIntensity?: number;             // Intensity of gradient orbs 0-1 (default: 0.15)
}

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;                    // For solid backgrounds
  gradientVariant?: GradientVariant; // For gradient backgrounds
  customGradient?: CustomGradientConfig; // For custom gradient settings
  imageUrl?: string;                 // For image backgrounds
  videoUrl?: string;                 // For video backgrounds
  opacity?: number;                  // 0-1, default 1
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Default custom gradient settings
const DEFAULT_CUSTOM_GRADIENT: Required<CustomGradientConfig> = {
  backgroundColor: '#0a0a0f',
  primaryColor: '#06b6d4',
  secondaryColor: '#8b5cf6',
  showGrid: true,
  gridColor: '#06b6d4',
  gridOpacity: 0.1,
  gridSize: 50,
  gridThickness: 1,
  showScanLine: false,
  orbIntensity: 0.15,
};

interface BackgroundProps {
  theme?: ThemeColors;
  variant?: 'default' | 'grid' | 'gradient' | 'tron';
  animated?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({
  theme = defaultTheme,
  variant = 'grid',
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle animation for scanning line
  const scanPosition = animated ? (frame % (fps * 8)) / (fps * 8) * 100 : -10;

  const gridColor = `rgba(${hexToRgb(theme.primary)}, 0.04)`;
  const glowColor1 = `rgba(${hexToRgb(theme.primary)}, 0.08)`;
  const glowColor2 = `rgba(${hexToRgb(theme.secondary)}, 0.06)`;

  return (
    <AbsoluteFill>
      {/* Base background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: theme.background,
        }}
      />

      {/* Gradient orbs */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, ${glowColor1} 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, ${glowColor2} 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid pattern */}
      {(variant === 'grid' || variant === 'tron') && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* Scanning line (for tron variant) */}
      {variant === 'tron' && animated && (
        <div
          style={{
            position: 'absolute',
            top: `${scanPosition}%`,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
            opacity: 0.4,
            boxShadow: `0 0 20px ${theme.primary}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ============================================
// VIDEO BACKGROUND COMPONENT
// Supports gradient, solid, image, and video backgrounds
// ============================================

interface VideoBackgroundProps {
  config?: BackgroundConfig;
  theme?: ThemeColors;
  animated?: boolean;
}

/**
 * VideoBackground - Unified background component supporting all background types.
 *
 * Types:
 * - gradient: Animated gradient with optional grid overlay (default, grid, tron variants)
 * - solid: Single solid color
 * - image: Static image with dark overlay for text readability
 * - video: Looped, muted video with dark overlay for text readability
 */
export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  config,
  theme = defaultTheme,
  animated = true,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Default to gradient if no config provided
  const bgType = config?.type || 'gradient';
  const opacity = config?.opacity ?? 1;

  // For image/video loading states (only in rendering environment)
  const [handle] = useState(() => {
    const env = getRemotionEnvironment();
    // Only use delayRender in rendering environment, not in preview
    if ((bgType === 'image' || bgType === 'video') && env.isRendering) {
      return delayRender(`Loading ${bgType} background`);
    }
    return null;
  });

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  // Continue render when media loads or errors
  const handleMediaLoad = useCallback(() => {
    setMediaLoaded(true);
    if (handle !== null) {
      continueRender(handle);
    }
  }, [handle]);

  const handleMediaError = useCallback(() => {
    console.warn(`Failed to load ${bgType} background, falling back to gradient`);
    setMediaError(true);
    if (handle !== null) {
      continueRender(handle);
    }
  }, [handle, bgType]);

  // Fallback to gradient if media fails to load
  const effectiveType = mediaError ? 'gradient' : bgType;

  // Render solid color background
  if (effectiveType === 'solid' && config?.color) {
    return (
      <AbsoluteFill style={{ opacity }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: config.color,
          }}
        />
      </AbsoluteFill>
    );
  }

  // Render image background
  if (effectiveType === 'image' && config?.imageUrl) {
    return (
      <AbsoluteFill style={{ opacity }}>
        {/* Image */}
        <Img
          src={config.imageUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onLoad={handleMediaLoad}
          onError={handleMediaError}
        />
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      </AbsoluteFill>
    );
  }

  // Render video background
  if (effectiveType === 'video' && config?.videoUrl) {
    // Estimate video duration - default to full video length
    // The Loop component will handle seamless looping
    return (
      <AbsoluteFill style={{ opacity }}>
        {/* Looped video */}
        <Loop durationInFrames={durationInFrames}>
          <OffthreadVideo
            src={config.videoUrl}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            muted
            onError={handleMediaError}
          />
        </Loop>
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      </AbsoluteFill>
    );
  }

  // Custom gradient
  if (effectiveType === 'gradient' && config?.gradientVariant === 'custom' && config?.customGradient) {
    const custom = { ...DEFAULT_CUSTOM_GRADIENT, ...config.customGradient };
    const primaryColor = custom.primaryColor;
    const secondaryColor = custom.secondaryColor;
    const gridColor = custom.gridColor || primaryColor;

    return (
      <AbsoluteFill style={{ opacity }}>
        {/* Base background color */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: custom.backgroundColor,
          }}
        />

        {/* Gradient orbs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 20% 20%, ${hexToRgba(primaryColor, custom.orbIntensity)} 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, ${hexToRgba(secondaryColor, custom.orbIntensity * 0.7)} 0%, transparent 50%)
            `,
          }}
        />

        {/* Grid lines */}
        {custom.showGrid && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(${hexToRgba(gridColor, custom.gridOpacity)} ${custom.gridThickness}px, transparent ${custom.gridThickness}px),
                linear-gradient(90deg, ${hexToRgba(gridColor, custom.gridOpacity)} ${custom.gridThickness}px, transparent ${custom.gridThickness}px)
              `,
              backgroundSize: `${custom.gridSize}px ${custom.gridSize}px`,
            }}
          />
        )}

        {/* Animated scan line */}
        {custom.showScanLine && animated && (
          <ScanLine primaryColor={primaryColor} />
        )}
      </AbsoluteFill>
    );
  }

  // Default: Render gradient background
  const variant = config?.gradientVariant || 'grid';
  // Handle 'custom' variant by falling back to 'grid'
  const safeVariant = variant === 'custom' ? 'grid' : variant;
  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} variant={safeVariant as any} animated={animated} />
    </AbsoluteFill>
  );
};

// Animated scan line component
const ScanLine: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scanPosition = (frame % (fps * 8)) / (fps * 8) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${scanPosition}%`,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
        opacity: 0.4,
        boxShadow: `0 0 20px ${primaryColor}`,
      }}
    />
  );
};

// ============================================
// SCENE CONTAINER
// ============================================

interface SceneContainerProps {
  children: React.ReactNode;
  theme?: ThemeColors;
  backgroundVariant?: 'default' | 'grid' | 'gradient' | 'tron';
  padding?: number;
  centered?: boolean;
  /**
   * If true, skip rendering the scene's own background.
   * Use this when a global VideoBackground is already rendered in the parent.
   * Default: true (transparent) - scenes should NOT render their own backgrounds
   * since TemplateVideo already renders VideoBackground globally.
   */
  transparent?: boolean;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  children,
  theme = defaultTheme,
  backgroundVariant = 'grid',
  padding = 60,
  centered = true,
  transparent = true,  // Default to transparent since TemplateVideo renders global background
}) => {
  return (
    <AbsoluteFill>
      {/* Only render scene-level background if not transparent */}
      {!transparent && <Background theme={theme} variant={backgroundVariant} />}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding,
          display: 'flex',
          flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start',
          justifyContent: centered ? 'center' : 'flex-start',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
