// @ts-nocheck
/**
 * HashTable Component
 *
 * Visualizes a hash table with buckets, collision handling, and hash function.
 * Supports chaining and open addressing collision resolution strategies.
 * Supports animation steps for frame-by-frame state changes.
 */

import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DSA_COLORS, DSA_SPRINGS, DSA_TIMING } from '../constants';
import { HashTableAnimationStep, DSAStepsProps } from '../types';
import { useDSAStepAnimation, useStepAnnotation } from '../hooks';

type HashValue = string | number | boolean | null | undefined;

interface HashEntry {
  key: string | number;
  value: HashValue;
}

interface HashBucket {
  index: number;
  entries: HashEntry[];
  state?: 'empty' | 'occupied' | 'deleted' | 'probing';
  probeSequence?: number[];
}

interface HashOperation {
  type: 'insert' | 'lookup' | 'delete';
  key: string | number;
  value?: HashValue;
  hashValue?: number;
  steps?: number[];
}

export interface HashTableProps extends DSAStepsProps<HashTableAnimationStep> {
  buckets: HashBucket[];
  size: number;
  title?: string;
  hashFunction?: string;
  collisionStrategy?: 'chaining' | 'linear' | 'quadratic' | 'double';
  operation?: HashOperation;
  showLoadFactor?: boolean;
  showHashComputation?: boolean;
  highlightBucket?: number;
  bucketWidth?: number;
  bucketHeight?: number;
  maxEntriesPerBucket?: number;
  animationDelay?: number;
}

export const HashTable: React.FC<HashTableProps> = ({
  buckets,
  size,
  title = 'Hash Table',
  hashFunction = 'h(k) = k mod m',
  collisionStrategy = 'chaining',
  operation: staticOperation,
  showLoadFactor = true,
  showHashComputation = true,
  highlightBucket: staticHighlightBucket,
  bucketWidth = 100,
  bucketHeight = 50,
  maxEntriesPerBucket = 3,
  animationDelay = 0,
  // Animation steps props
  animationSteps,
  stepDurationFrames = 45,
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create static state for fallback
  const staticState: HashTableAnimationStep = useMemo(() => ({
    highlightBucket: staticHighlightBucket,
    operation: staticOperation?.type,
    key: staticOperation?.key,
    computedHash: staticOperation?.hashValue,
    probingSequence: staticOperation?.steps,
  }), [staticHighlightBucket, staticOperation]);

  // Use step animation hook
  const stepAnimation = useDSAStepAnimation(
    animationSteps,
    staticState,
    { stepDurationFrames, animationStartFrame: animationStartFrame || animationDelay }
  );

  const { currentState } = stepAnimation;
  const { text: annotationText, opacity: annotationOpacity } = useStepAnnotation(stepAnimation);

  // Derive values from animation state
  const highlightBucket = currentState.highlightBucket ?? staticHighlightBucket;
  const operation = staticOperation || (currentState.operation ? {
    type: currentState.operation,
    key: currentState.key!,
    hashValue: currentState.computedHash,
    steps: currentState.probingSequence,
  } : undefined);

  const animatedFrame = Math.max(0, frame - animationDelay);

  const containerProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.smooth,
  });

  const operationProgress = spring({
    frame: animatedFrame,
    fps,
    config: DSA_SPRINGS.bouncy,
  });

  // Calculate load factor
  const occupiedBuckets = buckets.filter(b => b.entries.length > 0).length;
  const totalEntries = buckets.reduce((sum, b) => sum + b.entries.length, 0);
  const loadFactor = totalEntries / size;

  // Container dimensions
  const containerWidth = size * (bucketWidth + 10) + 60;
  const containerHeight = bucketHeight * maxEntriesPerBucket + 150;

  // Get bucket position
  const getBucketPosition = (index: number) => ({
    x: 30 + index * (bucketWidth + 10),
    y: 100,
  });

  // Render hash function visualization
  const renderHashFunction = () => {
    if (!showHashComputation || !operation) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          padding: '10px 20px',
          backgroundColor: DSA_COLORS.ui.cardBg,
          border: `2px solid ${DSA_COLORS.pointer.primary}`,
          borderRadius: 8,
          opacity: operationProgress,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            color: DSA_COLORS.ui.text,
          }}
        >
          {hashFunction}
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            color: DSA_COLORS.ui.textMuted,
          }}
        >
          &#8594;
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 600,
            color: DSA_COLORS.pointer.primary,
          }}
        >
          h({operation.key}) = {operation.hashValue !== undefined ? operation.hashValue : '?'}
        </span>
      </div>
    );
  };

  // Render a single bucket
  const renderBucket = (bucket: HashBucket) => {
    const pos = getBucketPosition(bucket.index);
    const isHighlighted = highlightBucket === bucket.index ||
      (operation && operation.hashValue === bucket.index);
    const isProbing = bucket.state === 'probing' ||
      (operation?.steps?.includes(bucket.index));

    const bucketProgress = spring({
      frame: animatedFrame - bucket.index * DSA_TIMING.stagger,
      fps,
      config: DSA_SPRINGS.smooth,
    });

    const pulseScale = isHighlighted
      ? 1 + Math.sin((animatedFrame / fps) * Math.PI * 3) * 0.03
      : 1;

    // Bucket color based on state
    const getBucketColor = () => {
      if (isHighlighted) return DSA_COLORS.pointer.primary;
      if (isProbing) return DSA_COLORS.pointer.secondary;
      if (bucket.state === 'deleted') return DSA_COLORS.cell.error;
      if (bucket.entries.length > 0) return DSA_COLORS.cell.visited;
      return DSA_COLORS.cell.default;
    };

    return (
      <div
        key={bucket.index}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: bucketWidth,
          opacity: bucketProgress,
          transform: `scale(${bucketProgress * pulseScale})`,
        }}
      >
        {/* Index label */}
        <div
          style={{
            marginBottom: 5,
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: isHighlighted ? DSA_COLORS.pointer.primary : DSA_COLORS.ui.textMuted,
            fontFamily: 'monospace',
          }}
        >
          [{bucket.index}]
        </div>

        {/* Bucket container */}
        <div
          style={{
            minHeight: bucketHeight,
            backgroundColor: getBucketColor(),
            border: `2px solid ${isHighlighted ? DSA_COLORS.pointer.primary : DSA_COLORS.ui.border}`,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isHighlighted
              ? `0 0 15px ${DSA_COLORS.pointer.primary}40`
              : 'none',
            overflow: 'hidden',
          }}
        >
          {bucket.entries.length === 0 ? (
            <span
              style={{
                fontSize: 11,
                color: DSA_COLORS.ui.textMuted,
                fontFamily: 'monospace',
              }}
            >
              empty
            </span>
          ) : (
            bucket.entries.slice(0, maxEntriesPerBucket).map((entry, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: idx === 0 && isHighlighted
                    ? DSA_COLORS.pointer.primary
                    : 'transparent',
                  borderBottom: idx < bucket.entries.length - 1
                    ? `1px solid ${DSA_COLORS.ui.border}`
                    : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: idx === 0 && isHighlighted ? '#fff' : DSA_COLORS.ui.text,
                  }}
                >
                  {entry.key}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: idx === 0 && isHighlighted ? '#fff' : DSA_COLORS.ui.textMuted,
                  }}
                >
                  {entry.value === null ? 'null' : entry.value === undefined ? 'undefined' : String(entry.value)}
                </span>
              </div>
            ))
          )}

          {/* Overflow indicator */}
          {bucket.entries.length > maxEntriesPerBucket && (
            <div
              style={{
                padding: '2px 6px',
                fontSize: 10,
                color: DSA_COLORS.ui.textMuted,
                fontFamily: 'monospace',
              }}
            >
              +{bucket.entries.length - maxEntriesPerBucket} more
            </div>
          )}
        </div>

        {/* Chain indicator for chaining strategy */}
        {collisionStrategy === 'chaining' && bucket.entries.length > 1 && (
          <div
            style={{
              marginTop: 5,
              textAlign: 'center',
              fontSize: 10,
              color: DSA_COLORS.pointer.secondary,
              fontFamily: 'monospace',
            }}
          >
            &#8595; chain ({bucket.entries.length})
          </div>
        )}
      </div>
    );
  };

  // Render probe path for open addressing
  const renderProbePath = () => {
    if (!operation?.steps || operation.steps.length < 2) return null;
    if (collisionStrategy === 'chaining') return null;

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
            id="probe-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={DSA_COLORS.pointer.secondary} />
          </marker>
        </defs>
        {operation.steps.slice(1).map((step, idx) => {
          const prevStep = operation.steps![idx];
          const fromPos = getBucketPosition(prevStep);
          const toPos = getBucketPosition(step);

          const fromX = fromPos.x + bucketWidth / 2;
          const fromY = fromPos.y - 10;
          const toX = toPos.x + bucketWidth / 2;
          const toY = toPos.y - 10;

          // Curved path
          const midY = fromY - 30;

          return (
            <path
              key={idx}
              d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${midY}, ${toX} ${toY}`}
              fill="none"
              stroke={DSA_COLORS.pointer.secondary}
              strokeWidth={2}
              strokeDasharray="5,3"
              markerEnd="url(#probe-arrow)"
              opacity={interpolate(operationProgress, [0.3 + idx * 0.1, 0.5 + idx * 0.1], [0, 1])}
            />
          );
        })}
      </svg>
    );
  };

  // Get collision strategy label
  const getStrategyLabel = () => {
    switch (collisionStrategy) {
      case 'chaining':
        return 'Separate Chaining';
      case 'linear':
        return 'Linear Probing';
      case 'quadratic':
        return 'Quadratic Probing';
      case 'double':
        return 'Double Hashing';
      default:
        return collisionStrategy;
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
        {/* Hash function visualization */}
        {renderHashFunction()}

        {/* Buckets */}
        {buckets.map(bucket => renderBucket(bucket))}

        {/* Probe path */}
        {renderProbePath()}
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: 15,
          display: 'flex',
          gap: 20,
          fontSize: 12,
          fontFamily: 'monospace',
        }}
      >
        {showLoadFactor && (
          <div style={{ color: DSA_COLORS.ui.textMuted }}>
            Load Factor:{' '}
            <span
              style={{
                color: loadFactor > 0.7
                  ? DSA_COLORS.cell.error
                  : loadFactor > 0.5
                    ? DSA_COLORS.pointer.secondary
                    : DSA_COLORS.cell.success,
                fontWeight: 600,
              }}
            >
              {loadFactor.toFixed(2)}
            </span>
          </div>
        )}
        <div style={{ color: DSA_COLORS.ui.textMuted }}>
          Size: {size}
        </div>
        <div style={{ color: DSA_COLORS.ui.textMuted }}>
          Entries: {totalEntries}
        </div>
      </div>

      {/* Strategy indicator */}
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
        Collision Resolution: {getStrategyLabel()}
      </div>
    </div>
  );
};

export default HashTable;
