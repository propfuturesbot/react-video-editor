// ============================================
// SCENE SCHEMA REGISTRY
// Defines structure, field aliases, and normalization rules for each scene type
// ============================================

export interface FieldAlias {
  target: string;           // The expected field name
  sources: string[];        // Alternative field names that should map to target
}

export interface ArrayItemSchema {
  // Field aliases within array items
  aliases?: FieldAlias[];
  // Convert string items to objects with this field
  stringToObjectField?: string;
  // Required fields in array items
  required?: string[];
}

export interface SceneSchema {
  required: string[];
  arrays: string[];
  defaults: Record<string, any>;
  // Field aliases at the scene level
  fieldAliases?: FieldAlias[];
  // Schema for items within each array field
  arrayItemSchemas?: Record<string, ArrayItemSchema>;
  // Nested arrays within objects
  nested?: Record<string, string[]>;
}

export const sceneSchemas: Record<string, SceneSchema> = {
  // ============================================
  // BRANDING SCENE
  // ============================================
  'branding': {
    required: [],
    arrays: [],
    defaults: {}
  },

  // ============================================
  // INTRO & STRUCTURE SCENES
  // ============================================
  'intro': {
    required: ['title'],
    arrays: ['icons'],
    defaults: { icons: ['Box'], subtitle: '' },
    fieldAliases: [
      { target: 'title', sources: ['heading', 'name'] },
      { target: 'subtitle', sources: ['subheading', 'description'] },
    ],
  },

  'section': {
    required: ['title'],
    arrays: [],
    defaults: { number: 1, subtitle: '' }
  },

  'summary': {
    required: ['title'],
    arrays: ['points'],
    defaults: { points: [] },
    arrayItemSchemas: {
      points: {
        stringToObjectField: 'title',
        aliases: [
          { target: 'title', sources: ['label', 'text', 'heading', 'name'] },
          { target: 'description', sources: ['subtitle', 'detail', 'content'] },
        ],
      }
    }
  },

  'outro': {
    required: ['title'],
    arrays: [],
    defaults: { subtitle: '' }
  },

  // ============================================
  // CONTENT SCENES
  // ============================================
  'content': {
    required: ['title'],
    arrays: ['cards'],
    defaults: { cards: [], badge: '' },
    arrayItemSchemas: {
      cards: {
        aliases: [
          { target: 'title', sources: ['label', 'heading', 'name'] },
          { target: 'description', sources: ['content', 'text', 'body', 'subtitle'] },
        ],
      }
    }
  },

  'list': {
    required: ['title'],
    arrays: ['items'],
    defaults: { items: [], style: 'bullet' },
    arrayItemSchemas: {
      items: {
        stringToObjectField: 'text',
        aliases: [
          { target: 'text', sources: ['label', 'title', 'content', 'name'] },
        ],
      }
    }
  },

  'comparison': {
    required: ['title'],
    arrays: ['columns'],
    defaults: { columns: [], highlightColumn: -1 },
    nested: { columns: ['items'] },
    arrayItemSchemas: {
      columns: {
        aliases: [
          { target: 'title', sources: ['label', 'heading', 'name'] },
        ],
      }
    }
  },

  // ============================================
  // DIAGRAM SCENES
  // ============================================
  'flow': {
    required: ['title'],
    arrays: ['steps'],
    defaults: { steps: [], direction: 'horizontal' },
    arrayItemSchemas: {
      steps: {
        stringToObjectField: 'label',
        aliases: [
          { target: 'label', sources: ['title', 'name', 'text'] },
          { target: 'description', sources: ['subtitle', 'detail', 'content'] },
        ],
      }
    }
  },

  'flowchart': {
    required: ['title'],
    arrays: ['nodes', 'edges'],
    defaults: { nodes: [], edges: [], mermaidCode: '' },
    arrayItemSchemas: {
      nodes: {
        stringToObjectField: 'label',
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      },
      edges: {
        aliases: [
          { target: 'from', sources: ['source', 'start'] },
          { target: 'to', sources: ['target', 'end', 'destination'] },
          { target: 'label', sources: ['text', 'name'] },
        ],
      }
    }
  },

  'architecture': {
    required: ['title'],
    arrays: ['components', 'connections'],
    defaults: { components: [], connections: [] },
    arrayItemSchemas: {
      components: {
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
          { target: 'layer', sources: ['type', 'category', 'tier'] },
        ],
      },
      connections: {
        aliases: [
          { target: 'from', sources: ['source', 'start'] },
          { target: 'to', sources: ['target', 'end', 'destination'] },
          { target: 'label', sources: ['text', 'name', 'description'] },
        ],
      }
    }
  },

  'cluster-architecture': {
    required: ['title'],
    arrays: ['clusters'],
    defaults: { clusters: [] },
    arrayItemSchemas: {
      clusters: {
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      }
    }
  },

  'network': {
    required: ['title'],
    arrays: ['nodes', 'connections'],
    defaults: { nodes: [], connections: [] },
    arrayItemSchemas: {
      nodes: {
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      },
      connections: {
        aliases: [
          { target: 'from', sources: ['source', 'start'] },
          { target: 'to', sources: ['target', 'end', 'destination'] },
        ],
      }
    }
  },

  'sequence': {
    required: ['title'],
    arrays: ['entities', 'messages'],
    defaults: { entities: [], messages: [] },
    arrayItemSchemas: {
      entities: {
        stringToObjectField: 'label',
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      },
      messages: {
        aliases: [
          { target: 'from', sources: ['source', 'sender'] },
          { target: 'to', sources: ['target', 'receiver', 'destination'] },
          { target: 'label', sources: ['text', 'message', 'content', 'name'] },
          { target: 'type', sources: ['direction', 'kind'] },
        ],
      }
    }
  },

  'state': {
    required: ['title'],
    arrays: ['states', 'transitions'],
    defaults: { states: [], transitions: [] },
    arrayItemSchemas: {
      states: {
        aliases: [
          { target: 'id', sources: ['name', 'key', 'state'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
          { target: 'description', sources: ['detail', 'content', 'subtitle'] },
        ],
      },
      transitions: {
        aliases: [
          { target: 'from', sources: ['source', 'start', 'origin'] },
          { target: 'to', sources: ['target', 'end', 'destination'] },
          { target: 'label', sources: ['text', 'name', 'event', 'trigger'] },
          { target: 'condition', sources: ['guard', 'when'] },
          { target: 'action', sources: ['effect', 'do'] },
        ],
      }
    }
  },

  'radial': {
    required: ['title'],
    arrays: ['items'],
    defaults: { items: [], centerLabel: { label: 'Center' } },
    fieldAliases: [
      { target: 'centerLabel', sources: ['center', 'centralNode', 'hub'] },
    ],
    arrayItemSchemas: {
      items: {
        stringToObjectField: 'label',
        aliases: [
          { target: 'label', sources: ['title', 'text', 'name'] },
          { target: 'description', sources: ['subtitle', 'detail', 'content'] },
        ],
      }
    }
  },

  'timeline': {
    required: ['title'],
    arrays: ['events'],
    defaults: { events: [] },
    arrayItemSchemas: {
      events: {
        stringToObjectField: 'title',
        aliases: [
          { target: 'title', sources: ['label', 'name', 'heading', 'event'] },
          { target: 'description', sources: ['content', 'text', 'detail', 'subtitle'] },
          { target: 'date', sources: ['time', 'period', 'when', 'timestamp'] },
        ],
      }
    }
  },

  'hierarchy': {
    required: ['title'],
    arrays: [],
    defaults: { root: null }
  },

  'domain-diagram': {
    required: ['title'],
    arrays: ['entities', 'relationships'],
    defaults: { entities: [], relationships: [] },
    arrayItemSchemas: {
      entities: {
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      },
      relationships: {
        aliases: [
          { target: 'from', sources: ['source', 'start', 'entity1'] },
          { target: 'to', sources: ['target', 'end', 'entity2'] },
          { target: 'label', sources: ['text', 'name', 'type'] },
        ],
      }
    }
  },

  'classdiagram': {
    required: [],
    arrays: ['classes', 'relationships'],
    defaults: { classes: [], relationships: [], mermaidCode: '' },
    arrayItemSchemas: {
      classes: {
        aliases: [
          { target: 'name', sources: ['id', 'className', 'title'] },
        ],
      }
    }
  },

  // ============================================
  // STATE & TRANSITION SCENES
  // ============================================
  'circular-flow': {
    required: ['title'],
    arrays: ['nodes'],
    defaults: { nodes: [] },
    arrayItemSchemas: {
      nodes: {
        stringToObjectField: 'label',
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      }
    }
  },

  // ============================================
  // DATA VISUALIZATION SCENES
  // ============================================
  'feature-matrix': {
    required: ['title'],
    arrays: ['rows', 'columns', 'values'],
    defaults: { rows: [], columns: [], values: [] },
    arrayItemSchemas: {
      rows: { stringToObjectField: 'label' },
      columns: { stringToObjectField: 'label' },
    }
  },

  'pros-cons': {
    required: ['title'],
    arrays: ['pros', 'cons'],
    defaults: { pros: [], cons: [] },
    arrayItemSchemas: {
      pros: { stringToObjectField: 'text' },
      cons: { stringToObjectField: 'text' },
    }
  },

  'radar-chart': {
    required: ['title'],
    arrays: ['axes', 'datasets'],
    defaults: { axes: [], datasets: [] },
    nested: { datasets: ['values'] },
    arrayItemSchemas: {
      axes: { stringToObjectField: 'label' },
    }
  },

  'venn-diagram': {
    required: ['title'],
    arrays: ['circles'],
    defaults: { circles: [] },
    arrayItemSchemas: {
      circles: {
        aliases: [
          { target: 'label', sources: ['title', 'name', 'text'] },
        ],
      }
    }
  },

  'mind-map': {
    required: ['title'],
    arrays: [],
    defaults: { root: null }
  },

  'decision-tree': {
    required: ['title'],
    arrays: [],
    defaults: { root: null }
  },

  // ============================================
  // CODE & TECHNICAL SCENES
  // ============================================
  'code': {
    required: ['code'],
    arrays: ['highlights'],
    defaults: { language: 'javascript', highlights: [], title: '' },
    fieldAliases: [
      { target: 'code', sources: ['codeContent', 'source', 'snippet'] },
      { target: 'language', sources: ['lang', 'syntax'] },
    ],
  },

  'codeblock': {
    required: ['code'],
    arrays: ['highlightLines'],
    defaults: { language: 'typescript', highlightLines: [] },
    fieldAliases: [
      { target: 'code', sources: ['codeContent', 'source', 'snippet'] },
      { target: 'language', sources: ['lang', 'syntax'] },
    ],
  },

  'image': {
    required: [],
    arrays: [],
    defaults: { title: '', subtitle: '' },
    fieldAliases: [
      { target: 'imageUrl', sources: ['src', 'url', 'image', 'source'] },
      { target: 'title', sources: ['heading', 'label', 'name'] },
    ],
  },

  // ============================================
  // DSA SCENES
  // ============================================
  'two-pointers': {
    required: ['values'],
    arrays: ['values', 'highlightIndices'],
    defaults: { values: [], left: 0, right: 0, highlightIndices: [] },
    arrayItemSchemas: {
      values: { stringToObjectField: 'value' },
    }
  },

  'sliding-window': {
    required: ['values'],
    arrays: ['values'],
    defaults: { values: [], windowStart: 0, windowEnd: 0 },
    arrayItemSchemas: {
      values: { stringToObjectField: 'value' },
    }
  },

  'binary-search': {
    required: ['values', 'target'],
    arrays: ['values'],
    defaults: { values: [], target: 0, left: 0, right: 0, mid: 0 }
  },

  'linear-search': {
    required: ['values', 'target'],
    arrays: ['values', 'visited'],
    defaults: { values: [], target: 0, currentIndex: 0, visited: [] }
  },

  'sorting': {
    required: ['values'],
    arrays: ['values', 'highlightIndices', 'swapIndices'],
    defaults: { values: [], highlightIndices: [], swapIndices: [] }
  },

  'graph': {
    required: [],
    arrays: ['nodes', 'edges', 'highlightPath'],
    defaults: { nodes: [], edges: [], highlightPath: [] },
    arrayItemSchemas: {
      nodes: {
        aliases: [
          { target: 'id', sources: ['name', 'key'] },
          { target: 'label', sources: ['title', 'text', 'name'] },
        ],
      },
      edges: {
        aliases: [
          { target: 'from', sources: ['source', 'start'] },
          { target: 'to', sources: ['target', 'end'] },
        ],
      }
    }
  },

  'tree': {
    required: [],
    arrays: ['highlightNodes'],
    defaults: { root: null, highlightNodes: [] }
  },

  'linked-list': {
    required: [],
    arrays: ['nodes'],
    defaults: { nodes: [] },
    arrayItemSchemas: {
      nodes: {
        aliases: [
          { target: 'value', sources: ['data', 'val', 'label'] },
        ],
      }
    }
  },

  'stack': {
    required: [],
    arrays: ['items'],
    defaults: { items: [] },
    arrayItemSchemas: {
      items: {
        stringToObjectField: 'value',
        aliases: [
          { target: 'value', sources: ['data', 'val', 'label'] },
        ],
      }
    }
  },

  'queue': {
    required: [],
    arrays: ['items'],
    defaults: { items: [] },
    arrayItemSchemas: {
      items: {
        stringToObjectField: 'value',
        aliases: [
          { target: 'value', sources: ['data', 'val', 'label'] },
        ],
      }
    }
  },

  'hash-table': {
    required: [],
    arrays: ['buckets'],
    defaults: { buckets: [] }
  },

  'dp-table': {
    required: [],
    arrays: ['rows', 'values'],
    defaults: { rows: [], columns: [], values: [] }
  },

  'complexity': {
    required: [],
    arrays: ['curves'],
    defaults: { curves: [] },
    arrayItemSchemas: {
      curves: {
        aliases: [
          { target: 'label', sources: ['name', 'title', 'notation'] },
          { target: 'notation', sources: ['complexity', 'bigO'] },
        ],
      }
    }
  },

  // ============================================
  // DATA DISPLAY SCENES
  // ============================================
  'data-display': {
    required: ['dataDisplayType'],
    arrays: [],
    defaults: { dataDisplayProps: {} },
    fieldAliases: [
      { target: 'dataDisplayType', sources: ['displayType', 'componentType', 'type'] },
      { target: 'dataDisplayProps', sources: ['props', 'componentProps', 'data'] },
    ],
  },

  // ============================================
  // MERMAID SCENES
  // ============================================
  'mermaid': {
    required: ['mermaidCode'],
    arrays: [],
    defaults: { mermaidCode: 'graph LR\n  A --> B' },
    fieldAliases: [
      { target: 'mermaidCode', sources: ['code', 'diagram', 'content'] },
    ],
  },

  'mermaid-flowchart': {
    required: ['mermaidCode'],
    arrays: [],
    defaults: { mermaidCode: 'graph LR\n  A --> B' },
    fieldAliases: [
      { target: 'mermaidCode', sources: ['code', 'diagram', 'content'] },
    ],
  },
};

// Default schema for unknown scene types
export const defaultSceneSchema: SceneSchema = {
  required: [],
  arrays: [],
  defaults: {},
};

export function getSceneSchema(sceneType: string): SceneSchema {
  return sceneSchemas[sceneType] || defaultSceneSchema;
}

// Get all known scene types
export function getKnownSceneTypes(): string[] {
  return Object.keys(sceneSchemas);
}
