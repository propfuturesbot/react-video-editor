// @ts-nocheck
import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS } from '../constants';

interface BitArrayProps {
  bits: (0 | 1)[];
  highlightIndices?: number[];
  flipAnimation?: { index: number; frame: number };
  showDecimal?: boolean;
  showBinary?: boolean;
  groupSize?: number;
  bitSize?: 'small' | 'medium' | 'large';
  title?: string;
  labels?: { index: number; text: string; color?: string }[];
  animationStartFrame?: number;
  style?: React.CSSProperties;
}

export const BitArray: React.FC<BitArrayProps> = ({
  bits,
  highlightIndices = [],
  flipAnimation,
  showDecimal = true,
  showBinary = false,
  groupSize = 4,
  bitSize = 'medium',
  title,
  labels = [],
  animationStartFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Size configurations
  const sizeConfig = {
    small: { width: 30, height: 30, fontSize: 14, gap: 3 },
    medium: { width: 40, height: 40, fontSize: 18, gap: 4 },
    large: { width: 50, height: 50, fontSize: 22, gap: 6 },
  }[bitSize];

  // Calculate decimal value
  const decimalValue = bits.reduce((acc, bit, index) => {
    return acc + bit * Math.pow(2, bits.length - 1 - index);
  }, 0);

  // Animation progress for each bit
  const getAnimProgress = (index: number) => {
    return spring({
      frame: frame - animationStartFrame - index * 2,
      fps,
      config: DSA_SPRINGS.bouncy,
    });
  };

  // Flip animation for a specific bit
  const getFlipTransform = (index: number) => {
    if (!flipAnimation || flipAnimation.index !== index) {
      return { rotateY: 0, scale: 1 };
    }

    const flipDuration = 15;
    const elapsed = frame - flipAnimation.frame;

    if (elapsed < 0 || elapsed > flipDuration) {
      return { rotateY: 0, scale: 1 };
    }

    const rotateY = interpolate(
      elapsed,
      [0, flipDuration / 2, flipDuration],
      [0, 90, 0],
      { extrapolateRight: 'clamp' }
    );

    const scale = interpolate(
      elapsed,
      [0, flipDuration / 2, flipDuration],
      [1, 1.2, 1],
      { extrapolateRight: 'clamp' }
    );

    return { rotateY, scale };
  };

  // Group bits for visual separation
  const groupedBits: (0 | 1)[][] = [];
  for (let i = 0; i < bits.length; i += groupSize) {
    groupedBits.push(bits.slice(i, i + groupSize));
  }

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

      {/* Bits container */}
      <div style={{ display: 'flex', gap: sizeConfig.gap * 3 }}>
        {groupedBits.map((group, groupIndex) => (
          <div
            key={groupIndex}
            style={{
              display: 'flex',
              gap: sizeConfig.gap,
            }}
          >
            {group.map((bit, bitIndex) => {
              const globalIndex = groupIndex * groupSize + bitIndex;
              const isHighlighted = highlightIndices.includes(globalIndex);
              const progress = getAnimProgress(globalIndex);
              const flipTransform = getFlipTransform(globalIndex);
              const label = labels.find(l => l.index === globalIndex);

              // Power of 2 label
              const power = bits.length - 1 - globalIndex;

              return (
                <div
                  key={bitIndex}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Custom label */}
                  {label && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -24,
                        fontSize: 11,
                        fontWeight: 600,
                        color: label.color || DSA_COLORS.ui.text,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label.text}
                    </div>
                  )}

                  {/* Bit cell */}
                  <div
                    style={{
                      width: sizeConfig.width,
                      height: sizeConfig.height,
                      borderRadius: 6,
                      border: `2px solid ${
                        isHighlighted
                          ? DSA_COLORS.cell.current
                          : bit === 1
                          ? DSA_COLORS.cell.sorted
                          : DSA_COLORS.ui.border
                      }`,
                      background:
                        bit === 1
                          ? isHighlighted
                            ? DSA_COLORS.cell.current
                            : DSA_COLORS.cell.sorted
                          : DSA_COLORS.cell.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: sizeConfig.fontSize,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DSA_COLORS.cell.text,
                      transform: `scale(${progress * flipTransform.scale}) perspective(200px) rotateY(${flipTransform.rotateY}deg)`,
                      opacity: progress,
                      boxShadow: isHighlighted
                        ? `0 0 12px ${DSA_COLORS.cell.current}60`
                        : 'none',
                    }}
                  >
                    {bit}
                  </div>

                  {/* Power of 2 label */}
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      color: DSA_COLORS.ui.textMuted,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    2<sup>{power}</sup>
                  </div>

                  {/* Index */}
                  <div
                    style={{
                      fontSize: 9,
                      color: DSA_COLORS.ui.textMuted,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    [{globalIndex}]
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Values display */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 20,
          alignItems: 'center',
        }}
      >
        {showBinary && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: DSA_COLORS.ui.card,
              borderRadius: 8,
              border: `1px solid ${DSA_COLORS.ui.border}`,
            }}
          >
            <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
              Binary:
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: DSA_COLORS.syntax.string,
              }}
            >
              0b{bits.join('')}
            </span>
          </div>
        )}

        {showDecimal && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: DSA_COLORS.ui.card,
              borderRadius: 8,
              border: `1px solid ${DSA_COLORS.ui.border}`,
            }}
          >
            <span style={{ fontSize: 14, color: DSA_COLORS.ui.textMuted }}>
              Decimal:
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: DSA_COLORS.syntax.number,
              }}
            >
              {decimalValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BitArray;
