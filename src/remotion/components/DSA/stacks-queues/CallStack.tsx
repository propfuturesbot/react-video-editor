// @ts-nocheck
/**
 * CallStack Component
 *
 * Visualizes function call stack for recursion visualization.
 * Shows function frames with parameters, local variables, and return values.
 */

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';

type PrimitiveValue = string | number | boolean | null | undefined;
type SerializableValue = PrimitiveValue | SerializableValue[] | { [key: string]: SerializableValue };

interface StackFrame {
  functionName: string;
  params?: Record<string, SerializableValue>;
  localVars?: Record<string, SerializableValue>;
  returnValue?: SerializableValue;
  state: 'active' | 'waiting' | 'returned' | 'error';
  line?: number;
}

export interface CallStackProps {
  frames: StackFrame[];
  title?: string;
  maxDepth?: number;
  highlightFrame?: number;
  showReturnValues?: boolean;
  showLocalVars?: boolean;
  animateExecution?: boolean;
  frameWidth?: number;
  frameHeight?: number;
  animationDelay?: number;
}

export const CallStack: React.FC<CallStackProps> = ({
  frames,
  title = 'Call Stack',
  maxDepth = 6,
  highlightFrame,
  showReturnValues = true,
  showLocalVars = true,
  animateExecution = true,
  frameWidth = 280,
  frameHeight = 80,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  // Visible frames (limited by maxDepth)
  const visibleFrames = frames.slice(-maxDepth);
  const hiddenCount = Math.max(0, frames.length - maxDepth);

  // Container dimensions
  const containerWidth = frameWidth + 80;
  const containerHeight = maxDepth * (frameHeight + 10) + 60;

  // Get frame color based on state
  const getFrameColor = (state: StackFrame['state']) => {
    switch (state) {
      case 'active':
        return DSA_COLORS.pointer.primary;
      case 'waiting':
        return DSA_COLORS.cell.default;
      case 'returned':
        return DSA_COLORS.cell.success;
      case 'error':
        return DSA_COLORS.cell.error;
      default:
        return DSA_COLORS.cell.default;
    }
  };

  // Get frame position (stack grows upward)
  const getFramePosition = (index: number) => ({
    x: 40,
    y: containerHeight - 40 - (index + 1) * (frameHeight + 10),
  });

  // Format params for display
  const formatParams = (params?: Record<string, SerializableValue>) => {
    if (!params) return '';
    return Object.entries(params)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ');
  };

  // Render a single frame
  const renderFrame = (stackFrame: StackFrame, index: number) => {
    const isTop = index === visibleFrames.length - 1;
    const isHighlighted = highlightFrame === index;
    const pos = getFramePosition(index);

    const frameProgress = spring({
      frame: animatedFrame - index * DSA_TIMING.stagger,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    const pulseScale = isTop && animateExecution
      ? 1 + Math.sin((animatedFrame / fps) * Math.PI * 2) * 0.015
      : 1;

    const frameColor = getFrameColor(stackFrame.state);

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: frameWidth,
          minHeight: frameHeight,
          padding: 12,
          backgroundColor: stackFrame.state === 'active'
            ? `${frameColor}20`
            : DSA_COLORS.cell.default,
          border: `2px solid ${frameColor}`,
          borderRadius: 8,
          transform: `scale(${frameProgress * pulseScale})`,
          opacity: frameProgress,
          boxShadow: isTop || isHighlighted
            ? `0 0 20px ${frameColor}40`
            : 'none',
        }}
      >
        {/* Frame number */}
        <div
          style={{
            position: 'absolute',
            left: -30,
            top: frameHeight / 2 - 10,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: frameColor,
            color: '#fff',
            borderRadius: '50%',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {index}
        </div>

        {/* Function name and params */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 600,
              color: DSA_COLORS.syntax.function,
            }}
          >
            {stackFrame.functionName}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: DSA_COLORS.ui.textMuted,
            }}
          >
            ({formatParams(stackFrame.params)})
          </span>
        </div>

        {/* Local variables */}
        {showLocalVars && stackFrame.localVars && Object.keys(stackFrame.localVars).length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 8,
            }}
          >
            {Object.entries(stackFrame.localVars).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '2px 6px',
                  backgroundColor: `${DSA_COLORS.pointer.secondary}20`,
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: DSA_COLORS.ui.text,
                }}
              >
                <span style={{ color: DSA_COLORS.syntax.variable }}>{key}</span>
                <span style={{ color: DSA_COLORS.ui.textMuted }}>=</span>
                <span style={{ color: DSA_COLORS.syntax.number }}>{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Return value */}
        {showReturnValues && stackFrame.state === 'returned' && stackFrame.returnValue !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: DSA_COLORS.cell.success,
                fontFamily: 'monospace',
              }}
            >
              return:
            </span>
            <span
              style={{
                padding: '2px 6px',
                backgroundColor: `${DSA_COLORS.cell.success}20`,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'monospace',
                color: DSA_COLORS.cell.success,
              }}
            >
              {JSON.stringify(stackFrame.returnValue)}
            </span>
          </div>
        )}

        {/* State indicator */}
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            padding: '2px 6px',
            backgroundColor: frameColor,
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 600,
            color: '#fff',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          {stackFrame.state}
        </div>

        {/* Line number if provided */}
        {stackFrame.line !== undefined && (
          <div
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              fontSize: 10,
              color: DSA_COLORS.ui.textMuted,
              fontFamily: 'monospace',
            }}
          >
            line {stackFrame.line}
          </div>
        )}
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

      {/* Stack depth indicator */}
      <div
        style={{
          marginBottom: 10,
          padding: '4px 12px',
          borderRadius: 4,
          backgroundColor: frames.length >= maxDepth
            ? `${DSA_COLORS.cell.error}20`
            : DSA_COLORS.ui.cardBg,
          border: `1px solid ${
            frames.length >= maxDepth
              ? DSA_COLORS.cell.error
              : DSA_COLORS.ui.border
          }`,
          fontSize: 12,
          color: frames.length >= maxDepth
            ? DSA_COLORS.cell.error
            : DSA_COLORS.ui.textMuted,
          fontFamily: 'monospace',
        }}
      >
        Depth: {frames.length} / {maxDepth}
        {frames.length >= maxDepth && ' (Max reached!)'}
      </div>

      {/* Container */}
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
        {/* Stack direction indicator */}
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 11,
            color: DSA_COLORS.ui.textMuted,
            fontFamily: 'monospace',
            writingMode: 'vertical-lr',
            textOrientation: 'mixed',
          }}
        >
          &#8593; grows
        </div>

        {/* Hidden frames indicator */}
        {hiddenCount > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 40,
              bottom: 10,
              fontSize: 11,
              color: DSA_COLORS.ui.textMuted,
              fontFamily: 'monospace',
            }}
          >
            ... +{hiddenCount} deeper frames
          </div>
        )}

        {/* Stack frames */}
        {visibleFrames.map((f, index) => renderFrame(f, index))}

        {/* Empty stack message */}
        {frames.length === 0 && (
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
            No active calls
          </div>
        )}
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
        {['active', 'waiting', 'returned'].map((state) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: getFrameColor(state as StackFrame['state']),
              }}
            />
            <span style={{ color: DSA_COLORS.ui.textMuted, textTransform: 'capitalize' }}>
              {state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallStack;
