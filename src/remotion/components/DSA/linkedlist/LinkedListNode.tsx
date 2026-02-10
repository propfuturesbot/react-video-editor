/**
 * LinkedListNode Component
 *
 * Renders a single node in a linked list with value, arrows, and optional labels.
 * Supports singly, doubly, and circular linked list nodes.
 */

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_DIMENSIONS, DSA_SPRINGS } from '../constants';

export interface LinkedListNodeProps {
  value: string | number;
  type?: 'singly' | 'doubly' | 'circular';
  showNext?: boolean;
  showPrev?: boolean;
  isHead?: boolean;
  isTail?: boolean;
  isNull?: boolean;
  isDummy?: boolean;
  highlight?: 'current' | 'visited' | 'target' | 'found' | 'slow' | 'fast';
  highlightColor?: string;
  showIndex?: number;
  animation?: 'enter' | 'exit' | 'pulse' | 'shake' | 'none';
  animationDelay?: number;
  width?: number;
  height?: number;
  showPointerBox?: boolean;
}

export const LinkedListNode: React.FC<LinkedListNodeProps> = ({
  value,
  type = 'singly',
  showNext = true,
  showPrev = false,
  isHead = false,
  isTail = false,
  isNull = false,
  isDummy = false,
  highlight,
  highlightColor,
  showIndex,
  animation = 'enter',
  animationDelay = 0,
  width = 80,
  height = 50,
  showPointerBox = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation progress
  const animatedFrame = Math.max(0, frame - animationDelay);

  const enterProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  const pulseProgress =
    animation === 'pulse'
      ? Math.sin((animatedFrame / fps) * Math.PI * 2) * 0.1 + 1
      : 1;

  const shakeOffset =
    animation === 'shake'
      ? Math.sin((animatedFrame / fps) * Math.PI * 20) * 3
      : 0;

  // Determine colors
  const getBackgroundColor = () => {
    if (isNull) return DSA_COLORS.cell.empty;
    if (isDummy) return 'transparent';
    if (highlight) {
      switch (highlight) {
        case 'current':
          return DSA_COLORS.pointer.primary;
        case 'visited':
          return DSA_COLORS.cell.visited;
        case 'target':
          return DSA_COLORS.cell.target;
        case 'found':
          return DSA_COLORS.cell.success;
        case 'slow':
          return '#22c55e'; // Green for slow pointer
        case 'fast':
          return '#ef4444'; // Red for fast pointer
        default:
          return highlightColor || DSA_COLORS.cell.default;
      }
    }
    return DSA_COLORS.cell.default;
  };

  const getBorderColor = () => {
    if (isDummy) return DSA_COLORS.ui.border + '80';
    if (highlight) {
      return getBackgroundColor();
    }
    return DSA_COLORS.ui.border;
  };

  // Pointer box width
  const pointerBoxWidth = 25;
  const valueBoxWidth = showPointerBox ? width - pointerBoxWidth : width;

  // Arrow dimensions
  const arrowLength = 40;
  const arrowHeadSize = 8;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        opacity: animation === 'exit' ? 1 - enterProgress : enterProgress,
        transform: `scale(${pulseProgress}) translateX(${shakeOffset}px)`,
      }}
    >
      {/* Previous Arrow (for doubly linked) */}
      {type === 'doubly' && showPrev && (
        <svg
          width={arrowLength}
          height={height}
          style={{ marginRight: -5 }}
        >
          {/* Arrow line */}
          <line
            x1={arrowLength - 5}
            y1={height / 2}
            x2={10}
            y2={height / 2}
            stroke={DSA_COLORS.pointer.primary}
            strokeWidth={2}
          />
          {/* Arrow head */}
          <polygon
            points={`${10},${height / 2} ${10 + arrowHeadSize},${height / 2 - arrowHeadSize / 2} ${10 + arrowHeadSize},${height / 2 + arrowHeadSize / 2}`}
            fill={DSA_COLORS.pointer.primary}
          />
        </svg>
      )}

      {/* Head Label */}
      {isHead && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            fontSize: 12,
            fontWeight: 600,
            color: DSA_COLORS.pointer.primary,
            fontFamily: 'monospace',
          }}
        >
          HEAD
        </div>
      )}

      {/* Index Label */}
      {showIndex !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: -25,
            left: valueBoxWidth / 2,
            transform: 'translateX(-50%)',
            fontSize: 11,
            color: DSA_COLORS.ui.textMuted,
            fontFamily: 'monospace',
          }}
        >
          [{showIndex}]
        </div>
      )}

      {/* Node Container */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Value Box */}
        <div
          style={{
            width: valueBoxWidth,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getBackgroundColor(),
            border: `2px solid ${getBorderColor()}`,
            borderStyle: isDummy ? 'dashed' : 'solid',
            borderRadius: '4px 0 0 4px',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 600,
            color: isNull ? DSA_COLORS.ui.textMuted : DSA_COLORS.ui.text,
          }}
        >
          {isNull ? 'NULL' : value}
        </div>

        {/* Pointer Box */}
        {showPointerBox && !isNull && (
          <div
            style={{
              width: pointerBoxWidth,
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: DSA_COLORS.cell.empty,
              borderTop: `2px solid ${getBorderColor()}`,
              borderBottom: `2px solid ${getBorderColor()}`,
              borderRight: `2px solid ${getBorderColor()}`,
              borderRadius: '0 4px 4px 0',
            }}
          >
            {/* Dot representing pointer */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: showNext ? DSA_COLORS.pointer.primary : DSA_COLORS.ui.border,
              }}
            />
          </div>
        )}
      </div>

      {/* Tail Label */}
      {isTail && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: showPointerBox ? pointerBoxWidth : 0,
            fontSize: 12,
            fontWeight: 600,
            color: DSA_COLORS.pointer.secondary,
            fontFamily: 'monospace',
          }}
        >
          TAIL
        </div>
      )}

      {/* Next Arrow */}
      {showNext && !isNull && (
        <svg
          width={arrowLength}
          height={height}
          style={{ marginLeft: -5 }}
        >
          {/* Arrow line */}
          <line
            x1={5}
            y1={height / 2}
            x2={arrowLength - 10}
            y2={height / 2}
            stroke={DSA_COLORS.pointer.primary}
            strokeWidth={2}
          />
          {/* Arrow head */}
          <polygon
            points={`${arrowLength - 10},${height / 2} ${arrowLength - 10 - arrowHeadSize},${height / 2 - arrowHeadSize / 2} ${arrowLength - 10 - arrowHeadSize},${height / 2 + arrowHeadSize / 2}`}
            fill={DSA_COLORS.pointer.primary}
          />
        </svg>
      )}

      {/* Ground symbol for null/tail */}
      {(isNull || (isTail && !showNext)) && (
        <svg width={30} height={height} style={{ marginLeft: 5 }}>
          <line
            x1={5}
            y1={height / 2 - 10}
            x2={5}
            y2={height / 2 + 10}
            stroke={DSA_COLORS.ui.border}
            strokeWidth={2}
          />
          <line
            x1={10}
            y1={height / 2 - 7}
            x2={10}
            y2={height / 2 + 7}
            stroke={DSA_COLORS.ui.border}
            strokeWidth={2}
          />
          <line
            x1={15}
            y1={height / 2 - 4}
            x2={15}
            y2={height / 2 + 4}
            stroke={DSA_COLORS.ui.border}
            strokeWidth={2}
          />
        </svg>
      )}
    </div>
  );
};

export default LinkedListNode;
