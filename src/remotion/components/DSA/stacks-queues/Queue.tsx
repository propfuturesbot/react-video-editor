// @ts-nocheck
/**
 * Queue Component
 *
 * Visualizes a queue data structure with FIFO (First In, First Out) behavior.
 * Supports enqueue/dequeue animations, front/rear pointer indication, and animation steps.
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { QueueAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, useStepAnnotation } from '../hooks';

interface QueueItem {
  value: string | number;
  label?: string;
  color?: string;
  priority?: number; // For priority queue
}

export interface QueueProps extends DSAStepsProps<QueueAnimationStep> {
  items: QueueItem[];
  title?: string;
  type?: 'fifo' | 'circular' | 'deque' | 'priority';
  maxVisible?: number;
  showCapacity?: boolean;
  capacity?: number;
  operation?: 'enqueue' | 'dequeue' | 'peek' | 'none';
  operationItem?: QueueItem;
  showFrontRear?: boolean;
  showIndices?: boolean;
  itemWidth?: number;
  itemHeight?: number;
  animationDelay?: number;
}

export const Queue: React.FC<QueueProps> = ({
  items: staticItems,
  title = 'Queue',
  type = 'fifo',
  maxVisible = 8,
  showCapacity = false,
  capacity = 10,
  operation: staticOperation = 'none',
  operationItem: staticOperationItem,
  showFrontRear = true,
  showIndices = false,
  itemWidth = 70,
  itemHeight = 50,
  animationDelay = 0,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: QueueAnimationStep = useMemo(() => ({
    items: staticItems.map(i => i.value),
    operation: staticOperation,
    operationItem: staticOperationItem?.value,
  }), [staticItems, staticOperation, staticOperationItem]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const items: QueueItem[] = useMemo(() => {
    if (animationSteps && currentState.items) {
      return currentState.items.map(v => ({ value: v }));
    }
    return staticItems;
  }, [animationSteps, currentState.items, staticItems]);

  const operation = currentState.operation ?? staticOperation;
  const operationItem = currentState.operationItem !== undefined
    ? { value: currentState.operationItem }
    : staticOperationItem;
  const highlightIndices = currentState.highlightIndices ?? [];
  const frontPointer = currentState.front;
  const rearPointer = currentState.rear;

  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Animation for operations - use step progress when in animation steps mode
  const operationProgress = animationSteps
    ? stepProgress
    : spring({
        frame: animatedFrame,
        fps,
        config: DSA_SPRINGS.bouncy,
      });

  // Visible items
  const visibleItems = items.slice(0, maxVisible);
  const hiddenCount = Math.max(0, items.length - maxVisible);

  // Container dimensions
  const containerWidth = maxVisible * (itemWidth + 8) + 40;
  const containerHeight = itemHeight + 100;

  // Get item position
  const getItemPosition = (index: number) => ({
    x: 20 + index * (itemWidth + 8),
    y: 45,
  });

  // Sort items for priority queue display
  const displayItems = type === 'priority'
    ? [...visibleItems].sort((a, b) => (b.priority || 0) - (a.priority || 0))
    : visibleItems;

  // Render a single queue item
  const renderItem = (item: QueueItem, index: number) => {
    const isFront = index === 0;
    const isRear = index === displayItems.length - 1;
    const pos = getItemPosition(index);

    const itemProgress = spring({
      frame: animatedFrame - index * DSA_TIMING.stagger,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    // Highlight animation for front
    const pulseScale = isFront
      ? 1 + Math.sin((animatedFrame / fps) * Math.PI * 2) * 0.02
      : 1;

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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isFront
            ? item.color || DSA_COLORS.cell.success
            : isRear
              ? item.color || DSA_COLORS.pointer.secondary
              : item.color || DSA_COLORS.cell.default,
          border: `2px solid ${
            isFront
              ? DSA_COLORS.cell.success
              : isRear
                ? DSA_COLORS.pointer.secondary
                : DSA_COLORS.ui.border
          }`,
          borderRadius: 6,
          transform: `scale(${itemProgress * pulseScale})`,
          opacity: itemProgress,
          boxShadow: isFront
            ? `0 0 15px ${DSA_COLORS.cell.success}40`
            : 'none',
        }}
      >
        {/* Value */}
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 600,
            color: isFront || isRear ? '#fff' : DSA_COLORS.ui.text,
          }}
        >
          {item.value}
        </span>

        {/* Priority badge for priority queue */}
        {type === 'priority' && item.priority !== undefined && (
          <span
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              padding: '2px 6px',
              borderRadius: '50%',
              backgroundColor: DSA_COLORS.pointer.primary,
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            P{item.priority}
          </span>
        )}

        {/* Index */}
        {showIndices && (
          <span
            style={{
              position: 'absolute',
              bottom: -20,
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

  // Render enqueue animation
  const renderEnqueueItem = () => {
    if (operation !== 'enqueue' || !operationItem) return null;

    const targetPos = getItemPosition(displayItems.length);
    const startX = containerWidth + 50;

    const currentX = interpolate(operationProgress, [0, 1], [startX, targetPos.x]);

    return (
      <div
        style={{
          position: 'absolute',
          left: currentX,
          top: targetPos.y,
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

  // Render dequeue animation
  const renderDequeueItem = () => {
    if (operation !== 'dequeue' || displayItems.length === 0) return null;

    const frontItem = displayItems[0];
    const startPos = getItemPosition(0);
    const endX = -itemWidth - 50;

    const currentX = interpolate(operationProgress, [0, 1], [startPos.x, endX]);

    return (
      <div
        style={{
          position: 'absolute',
          left: currentX,
          top: startPos.y,
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
          {frontItem.value}
        </span>
      </div>
    );
  };

  // Get type label
  const getTypeLabel = () => {
    switch (type) {
      case 'fifo':
        return 'FIFO - First In, First Out';
      case 'circular':
        return 'Circular Queue';
      case 'deque':
        return 'Double-Ended Queue (Deque)';
      case 'priority':
        return 'Priority Queue';
      default:
        return 'Queue';
    }
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
            backgroundColor: operation === 'enqueue'
              ? DSA_COLORS.cell.success + '20'
              : operation === 'dequeue'
                ? DSA_COLORS.cell.error + '20'
                : DSA_COLORS.pointer.primary + '20',
            border: `1px solid ${
              operation === 'enqueue'
                ? DSA_COLORS.cell.success
                : operation === 'dequeue'
                  ? DSA_COLORS.cell.error
                  : DSA_COLORS.pointer.primary
            }`,
            fontSize: 12,
            color: operation === 'enqueue'
              ? DSA_COLORS.cell.success
              : operation === 'dequeue'
                ? DSA_COLORS.cell.error
                : DSA_COLORS.pointer.primary,
            fontFamily: 'monospace',
          }}
        >
          {operation.toUpperCase()}
          {operationItem && `: ${operationItem.value}`}
        </div>
      )}

      {/* Queue Container */}
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
        {/* Front pointer */}
        {showFrontRear && displayItems.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: getItemPosition(0).x + itemWidth / 2 - 25,
              top: 5,
              padding: '3px 8px',
              backgroundColor: DSA_COLORS.cell.success,
              color: '#fff',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            FRONT &#8595;
          </div>
        )}

        {/* Rear pointer */}
        {showFrontRear && displayItems.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: getItemPosition(displayItems.length - 1).x + itemWidth / 2 - 20,
              top: 5,
              padding: '3px 8px',
              backgroundColor: DSA_COLORS.pointer.secondary,
              color: '#fff',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            REAR &#8595;
          </div>
        )}

        {/* Direction arrows for deque */}
        {type === 'deque' && (
          <>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translate(-100%, -50%)',
                fontSize: 24,
                color: DSA_COLORS.pointer.primary,
              }}
            >
              &#8592; &#8594;
            </div>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translate(100%, -50%)',
                fontSize: 24,
                color: DSA_COLORS.pointer.primary,
              }}
            >
              &#8592; &#8594;
            </div>
          </>
        )}

        {/* Queue items */}
        {displayItems.map((item, index) => renderItem(item, index))}

        {/* Enqueue/Dequeue animations */}
        {renderEnqueueItem()}
        {renderDequeueItem()}

        {/* Hidden items indicator */}
        {hiddenCount > 0 && (
          <div
            style={{
              position: 'absolute',
              right: 10,
              bottom: 5,
              fontSize: 11,
              color: DSA_COLORS.ui.textMuted,
              fontFamily: 'monospace',
            }}
          >
            +{hiddenCount} more
          </div>
        )}

        {/* Empty queue message */}
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
            Empty Queue
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

      {/* Type indicator */}
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
        {getTypeLabel()}
      </div>
    </div>
  );
};

export default Queue;
