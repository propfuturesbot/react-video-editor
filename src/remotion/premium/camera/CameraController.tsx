/**
 * Camera Controller stub
 * Simplified version for browser preview - passes through children without camera effects
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';

interface CameraControllerProps {
  children: React.ReactNode;
  config?: {
    type?: string;
    startScale?: number;
    endScale?: number;
  };
}

export const CameraController: React.FC<CameraControllerProps> = ({ children }) => {
  // In browser preview, we just render children without camera effects
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

// Stub hook for camera state
export const useCameraState = (_keyframes?: any[], _duration?: number) => {
  return {
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
    isAnimating: false,
  };
};

export default CameraController;
