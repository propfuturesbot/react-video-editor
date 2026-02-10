// ============================================
// SCRIPT TO VIDEO - TYPE DEFINITIONS
// ============================================

// Theme colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  cardBg: string;
  text: string;
  textMuted: string;
  code: {
    keyword: string;
    string: string;
    number: string;
    function: string;
    comment: string;
    property: string;
    bracket: string;
  };
}

// Video configuration
export interface VideoConfig {
  fps: number;
  width: number;
  height: number;
  durationInSeconds: number;
}

// Caption/subtitle
export interface Caption {
  startFrame: number;
  endFrame: number;
  text: string;
  highlight?: string[];
}

// Instructor/character bubble
export interface InstructorLine {
  startFrame: number;
  endFrame: number;
  text: string;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'excited';
}

// Scene types
export type SceneType =
  | 'intro'
  | 'branding'
  | 'content'
  | 'code'
  | 'ide-code'
  | 'diagram'
  | 'flow'
  | 'sequence'
  | 'state'
  | 'architecture'
  | 'cluster-architecture'
  | 'network'
  | 'radial'
  | 'comparison'
  | 'timeline'
  | 'summary'
  | 'flowchart'
  | 'image'
  | 'outro';

// ============================================
// PROFESSIONAL DIAGRAM TYPES
// ============================================

// Positioned component for diagrams (percentage-based positioning)
export interface DiagramComponent {
  id: string;
  label: string;
  icon?: string;
  position: { x: number; y: number };  // Percentage (0-100)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  sublabel?: string;
  highlight?: boolean;
}

// Cluster/zone containing components
export interface DiagramCluster {
  id: string;
  label: string;
  labelIcon?: string;
  position: { x: number; y: number };  // Percentage (0-100)
  size: { width: number; height: number };  // Percentage
  color?: string;
  variant?: 'glass' | 'outline' | 'dashed';
}

// Enhanced connection with label support
export interface LabeledConnection {
  id?: string;
  from: string;
  to: string;
  label?: string;
  labelPosition?: 'start' | 'middle' | 'end';
  type?: 'solid' | 'dashed' | 'dotted';
  bidirectional?: boolean;
  animated?: boolean;
  color?: string;
  curved?: boolean;
}

// Radial item for center-spoke diagrams
export interface RadialItem {
  label: string;
  icon?: string;
  description?: string;
  color?: string;
}

// Center label for radial diagrams
export interface RadialCenterLabel {
  label: string;
  icon?: string;
  color?: string;
}

// Base scene
export interface BaseScene {
  id: string;
  type: SceneType;
  startFrame: number;
  endFrame: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  narration?: string;
}

// Intro scene
export interface IntroScene extends BaseScene {
  type: 'intro';
  mainTitle: string;
  subtitle: string;
  icons?: string[];
}

// Content scene with cards/points
export interface ContentScene extends BaseScene {
  type: 'content';
  cards: ContentCard[];
  layout?: 'grid' | 'list' | 'side-by-side';
}

export interface ContentCard {
  icon?: string;
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  delay?: number;
}

// Code scene
export interface CodeScene extends BaseScene {
  type: 'code';
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'bash';
  code: string;
  filename?: string;
  highlightLines?: number[];
  output?: CodeOutput[];
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';
}

export interface CodeOutput {
  text: string;
  delay: number;
  type?: 'normal' | 'success' | 'error';
}

// IDE Code annotation for laser pointer highlights
export interface IDECodeAnnotation {
  line: number;           // Line to highlight (1-indexed)
  keyword?: string;       // Optional keyword to point at
  title: string;          // e.g., "VOLATILE KEYWORD"
  description: string;    // Explanation text
  color: string;          // e.g., "#FF6B6B"
}

// IDE Code scene with typewriter effect, zoom, laser pointer, and annotations
export interface IDECodeScene extends BaseScene {
  type: 'ide-code';
  code: string;
  language: 'java' | 'python' | 'javascript' | 'typescript' | 'go';
  filename: string;
  showIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  annotations?: IDECodeAnnotation[];
  visibleLines?: number;    // Default: 18
  fontSize?: number;        // Default: 18px (larger for video readability)
  showLineNumbers?: boolean; // Default: true
}

// Diagram/flow scene
export interface DiagramScene extends BaseScene {
  type: 'diagram';
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  animationStyle?: 'sequential' | 'simultaneous';
}

export interface DiagramNode {
  id: string;
  label: string;
  icon?: string;
  x: number;
  y: number;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  description?: string;
  delay?: number;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  delay?: number;
}

// Comparison scene
export interface ComparisonScene extends BaseScene {
  type: 'comparison';
  leftTitle: string;
  rightTitle: string;
  leftItems: ComparisonItem[];
  rightItems: ComparisonItem[];
  leftVariant?: 'error' | 'default';
  rightVariant?: 'success' | 'default';
}

export interface ComparisonItem {
  label: string;
  value: string;
  highlight?: boolean;
}

// Summary scene
export interface SummaryScene extends BaseScene {
  type: 'summary';
  points: SummaryPoint[];
  callToAction?: {
    title: string;
    description: string;
  };
}

export interface SummaryPoint {
  number: number;
  title: string;
  description: string;
  delay?: number;
}

// Image scene - displays user-uploaded images with optional animations
export interface ImageScene extends BaseScene {
  type: 'image';
  imageUrl: string;
  caption?: string;
  captionPosition?: 'bottom' | 'overlay' | 'none';
  layout?: 'full' | 'centered' | 'left-with-text' | 'right-with-text';
  zoomAnimation?: {
    enabled: boolean;
    startScale?: number;
    endScale?: number;
  };
  textOverlay?: string;
  order?: number;  // User-specified order (1 = first, 2 = second, etc.)
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';
}

// Branding scene - full-screen branding intro with animated title
export interface BrandingScene extends BaseScene {
  type: 'branding';
  imageUrl: string;
  title: string;
  subtitle?: string;
  animation?: {
    imageZoom?: {
      enabled: boolean;
      startScale?: number;
      endScale?: number;
    };
    titleFade?: boolean;
    particleOverlay?: boolean;
    glowEffect?: boolean;
  };
}

// Flow step for FlowScene
export interface FlowStep {
  icon: string;
  label: string;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

// Supporting card for composite layouts (code + context, image + explanation)
export interface SupportingCard {
  icon?: string;
  title: string;
  description: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

// Union type for all scenes
export type Scene =
  | IntroScene
  | BrandingScene
  | ContentScene
  | CodeScene
  | IDECodeScene
  | DiagramScene
  | ComparisonScene
  | SummaryScene
  | ImageScene;

// Background configuration for video
export interface BackgroundConfig {
  type: 'gradient' | 'solid' | 'image' | 'video';
  color?: string;
  gradientVariant?: 'default' | 'grid' | 'tron' | 'custom';
  customGradient?: {
    backgroundColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;
    gridSize?: number;
    gridThickness?: number;
    showScanLine?: boolean;
    orbIntensity?: number;
  };
  imageUrl?: string;
  videoUrl?: string;
  opacity?: number;
}

// Complete video script
export interface VideoScript {
  config: VideoConfig;
  theme?: Partial<ThemeColors>;
  scenes: Scene[];
  captions: Caption[];
  captionConfig?: CaptionConfig;  // Controls caption rendering (burnt-in vs external)
  audioTracks?: AudioTrack[];
  background?: BackgroundConfig;
  instructor?: {
    enabled: boolean;
    avatar?: string;
    lines: InstructorLine[];
  };
}

// Animation timing helpers
export interface AnimationTiming {
  fadeIn: number;
  fadeOut: number;
  stagger: number;
  spring: {
    damping: number;
    mass: number;
    stiffness: number;
  };
}

// Audio track for voice narration
export interface AudioTrack {
  sceneId: string;
  audioUrl: string;
  startFrame: number;
  durationFrames: number;
}

// Narration configuration
export interface NarrationConfig {
  enabled: boolean;
  voiceId?: string;
}

// Caption configuration for video rendering
export interface CaptionConfig {
  enabled: boolean;         // Master on/off for caption functionality
  burnIn: boolean;          // Whether to render captions directly into the video
  exportSrt: boolean;       // Whether to generate a separate SRT subtitle file
  style?: 'bottom' | 'floating' | 'karaoke';  // Caption display style
}

// Component props
export interface SceneProps {
  scene: Scene;
  frame: number;
}

export interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'spring';
}

// =============================================================================
// Template System Types (Clean Template-Based Rendering)
// =============================================================================

export type TemplateSceneType =
  | "intro"
  | "content"
  | "code"
  | "ide-code"
  | "flow"
  | "sequence"
  | "state"
  | "architecture"
  | "cluster-architecture"
  | "network"
  | "radial"
  | "comparison"
  | "timeline"
  | "summary"
  | "flowchart"
  | "classdiagram"
  | "domain-diagram"
  | "data-display"
  | "image"
  | "branding";

export type DomainType =
  | "system-design"
  | "biology"
  | "chemistry"
  | "physics"
  | "business"
  | "general";

export interface DomainDiagramComponent {
  id: string;
  component: string;
  x: number;
  y: number;
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  props?: Record<string, any>;
}

export interface DomainDiagramConnection {
  id?: string;
  from: string;
  to: string;
  label?: string;
  labelPosition?: "start" | "middle" | "end";
  type?: "solid" | "dashed" | "dotted";
  animated?: boolean;
  bidirectional?: boolean;
  color?: string;
  curved?: boolean;
}

export interface DomainDiagramCluster {
  id: string;
  label: string;
  labelIcon?: string;
  componentIds: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  variant?: "dashed" | "solid" | "glass";
}

export interface TemplateVideoConfig {
  fps: number;
  width: number;
  height: number;
  durationInSeconds: number;
  totalFrames?: number;
}

export interface TemplateCaption {
  startFrame: number;
  endFrame: number;
  text: string;
  highlight?: string[];
}

export interface TemplateInstructorLine {
  startFrame: number;
  endFrame: number;
  text: string;
  emotion?: "neutral" | "happy" | "thinking" | "excited";
}

export interface TemplateInstructor {
  enabled: boolean;
  avatar?: string;
  lines: TemplateInstructorLine[];
}

export interface TemplateContentCard {
  icon?: string;
  title: string;
  description: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export interface TemplateFlowStep {
  icon: string;
  label: string;
  description?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export interface TemplateCodeOutput {
  text: string;
  type?: "normal" | "success" | "error";
  delay: number;
}

export interface TemplateCallToAction {
  title: string;
  description: string;
}

export interface TemplateScene {
  id: string;
  type: TemplateSceneType;
  phaseNumber?: number;
  isVisualSupplement?: boolean;
  startFrame: number;
  endFrame: number;
  title?: string;
  subtitle?: string;
  badge?: string;

  // Intro scene
  mainTitle?: string;
  icons?: string[];
  highlightedWord?: string;

  // Content scene
  cards?: TemplateContentCard[];
  layout?: "grid" | "list";

  // Code scene
  code?: string;
  language?: "python" | "javascript" | "typescript" | "json" | "bash" | "java" | "go";
  filename?: string;
  output?: TemplateCodeOutput[];
  highlightLines?: number[];

  // IDE Code scene
  showIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  visibleLines?: number;
  fontSize?: number;
  showLineNumbers?: boolean;

  // Flow scene
  steps?: TemplateFlowStep[];
  explanationCards?: TemplateContentCard[];

  // Summary scene
  points?: TemplateContentCard[];
  callToAction?: TemplateCallToAction;

  // Network diagram fields
  nodes?: Array<{
    id: string;
    label: string;
    icon?: string;
    position: { x: number; y: number };
    size?: string;
    color?: string;
    sublabel?: string;
  }>;
  connections?: Array<{
    id?: string;
    from: string;
    to: string;
    label?: string;
    labelPosition?: string;
    type?: string;
    bidirectional?: boolean;
    animated?: boolean;
    color?: string;
    curved?: boolean;
  }>;

  // Cluster architecture fields
  clusters?: Array<{
    id: string;
    label: string;
    labelIcon?: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    color?: string;
    variant?: string;
  }>;
  components?: Array<{
    id: string;
    label: string;
    icon?: string;
    position: { x: number; y: number };
    size?: string;
    color?: string;
    sublabel?: string;
  }>;

  // Radial diagram fields
  centerLabel?: {
    label: string;
    icon?: string;
    color?: string;
  };
  items?: Array<{
    label: string;
    icon?: string;
    description?: string;
    color?: string;
  }>;

  // Sequence diagram fields
  entities?: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  messages?: Array<{
    from: string;
    to: string;
    label: string;
    type?: string;
  }>;

  // State diagram fields
  states?: Array<{
    id: string;
    label: string;
    icon?: string;
    isInitial?: boolean;
    isFinal?: boolean;
  }>;
  transitions?: Array<{
    from: string;
    to: string;
    label: string;
  }>;

  // Timeline fields
  events?: Array<{
    label: string;
    description: string;
    icon?: string;
  }>;

  // Comparison fields
  columns?: Array<{
    header: string;
    items: string[];
  }>;
  highlightColumn?: number;

  // Flowchart (mermaid) fields
  mermaidCode?: string;

  // Image scene fields
  imageUrl?: string;
  caption?: string;
  captionPosition?: string;
  zoomAnimation?: {
    enabled: boolean;
    startScale?: number;
    endScale?: number;
  };
  textOverlay?: string;
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';

  // Branding scene fields
  animation?: {
    imageZoom?: {
      enabled: boolean;
      startScale?: number;
      endScale?: number;
    };
    titleFade?: boolean;
    particleOverlay?: boolean;
    glowEffect?: boolean;
  } | Record<string, unknown>;

  // Domain diagram fields
  domain?: DomainType;
  domainComponents?: DomainDiagramComponent[];
  domainConnections?: DomainDiagramConnection[];
  domainClusters?: DomainDiagramCluster[];

  // Data display fields
  dataDisplayType?: string;
  dataDisplayProps?: Record<string, any>;
  data_display_type?: string;
  data_display_props?: Record<string, any>;

  // Styling fields
  narration?: string;
  backgroundEffects?: string[];
  background_effects?: string[];
  cameraAnimation?: {
    type: "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "focus_pull";
    startScale?: number;
    endScale?: number;
    start_scale?: number;
    end_scale?: number;
    distance?: number;
    durationFrames?: number;
    duration_frames?: number;
  };
  camera_animation?: {
    type: "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "focus_pull";
    startScale?: number;
    endScale?: number;
    start_scale?: number;
    end_scale?: number;
    distance?: number;
    durationFrames?: number;
    duration_frames?: number;
  };
  emotionalEffect?: string;
  emotional_effect?: string;
  annotations?: string[];
}

export interface TemplateVideoScript {
  config: TemplateVideoConfig;
  theme?: Record<string, any>;
  scenes: TemplateScene[];
  captions: TemplateCaption[];
  captionConfig?: CaptionConfig;
  instructor?: TemplateInstructor;
  background?: {
    type: 'gradient' | 'solid' | 'image' | 'video';
    color?: string;
    gradientVariant?: 'default' | 'grid' | 'tron' | 'custom';
    customGradient?: {
      backgroundColor?: string;
      primaryColor?: string;
      secondaryColor?: string;
      showGrid?: boolean;
      gridColor?: string;
      gridOpacity?: number;
      gridSize?: number;
      gridThickness?: number;
      showScanLine?: boolean;
      orbIntensity?: number;
    };
    imageUrl?: string;
    videoUrl?: string;
    opacity?: number;
  };
  audioTracks?: Array<{
    sceneId: string;
    audioUrl: string;
    startFrame: number;
    durationFrames: number;
  }>;
}
