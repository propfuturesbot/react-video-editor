// ============================================
// IDE CODE SCENE - INTRO SCREEN COMPONENT
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AbsoluteFill } from 'remotion';
import { IntroScreenProps } from './types';
import { IDE_COLORS, SYNTAX_COLORS } from './constants';
import { fonts } from '../../fonts';

export const IntroScreen: React.FC<IntroScreenProps> = ({
  title,
  subtitle,
  progress,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title scale-in animation
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Subtitle fade-in animation (delayed)
  const subtitleOpacity = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Fade out at end of intro
  const fadeOut = interpolate(progress, [0.7, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut,
      }}
    >
      {/* Main title */}
      <h1
        style={{
          fontFamily: fonts.orbitron,
          fontSize: 80,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: 10,
          color: SYNTAX_COLORS.keyword,
          transform: `scale(${titleScale})`,
          textShadow: `0 0 50px ${SYNTAX_COLORS.keyword}50`,
          margin: 0,
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: fonts.jetbrains,
            fontSize: 24,
            color: IDE_COLORS.textMuted,
            marginTop: 30,
            letterSpacing: 6,
            opacity: subtitleOpacity,
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};

export default IntroScreen;
