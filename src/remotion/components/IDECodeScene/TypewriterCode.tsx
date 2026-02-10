// ============================================
// IDE CODE SCENE - TYPEWRITER CODE COMPONENT
// ============================================

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { highlightLine } from './SyntaxHighlighter';
import { TypewriterCodeProps } from './types';
import { LAYOUT } from './constants';
import { fonts } from '../../fonts';

export const TypewriterCode: React.FC<TypewriterCodeProps> = ({
  code,
  language,
  typedCharCount,
  highlightLine: highlightLineNum,
  highlightColor = '#FF6B6B',
  fontSize = LAYOUT.DEFAULT_FONT_SIZE,
}) => {
  const frame = useCurrentFrame();

  // Get the currently visible (typed) portion of the code
  const visibleCode = code.slice(0, typedCharCount);
  const lines = visibleCode.split('\n');

  // Determine if we're still typing
  const isTyping = typedCharCount < code.length;

  return (
    <pre
      style={{
        margin: 0,
        fontFamily: fonts.jetbrains,
        fontSize,
        lineHeight: `${LAYOUT.LINE_HEIGHT}px`,
      }}
    >
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isHighlighted = highlightLineNum === lineNum;

        return (
          <div
            key={idx}
            style={{
              height: LAYOUT.LINE_HEIGHT,
              minHeight: LAYOUT.LINE_HEIGHT,
              background: isHighlighted
                ? `linear-gradient(90deg, ${highlightColor}25 0%, transparent 100%)`
                : 'transparent',
              borderLeft: isHighlighted
                ? `3px solid ${highlightColor}`
                : '3px solid transparent',
              marginLeft: isHighlighted ? -3 : 0,
              paddingLeft: isHighlighted ? 3 : 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {highlightLine(line, language)}
            {/* Show cursor at end of last line while typing */}
            {isTyping && idx === lines.length - 1 && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: fontSize + 2,
                  marginLeft: 2,
                  background: '#FFFFFF',
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                }}
              />
            )}
          </div>
        );
      })}
    </pre>
  );
};

export default TypewriterCode;
