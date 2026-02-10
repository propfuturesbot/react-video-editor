// ============================================
// IDE CODE SCENE - MULTI-LANGUAGE SYNTAX HIGHLIGHTER
// ============================================

import React from 'react';
import { SYNTAX_COLORS, LANGUAGE_KEYWORDS } from './constants';
import { SupportedLanguage } from './types';

interface HighlightedToken {
  text: string;
  color: string;
  style?: React.CSSProperties;
}

// Get keywords for a specific language
const getKeywords = (language: SupportedLanguage): string[] => {
  return LANGUAGE_KEYWORDS[language] || [];
};

// Detect if a word is a type/class name (starts with uppercase)
const isTypeName = (word: string): boolean => {
  return /^[A-Z][a-zA-Z0-9_]*$/.test(word);
};

// Detect if a word is a method name (followed by parenthesis in context)
const isMethodName = (word: string, nextChar: string): boolean => {
  return nextChar === '(' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word);
};

// Detect if text is a number
const isNumber = (text: string): boolean => {
  return /^-?\d+\.?\d*(f|F|L|l|d|D)?$/.test(text);
};

// Highlight a single line of code
export const highlightLine = (
  line: string,
  language: SupportedLanguage
): React.ReactNode => {
  const keywords = getKeywords(language);
  const result: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Python/bash style comments (#)
    if ((language === 'python') && remaining.startsWith('#')) {
      result.push(
        <span key={key++} style={{ color: SYNTAX_COLORS.comment, fontStyle: 'italic' }}>
          {remaining}
        </span>
      );
      break;
    }

    // C-style single line comments (//)
    if (remaining.startsWith('//')) {
      result.push(
        <span key={key++} style={{ color: SYNTAX_COLORS.comment, fontStyle: 'italic' }}>
          {remaining}
        </span>
      );
      break;
    }

    // Multi-line comment start (/* ... we just highlight to end of line)
    if (remaining.startsWith('/*')) {
      const endIdx = remaining.indexOf('*/');
      const commentText = endIdx >= 0 ? remaining.slice(0, endIdx + 2) : remaining;
      result.push(
        <span key={key++} style={{ color: SYNTAX_COLORS.comment, fontStyle: 'italic' }}>
          {commentText}
        </span>
      );
      if (endIdx >= 0) {
        remaining = remaining.slice(endIdx + 2);
        continue;
      }
      break;
    }

    // Double-quoted strings
    if (remaining.startsWith('"')) {
      const match = remaining.match(/^"(?:[^"\\]|\\.)*"/);
      if (match) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.string }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // Single-quoted strings (for Python, JS, Go)
    if (remaining.startsWith("'")) {
      const match = remaining.match(/^'(?:[^'\\]|\\.)*'/);
      if (match) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.string }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // Template literals for JS/TS
    if ((language === 'javascript' || language === 'typescript') && remaining.startsWith('`')) {
      const match = remaining.match(/^`(?:[^`\\]|\\.)*`/);
      if (match) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.string }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // Numbers (including floats and type suffixes)
    const numberMatch = remaining.match(/^-?\d+\.?\d*(f|F|L|l|d|D)?(?![a-zA-Z_])/);
    if (numberMatch) {
      result.push(
        <span key={key++} style={{ color: SYNTAX_COLORS.number }}>
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // Word token (identifier, keyword, type, method)
    const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const afterWord = remaining.slice(word.length);
      const nextNonSpace = afterWord.trimStart()[0] || '';

      // Check if it's a keyword
      if (keywords.includes(word)) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.keyword, fontWeight: 600 }}>
            {word}
          </span>
        );
      }
      // Check if it's a method call
      else if (isMethodName(word, nextNonSpace)) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.method }}>
            {word}
          </span>
        );
      }
      // Check if it's a type/class name
      else if (isTypeName(word)) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.type }}>
            {word}
          </span>
        );
      }
      // Regular identifier
      else {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.type }}>
            {word}
          </span>
        );
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Decorators/annotations for Python (@decorator) and Java (@Override)
    if (remaining.startsWith('@')) {
      const decoratorMatch = remaining.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/);
      if (decoratorMatch) {
        result.push(
          <span key={key++} style={{ color: SYNTAX_COLORS.property }}>
            {decoratorMatch[0]}
          </span>
        );
        remaining = remaining.slice(decoratorMatch[0].length);
        continue;
      }
    }

    // Default: output the character as-is
    result.push(
      <span key={key++} style={{ color: SYNTAX_COLORS.type }}>
        {remaining[0]}
      </span>
    );
    remaining = remaining.slice(1);
  }

  return <>{result}</>;
};

// Highlight multiple lines of code
export const highlightCode = (
  code: string,
  language: SupportedLanguage
): React.ReactNode[] => {
  const lines = code.split('\n');
  return lines.map((line, idx) => (
    <div key={idx}>{highlightLine(line, language)}</div>
  ));
};
