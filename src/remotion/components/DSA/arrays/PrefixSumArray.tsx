import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';

interface PrefixSumArrayProps {
  values: number[];
  prefixSums?: number[];
  queryRange?: [number, number];
  showOriginal?: boolean;
  showFormula?: boolean;
  highlightBuildStep?: number;
  cellSize?: 'small' | 'medium' | 'large';
  title?: string;
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const PrefixSumArray: React.FC<PrefixSumArrayProps> = ({
  values,
  prefixSums: providedPrefixSums,
  queryRange,
  showOriginal = true,
  showFormula = true,
  highlightBuildStep,
  cellSize = 'medium',
  title,
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Size configurations
  const sizeConfig = {
    small: { width: 45, height: 45, fontSize: 16, gap: 6 },
    medium: { width: 55, height: 55, fontSize: 18, gap: 8 },
    large: { width: 70, height: 70, fontSize: 22, gap: 10 },
  }[cellSize];

  // Calculate prefix sums if not provided
  const prefixSums = providedPrefixSums || (() => {
    const result = [0];
    for (let i = 0; i < values.length; i++) {
      result.push(result[i] + values[i]);
    }
    return result;
  })();

  // Calculate range sum if query range is provided
  const rangeSum = queryRange
    ? prefixSums[queryRange[1] + 1] - prefixSums[queryRange[0]]
    : null;

  // Animation progress
  const getAnimProgress = (index: number, delay: number = 0) => {
    return spring({
      frame: frame - animationStartFrame - index * 3 - delay,
      fps,
      config: DSA_SPRINGS.smooth,
    });
  };

  // Check if index is in query range
  const isInRange = (index: number) => {
    if (!queryRange) return false;
    return index >= queryRange[0] && index <= queryRange[1];
  };

  // Check if building this step
  const isBuildingStep = (index: number) => {
    return highlightBuildStep !== undefined && index === highlightBuildStep;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        ...style,
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

      {/* Original array */}
      {showOriginal && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              fontSize: 14,
              color: DSA_COLORS.ui.textMuted,
              fontWeight: 600,
            }}
          >
            Original Array
          </div>
          <div style={{ display: 'flex', gap: sizeConfig.gap }}>
            {values.map((value, index) => {
              const progress = getAnimProgress(index);
              const inRange = isInRange(index);
              const building = isBuildingStep(index);

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: `scale(${progress})`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      width: sizeConfig.width,
                      height: sizeConfig.height,
                      borderRadius: 8,
                      border: `2px solid ${
                        building
                          ? DSA_COLORS.cell.current
                          : inRange
                          ? DSA_COLORS.cell.window
                          : DSA_COLORS.ui.border
                      }`,
                      background: inRange
                        ? `${DSA_COLORS.cell.current}40`
                        : DSA_COLORS.cell.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: sizeConfig.fontSize,
                      fontWeight: 600,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DSA_COLORS.cell.text,
                      boxShadow: building
                        ? `0 0 15px ${DSA_COLORS.cell.current}60`
                        : 'none',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
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
          </div>
        </div>
      )}

      {/* Arrow connecting arrays */}
      {showOriginal && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: DSA_COLORS.ui.textMuted,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
          </svg>
          <span style={{ fontSize: 14 }}>Build Prefix Sum</span>
        </div>
      )}

      {/* Prefix sum array */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            fontSize: 14,
            color: DSA_COLORS.syntax.function,
            fontWeight: 600,
          }}
        >
          Prefix Sum Array
        </div>
        <div style={{ display: 'flex', gap: sizeConfig.gap }}>
          {prefixSums.map((sum, index) => {
            const progress = getAnimProgress(index, values.length * 3);
            const isQueryLeft = queryRange && index === queryRange[0];
            const isQueryRight = queryRange && index === queryRange[1] + 1;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: `scale(${progress})`,
                  opacity: progress,
                }}
              >
                {/* Query markers */}
                {(isQueryLeft || isQueryRight) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -28,
                      fontSize: 12,
                      fontWeight: 700,
                      color: isQueryRight
                        ? DSA_COLORS.cell.sorted
                        : DSA_COLORS.cell.swapping,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isQueryLeft ? `P[${queryRange[0]}]` : `P[${queryRange[1] + 1}]`}
                  </div>
                )}

                <div
                  style={{
                    position: 'relative',
                    width: sizeConfig.width,
                    height: sizeConfig.height,
                    borderRadius: 8,
                    border: `2px solid ${
                      isQueryLeft || isQueryRight
                        ? isQueryRight
                          ? DSA_COLORS.cell.sorted
                          : DSA_COLORS.cell.swapping
                        : DSA_COLORS.syntax.function
                    }`,
                    background: isQueryLeft || isQueryRight
                      ? isQueryRight
                        ? `${DSA_COLORS.cell.sorted}30`
                        : `${DSA_COLORS.cell.swapping}30`
                      : `${DSA_COLORS.syntax.function}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: sizeConfig.fontSize,
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: DSA_COLORS.cell.text,
                    boxShadow: isQueryLeft || isQueryRight
                      ? `0 0 12px ${
                          isQueryRight
                            ? DSA_COLORS.cell.sorted
                            : DSA_COLORS.cell.swapping
                        }50`
                      : 'none',
                  }}
                >
                  {sum}
                </div>
                <div
                  style={{
                    marginTop: 4,
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
        </div>
      </div>

      {/* Formula and result */}
      {showFormula && queryRange && rangeSum !== null && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            padding: '16px 24px',
            background: DSA_COLORS.ui.card,
            borderRadius: 12,
            border: `1px solid ${DSA_COLORS.ui.border}`,
          }}
        >
          {/* Formula */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 16,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span style={{ color: DSA_COLORS.ui.textMuted }}>
              sum({queryRange[0]}, {queryRange[1]}) =
            </span>
            <span style={{ color: DSA_COLORS.cell.sorted }}>
              P[{queryRange[1] + 1}]
            </span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>-</span>
            <span style={{ color: DSA_COLORS.cell.swapping }}>
              P[{queryRange[0]}]
            </span>
          </div>

          {/* Calculation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 18,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span style={{ color: DSA_COLORS.ui.textMuted }}>=</span>
            <span style={{ color: DSA_COLORS.cell.sorted }}>
              {prefixSums[queryRange[1] + 1]}
            </span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>-</span>
            <span style={{ color: DSA_COLORS.cell.swapping }}>
              {prefixSums[queryRange[0]]}
            </span>
            <span style={{ color: DSA_COLORS.ui.textMuted }}>=</span>
            <span
              style={{
                color: DSA_COLORS.syntax.function,
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {rangeSum}
            </span>
          </div>

          {/* Complexity note */}
          <div
            style={{
              fontSize: 12,
              color: DSA_COLORS.ui.textMuted,
              marginTop: 4,
            }}
          >
            O(1) query time after O(n) preprocessing
          </div>
        </div>
      )}
    </div>
  );
};

export default PrefixSumArray;
