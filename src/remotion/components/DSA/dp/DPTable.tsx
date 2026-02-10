// @ts-nocheck
/**
 * DPTable Component
 *
 * Visualizes dynamic programming tables (1D and 2D) with:
 * - Cell highlighting for current computation
 * - Transition arrows showing dependencies
 * - Recurrence relation display
 * - Traceback path visualization
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { DPTableAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, useStepAnnotation } from '../hooks';

interface DPTransition {
  from: [number, number];
  to: [number, number];
  label?: string;
  color?: string;
}

export interface DPTableProps extends DSAStepsProps<DPTableAnimationStep> {
  values: number[][] | number[];
  title?: string;
  rowLabels?: string[];
  colLabels?: string[];
  currentCell?: [number, number];
  filledCells?: [number, number][];
  transitions?: DPTransition[];
  highlightCell?: [number, number];
  highlightRow?: number;
  highlightCol?: number;
  optimalPath?: [number, number][];
  recurrence?: string;
  showFormula?: boolean;
  cellSize?: number;
  animationDelay?: number;
  fillOrder?: 'row' | 'column' | 'diagonal';
}

export const DPTable: React.FC<DPTableProps> = ({
  values,
  title = 'DP Table',
  rowLabels: staticRowLabels,
  colLabels: staticColLabels,
  currentCell: staticCurrentCell,
  filledCells: staticFilledCells = [],
  transitions: staticTransitions = [],
  highlightCell,
  highlightRow,
  highlightCol,
  optimalPath: staticOptimalPath = [],
  recurrence: staticRecurrence,
  showFormula = true,
  cellSize = 50,
  animationDelay = 0,
  fillOrder = 'row',
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: DPTableAnimationStep = useMemo(() => ({
    currentCell: staticCurrentCell,
    filledCells: staticFilledCells,
    transitions: staticTransitions?.map(t => ({ from: t.from, to: t.to })),
    formula: staticRecurrence,
    optimalPath: staticOptimalPath,
  }), [staticCurrentCell, staticFilledCells, staticTransitions, staticRecurrence, staticOptimalPath]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const currentCell = currentState.currentCell ?? staticCurrentCell;
  const filledCells = currentState.filledCells ?? staticFilledCells;
  const transitions = currentState.transitions
    ? currentState.transitions.map(t => ({ from: t.from, to: t.to, label: t.label, color: t.color }))
    : staticTransitions;
  const recurrence = currentState.formula ?? staticRecurrence;
  const optimalPath = currentState.optimalPath ?? staticOptimalPath;
  const rowLabels = currentState.rowLabels?.map(String) ?? staticRowLabels;
  const colLabels = currentState.colLabels?.map(String) ?? staticColLabels;

  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Normalize to 2D array
  const is1D = !Array.isArray(values[0]);
  const table: number[][] = is1D
    ? [values as number[]]
    : (values as number[][]);

  const rows = table.length;
  const cols = table[0]?.length || 0;

  // Check if a cell is filled
  const isCellFilled = (row: number, col: number) => {
    return filledCells.some(([r, c]) => r === row && c === col);
  };

  // Check if a cell is on optimal path
  const isOnOptimalPath = (row: number, col: number) => {
    return optimalPath.some(([r, c]) => r === row && c === col);
  };

  // Check if cell is current
  const isCurrentCell = (row: number, col: number) => {
    return currentCell && currentCell[0] === row && currentCell[1] === col;
  };

  // Get cell fill order index for animation
  const getCellOrder = (row: number, col: number) => {
    if (fillOrder === 'row') {
      return row * cols + col;
    } else if (fillOrder === 'column') {
      return col * rows + row;
    } else {
      // Diagonal
      return row + col;
    }
  };

  // Container dimensions
  const labelOffset = 40;
  const containerWidth = cols * cellSize + labelOffset + 40;
  const containerHeight = rows * cellSize + labelOffset + (showFormula && recurrence ? 80 : 40);

  // Get cell color
  const getCellColor = (row: number, col: number) => {
    if (isCurrentCell(row, col)) return DSA_COLORS.pointer.primary;
    if (isOnOptimalPath(row, col)) return DSA_COLORS.cell.success;
    if (isCellFilled(row, col)) return DSA_COLORS.cell.visited;
    if (highlightRow === row || highlightCol === col) return `${DSA_COLORS.pointer.secondary}40`;
    return DSA_COLORS.cell.default;
  };

  // Render transition arrows
  const renderTransitions = () => {
    if (transitions.length === 0) return null;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: containerWidth,
          height: containerHeight,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <marker
            id="dp-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={DSA_COLORS.pointer.primary} />
          </marker>
        </defs>
        {transitions.map((transition, idx) => {
          const [fromRow, fromCol] = transition.from;
          const [toRow, toCol] = transition.to;

          const fromX = labelOffset + 20 + fromCol * cellSize + cellSize / 2;
          const fromY = labelOffset + 20 + fromRow * cellSize + cellSize / 2;
          const toX = labelOffset + 20 + toCol * cellSize + cellSize / 2;
          const toY = labelOffset + 20 + toRow * cellSize + cellSize / 2;

          // Offset to avoid overlapping with cell
          const dx = toX - fromX;
          const dy = toY - fromY;
          const len = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / len) * (cellSize / 2 - 5);
          const offsetY = (dy / len) * (cellSize / 2 - 5);

          return (
            <g key={idx}>
              <line
                x1={fromX + offsetX}
                y1={fromY + offsetY}
                x2={toX - offsetX}
                y2={toY - offsetY}
                stroke={transition.color || DSA_COLORS.pointer.primary}
                strokeWidth={2}
                markerEnd="url(#dp-arrow)"
                opacity={0.8}
              />
              {transition.label && (
                <text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2 - 5}
                  fill={transition.color || DSA_COLORS.pointer.primary}
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {transition.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Render optimal path
  const renderOptimalPath = () => {
    if (optimalPath.length < 2) return null;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: containerWidth,
          height: containerHeight,
          pointerEvents: 'none',
        }}
      >
        {optimalPath.slice(1).map((cell, idx) => {
          const [prevRow, prevCol] = optimalPath[idx];
          const [row, col] = cell;

          const fromX = labelOffset + 20 + prevCol * cellSize + cellSize / 2;
          const fromY = labelOffset + 20 + prevRow * cellSize + cellSize / 2;
          const toX = labelOffset + 20 + col * cellSize + cellSize / 2;
          const toY = labelOffset + 20 + row * cellSize + cellSize / 2;

          return (
            <line
              key={idx}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={DSA_COLORS.cell.success}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.6}
            />
          );
        })}
      </svg>
    );
  };

  // Render a single cell
  const renderCell = (row: number, col: number, value: number) => {
    const order = getCellOrder(row, col);
    const cellProgress = spring({
      frame: animatedFrame - order * (DSA_TIMING.stagger / 2),
      fps,
      config: DSA_SPRINGS.smooth,
    });

    const isActive = isCurrentCell(row, col);
    const pulseScale = isActive
      ? 1 + Math.sin((animatedFrame / fps) * Math.PI * 3) * 0.05
      : 1;

    return (
      <div
        key={`${row}-${col}`}
        style={{
          position: 'absolute',
          left: labelOffset + 20 + col * cellSize,
          top: labelOffset + 20 + row * cellSize,
          width: cellSize - 4,
          height: cellSize - 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getCellColor(row, col),
          border: `2px solid ${
            isActive
              ? DSA_COLORS.pointer.primary
              : isOnOptimalPath(row, col)
                ? DSA_COLORS.cell.success
                : DSA_COLORS.ui.border
          }`,
          borderRadius: 4,
          transform: `scale(${cellProgress * pulseScale})`,
          opacity: cellProgress,
          boxShadow: isActive
            ? `0 0 15px ${DSA_COLORS.pointer.primary}50`
            : 'none',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 600,
          color: isActive || isOnOptimalPath(row, col) ? '#fff' : DSA_COLORS.ui.text,
        }}
      >
        {value}
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

      {/* Recurrence formula */}
      {showFormula && recurrence && (
        <div
          style={{
            marginBottom: 15,
            padding: '8px 16px',
            backgroundColor: `${DSA_COLORS.pointer.primary}15`,
            border: `1px solid ${DSA_COLORS.pointer.primary}40`,
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'monospace',
            color: DSA_COLORS.pointer.primary,
          }}
        >
          {recurrence}
        </div>
      )}

      {/* Container */}
      <div
        style={{
          position: 'relative',
          width: containerWidth,
          height: containerHeight - (showFormula && recurrence ? 40 : 0),
          backgroundColor: DSA_COLORS.ui.cardBg,
          border: `2px solid ${DSA_COLORS.ui.border}`,
          borderRadius: 8,
        }}
      >
        {/* Column labels */}
        {colLabels && (
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: labelOffset + 20,
              display: 'flex',
            }}
          >
            {colLabels.map((label, idx) => (
              <div
                key={idx}
                style={{
                  width: cellSize,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: highlightCol === idx ? DSA_COLORS.pointer.secondary : DSA_COLORS.ui.textMuted,
                  fontFamily: 'monospace',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Row labels */}
        {rowLabels && (
          <div
            style={{
              position: 'absolute',
              top: labelOffset + 20,
              left: 5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {rowLabels.map((label, idx) => (
              <div
                key={idx}
                style={{
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: highlightRow === idx ? DSA_COLORS.pointer.secondary : DSA_COLORS.ui.textMuted,
                  fontFamily: 'monospace',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Optimal path */}
        {renderOptimalPath()}

        {/* Cells */}
        {table.map((row, rowIdx) =>
          row.map((value, colIdx) => renderCell(rowIdx, colIdx, value))
        )}

        {/* Transitions */}
        {renderTransitions()}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 15,
          display: 'flex',
          gap: 15,
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        {[
          { label: 'Current', color: DSA_COLORS.pointer.primary },
          { label: 'Filled', color: DSA_COLORS.cell.visited },
          { label: 'Optimal', color: DSA_COLORS.cell.success },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: color,
              }}
            />
            <span style={{ color: DSA_COLORS.ui.textMuted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DPTable;
