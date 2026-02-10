// @ts-nocheck
/**
 * LinkedListContainer Component
 *
 * Renders a complete linked list visualization with support for:
 * - Singly, doubly, and circular linked lists
 * - Pointer highlighting (current, slow, fast)
 * - Cycle detection visualization
 * - Intersection point visualization
 * - Traversal animations
 * - Animation steps for frame-by-frame state changes
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { LinkedListNode } from './LinkedListNode';
import { LinkedListAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

interface ListNode {
  value: string | number;
  isDummy?: boolean;
}

interface Pointer {
  index: number;
  label: string;
  color?: string;
  type?: 'current' | 'slow' | 'fast' | 'visited' | 'target';
}

interface CycleInfo {
  from: number; // Index where cycle starts going back
  to: number;   // Index where it connects to
}

export interface LinkedListContainerProps extends DSAStepsProps<LinkedListAnimationStep> {
  nodes: ListNode[];
  type?: 'singly' | 'doubly' | 'circular';
  title?: string;
  pointers?: Pointer[];
  highlightIndices?: number[];
  showCycle?: CycleInfo;
  showIntersection?: { at: number; list2Start: number };
  animateTraversal?: boolean;
  traversalSpeed?: number;
  showIndices?: boolean;
  nodeWidth?: number;
  nodeHeight?: number;
  layout?: 'horizontal' | 'vertical' | 'wrap';
  maxNodesPerRow?: number;
  animationDelay?: number;
}

export const LinkedListContainer: React.FC<LinkedListContainerProps> = ({
  nodes,
  type = 'singly',
  title,
  pointers: staticPointers = [],
  highlightIndices: staticHighlightIndices = [],
  showCycle,
  showIntersection,
  animateTraversal = false,
  traversalSpeed = 1,
  showIndices = true,
  nodeWidth = 80,
  nodeHeight = 50,
  layout = 'horizontal',
  maxNodesPerRow = 6,
  animationDelay = 0,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  interpolationMode = 'smooth',
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: LinkedListAnimationStep = useMemo(() => ({
    highlightedNodes: staticHighlightIndices,
    pointerLabels: staticPointers.map(p => ({ index: p.index, label: p.label, color: p.color })),
  }), [staticHighlightIndices, staticPointers]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState, nextState, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const currentPointerIndex = useMemo(() => {
    if (!animationSteps || currentState.currentPointerIndex === undefined) {
      return undefined;
    }
    if (interpolationMode === 'discrete' || nextState.currentPointerIndex === undefined) {
      return currentState.currentPointerIndex;
    }
    return interpolateNumeric(
      currentState.currentPointerIndex,
      nextState.currentPointerIndex,
      stepProgress
    );
  }, [animationSteps, currentState.currentPointerIndex, nextState.currentPointerIndex, interpolationMode, stepProgress]);

  const highlightIndices = currentState.highlightedNodes ?? staticHighlightIndices;
  const operation = currentState.operation;
  const pointerLabels = currentState.pointerLabels;
  const pointers = staticPointers; // Use static pointers for highlight checks

  // Animation progress
  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Calculate traversal index for animation (used when not using animation steps)
  const traversalIndex = animateTraversal && !animationSteps
    ? Math.floor((animatedFrame / fps) * traversalSpeed) % (nodes.length + 1)
    : currentPointerIndex !== undefined ? Math.round(currentPointerIndex) : -1;

  // Get highlight for a node
  const getNodeHighlight = (index: number): Pointer['type'] | undefined => {
    // Check if it's the traversal point
    if (traversalIndex === index) return 'current';

    // Check explicit pointers
    for (const ptr of pointers) {
      if (ptr.index === index) return ptr.type || 'current';
    }

    // Check highlight indices
    if (highlightIndices.includes(index)) return 'visited';

    return undefined;
  };

  // Get pointer label for a node
  const getPointerLabel = (index: number): { label: string; color?: string } | undefined => {
    // First check animation step pointer labels
    if (pointerLabels) {
      for (const ptr of pointerLabels) {
        // Support interpolated positions
        if (Math.abs(ptr.index - index) < 0.5) {
          return { label: ptr.label, color: ptr.color };
        }
      }
    }
    // Fall back to static pointers
    for (const ptr of staticPointers) {
      if (ptr.index === index) return { label: ptr.label, color: ptr.color };
    }
    return undefined;
  };

  // Calculate layout positions
  const getNodePosition = (index: number) => {
    if (layout === 'horizontal') {
      return {
        x: index * (nodeWidth + 40), // node + arrow space
        y: 0,
      };
    } else if (layout === 'wrap') {
      const row = Math.floor(index / maxNodesPerRow);
      const col = index % maxNodesPerRow;
      // Alternate direction for each row (snake pattern)
      const isReversed = row % 2 === 1;
      const actualCol = isReversed ? (maxNodesPerRow - 1 - col) : col;
      return {
        x: actualCol * (nodeWidth + 40),
        y: row * (nodeHeight + 60),
      };
    } else {
      return {
        x: 0,
        y: index * (nodeHeight + 40),
      };
    }
  };

  // Calculate container size
  const containerWidth =
    layout === 'horizontal'
      ? nodes.length * (nodeWidth + 40) + 40
      : layout === 'wrap'
        ? Math.min(nodes.length, maxNodesPerRow) * (nodeWidth + 40) + 40
        : nodeWidth + 100;

  const containerHeight =
    layout === 'horizontal'
      ? nodeHeight + 100
      : layout === 'wrap'
        ? (Math.ceil(nodes.length / maxNodesPerRow)) * (nodeHeight + 60) + 60
        : nodes.length * (nodeHeight + 40) + 100;

  // Render cycle arrow if needed
  const renderCycleArrow = () => {
    if (!showCycle) return null;

    const fromPos = getNodePosition(showCycle.from);
    const toPos = getNodePosition(showCycle.to);

    // Calculate curve for cycle arrow
    const startX = fromPos.x + nodeWidth + 20;
    const startY = fromPos.y + nodeHeight / 2;
    const endX = toPos.x + nodeWidth / 2;
    const endY = toPos.y + nodeHeight + 10;

    // Control points for bezier curve
    const midY = Math.max(startY, endY) + 50;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: containerWidth,
          height: containerHeight + 50,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <marker
            id="cycle-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={DSA_COLORS.cell.error} />
          </marker>
        </defs>
        <path
          d={`M ${startX} ${startY} Q ${startX + 40} ${midY}, ${endX} ${endY}`}
          fill="none"
          stroke={DSA_COLORS.cell.error}
          strokeWidth={2}
          strokeDasharray="5,5"
          markerEnd="url(#cycle-arrow)"
        />
        <text
          x={(startX + endX) / 2 + 20}
          y={midY - 10}
          fill={DSA_COLORS.cell.error}
          fontSize={12}
          fontFamily="monospace"
        >
          Cycle
        </text>
      </svg>
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
      {title && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 18,
            fontWeight: 600,
            color: DSA_COLORS.ui.text,
            fontFamily: 'monospace',
          }}
        >
          {title}
        </div>
      )}

      {/* Step Annotation */}
      {annotationText && (
        <div
          style={{
            marginBottom: 16,
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

      {/* Operation indicator */}
      {operation && operation !== 'none' && (
        <div
          style={{
            marginBottom: 12,
            padding: '4px 12px',
            borderRadius: 4,
            backgroundColor: DSA_COLORS.syntax.function + '20',
            border: `1px solid ${DSA_COLORS.syntax.function}`,
            fontSize: 12,
            color: DSA_COLORS.syntax.function,
            fontFamily: 'monospace',
          }}
        >
          Operation: {operation}
        </div>
      )}

      {/* List Container */}
      <div
        style={{
          position: 'relative',
          width: containerWidth,
          height: containerHeight,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Nodes */}
        {nodes.map((node, index) => {
          const pos = getNodePosition(index);
          const highlight = getNodeHighlight(index);
          const pointerInfo = getPointerLabel(index);
          const isLast = index === nodes.length - 1;
          const isFirst = index === 0;

          // Calculate pointer position for interpolated movement
          const pointerOffset = currentPointerIndex !== undefined && Math.abs(currentPointerIndex - index) < 0.5
            ? (currentPointerIndex - index) * (nodeWidth + 40)
            : 0;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
              }}
            >
              {/* Pointer Label - supports interpolated positioning */}
              {pointerInfo && (
                <div
                  style={{
                    position: 'absolute',
                    top: -35,
                    left: `calc(50% + ${pointerOffset}px)`,
                    transform: 'translateX(-50%)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor:
                      pointerInfo.color ||
                      (highlight === 'slow'
                        ? '#22c55e'
                        : highlight === 'fast'
                          ? '#ef4444'
                          : DSA_COLORS.pointer.primary),
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 8px ${pointerInfo.color || DSA_COLORS.pointer.primary}60`,
                    transition: 'left 0.1s ease-out',
                  }}
                >
                  {pointerInfo.label}
                </div>
              )}

              <LinkedListNode
                value={node.value}
                type={type}
                showNext={!isLast || (type === 'circular')}
                showPrev={type === 'doubly' && !isFirst}
                isHead={isFirst}
                isTail={isLast && type !== 'circular'}
                isDummy={node.isDummy}
                highlight={highlight}
                showIndex={showIndices ? index : undefined}
                animation="enter"
                animationDelay={animationDelay + index * DSA_TIMING.stagger}
                width={nodeWidth}
                height={nodeHeight}
              />
            </div>
          );
        })}

        {/* Cycle Arrow */}
        {renderCycleArrow()}

        {/* Null terminator at end */}
        {type === 'singly' && nodes.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: getNodePosition(nodes.length).x,
              top: getNodePosition(nodes.length - 1).y,
            }}
          >
            <LinkedListNode
              value=""
              isNull
              showNext={false}
              animation="enter"
              animationDelay={animationDelay + nodes.length * DSA_TIMING.stagger}
              width={50}
              height={nodeHeight}
              showPointerBox={false}
            />
          </div>
        )}
      </div>

      {/* Type indicator */}
      <div
        style={{
          marginTop: 20,
          padding: '4px 12px',
          borderRadius: 4,
          backgroundColor: DSA_COLORS.ui.cardBg,
          border: `1px solid ${DSA_COLORS.ui.border}`,
          fontSize: 12,
          color: DSA_COLORS.ui.textMuted,
          fontFamily: 'monospace',
        }}
      >
        {type === 'singly' && 'Singly Linked List'}
        {type === 'doubly' && 'Doubly Linked List'}
        {type === 'circular' && 'Circular Linked List'}
      </div>
    </div>
  );
};

export default LinkedListContainer;
