import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb } from '../styles/theme';
import { highlightCode } from '../utils/syntaxHighlight';
import { fadeIn, getStaggerDelay } from '../utils/animations';

// IDE-style colors (IntelliJ Darcula inspired)
const IDE_COLORS = {
  bgEditor: '#2b2b2b',
  bgTitleBar: '#3c3f41',
  bgGutter: '#313335',
  textLineNum: '#606366',
  borderColor: '#3c3f41',
};

// Language icons and colors
const LANGUAGE_CONFIG: Record<string, { color: string; label: string }> = {
  python: { color: '#3776AB', label: 'Python' },
  javascript: { color: '#F7DF1E', label: 'JavaScript' },
  typescript: { color: '#3178C6', label: 'TypeScript' },
  java: { color: '#CC7832', label: 'Java' },
  json: { color: '#6B7280', label: 'JSON' },
  bash: { color: '#4EAA25', label: 'Bash' },
  go: { color: '#00ADD8', label: 'Go' },
};

interface CodeBlockProps {
  code: string;
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'bash' | 'java' | 'go';
  filename?: string;
  theme?: ThemeColors;
  delay?: number;
  animateLines?: boolean;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxWidth?: number;
  fontSize?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  filename,
  theme = defaultTheme,
  delay = 0,
  animateLines = true,
  highlightLines = [],
  showLineNumbers = true,
  maxWidth = 800,
  fontSize = 16,
}) => {
  const frame = useCurrentFrame();

  const lines = code.split('\n');
  const containerOpacity = fadeIn({ frame, start: delay, duration: 15 });
  const langConfig = LANGUAGE_CONFIG[language] || { color: '#888', label: language };

  return (
    <div
      style={{
        opacity: containerOpacity,
        maxWidth,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1)',
        border: `1px solid ${IDE_COLORS.borderColor}`,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: IDE_COLORS.bgTitleBar,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27CA40' }} />
          </div>

          {/* Filename */}
          {filename && (
            <span
              style={{
                marginLeft: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: '#bbbbbb',
              }}
            >
              {filename}
            </span>
          )}
        </div>
      </div>

      {/* Tab Bar */}
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
            borderTop: `2px solid ${langConfig.color}`,
            color: '#bbbbbb',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {/* Language badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: langConfig.color,
              padding: '2px 6px',
              borderRadius: 3,
              background: `${langConfig.color}20`,
            }}
          >
            {langConfig.label}
          </span>
          <span>{filename || `code.${language}`}</span>
        </div>
      </div>

      {/* Code Area */}
      <div style={{ display: 'flex', background: IDE_COLORS.bgEditor }}>
        {/* Line numbers gutter */}
        {showLineNumbers && (
          <div
            style={{
              padding: '16px 12px',
              textAlign: 'right',
              background: IDE_COLORS.bgGutter,
              color: IDE_COLORS.textLineNum,
              minWidth: 50,
              borderRight: `1px solid ${IDE_COLORS.borderColor}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: fontSize - 2,
              lineHeight: '24px',
            }}
          >
            {lines.map((_, i) => (
              <div key={i} style={{ height: 24 }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Code body */}
        <div
          style={{
            flex: 1,
            padding: '16px 20px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize,
            lineHeight: '24px',
            overflowX: 'auto',
          }}
        >
          {lines.map((line, index) => {
            const lineDelay = animateLines
              ? delay + 15 + getStaggerDelay(index, 0, 4)
              : delay;
            const lineOpacity = fadeIn({ frame, start: lineDelay, duration: 10 });
            const isHighlighted = highlightLines.includes(index + 1);

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  height: 24,
                  opacity: lineOpacity,
                  background: isHighlighted
                    ? `linear-gradient(90deg, ${theme.primary}25 0%, transparent 100%)`
                    : 'transparent',
                  marginLeft: isHighlighted ? -20 : 0,
                  marginRight: isHighlighted ? -20 : 0,
                  paddingLeft: isHighlighted ? 20 : 0,
                  paddingRight: isHighlighted ? 20 : 0,
                  borderLeft: isHighlighted
                    ? `3px solid ${theme.primary}`
                    : '3px solid transparent',
                }}
              >
                {/* Code content */}
                <span style={{ flex: 1 }}>
                  {highlightCode(line || ' ', language, theme)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '4px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          background: IDE_COLORS.bgTitleBar,
          color: '#bbbbbb',
          fontFamily: "'JetBrains Mono', monospace",
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
          <span>{langConfig.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Ln {lines.length}, Col 1</span>
          <span style={{ color: '#555555' }}>|</span>
          <span>Spaces: 4</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CODE OUTPUT
// ============================================

interface CodeOutputProps {
  lines: Array<{
    text: string;
    type?: 'normal' | 'success' | 'error';
    delay: number;
  }>;
  theme?: ThemeColors;
  baseDelay?: number;
  title?: string;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({
  lines,
  theme = defaultTheme,
  baseDelay = 0,
  title = 'Output',
}) => {
  const frame = useCurrentFrame();

  const containerOpacity = fadeIn({ frame, start: baseDelay, duration: 15 });

  const getTypeColor = (type?: 'normal' | 'success' | 'error') => {
    switch (type) {
      case 'success': return theme.success;
      case 'error': return theme.error;
      default: return theme.text;
    }
  };

  return (
    <div
      style={{
        opacity: containerOpacity,
        background: `rgba(${hexToRgb(theme.success)}, 0.05)`,
        border: `1px solid rgba(${hexToRgb(theme.success)}, 0.25)`,
        borderRadius: 14,
        padding: 24,
        boxShadow: `0 0 30px rgba(${hexToRgb(theme.success)}, 0.1)`,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: theme.text,
        }}
      >
        <span>📟</span>
        {title}
      </div>

      {/* Output lines */}
      {lines.map((line, index) => {
        const lineOpacity = fadeIn({
          frame,
          start: baseDelay + line.delay,
          duration: 12
        });

        return (
          <div
            key={index}
            style={{
              opacity: lineOpacity,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 8,
              marginBottom: 8,
              color: getTypeColor(line.type),
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
