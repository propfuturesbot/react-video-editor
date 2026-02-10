/**
 * Premium types stub
 * These are placeholder types for premium features not used in browser preview
 */

export interface CameraConfig {
  type: 'zoom_in' | 'zoom_out' | 'pan' | 'static';
  startScale?: number;
  endScale?: number;
  duration?: number;
}

export interface CameraPosition {
  x: number;
  y: number;
  scale: number;
}

export type CameraAnimationType = 'zoom_in' | 'zoom_out' | 'pan' | 'focus' | 'static';

export interface CameraKeyframe {
  frame: number;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  easing?: string;
}
