import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb, getGlow } from '../styles/theme';
import { animateIn } from '../utils/animations';

// ============================================
// GLOW BOX
// ============================================

interface GlowBoxProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  padding?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
  delay?: number;
  animationType?: 'fade' | 'slide-up' | 'scale' | 'spring';
}

export const GlowBox: React.FC<GlowBoxProps> = ({
  children,
  color,
  intensity = 0.25,
  padding = 28,
  borderRadius = 18,
  style = {},
  delay = 0,
  animationType = 'fade',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = defaultTheme;
  const boxColor = color || theme.primary;

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type: animationType,
  });

  return (
    <div
      style={{
        background: `rgba(${hexToRgb(boxColor)}, 0.05)`,
        border: `1px solid rgba(${hexToRgb(boxColor)}, 0.25)`,
        boxShadow: `0 0 30px rgba(${hexToRgb(boxColor)}, ${intensity})`,
        borderRadius,
        padding,
        opacity: animation.opacity,
        transform: animation.transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// CONTENT CARD
// ============================================

interface ContentCardProps {
  icon?: string;
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  theme?: ThemeColors;
  delay?: number;
  style?: React.CSSProperties;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  icon,
  title,
  description,
  variant = 'default',
  theme = defaultTheme,
  delay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type: 'slide-up',
    duration: 20,
  });

  const variantColors: Record<string, string> = {
    default: theme.primary,
    success: theme.success,
    warning: theme.warning,
    error: theme.error,
    info: theme.secondary,
  };

  const color = variantColors[variant];

  return (
    <div
      style={{
        background: `rgba(${hexToRgb(color)}, 0.05)`,
        border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
        boxShadow: `0 0 36px rgba(${hexToRgb(color)}, 0.12)`,
        borderRadius: 16,
        padding: 26,
        opacity: animation.opacity,
        transform: animation.transform,
        ...style,
      }}
    >
      {/* Icon */}
      {icon && (
        <div
          style={{
            fontSize: 34,
            marginBottom: 14,
          }}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h4
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 10,
          color: theme.text,
        }}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          lineHeight: 1.6,
          color: theme.textMuted,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
};

// ============================================
// FEATURE CARD (with icon box)
// ============================================

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconGradient?: [string, string];
  theme?: ThemeColors;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconGradient,
  theme = defaultTheme,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type: 'spring',
  });

  const gradient = iconGradient || [theme.primary, theme.secondary];

  return (
    <div
      style={{
        background: `rgba(${hexToRgb(theme.primary)}, 0.05)`,
        border: `1px solid rgba(${hexToRgb(theme.primary)}, 0.2)`,
        borderRadius: 18,
        padding: 32,
        textAlign: 'center',
        opacity: animation.opacity,
        transform: animation.transform,
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 22,
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 42,
          margin: '0 auto 20px',
          boxShadow: `0 12px 36px rgba(${hexToRgb(gradient[0])}, 0.35)`,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h4
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 10,
          color: theme.text,
        }}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          lineHeight: 1.6,
          color: theme.textMuted,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
};

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  theme?: ThemeColors;
  delay?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  theme = defaultTheme,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type: 'slide-up',
    duration: 15,
  });

  const badgeColor = color || theme.primary;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: `rgba(${hexToRgb(badgeColor)}, 0.15)`,
        border: `1px solid rgba(${hexToRgb(badgeColor)}, 0.3)`,
        borderRadius: 50,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: badgeColor,
        opacity: animation.opacity,
        transform: animation.transform,
      }}
    >
      {children}
    </div>
  );
};
