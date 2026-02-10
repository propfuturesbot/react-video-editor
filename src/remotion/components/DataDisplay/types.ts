// ============================================
// DATA DISPLAY COMPONENT TYPES
// ============================================

import React from 'react';

// Base props for all data display components
export interface DataDisplayBaseProps {
  x?: number;                    // Optional absolute X positioning
  y?: number;                    // Optional absolute Y positioning
  width?: number;                // Component width
  height?: number;               // Component height
  animateIn?: boolean;           // Enable entry animation
  animationDelay?: number;       // Delay before animation starts (frames)
  style?: React.CSSProperties;   // Additional styles
}

// ============================================
// GRADIENT CARD
// ============================================
export interface GradientCardProps extends DataDisplayBaseProps {
  icon: string;                  // Emoji or icon character
  title: string;                 // Card title
  description: string;           // Card description
  borderColor: string;           // Gradient/glow color (hex)
  variant?: 'default' | 'minimal' | 'filled';
  iconSize?: number;             // Icon container size
  titleSize?: number;            // Title font size
  descriptionSize?: number;      // Description font size
}

// ============================================
// QUADRANT MATRIX
// ============================================
export interface QuadrantItem {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  label: string;
  color?: string;
  opacity?: number;
  icon?: string;
}

export interface QuadrantMatrixProps extends DataDisplayBaseProps {
  title?: string;
  xAxisLabel: string;            // Label for X axis (horizontal, bottom)
  yAxisLabel: string;            // Label for Y axis (vertical, left)
  xAxisLabelPositive?: string;   // Label for positive X direction
  xAxisLabelNegative?: string;   // Label for negative X direction
  yAxisLabelPositive?: string;   // Label for positive Y direction
  yAxisLabelNegative?: string;   // Label for negative Y direction
  quadrants: QuadrantItem[];
  axisColor?: string;
  labelColor?: string;
}

// ============================================
// VENN DIAGRAM
// ============================================
export interface VennCircle {
  label: string;
  icon?: string;
  description?: string;
  color: string;
  // Position determines where the circle is placed
  position: 'top' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
}

export interface VennDiagramProps extends DataDisplayBaseProps {
  title?: string;
  centerLabel?: string;          // Label for intersection
  centerIcon?: string;           // Icon for center
  circles: VennCircle[];
  showIntersection?: boolean;    // Highlight the intersection area
}

// ============================================
// SEGMENTED WHEEL
// ============================================
export interface WheelSegment {
  icon: string;
  title: string;
  description?: string;
  color: string;
}

export interface SegmentedWheelProps extends DataDisplayBaseProps {
  centerIcon: string;            // Icon in the center
  centerLabel: string;           // Label below center icon
  segments: WheelSegment[];
  radius?: number;               // Radius of the wheel
  connectionStyle?: 'line' | 'arc' | 'none';
}

// ============================================
// INFO PANEL
// ============================================
export interface InfoPanelProps extends DataDisplayBaseProps {
  icon?: string;
  title: string;
  body: string;
  variant?: 'glass' | 'gradient' | 'solid' | 'outlined';
  accentColor?: string;
  headerAlignment?: 'left' | 'center';
}

// ============================================
// GLOW ICON
// ============================================
export interface GlowIconProps {
  icon: string | React.ReactNode; // Emoji, Lucide icon name (e.g., "Rocket"), or custom React component
  color: string;                 // Glow color
  size?: number;                 // Container size
  iconScale?: number;            // Scale of icon within container (0-1)
  variant?: 'box' | 'circle';    // Shape of container
  glowIntensity?: number;        // Intensity of glow effect (0-1)
  style?: React.CSSProperties;
  animationDelay?: number;
}

// ============================================
// COMPARISON TABLE
// ============================================
export interface ComparisonRow {
  label: string;
  values: string[];              // One value per column
  highlight?: boolean;           // Highlight this row
}

export interface ComparisonTableProps extends DataDisplayBaseProps {
  title?: string;
  columns: string[];             // Column headers
  rows: ComparisonRow[];
  columnColors?: string[];       // Color for each column
  highlightColor?: string;
}

// ============================================
// TIMELINE
// ============================================
export interface TimelineItem {
  icon?: string;
  title: string;
  description?: string;
  color?: string;
}

export interface TimelineProps extends DataDisplayBaseProps {
  title?: string;
  items: TimelineItem[];
  orientation?: 'horizontal' | 'vertical';
  connectorStyle?: 'solid' | 'dashed' | 'dotted';
  defaultColor?: string;
  activeStep?: number;                     // Highlighted step (0-indexed)
}

// ============================================
// FEATURE MATRIX
// ============================================
export interface FeatureMatrixColumn {
  label: string;
  color?: string;
  icon?: string;
}

export interface FeatureMatrixProps extends DataDisplayBaseProps {
  title?: string;
  rows: string[];                          // Feature names (Y-axis)
  columns: FeatureMatrixColumn[];          // Options (X-axis)
  values: ('check' | 'cross' | 'partial' | string | number)[][]; // Grid values
  highlightColumn?: number;                // Column to emphasize
  rowIcons?: string[];                     // Optional icons per row
}

// ============================================
// TREE VIEW
// ============================================
export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  children?: TreeNode[];
}

export interface TreeViewProps extends DataDisplayBaseProps {
  title?: string;
  root: TreeNode;
  expandedIds?: string[];                  // Which nodes are expanded
  highlightPath?: string[];                // IDs to highlight
  orientation?: 'vertical' | 'horizontal';
}

// ============================================
// LAYERED STACK
// ============================================
export interface StackLayer {
  label: string;
  icon?: string;
  sublabel?: string;
  color?: string;
}

export interface LayeredStackProps extends DataDisplayBaseProps {
  title?: string;
  layers: StackLayer[];
  direction?: 'top-down' | 'bottom-up';    // Which layer appears first
  showArrows?: boolean;                    // Arrows between layers
  highlightLayer?: number;
}

// ============================================
// CALLOUT BUBBLE
// ============================================
export interface CalloutBubbleProps extends DataDisplayBaseProps {
  text: string;
  icon?: string;
  variant?: 'speech' | 'thought' | 'tip' | 'warning';
  pointerDirection?: 'top' | 'bottom' | 'left' | 'right';
  accentColor?: string;
}

// ============================================
// ARRAY VISUALIZER
// ============================================
export interface ArrayPointer {
  index: number;
  label: string;
  color?: string;
}

export interface ArrayVisualizerProps extends DataDisplayBaseProps {
  title?: string;
  values: (number | string)[];
  highlightIndices?: number[];             // Cells to highlight
  pointers?: ArrayPointer[];
  showIndices?: boolean;                   // Show index numbers below
  cellSize?: number;
  highlightColor?: string;
}

// ============================================
// POINTER ANIMATION
// ============================================
export interface PointerAnimationProps extends DataDisplayBaseProps {
  title?: string;
  values: (number | string)[];
  leftPointer?: { index: number; label?: string; color?: string };
  rightPointer?: { index: number; label?: string; color?: string };
  windowHighlight?: boolean;               // Highlight between pointers
  windowColor?: string;
  cellSize?: number;
}

// ============================================
// SECTION HEADER
// ============================================
export interface SectionHeaderProps extends DataDisplayBaseProps {
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  variant?: 'gradient' | 'underline' | 'boxed';
  alignment?: 'left' | 'center' | 'right';
}

// ============================================
// PROS CONS GRID
// ============================================
export interface ProsConsItem {
  text: string;
  icon?: string;
}

export interface ProsConsGridProps extends DataDisplayBaseProps {
  title?: string;
  pros: ProsConsItem[];
  cons: ProsConsItem[];
  prosTitle?: string;                      // Default: "Pros"
  consTitle?: string;                      // Default: "Cons"
  prosColor?: string;
  consColor?: string;
}

// ============================================
// TIP BOX
// ============================================
export interface TipBoxProps extends DataDisplayBaseProps {
  title?: string;                          // Default: "Pro Tip"
  text: string;
  icon?: string;                           // Default: lightbulb
  variant?: 'tip' | 'note' | 'warning' | 'info';
}

// ============================================
// PHASE 2: ADVANCED VISUALIZATION
// ============================================

// ============================================
// RADAR CHART
// ============================================
export interface RadarAxis {
  label: string;
  maxValue?: number;
}

export interface RadarDataset {
  label: string;
  values: number[];
  color: string;
  fillOpacity?: number;
}

export interface RadarChartProps extends DataDisplayBaseProps {
  title?: string;
  axes: RadarAxis[];
  datasets: RadarDataset[];
  showLabels?: boolean;
  showGrid?: boolean;
  gridLevels?: number;
}

// ============================================
// SWIMLANE DIAGRAM
// ============================================
export interface SwimlaneLane {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface SwimlaneNode {
  id: string;
  laneId: string;
  label: string;
  icon?: string;
  x: number;  // Position within lane (0-100)
}

export interface SwimlaneConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SwimlaneDiagramProps extends DataDisplayBaseProps {
  title?: string;
  lanes: SwimlaneLane[];
  nodes: SwimlaneNode[];
  connections: SwimlaneConnection[];
}

// ============================================
// MIND MAP
// ============================================
export interface MindMapNode {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  children?: MindMapNode[];
}

export interface MindMapProps extends DataDisplayBaseProps {
  title?: string;
  root: MindMapNode;
  layout?: 'radial' | 'tree';
}

// ============================================
// DECISION TREE
// ============================================
export interface DecisionNode {
  id: string;
  label: string;
  type: 'question' | 'answer';
  color?: string;
  icon?: string;
  yes?: DecisionNode;
  no?: DecisionNode;
}

export interface DecisionTreeProps extends DataDisplayBaseProps {
  title?: string;
  root: DecisionNode;
  yesLabel?: string;
  noLabel?: string;
}

// ============================================
// GRAPH VISUALIZER
// ============================================
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  icon?: string;
  highlighted?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  highlighted?: boolean;
  color?: string;
}

export interface GraphVisualizerProps extends DataDisplayBaseProps {
  title?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  showWeights?: boolean;
  highlightPath?: string[];
}

// ============================================
// TREE VISUALIZER (Binary Tree)
// ============================================
export interface BinaryTreeNode {
  value: number | string;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
  highlighted?: boolean;
  color?: string;
}

export interface TreeVisualizerProps extends DataDisplayBaseProps {
  title?: string;
  root: BinaryTreeNode;
  highlightNodes?: (number | string)[];
  nodeSize?: number;
}

// ============================================
// RECURSION STACK
// ============================================
export interface StackFrame {
  functionName: string;
  args?: string;
  returnValue?: string;
  status?: 'active' | 'waiting' | 'returned';
  color?: string;
}

export interface RecursionStackProps extends DataDisplayBaseProps {
  title?: string;
  frames: StackFrame[];
  maxVisibleFrames?: number;
}

// ============================================
// PROGRESSIVE DISCLOSURE
// ============================================
export interface ProgressiveDisclosureProps extends DataDisplayBaseProps {
  title?: string;
  content: React.ReactNode;
  blurAmount?: number;
  revealProgress?: number;  // 0-1 for manual control, or auto-animate
}

// ============================================
// BEFORE AFTER TOGGLE
// ============================================
export interface BeforeAfterToggleProps extends DataDisplayBaseProps {
  title?: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
  splitPosition?: number;  // 0-100, default 50
  orientation?: 'horizontal' | 'vertical';
}

// ============================================
// SUMMARY RECAP
// ============================================
export interface RecapItem {
  icon?: string;
  title: string;
  description?: string;
  color?: string;
}

export interface SummaryRecapProps extends DataDisplayBaseProps {
  title?: string;
  items: RecapItem[];
  variant?: 'cards' | 'list' | 'numbered';
}

// ============================================
// PHASE 3: SPECIALTY & POLISH
// ============================================

// ============================================
// PIPELINE CONVEYOR
// ============================================
export interface PipelineStage {
  label: string;
  icon?: string;
  color?: string;
  status?: 'pending' | 'active' | 'completed';
}

export interface PipelineConveyorProps extends DataDisplayBaseProps {
  title?: string;
  stages: PipelineStage[];
  showPackets?: boolean;
  packetColor?: string;
}

// ============================================
// CIRCULAR FLOW
// ============================================
export interface CircularFlowNode {
  label: string;
  icon?: string;
  color?: string;
}

export interface CircularFlowProps extends DataDisplayBaseProps {
  title?: string;
  nodes: CircularFlowNode[];
  centerLabel?: string;
  centerIcon?: string;
  showArrows?: boolean;
}

// ============================================
// STATE TRANSITION
// ============================================
export interface StateNode {
  id: string;
  label: string;
  color?: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface StateTransitionEdge {
  from: string;
  to: string;
  label?: string;
}

export interface StateTransitionProps extends DataDisplayBaseProps {
  title?: string;
  states: StateNode[];
  transitions: StateTransitionEdge[];
  currentState?: string;
}

// ============================================
// MODULE VIEW
// ============================================
export interface ModuleItem {
  name: string;
  type: 'folder' | 'file' | 'module';
  icon?: string;
  color?: string;
  children?: ModuleItem[];
}

export interface ModuleViewProps extends DataDisplayBaseProps {
  title?: string;
  root: ModuleItem;
  expandedPaths?: string[];
}

// ============================================
// WARNING CARD
// ============================================
export interface WarningCardProps extends DataDisplayBaseProps {
  title?: string;
  message: string;
  severity?: 'warning' | 'error' | 'critical';
  icon?: string;
  shake?: boolean;
}

// ============================================
// BEST PRACTICE STAMP
// ============================================
export interface BestPracticeStampProps extends DataDisplayBaseProps {
  label?: string;
  variant?: 'approved' | 'recommended' | 'certified';
  size?: 'small' | 'medium' | 'large';
}

// ============================================
// MENTAL MODEL CARD
// ============================================
export interface MentalModelCardProps extends DataDisplayBaseProps {
  title: string;
  analogy: string;
  explanation: string;
  icon?: string;
  accentColor?: string;
}

// ============================================
// GRID VISUALIZER
// ============================================
export interface GridCell {
  row: number;
  col: number;
  value?: string | number;
  color?: string;
  highlighted?: boolean;
}

export interface GridVisualizerProps extends DataDisplayBaseProps {
  title?: string;
  rows: number;
  cols: number;
  cells?: GridCell[];
  highlightCells?: { row: number; col: number }[];
  showCoordinates?: boolean;
  cellSize?: number;
}

// ============================================
// ZOOM DRILLDOWN
// ============================================
export interface ZoomLevel {
  label: string;
  content: React.ReactNode;
}

export interface ZoomDrilldownProps extends DataDisplayBaseProps {
  title?: string;
  levels: ZoomLevel[];
  currentLevel?: number;
}

// ============================================
// AGENDA / ROADMAP
// ============================================
export interface AgendaItem {
  label: string;
  icon?: string;
  completed?: boolean;
  active?: boolean;
}

export interface AgendaProps extends DataDisplayBaseProps {
  title?: string;
  items: AgendaItem[];
  orientation?: 'horizontal' | 'vertical';
  showProgress?: boolean;
}

// ============================================
// INTRO FRAME
// ============================================
export interface IntroFrameProps extends DataDisplayBaseProps {
  logo?: string;
  title: string;
  tagline?: string;
  accentColor?: string;
  variant?: 'minimal' | 'dramatic' | 'tech';
}

// ============================================
// SPLIT COMPARISON
// ============================================
export interface SplitComparisonItem {
  icon?: string;
  text: string;
  description?: string;
}

export interface SplitComparisonProps extends DataDisplayBaseProps {
  title?: string;
  leftLabel: string;
  rightLabel: string;
  leftItems: SplitComparisonItem[];  // Structured data for LLM
  rightItems: SplitComparisonItem[]; // Structured data for LLM
  leftColor?: string;
  rightColor?: string;
  dividerPosition?: number;  // 0-100
}
