// ============================================
// IDE CODE SCENE - ANNOTATION PANEL COMPONENT
// External panel that sits outside the IDE window
// ============================================

import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { AnnotationPanelProps } from './types';
import { IDE_COLORS, LAYOUT } from './constants';
import { fonts } from '../../fonts';

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotation,
  visible,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!annotation) {
    return null;
  }

  // Slide-in animation from right
  const slideProgress = spring({
    frame: visible ? frame : 0,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const opacity = visible ? slideProgress : 0;
  const translateX = visible ? (1 - slideProgress) * 30 : 30;

  return (
    <div
      style={{
        width: LAYOUT.EXTERNAL_ANNOTATION_WIDTH,
        height: 'fit-content',
        borderRadius: 12,
        padding: 20,
        background: IDE_COLORS.bgEditor,
        border: `2px solid ${annotation.color}`,
        boxShadow: `0 8px 40px ${annotation.color}40, 0 25px 80px rgba(0, 0, 0, 0.6)`,
        opacity,
        transform: `translateX(${translateX}px)`,
        fontFamily: fonts.jetbrains,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: LAYOUT.ANNOTATION_TITLE_SIZE,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 12,
          paddingBottom: 8,
          color: annotation.color,
          borderBottom: `1px solid ${annotation.color}50`,
          textTransform: 'uppercase',
        }}
      >
        {annotation.title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: LAYOUT.ANNOTATION_DESC_SIZE,
          lineHeight: 1.6,
          color: IDE_COLORS.textPrimary,
        }}
      >
        {annotation.description}
      </div>

      {/* Keyword badge if present */}
      {annotation.keyword && (
        <div
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            background: `${annotation.color}20`,
            border: `1px solid ${annotation.color}40`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: IDE_COLORS.textMuted,
            }}
          >
            Keyword:
          </span>
          <code
            style={{
              fontSize: 14,
              color: annotation.color,
              fontWeight: 600,
            }}
          >
            {annotation.keyword}
          </code>
        </div>
      )}
    </div>
  );
};

export default AnnotationPanel;
