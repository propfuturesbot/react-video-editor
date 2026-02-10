import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { ThemeColors, InstructorLine } from '../types';
import { defaultTheme, hexToRgb, getNeonBoxShadow, getGlassBackground, neonColors } from '../styles/theme';
import { fadeIn, isInRange } from '../utils/animations';

// ============================================
// INSTRUCTOR COMPONENT
// ============================================

interface InstructorProps {
  lines: InstructorLine[];
  avatar?: string;
  theme?: ThemeColors;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'sm' | 'md' | 'lg';
}

export const Instructor: React.FC<InstructorProps> = ({
  lines,
  avatar = '👨‍🏫',
  theme = defaultTheme,
  position = 'bottom-left',
  size = 'md',
}) => {
  const frame = useCurrentFrame();

  // Find current active line
  const activeLine = lines.find(line => isInRange(frame, line.startFrame, line.endFrame));

  // Animation for showing/hiding
  const isVisible = !!activeLine;
  const showAnimation = isVisible ? fadeIn({ frame, start: activeLine?.startFrame || 0, duration: 12 }) : 0;

  // Size config
  const sizeConfig = {
    sm: { avatar: 50, bubble: 220, fontSize: 14 },
    md: { avatar: 60, bubble: 280, fontSize: 15 },
    lg: { avatar: 70, bubble: 320, fontSize: 16 },
  };
  const config = sizeConfig[size];

  // Position config
  const positionStyle: Record<string, React.CSSProperties> = {
    'bottom-left': { bottom: 100, left: 30, flexDirection: 'row' },
    'bottom-right': { bottom: 100, right: 30, flexDirection: 'row-reverse' },
    'top-left': { top: 100, left: 30, flexDirection: 'row' },
    'top-right': { top: 100, right: 30, flexDirection: 'row-reverse' },
  };

  // Emotion to emoji mapping
  const emotionAvatar: Record<string, string> = {
    neutral: avatar,
    happy: '😊',
    thinking: '🤔',
    excited: '🎉',
  };

  const currentAvatar = activeLine?.emotion
    ? emotionAvatar[activeLine.emotion] || avatar
    : avatar;

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle[position],
        display: 'flex',
        alignItems: 'flex-end',
        gap: 15,
        opacity: showAnimation,
        zIndex: 50,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: config.avatar,
          height: config.avatar,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: config.avatar * 0.5,
          boxShadow: `0 10px 30px rgba(${hexToRgb(theme.primary)}, 0.3)`,
          flexShrink: 0,
        }}
      >
        {currentAvatar}
      </div>

      {/* Speech bubble */}
      <div
        style={{
          maxWidth: config.bubble,
          padding: '14px 18px',
          background: theme.surface,
          border: `1px solid rgba(${hexToRgb(theme.primary)}, 0.2)`,
          borderRadius: position.includes('left')
            ? '16px 16px 16px 4px'
            : '16px 16px 4px 16px',
          fontFamily: "'Inter', sans-serif",
          fontSize: config.fontSize,
          color: theme.text,
          lineHeight: 1.5,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        {activeLine?.text}
      </div>
    </div>
  );
};

// ============================================
// CAPTION/SUBTITLE COMPONENT (Smooth Transitions)
// ============================================

interface CaptionProps {
  captions: Array<{
    startFrame: number;
    endFrame: number;
    text: string;
  }>;
  theme?: ThemeColors;
  position?: 'bottom' | 'top';
  maxWidth?: number;
}

// Split text into sentences for better readability
const splitIntoSentences = (text: string): string[] => {
  // Split on sentence-ending punctuation followed by space
  // Use a compatible approach that works in all environments
  const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text];

  // Group sentences into chunks of 1-2 sentences (max ~100 chars each)
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length === 0) {
      currentChunk = sentence;
    } else if (currentChunk.length + sentence.length < 120) {
      currentChunk += ' ' + sentence;
    } else {
      chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [text];
};

export const Caption: React.FC<CaptionProps> = ({
  captions,
  theme = defaultTheme,
  position = 'bottom',
  maxWidth = 800,
}) => {
  const frame = useCurrentFrame();

  // Find current active caption
  const activeCaption = captions.find(cap => isInRange(frame, cap.startFrame, cap.endFrame));

  if (!activeCaption) return null;

  // Split long captions into sentence chunks
  const chunks = splitIntoSentences(activeCaption.text);
  const totalDuration = activeCaption.endFrame - activeCaption.startFrame;
  const chunkDuration = totalDuration / chunks.length;

  // Calculate which chunk to show based on current frame
  const frameWithinCaption = frame - activeCaption.startFrame;
  const currentChunkIndex = Math.min(
    Math.floor(frameWithinCaption / chunkDuration),
    chunks.length - 1
  );
  const currentChunk = chunks[currentChunkIndex];

  // Calculate chunk-specific timing
  const chunkStart = activeCaption.startFrame + (currentChunkIndex * chunkDuration);
  const chunkEnd = chunkStart + chunkDuration;

  // Smooth fade in and fade out for each chunk
  const fadeInDuration = 10; // frames
  const fadeOutDuration = 6; // frames

  const fadeInProgress = interpolate(
    frame,
    [chunkStart, chunkStart + fadeInDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOutProgress = interpolate(
    frame,
    [chunkEnd - fadeOutDuration, chunkEnd],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Use the minimum of fade-in and fade-out for smooth transitions
  const opacity = Math.min(fadeInProgress, fadeOutProgress);

  // Slide up effect on entry (per chunk)
  const slideY = interpolate(
    frame,
    [chunkStart, chunkStart + fadeInDuration],
    [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Parse text for highlights (e.g., <span class="hl">text</span>)
  const parseHighlights = (text: string) => {
    // Simple parser for highlight markup
    const parts = text.split(/(<hl>.*?<\/hl>|<hl-\w+>.*?<\/hl-\w+>)/g);

    return parts.map((part, index) => {
      if (part.startsWith('<hl>')) {
        const content = part.replace(/<\/?hl>/g, '');
        return (
          <span
            key={index}
            style={{
              color: neonColors.cyan,
              fontWeight: 700,
              textShadow: `0 0 10px ${neonColors.cyan}60`,
            }}
          >
            {content}
          </span>
        );
      }
      if (part.startsWith('<hl-green>')) {
        const content = part.replace(/<\/?hl-green>/g, '');
        return (
          <span
            key={index}
            style={{
              color: neonColors.green,
              fontWeight: 700,
              textShadow: `0 0 10px ${neonColors.green}60`,
            }}
          >
            {content}
          </span>
        );
      }
      if (part.startsWith('<hl-red>')) {
        const content = part.replace(/<\/?hl-red>/g, '');
        return (
          <span
            key={index}
            style={{
              color: neonColors.red,
              fontWeight: 700,
              textShadow: `0 0 10px ${neonColors.red}60`,
            }}
          >
            {content}
          </span>
        );
      }
      if (part.startsWith('<hl-orange>')) {
        const content = part.replace(/<\/?hl-orange>/g, '');
        return (
          <span
            key={index}
            style={{
              color: neonColors.orange,
              fontWeight: 700,
              textShadow: `0 0 10px ${neonColors.orange}60`,
            }}
          >
            {content}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        [position]: 80,
        left: '50%',
        transform: `translateX(-50%) translateY(${slideY}px)`,
        maxWidth,
        width: '90%',
        padding: '18px 32px',
        background: 'rgba(10, 10, 20, 0.95)',
        border: `1px solid rgba(${hexToRgb(neonColors.purple)}, 0.3)`,
        borderRadius: 16,
        fontFamily: "'Inter', sans-serif",
        fontSize: 20,
        fontWeight: 500,
        color: theme.text,
        textAlign: 'center',
        lineHeight: 1.7,
        opacity,
        zIndex: 99,
        boxShadow: `0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(${hexToRgb(neonColors.purple)}, 0.1)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {parseHighlights(currentChunk)}
    </div>
  );
};

// ============================================
// PROGRESS INDICATOR
// ============================================

interface ProgressIndicatorProps {
  currentScene: number;
  totalScenes: number;
  theme?: ThemeColors;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentScene,
  totalScenes,
  theme = defaultTheme,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 30,
        right: 30,
        display: 'flex',
        gap: 6,
        zIndex: 50,
      }}
    >
      {Array.from({ length: totalScenes }, (_, index) => (
        <div
          key={index}
          style={{
            width: index === currentScene ? 24 : 10,
            height: 10,
            borderRadius: 5,
            background: index === currentScene
              ? theme.primary
              : `rgba(${hexToRgb(theme.primary)}, 0.3)`,
            boxShadow: index === currentScene
              ? `0 0 10px rgba(${hexToRgb(theme.primary)}, 0.5)`
              : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};
