// ============================================
// IDE CODE SCENE - IDE WINDOW COMPONENT
// Simplified: Annotation panel moved outside
// ============================================

import React from 'react';
import { IDEWindowProps } from './types';
import { IDE_COLORS, LAYOUT, LANGUAGE_ICONS } from './constants';
import { fonts } from '../../fonts';
import TypewriterCode from './TypewriterCode';
import LaserPointer from './LaserPointer';
import CodeScrollContainer from './CodeScrollContainer';

export const IDEWindow: React.FC<IDEWindowProps> = ({
  code,
  language,
  filename,
  typedCharCount,
  scrollY,
  visibleLines,
  fontSize,
  showLineNumbers,
  laserPosition,
  showLaser,
  highlightLine,
  highlightColor,
}) => {
  // Get visible code for line numbers
  const visibleCode = code.slice(0, typedCharCount);
  const lines = visibleCode.split('\n');
  const totalLines = code.split('\n').length;

  // Calculate max height for scrollable area
  const maxHeight = visibleLines * LAYOUT.LINE_HEIGHT;

  // Get language icon
  const langIcon = LANGUAGE_ICONS[language] || { color: '#888', letter: '?' };

  return (
    <div
      style={{
        width: LAYOUT.IDE_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow:
          '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255,255,255,0.1)',
        border: `1px solid ${IDE_COLORS.borderColor}`,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: IDE_COLORS.bgTitleBar,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Window controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ff5f56',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ffbd2e',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#27c93f',
              }}
            />
          </div>
          <span
            style={{
              marginLeft: 12,
              fontSize: 14,
              color: '#bbbbbb',
              fontFamily: fonts.jetbrains,
            }}
          >
            {filename} - IDE
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: IDE_COLORS.bgTitleBar,
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: IDE_COLORS.bgEditor,
            borderTop: `2px solid ${langIcon.color}`,
            color: '#bbbbbb',
            fontFamily: fonts.jetbrains,
          }}
        >
          {/* Language icon */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: langIcon.color,
              padding: '2px 4px',
              borderRadius: 3,
              background: `${langIcon.color}20`,
            }}
          >
            {langIcon.letter}
          </span>
          <span>{filename}</span>
          <span
            style={{
              color: '#777777',
              marginLeft: 8,
              cursor: 'pointer',
            }}
          >
            ×
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', background: IDE_COLORS.bgEditor }}>
        {/* Line numbers gutter */}
        {showLineNumbers && (
          <div
            style={{
              padding: '16px 12px',
              textAlign: 'right',
              background: IDE_COLORS.bgGutter,
              color: IDE_COLORS.textLineNum,
              minWidth: LAYOUT.GUTTER_WIDTH,
              borderRight: `1px solid ${IDE_COLORS.borderColor}`,
              fontFamily: fonts.jetbrains,
              fontSize: LAYOUT.LINE_NUMBER_FONT_SIZE,
            }}
          >
            <CodeScrollContainer scrollY={scrollY} maxHeight={maxHeight}>
              {Array.from({ length: totalLines }, (_, i) => (
                <div
                  key={i}
                  style={{
                    lineHeight: `${LAYOUT.LINE_HEIGHT}px`,
                    height: LAYOUT.LINE_HEIGHT,
                    opacity: i < lines.length ? 1 : 0.3,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </CodeScrollContainer>
          </div>
        )}

        {/* Code editor area */}
        <div
          style={{
            flex: 1,
            padding: '16px',
            fontSize,
            lineHeight: `${LAYOUT.LINE_HEIGHT}px`,
            position: 'relative',
            minHeight: maxHeight + 32,
            fontFamily: fonts.jetbrains,
          }}
        >
          <CodeScrollContainer scrollY={scrollY} maxHeight={maxHeight}>
            <TypewriterCode
              code={code}
              language={language}
              typedCharCount={typedCharCount}
              highlightLine={highlightLine}
              highlightColor={highlightColor}
              fontSize={fontSize}
            />
          </CodeScrollContainer>

          {/* Laser pointer */}
          {showLaser && (
            <LaserPointer
              position={{
                x: laserPosition.x,
                y: laserPosition.y - scrollY,
              }}
              color={highlightColor || '#FF6B6B'}
              visible={showLaser}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          padding: '4px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          background: IDE_COLORS.bgTitleBar,
          color: '#bbbbbb',
          fontFamily: fonts.jetbrains,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#499C54',
              }}
            />
            Ready
          </span>
          <span style={{ color: '#555555' }}>|</span>
          <span>UTF-8</span>
          <span style={{ color: '#555555' }}>|</span>
          <span style={{ textTransform: 'capitalize' }}>{language}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            Ln {lines.length}, Col{' '}
            {(visibleCode.split('\n').pop()?.length || 0) + 1}
          </span>
          <span style={{ color: '#555555' }}>|</span>
          <span>Spaces: 4</span>
        </div>
      </div>
    </div>
  );
};

export default IDEWindow;
