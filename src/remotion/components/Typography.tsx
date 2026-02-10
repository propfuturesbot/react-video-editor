import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors } from '../types';
import { defaultTheme, getNeonText, hexToRgb } from '../styles/theme';
import { animateIn, typewriterWithCursor } from '../utils/animations';

// ============================================
// TITLE
// ============================================

interface TitleProps {
  children: React.ReactNode;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  color?: string;
  glow?: boolean;
  theme?: ThemeColors;
  delay?: number;
  centered?: boolean;
  style?: React.CSSProperties;
}

export const Title: React.FC<TitleProps> = ({
  children,
  size = 'lg',
  color,
  glow = false,
  theme = defaultTheme,
  delay = 0,
  centered = true,
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

  const sizeMap = {
    xl: 72,
    lg: 56,
    md: 42,
    sm: 32,
  };

  const textColor = color || theme.text;

  return (
    <h1
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: sizeMap[size],
        fontWeight: 700,
        lineHeight: 1.2,
        color: textColor,
        textShadow: glow ? getNeonText(textColor) : 'none',
        textAlign: centered ? 'center' : 'left',
        margin: 0,
        opacity: animation.opacity,
        transform: animation.transform,
        ...style,
      }}
    >
      {children}
    </h1>
  );
};

// ============================================
// SUBTITLE
// ============================================

interface SubtitleProps {
  children: React.ReactNode;
  color?: string;
  theme?: ThemeColors;
  delay?: number;
  centered?: boolean;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  color,
  theme = defaultTheme,
  delay = 0,
  centered = true,
  maxWidth = 800,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type: 'fade',
    duration: 15,
  });

  return (
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 22,
        fontWeight: 400,
        lineHeight: 1.6,
        color: color || theme.textMuted,
        textAlign: centered ? 'center' : 'left',
        maxWidth,
        margin: 0,
        opacity: animation.opacity,
        transform: animation.transform,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

// ============================================
// HIGHLIGHTED TEXT
// ============================================

interface HighlightProps {
  children: React.ReactNode;
  color?: string;
  theme?: ThemeColors;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  color,
  theme = defaultTheme,
}) => {
  const highlightColor = color || theme.primary;

  return (
    <span
      style={{
        color: highlightColor,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
};

// ============================================
// TYPEWRITER TEXT
// ============================================

interface TypewriterTextProps {
  text: string;
  color?: string;
  fontSize?: number;
  theme?: ThemeColors;
  delay?: number;
  speed?: number;
  showCursor?: boolean;
  cursorColor?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  color,
  fontSize = 20,
  theme = defaultTheme,
  delay = 0,
  speed = 0.5,
  showCursor = true,
  cursorColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { text: displayText, showCursor: cursorVisible } = typewriterWithCursor(
    text,
    frame,
    delay,
    fps,
    speed
  );

  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize,
        color: color || theme.text,
      }}
    >
      {displayText}
      {showCursor && cursorVisible && (
        <span
          style={{
            color: cursorColor || theme.primary,
            fontWeight: 100,
          }}
        >
          |
        </span>
      )}
    </span>
  );
};

// ============================================
// SCENE TITLE (Badge + Title + Subtitle)
// ============================================

interface SceneTitleProps {
  badge?: string;
  title: string;
  subtitle?: string;
  theme?: ThemeColors;
  baseDelay?: number;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  badge,
  title,
  subtitle,
  theme = defaultTheme,
  baseDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ textAlign: 'center', marginBottom: 50 }}>
      {badge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            background: `rgba(${hexToRgb(theme.primary)}, 0.18)`,
            border: `2px solid rgba(${hexToRgb(theme.primary)}, 0.4)`,
            borderRadius: 50,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.primary,
            marginBottom: 20,
            boxShadow: `0 4px 20px rgba(${hexToRgb(theme.primary)}, 0.2)`,
            opacity: animateIn({ frame, fps, start: baseDelay, type: 'slide-up' }).opacity,
            transform: animateIn({ frame, fps, start: baseDelay, type: 'slide-up' }).transform,
          }}
        >
          {badge}
        </div>
      )}

      <Title delay={baseDelay + 8} theme={theme}>
        {title}
      </Title>

      {subtitle && (
        <Subtitle delay={baseDelay + 16} theme={theme} style={{ marginTop: 12 }}>
          {subtitle}
        </Subtitle>
      )}
    </div>
  );
};
