import React from 'react';
import { ThemeColors } from '../types';
import { defaultTheme } from '../styles/theme';

// ============================================
// TOKEN TYPES
// ============================================
type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'function'
  | 'comment'
  | 'property'
  | 'bracket'
  | 'operator'
  | 'plain';

interface Token {
  type: TokenType;
  value: string;
}

// ============================================
// LANGUAGE PATTERNS
// ============================================

const pythonKeywords = [
  'import', 'from', 'def', 'class', 'return', 'if', 'else', 'elif',
  'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'in',
  'is', 'not', 'and', 'or', 'True', 'False', 'None', 'lambda',
  'yield', 'raise', 'pass', 'break', 'continue', 'global', 'nonlocal',
  'assert', 'del', 'async', 'await'
];

const jsKeywords = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else',
  'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends',
  'import', 'export', 'from', 'default', 'async', 'await',
  'true', 'false', 'null', 'undefined', 'this', 'super',
  'typeof', 'instanceof', 'in', 'of'
];

const javaKeywords = [
  'public', 'private', 'protected', 'static', 'final', 'volatile',
  'synchronized', 'class', 'interface', 'extends', 'implements',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
  'continue', 'return', 'try', 'catch', 'finally', 'throw', 'throws',
  'new', 'this', 'super', 'null', 'true', 'false', 'void',
  'import', 'package', 'abstract', 'enum', 'instanceof', 'default'
];

const goKeywords = [
  'func', 'package', 'import', 'var', 'const', 'type', 'struct',
  'interface', 'map', 'chan', 'range', 'if', 'else', 'for',
  'switch', 'case', 'default', 'break', 'continue', 'return',
  'go', 'defer', 'select', 'fallthrough', 'nil', 'true', 'false',
  'make', 'new', 'append', 'len', 'cap', 'copy', 'delete'
];

const pythonBuiltins = [
  'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
  'set', 'tuple', 'bool', 'type', 'isinstance', 'open', 'input',
  'sorted', 'map', 'filter', 'zip', 'enumerate', 'sum', 'max', 'min',
  'abs', 'round', 'format', 'repr', 'id', 'hash', 'dir', 'vars',
  'getattr', 'setattr', 'hasattr', 'delattr'
];

// ============================================
// TOKENIZER
// ============================================

function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    // Comments
    if (remaining.startsWith('#')) {
      const end = remaining.indexOf('\n');
      const comment = end === -1 ? remaining : remaining.slice(0, end);
      tokens.push({ type: 'comment', value: comment });
      remaining = end === -1 ? '' : remaining.slice(end);
      matched = true;
    }

    // Triple-quoted strings
    if (!matched && (remaining.startsWith('"""') || remaining.startsWith("'''"))) {
      const quote = remaining.slice(0, 3);
      const end = remaining.indexOf(quote, 3);
      const str = end === -1 ? remaining : remaining.slice(0, end + 3);
      tokens.push({ type: 'string', value: str });
      remaining = end === -1 ? '' : remaining.slice(end + 3);
      matched = true;
    }

    // Strings
    if (!matched && (remaining[0] === '"' || remaining[0] === "'")) {
      const quote = remaining[0];
      let end = 1;
      while (end < remaining.length && remaining[end] !== quote) {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // f-strings
    if (!matched && (remaining.startsWith('f"') || remaining.startsWith("f'"))) {
      const quote = remaining[1];
      let end = 2;
      while (end < remaining.length && remaining[end] !== quote) {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // Numbers
    if (!matched && /^\d/.test(remaining)) {
      const match = remaining.match(/^\d+\.?\d*/);
      if (match) {
        tokens.push({ type: 'number', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Identifiers and keywords
    if (!matched && /^[a-zA-Z_]/.test(remaining)) {
      const match = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (match) {
        const word = match[0];
        let type: TokenType = 'plain';

        if (pythonKeywords.includes(word)) {
          type = 'keyword';
        } else if (pythonBuiltins.includes(word)) {
          type = 'function';
        } else if (remaining.slice(word.length).trimStart().startsWith('(')) {
          type = 'function';
        }

        tokens.push({ type, value: word });
        remaining = remaining.slice(word.length);
        matched = true;
      }
    }

    // Brackets
    if (!matched && /^[\[\]{}()]/.test(remaining)) {
      tokens.push({ type: 'bracket', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Operators
    if (!matched && /^[+\-*/%=<>!&|^~@:,.]/.test(remaining)) {
      tokens.push({ type: 'operator', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Whitespace and other
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function tokenizeJava(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    // Single-line comments
    if (remaining.startsWith('//')) {
      const end = remaining.indexOf('\n');
      const comment = end === -1 ? remaining : remaining.slice(0, end);
      tokens.push({ type: 'comment', value: comment });
      remaining = end === -1 ? '' : remaining.slice(end);
      matched = true;
    }

    // Multi-line comments
    if (!matched && remaining.startsWith('/*')) {
      const end = remaining.indexOf('*/');
      const comment = end === -1 ? remaining : remaining.slice(0, end + 2);
      tokens.push({ type: 'comment', value: comment });
      remaining = end === -1 ? '' : remaining.slice(end + 2);
      matched = true;
    }

    // Strings
    if (!matched && remaining[0] === '"') {
      let end = 1;
      while (end < remaining.length && remaining[end] !== '"') {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // Character literals
    if (!matched && remaining[0] === "'") {
      let end = 1;
      while (end < remaining.length && remaining[end] !== "'") {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // Numbers
    if (!matched && /^\d/.test(remaining)) {
      const match = remaining.match(/^\d+\.?\d*[fFdDlL]?/);
      if (match) {
        tokens.push({ type: 'number', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Annotations
    if (!matched && remaining.startsWith('@')) {
      const match = remaining.match(/^@[a-zA-Z_][a-zA-Z0-9_]*/);
      if (match) {
        tokens.push({ type: 'property', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Identifiers and keywords
    if (!matched && /^[a-zA-Z_]/.test(remaining)) {
      const match = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (match) {
        const word = match[0];
        let type: TokenType = 'plain';

        if (javaKeywords.includes(word)) {
          type = 'keyword';
        } else if (remaining.slice(word.length).trimStart().startsWith('(')) {
          type = 'function';
        } else if (/^[A-Z]/.test(word)) {
          // Likely a class name
          type = 'property';
        }

        tokens.push({ type, value: word });
        remaining = remaining.slice(word.length);
        matched = true;
      }
    }

    // Brackets
    if (!matched && /^[\[\]{}()]/.test(remaining)) {
      tokens.push({ type: 'bracket', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Operators
    if (!matched && /^[+\-*/%=<>!&|^~:;,.]/.test(remaining)) {
      tokens.push({ type: 'operator', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Whitespace and other
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function tokenizeGo(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    // Single-line comments
    if (remaining.startsWith('//')) {
      const end = remaining.indexOf('\n');
      const comment = end === -1 ? remaining : remaining.slice(0, end);
      tokens.push({ type: 'comment', value: comment });
      remaining = end === -1 ? '' : remaining.slice(end);
      matched = true;
    }

    // Multi-line comments
    if (!matched && remaining.startsWith('/*')) {
      const end = remaining.indexOf('*/');
      const comment = end === -1 ? remaining : remaining.slice(0, end + 2);
      tokens.push({ type: 'comment', value: comment });
      remaining = end === -1 ? '' : remaining.slice(end + 2);
      matched = true;
    }

    // Strings
    if (!matched && remaining[0] === '"') {
      let end = 1;
      while (end < remaining.length && remaining[end] !== '"') {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // Raw strings
    if (!matched && remaining[0] === '`') {
      const end = remaining.indexOf('`', 1);
      const str = end === -1 ? remaining : remaining.slice(0, end + 1);
      tokens.push({ type: 'string', value: str });
      remaining = end === -1 ? '' : remaining.slice(end + 1);
      matched = true;
    }

    // Numbers
    if (!matched && /^\d/.test(remaining)) {
      const match = remaining.match(/^\d+\.?\d*/);
      if (match) {
        tokens.push({ type: 'number', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Identifiers and keywords
    if (!matched && /^[a-zA-Z_]/.test(remaining)) {
      const match = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (match) {
        const word = match[0];
        let type: TokenType = 'plain';

        if (goKeywords.includes(word)) {
          type = 'keyword';
        } else if (remaining.slice(word.length).trimStart().startsWith('(')) {
          type = 'function';
        } else if (/^[A-Z]/.test(word)) {
          // Exported/public identifier
          type = 'property';
        }

        tokens.push({ type, value: word });
        remaining = remaining.slice(word.length);
        matched = true;
      }
    }

    // Brackets
    if (!matched && /^[\[\]{}()]/.test(remaining)) {
      tokens.push({ type: 'bracket', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Operators
    if (!matched && /^[+\-*/%=<>!&|^~:;,.]/.test(remaining)) {
      tokens.push({ type: 'operator', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Whitespace and other
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function tokenizeJSON(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    // Strings (keys and values)
    if (!matched && remaining[0] === '"') {
      let end = 1;
      while (end < remaining.length && remaining[end] !== '"') {
        if (remaining[end] === '\\') end++;
        end++;
      }
      const str = remaining.slice(0, end + 1);

      // Check if this is a key (followed by :)
      const afterStr = remaining.slice(end + 1).trimStart();
      const type: TokenType = afterStr.startsWith(':') ? 'property' : 'string';

      tokens.push({ type, value: str });
      remaining = remaining.slice(end + 1);
      matched = true;
    }

    // Numbers
    if (!matched && /^-?\d/.test(remaining)) {
      const match = remaining.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/);
      if (match) {
        tokens.push({ type: 'number', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Keywords (true, false, null)
    if (!matched && /^(true|false|null)/.test(remaining)) {
      const match = remaining.match(/^(true|false|null)/);
      if (match) {
        tokens.push({ type: 'keyword', value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
      }
    }

    // Brackets
    if (!matched && /^[\[\]{}]/.test(remaining)) {
      tokens.push({ type: 'bracket', value: remaining[0] });
      remaining = remaining.slice(1);
      matched = true;
    }

    // Other
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

// ============================================
// MAIN HIGHLIGHT FUNCTION
// ============================================

export function highlightCode(
  code: string,
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'bash' | 'java' | 'go',
  theme: ThemeColors = defaultTheme
): React.ReactNode[] {
  let tokens: Token[];

  switch (language) {
    case 'python':
      tokens = tokenizePython(code);
      break;
    case 'json':
      tokens = tokenizeJSON(code);
      break;
    case 'java':
      tokens = tokenizeJava(code);
      break;
    case 'go':
      tokens = tokenizeGo(code);
      break;
    case 'javascript':
    case 'typescript':
      tokens = tokenizeJava(code); // Java tokenizer works well for JS/TS too
      break;
    default:
      tokens = [{ type: 'plain', value: code }];
  }

  const colorMap: Record<TokenType, string> = {
    keyword: theme.code.keyword,
    string: theme.code.string,
    number: theme.code.number,
    function: theme.code.function,
    comment: theme.code.comment,
    property: theme.code.property,
    bracket: theme.code.bracket,
    operator: theme.textMuted,
    plain: theme.text,
  };

  return tokens.map((token, index) => (
    <span key={index} style={{ color: colorMap[token.type] }}>
      {token.value}
    </span>
  ));
}

// ============================================
// CODE BLOCK WITH LINE NUMBERS
// ============================================

export interface CodeLine {
  number: number;
  content: React.ReactNode[];
  highlighted?: boolean;
}

export function parseCodeWithLineNumbers(
  code: string,
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'bash' | 'java' | 'go',
  highlightLines: number[] = [],
  theme: ThemeColors = defaultTheme
): CodeLine[] {
  const lines = code.split('\n');

  return lines.map((line, index) => ({
    number: index + 1,
    content: highlightCode(line, language, theme),
    highlighted: highlightLines.includes(index + 1),
  }));
}
