/**
 * Scene Data Normalizers
 *
 * Shared utility functions to normalize scene data from LLM output
 * to the format expected by rendering components.
 *
 * These normalizers handle format mismatches between LLM output and component props,
 * ensuring consistent data structures across ClaudeJsonVideo and TemplateVideo.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface NormalizedComparisonColumn {
  header: string;
  items: string[];
}

export interface NormalizedCodeOutput {
  text: string;
  type: 'normal' | 'success' | 'error';
  delay: number;
}

export interface NormalizedFlowStep {
  icon: string;
  label: string;
  description: string;
}

export interface NormalizedTimelineEvent {
  label: string;
  description: string;
  icon?: string;
}

export interface NormalizedSummaryPoint {
  title: string;
  description: string;
}

export interface NormalizedContentCard {
  icon: string;
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface NormalizedPosition {
  x: number;
  y: number;
}

export interface NormalizedNetworkNode {
  id: string;
  label: string;
  icon: string;
  position: NormalizedPosition;
  size: string;
  highlight: boolean;
}

export interface NormalizedRadialCenterLabel {
  label: string;
  icon: string;
  color?: string;
}

export interface NormalizedRadialItem {
  label: string;
  icon: string;
  description: string;
  color?: string;
}

// ============================================
// POSITION NORMALIZER
// ============================================

/**
 * Default position map for string-based positions.
 * The LLM may generate positions as strings like "center", "top-left", etc.
 * but the diagram components expect {x: number, y: number} percentages.
 */
export const DEFAULT_POSITION_MAP: Record<string, NormalizedPosition> = {
  'center': { x: 50, y: 50 },
  'top': { x: 50, y: 15 },
  'bottom': { x: 50, y: 85 },
  'left': { x: 15, y: 50 },
  'right': { x: 85, y: 50 },
  'top-left': { x: 20, y: 20 },
  'top-right': { x: 80, y: 20 },
  'bottom-left': { x: 20, y: 80 },
  'bottom-right': { x: 80, y: 80 },
  'center-left': { x: 30, y: 50 },
  'center-right': { x: 70, y: 50 },
};

/**
 * Convert string position names to percentage-based {x, y} coordinates.
 */
export function normalizePosition(position: unknown): NormalizedPosition {
  if (!position) return { x: 50, y: 50 };

  if (typeof position === 'string') {
    return DEFAULT_POSITION_MAP[position] || { x: 50, y: 50 };
  }

  if (
    typeof position === 'object' &&
    position !== null &&
    'x' in position &&
    'y' in position &&
    typeof (position as Record<string, unknown>).x === 'number' &&
    typeof (position as Record<string, unknown>).y === 'number'
  ) {
    return position as NormalizedPosition;
  }

  return { x: 50, y: 50 };
}

// ============================================
// COMPARISON NORMALIZERS
// ============================================

interface RawComparisonItem {
  text?: string;
  icon?: string;
}

interface RawComparisonColumn {
  header?: string;
  items?: (string | RawComparisonItem)[];
}

/**
 * Normalize comparison column items to strings.
 * Claude might generate items as strings OR as {text, icon} objects.
 */
export function normalizeComparisonColumns(
  columns: unknown[]
): NormalizedComparisonColumn[] {
  if (!columns || !Array.isArray(columns)) return [];

  return columns.map((col: unknown) => {
    const column = col as RawComparisonColumn;
    return {
      header: column.header || '',
      items: (column.items || []).map((item: unknown) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          const obj = item as RawComparisonItem;
          const text = obj.text || '';
          const icon = obj.icon || '';
          return icon ? `${icon} ${text}` : text;
        }
        return String(item || '');
      }),
    };
  });
}

// ============================================
// CODE OUTPUT NORMALIZERS
// ============================================

interface RawCodeOutput {
  text?: string;
  type?: string;
  delay?: number;
}

/**
 * Normalize code output lines.
 * Claude might generate various formats.
 */
export function normalizeCodeOutput(
  output: unknown[]
): NormalizedCodeOutput[] | undefined {
  if (!output || !Array.isArray(output)) return undefined;

  return output.map((line: unknown, index: number) => {
    if (typeof line === 'string') {
      return { text: line, type: 'normal' as const, delay: index * 10 };
    }

    const lineObj = line as RawCodeOutput;
    const typeValue = lineObj.type;
    const validType: 'normal' | 'success' | 'error' =
      typeValue === 'success' || typeValue === 'error' ? typeValue : 'normal';

    // Safely convert line to string if text is missing
    let fallbackText = '';
    if (!lineObj.text) {
      try {
        fallbackText = typeof line === 'object' && line !== null
          ? JSON.stringify(line)
          : String(line);
      } catch {
        fallbackText = '[object]';
      }
    }

    return {
      text: lineObj.text || fallbackText,
      type: validType,
      delay: typeof lineObj.delay === 'number' ? lineObj.delay : index * 10,
    };
  });
}

// ============================================
// FLOW STEP NORMALIZERS
// ============================================

interface RawFlowStep {
  icon?: string;
  label?: string;
  description?: string;
}

/**
 * Normalize flow steps.
 */
export function normalizeFlowSteps(steps: unknown[]): NormalizedFlowStep[] {
  if (!steps || !Array.isArray(steps)) return [];

  return steps.map((step: unknown) => {
    const s = step as RawFlowStep;
    return {
      icon: s.icon || 'box',
      label: s.label || '',
      description: s.description || '',
    };
  });
}

// ============================================
// TIMELINE NORMALIZERS
// ============================================

interface RawTimelineEvent {
  label?: string;
  description?: string;
  icon?: string;
}

/**
 * Normalize timeline events.
 */
export function normalizeTimelineEvents(
  events: unknown[]
): NormalizedTimelineEvent[] {
  if (!events || !Array.isArray(events)) return [];

  return events.map((event: unknown) => {
    const e = event as RawTimelineEvent;
    return {
      label: e.label || '',
      description: e.description || '',
      icon: e.icon,
    };
  });
}

// ============================================
// SUMMARY NORMALIZERS
// ============================================

interface RawSummaryPoint {
  title?: string;
  description?: string;
}

/**
 * Normalize summary points.
 */
export function normalizeSummaryPoints(
  points: unknown[]
): NormalizedSummaryPoint[] {
  if (!points || !Array.isArray(points)) return [];

  return points.map((point: unknown) => {
    const p = point as RawSummaryPoint;
    return {
      title: p.title || '',
      description: p.description || '',
    };
  });
}

// ============================================
// CONTENT CARD NORMALIZERS
// ============================================

interface RawContentCard {
  icon?: string;
  title?: string;
  description?: string;
  variant?: string;
}

/**
 * Normalize cards for content scene.
 */
export function normalizeContentCards(
  cards: unknown[]
): NormalizedContentCard[] {
  if (!cards || !Array.isArray(cards)) return [];

  return cards.map((card: unknown) => {
    const c = card as RawContentCard;
    const validVariants = ['default', 'success', 'warning', 'error', 'info'];
    const variant = validVariants.includes(c.variant || '')
      ? (c.variant as NormalizedContentCard['variant'])
      : undefined;

    return {
      icon: c.icon || '📝',
      title: c.title || '',
      description: c.description || '',
      variant,
    };
  });
}

// ============================================
// NETWORK DATA NORMALIZERS
// ============================================

interface RawNetworkNode {
  id?: string;
  label?: string;
  icon?: string;
  position?: unknown;
  size?: string;
  highlight?: boolean;
}

interface RawNetworkScene {
  nodes?: RawNetworkNode[];
  components?: RawNetworkNode[];
  connections?: unknown[];
}

/**
 * Normalize network scene data: handle both old (components + string positions)
 * and new (nodes + {x,y} positions) formats.
 */
export function normalizeNetworkData(scene: unknown): {
  nodes: NormalizedNetworkNode[];
  connections: unknown[];
} {
  const s = scene as RawNetworkScene;
  const raw = s.nodes || s.components || [];
  const nodes = raw.map((node: RawNetworkNode, i: number) => ({
    id: node.id || `node-${i}`,
    label: node.label || '',
    icon: node.icon || 'box',
    position: normalizePosition(node.position),
    size: node.size || 'md',
    highlight: node.highlight || false,
  }));
  return { nodes, connections: s.connections || [] };
}

// ============================================
// RADIAL DATA NORMALIZERS
// ============================================

interface RawRadialCenterLabel {
  label?: string;
  text?: string;
  title?: string;
  icon?: string;
  color?: string;
}

interface RawRadialItem {
  label?: string;
  title?: string;
  icon?: string;
  description?: string;
  color?: string;
}

interface RawRadialScene {
  centerLabel?: string | RawRadialCenterLabel;
  centerIcon?: string;
  centerColor?: string;
  title?: string;
  items?: RawRadialItem[];
  components?: RawRadialItem[];
}

/**
 * Normalize radial scene data: handle both old (components + centerLabel string)
 * and new (items + centerLabel object) formats.
 */
export function normalizeRadialData(scene: unknown): {
  centerLabel: NormalizedRadialCenterLabel;
  items: NormalizedRadialItem[];
} {
  const s = scene as RawRadialScene;

  // Normalize center label
  let centerLabel: NormalizedRadialCenterLabel;
  if (!s.centerLabel || typeof s.centerLabel === 'string') {
    centerLabel = {
      label: (s.centerLabel as string) || s.title || 'Center',
      icon: s.centerIcon || '⚡',
      color: s.centerColor,
    };
  } else {
    const cl = s.centerLabel as RawRadialCenterLabel;
    centerLabel = {
      label: cl.label || cl.text || cl.title || 'Center',
      icon: cl.icon || '⚡',
      color: cl.color,
    };
  }

  // Normalize items: could be "items" or "components"
  const rawItems = s.items || s.components || [];
  const items = rawItems.map((item: RawRadialItem) => ({
    label: item.label || item.title || '',
    icon: item.icon || '📌',
    description: item.description || '',
    color: item.color,
  }));

  return { centerLabel, items };
}
