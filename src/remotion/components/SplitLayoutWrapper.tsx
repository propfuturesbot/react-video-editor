import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ThemeColors, SupportingCard } from '../types';
import { defaultTheme, hexToRgb, getGlassBackground } from '../styles/theme';
import { renderIcon } from '../utils/lucideIconMap';

// ============================================
// SPLIT LAYOUT WRAPPER
// Renders primary content with optional supporting cards
// ============================================

interface SplitLayoutWrapperProps {
  children: React.ReactNode;
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';
  theme?: ThemeColors;
  primaryWidthPercent?: number; // Default: 60
}

/**
 * SplitLayoutWrapper - Wraps primary content with optional supporting cards
 *
 * When supportingCards is empty/undefined, renders children at full width (backward compatible)
 * When supportingCards has items, renders a split layout with animated cards
 */
export const SplitLayoutWrapper: React.FC<SplitLayoutWrapperProps> = ({
  children,
  supportingCards,
  cardPosition = 'right',
  theme = defaultTheme,
  primaryWidthPercent = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If no supporting cards, render children at full width
  if (!supportingCards || supportingCards.length === 0) {
    return <>{children}</>;
  }

  const isHorizontal = cardPosition === 'left' || cardPosition === 'right';
  const cardsWidthPercent = 100 - primaryWidthPercent;

  // Container styles for horizontal vs vertical layout
  const containerStyle: React.CSSProperties = isHorizontal
    ? {
        display: 'flex',
        flexDirection: cardPosition === 'left' ? 'row-reverse' : 'row',
        gap: 32,
        width: '100%',
        alignItems: 'flex-start',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
      };

  // Primary content container styles
  const primaryStyle: React.CSSProperties = isHorizontal
    ? {
        flex: `0 0 ${primaryWidthPercent}%`,
        minWidth: 0,
      }
    : {
        width: '100%',
      };

  // Cards container styles
  const cardsContainerStyle: React.CSSProperties = isHorizontal
    ? {
        flex: `0 0 ${cardsWidthPercent}%`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minWidth: 0,
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        justifyContent: 'center',
        flexWrap: 'wrap',
      };

  return (
    <div style={containerStyle}>
      {/* Primary content */}
      <div style={primaryStyle}>{children}</div>

      {/* Supporting cards panel */}
      <div style={cardsContainerStyle}>
        {supportingCards.map((card, index) => (
          <SupportingCardComponent
            key={index}
            card={card}
            index={index}
            theme={theme}
            isHorizontal={isHorizontal}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// SUPPORTING CARD COMPONENT
// Individual animated card with icon, title, description
// ============================================

interface SupportingCardComponentProps {
  card: SupportingCard;
  index: number;
  theme: ThemeColors;
  isHorizontal: boolean;
}

const SupportingCardComponent: React.FC<SupportingCardComponentProps> = ({
  card,
  index,
  theme,
  isHorizontal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered animation for cards
  const staggerDelay = 15;
  const baseDelay = 30;
  const cardDelay = baseDelay + index * staggerDelay;

  const progress = spring({
    frame: frame - cardDelay,
    fps,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = isHorizontal
    ? interpolate(progress, [0, 1], [30, 0])
    : 0;
  const translateY = !isHorizontal
    ? interpolate(progress, [0, 1], [20, 0])
    : 0;
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  // Variant colors
  const variantColors: Record<string, string> = {
    default: theme.primary,
    success: theme.success,
    warning: theme.warning,
    info: theme.accent,
  };

  const accentColor = variantColors[card.variant || 'default'] || theme.primary;
  const accentRgb = hexToRgb(accentColor);

  const cardStyle: React.CSSProperties = {
    opacity,
    transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
    background: getGlassBackground(theme.cardBg, 0.7),
    backdropFilter: 'blur(12px)',
    borderRadius: 12,
    padding: isHorizontal ? 16 : 14,
    border: `1px solid rgba(${accentRgb}, 0.3)`,
    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(${accentRgb}, 0.05)`,
    minWidth: isHorizontal ? 'auto' : 200,
    maxWidth: isHorizontal ? 'auto' : 280,
    flex: isHorizontal ? 'none' : '1 1 200px',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    boxShadow: `0 2px 10px rgba(${accentRgb}, 0.3)`,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    marginBottom: 6,
    lineHeight: 1.3,
  };

  const descriptionStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: theme.textMuted,
    margin: 0,
    lineHeight: 1.5,
  };

  // Get icon name - support common icons
  const getIconName = (iconName?: string): string => {
    if (!iconName) return 'info';
    // Map common semantic names to lucide icons
    const iconMap: Record<string, string> = {
      key: 'key',
      lightbulb: 'lightbulb',
      zap: 'zap',
      star: 'star',
      check: 'check-circle',
      warning: 'alert-triangle',
      info: 'info',
      code: 'code',
      brain: 'brain',
      target: 'target',
      rocket: 'rocket',
      puzzle: 'puzzle',
      clock: 'clock',
      shield: 'shield',
      database: 'database',
      server: 'server',
      cpu: 'cpu',
      memory: 'memory-stick',
      hash: 'hash',
      layers: 'layers',
    };
    return iconMap[iconName.toLowerCase()] || iconName;
  };

  return (
    <div style={cardStyle}>
      {card.icon && (
        <div style={iconContainerStyle}>
          {renderIcon(getIconName(card.icon), 18, '#fff')}
        </div>
      )}
      <h4 style={titleStyle}>{card.title}</h4>
      <p style={descriptionStyle}>{card.description}</p>
    </div>
  );
};

export default SplitLayoutWrapper;
