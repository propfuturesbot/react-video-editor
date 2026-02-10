// @ts-nocheck
/**
 * Stack Component
 *
 * Visualizes a stack data structure with LIFO (Last In, First Out) behavior.
 * Supports push/pop animations, top pointer indication, and animation steps.
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { StackAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, useStepAnnotation } from '../hooks';

interface StackItem {
  value: string | number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface StackProps extends DSAStepsProps<StackAnimationStep> {
  items: StackItem[];
  title?: string;
  maxVisible?: number;
  showCapacity?: boolean;
  capacity?: number;
  operation?: 'push' | 'pop' | 'peek' | 'none';
  operationItem?: StackItem;
  highlightTop?: boolean;
  showTopPointer?: boolean;
  orientation?: 'vertical' | 'horizontal';
  itemWidth?: number;
  itemHeight?: number;
  showIndices?: boolean;
  animationDelay?: number;
}

export const Stack: React.FC<StackProps> = ({
  items: staticItems,
  title = 'Stack',
  maxVisible = 8,
  showCapacity = false,
  capacity = 10,
  operation: staticOperation = 'none',
  operationItem: staticOperationItem,
  highlightTop: staticHighlightTop = true,
  showTopPointer = true,
  orientation = 'vertical',
  itemWidth = 120,
  itemHeight = 45,
  showIndices = false,
  animationDelay = 0,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: StackAnimationStep = useMemo(() => ({
    items: staticItems.map(i => i.value),
    operation: staticOperation,
    operationItem: staticOperationItem?.value,
    highlightTop: staticHighlightTop,
  }), [staticItems, staticOperation, staticOperationItem, staticHighlightTop]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const items: StackItem[] = useMemo(() => {
    if (animationSteps && currentState.items) {
      return currentState.items.map(v => ({ value: v }));
    }
    return staticItems;
  }, [animationSteps, currentState.items, staticItems]);

  const operation = currentState.operation ?? staticOperation;
  const operationItem = currentState.operationItem !== undefined
    ? { value: currentState.operationItem }
    : staticOperationItem;
  const highlightTop = currentState.highlightTop ?? staticHighlightTop;
  const highlightIndices = currentState.highlightIndices ?? [];

  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Animation for push/pop - use step progress when in animation steps mode
  const operationProgress = animationSteps
    ? stepProgress
    : spring({
        frame: animatedFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      });

  // Visible items (show from bottom)
  const visibleItems = items.slice(-maxVisible);
  const hiddenCount = Math.max(0, items.length - maxVisible);

  // Calculate container dimensions
  const containerWidth =
    orientation === 'vertical' ? itemWidth + 40 : maxVisible * (itemWidth + 10) + 40;
  const containerHeight =
    orientation === 'vertical' ? maxVisible * (itemHeight + 5) + 60 : itemHeight + 80;

  // Get item position
  const getItemPosition = (index: number, fromTop: boolean = false) => {
    const actualIndex = fromTop ? visibleItems.length - 1 - index : index;
    if (orientation === 'vertical') {
      // Stack grows upward, so first item at bottom
      return {
        x: 20,
        y: containerHeight - 40 - (actualIndex + 1) * (itemHeight + 5),
      };
    } else {
      return {
        x: 20 + actualIndex * (itemWidth + 10),
        y: 30,
      };
    }
  };

  // Render a single stack item
  const renderItem = (item: StackItem, index: number) => {
    const isTop = index === visibleItems.length - 1;
    const isHighlighted = highlightIndices.includes(index);
    const pos = getItemPosition(index);

    // Push animation for new top item
    const itemProgress = spring({
      frame: animatedFrame - index * DSA_TIMING.stagger,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    // Highlight animation for top or highlighted items
    const shouldPulse = (isTop && highlightTop) || isHighlighted;
    const pulseScale = shouldPulse
      ? 1 + Math.sin((animatedFrame / fps) * Math.PI * 2) * 0.02
      : 1;

    // Determine background color
    const bgColor = isHighlighted
      ? DSA_COLORS.cell.current
      : isTop
        ? item.color || DSA_COLORS.pointer.primary
        : item.color || DSA_COLORS.cell.default;

    const borderColor = isHighlighted
      ? DSA_COLORS.cell.current
      : isTop
        ? DSA_COLORS.pointer.primary
        : DSA_COLORS.ui.border;

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: itemWidth,
          height: itemHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 6,
          transform: `scale(${itemProgress * pulseScale})`,
          opacity: itemProgress,
          boxShadow: (isTop || isHighlighted)
            ? `0 0 15px ${borderColor}40`
            : 'none',
        }}
      >
        {/* Value */}
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 600,
            color: isTop ? '#fff' : DSA_COLORS.ui.text,
          }}
        >
          {item.value}
        </span>

        {/* Label */}
        {item.label && (
          <span
            style={{
              position: 'absolute',
              left: -60,
              fontFamily: 'monospace',
              fontSize: 11,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            {item.label}
          </span>
        )}

        {/* Index */}
        {showIndices && (
          <span
            style={{
              position: 'absolute',
              right: -25,
              fontFamily: 'monospace',
              fontSize: 11,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            [{index}]
          </span>
        )}
      </div>
    );
  };

  // Render push animation item
  const renderPushItem = () => {
    if (operation !== 'push' || !operationItem) return null;

    const targetPos = getItemPosition(visibleItems.length);
    const startY = orientation === 'vertical' ? -50 : 30;
    const startX = orientation === 'vertical' ? 20 : containerWidth + 50;

    const currentY = interpolate(operationProgress, [0, 1], [startY, targetPos.y]);
    const currentX = interpolate(operationProgress, [0, 1], [startX, targetPos.x]);

    return (
      <div
        style={{
          position: 'absolute',
          left: currentX,
          top: currentY,
          width: itemWidth,
          height: itemHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DSA_COLORS.cell.success,
          border: `2px solid ${DSA_COLORS.cell.success}`,
          borderRadius: 6,
          opacity: operationProgress,
          boxShadow: `0 0 20px ${DSA_COLORS.cell.success}60`,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {operationItem.value}
        </span>
      </div>
    );
  };

  // Render pop animation item
  const renderPopItem = () => {
    if (operation !== 'pop' || visibleItems.length === 0) return null;

    const topItem = visibleItems[visibleItems.length - 1];
    const startPos = getItemPosition(visibleItems.length - 1);
    const endY = orientation === 'vertical' ? -50 : 30;
    const endX = orientation === 'vertical' ? 20 : containerWidth + 50;

    const currentY = interpolate(operationProgress, [0, 1], [startPos.y, endY]);
    const currentX = interpolate(operationProgress, [0, 1], [startPos.x, endX]);

    return (
      <div
        style={{
          position: 'absolute',
          left: currentX,
          top: currentY,
          width: itemWidth,
          height: itemHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DSA_COLORS.cell.error,
          border: `2px solid ${DSA_COLORS.cell.error}`,
          borderRadius: 6,
          opacity: 1 - operationProgress,
          boxShadow: `0 0 20px ${DSA_COLORS.cell.error}60`,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {topItem.value}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: containerProgress,
        transform: `translateY(${interpolate(containerProgress, [0, 1], [20, 0])}px)`,
      }}
    >
      {/* Title */}
      <div
        style={{
          marginBottom: 15,
          fontSize: 18,
          fontWeight: 600,
          color: DSA_COLORS.ui.text,
          fontFamily: 'monospace',
        }}
      >
        {title}
      </div>

      {/* Step Annotation */}
      {annotationText && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 16,
            color: DSA_COLORS.ui.text,
            padding: '8px 16px',
            background: DSA_COLORS.ui.cardBg,
            borderRadius: 8,
            opacity: annotationOpacity,
          }}
        >
          {annotationText}
        </div>
      )}

      {/* Operation indicator when using animation steps */}
      {operation && operation !== 'none' && (
        <div
          style={{
            marginBottom: 12,
            padding: '4px 12px',
            borderRadius: 4,
            backgroundColor: operation === 'push'
              ? DSA_COLORS.cell.success + '20'
              : operation === 'pop'
                ? DSA_COLORS.cell.error + '20'
                : DSA_COLORS.pointer.primary + '20',
            border: `1px solid ${
              operation === 'push'
                ? DSA_COLORS.cell.success
                : operation === 'pop'
                  ? DSA_COLORS.cell.error
                  : DSA_COLORS.pointer.primary
            }`,
            fontSize: 12,
            color: operation === 'push'
              ? DSA_COLORS.cell.success
              : operation === 'pop'
                ? DSA_COLORS.cell.error
                : DSA_COLORS.pointer.primary,
            fontFamily: 'monospace',
          }}
        >
          {operation.toUpperCase()}
          {operationItem && `: ${operationItem.value}`}
        </div>
      )}

      {/* Stack Container */}
      <div
        style={{
          position: 'relative',
          width: containerWidth,
          height: containerHeight,
          backgroundColor: DSA_COLORS.ui.cardBg,
          border: `2px solid ${DSA_COLORS.ui.border}`,
          borderRadius: 8,
          overflow: 'visible',
        }}
      >
        {/* Top pointer */}
        {showTopPointer && visibleItems.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: orientation === 'vertical' ? -50 : getItemPosition(visibleItems.length - 1).x + itemWidth / 2 - 20,
              top: orientation === 'vertical' ? getItemPosition(visibleItems.length - 1).y + itemHeight / 2 - 10 : -30,
              padding: '4px 10px',
              backgroundColor: DSA_COLORS.pointer.primary,
              color: '#fff',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            TOP
            {orientation === 'vertical' && (
              <span style={{ marginLeft: 5 }}>&#8594;</span>
            )}
            {orientation === 'horizontal' && (
              <span style={{ marginLeft: 5 }}>&#8595;</span>
            )}
          </div>
        )}

        {/* Hidden items indicator */}
        {hiddenCount > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 20,
              bottom: 10,
              fontSize: 11,
              color: DSA_COLORS.ui.textMuted,
              fontFamily: 'monospace',
            }}
          >
            ... +{hiddenCount} more items
          </div>
        )}

        {/* Stack items */}
        {visibleItems.map((item, index) => renderItem(item, index))}

        {/* Push/Pop animations */}
        {renderPushItem()}
        {renderPopItem()}

        {/* Empty stack message */}
        {items.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 14,
              color: DSA_COLORS.ui.textMuted,
              fontFamily: 'monospace',
            }}
          >
            Empty Stack
          </div>
        )}
      </div>

      {/* Capacity indicator */}
      {showCapacity && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: DSA_COLORS.ui.textMuted,
            fontFamily: 'monospace',
          }}
        >
          Size: {items.length} / {capacity}
        </div>
      )}

      {/* LIFO indicator */}
      <div
        style={{
          marginTop: 10,
          padding: '4px 12px',
          borderRadius: 4,
          backgroundColor: DSA_COLORS.ui.cardBg,
          border: `1px solid ${DSA_COLORS.ui.border}`,
          fontSize: 12,
          color: DSA_COLORS.ui.textMuted,
          fontFamily: 'monospace',
        }}
      >
        LIFO - Last In, First Out
      </div>
    </div>
  );
};

export default Stack;
