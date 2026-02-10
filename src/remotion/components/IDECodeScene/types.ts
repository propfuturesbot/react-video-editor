// ============================================
// IDE CODE SCENE - INTERNAL TYPES
// ============================================

import type { ReactNode } from 'react';
import { IDECodeAnnotation } from '../../types';

// Re-export the annotation type for internal use
export type { IDECodeAnnotation };

// Supported programming languages
export type SupportedLanguage = 'java' | 'python' | 'javascript' | 'typescript' | 'go';

// Internal annotation with computed position
export interface PositionedAnnotation extends IDECodeAnnotation {
  position: { x: number; y: number };
}

// IDE Window props (simplified - annotation panel moved outside)
export interface IDEWindowProps {
  code: string;
  language: SupportedLanguage;
  filename: string;
  typedCharCount: number;
  scrollY: number;
  visibleLines: number;
  fontSize: number;
  showLineNumbers: boolean;
  // Laser pointer props (rendered inside code area)
  laserPosition: { x: number; y: number };
  showLaser: boolean;
  highlightLine?: number;
  highlightColor?: string;
}

// Typewriter code props
export interface TypewriterCodeProps {
  code: string;
  language: SupportedLanguage;
  typedCharCount: number;
  highlightLine?: number;
  highlightColor?: string;
  fontSize: number;
}

// Laser pointer props
export interface LaserPointerProps {
  position: { x: number; y: number };
  color: string;
  visible: boolean;
}

// Annotation panel props (external positioning - no laserY needed)
export interface AnnotationPanelProps {
  annotation: PositionedAnnotation | null;
  visible: boolean;
}

// Code scroll container props
export interface CodeScrollContainerProps {
  children: ReactNode;
  scrollY: number;
  maxHeight: number;
}

// Intro screen props
export interface IntroScreenProps {
  title: string;
  subtitle?: string;
  progress: number;
}

// Main IDECodeScene props
export interface IDECodeSceneProps {
  code: string;
  language: SupportedLanguage;
  filename: string;
  showIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  annotations?: IDECodeAnnotation[];
  visibleLines?: number;
  fontSize?: number;
  showLineNumbers?: boolean;
}

// Animation state
export interface AnimationState {
  phase: 'intro' | 'zoom' | 'typing' | 'annotating';
  introProgress: number;
  zoomScale: number;
  ideOpacity: number;
  typedCharCount: number;
  currentAnnotationIndex: number;
  showAnnotation: boolean;
  scrollY: number;
}

// Computed laser position for an annotation
export interface ComputedLaserPosition {
  x: number;
  y: number;
}
