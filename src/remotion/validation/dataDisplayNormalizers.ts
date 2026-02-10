// ============================================
// DATA DISPLAY NORMALIZERS
// Specific normalizers for complex DataDisplay component props
// ============================================

/**
 * Normalize props to ensure arrays exist
 */
function ensureArrays<T extends Record<string, any>>(
  props: T,
  arrayKeys: (keyof T)[]
): T {
  const result = { ...props };
  for (const key of arrayKeys) {
    if (!Array.isArray(result[key])) {
      (result as any)[key] = [];
    }
  }
  return result;
}

/**
 * Normalize props to ensure required fields have defaults
 */
function ensureDefaults<T extends Record<string, any>>(
  props: T,
  defaults: Partial<T>
): T {
  const result = { ...defaults, ...props };
  return result as T;
}

// ============================================
// SPECIFIC NORMALIZERS
// ============================================

export function normalizeRadarChartProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['axes', 'datasets']);

  // Ensure each dataset has values array
  normalized.datasets = normalized.datasets.map((dataset: any) => ({
    ...dataset,
    values: Array.isArray(dataset?.values) ? dataset.values : [],
    color: dataset?.color || '#00D9FF',
    label: dataset?.label || 'Dataset',
  }));

  // Ensure each axis has required fields
  normalized.axes = normalized.axes.map((axis: any) => ({
    ...axis,
    label: axis?.label || axis?.name || 'Axis',
    maxValue: axis?.maxValue || 100,
  }));

  return normalized;
}

export function normalizeMindMapProps(props: Record<string, any>): Record<string, any> {
  const normalized = { ...props };

  // Ensure root exists
  if (!normalized.root) {
    normalized.root = {
      id: 'root',
      label: 'Root',
      children: [],
    };
  }

  // Recursively ensure children arrays (with depth limit to prevent stack overflow)
  const MAX_DEPTH = 50;
  const normalizeNode = (node: any, depth = 0): any => {
    if (!node) return { id: 'unknown', label: 'Unknown', children: [] };
    if (depth >= MAX_DEPTH) {
      return { id: 'truncated', label: 'Max depth exceeded', children: [] };
    }
    return {
      ...node,
      id: node.id || `node-${Math.random().toString(36).slice(2, 11)}`,
      label: node.label || node.name || 'Node',
      children: Array.isArray(node.children)
        ? node.children.map((child: any) => normalizeNode(child, depth + 1))
        : [],
    };
  };

  normalized.root = normalizeNode(normalized.root);
  return normalized;
}

export function normalizeDecisionTreeProps(props: Record<string, any>): Record<string, any> {
  const normalized = { ...props };

  // Ensure root exists with proper DecisionNode structure
  if (!normalized.root) {
    normalized.root = {
      id: 'root',
      label: 'Start',
      type: 'question',
    };
  }

  // Recursively ensure node structure (with depth limit to prevent stack overflow)
  const MAX_DEPTH = 50;
  const normalizeNode = (node: any, depth = 0, isLeaf = false): any => {
    // Handle undefined/null nodes - return undefined to signal no child exists
    if (!node) return undefined;
    if (depth >= MAX_DEPTH) {
      return { id: 'truncated', label: 'Max depth exceeded', type: 'answer' };
    }

    // Determine if this is a question (has children) or answer (leaf node)
    const hasChildren = node.yes || node.no;
    const nodeType = node.type || (hasChildren ? 'question' : 'answer');

    // Normalize yes/no branches
    const yesChild = node.yes ? normalizeNode(node.yes, depth + 1, false) : undefined;
    const noChild = node.no ? normalizeNode(node.no, depth + 1, false) : undefined;

    return {
      id: node.id || `node-${Math.random().toString(36).slice(2, 11)}`,
      // Support both 'question' and 'label' field names from LLM output
      label: node.label || node.question || node.text || (nodeType === 'question' ? 'Question?' : 'Answer'),
      type: nodeType,
      color: node.color,
      icon: node.icon,
      // Only include yes/no if they exist
      ...(yesChild !== undefined && { yes: yesChild }),
      ...(noChild !== undefined && { no: noChild }),
    };
  };

  normalized.root = normalizeNode(normalized.root, 0, false);

  // Final safety check - ensure root is never null/undefined
  if (!normalized.root) {
    normalized.root = {
      id: 'root',
      label: 'Start',
      type: 'question',
    };
  }

  return normalized;
}

export function normalizeTreeViewProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureDefaults(props, {
    expandedIds: [],
    highlightPath: [],
    orientation: 'vertical',
  });

  // Ensure arrays
  normalized.expandedIds = Array.isArray(normalized.expandedIds) ? normalized.expandedIds : [];
  normalized.highlightPath = Array.isArray(normalized.highlightPath) ? normalized.highlightPath : [];

  // Ensure root exists
  if (!normalized.root) {
    normalized.root = {
      id: 'root',
      label: 'Root',
      children: [],
    };
  }

  return normalized;
}

export function normalizeFeatureMatrixProps(props: Record<string, any>): Record<string, any> {
  const { rows, columns, values, ...rest } = props;

  // If data is already in correct format (has separate values 2D array), use it
  if (values && Array.isArray(values) && values.length > 0 && Array.isArray(values[0])) {
    const normalizedColumns = (columns || []).map((col: any) => ({
      label: col.label || col.name || 'Column',
      color: col.color,
      icon: col.icon,
    }));
    return { ...rest, rows: rows || [], columns: normalizedColumns, values };
  }

  // LLM format: columns contain their own values
  if (columns && Array.isArray(columns) && columns.length > 0 && columns[0]?.values) {
    const normalizedColumns = columns.map((col: any) => ({
      label: col.label || col.name || 'Column',
      color: col.color,
      icon: col.icon,
    }));

    const rowCount = rows?.length || columns[0]?.values?.length || 0;
    const normalizedValues: any[][] = [];

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const rowValues: any[] = [];
      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        const colValues = columns[colIdx]?.values || [];
        rowValues.push(colValues[rowIdx] ?? '');
      }
      normalizedValues.push(rowValues);
    }

    return { ...rest, rows: rows || [], columns: normalizedColumns, values: normalizedValues };
  }

  // Fallback: return with safe defaults
  return {
    ...rest,
    rows: rows || [],
    columns: (columns || []).map((col: any) => ({
      label: col.label || col.name || 'Column',
      color: col.color,
      icon: col.icon,
    })),
    values: values || [],
  };
}

export function normalizeGraphVisualizerProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['nodes', 'edges', 'highlightPath']);

  // Ensure each node has required fields
  normalized.nodes = normalized.nodes.map((node: any, index: number) => ({
    ...node,
    id: node.id || `node-${index}`,
    label: node.label || node.name || `${index}`,
    x: node.x ?? 100 + (index % 5) * 120,
    y: node.y ?? 100 + Math.floor(index / 5) * 100,
  }));

  // Ensure each edge has required fields
  normalized.edges = normalized.edges.map((edge: any, index: number) => ({
    ...edge,
    from: edge.from || edge.source || '',
    to: edge.to || edge.target || '',
    weight: edge.weight,
    directed: edge.directed ?? false,
  }));

  return normalized;
}

export function normalizeStateTransitionProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['states', 'transitions']);

  // Ensure each state has required fields
  normalized.states = normalized.states.map((state: any, index: number) => ({
    ...state,
    id: state.id || `state-${index}`,
    label: state.label || state.name || `S${index}`,
  }));

  // Ensure each transition has required fields
  normalized.transitions = normalized.transitions.map((trans: any) => ({
    ...trans,
    from: trans.from || trans.source || '',
    to: trans.to || trans.target || '',
    label: trans.label || '',
  }));

  return normalized;
}

export function normalizeCircularFlowProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['nodes']);

  // Ensure each node has required fields
  normalized.nodes = normalized.nodes.map((node: any, index: number) => ({
    ...node,
    id: node.id || `node-${index}`,
    label: node.label || node.name || `Step ${index + 1}`,
  }));

  return normalized;
}

export function normalizeVennDiagramProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['circles']);

  // Ensure each circle has required fields
  normalized.circles = normalized.circles.map((circle: any, index: number) => ({
    ...circle,
    label: circle.label || circle.name || `Set ${index + 1}`,
    color: circle.color || ['#00D9FF', '#A855F7', '#22C55E'][index % 3],
  }));

  return normalized;
}

export function normalizeSegmentedWheelProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['segments']);

  // Ensure each segment has required fields
  normalized.segments = normalized.segments.map((segment: any, index: number) => ({
    ...segment,
    title: segment.title || segment.label || `Segment ${index + 1}`,
    icon: segment.icon || 'Box',
    color: segment.color || ['#00D9FF', '#A855F7', '#22C55E', '#F59E0B'][index % 4],
  }));

  return normalized;
}

// ============================================
// DSA NORMALIZERS
// ============================================

export function normalizeTwoPointersProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIndex = Math.max(0, values.length - 1);

  return {
    ...props,
    values,
    left: Math.max(0, Math.min(props.left ?? 0, maxIndex)),
    right: Math.max(0, Math.min(props.right ?? maxIndex, maxIndex)),
    highlightIndices: Array.isArray(props.highlightIndices) ? props.highlightIndices : [],
  };
}

export function normalizeBinarySearchProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIndex = Math.max(0, values.length - 1);
  const left = Math.max(0, Math.min(props.left ?? 0, maxIndex));
  const right = Math.max(0, Math.min(props.right ?? maxIndex, maxIndex));

  return {
    ...props,
    values,
    left,
    right,
    mid: props.mid ?? Math.floor((left + right) / 2),
    target: props.target ?? 0,
    found: props.found ?? false,
  };
}

export function normalizeLinearSearchProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIndex = Math.max(0, values.length - 1);

  return {
    ...props,
    values,
    currentIndex: Math.max(0, Math.min(props.currentIndex ?? 0, maxIndex)),
    target: props.target ?? 0,
    found: props.found ?? false,
    visited: Array.isArray(props.visited) ? props.visited : [],
  };
}

export function normalizeComplexityGraphProps(props: Record<string, any>): Record<string, any> {
  const normalized = ensureArrays(props, ['curves']);

  // Ensure each curve has required fields
  normalized.curves = normalized.curves.map((curve: any) => ({
    ...curve,
    name: curve.name || curve.label || 'Algorithm',
    complexity: curve.complexity || 'O(n)',
  }));

  return normalized;
}

// ============================================
// FLOW & PROCESS NORMALIZERS
// ============================================

export function normalizeTimelineProps(props: Record<string, any>): Record<string, any> {
  // Handle events→items field mismatch from LLMs
  const items = props.items || props.events || props.steps || [];
  return {
    ...props,
    items: Array.isArray(items) ? items.map((item: any, idx: number) => ({
      title: item.title || item.label || item.name || `Step ${idx + 1}`,
      description: item.description || item.text || '',
      icon: item.icon,
      color: item.color,
    })) : [],
    orientation: props.orientation || 'horizontal',
    connectorStyle: props.connectorStyle || 'solid',
  };
}

export function normalizePipelineProps(props: Record<string, any>): Record<string, any> {
  const stages = props.stages || props.steps || [];
  return {
    ...props,
    stages: Array.isArray(stages) ? stages.map((stage: any, idx: number) => ({
      label: stage.label || stage.name || `Stage ${idx + 1}`,
      icon: stage.icon,
      color: stage.color,
      status: stage.status || 'pending',
    })) : [],
  };
}

export function normalizeSwimlaneProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    lanes: Array.isArray(props.lanes) ? props.lanes.map((lane: any, idx: number) => ({
      id: lane.id || `lane-${idx}`,
      label: lane.label || lane.name || `Lane ${idx + 1}`,
      icon: lane.icon,
      color: lane.color,
    })) : [],
    nodes: Array.isArray(props.nodes) ? props.nodes.map((node: any, idx: number) => ({
      id: node.id || `node-${idx}`,
      laneId: node.laneId || props.lanes?.[0]?.id || 'lane-0',
      label: node.label || node.name || '',
      x: node.x ?? 50,
    })) : [],
    connections: Array.isArray(props.connections) ? props.connections : [],
  };
}

export function normalizeLayeredStackProps(props: Record<string, any>): Record<string, any> {
  const layers = props.layers || props.items || [];
  return {
    ...props,
    layers: Array.isArray(layers) ? layers.map((layer: any, idx: number) => ({
      label: layer.label || layer.name || `Layer ${idx + 1}`,
      icon: layer.icon,
      sublabel: layer.sublabel || layer.description,
      color: layer.color,
    })) : [],
    direction: props.direction || 'top-down',
    showArrows: props.showArrows ?? true,
  };
}

export function normalizeModuleViewProps(props: Record<string, any>): Record<string, any> {
  const normalizeItem = (item: any): any => {
    if (!item) return { name: 'Unknown', type: 'file' };
    return {
      name: item.name || item.label || 'Item',
      type: item.type || 'file',
      icon: item.icon,
      color: item.color,
      children: Array.isArray(item.children) ? item.children.map(normalizeItem) : undefined,
    };
  };
  return {
    ...props,
    root: props.root ? normalizeItem(props.root) : { name: 'Root', type: 'folder', children: [] },
  };
}

export function normalizeStateMachineProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    states: Array.isArray(props.states) ? props.states.map((state: any, idx: number) => ({
      id: state.id || `state-${idx}`,
      label: state.label || state.name || `S${idx}`,
      color: state.color,
      isInitial: state.isInitial ?? idx === 0,
      isFinal: state.isFinal ?? false,
    })) : [],
    transitions: Array.isArray(props.transitions) ? props.transitions.map((t: any) => ({
      from: t.from || t.source || '',
      to: t.to || t.target || '',
      label: t.label || '',
    })) : [],
  };
}

// ============================================
// ADDITIONAL DSA ALGORITHM NORMALIZERS
// ============================================

export function normalizeSlidingWindowProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIdx = Math.max(0, values.length - 1);
  return {
    ...props,
    values,
    windowStart: Math.max(0, Math.min(props.windowStart ?? 0, maxIdx)),
    windowEnd: Math.max(0, Math.min(props.windowEnd ?? Math.min(2, maxIdx), maxIdx)),
    cellSize: props.cellSize || 'medium',
  };
}

export function normalizeFastSlowPointersProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIdx = Math.max(0, values.length - 1);
  return {
    ...props,
    values,
    slow: Math.max(0, Math.min(props.slow ?? 0, maxIdx)),
    fast: Math.max(0, Math.min(props.fast ?? 0, maxIdx)),
    slowLabel: props.slowLabel || 'Slow',
    fastLabel: props.fastLabel || 'Fast',
    cycleDetected: props.cycleDetected ?? false,
    cellSize: props.cellSize || 'medium',
  };
}

export function normalizeSortingVisualizerProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  return {
    ...props,
    values,
    algorithm: props.algorithm || 'bubble',
    comparing: Array.isArray(props.comparing) ? props.comparing : undefined,
    swapping: Array.isArray(props.swapping) ? props.swapping : undefined,
    sorted: Array.isArray(props.sorted) ? props.sorted : [],
    style: props.style || 'bars',
  };
}

export function normalizeArrayWithStateProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  return {
    ...props,
    values,
    showIndices: props.showIndices ?? true,
    cellSize: props.cellSize || 'medium',
    pointers: Array.isArray(props.pointers) ? props.pointers : [],
    highlightIndices: Array.isArray(props.highlightIndices) ? props.highlightIndices : [],
    variables: Array.isArray(props.variables) ? props.variables.map((v: any) => ({
      name: v.name || v.label || 'var',
      value: v.value ?? '',
      type: v.type,
    })) : [],
    showVariablePanel: props.showVariablePanel ?? true,
  };
}

export function normalizeGridVisualizerProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    rows: props.rows ?? 3,
    cols: props.cols ?? 3,
    cells: Array.isArray(props.cells) ? props.cells.map((c: any) => ({
      row: c.row ?? 0,
      col: c.col ?? 0,
      value: c.value,
      color: c.color,
      highlighted: c.highlighted ?? false,
    })) : [],
    highlightCells: Array.isArray(props.highlightCells) ? props.highlightCells : [],
    cellSize: props.cellSize ?? 50,
  };
}

export function normalizeTreeVisualizerProps(props: Record<string, any>): Record<string, any> {
  const MAX_DEPTH = 20;
  const seenValues = new Set<string>();

  const normalizeNode = (node: any, depth = 0): any => {
    if (!node || depth >= MAX_DEPTH) return undefined;
    const key = `${node.value}-${depth}`;
    if (seenValues.has(key)) return undefined;
    seenValues.add(key);

    return {
      value: node.value ?? node.label ?? '',
      left: node.left ? normalizeNode(node.left, depth + 1) : undefined,
      right: node.right ? normalizeNode(node.right, depth + 1) : undefined,
      highlighted: node.highlighted ?? false,
      color: node.color,
    };
  };

  return {
    ...props,
    root: props.root ? normalizeNode(props.root) : { value: 'Empty' },
    nodeSize: props.nodeSize ?? 40,
  };
}

export function normalizeRecursionStackProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    frames: Array.isArray(props.frames) ? props.frames.map((f: any, idx: number) => ({
      functionName: f.functionName || f.name || `call_${idx}`,
      args: f.args || '',
      returnValue: f.returnValue,
      status: f.status || 'active',
      color: f.color,
    })) : [],
    maxVisibleFrames: props.maxVisibleFrames ?? 8,
  };
}

export function normalizePointerAnimationProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  const maxIdx = Math.max(0, values.length - 1);
  return {
    ...props,
    values,
    leftPointer: props.leftPointer ? {
      index: Math.max(0, Math.min(props.leftPointer.index ?? 0, maxIdx)),
      label: props.leftPointer.label,
      color: props.leftPointer.color,
    } : undefined,
    rightPointer: props.rightPointer ? {
      index: Math.max(0, Math.min(props.rightPointer.index ?? maxIdx, maxIdx)),
      label: props.rightPointer.label,
      color: props.rightPointer.color,
    } : undefined,
    cellSize: props.cellSize ?? 70,
  };
}

// ============================================
// DATA STRUCTURE NORMALIZERS
// ============================================

export function normalizeLinkedListProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    nodes: Array.isArray(props.nodes) ? props.nodes.map((n: any, idx: number) => ({
      value: n.value ?? n.label ?? idx,
      next: n.next,
      highlighted: n.highlighted ?? false,
    })) : [],
    type: props.type || 'singly',
    pointers: Array.isArray(props.pointers) ? props.pointers : [],
    layout: props.layout || 'horizontal',
  };
}

export function normalizeStackProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    items: Array.isArray(props.items) ? props.items : [],
    maxVisible: props.maxVisible ?? 8,
    operation: props.operation || 'none',
    highlightTop: props.highlightTop ?? true,
    orientation: props.orientation || 'vertical',
  };
}

export function normalizeQueueProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    items: Array.isArray(props.items) ? props.items : [],
    type: props.type || 'fifo',
    maxVisible: props.maxVisible ?? 8,
    operation: props.operation || 'none',
    showFrontRear: props.showFrontRear ?? true,
  };
}

export function normalizeCallStackProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    frames: Array.isArray(props.frames) ? props.frames.map((f: any) => ({
      name: f.name || f.functionName || 'func',
      args: f.args || {},
      localVars: f.localVars || f.locals || {},
      returnValue: f.returnValue,
      status: f.status || 'active',
    })) : [],
    maxDepth: props.maxDepth ?? 6,
    showReturnValues: props.showReturnValues ?? true,
    showLocalVars: props.showLocalVars ?? true,
  };
}

export function normalizeHashTableProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    buckets: Array.isArray(props.buckets) ? props.buckets : [],
    size: props.size ?? 8,
    hashFunction: props.hashFunction || 'h(k) = k mod m',
    collisionStrategy: props.collisionStrategy || 'chaining',
    showLoadFactor: props.showLoadFactor ?? true,
    showHashComputation: props.showHashComputation ?? true,
  };
}

export function normalizeDPTableProps(props: Record<string, any>): Record<string, any> {
  // Ensure 2D array is rectangular
  const values = Array.isArray(props.values) ? props.values : [[0]];
  const maxCols = Math.max(...values.map((row: any) => Array.isArray(row) ? row.length : 0), 1);
  const normalizedValues = values.map((row: any) => {
    if (!Array.isArray(row)) return Array(maxCols).fill(0);
    const newRow = [...row];
    while (newRow.length < maxCols) newRow.push(0);
    return newRow;
  });

  return {
    ...props,
    values: normalizedValues,
    rowLabels: Array.isArray(props.rowLabels) ? props.rowLabels : undefined,
    colLabels: Array.isArray(props.colLabels) ? props.colLabels : undefined,
    filledCells: Array.isArray(props.filledCells) ? props.filledCells : [],
    transitions: Array.isArray(props.transitions) ? props.transitions : [],
    optimalPath: Array.isArray(props.optimalPath) ? props.optimalPath : [],
    cellSize: props.cellSize ?? 50,
    showFormula: props.showFormula ?? true,
  };
}

// ============================================
// COMPLEXITY & CODE NORMALIZERS
// ============================================

export function normalizeComplexityBadgeProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    timeComplexity: props.timeComplexity || props.time || 'O(n)',
    spaceComplexity: props.spaceComplexity || props.space || 'O(1)',
    showLabels: props.showLabels ?? true,
    size: props.size || 'large',
  };
}

export function normalizeComplexityPairProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    time: props.time || props.timeComplexity || 'O(n)',
    space: props.space || props.spaceComplexity || 'O(1)',
    timeLabel: props.timeLabel || 'Time',
    spaceLabel: props.spaceLabel || 'Space',
    size: props.size || 'large',
  };
}

export function normalizeOperationCounterProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    comparisons: props.comparisons ?? 0,
    swaps: props.swaps ?? 0,
    arrayAccesses: props.arrayAccesses ?? 0,
    showComparisons: props.showComparisons ?? true,
    showSwaps: props.showSwaps ?? true,
    showAccesses: props.showAccesses ?? true,
    size: props.size || 'large',
  };
}

export function normalizePythonCodeProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    code: props.code || '# Code here',
    title: props.title || props.filename || 'solution.py',
    highlightLines: Array.isArray(props.highlightLines) ? props.highlightLines : [],
    showLineNumbers: props.showLineNumbers ?? true,
    typewriter: props.typewriter ?? false,
    fontSize: props.fontSize ?? 16,
    annotations: Array.isArray(props.annotations) ? props.annotations : [],
  };
}

// ============================================
// TEACHING AID NORMALIZERS
// ============================================

export function normalizeWarningCardProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    message: props.message || props.text || 'Warning',
    severity: props.severity || 'warning',
    icon: props.icon,
    shake: props.shake ?? false,
  };
}

export function normalizeBestPracticeStampProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    label: props.label || 'Best Practice',
    variant: props.variant || 'approved',
    size: props.size || 'medium',
  };
}

export function normalizeMentalModelCardProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    title: props.title || 'Mental Model',
    analogy: props.analogy || '',
    explanation: props.explanation || props.description || '',
    icon: props.icon,
    accentColor: props.accentColor,
  };
}

export function normalizeCalloutBubbleProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    text: props.text || props.message || '',
    icon: props.icon,
    variant: props.variant || 'speech',
    pointerDirection: props.pointerDirection || 'bottom',
    accentColor: props.accentColor,
  };
}

export function normalizeTipBoxProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    text: props.text || props.content || '',
    title: props.title || 'Pro Tip',
    icon: props.icon,
    variant: props.variant || 'tip',
  };
}

export function normalizeInfoPanelProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    title: props.title || '',
    body: props.body || props.content || props.description || '',
    icon: props.icon,
    variant: props.variant || 'glass',
    accentColor: props.accentColor,
  };
}

// ============================================
// META/BRAND & COMPARISON NORMALIZERS
// ============================================

export function normalizeSummaryRecapProps(props: Record<string, any>): Record<string, any> {
  const items = props.items || props.points || [];
  return {
    ...props,
    items: Array.isArray(items) ? items.map((item: any, idx: number) => ({
      icon: item.icon,
      title: item.title || item.label || `Point ${idx + 1}`,
      description: item.description || item.text || '',
      color: item.color,
    })) : [],
    variant: props.variant || 'cards',
  };
}

export function normalizeIntroFrameProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    title: props.title || 'Title',
    tagline: props.tagline || props.subtitle || '',
    logo: props.logo,
    accentColor: props.accentColor,
    variant: props.variant || 'tech',
  };
}

export function normalizeAgendaProps(props: Record<string, any>): Record<string, any> {
  const items = props.items || props.topics || [];
  return {
    ...props,
    items: Array.isArray(items) ? items.map((item: any, idx: number) => ({
      label: item.label || item.title || item.name || `Item ${idx + 1}`,
      icon: item.icon,
      completed: item.completed ?? false,
      active: item.active ?? false,
    })) : [],
    orientation: props.orientation || 'vertical',
    showProgress: props.showProgress ?? true,
  };
}

export function normalizeSectionHeaderProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    title: props.title || 'Section',
    subtitle: props.subtitle,
    icon: props.icon,
    accentColor: props.accentColor,
    variant: props.variant || 'gradient',
    alignment: props.alignment || 'center',
  };
}

export function normalizeGradientCardProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    icon: props.icon || '',
    title: props.title || '',
    description: props.description || props.body || '',
    borderColor: props.borderColor || props.accentColor || '#00D9FF',
    variant: props.variant || 'default',
  };
}

export function normalizeSplitComparisonProps(props: Record<string, any>): Record<string, any> {
  const normalizeItems = (items: any) => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      icon: item.icon,
      text: item.text || item.label || '',
      description: item.description,
    }));
  };
  return {
    ...props,
    leftLabel: props.leftLabel || 'Before',
    rightLabel: props.rightLabel || 'After',
    leftItems: normalizeItems(props.leftItems || props.left),
    rightItems: normalizeItems(props.rightItems || props.right),
    leftColor: props.leftColor,
    rightColor: props.rightColor,
  };
}

export function normalizeProsConsProps(props: Record<string, any>): Record<string, any> {
  const normalizeItems = (items: any) => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      text: typeof item === 'string' ? item : (item.text || item.label || ''),
      icon: typeof item === 'object' ? item.icon : undefined,
    }));
  };
  return {
    ...props,
    pros: normalizeItems(props.pros),
    cons: normalizeItems(props.cons),
    prosTitle: props.prosTitle || 'Pros',
    consTitle: props.consTitle || 'Cons',
  };
}

// ============================================
// PROGRESSIVE REVEAL NORMALIZERS
// ============================================

export function normalizeZoomDrilldownProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    levels: Array.isArray(props.levels) ? props.levels.map((level: any, idx: number) => ({
      label: level.label || level.title || `Level ${idx + 1}`,
      content: level.content,
    })) : [],
    currentLevel: props.currentLevel ?? 0,
  };
}

export function normalizeBeforeAfterToggleProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    beforeLabel: props.beforeLabel || 'Before',
    afterLabel: props.afterLabel || 'After',
    beforeContent: props.beforeContent,
    afterContent: props.afterContent,
    splitPosition: props.splitPosition ?? 50,
    orientation: props.orientation || 'horizontal',
  };
}

export function normalizeProgressiveDisclosureProps(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    content: props.content,
    blurAmount: props.blurAmount ?? 10,
    revealProgress: props.revealProgress ?? 0,
  };
}

export function normalizeArrayVisualizerProps(props: Record<string, any>): Record<string, any> {
  const values = Array.isArray(props.values) ? props.values : [];
  return {
    ...props,
    values,
    highlightIndices: Array.isArray(props.highlightIndices) ? props.highlightIndices : [],
    pointers: Array.isArray(props.pointers) ? props.pointers : [],
    showIndices: props.showIndices ?? true,
    cellSize: props.cellSize ?? 70,
  };
}

// ============================================
// MAIN NORMALIZER
// ============================================

const normalizers: Record<string, (props: Record<string, any>) => Record<string, any>> = {
  // Existing normalizers
  'radar-chart': normalizeRadarChartProps,
  'mind-map': normalizeMindMapProps,
  'decision-tree': normalizeDecisionTreeProps,
  'tree-view': normalizeTreeViewProps,
  'feature-matrix': normalizeFeatureMatrixProps,
  'graph': normalizeGraphVisualizerProps,
  'graph-visualizer': normalizeGraphVisualizerProps,
  'state-transition': normalizeStateTransitionProps,
  'circular-flow': normalizeCircularFlowProps,
  'venn-diagram': normalizeVennDiagramProps,
  'segmented-wheel': normalizeSegmentedWheelProps,
  'two-pointers': normalizeTwoPointersProps,
  'binary-search': normalizeBinarySearchProps,
  'linear-search': normalizeLinearSearchProps,
  'complexity': normalizeComplexityGraphProps,
  'complexity-graph': normalizeComplexityGraphProps,

  // Flow & Process
  'timeline': normalizeTimelineProps,
  'pipeline': normalizePipelineProps,
  'swimlane': normalizeSwimlaneProps,
  'layered-stack': normalizeLayeredStackProps,
  'module-view': normalizeModuleViewProps,
  'state-machine': normalizeStateMachineProps,

  // DSA Algorithm
  'sliding-window': normalizeSlidingWindowProps,
  'fast-slow-pointers': normalizeFastSlowPointersProps,
  'sorting-visualizer': normalizeSortingVisualizerProps,
  'array-with-state': normalizeArrayWithStateProps,
  'grid-visualizer': normalizeGridVisualizerProps,
  'tree-visualizer': normalizeTreeVisualizerProps,
  'recursion-stack': normalizeRecursionStackProps,
  'pointer-animation': normalizePointerAnimationProps,

  // Data Structures
  'linked-list': normalizeLinkedListProps,
  'stack': normalizeStackProps,
  'queue': normalizeQueueProps,
  'call-stack': normalizeCallStackProps,
  'hash-table': normalizeHashTableProps,
  'dp-table': normalizeDPTableProps,

  // Complexity & Code
  'complexity-badge': normalizeComplexityBadgeProps,
  'complexity-pair': normalizeComplexityPairProps,
  'operation-counter': normalizeOperationCounterProps,
  'python-code': normalizePythonCodeProps,

  // Teaching Aids
  'warning-card': normalizeWarningCardProps,
  'best-practice': normalizeBestPracticeStampProps,
  'mental-model': normalizeMentalModelCardProps,
  'callout': normalizeCalloutBubbleProps,
  'tip-box': normalizeTipBoxProps,
  'info-panel': normalizeInfoPanelProps,

  // Meta/Brand & Comparison
  'summary-recap': normalizeSummaryRecapProps,
  'intro-frame': normalizeIntroFrameProps,
  'agenda': normalizeAgendaProps,
  'section-header': normalizeSectionHeaderProps,
  'gradient-card': normalizeGradientCardProps,
  'hero-card': normalizeGradientCardProps, // alias
  'split-comparison': normalizeSplitComparisonProps,
  'pros-cons': normalizeProsConsProps,

  // Progressive Reveal
  'zoom-drilldown': normalizeZoomDrilldownProps,
  'before-after': normalizeBeforeAfterToggleProps,
  'progressive-disclosure': normalizeProgressiveDisclosureProps,
  'array-visualizer': normalizeArrayVisualizerProps,
};

/**
 * Normalize data display props based on the component type
 */
export function normalizeDataDisplayProps(
  componentType: string,
  props: Record<string, any>
): Record<string, any> {
  const normalizer = normalizers[componentType];
  if (normalizer) {
    return normalizer(props);
  }
  return props;
}
