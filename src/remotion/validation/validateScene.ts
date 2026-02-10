// ============================================
// SCENE VALIDATION & NORMALIZATION
// Validates and normalizes scene data before rendering
// ============================================

import { getSceneSchema, SceneSchema, FieldAlias, ArrayItemSchema } from './sceneSchemas';

// Enable verbose logging in development
const DEV_MODE = process.env.NODE_ENV !== 'production';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NormalizationChange {
  type: 'alias' | 'string-to-object' | 'default' | 'type-coercion' | 'id-generated' | 'label-copied';
  field: string;
  from: unknown;
  to: unknown;
  sceneId?: string;
}

export interface NormalizationReport {
  sceneId: string;
  sceneType: string;
  changes: NormalizationChange[];
  originalData?: Record<string, unknown>;
}

export interface ValidScene {
  id: string;
  type: string;
  [key: string]: unknown;
}

// Track normalization changes for debugging
let normalizationReports: NormalizationReport[] = [];

/**
 * Get all normalization reports (for debugging)
 */
export function getNormalizationReports(): NormalizationReport[] {
  return normalizationReports;
}

/**
 * Clear normalization reports
 */
export function clearNormalizationReports(): void {
  normalizationReports = [];
}

/**
 * Log normalization change for debugging
 */
function logNormalizationChange(
  sceneId: string,
  sceneType: string,
  change: NormalizationChange
): void {
  // Find or create report for this scene
  let report = normalizationReports.find(r => r.sceneId === sceneId);
  if (!report) {
    report = { sceneId, sceneType, changes: [] };
    normalizationReports.push(report);
  }
  report.changes.push(change);

  // Log in dev mode
  if (DEV_MODE) {
    const emoji = {
      'alias': '🔄',
      'string-to-object': '📦',
      'default': '📋',
      'type-coercion': '🔧',
      'id-generated': '🆔',
      'label-copied': '🏷️',
    }[change.type] || '⚠️';

    console.warn(
      `[Normalization] ${emoji} ${sceneType}/${sceneId}: ${change.type} on "${change.field}"`,
      `| "${JSON.stringify(change.from).slice(0, 50)}" → "${JSON.stringify(change.to).slice(0, 50)}"`
    );
  }
}

/**
 * Apply field aliases to an object - maps source fields to target fields
 */
function applyFieldAliases(
  obj: Record<string, any>,
  aliases: FieldAlias[],
  sceneId?: string,
  sceneType?: string
): Record<string, any> {
  const result = { ...obj };

  for (const alias of aliases) {
    // If target field is already set, skip
    if (result[alias.target] !== undefined && result[alias.target] !== null) {
      continue;
    }

    // Try each source field
    for (const source of alias.sources) {
      if (result[source] !== undefined && result[source] !== null) {
        result[alias.target] = result[source];

        // Log the alias mapping
        if (sceneId && sceneType) {
          logNormalizationChange(sceneId, sceneType, {
            type: 'alias',
            field: alias.target,
            from: { [source]: result[source] },
            to: { [alias.target]: result[source] },
          });
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Normalize an array item based on its schema
 */
function normalizeArrayItem(
  item: any,
  schema: ArrayItemSchema,
  index: number,
  fieldName: string,
  sceneId?: string,
  sceneType?: string
): any {
  // Handle null/undefined
  if (item == null) {
    return null;
  }

  const originalItem = item;

  // Convert string to object if schema specifies stringToObjectField
  if (typeof item === 'string' && schema.stringToObjectField) {
    const newItem = { [schema.stringToObjectField]: item };
    if (sceneId && sceneType) {
      logNormalizationChange(sceneId, sceneType, {
        type: 'string-to-object',
        field: `${fieldName}[${index}]`,
        from: item,
        to: newItem,
      });
    }
    item = newItem;
  }

  // Convert number/primitive to object if needed
  if (typeof item !== 'object') {
    if (schema.stringToObjectField) {
      const newItem = { [schema.stringToObjectField]: item };
      if (sceneId && sceneType) {
        logNormalizationChange(sceneId, sceneType, {
          type: 'type-coercion',
          field: `${fieldName}[${index}]`,
          from: item,
          to: newItem,
        });
      }
      item = newItem;
    } else {
      // Keep primitive as-is if no conversion specified
      return item;
    }
  }

  // Apply aliases if present
  if (schema.aliases && schema.aliases.length > 0) {
    item = applyFieldAliases(item, schema.aliases, sceneId, sceneType);
  }

  // Ensure item has an id if it should have one (for entities, states, nodes, etc.)
  if (item && typeof item === 'object' && !item.id) {
    // Check if 'id' is a target in aliases - if so, it should exist
    const hasIdAlias = schema.aliases?.some(a => a.target === 'id');
    if (hasIdAlias || item.label || item.name) {
      const generatedId = item.label || item.name || `item-${index}-${Math.random().toString(36).slice(2, 8)}`;
      item.id = generatedId;
      if (sceneId && sceneType) {
        logNormalizationChange(sceneId, sceneType, {
          type: 'id-generated',
          field: `${fieldName}[${index}].id`,
          from: undefined,
          to: generatedId,
        });
      }
    }
  }

  // Ensure item has a label if it has an id (for display purposes)
  if (item && typeof item === 'object' && item.id && !item.label) {
    const hasLabelAlias = schema.aliases?.some(a => a.target === 'label');
    if (hasLabelAlias) {
      item.label = item.id;
      if (sceneId && sceneType) {
        logNormalizationChange(sceneId, sceneType, {
          type: 'label-copied',
          field: `${fieldName}[${index}].label`,
          from: undefined,
          to: item.id,
        });
      }
    }
  }

  return item;
}

/**
 * Validates a single scene and returns validation result
 */
export function validateScene(scene: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if scene is an object
  if (!scene || typeof scene !== 'object') {
    errors.push('Scene must be a non-null object');
    return { valid: false, errors, warnings };
  }

  const sceneObj = scene as Record<string, unknown>;

  // Check for required type field
  if (!sceneObj.type || typeof sceneObj.type !== 'string') {
    errors.push('Scene must have a "type" field');
    return { valid: false, errors, warnings };
  }

  // Get schema for this scene type
  const schema = getSceneSchema(sceneObj.type);

  // Check required fields (after applying aliases in normalization)
  // This is a soft check - we'll apply defaults later
  for (const field of schema.required) {
    if (sceneObj[field] === undefined || sceneObj[field] === null) {
      // Check if any alias source is present
      const aliasConfig = schema.fieldAliases?.find(a => a.target === field);
      const hasAliasValue = aliasConfig?.sources.some(
        source => sceneObj[source] !== undefined && sceneObj[source] !== null
      );

      if (!hasAliasValue && schema.defaults[field] === undefined) {
        warnings.push(`Missing required field "${field}" for scene type "${sceneObj.type}"`);
      }
    }
  }

  // Check array fields
  for (const field of schema.arrays) {
    const value = sceneObj[field];
    if (value !== undefined && !Array.isArray(value)) {
      warnings.push(`Field "${field}" should be an array, got ${typeof value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Normalizes a scene by applying defaults, aliases, and ensuring arrays are valid
 */
export function normalizeScene(scene: Record<string, any>): Record<string, any> {
  const sceneType = scene.type;
  const schema = getSceneSchema(sceneType);

  // Start with a copy of the scene
  let normalized = { ...scene };

  // Ensure scene has an id first (needed for logging)
  const hadId = !!normalized.id;
  if (!normalized.id) {
    // Use crypto.randomUUID if available for better randomness, otherwise fall back
    const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).substring(2, 11);
    normalized.id = `scene-${sceneType}-${randomPart}`;
  }
  const sceneId = normalized.id;

  if (!hadId) {
    logNormalizationChange(sceneId, sceneType, {
      type: 'id-generated',
      field: 'id',
      from: undefined,
      to: sceneId,
    });
  }

  // Apply field-level aliases first
  if (schema.fieldAliases && schema.fieldAliases.length > 0) {
    normalized = applyFieldAliases(normalized, schema.fieldAliases, sceneId, sceneType);
  }

  // Apply defaults for missing fields
  for (const [key, defaultValue] of Object.entries(schema.defaults)) {
    if (normalized[key] === undefined || normalized[key] === null) {
      // Deep clone defaults to prevent mutation
      // Use structuredClone if available (faster), otherwise fall back to JSON
      normalized[key] = typeof structuredClone === 'function'
        ? structuredClone(defaultValue)
        : JSON.parse(JSON.stringify(defaultValue));
      logNormalizationChange(sceneId, sceneType, {
        type: 'default',
        field: key,
        from: undefined,
        to: defaultValue,
      });
    }
  }

  // Normalize array fields
  for (const field of schema.arrays) {
    // Ensure it's an array
    if (!Array.isArray(normalized[field])) {
      const wasValue = normalized[field];
      normalized[field] = wasValue != null ? [wasValue] : [];
      if (wasValue != null) {
        logNormalizationChange(sceneId, sceneType, {
          type: 'type-coercion',
          field,
          from: wasValue,
          to: [wasValue],
        });
      }
    }

    // Get item schema for this array
    const itemSchema = schema.arrayItemSchemas?.[field];

    // Normalize each item and filter out nulls
    normalized[field] = normalized[field]
      .map((item: any, index: number) => {
        if (itemSchema) {
          return normalizeArrayItem(item, itemSchema, index, field, sceneId, sceneType);
        }
        return item;
      })
      .filter((item: any) => item != null);
  }

  // Handle nested arrays (arrays within array items)
  if (schema.nested) {
    for (const [parentField, childArrays] of Object.entries(schema.nested)) {
      if (Array.isArray(normalized[parentField])) {
        normalized[parentField] = normalized[parentField].map((item: unknown) => {
          if (!item || typeof item !== 'object') return item;

          const normalizedItem = { ...item } as Record<string, unknown>;
          for (const childField of childArrays) {
            if (!Array.isArray(normalizedItem[childField])) {
              normalizedItem[childField] = normalizedItem[childField]
                ? [normalizedItem[childField]]
                : [];
            }
          }
          return normalizedItem;
        });
      }
    }
  }

  // Special normalization for specific scene types
  normalized = applySceneSpecificNormalization(normalized, sceneType);

  return normalized;
}

/**
 * Apply scene-specific normalization rules that can't be expressed in schema
 */
function applySceneSpecificNormalization(scene: Record<string, any>, sceneType: string): Record<string, any> {
  switch (sceneType) {
    case 'state':
      // Ensure each state has a unique id derived from label if needed
      if (Array.isArray(scene.states)) {
        const seenIds = new Set<string>();
        scene.states = scene.states.map((state: any, index: number) => {
          if (!state || typeof state !== 'object') return state;

          let id = state.id;
          // Make id unique if duplicate
          if (seenIds.has(id)) {
            id = `${id}-${index}`;
          }
          seenIds.add(id);

          return {
            ...state,
            id,
            label: state.label || state.id || `State ${index + 1}`,
          };
        });
      }
      break;

    case 'sequence':
      // Ensure message type is valid
      if (Array.isArray(scene.messages)) {
        scene.messages = scene.messages.map((msg: any) => {
          if (!msg || typeof msg !== 'object') return msg;

          let type = msg.type;
          // Map direction to type if needed
          if (!type && msg.direction) {
            type = msg.direction === 'response' ? 'response' : 'request';
          }
          // Validate type
          if (!['request', 'response', 'async', 'error'].includes(type)) {
            type = 'request';
          }

          return { ...msg, type };
        });
      }
      break;

    case 'timeline':
      // Ensure events have dates
      if (Array.isArray(scene.events)) {
        scene.events = scene.events.map((event: any, index: number) => {
          if (!event || typeof event !== 'object') return event;

          return {
            ...event,
            date: event.date || event.time || `Step ${index + 1}`,
          };
        });
      }
      break;

    case 'architecture':
      // Ensure components have valid layer
      if (Array.isArray(scene.components)) {
        scene.components = scene.components.map((comp: any, index: number) => {
          if (!comp || typeof comp !== 'object') return comp;

          let layer = comp.layer;
          // Validate layer
          if (!['client', 'server', 'database', 'external'].includes(layer)) {
            // Try to infer from name/label
            const label = (comp.label || comp.name || '').toLowerCase();
            if (label.includes('client') || label.includes('ui') || label.includes('frontend')) {
              layer = 'client';
            } else if (label.includes('db') || label.includes('database') || label.includes('storage')) {
              layer = 'database';
            } else if (label.includes('api') || label.includes('external') || label.includes('third')) {
              layer = 'external';
            } else {
              layer = 'server';
            }
          }

          return { ...comp, layer };
        });
      }
      break;

    case 'comparison':
      // Ensure columns have items arrays
      if (Array.isArray(scene.columns)) {
        scene.columns = scene.columns.map((col: any, index: number) => {
          if (!col || typeof col !== 'object') {
            return { title: String(col), items: [] };
          }

          return {
            ...col,
            title: col.title || col.label || col.heading || `Column ${index + 1}`,
            items: Array.isArray(col.items) ? col.items : [],
          };
        });
      }
      break;

    case 'radial':
      // Ensure centerLabel is an object
      if (scene.centerLabel && typeof scene.centerLabel === 'string') {
        scene.centerLabel = { label: scene.centerLabel };
      }
      if (!scene.centerLabel || typeof scene.centerLabel !== 'object') {
        scene.centerLabel = { label: 'Center' };
      }
      if (!scene.centerLabel.label) {
        scene.centerLabel.label = scene.centerLabel.text || scene.centerLabel.title || 'Center';
      }
      break;

    case 'data-display':
      // Ensure dataDisplayProps is an object
      if (!scene.dataDisplayProps || typeof scene.dataDisplayProps !== 'object') {
        scene.dataDisplayProps = {};
      }
      break;
  }

  return scene;
}

/**
 * Validates and normalizes a scene, returning null if invalid
 */
export function validateAndNormalizeScene(scene: unknown): ValidScene | null {
  // Validate first
  const validation = validateScene(scene);

  if (!validation.valid) {
    console.error('[SceneValidation] Invalid scene:', validation.errors);
    return null;
  }

  // Log warnings but continue
  if (validation.warnings.length > 0) {
    console.warn('[SceneValidation] Scene warnings:', validation.warnings);
  }

  // Normalize the scene
  const normalized = normalizeScene(scene as Record<string, any>);

  return normalized as ValidScene;
}

/**
 * Validates and normalizes an array of scenes
 * Invalid scenes are filtered out with warnings logged
 */
export function validateScenes(scenes: unknown[]): ValidScene[] {
  // Clear previous reports for fresh analysis
  clearNormalizationReports();

  if (!Array.isArray(scenes)) {
    console.error('[SceneValidation] Scenes must be an array, got:', typeof scenes);
    return [];
  }

  const validScenes: ValidScene[] = [];

  scenes.forEach((scene, index) => {
    const validated = validateAndNormalizeScene(scene);
    if (validated) {
      validScenes.push(validated);
    } else {
      console.warn(`[SceneValidation] Skipping invalid scene at index ${index}`);
    }
  });

  console.log(`[SceneValidation] ${validScenes.length}/${scenes.length} scenes valid`);

  // Print normalization summary in dev mode
  if (DEV_MODE && normalizationReports.length > 0) {
    const totalChanges = normalizationReports.reduce((sum, r) => sum + r.changes.length, 0);
    console.log(`\n[SceneValidation] 📊 NORMALIZATION SUMMARY`);
    console.log(`  Scenes with changes: ${normalizationReports.length}`);
    console.log(`  Total normalizations: ${totalChanges}`);

    // Group by change type
    const byType: Record<string, number> = {};
    normalizationReports.forEach(r => {
      r.changes.forEach(c => {
        byType[c.type] = (byType[c.type] || 0) + 1;
      });
    });

    console.log(`  By type:`);
    Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      const emoji = {
        'alias': '🔄',
        'string-to-object': '📦',
        'default': '📋',
        'type-coercion': '🔧',
        'id-generated': '🆔',
        'label-copied': '🏷️',
      }[type] || '⚠️';
      console.log(`    ${emoji} ${type}: ${count}`);
    });

    // Show most problematic scenes
    const sorted = [...normalizationReports].sort((a, b) => b.changes.length - a.changes.length);
    if (sorted.length > 0 && sorted[0].changes.length > 3) {
      console.log(`\n  ⚠️ Scenes with most changes (consider fixing LLM prompts):`);
      sorted.slice(0, 5).forEach(r => {
        console.log(`    ${r.sceneType}/${r.sceneId}: ${r.changes.length} changes`);
      });
    }
    console.log('');
  }

  return validScenes;
}

/**
 * Quick check if a scene is renderable (has type and basic structure)
 */
export function isRenderableScene(scene: unknown): scene is ValidScene {
  if (!scene || typeof scene !== 'object') return false;
  const sceneObj = scene as Record<string, unknown>;
  return typeof sceneObj.type === 'string' && sceneObj.type.length > 0;
}

/**
 * Normalize a single scene without full validation (for inline use)
 */
export function quickNormalize(scene: Record<string, any>): Record<string, any> {
  if (!scene || typeof scene !== 'object' || !scene.type) {
    return scene;
  }
  return normalizeScene(scene);
}

// ============================================
// ZOD VALIDATION INTEGRATION
// ============================================

// Import Zod validation functions lazily to avoid circular dependencies
type ZodValidationModule = typeof import('./zodSchemas');
let zodValidation: ZodValidationModule | null = null;

async function loadZodValidation() {
  if (!zodValidation) {
    zodValidation = await import('./zodSchemas');
  }
  return zodValidation;
}

/**
 * Validate scenes with Zod (stricter runtime type checking)
 * This is optional and runs after normalization for additional type safety
 */
export async function validateScenesWithZodAsync(scenes: ValidScene[]): Promise<{
  validScenes: ValidScene[];
  zodErrors: Array<{ sceneId: string; sceneType: string; errors: string[] }>;
}> {
  const zod = await loadZodValidation();
  const result = zod.validateScenesWithZod(scenes);

  const zodErrors = result.errors.map(err => ({
    sceneId: err.sceneId || 'unknown',
    sceneType: err.sceneType || 'unknown',
    errors: err.errors ? zod.formatZodErrors(err.errors) : ['Unknown validation error'],
  }));

  if (DEV_MODE && zodErrors.length > 0) {
    console.group('[ZodValidation] Type checking errors');
    zodErrors.forEach((err, i) => {
      console.warn(`  ${i + 1}. ${err.sceneType}/${err.sceneId}:`);
      err.errors.forEach(e => console.warn(`     - ${e}`));
    });
    console.groupEnd();
  }

  return {
    validScenes: result.validScenes as ValidScene[],
    zodErrors,
  };
}

/**
 * Synchronous Zod validation (loads module eagerly)
 * Use this when you need immediate validation
 */
export function validateScenesWithZodSync(scenes: ValidScene[]): {
  validScenes: ValidScene[];
  zodErrors: Array<{ sceneId: string; sceneType: string; errors: string[] }>;
} {
  // Dynamically require to avoid issues if Zod isn't installed
  try {
    const zod = require('./zodSchemas') as ZodValidationModule;
    const result = zod.validateScenesWithZod(scenes);

    interface ZodErrorItem {
      sceneId?: string;
      sceneType?: string;
      errors?: Parameters<typeof zod.formatZodErrors>[0];
    }

    const zodErrors = result.errors.map((err: ZodErrorItem) => ({
      sceneId: err.sceneId || 'unknown',
      sceneType: err.sceneType || 'unknown',
      errors: err.errors ? zod.formatZodErrors(err.errors) : ['Unknown validation error'],
    }));

    if (DEV_MODE && zodErrors.length > 0) {
      console.group('[ZodValidation] Type checking errors');
      zodErrors.forEach((err: { sceneId: string; sceneType: string; errors: string[] }, i: number) => {
        console.warn(`  ${i + 1}. ${err.sceneType}/${err.sceneId}:`);
        err.errors.forEach((e: string) => console.warn(`     - ${e}`));
      });
      console.groupEnd();
    }

    return {
      validScenes: result.validScenes as ValidScene[],
      zodErrors,
    };
  } catch (error) {
    console.warn('[ZodValidation] Failed to load Zod schemas:', error instanceof Error ? error.message : String(error));
    return { validScenes: scenes, zodErrors: [] };
  }
}

/**
 * Full validation pipeline with Zod (synchronous version)
 * 1. Validates scenes with schema-based validation
 * 2. Normalizes scenes (applies aliases, defaults, etc.)
 * 3. Validates with Zod for runtime type safety
 */
export function validateScenesStrict(scenes: unknown[]): ValidScene[] {
  // Step 1 & 2: Schema validation + normalization
  const normalizedScenes = validateScenes(scenes);

  // Step 3: Zod validation
  const { validScenes, zodErrors } = validateScenesWithZodSync(normalizedScenes);

  // In strict mode, we still return all normalized scenes
  // but log the Zod errors for debugging
  // (Zod errors don't prevent rendering, just help identify issues)
  if (zodErrors.length > 0) {
    console.warn(`[StrictValidation] ${zodErrors.length} scenes have Zod type issues (see above)`);
  }

  return normalizedScenes; // Return all normalized scenes, Zod is informational
}
