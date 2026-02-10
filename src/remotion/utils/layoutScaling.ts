/**
 * Layout Scaling Utilities for Remotion Video Components
 *
 * Provides viewport constants, dynamic canvas size calculators,
 * and content-aware sizing functions to ensure components utilize
 * 70-85% of the 1920x1080 viewport.
 */

// ============================================
// VIEWPORT CONSTANTS
// ============================================

export const VIEWPORT = {
  WIDTH: 1920,
  HEIGHT: 1080,
  SAFE_AREA: {
    HORIZONTAL: 80, // Padding from edges
    VERTICAL: 60,
  },
  USABLE_WIDTH: 1920 - 80 * 2, // 1760px
  USABLE_HEIGHT: 1080 - 60 * 2, // 960px
} as const;

// Minimum sizes for readability at 1080p
export const MIN_SIZES = {
  ICON: 48,
  FONT: 14,
  STROKE: 2,
  ICON_BOX: 56,
} as const;

// ============================================
// CONTENT SCENE LAYOUT
// ============================================

interface ContentLayoutParams {
  cardCount: number;
  layout: 'grid' | 'list';
}

export function getContentMaxWidth({ cardCount, layout }: ContentLayoutParams): number {
  if (layout === 'list') {
    return 1200;
  }

  // Dynamic width based on card count
  if (cardCount <= 2) return 1000;
  if (cardCount <= 3) return 1400;
  if (cardCount <= 4) return 1550;
  return 1650;
}

export function getContentCardStyles(cardCount: number) {
  // Scale down sizes for more cards to fit, but maintain minimums
  const baseIconBox = cardCount <= 3 ? 64 : cardCount <= 4 ? 58 : 56;
  const baseIconSize = cardCount <= 3 ? 28 : cardCount <= 4 ? 26 : 24;
  const baseTitleFont = cardCount <= 3 ? 22 : cardCount <= 4 ? 20 : 18;
  const baseDescFont = cardCount <= 3 ? 17 : cardCount <= 4 ? 16 : 15;
  const basePadding = cardCount <= 3 ? 28 : cardCount <= 4 ? 24 : 22;
  const baseGap = cardCount <= 3 ? 28 : cardCount <= 4 ? 26 : 24;

  return {
    iconBoxSize: Math.max(baseIconBox, MIN_SIZES.ICON_BOX),
    iconSize: Math.max(baseIconSize, 22),
    titleFontSize: Math.max(baseTitleFont, 18),
    descFontSize: Math.max(baseDescFont, MIN_SIZES.FONT),
    padding: basePadding,
    gap: baseGap,
  };
}

// ============================================
// COMPARISON SCENE LAYOUT
// ============================================

export function getComparisonMaxWidth(columnCount: number): number {
  if (columnCount <= 2) return 1400;
  if (columnCount <= 3) return 1550;
  return 1600;
}

export function getComparisonColumnWidth(columnCount: number): number {
  if (columnCount <= 2) return 550;
  if (columnCount <= 3) return 480;
  return 450;
}

export function getComparisonStyles(columnCount: number) {
  return {
    headerFontSize: columnCount <= 2 ? 22 : 20,
    itemFontSize: columnCount <= 2 ? 17 : 16,
    headerPadding: columnCount <= 2 ? '20px 28px' : '18px 24px',
    itemPadding: columnCount <= 2 ? '16px 24px' : '14px 20px',
    gap: 28,
  };
}

// ============================================
// TIMELINE SCENE LAYOUT
// ============================================

export function getTimelineMaxWidth(eventCount: number): number {
  if (eventCount <= 3) return 1200;
  if (eventCount <= 4) return 1450;
  if (eventCount <= 5) return 1550;
  return 1650;
}

export function getTimelineStyles(eventCount: number) {
  const cardWidth = eventCount <= 3 ? 280 : eventCount <= 4 ? 240 : eventCount <= 5 ? 220 : 200;

  return {
    cardWidth: Math.max(cardWidth, 200),
    nodeSize: eventCount <= 4 ? 28 : 24,
    connectorHeight: eventCount <= 4 ? 45 : 38,
    lineHeight: 6,
    labelFontSize: eventCount <= 4 ? 17 : 15,
    descFontSize: eventCount <= 4 ? 15 : 14,
    iconSize: eventCount <= 4 ? 32 : 28,
  };
}

// ============================================
// CLUSTER ARCHITECTURE SCENE LAYOUT
// ============================================

export function getClusterCanvasSize(componentCount: number, clusterCount: number) {
  // Base size with scaling for content
  const baseWidth = 1500;
  const baseHeight = 700;

  // Slightly adjust for very dense diagrams
  const widthScale = componentCount > 8 ? 1.1 : 1;
  const heightScale = clusterCount > 3 ? 1.15 : 1;

  return {
    width: Math.min(Math.round(baseWidth * widthScale), 1700),
    height: Math.min(Math.round(baseHeight * heightScale), 800),
  };
}

export function getClusterComponentStyles(size?: 'sm' | 'md' | 'lg' | 'xl') {
  switch (size) {
    case 'sm':
      return { box: 70, iconSize: 30, fontSize: 14 };
    case 'lg':
      return { box: 110, iconSize: 48, fontSize: 16 };
    case 'xl':
      return { box: 130, iconSize: 56, fontSize: 18 };
    default: // md
      return { box: 90, iconSize: 38, fontSize: 15 };
  }
}

// ============================================
// NETWORK DIAGRAM SCENE LAYOUT
// ============================================

export function getNetworkCanvasSize(nodeCount: number) {
  // Larger canvas for network diagrams
  const baseWidth = 1550;
  const baseHeight = 750;

  // Scale up slightly for more nodes
  const scale = nodeCount > 6 ? 1.05 : 1;

  return {
    width: Math.min(Math.round(baseWidth * scale), 1700),
    height: Math.min(Math.round(baseHeight * scale), 850),
  };
}

export function getNetworkNodeSize(size?: 'sm' | 'md' | 'lg' | 'xl') {
  switch (size) {
    case 'sm':
      return { width: 160, height: 85, iconSize: 30 };
    case 'lg':
      return { width: 240, height: 120, iconSize: 40 };
    case 'xl':
      return { width: 280, height: 140, iconSize: 44 };
    default: // md
      return { width: 200, height: 100, iconSize: 34 };
  }
}

export function getNetworkStyles() {
  return {
    labelFontSize: 15,
    sublabelFontSize: 12,
    strokeWidth: 3,
  };
}

// ============================================
// RADIAL DIAGRAM SCENE LAYOUT
// ============================================

export function getRadialCanvasSize(itemCount: number) {
  // Scale based on item count for optimal spacing
  if (itemCount <= 4) {
    return { width: 1300, height: 680 };
  }
  if (itemCount <= 6) {
    return { width: 1450, height: 750 };
  }
  return { width: 1550, height: 800 };
}

export function getRadialRadius(itemCount: number): number {
  if (itemCount <= 4) return 280;
  if (itemCount <= 6) return 320;
  return 340;
}

export function getRadialStyles(itemCount: number) {
  return {
    centerBoxSize: 130,
    centerIconSize: 52,
    itemBoxSize: itemCount <= 5 ? 85 : 75,
    itemIconSize: itemCount <= 5 ? 36 : 32,
    itemLabelFontSize: 14,
    connectionWidth: 3,
  };
}

// ============================================
// STATE DIAGRAM SCENE LAYOUT
// ============================================

export function getStateCanvasSize(stateCount: number) {
  const baseWidth = 1600;
  const baseHeight = 680;

  // Scale for more states
  const scale = stateCount > 5 ? 1.05 : 1;

  return {
    width: Math.min(Math.round(baseWidth * scale), 1700),
    height: Math.min(Math.round(baseHeight * scale), 750),
  };
}

export function getStateCircleRadius(stateCount: number): number {
  if (stateCount <= 4) return 70;
  if (stateCount <= 6) return 65;
  return 58;
}

export function getStateStyles() {
  return {
    labelFontSize: 16,
    smallLabelFontSize: 14,
    transitionLabelFontSize: 13,
    strokeWidth: 3,
  };
}

// ============================================
// SEQUENCE DIAGRAM SCENE LAYOUT
// ============================================

export function getSequenceCanvasSize(entityCount: number, messageCount: number) {
  // Width based on entities, height based on messages
  const width = Math.min(1550, 800 + entityCount * 150);
  const height = Math.min(700, 350 + messageCount * 80);

  return { width: Math.max(width, 1200), height: Math.max(height, 620) };
}

export function getSequenceStyles(entityCount: number) {
  return {
    entityBoxSize: entityCount <= 4 ? 100 : 90,
    entityIconSize: entityCount <= 4 ? 40 : 36,
    entityLabelFontSize: 14,
    messageLabelFontSize: 13,
    lifelineWidth: 3,
    entityGap: entityCount <= 3 ? 80 : 60,
  };
}

// ============================================
// ARCHITECTURE SCENE LAYOUT
// ============================================

export function getArchitectureMaxWidth(layerCount: number): number {
  if (layerCount <= 2) return 1400;
  if (layerCount <= 3) return 1500;
  return 1550;
}

export function getArchitectureStyles(componentCount: number) {
  return {
    iconBoxSize: componentCount <= 6 ? 95 : 85,
    iconSize: componentCount <= 6 ? 40 : 36,
    labelFontSize: 16,
    layerGap: 35,
    arrowHeight: 35,
  };
}

// ============================================
// FLOW SCENE LAYOUT
// ============================================

export function getFlowStyles(stepCount: number) {
  const boxSize = stepCount <= 4 ? 110 : stepCount <= 5 ? 100 : 90;

  return {
    boxSize: Math.max(boxSize, 90),
    iconSize: boxSize <= 90 ? 40 : 44,
    labelFontSize: 14,
    gap: stepCount <= 4 ? 28 : 24,
  };
}

// ============================================
// INTRO SCENE LAYOUT
// ============================================

export function getIntroStyles(iconCount: number) {
  return {
    iconBoxSize: iconCount <= 3 ? 100 : 90,
    iconSize: iconCount <= 3 ? 44 : 40,
    gap: iconCount <= 3 ? 28 : 24,
    arrowSize: 32,
  };
}

// ============================================
// CODE SCENE LAYOUT
// ============================================

export function getCodeSceneMaxWidth(hasOutput?: boolean): number {
  // Code scenes should use more horizontal space for readability
  return hasOutput ? 1500 : 1300;
}

export function getCodeStyles(hasOutput?: boolean, codeLineCount?: number) {
  const lines = codeLineCount || 20;

  return {
    // Code block takes up most of the width
    codeBlockMaxWidth: hasOutput ? 850 : 1100,
    codeBlockMinWidth: hasOutput ? 600 : 700,
    // Output panel is narrower
    outputMaxWidth: hasOutput ? 550 : 0,
    // Font sizes scale with content
    fontSize: lines <= 15 ? 16 : lines <= 25 ? 15 : 14,
    lineHeight: lines <= 15 ? 1.7 : 1.6,
    // Container padding
    padding: 28,
    gap: 36,
  };
}

// ============================================
// SUMMARY SCENE LAYOUT
// ============================================

export function getSummaryStyles(pointCount?: number) {
  const count = pointCount || 3;

  return {
    maxWidth: count <= 3 ? 1200 : 1400,
    ctaBoxWidth: 700,
    titleFontSize: count <= 3 ? 26 : 24,
    descFontSize: count <= 3 ? 18 : 17,
    pointGap: count <= 4 ? 24 : 20,
    iconBoxSize: count <= 3 ? 56 : 52,
  };
}

// ============================================
// GENERIC HELPERS
// ============================================

/**
 * Calculate dynamic gap based on item count and container width
 */
export function getDynamicGap(itemCount: number, containerWidth: number, minGap = 20): number {
  const idealGap = Math.floor(containerWidth / (itemCount + 1) * 0.15);
  return Math.max(idealGap, minGap);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Scale a value based on content count (more content = smaller scale)
 */
export function getContentScale(itemCount: number, baseValue: number, minScale = 0.7): number {
  const rawScale = 1 - (itemCount - 2) * 0.08;
  const scale = Math.min(1, Math.max(rawScale, minScale));
  return Math.round(baseValue * scale);
}
