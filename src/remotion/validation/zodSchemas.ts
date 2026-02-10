// ============================================
// ZOD SCHEMAS - Runtime Type Validation
// Provides strict type checking for scene data
// ============================================

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

// Base scene schema that all scenes must have
const BaseSceneSchema = z.object({
  id: z.string(),
  type: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  narration: z.string().optional(),
});

// Common entity schema (for sequence, state, etc.)
const EntitySchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// Connection/transition schema
const ConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  type: z.string().optional(),
});

// Card schema for content scenes
const CardSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  variant: z.enum(['default', 'success', 'warning', 'error', 'info']).optional(),
});

// Supporting card schema for composite layouts (code + context, image + explanation)
const SupportingCardSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  variant: z.enum(['default', 'success', 'warning', 'info']).optional(),
});

// Card position schema for split layouts
const CardPositionSchema = z.enum(['right', 'left', 'bottom']).optional();

// Step schema for flow scenes
const StepSchema = z.object({
  icon: z.string(),
  label: z.string(),
  description: z.string().optional(),
  variant: z.enum(['default', 'primary', 'success', 'warning']).optional(),
});

// Point schema for summary scenes
const PointSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

// Event schema for timeline
const EventSchema = z.object({
  year: z.union([z.string(), z.number()]).optional(),
  label: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

// Column schema for comparison
const ColumnSchema = z.object({
  header: z.string(),
  items: z.array(z.union([z.string(), z.object({ text: z.string(), icon: z.string().optional() })])),
  highlighted: z.boolean().optional(),
});

// ============================================
// SCENE-SPECIFIC SCHEMAS
// ============================================

export const IntroSceneSchema = BaseSceneSchema.extend({
  type: z.literal('intro'),
  mainTitle: z.string(),
  subtitle: z.string().optional(),
  icons: z.array(z.string()).default([]),
  highlightedWord: z.string().optional(),
});

export const ContentSceneSchema = BaseSceneSchema.extend({
  type: z.literal('content'),
  cards: z.array(CardSchema).default([]),
  layout: z.enum(['grid', 'list']).optional(),
});

export const CodeSceneSchema = BaseSceneSchema.extend({
  type: z.literal('code'),
  code: z.string(),
  language: z.string().default('javascript'),
  filename: z.string().optional(),
  highlightLines: z.array(z.number()).optional(),
  output: z.array(z.object({
    text: z.string(),
    type: z.enum(['normal', 'success', 'error']).optional(),
    delay: z.number().optional(),
  })).optional(),
  supportingCards: z.array(SupportingCardSchema).optional(),
  cardPosition: CardPositionSchema,
});

export const FlowSceneSchema = BaseSceneSchema.extend({
  type: z.literal('flow'),
  steps: z.array(StepSchema).default([]),
  explanationCards: z.array(CardSchema).optional(),
});

export const SequenceSceneSchema = BaseSceneSchema.extend({
  type: z.literal('sequence'),
  entities: z.array(EntitySchema).default([]),
  messages: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string(),
    type: z.enum(['request', 'response', 'error', 'async']).optional(),
  })).default([]),
});

export const StateSceneSchema = BaseSceneSchema.extend({
  type: z.literal('state'),
  states: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['initial', 'normal', 'final']).optional(),
    description: z.string().optional(),
  })).default([]),
  transitions: z.array(ConnectionSchema).default([]),
});

export const ArchitectureSceneSchema = BaseSceneSchema.extend({
  type: z.literal('architecture'),
  layers: z.array(z.object({
    name: z.string(),
    components: z.array(z.string()),
    color: z.string().optional(),
  })).optional(),
  components: z.array(z.any()).default([]),
  connections: z.array(ConnectionSchema).default([]),
});

export const NetworkSceneSchema = BaseSceneSchema.extend({
  type: z.literal('network'),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    position: z.any().optional(),
    size: z.enum(['sm', 'md', 'lg']).optional(),
    highlight: z.boolean().optional(),
  })).default([]),
  connections: z.array(ConnectionSchema).default([]),
});

export const RadialSceneSchema = BaseSceneSchema.extend({
  type: z.literal('radial'),
  center: z.object({
    label: z.string(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  centerLabel: z.union([
    z.string(),
    z.object({
      label: z.string(),
      icon: z.string().optional(),
      color: z.string().optional(),
    }),
  ]).optional(),
  satellites: z.array(z.object({
    icon: z.string(),
    label: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
  })).default([]),
  items: z.array(z.any()).default([]),
});

export const ComparisonSceneSchema = BaseSceneSchema.extend({
  type: z.literal('comparison'),
  columns: z.array(ColumnSchema).default([]),
  highlightColumn: z.number().optional(),
});

export const TimelineSceneSchema = BaseSceneSchema.extend({
  type: z.literal('timeline'),
  events: z.array(EventSchema).default([]),
});

export const SummarySceneSchema = BaseSceneSchema.extend({
  type: z.literal('summary'),
  points: z.array(PointSchema).default([]),
  callToAction: z.object({
    text: z.string().optional(),
    title: z.string().optional(),
    url: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export const FlowchartSceneSchema = BaseSceneSchema.extend({
  type: z.literal('flowchart'),
  mermaidCode: z.string(),
});

export const DomainDiagramSceneSchema = BaseSceneSchema.extend({
  type: z.literal('domain-diagram'),
  domain: z.string().optional(),
  domainComponents: z.array(z.object({
    id: z.string(),
    componentType: z.string(),
    label: z.string(),
    sublabel: z.string().optional(),
    x: z.number(),
    y: z.number(),
  })).default([]),
  domainConnections: z.array(ConnectionSchema).default([]),
  domainClusters: z.array(z.any()).default([]),
});

export const DataDisplaySceneSchema = BaseSceneSchema.extend({
  type: z.literal('data-display'),
  dataDisplayType: z.string(),
  dataDisplayProps: z.record(z.any()).default({}),
});

export const ImageSceneSchema = BaseSceneSchema.extend({
  type: z.literal('image'),
  imageUrl: z.string(),
  caption: z.string().optional(),
  zoom: z.number().optional(),
  supportingCards: z.array(SupportingCardSchema).optional(),
  cardPosition: CardPositionSchema,
});

export const BrandingSceneSchema = BaseSceneSchema.extend({
  type: z.literal('branding'),
  imageUrl: z.string().optional(),
  animation: z.string().optional(),
});

// ============================================
// UNION SCHEMA FOR ALL SCENE TYPES
// ============================================

export const SceneSchema = z.discriminatedUnion('type', [
  IntroSceneSchema,
  ContentSceneSchema,
  CodeSceneSchema,
  FlowSceneSchema,
  SequenceSceneSchema,
  StateSceneSchema,
  ArchitectureSceneSchema,
  NetworkSceneSchema,
  RadialSceneSchema,
  ComparisonSceneSchema,
  TimelineSceneSchema,
  SummarySceneSchema,
  FlowchartSceneSchema,
  DomainDiagramSceneSchema,
  DataDisplaySceneSchema,
  ImageSceneSchema,
  BrandingSceneSchema,
]);

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ZodValidationResult {
  success: boolean;
  data?: z.infer<typeof BaseSceneSchema>;
  errors?: z.ZodError;
  sceneId?: string;
  sceneType?: string;
}

/**
 * Validate a single scene with Zod
 * Returns validation result with errors if any
 */
export function validateSceneWithZod(scene: unknown): ZodValidationResult {
  // First check if it's an object with type
  if (!scene || typeof scene !== 'object') {
    return {
      success: false,
      errors: new z.ZodError([{
        code: 'invalid_type',
        expected: 'object',
        received: typeof scene,
        path: [],
        message: 'Scene must be an object',
      }]),
    };
  }

  const sceneObj = scene as Record<string, unknown>;
  const sceneId = sceneObj.id as string | undefined;
  const sceneType = sceneObj.type as string | undefined;

  // Try to validate with the discriminated union
  const result = SceneSchema.safeParse(scene);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      sceneId,
      sceneType,
    };
  }

  // If discriminated union fails, fall back to base schema
  // This allows unknown scene types to pass through
  const baseResult = BaseSceneSchema.safeParse(scene);

  if (baseResult.success) {
    // Log warning about unknown scene type
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ZodValidation] Unknown scene type "${sceneType}" - passed base validation only`);
    }
    return {
      success: true,
      data: baseResult.data,
      sceneId,
      sceneType,
    };
  }

  return {
    success: false,
    errors: result.error,
    sceneId,
    sceneType,
  };
}

/**
 * Validate all scenes and return validation report
 */
export function validateScenesWithZod(scenes: unknown[]): {
  validScenes: Array<z.infer<typeof BaseSceneSchema>>;
  errors: ZodValidationResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    byType: Record<string, { valid: number; invalid: number }>;
  };
} {
  const results = scenes.map(validateSceneWithZod);
  const validScenes: Array<z.infer<typeof BaseSceneSchema>> = [];
  const errors: ZodValidationResult[] = [];
  const byType: Record<string, { valid: number; invalid: number }> = {};

  results.forEach((result) => {
    const sceneType = result.sceneType || 'unknown';

    if (!byType[sceneType]) {
      byType[sceneType] = { valid: 0, invalid: 0 };
    }

    if (result.success && result.data) {
      validScenes.push(result.data);
      byType[sceneType].valid++;
    } else {
      errors.push(result);
      byType[sceneType].invalid++;
    }
  });

  const summary = {
    total: scenes.length,
    valid: validScenes.length,
    invalid: errors.length,
    byType,
  };

  // Log summary in development
  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    console.group(`[ZodValidation] ${errors.length} scene(s) failed validation`);
    errors.forEach((err, i) => {
      console.group(`Error ${i + 1}: ${err.sceneType} (${err.sceneId})`);
      console.error('Issues:', err.errors?.issues);
      console.groupEnd();
    });
    console.groupEnd();
  }

  return { validScenes, errors, summary };
}

/**
 * Get human-readable error message from Zod errors
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.join('.');
    return `${path || 'root'}: ${issue.message}`;
  });
}

// ============================================
// DATA DISPLAY PROPS SCHEMAS
// ============================================

export const FeatureMatrixPropsSchema = z.object({
  columns: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
  })),
  rows: z.array(z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
  })),
  cells: z.record(z.record(z.union([z.boolean(), z.string()]))),
});

export const ProsConsPropsSchema = z.object({
  pros: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })),
  cons: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })),
});

export const MindMapPropsSchema = z.object({
  center: z.object({
    label: z.string(),
    icon: z.string().optional(),
  }),
  branches: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    children: z.array(z.object({
      label: z.string(),
    })).optional(),
  })),
});

export const WarningCardPropsSchema = z.object({
  title: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  icon: z.string().optional(),
});

export const InfoPanelPropsSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  body: z.string(),
  variant: z.enum(['default', 'tip', 'note', 'warning', 'important']).optional(),
});

// Export schemas for use in validation
export const DataDisplayPropsSchemas: Record<string, z.ZodSchema> = {
  'feature-matrix': FeatureMatrixPropsSchema,
  'pros-cons': ProsConsPropsSchema,
  'mind-map': MindMapPropsSchema,
  'warning-card': WarningCardPropsSchema,
  'info-panel': InfoPanelPropsSchema,
};

/**
 * Validate data-display props based on type
 */
export function validateDataDisplayProps(type: string, props: unknown): ZodValidationResult {
  const schema = DataDisplayPropsSchemas[type];

  if (!schema) {
    // No specific schema, just pass through
    return { success: true, data: props as any };
  }

  const result = schema.safeParse(props);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error,
  };
}
