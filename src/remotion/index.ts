// Main video component
export { TemplateVideo, DefaultTemplateVideo } from './TemplateVideo';

// Claude JSON video component (separate code path for pasted Claude output)
export { ClaudeJsonVideo } from './ClaudeJsonVideo';

// Types - export with explicit names to avoid conflicts with components
// Types that conflict with component names are aliased with "Data" suffix
export type {
  ThemeColors,
  VideoConfig,
  Caption as CaptionData,
  InstructorLine,
  SceneType,
  BaseScene,
  IntroScene as IntroSceneData,
  ContentScene as ContentSceneData,
  ContentCard as ContentCardData,
  CodeScene as CodeSceneData,
  CodeOutput as CodeOutputData,
  DiagramScene as DiagramSceneData,
  DiagramNode,
  DiagramConnection,
  ComparisonScene as ComparisonSceneData,
  ComparisonItem,
  SummaryScene as SummarySceneData,
  SummaryPoint,
  FlowStep,
  Scene,
  VideoScript,
  AnimationTiming,
  SceneProps,
  AnimatedElementProps,
} from './types';

// Components - these are the React components for rendering
export {
  // Animation
  AnimatedElement,
  StaggeredList,
} from './components/AnimatedElement';

export {
  // Background
  Background,
  SceneContainer,
} from './components/Background';

export {
  // Cards
  GlowBox,
  ContentCard,
  FeatureCard,
  Badge,
} from './components/Cards';

export {
  // Code display
  CodeBlock,
  CodeOutput,
} from './components/CodeBlock';

export {
  // Flow diagrams
  FlowDiagram,
  HorizontalFlow,
  VerticalSteps,
} from './components/FlowDiagram';

export {
  // Character and captions
  Instructor,
  Caption,
  ProgressIndicator,
} from './components/Instructor';

export {
  // Typography
  Title,
  Subtitle,
  SceneTitle,
  Highlight,
} from './components/Typography';

export {
  // Scene templates
  IntroScene,
  ContentScene,
  CodeScene,
  FlowScene,
  SummaryScene,
  // New diagram scene types
  SequenceScene,
  StateScene,
  ArchitectureScene,
  ComparisonScene,
  TimelineScene,
} from './components/SceneTemplates';

// Utils
export * from './utils';

// Styles
export { defaultTheme, pythonTheme, jsonTheme, tronTheme } from './styles/theme';
export { hexToRgb, getGlow, getNeonText, interpolateColor } from './styles/theme';
