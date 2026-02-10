// ============================================
// DATA DISPLAY SCENE - Renders rich visualization components
// ============================================

import React from 'react';
import { AbsoluteFill } from 'remotion';

// Import all DataDisplay components
import {
  FeatureMatrix,
  ProsConsGrid,
  RadarChart,
  MindMap,
  DecisionTree,
  TreeView,
  LayeredStack,
  Timeline,
  ArrayVisualizer,
  PointerAnimation,
  GraphVisualizer,
  TreeVisualizer,
  RecursionStack,
  PipelineConveyor,
  CircularFlow,
  StateTransition,
  SplitComparison,
  ZoomDrilldown,
  SummaryRecap,
  WarningCard,
  BestPracticeStamp,
  MentalModelCard,
  GridVisualizer,
  IntroFrame,
  Agenda,
  SectionHeader,
  CalloutBubble,
  TipBox,
  BeforeAfterToggle,
  ProgressiveDisclosure,
  ModuleView,
  SwimlaneDiagram,
  InfoPanel,
  GradientCard,
  DATA_DISPLAY_COLORS,
  FONTS,
} from './DataDisplay';

// Import DSA components
import {
  TwoPointers,
  SlidingWindow,
  FastSlowPointers,
  BinarySearch,
  LinearSearch,
  SortingVisualizer,
  ComplexityGraph,
  ComplexityBadge,
  ComplexityPair,
  OperationCounter,
  PythonCodeBlock,
  // New DSA components
  LinkedListContainer,
  Stack,
  Queue,
  CallStack,
  HashTable,
  DPTable,
  ArrayWithState,
} from './DSA';

import { renderIcon } from '../utils/lucideIconMap';
import { normalizeDataDisplayProps } from '../validation/dataDisplayNormalizers';

interface DataDisplaySceneProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  dataDisplayType: string;
  dataDisplayProps: Record<string, any>;
  theme: any;
}

export const DataDisplayScene: React.FC<DataDisplaySceneProps> = ({
  badge,
  title,
  subtitle,
  dataDisplayType,
  dataDisplayProps,
  theme,
}) => {
  // Normalize props FIRST to fix any malformed data from LLM
  const normalizedProps = normalizeDataDisplayProps(dataDisplayType, dataDisplayProps || {});

  // Container styles
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    boxSizing: 'border-box',
  };

  // Build props with title override and animation settings
  // Animation steps system: when animationSteps is provided in normalizedProps,
  // DSA components will animate through the sequence of states
  const buildProps = (overrides: Record<string, any> = {}) => ({
    title: title || normalizedProps.title,
    // Entrance animation delay (cells fading in, etc.)
    animationDelay: normalizedProps.animationDelay ?? 10,
    // Step-based animation settings (for DSA components)
    // These are passed through from normalizedProps when LLM generates them
    animationSteps: normalizedProps.animationSteps,
    stepDurationFrames: normalizedProps.stepDurationFrames ?? 45,
    animationStartFrame: normalizedProps.animationStartFrame,
    interpolationMode: normalizedProps.interpolationMode ?? 'smooth',
    ...normalizedProps,
    ...overrides,
  });

  // Auto-upgrade array-visualizer to array-with-state when animationSteps are provided
  // This ensures educational videos get the full variable state panel experience
  const getEffectiveDisplayType = (): string => {
    const type = dataDisplayType;

    // Auto-upgrade array-visualizer to array-with-state for animated content
    if (type === 'array-visualizer' && normalizedProps.animationSteps?.length > 0) {
      return 'array-with-state';
    }

    // Auto-upgrade two-pointers/sliding-window to array-with-state if they have variables
    if ((type === 'two-pointers' || type === 'sliding-window') &&
        normalizedProps.animationSteps?.length > 0 &&
        normalizedProps.animationSteps.some((step: any) => step.variables?.length > 0)) {
      return 'array-with-state';
    }

    return type;
  };

  const effectiveDisplayType = getEffectiveDisplayType();

  // Render the appropriate DataDisplay component
  // All required props come from normalizedProps which is passed from the scene JSON
  // We cast to `any` because TypeScript can't verify runtime JSON data at compile time
  const renderComponent = () => {
    const props = buildProps();

    switch (effectiveDisplayType) {
      // ============================================
      // COMPARISON & DECISION
      // ============================================
      case 'feature-matrix':
        return <FeatureMatrix {...(buildProps({ width: normalizedProps.width || 900 }) as any)} />;

      case 'pros-cons':
        return <ProsConsGrid {...(buildProps({ width: normalizedProps.width || 800 }) as any)} />;

      case 'radar-chart':
      case 'radial':
        return <RadarChart {...(buildProps({ width: normalizedProps.width || 700, height: normalizedProps.height || 600 }) as any)} />;

      case 'decision-tree':
        return <DecisionTree {...(buildProps({ width: normalizedProps.width || 900, height: normalizedProps.height || 600 }) as any)} />;

      case 'split-comparison':
        return <SplitComparison {...(buildProps({ width: normalizedProps.width || 1000, height: normalizedProps.height || 600 }) as any)} />;

      case 'comparison-table': {
        // Map comparison-table to FeatureMatrix with adapted props
        // Converts { columns: string[], rows: ComparisonRow[] } format to FeatureMatrix format
        const compTableColumns = (normalizedProps.columns || []).map((col: string) => ({
          label: col,
          color: DATA_DISPLAY_COLORS.cyan,
        }));
        const compTableRows = (normalizedProps.rows || []).map((row: any) => row.label || row);
        const compTableValues = (normalizedProps.rows || []).map((row: any) => row.values || []);
        return (
          <FeatureMatrix
            {...(buildProps({
              width: normalizedProps.width || 900,
              columns: compTableColumns,
              rows: compTableRows,
              values: compTableValues,
              highlightColumn: normalizedProps.highlightColumn,
            }) as any)}
          />
        );
      }

      // ============================================
      // HIERARCHY & STRUCTURE
      // ============================================
      case 'mind-map':
        return <MindMap {...(buildProps({ width: normalizedProps.width || 1000, height: normalizedProps.height || 700 }) as any)} />;

      case 'tree-view':
        return <TreeView {...(buildProps({ width: normalizedProps.width || 500 }) as any)} />;

      case 'layered-stack':
        return <LayeredStack {...(buildProps({ width: normalizedProps.width || 500 }) as any)} />;

      case 'module-view':
        return <ModuleView {...(buildProps({ width: normalizedProps.width || 450 }) as any)} />;

      // ============================================
      // FLOW & PROCESS
      // ============================================
      case 'timeline':
        // Map 'steps' to 'items' if needed (LLM sometimes generates 'steps')
        const timelineItems = normalizedProps.items || normalizedProps.steps || [];
        return <Timeline {...(buildProps({ width: normalizedProps.width || 1000, items: timelineItems }) as any)} />;

      case 'pipeline':
        return <PipelineConveyor {...(buildProps({ width: normalizedProps.width || 900 }) as any)} />;

      case 'circular-flow':
        return <CircularFlow {...(buildProps({ width: normalizedProps.width || 500, height: normalizedProps.height || 500 }) as any)} />;

      case 'state-machine':
        return <StateTransition {...(buildProps({ width: normalizedProps.width || 800, height: normalizedProps.height || 450 }) as any)} />;

      case 'swimlane':
        return <SwimlaneDiagram {...(buildProps({ width: normalizedProps.width || 1000, height: normalizedProps.height || 600 }) as any)} />;

      // ============================================
      // ALGORITHM / DSA
      // ============================================
      case 'array-visualizer':
        return <ArrayVisualizer {...(buildProps({ cellSize: normalizedProps.cellSize || 70 }) as any)} />;

      case 'array-with-state':
        return <ArrayWithState {...(buildProps({
          values: normalizedProps.values || [],
          title: normalizedProps.title,
          showIndices: normalizedProps.showIndices ?? true,
          cellSize: normalizedProps.cellSize || 'medium',
          pointers: normalizedProps.pointers || [],
          highlightIndices: normalizedProps.highlightIndices || [],
          variables: normalizedProps.variables || [],
          operation: normalizedProps.operation,
          operationDescription: normalizedProps.operationDescription,
          showVariablePanel: normalizedProps.showVariablePanel ?? true,
          showOperationPanel: normalizedProps.showOperationPanel ?? true,
          variablePanelPosition: normalizedProps.variablePanelPosition || 'right',
        }) as any)} />;

      case 'pointer-animation':
        return <PointerAnimation {...(buildProps({ cellSize: normalizedProps.cellSize || 70 }) as any)} />;

      case 'graph-visualizer':
        return <GraphVisualizer {...(buildProps({ width: normalizedProps.width || 900, height: normalizedProps.height || 600 }) as any)} />;

      case 'tree-visualizer':
        return <TreeVisualizer {...(buildProps({ width: normalizedProps.width || 800, height: normalizedProps.height || 500 }) as any)} />;

      case 'recursion-stack':
        return <RecursionStack {...(buildProps({ width: normalizedProps.width || 450 }) as any)} />;

      case 'grid-visualizer':
        return <GridVisualizer {...(buildProps({ width: normalizedProps.width || 600, height: normalizedProps.height || 500 }) as any)} />;

      // ============================================
      // DSA PATTERNS - Two Pointers, Sliding Window, etc.
      // ============================================
      case 'two-pointers': {
        const tpValues = normalizedProps.values || [];
        return <TwoPointers {...(buildProps({
          values: tpValues,
          left: normalizedProps.left ?? 0,
          right: normalizedProps.right ?? Math.max(0, tpValues.length - 1),
          leftLabel: normalizedProps.leftLabel || 'L',
          rightLabel: normalizedProps.rightLabel || 'R',
          target: normalizedProps.target,
          sum: normalizedProps.sum,
          direction: normalizedProps.direction || 'converging',
          showComparison: normalizedProps.showComparison ?? true,
          comparisonResult: normalizedProps.comparisonResult,
          highlightPair: normalizedProps.highlightPair ?? true,
          cellSize: normalizedProps.cellSize || 'medium',
        }) as any)} />;
      }

      case 'sliding-window':
        return <SlidingWindow {...(buildProps({
          values: normalizedProps.values || [],
          windowStart: normalizedProps.windowStart ?? 0,
          windowEnd: normalizedProps.windowEnd ?? 2,
          windowSum: normalizedProps.windowSum,
          windowMax: normalizedProps.windowMax,
          windowMin: normalizedProps.windowMin,
          windowContent: normalizedProps.windowContent,
          target: normalizedProps.target,
          constraint: normalizedProps.constraint,
          isValid: normalizedProps.isValid,
          optimalWindow: normalizedProps.optimalWindow,
          cellSize: normalizedProps.cellSize || 'medium',
        }) as any)} />;

      case 'fast-slow-pointers':
        return <FastSlowPointers {...(buildProps({
          values: normalizedProps.values || [],
          slow: normalizedProps.slow ?? 0,
          fast: normalizedProps.fast ?? 0,
          slowLabel: normalizedProps.slowLabel || 'Slow',
          fastLabel: normalizedProps.fastLabel || 'Fast',
          cycleDetected: normalizedProps.cycleDetected ?? false,
          meetingPoint: normalizedProps.meetingPoint,
          showPath: normalizedProps.showPath ?? true,
          cycleStart: normalizedProps.cycleStart,
          cellSize: normalizedProps.cellSize || 'medium',
        }) as any)} />;

      // ============================================
      // DSA SEARCHING
      // ============================================
      case 'binary-search': {
        const bsValues = normalizedProps.values || [];
        const bsLeft = normalizedProps.left ?? 0;
        const bsRight = normalizedProps.right ?? Math.max(0, bsValues.length - 1);
        return <BinarySearch {...(buildProps({
          values: bsValues,
          target: normalizedProps.target ?? 0,
          left: bsLeft,
          right: bsRight,
          mid: normalizedProps.mid ?? Math.floor((bsLeft + bsRight) / 2),
          found: normalizedProps.found ?? false,
          foundIndex: normalizedProps.foundIndex,
          eliminatedLeft: normalizedProps.eliminatedLeft ?? false,
          eliminatedRight: normalizedProps.eliminatedRight ?? false,
          iterations: normalizedProps.iterations ?? 0,
          showEliminatedHalves: normalizedProps.showEliminatedHalves ?? true,
          cellSize: normalizedProps.cellSize || 'medium',
        }) as any)} />;
      }

      case 'linear-search':
        return <LinearSearch {...(buildProps({
          values: normalizedProps.values || [],
          target: normalizedProps.target ?? 0,
          currentIndex: normalizedProps.currentIndex ?? 0,
          found: normalizedProps.found ?? false,
          foundIndex: normalizedProps.foundIndex,
          searchedIndices: normalizedProps.searchedIndices || [],
          cellSize: normalizedProps.cellSize || 'medium',
        }) as any)} />;

      // ============================================
      // DSA SORTING
      // ============================================
      case 'sorting-visualizer':
        return <SortingVisualizer {...(buildProps({
          values: normalizedProps.values || [],
          algorithm: normalizedProps.algorithm || 'bubble',
          comparing: normalizedProps.comparing,
          swapping: normalizedProps.swapping,
          sorted: normalizedProps.sorted || [],
          pivot: normalizedProps.pivot,
          minIndex: normalizedProps.minIndex,
          insertPosition: normalizedProps.insertPosition,
          comparisons: normalizedProps.comparisons ?? 0,
          swaps: normalizedProps.swaps ?? 0,
          arrayAccesses: normalizedProps.arrayAccesses ?? 0,
          showStats: normalizedProps.showStats ?? true,
          showAlgorithmInfo: normalizedProps.showAlgorithmInfo ?? true,
          style: normalizedProps.style || 'bars',
          width: normalizedProps.width || 800,
          height: normalizedProps.height || 400,
        }) as any)} />;

      // ============================================
      // DSA COMPLEXITY
      // ============================================
      case 'complexity-graph':
        return <ComplexityGraph {...(buildProps({
          curves: normalizedProps.curves || [
            { name: 'O(1)', complexity: 'O(1)', highlight: false },
            { name: 'O(log n)', complexity: 'O(log n)', highlight: false },
            { name: 'O(n)', complexity: 'O(n)', highlight: true },
          ],
          inputRange: normalizedProps.inputRange || [0, 100],
          currentN: normalizedProps.currentN,
          highlightCurve: normalizedProps.highlightCurve,
          showGrid: normalizedProps.showGrid ?? true,
          showLegend: normalizedProps.showLegend ?? true,
          width: normalizedProps.width || 700,
          height: normalizedProps.height || 450,
        }) as any)} />;

      case 'complexity-badge':
        return <ComplexityBadge {...(buildProps({
          timeComplexity: normalizedProps.timeComplexity || normalizedProps.time || 'O(n)',
          spaceComplexity: normalizedProps.spaceComplexity || normalizedProps.space || 'O(1)',
          showLabels: normalizedProps.showLabels ?? true,
          size: normalizedProps.size || 'large',
        }) as any)} />;

      case 'complexity-pair':
        return <ComplexityPair {...(buildProps({
          time: normalizedProps.time || 'O(n)',
          space: normalizedProps.space || 'O(1)',
          timeLabel: normalizedProps.timeLabel || 'Time',
          spaceLabel: normalizedProps.spaceLabel || 'Space',
          size: normalizedProps.size || 'large',
        }) as any)} />;

      case 'operation-counter':
        return <OperationCounter {...(buildProps({
          comparisons: normalizedProps.comparisons ?? 0,
          swaps: normalizedProps.swaps ?? 0,
          arrayAccesses: normalizedProps.arrayAccesses ?? 0,
          showComparisons: normalizedProps.showComparisons ?? true,
          showSwaps: normalizedProps.showSwaps ?? true,
          showAccesses: normalizedProps.showAccesses ?? true,
          size: normalizedProps.size || 'large',
        }) as any)} />;

      // ============================================
      // DSA CODE DISPLAY
      // ============================================
      case 'python-code':
        return <PythonCodeBlock {...(buildProps({
          code: normalizedProps.code || '# Python code here',
          title: normalizedProps.title || 'solution.py',
          highlightLines: normalizedProps.highlightLines || [],
          currentLine: normalizedProps.currentLine,
          showLineNumbers: normalizedProps.showLineNumbers ?? true,
          typewriter: normalizedProps.typewriter ?? false,
          typewriterSpeed: normalizedProps.typewriterSpeed || 2,
          fontSize: normalizedProps.fontSize || 16,
          width: normalizedProps.width || 700,
          maxWidth: normalizedProps.maxWidth || 800,
          maxHeight: normalizedProps.maxHeight || 550,
          position: normalizedProps.position || 'center',
          annotations: normalizedProps.annotations || [],
        }) as any)} />;

      // ============================================
      // DSA DATA STRUCTURES
      // ============================================
      case 'linked-list':
        return <LinkedListContainer {...(buildProps({
          nodes: normalizedProps.nodes || [],
          type: normalizedProps.type || 'singly',
          title: normalizedProps.title,
          pointers: normalizedProps.pointers || [],
          highlightIndices: normalizedProps.highlightIndices || [],
          showCycle: normalizedProps.showCycle,
          showIndices: normalizedProps.showIndices ?? true,
          animateTraversal: normalizedProps.animateTraversal ?? false,
          layout: normalizedProps.layout || 'horizontal',
        }) as any)} />;

      case 'stack':
        return <Stack {...(buildProps({
          items: normalizedProps.items || [],
          title: normalizedProps.title || 'Stack',
          maxVisible: normalizedProps.maxVisible || 8,
          operation: normalizedProps.operation || 'none',
          operationItem: normalizedProps.operationItem,
          highlightTop: normalizedProps.highlightTop ?? true,
          showTopPointer: normalizedProps.showTopPointer ?? true,
          orientation: normalizedProps.orientation || 'vertical',
          showIndices: normalizedProps.showIndices ?? false,
        }) as any)} />;

      case 'queue':
        return <Queue {...(buildProps({
          items: normalizedProps.items || [],
          title: normalizedProps.title || 'Queue',
          type: normalizedProps.type || 'fifo',
          maxVisible: normalizedProps.maxVisible || 8,
          operation: normalizedProps.operation || 'none',
          operationItem: normalizedProps.operationItem,
          showFrontRear: normalizedProps.showFrontRear ?? true,
          showIndices: normalizedProps.showIndices ?? false,
        }) as any)} />;

      case 'call-stack':
        return <CallStack {...(buildProps({
          frames: normalizedProps.frames || [],
          title: normalizedProps.title || 'Call Stack',
          maxDepth: normalizedProps.maxDepth || 6,
          highlightFrame: normalizedProps.highlightFrame,
          showReturnValues: normalizedProps.showReturnValues ?? true,
          showLocalVars: normalizedProps.showLocalVars ?? true,
          animateExecution: normalizedProps.animateExecution ?? true,
        }) as any)} />;

      case 'hash-table':
        return <HashTable {...(buildProps({
          buckets: normalizedProps.buckets || [],
          size: normalizedProps.size || 8,
          title: normalizedProps.title || 'Hash Table',
          hashFunction: normalizedProps.hashFunction || 'h(k) = k mod m',
          collisionStrategy: normalizedProps.collisionStrategy || 'chaining',
          operation: normalizedProps.operation,
          showLoadFactor: normalizedProps.showLoadFactor ?? true,
          showHashComputation: normalizedProps.showHashComputation ?? true,
          highlightBucket: normalizedProps.highlightBucket,
        }) as any)} />;

      case 'dp-table':
        return <DPTable {...(buildProps({
          values: normalizedProps.values || [[0]],
          title: normalizedProps.title || 'DP Table',
          rowLabels: normalizedProps.rowLabels,
          colLabels: normalizedProps.colLabels,
          currentCell: normalizedProps.currentCell,
          filledCells: normalizedProps.filledCells || [],
          transitions: normalizedProps.transitions || [],
          highlightCell: normalizedProps.highlightCell,
          optimalPath: normalizedProps.optimalPath || [],
          recurrence: normalizedProps.recurrence,
          showFormula: normalizedProps.showFormula ?? true,
          cellSize: normalizedProps.cellSize || 50,
        }) as any)} />;

      // ============================================
      // PROGRESSIVE REVEAL
      // ============================================
      case 'zoom-drilldown':
        return <ZoomDrilldown {...(buildProps({ width: normalizedProps.width || 800, height: normalizedProps.height || 550 }) as any)} />;

      case 'before-after':
        return <BeforeAfterToggle {...(buildProps({ width: normalizedProps.width || 800, height: normalizedProps.height || 400 }) as any)} />;

      case 'progressive-disclosure':
        return <ProgressiveDisclosure {...(buildProps({ width: normalizedProps.width || 600, height: normalizedProps.height || 400 }) as any)} />;

      // ============================================
      // TEACHING AIDS - LARGE SIZES for visual impact
      // ============================================
      case 'warning-card':
        return <WarningCard {...(buildProps({ width: normalizedProps.width || 700 }) as any)} />;

      case 'best-practice':
        return <BestPracticeStamp {...(buildProps({ width: normalizedProps.width || 600 }) as any)} />;

      case 'mental-model':
        return <MentalModelCard {...(buildProps({ width: normalizedProps.width || 900 }) as any)} />;

      case 'callout':
        return <CalloutBubble {...(buildProps({ width: normalizedProps.width || 600 }) as any)} />;

      case 'tip-box':
        return <TipBox {...(buildProps({ width: normalizedProps.width || 700 }) as any)} />;

      case 'info-panel':
        // Large full-screen info panel for key concepts
        return (
          <InfoPanel
            {...(buildProps({
              width: normalizedProps.width || 900,
              variant: normalizedProps.variant || 'gradient',
              accentColor: normalizedProps.accentColor || DATA_DISPLAY_COLORS.cyan,
            }) as any)}
          />
        );

      // ============================================
      // META / BRAND - LARGE SIZES for visual impact
      // ============================================
      case 'summary-recap':
        return <SummaryRecap {...(buildProps({ width: normalizedProps.width || 900 }) as any)} />;

      case 'intro-frame':
        return <IntroFrame {...(buildProps({ width: normalizedProps.width || 1000, height: normalizedProps.height || 600 }) as any)} />;

      case 'agenda':
        return <Agenda {...(buildProps({ width: normalizedProps.width || 700 }) as any)} />;

      case 'section-header':
        return <SectionHeader {...(buildProps({ width: normalizedProps.width || 900 }) as any)} />;

      // Hero card - large single concept with gradient
      case 'hero-card':
      case 'gradient-card':
        return (
          <GradientCard
            {...(buildProps({
              width: normalizedProps.width || 900,
              iconSize: normalizedProps.iconSize || 64,
              titleSize: normalizedProps.titleSize || 28,
              descriptionSize: normalizedProps.descriptionSize || 18,
              variant: normalizedProps.variant || 'filled',
              borderColor: normalizedProps.borderColor || normalizedProps.accentColor || DATA_DISPLAY_COLORS.cyan,
            }) as any)}
          />
        );

      default:
        // Fallback - show a message
        return (
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              color: DATA_DISPLAY_COLORS.textMuted,
              textAlign: 'center',
            }}
          >
            Unknown data display type: {effectiveDisplayType}
          </div>
        );
    }
  };

  return (
    <AbsoluteFill
      style={{
        // Removed opaque background - use transparent to show global VideoBackground
        fontFamily: FONTS.body,
      }}
    >
      {/* Background grid removed - global VideoBackground now handles backgrounds */}

      {/* Badge with optional Lucide icon - prominent top-left indicator */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 50,
            padding: '12px 24px',
            borderRadius: 12,
            background: `${DATA_DISPLAY_COLORS.cyan}25`,
            border: `2px solid ${DATA_DISPLAY_COLORS.cyan}50`,
            fontFamily: FONTS.mono,
            fontSize: 18,
            fontWeight: 600,
            color: DATA_DISPLAY_COLORS.cyan,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: `0 4px 20px ${DATA_DISPLAY_COLORS.cyan}30`,
            letterSpacing: '0.02em',
          }}
        >
          {/* Try to render Lucide icon if badge looks like "icon:text" or just "text" */}
          {(() => {
            // Check if badge has format "icon:text" (e.g., "check-square:Summary")
            if (badge.includes(':')) {
              const [iconName, text] = badge.split(':');
              const icon = renderIcon(iconName.trim(), 22, DATA_DISPLAY_COLORS.cyan);
              return (
                <>
                  {icon}
                  <span>{text.trim()}</span>
                </>
              );
            }
            // Otherwise just render the badge text (may contain emoji)
            return badge;
          })()}
        </div>
      )}

      {/* Main content area */}
      <div style={containerStyle}>
        {renderComponent()}
      </div>

      {/* Subtitle at bottom */}
      {subtitle && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: 18,
            color: DATA_DISPLAY_COLORS.textMuted,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default DataDisplayScene;
