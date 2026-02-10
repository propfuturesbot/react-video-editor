/**
 * Mermaid Code Sanitizer
 *
 * Fixes common issues with LLM-generated Mermaid code that cause parsing errors.
 *
 * Main issues addressed:
 * 1. Parentheses in node labels (e.g., "O(1)", "O(n log n)") conflict with Mermaid's
 *    node shape syntax where (text) creates a rounded rectangle.
 * 2. Special characters that need escaping in labels.
 * 3. Malformed syntax from LLM output.
 */

/**
 * Sanitizes Mermaid code to prevent parsing errors.
 *
 * @param mermaidCode - Raw Mermaid code string
 * @returns Sanitized Mermaid code safe for rendering
 */
export function sanitizeMermaidCode(mermaidCode: string): string {
  if (!mermaidCode || typeof mermaidCode !== 'string') {
    return '';
  }

  let sanitized = mermaidCode;

  // Step 1: Normalize line endings and clean up whitespace
  sanitized = sanitized.replace(/\r\n/g, '\n').trim();

  // Step 2: Fix node labels with problematic parentheses
  // Matches: A[Label with O(n)] or A[Some (text) here]
  // Replaces with: A["Label with O#40;n#41;"] using HTML entities
  sanitized = sanitizeNodeLabels(sanitized);

  // Step 3: Fix edge labels with parentheses
  // Matches: -->|O(1)| or -->|text (note)|
  sanitized = sanitizeEdgeLabels(sanitized);

  // Step 4: Fix subgraph titles
  sanitized = sanitizeSubgraphTitles(sanitized);

  return sanitized;
}

/**
 * Escapes parentheses in a text string using HTML entities.
 * Mermaid renders these correctly while avoiding parser conflicts.
 */
function escapeParentheses(text: string): string {
  return text
    .replace(/\(/g, '#40;')
    .replace(/\)/g, '#41;');
}

/**
 * Checks if text contains unescaped parentheses that need handling.
 */
function hasProblematicParentheses(text: string): boolean {
  // Check for literal parentheses that aren't already escaped as HTML entities
  // First, remove already-escaped sequences, then check for remaining ( or )
  const withoutEscaped = text.replace(/#40;/g, '').replace(/#41;/g, '');
  return /[()]/.test(withoutEscaped);
}

/**
 * Sanitizes node labels in square brackets, curly braces, etc.
 *
 * Node types in Mermaid:
 * - [text] - rectangle
 * - (text) - stadium/rounded - CONFLICTS with parens in labels!
 * - ((text)) - circle
 * - {text} - diamond
 * - {{text}} - hexagon
 * - ([text]) - stadium
 * - [[text]] - subroutine
 * - [(text)] - cylinder
 */
function sanitizeNodeLabels(code: string): string {
  // Pattern to match node definitions with labels
  // Matches: A[label], A{label}, A((label)), A{{label}}, etc.
  // Group 1: Node ID and opening bracket(s)
  // Group 2: Label content
  // Group 3: Closing bracket(s)

  const patterns = [
    // [label] - rectangle - most common, handle first
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\[)([^\]]+)(\])/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          // Use quotes and escape parentheses
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
    // {label} - diamond
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\{)([^{}]+)(\})/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
    // {{label}} - hexagon
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\{\{)([^{}]+)(\}\})/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
    // [[label]] - subroutine (use non-greedy match to capture full label until ]])
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\[\[)([\s\S]+?)(\]\])/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
    // ([label]) - stadium with explicit parens
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\(\[)([^\]]+)(\]\))/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
    // [(label)] - cylinder
    {
      regex: /(\b[A-Za-z_][A-Za-z0-9_]*\s*\[\()([^)]+)(\)\])/g,
      process: (match: string, prefix: string, label: string, suffix: string) => {
        if (hasProblematicParentheses(label)) {
          const escaped = escapeParentheses(label);
          return `${prefix}"${escaped}"${suffix}`;
        }
        return match;
      }
    },
  ];

  let result = code;
  for (const pattern of patterns) {
    result = result.replace(pattern.regex, (match, p1, p2, p3) => {
      return pattern.process(match, p1, p2, p3);
    });
  }

  return result;
}

/**
 * Sanitizes edge labels (text on arrows).
 * Matches: -->|label text| or ---|label|
 */
function sanitizeEdgeLabels(code: string): string {
  // Pattern: -->|label| or ---|label| or -.-|label| etc.
  return code.replace(
    /(--[->]|--[ox]|-\.-[->]?|==+[=>]?|~~+)\|([^|]+)\|/g,
    (match, arrow, label) => {
      if (hasProblematicParentheses(label)) {
        const escaped = escapeParentheses(label);
        return `${arrow}|${escaped}|`;
      }
      return match;
    }
  );
}

/**
 * Sanitizes subgraph titles.
 * Matches: subgraph Title Text
 */
function sanitizeSubgraphTitles(code: string): string {
  return code.replace(
    /^(\s*subgraph\s+)(.+)$/gm,
    (match, prefix, title) => {
      if (hasProblematicParentheses(title)) {
        const escaped = escapeParentheses(title);
        return `${prefix}"${escaped}"`;
      }
      return match;
    }
  );
}

/**
 * Validates if Mermaid code is likely to parse successfully.
 * Returns an object with validation result and any detected issues.
 */
export function validateMermaidCode(mermaidCode: string): {
  isValid: boolean;
  issues: string[];
  sanitized: string;
} {
  const issues: string[] = [];

  if (!mermaidCode || typeof mermaidCode !== 'string') {
    return { isValid: false, issues: ['Empty or invalid Mermaid code'], sanitized: '' };
  }

  // Check for diagram type declaration
  const hasType = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/m.test(mermaidCode);
  if (!hasType) {
    issues.push('Missing diagram type declaration (flowchart, graph, etc.)');
  }

  // Check for unbalanced brackets
  const brackets = { '[': 0, '{': 0, '(': 0 };
  for (const char of mermaidCode) {
    if (char === '[') brackets['[']++;
    if (char === ']') brackets['[']--;
    if (char === '{') brackets['{']++;
    if (char === '}') brackets['{']--;
    if (char === '(') brackets['(']++;
    if (char === ')') brackets['(']--;
  }

  if (brackets['['] !== 0) issues.push('Unbalanced square brackets []');
  if (brackets['{'] !== 0) issues.push('Unbalanced curly braces {}');
  // Note: Parentheses are tricky because they're used for node shapes

  // Sanitize and return
  const sanitized = sanitizeMermaidCode(mermaidCode);

  return {
    isValid: issues.length === 0,
    issues,
    sanitized,
  };
}

export default sanitizeMermaidCode;
