import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, PYTHON_SYNTAX } from '../constants';

interface PythonCodeBlockProps {
  code: string;
  highlightLines?: number[];
  currentLine?: number;
  showLineNumbers?: boolean;
  fontSize?: number;
  title?: string;
  showTitle?: boolean;
  animated?: boolean;
  typewriter?: boolean;
  typewriterSpeed?: number;
  animationStartFrame?: number;
  annotations?: CodeAnnotation[];
  breakpoints?: number[];
  width?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
}

interface CodeAnnotation {
  line: number;
  text: string;
  position?: 'left' | 'right';
  color?: string;
}

export const PythonCodeBlock: React.FC<PythonCodeBlockProps> = ({
  code,
  highlightLines = [],
  currentLine,
  showLineNumbers = true,
  fontSize = 16,
  title,
  showTitle = true,
  animated = true,
  typewriter = false,
  typewriterSpeed = 2,
  animationStartFrame = 0,
  annotations = [],
  breakpoints = [],
  width,
  maxWidth,
  maxHeight,
  position = 'center',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Parse and highlight code
  const lines = code.split('\n');

  // Animation progress
  const entranceProgress = animated
    ? spring({
        frame: frame - animationStartFrame,
        fps,
        config: DSA_SPRINGS.smooth,
      })
    : 1;

  // Typewriter effect
  const getVisibleChars = () => {
    if (!typewriter) return Infinity;
    const elapsed = frame - animationStartFrame - 20;
    return Math.max(0, elapsed * typewriterSpeed);
  };

  const visibleChars = getVisibleChars();

  // Token highlighter
  const highlightToken = (token: string, type: string): React.ReactNode => {
    const colors = PYTHON_SYNTAX.colors;
    let color = colors.default;

    switch (type) {
      case 'keyword':
        color = colors.keyword;
        break;
      case 'builtin':
        color = colors.builtin;
        break;
      case 'string':
        color = colors.string;
        break;
      case 'number':
        color = colors.number;
        break;
      case 'comment':
        color = colors.comment;
        break;
      case 'function':
        color = colors.function;
        break;
      case 'class':
        color = colors.class;
        break;
      case 'decorator':
        color = colors.decorator;
        break;
      case 'operator':
        color = colors.operator;
        break;
      case 'punctuation':
        color = colors.punctuation;
        break;
    }

    return (
      <span style={{ color }} key={Math.random()}>
        {token}
      </span>
    );
  };

  // Tokenize line
  const tokenizeLine = (line: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let position = 0;

    // Patterns for different token types
    const patterns: [RegExp, string][] = [
      // Comments
      [/^#.*$/, 'comment'],
      // Strings (triple quotes)
      [/^"""[\s\S]*?"""/, 'string'],
      [/^'''[\s\S]*?'''/, 'string'],
      // Strings (single/double quotes)
      [/^"(?:[^"\\]|\\.)*"/, 'string'],
      [/^'(?:[^'\\]|\\.)*'/, 'string'],
      // Decorators
      [/^@\w+/, 'decorator'],
      // Numbers
      [/^-?\d+\.?\d*/, 'number'],
      // Keywords
      [
        new RegExp(
          `^\\b(${PYTHON_SYNTAX.keywords.join('|')})\\b`
        ),
        'keyword',
      ],
      // Builtins
      [
        new RegExp(
          `^\\b(${PYTHON_SYNTAX.builtins.join('|')})\\b`
        ),
        'builtin',
      ],
      // Function definitions
      [/^(?<=def\s)\w+/, 'function'],
      // Class definitions
      [/^(?<=class\s)\w+/, 'class'],
      // Operators
      [/^[+\-*/%=<>!&|^~]+/, 'operator'],
      // Punctuation
      [/^[()[\]{}:,.]/, 'punctuation'],
      // Identifiers
      [/^\w+/, 'default'],
      // Whitespace
      [/^\s+/, 'whitespace'],
    ];

    while (remaining.length > 0) {
      let matched = false;

      for (const [pattern, type] of patterns) {
        const match = remaining.match(pattern);
        if (match) {
          const token = match[0];
          if (type !== 'whitespace') {
            tokens.push(highlightToken(token, type));
          } else {
            tokens.push(<span key={position}>{token}</span>);
          }
          remaining = remaining.slice(token.length);
          position += token.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Single character fallback
        tokens.push(
          <span key={position} style={{ color: PYTHON_SYNTAX.colors.default }}>
            {remaining[0]}
          </span>
        );
        remaining = remaining.slice(1);
        position++;
      }
    }

    return tokens;
  };

  // Simple syntax highlighter (more reliable)
  const highlightLine = (line: string): React.ReactNode => {
    // Handle comments
    const commentMatch = line.match(/^(\s*)(#.*)$/);
    if (commentMatch) {
      return (
        <>
          <span>{commentMatch[1]}</span>
          <span style={{ color: PYTHON_SYNTAX.colors.comment }}>
            {commentMatch[2]}
          </span>
        </>
      );
    }

    // Split by whitespace while preserving it
    const parts: React.ReactNode[] = [];
    let currentWord = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Handle strings
      if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
        if (!inString) {
          if (currentWord) {
            parts.push(colorizeWord(currentWord));
            currentWord = '';
          }
          inString = true;
          stringChar = char;
          currentWord = char;
        } else if (char === stringChar) {
          currentWord += char;
          parts.push(
            <span key={i} style={{ color: PYTHON_SYNTAX.colors.string }}>
              {currentWord}
            </span>
          );
          currentWord = '';
          inString = false;
        } else {
          currentWord += char;
        }
        continue;
      }

      if (inString) {
        currentWord += char;
        continue;
      }

      // Handle word boundaries
      if (/[\s()[\]{},:.+\-*/%=<>!&|^~]/.test(char)) {
        if (currentWord) {
          parts.push(colorizeWord(currentWord));
          currentWord = '';
        }
        // Color operators
        if (/[+\-*/%=<>!&|^~]/.test(char)) {
          parts.push(
            <span key={i} style={{ color: PYTHON_SYNTAX.colors.operator }}>
              {char}
            </span>
          );
        } else if (/[()[\]{}:,.]/.test(char)) {
          parts.push(
            <span key={i} style={{ color: PYTHON_SYNTAX.colors.punctuation }}>
              {char}
            </span>
          );
        } else {
          parts.push(<span key={i}>{char}</span>);
        }
      } else {
        currentWord += char;
      }
    }

    if (currentWord) {
      parts.push(colorizeWord(currentWord));
    }

    return <>{parts}</>;
  };

  // Colorize a single word
  const colorizeWord = (word: string): React.ReactNode => {
    const key = Math.random();

    // Keywords
    if (PYTHON_SYNTAX.keywords.includes(word)) {
      return (
        <span key={key} style={{ color: PYTHON_SYNTAX.colors.keyword }}>
          {word}
        </span>
      );
    }

    // Builtins
    if (PYTHON_SYNTAX.builtins.includes(word)) {
      return (
        <span key={key} style={{ color: PYTHON_SYNTAX.colors.builtin }}>
          {word}
        </span>
      );
    }

    // Numbers
    if (/^-?\d+\.?\d*$/.test(word)) {
      return (
        <span key={key} style={{ color: PYTHON_SYNTAX.colors.number }}>
          {word}
        </span>
      );
    }

    // Decorators
    if (word.startsWith('@')) {
      return (
        <span key={key} style={{ color: PYTHON_SYNTAX.colors.decorator }}>
          {word}
        </span>
      );
    }

    // Default
    return (
      <span key={key} style={{ color: PYTHON_SYNTAX.colors.default }}>
        {word}
      </span>
    );
  };

  // Calculate total characters for typewriter
  let totalChars = 0;

  // Position-based alignment
  const getPositionStyle = (): React.CSSProperties => {
    switch (position) {
      case 'top-left':
        return { alignSelf: 'flex-start', marginRight: 'auto' };
      case 'top-right':
        return { alignSelf: 'flex-start', marginLeft: 'auto' };
      case 'bottom-left':
        return { alignSelf: 'flex-end', marginRight: 'auto' };
      case 'bottom-right':
        return { alignSelf: 'flex-end', marginLeft: 'auto' };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: DSA_COLORS.code.background,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${DSA_COLORS.ui.border}`,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        fontSize,
        opacity: entranceProgress,
        transform: `scale(${0.95 + 0.05 * entranceProgress})`,
        width: width,
        maxWidth: maxWidth || 900,
        maxHeight: maxHeight,
        ...getPositionStyle(),
        ...style,
      }}
    >
      {/* Title bar */}
      {showTitle && title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: `${DSA_COLORS.ui.border}30`,
            borderBottom: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 6 }}>
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
                background: '#27ca3f',
              }}
            />
          </div>

          {/* Title */}
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: fontSize * 0.85,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Code content */}
      <div
        style={{
          padding: '16px 0',
          overflowX: 'auto',
        }}
      >
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isHighlighted = highlightLines.includes(lineNum);
          const isCurrent = currentLine === lineNum;
          const hasBreakpoint = breakpoints.includes(lineNum);
          const annotation = annotations.find((a) => a.line === lineNum);

          // Typewriter visibility
          const lineChars = line.length + 1; // +1 for newline
          const lineStart = totalChars;
          totalChars += lineChars;
          const lineVisible = typewriter ? visibleChars >= lineStart : true;
          const partialLine = typewriter
            ? Math.max(0, Math.min(lineChars, visibleChars - lineStart))
            : lineChars;

          if (!lineVisible && typewriter) {
            return null;
          }

          const displayLine = typewriter ? line.slice(0, partialLine) : line;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                minHeight: fontSize * 1.6,
                background: isCurrent
                  ? `${DSA_COLORS.code.currentLine}40`
                  : isHighlighted
                  ? `${DSA_COLORS.code.highlight}25`
                  : 'transparent',
                borderLeft: isCurrent
                  ? `3px solid ${DSA_COLORS.code.currentLine}`
                  : isHighlighted
                  ? `3px solid ${DSA_COLORS.code.highlight}`
                  : '3px solid transparent',
              }}
            >
              {/* Breakpoint */}
              {hasBreakpoint && (
                <div
                  style={{
                    width: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: DSA_COLORS.ui.error,
                    }}
                  />
                </div>
              )}

              {/* Line number */}
              {showLineNumbers && (
                <div
                  style={{
                    width: 50,
                    paddingRight: 16,
                    textAlign: 'right',
                    color: isCurrent
                      ? DSA_COLORS.code.currentLine
                      : DSA_COLORS.code.lineNumber,
                    userSelect: 'none',
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {lineNum}
                </div>
              )}

              {/* Code */}
              <div
                style={{
                  flex: 1,
                  paddingLeft: showLineNumbers ? 0 : 16,
                  paddingRight: 16,
                  whiteSpace: 'pre',
                  color: PYTHON_SYNTAX.colors.default,
                }}
              >
                {highlightLine(displayLine)}

                {/* Typewriter cursor */}
                {typewriter &&
                  visibleChars >= lineStart &&
                  visibleChars < lineStart + lineChars && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: fontSize,
                        background: DSA_COLORS.code.currentLine,
                        animation: 'blink 1s infinite',
                        verticalAlign: 'middle',
                        marginLeft: 2,
                      }}
                    />
                  )}
              </div>

              {/* Annotation */}
              {annotation && (
                <div
                  style={{
                    position: 'absolute',
                    right: annotation.position === 'left' ? 'auto' : 20,
                    left: annotation.position === 'left' ? 20 : 'auto',
                    padding: '4px 10px',
                    background: `${annotation.color || DSA_COLORS.syntax.comment}30`,
                    borderRadius: 6,
                    fontSize: fontSize * 0.8,
                    color: annotation.color || DSA_COLORS.syntax.comment,
                    fontStyle: 'italic',
                  }}
                >
                  {annotation.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PythonCodeBlock;
