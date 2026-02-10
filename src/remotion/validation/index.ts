// ============================================
// VALIDATION MODULE - Main exports
// ============================================

export * from './sceneSchemas';
export * from './validateScene';
export * from './dataDisplayNormalizers';
// Note: zodSchemas exports removed due to naming conflicts with sceneSchemas
// Use specific imports from './zodSchemas' if needed

// Re-export specific useful functions for debugging
export {
  getNormalizationReports,
  clearNormalizationReports,
  type NormalizationReport,
  type NormalizationChange,
} from './validateScene';

// Re-export Zod validation functions
export {
  validateSceneWithZod,
  validateScenesWithZod,
  formatZodErrors,
  validateDataDisplayProps,
  type ZodValidationResult,
} from './zodSchemas';
