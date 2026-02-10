import React from 'react';
import { AbsoluteFill, useCurrentFrame, Sequence } from 'remotion';
import { ArrayVisualizer } from '../arrays/ArrayVisualizer';
import { TwoPointers } from '../pointers/TwoPointers';
import { SlidingWindow } from '../pointers/SlidingWindow';
import { FastSlowPointers } from '../pointers/FastSlowPointers';
import { BinarySearch } from '../searching/BinarySearch';
import { SortingVisualizer } from '../sorting/SortingVisualizer';
import { ComplexityGraph } from '../complexity/ComplexityGraph';
import { ComplexityPair } from '../complexity/ComplexityBadge';
import { PythonCodeBlock } from '../code/PythonCodeBlock';
import { DSA_COLORS } from '../constants';

// ============================================
// Two Pointers Demo
// ============================================
export const TwoPointersDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Animate pointers converging
  const step = Math.floor(frame / 45);
  const left = Math.min(step, 4);
  const right = Math.max(9 - step, 5);

  const target = 11;
  const sum = values[left] + values[right];

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      <TwoPointers
        values={values}
        left={left}
        right={right}
        target={target}
        sum={sum}
        showComparison={true}
        comparisonResult={sum === target ? 'equal' : sum < target ? 'less' : 'greater'}
        direction="converging"
        title="Two Sum Problem - Two Pointers Approach"
        animationStartFrame={0}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Sliding Window Demo
// ============================================
export const SlidingWindowDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const values = [2, 1, 5, 1, 3, 2, 8, 4, 1];

  // Animate window sliding
  const step = Math.floor(frame / 60);
  const k = 3;
  const windowStart = Math.min(step, values.length - k);
  const windowEnd = windowStart + k - 1;

  const windowSum = values
    .slice(windowStart, windowEnd + 1)
    .reduce((a, b) => a + b, 0);

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      <SlidingWindow
        values={values}
        windowStart={windowStart}
        windowEnd={windowEnd}
        windowSum={windowSum}
        target={9}
        constraint={`window size = ${k}`}
        isValid={windowSum <= 9}
        title="Maximum Sum Subarray of Size K"
        operation="slide"
        animationStartFrame={0}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Binary Search Demo
// ============================================
export const BinarySearchDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const values = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const target = 11;

  // Simulate binary search steps
  const step = Math.floor(frame / 90);

  let left = 0;
  let right = values.length - 1;
  let iterations = 0;

  for (let i = 0; i < step && left <= right; i++) {
    const mid = Math.floor((left + right) / 2);
    iterations++;
    if (values[mid] === target) break;
    if (values[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  const mid = Math.floor((left + right) / 2);
  const found = values[mid] === target;

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      <BinarySearch
        values={values}
        target={target}
        left={left}
        right={right}
        mid={mid}
        found={found}
        foundIndex={found ? mid : undefined}
        iterations={iterations}
        title="Binary Search - O(log n)"
        animationStartFrame={0}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Sorting Demo
// ============================================
export const SortingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const initialValues = [64, 34, 25, 12, 22, 11, 90];

  // Simulate bubble sort steps
  const step = Math.floor(frame / 45);
  const values = [...initialValues];

  let comparisons = 0;
  let swaps = 0;
  let comparing: [number, number] | undefined;
  let swapping: [number, number] | undefined;
  const sorted: number[] = [];

  let currentStep = 0;
  outer: for (let i = 0; i < values.length - 1; i++) {
    for (let j = 0; j < values.length - i - 1; j++) {
      if (currentStep === step) {
        comparing = [j, j + 1];
        break outer;
      }
      comparisons++;
      currentStep++;

      if (values[j] > values[j + 1]) {
        if (currentStep === step) {
          swapping = [j, j + 1];
          break outer;
        }
        [values[j], values[j + 1]] = [values[j + 1], values[j]];
        swaps++;
        currentStep++;
      }
    }
    sorted.push(values.length - 1 - i);
  }

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      <SortingVisualizer
        values={values}
        algorithm="bubble"
        comparing={comparing}
        swapping={swapping}
        sorted={sorted}
        comparisons={comparisons}
        swaps={swaps}
        showStats={true}
        showAlgorithmInfo={true}
        title="Bubble Sort Visualization"
        animationStartFrame={0}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Complexity Graph Demo
// ============================================
export const ComplexityDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        padding: 60,
      }}
    >
      <ComplexityGraph
        curves={[
          { name: 'Constant', complexity: 'O(1)' },
          { name: 'Logarithmic', complexity: 'O(log n)' },
          { name: 'Linear', complexity: 'O(n)' },
          { name: 'Linearithmic', complexity: 'O(n log n)' },
          { name: 'Quadratic', complexity: 'O(n²)', highlight: true },
        ]}
        inputRange={[1, 20]}
        currentN={Math.min(1 + Math.floor(frame / 15), 18)}
        highlightCurve="O(n²)"
        title="Time Complexity Comparison"
        animationStartFrame={0}
      />

      <ComplexityPair
        timeComplexity="O(n²)"
        spaceComplexity="O(1)"
        showDescription={true}
        animationStartFrame={60}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Code Display Demo
// ============================================
export const CodeDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const code = `def two_sum(nums: list[int], target: int) -> list[int]:
    """Find two numbers that add up to target."""
    seen = {}  # value -> index

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []  # No solution found`;

  const currentLine = Math.min(1 + Math.floor(frame / 30), 13);

  return (
    <AbsoluteFill
      style={{
        background: DSA_COLORS.ui.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      <PythonCodeBlock
        code={code}
        title="two_sum.py"
        currentLine={currentLine}
        highlightLines={[5, 6, 7, 8]}
        typewriter={false}
        fontSize={18}
        animationStartFrame={0}
        style={{ width: 700 }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// Combined Demo Composition
// ============================================
export const DSAArrayDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: DSA_COLORS.ui.background }}>
      <Sequence from={0} durationInFrames={180} name="Two Pointers">
        <TwoPointersDemo />
      </Sequence>

      <Sequence from={180} durationInFrames={180} name="Sliding Window">
        <SlidingWindowDemo />
      </Sequence>

      <Sequence from={360} durationInFrames={180} name="Binary Search">
        <BinarySearchDemo />
      </Sequence>

      <Sequence from={540} durationInFrames={180} name="Sorting">
        <SortingDemo />
      </Sequence>

      <Sequence from={720} durationInFrames={180} name="Complexity">
        <ComplexityDemo />
      </Sequence>

      <Sequence from={900} durationInFrames={180} name="Code">
        <CodeDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

export default DSAArrayDemo;
