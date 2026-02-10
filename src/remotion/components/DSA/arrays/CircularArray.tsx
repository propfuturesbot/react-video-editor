// @ts-nocheck
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayHighlight } from '../types';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';

interface CircularArrayProps {
  values: (string | number)[];
  highlightIndices?: { index: number; type: ArrayHighlight }[];
  headIndex?: number;
  tailIndex?: number;
  capacity?: number;
  showCapacity?: boolean;
  radius?: number;
  cellSize?: number;
  title?: string;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const CircularArray: React.FC<CircularArrayProps> = ({
  values,
  highlightIndices = [],
  headIndex,
  tailIndex,
  capacity,
  showCapacity = true,
  radius = 150,
  cellSize = 50,
  title,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actualCapacity = capacity || values.length;
  const angleStep = (2 * Math.PI) / actualCapacity;

  // Get highlight type for an index
  const getHighlightType = (index: number): ArrayHighlight => {
    const explicit = highlightIndices.find(h => h.index === index);
    if (explicit) return explicit.type;
    return 'none';
  };

  // Get highlight color
  const getHighlightColor = (type: ArrayHighlight): string => {
    if (type === 'none') return DSA_COLORS.cell.default;
    return DSA_COLORS.cell[type] || DSA_COLORS.cell.default;
  };

  // Calculate position for each cell
  const getCellPosition = (index: number) => {
    // Start from top and go clockwise
    const angle = -Math.PI / 2 + index * angleStep;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Animation progress
  const getAnimProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 3,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  const containerSize = radius * 2 + cellSize + 80;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
            marginBottom: 16,
          }}
        >
          {title}
        </div>
      )}

      {/* Circular container */}
      <div
        style={{
          position: 'relative',
          width: containerSize,
          height: containerSize,
        }}
      >
        {/* Center circle (ring) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            border: `2px dashed ${DSA_COLORS.ui.border}`,
          }}
        />

        {/* Center info */}
        {showCapacity && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
              capacity
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: DSA_COLORS.ui.text,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {actualCapacity}
            </div>
            <div style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
              size: {values.length}
            </div>
          </div>
        )}

        {/* Cells */}
        {Array.from({ length: actualCapacity }).map((_, index) => {
          const pos = getCellPosition(index);
          const value = values[index];
          const isEmpty = value === undefined;
          const highlightType = isEmpty ? 'none' : getHighlightType(index);
          const progress = getAnimProgress(index);

          const isHead = headIndex === index;
          const isTail = tailIndex === index;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${progress})`,
                opacity: progress,
              }}
            >
              {/* Head/Tail label */}
              {(isHead || isTail) && (
                <div
                  style={{
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: isHead ? DSA_COLORS.pointer.left : DSA_COLORS.pointer.right,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isHead ? 'HEAD' : 'TAIL'}
                </div>
              )}

              {/* Cell */}
              <div
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 8,
                  border: `2px solid ${
                    isEmpty
                      ? DSA_COLORS.ui.border
                      : isHead
                      ? DSA_COLORS.pointer.left
                      : isTail
                      ? DSA_COLORS.pointer.right
                      : getHighlightColor(highlightType)
                  }`,
                  background: isEmpty
                    ? 'transparent'
                    : getHighlightColor(highlightType),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isEmpty ? DSA_COLORS.ui.textMuted : DSA_COLORS.cell.text,
                  boxShadow: isHead || isTail
                    ? `0 0 12px ${isHead ? DSA_COLORS.pointer.left : DSA_COLORS.pointer.right}40`
                    : 'none',
                }}
              >
                {isEmpty ? '-' : value}
              </div>

              {/* Index */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 11,
                  color: DSA_COLORS.ui.textMuted,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {index}
              </div>
            </div>
          );
        })}

        {/* Direction arrow */}
        <svg
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: containerSize,
            height: containerSize,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={DSA_COLORS.ui.textMuted}
              />
            </marker>
          </defs>
          <path
            d={`M ${containerSize / 2 + radius + 30} ${containerSize / 2 - 20}
                A ${radius + 30} ${radius + 30} 0 0 1 ${containerSize / 2 + radius + 30} ${containerSize / 2 + 20}`}
            fill="none"
            stroke={DSA_COLORS.ui.textMuted}
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
            opacity={0.6}
          />
        </svg>
      </div>
    </div>
  );
};

export default CircularArray;
