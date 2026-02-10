// ============================================
// IDE CODE SCENE - LASER POINTER COMPONENT
// ============================================

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { LaserPointerProps } from './types';

export const LaserPointer: React.FC<LaserPointerProps> = ({
  position,
  color,
  visible,
}) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 32,
        height: 32,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        transition: 'left 0.5s ease-out, top 0.5s ease-out',
        zIndex: 100,
      }}
    >
      {/* Main laser dot with glow */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, ${color}88 50%, transparent 70%)`,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
          transform: `scale(${1 + Math.sin(frame * 0.15) * 0.3})`,
        }}
      />

      {/* Expanding ring effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 1 - ((frame % 45) / 45),
          transform: `scale(${1 + ((frame % 45) / 45) * 1.5})`,
        }}
      />

      {/* Secondary expanding ring (staggered) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px solid ${color}`,
          opacity: 1 - (((frame + 22) % 45) / 45),
          transform: `scale(${1 + (((frame + 22) % 45) / 45) * 1.5})`,
        }}
      />
    </div>
  );
};

export default LaserPointer;
