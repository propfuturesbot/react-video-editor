/**
 * ArrayWithState Component
 *
 * Enhanced array visualization that shows:
 * - Array visualization with animated pointers
 * - Variable state panel showing current variable values
 * - Operation description
 * - Step-by-step animation through algorithm execution
 *
 * This is the preferred component for educational DSA videos
 * as it provides comprehensive visual feedback.
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { ArrayCell } from './ArrayCell';
import { ArrayPointer, ArrayHighlight, DSAStepsProps } from '../types';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { useDSAStepAnimation, interpolateNumeric, useStepAnnotation } from '../hooks';

// Variable state to display
interface VariableState {
  name: string;
  value: string | number | boolean | null;
  highlight?: boolean;
  color?: string;
}

// Animation step for array with state
export interface ArrayWithStateAnimationStep {
  annotation?: string;
  stepLabel?: string;
  // Array state
  values?: (string | number)[];
  highlightIndices?: number[];
  highlightTypes?: { index: number; type: ArrayHighlight }[];
  // Pointers with smooth movement
  pointers?: ArrayPointer[];
  // Operation info
  operation?: string;
  operationDescription?: string;
  // Variable states
  variables?: VariableState[];
  // Comparison/swap highlights
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
  pivot?: number;
}

interface ArrayWithStateProps extends DSAStepsProps<ArrayWithStateAnimationStep> {
  // Initial data
  values: (string | number)[];
  title?: string;

  // Visual options
  showIndices?: boolean;
  cellSize?: 'small' | 'medium' | 'large';

  // Initial state
  pointers?: ArrayPointer[];
  highlightIndices?: number[];
  variables?: VariableState[];
  operation?: string;
  operationDescription?: string;

  // Animation
  animationDelay?: number;
  showVariablePanel?: boolean;
  showOperationPanel?: boolean;
  variablePanelPosition?: 'right' | 'bottom';
}

export const ArrayWithState: React.FC<ArrayWithStateProps> = ({
  values: staticValues,
  title,
  showIndices = true,
  cellSize = 'medium',
  pointers: staticPointers = [],
  highlightIndices: staticHighlightIndices = [],
  variables: staticVariables = [],
  operation: staticOperation,
  operationDescription: staticOperationDescription,
  animationDelay = 0,
  showVariablePanel = true,
  showOperationPanel = true,
  variablePanelPosition = 'right',
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  animationStartFrame = 0,
  interpolationMode = 'smooth',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: ArrayWithStateAnimationStep = useMemo(() => ({
    values: staticValues,
    highlightIndices: staticHighlightIndices,
    pointers: staticPointers,
    variables: staticVariables,
    operation: staticOperation,
    operationDescription: staticOperationDescription,
  }), [staticValues, staticHighlightIndices, staticPointers, staticVariables, staticOperation, staticOperationDescription]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState, nextState, stepProgress, stepIndex, totalSteps } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const values = currentState.values ?? staticValues;
  const highlightIndices = currentState.highlightIndices ?? staticHighlightIndices;
  const highlightTypes = currentState.highlightTypes ?? [];
  const comparing = currentState.comparing;
  const swapping = currentState.swapping;
  const sorted = currentState.sorted ?? [];
  const pivot = currentState.pivot;
  const variables = currentState.variables ?? staticVariables;
  const operation = currentState.operation ?? staticOperation;
  const operationDescription = currentState.operationDescription ?? staticOperationDescription;

  // Interpolate pointer positions for smooth movement
  const pointers = useMemo(() => {
    if (!animationSteps || animationSteps.length === 0) {
      return staticPointers;
    }

    const currentPointers = currentState.pointers ?? staticPointers;
    const nextPointers = nextState.pointers ?? currentPointers;

    if (interpolationMode === 'discrete' || !nextPointers.length) {
      return currentPointers;
    }

    // Interpolate pointer positions
    return currentPointers.map((pointer, idx) => {
      const nextPointer = nextPointers.find(p => p.label === pointer.label) ?? nextPointers[idx];
      if (!nextPointer) return pointer;

      return {
        ...pointer,
        index: interpolateNumeric(pointer.index, nextPointer.index, stepProgress),
      };
    });
  }, [currentState.pointers, nextState.pointers, staticPointers, animationSteps, interpolationMode, stepProgress]);

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, gap: 6 },
    medium: { width: 60, height: 60, gap: 8 },
    large: { width: 80, height: 80, gap: 10 },
  }[cellSize];

  const cellWidth = sizeConfig.width + sizeConfig.gap;

  // Animation progress for entrance
  const animatedFrame = Math.max(0, frame - animationDelay);
  const entranceProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Get highlight type for a specific index
  const getHighlightType = (index: number): ArrayHighlight => {
    // Check explicit highlight types first
    const explicit = highlightTypes.find(h => h.index === index);
    if (explicit) return explicit.type;

    // Check comparing
    if (comparing && (comparing[0] === index || comparing[1] === index)) {
      return 'comparing';
    }

    // Check swapping
    if (swapping && (swapping[0] === index || swapping[1] === index)) {
      return 'swapping';
    }

    // Check pivot
    if (pivot === index) {
      return 'pivot';
    }

    // Check sorted
    if (sorted.includes(index)) {
      return 'sorted';
    }

    // Check highlight indices
    if (highlightIndices.includes(index)) {
      return 'current';
    }

    return 'none';
  };

  // Get cell animation delay
  const getCellDelay = (index: number) => {
    return animationDelay + index * DSA_TIMING.stagger.normal;
  };

  // Render variable state panel
  const renderVariablePanel = () => {
    if (!showVariablePanel || variables.length === 0) return null;

    const panelProgress = spring({
      frame: animatedFrame - values.length * DSA_TIMING.stagger.normal,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          background: DSA_COLORS.ui.cardBg,
          borderRadius: 10,
          border: `1px solid ${DSA_COLORS.ui.border}`,
          opacity: panelProgress,
          transform: `translateX(${interpolate(panelProgress, [0, 1], [20, 0])}px)`,
          minWidth: 180,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: DSA_COLORS.ui.textMuted,
            marginBottom: 4,
            fontFamily: 'JetBrains Mono, monospace',
            borderBottom: `1px solid ${DSA_COLORS.ui.border}`,
            paddingBottom: 8,
          }}
        >
          Variables
        </div>
        {variables.map((variable, idx) => (
          <div
            key={variable.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '6px 8px',
              borderRadius: 6,
              background: variable.highlight
                ? `${variable.color || DSA_COLORS.pointer.primary}20`
                : 'transparent',
              transition: 'background 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: variable.color || DSA_COLORS.syntax.variable,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {variable.name}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: variable.highlight
                  ? variable.color || DSA_COLORS.pointer.primary
                  : DSA_COLORS.ui.text,
                fontFamily: 'JetBrains Mono, monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: `${DSA_COLORS.ui.border}50`,
              }}
            >
              {variable.value === null ? 'null' : String(variable.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render operation panel
  const renderOperationPanel = () => {
    if (!showOperationPanel || (!operation && !operationDescription)) return null;

    const panelProgress = spring({
      frame: animatedFrame - 10,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '12px 20px',
          background: `${DSA_COLORS.pointer.primary}15`,
          borderRadius: 10,
          border: `1px solid ${DSA_COLORS.pointer.primary}40`,
          opacity: panelProgress,
          transform: `translateY(${interpolate(panelProgress, [0, 1], [-10, 0])}px)`,
        }}
      >
        {operation && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: DSA_COLORS.pointer.primary,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {operation}
          </div>
        )}
        {operationDescription && (
          <div
            style={{
              fontSize: 14,
              color: DSA_COLORS.ui.text,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {operationDescription}
          </div>
        )}
      </div>
    );
  };

  // Render step progress
  const renderStepProgress = () => {
    if (!animationSteps || animationSteps.length <= 1) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: DSA_COLORS.ui.cardBg,
          borderRadius: 6,
          border: `1px solid ${DSA_COLORS.ui.border}`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: DSA_COLORS.ui.textMuted,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          Step
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {stepIndex + 1} / {totalSteps}
        </span>
        {/* Progress bar */}
        <div
          style={{
            width: 60,
            height: 4,
            background: DSA_COLORS.ui.border,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              height: '100%',
              background: DSA_COLORS.pointer.primary,
              transition: 'width 0.2s ease',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        opacity: entranceProgress,
        transform: `translateY(${interpolate(entranceProgress, [0, 1], [20, 0])}px)`,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
          }}
        >
          {title}
        </div>
      )}

      {/* Step annotation */}
      {annotationText && (
        <div
          style={{
            fontSize: 18,
            color: DSA_COLORS.ui.text,
            padding: '10px 20px',
            background: DSA_COLORS.ui.cardBg,
            borderRadius: 10,
            opacity: annotationOpacity,
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          {annotationText}
        </div>
      )}

      {/* Operation panel */}
      {renderOperationPanel()}

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: variablePanelPosition === 'right' ? 'row' : 'column',
          alignItems: variablePanelPosition === 'right' ? 'flex-start' : 'center',
          gap: 24,
        }}
      >
        {/* Array visualization */}
        <div style={{ position: 'relative' }}>
          {/* Cells */}
          <div
            style={{
              display: 'flex',
              gap: sizeConfig.gap,
            }}
          >
            {values.map((value, index) => (
              <ArrayCell
                key={index}
                value={value}
                index={index}
                highlight={getHighlightType(index)}
                showIndex={showIndices}
                size={cellSize}
                animationDelay={getCellDelay(index)}
                animation="enter"
              />
            ))}
          </div>

          {/* Pointers */}
          {pointers.map((pointer, idx) => (
            <PointerArrow
              key={`pointer-${idx}-${pointer.label}`}
              pointer={pointer}
              cellWidth={cellWidth}
              cellHeight={sizeConfig.height}
              frame={frame}
              startFrame={animationDelay + values.length * DSA_TIMING.stagger.normal}
            />
          ))}
        </div>

        {/* Variable panel */}
        {variablePanelPosition === 'right' && renderVariablePanel()}
      </div>

      {/* Variable panel at bottom */}
      {variablePanelPosition === 'bottom' && renderVariablePanel()}

      {/* Step progress */}
      {renderStepProgress()}
    </div>
  );
};

// ============================================
// Pointer Arrow Sub-component
// ============================================

interface PointerArrowProps {
  pointer: ArrayPointer;
  cellWidth: number;
  cellHeight: number;
  frame: number;
  startFrame: number;
}

const PointerArrow: React.FC<PointerArrowProps> = ({
  pointer,
  cellWidth,
  cellHeight,
  frame,
  startFrame,
}) => {
  const progress = spring({
    frame: frame - startFrame,
    fps: 30,
    config: DSA_SPRINGS.bouncy,
  });

  const isTop = pointer.position !== 'bottom';
  // Support smooth interpolation for non-integer indices
  const left = pointer.index * cellWidth + cellWidth / 2 - 4;
  const top = isTop ? -45 : cellHeight + 25;

  // Bounce animation
  const bounce = Math.sin(frame * 0.12) * 4 * progress;

  // Glow effect when pointer is moving
  const isMoving = pointer.index !== Math.round(pointer.index);
  const glowIntensity = isMoving ? 10 : 6;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: isTop ? top - bounce : top + bounce,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: progress,
        transform: `scale(${progress}) translateX(-50%)`,
        transition: 'left 0.1s ease-out',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: pointer.color,
          fontFamily: 'JetBrains Mono, monospace',
          order: isTop ? 0 : 1,
          marginBottom: isTop ? 4 : 0,
          marginTop: isTop ? 0 : 4,
          padding: '2px 8px',
          borderRadius: 4,
          background: `${pointer.color}20`,
          boxShadow: `0 0 ${glowIntensity}px ${pointer.color}60`,
        }}
      >
        {pointer.label}
      </div>

      {/* Arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          ...(isTop
            ? { borderTop: `14px solid ${pointer.color}` }
            : { borderBottom: `14px solid ${pointer.color}` }),
          order: isTop ? 1 : 0,
          filter: `drop-shadow(0 0 ${glowIntensity}px ${pointer.color}60)`,
        }}
      />
    </div>
  );
};

export default ArrayWithState;
