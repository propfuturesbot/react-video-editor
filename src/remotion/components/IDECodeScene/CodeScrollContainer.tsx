// ============================================
// IDE CODE SCENE - CODE SCROLL CONTAINER
// ============================================

import React from 'react';
import { CodeScrollContainerProps } from './types';

export const CodeScrollContainer: React.FC<CodeScrollContainerProps> = ({
  children,
  scrollY,
  maxHeight,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        height: maxHeight,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${-scrollY}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CodeScrollContainer;
