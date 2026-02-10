import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING, SORTING_INFO } from '../constants';
import { SortingAlgorithm, SortingAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, useStepAnnotation } from '../hooks';

interface SortingVisualizerProps extends DSAStepsProps<SortingAnimationStep> {
  values: number[];
  algorithm?: SortingAlgorithm;
  step?: number;

  // Visual state
  comparing?: [number, number];
  swapping?: [number, number];
  sorted?: number[];
  pivot?: number;
  minIndex?: number;
  insertPosition?: number;
  mergeRanges?: [number, number][];
  partitionBoundary?: number;

  // Stats
  comparisons?: number;
  swaps?: number;
  arrayAccesses?: number;

  // Display options
  style?: 'bars' | 'circles' | 'numbers';
  showStats?: boolean;
  showAlgorithmInfo?: boolean;
  showIndices?: boolean;
  showValues?: boolean;
  barWidth?: number;
  maxHeight?: number;
  title?: string;

  // Animation
  animationStartFrame?: number;
  swapFrame?: number;
  animateSwap?: boolean;

  styleOverrides?: React.CSSProperties;
}

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({
  values: staticValues,
  algorithm = 'bubble',
  step: staticStep,
  comparing: staticComparing,
  swapping: staticSwapping,
  sorted: staticSorted = [],
  pivot: staticPivot,
  minIndex: staticMinIndex,
  insertPosition: staticInsertPosition,
  mergeRanges: staticMergeRanges = [],
  partitionBoundary: staticPartitionBoundary,
  comparisons = 0,
  swaps = 0,
  arrayAccesses = 0,
  style: displayStyle = 'bars',
  showStats = true,
  showAlgorithmInfo = true,
  showIndices = true,
  showValues = true,
  barWidth = 40,
  maxHeight = 200,
  title,
  animationStartFrame = 0,
  swapFrame,
  animateSwap = true,
  styleOverrides,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: SortingAnimationStep = useMemo(() => ({
    array: staticValues.map(v => v),
    comparing: staticComparing,
    swapping: staticSwapping,
    sorted: staticSorted,
    pivot: staticPivot,
    minIndex: staticMinIndex,
    insertPosition: staticInsertPosition,
    mergeRanges: staticMergeRanges,
  }), [staticValues, staticComparing, staticSwapping, staticSorted, staticPivot, staticMinIndex, staticInsertPosition, staticMergeRanges]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame }
  );

  const { currentState, stepIndex, stepProgress } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const values = useMemo(() => {
    if (animationSteps && currentState.array) {
      // Convert any string values to numbers
      return currentState.array.map(v => typeof v === 'string' ? parseInt(v, 10) || 0 : v) as number[];
    }
    return staticValues;
  }, [animationSteps, currentState.array, staticValues]);

  const comparing = currentState.comparing ?? staticComparing;
  const swapping = currentState.swapping ?? staticSwapping;
  const sorted = currentState.sorted ?? staticSorted;
  const pivot = currentState.pivot ?? staticPivot;
  const minIndex = currentState.minIndex ?? staticMinIndex;
  const insertPosition = currentState.insertPosition ?? staticInsertPosition;
  const mergeRanges = currentState.mergeRanges ?? staticMergeRanges;
  const partitionBoundary = currentState.partitionBoundaries?.low ?? staticPartitionBoundary;
  const step = animationSteps ? stepIndex + 1 : staticStep;

  const maxValue = Math.max(...values);
  const gap = 4;

  // Animation progress for initial entrance
  const getEntranceProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 2,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Swap animation
  const getSwapOffset = (index: number) => {
    if (!swapping || !animateSwap || swapFrame === undefined) {
      return 0;
    }

    const [i, j] = swapping;
    if (index !== i && index !== j) return 0;

    const distance = (j - i) * (barWidth + gap);
    const progress = spring({
      frame: frame - swapFrame,
      fps,
      config: DSA_SPRINGS.snappy,
    });

    if (index === i) return progress * distance;
    if (index === j) return -progress * distance;
    return 0;
  };

  // Get color for a bar
  const getBarColor = (index: number): string => {
    if (sorted.includes(index)) return DSA_COLORS.cell.sorted;
    if (swapping && (swapping[0] === index || swapping[1] === index)) {
      return DSA_COLORS.cell.swapping;
    }
    if (comparing && (comparing[0] === index || comparing[1] === index)) {
      return DSA_COLORS.cell.comparing;
    }
    if (pivot === index) return DSA_COLORS.cell.pivot;
    if (minIndex === index) return DSA_COLORS.cell.current;
    if (insertPosition === index) return DSA_COLORS.cell.window;

    // Check if in merge range
    for (const [start, end] of mergeRanges) {
      if (index >= start && index <= end) {
        return `${DSA_COLORS.cell.window}80`;
      }
    }

    return DSA_COLORS.cell.default;
  };

  // Get glow effect for comparing/swapping
  const getGlowEffect = (index: number): string => {
    if (swapping && (swapping[0] === index || swapping[1] === index)) {
      return `0 0 20px ${DSA_COLORS.cell.swapping}60`;
    }
    if (comparing && (comparing[0] === index || comparing[1] === index)) {
      return `0 0 15px ${DSA_COLORS.cell.comparing}50`;
    }
    if (pivot === index) {
      return `0 0 15px ${DSA_COLORS.cell.pivot}50`;
    }
    return 'none';
  };

  // Algorithm info
  const algoInfo = SORTING_INFO[algorithm];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        ...styleOverrides,
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: DSA_COLORS.ui.text,
          }}
        >
          {title}
        </div>
      )}

      {/* Step Annotation */}
      {annotationText && (
        <div
          style={{
            fontSize: 18,
            color: DSA_COLORS.ui.text,
            padding: '8px 16px',
            background: DSA_COLORS.ui.card,
            borderRadius: 8,
            opacity: annotationOpacity,
          }}
        >
          {annotationText}
        </div>
      )}

      {/* Algorithm info */}
      {showAlgorithmInfo && algoInfo && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '10px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 10,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: DSA_COLORS.ui.text,
              }}
            >
              {algoInfo.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: DSA_COLORS.ui.textMuted,
              }}
            >
              {algoInfo.type}
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              background: DSA_COLORS.ui.border,
            }}
          />
          <ComplexityBadge
            label="Time"
            value={algoInfo.time.average}
            color={getComplexityColor(algoInfo.time.average)}
          />
          <ComplexityBadge
            label="Space"
            value={algoInfo.space}
            color={getComplexityColor(algoInfo.space)}
          />
          {algoInfo.stable && (
            <div
              style={{
                padding: '4px 10px',
                background: `${DSA_COLORS.ui.success}20`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: DSA_COLORS.ui.success,
              }}
            >
              Stable
            </div>
          )}
        </div>
      )}

      {/* Bars visualization */}
      <div style={{ position: 'relative' }}>
        {/* Partition boundary line */}
        {partitionBoundary !== undefined && (
          <div
            style={{
              position: 'absolute',
              left: partitionBoundary * (barWidth + gap) + barWidth + gap / 2,
              top: -10,
              width: 2,
              height: maxHeight + 40,
              background: DSA_COLORS.cell.pivot,
              opacity: 0.6,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 11,
                fontWeight: 600,
                color: DSA_COLORS.cell.pivot,
                whiteSpace: 'nowrap',
              }}
            >
              Boundary
            </div>
          </div>
        )}

        {/* Bars container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap,
            height: maxHeight + 30,
            paddingTop: 20,
          }}
        >
          {values.map((value, index) => {
            const height = (value / maxValue) * maxHeight;
            const progress = getEntranceProgress(index);
            const swapOffset = getSwapOffset(index);
            const color = getBarColor(index);
            const glow = getGlowEffect(index);

            return (
              <div
                key={index}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Value label on top */}
                {showValues && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -22,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DSA_COLORS.ui.text,
                      opacity: progress,
                    }}
                  >
                    {value}
                  </div>
                )}

                {/* Bar */}
                {displayStyle === 'bars' && (
                  <div
                    style={{
                      width: barWidth,
                      height: height * progress,
                      background: color,
                      borderRadius: '6px 6px 0 0',
                      transform: `translateX(${swapOffset}px)`,
                      boxShadow: glow,
                      transition: 'background 0.2s ease',
                    }}
                  />
                )}

                {/* Circle style */}
                {displayStyle === 'circles' && (
                  <div
                    style={{
                      width: barWidth,
                      height: barWidth,
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `translateX(${swapOffset}px) scale(${progress})`,
                      boxShadow: glow,
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DSA_COLORS.cell.text,
                    }}
                  >
                    {value}
                  </div>
                )}

                {/* Numbers style */}
                {displayStyle === 'numbers' && (
                  <div
                    style={{
                      width: barWidth,
                      height: barWidth,
                      borderRadius: 8,
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `translateX(${swapOffset}px) scale(${progress})`,
                      boxShadow: glow,
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DSA_COLORS.cell.text,
                    }}
                  >
                    {value}
                  </div>
                )}

                {/* Index label */}
                {showIndices && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: DSA_COLORS.ui.textMuted,
                      fontFamily: 'JetBrains Mono, monospace',
                      opacity: progress,
                    }}
                  >
                    {index}
                  </div>
                )}

                {/* Special markers */}
                {pivot === index && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -28,
                      fontSize: 11,
                      fontWeight: 700,
                      color: DSA_COLORS.cell.pivot,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pivot
                  </div>
                )}
                {minIndex === index && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -28,
                      fontSize: 11,
                      fontWeight: 700,
                      color: DSA_COLORS.cell.current,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Min
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison arrows */}
        {comparing && (
          <ComparisonArrows
            indices={comparing}
            barWidth={barWidth}
            gap={gap}
            maxHeight={maxHeight}
          />
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <LegendItem color={DSA_COLORS.cell.comparing} label="Comparing" />
        <LegendItem color={DSA_COLORS.cell.swapping} label="Swapping" />
        <LegendItem color={DSA_COLORS.cell.sorted} label="Sorted" />
        <LegendItem color={DSA_COLORS.cell.pivot} label="Pivot" />
      </div>

      {/* Statistics */}
      {showStats && (
        <div
          style={{
            display: 'flex',
            gap: 20,
            padding: '12px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 10,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          <StatCounter label="Comparisons" value={comparisons} icon="⚖️" />
          <div
            style={{
              width: 1,
              height: 40,
              background: DSA_COLORS.ui.border,
            }}
          />
          <StatCounter label="Swaps" value={swaps} icon="🔄" />
          {arrayAccesses > 0 && (
            <>
              <div
                style={{
                  width: 1,
                  height: 40,
                  background: DSA_COLORS.ui.border,
                }}
              />
              <StatCounter label="Array Accesses" value={arrayAccesses} icon="📊" />
            </>
          )}
          {step !== undefined && (
            <>
              <div
                style={{
                  width: 1,
                  height: 40,
                  background: DSA_COLORS.ui.border,
                }}
              />
              <StatCounter label="Step" value={step} icon="👣" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Sub-components
// ============================================

interface ComplexityBadgeProps {
  label: string;
  value: string;
  color: string;
}

const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div
      style={{
        fontSize: 11,
        color: DSA_COLORS.ui.textMuted,
        marginBottom: 2,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        color,
      }}
    >
      {value}
    </div>
  </div>
);

interface LegendItemProps {
  color: string;
  label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        background: color,
      }}
    />
    <span style={{ fontSize: 12, color: DSA_COLORS.ui.textMuted }}>
      {label}
    </span>
  </div>
);

interface StatCounterProps {
  label: string;
  value: number;
  icon?: string;
}

const StatCounter: React.FC<StatCounterProps> = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    <div>
      <div
        style={{
          fontSize: 11,
          color: DSA_COLORS.ui.textMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          color: DSA_COLORS.syntax.number,
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

interface ComparisonArrowsProps {
  indices: [number, number];
  barWidth: number;
  gap: number;
  maxHeight: number;
}

const ComparisonArrows: React.FC<ComparisonArrowsProps> = ({
  indices,
  barWidth,
  gap,
  maxHeight,
}) => {
  const [i, j] = indices;
  const leftX = i * (barWidth + gap) + barWidth / 2;
  const rightX = j * (barWidth + gap) + barWidth / 2;
  const arcY = maxHeight + 50;

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: maxHeight + 80,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Curved line connecting compared elements */}
      <path
        d={`M ${leftX} ${arcY} Q ${(leftX + rightX) / 2} ${arcY + 25} ${rightX} ${arcY}`}
        fill="none"
        stroke={DSA_COLORS.cell.comparing}
        strokeWidth={2}
        strokeDasharray="5,3"
        opacity={0.8}
      />
      {/* Comparison symbol */}
      <text
        x={(leftX + rightX) / 2}
        y={arcY + 35}
        textAnchor="middle"
        fill={DSA_COLORS.cell.comparing}
        fontSize={14}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        ⚖️
      </text>
    </svg>
  );
};

// Helper function to get complexity color
const getComplexityColor = (complexity: string): string => {
  const colors: Record<string, string> = {
    'O(1)': '#22c55e',
    'O(log n)': '#84cc16',
    'O(n)': '#eab308',
    'O(n log n)': '#f97316',
    'O(n²)': '#ef4444',
    'O(n³)': '#dc2626',
    'O(2^n)': '#991b1b',
    'O(n!)': '#7f1d1d',
  };
  return colors[complexity] || DSA_COLORS.ui.text;
};

export default SortingVisualizer;
