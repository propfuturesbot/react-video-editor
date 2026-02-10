import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { animateIn } from '../utils/animations';

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  type?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'spring';
  style?: React.CSSProperties;
  className?: string;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  delay = 0,
  duration = 20,
  type = 'fade',
  style = {},
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = animateIn({
    frame,
    fps,
    start: delay,
    type,
    duration,
  });

  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: animation.opacity,
        transform: animation.transform,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// FADE VARIANTS
// ============================================

interface FadeProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeProps> = (props) => (
  <AnimatedElement {...props} type="fade" />
);

export const SlideUp: React.FC<FadeProps> = (props) => (
  <AnimatedElement {...props} type="slide-up" />
);

export const SlideLeft: React.FC<FadeProps> = (props) => (
  <AnimatedElement {...props} type="slide-left" />
);

export const ScaleIn: React.FC<FadeProps> = (props) => (
  <AnimatedElement {...props} type="scale" />
);

export const SpringIn: React.FC<FadeProps> = (props) => (
  <AnimatedElement {...props} type="spring" />
);

// ============================================
// STAGGERED LIST
// ============================================

interface StaggeredListProps {
  children: React.ReactNode[];
  baseDelay?: number;
  stagger?: number;
  type?: 'fade' | 'slide-up' | 'slide-left' | 'scale' | 'spring';
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  baseDelay = 0,
  stagger = 8,
  type = 'slide-up',
  style = {},
  itemStyle = {},
}) => {
  return (
    <div style={style}>
      {React.Children.map(children, (child, index) => {
        // Use child's key if available, otherwise fall back to index
        const key = React.isValidElement(child) && child.key != null
          ? child.key
          : `stagger-${index}`;
        return (
          <AnimatedElement
            key={key}
            delay={baseDelay + index * stagger}
            type={type}
            style={itemStyle}
          >
            {child}
          </AnimatedElement>
        );
      })}
    </div>
  );
};
