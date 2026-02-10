// ============================================
// SCENE ERROR BOUNDARY
// Enhanced error handling with:
// - Error tracking and collection for debugging
// - Scene data capture for diagnostics
// - Retry mechanism
// - Integration with validation reports
// ============================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

// ============================================
// ERROR TRACKING TYPES
// ============================================

export interface SceneError {
  sceneId: string;
  sceneType: string;
  error: Error;
  errorInfo?: ErrorInfo;
  sceneData?: Record<string, unknown>;
  timestamp: number;
  componentStack?: string;
}

// Global error collection for debugging (with size limit)
const MAX_COLLECTED_ERRORS = 100;
let collectedErrors: SceneError[] = [];

export function getSceneErrors(): SceneError[] {
  return [...collectedErrors];
}

export function clearSceneErrors(): void {
  collectedErrors = [];
}

function addSceneError(error: SceneError): void {
  // Check for duplicate (same sceneId and error message)
  const isDuplicate = collectedErrors.some(
    e => e.sceneId === error.sceneId && e.error.message === error.error.message
  );
  if (isDuplicate) return;

  collectedErrors.push(error);
  // Enforce max size - drop oldest errors
  if (collectedErrors.length > MAX_COLLECTED_ERRORS) {
    collectedErrors = collectedErrors.slice(-MAX_COLLECTED_ERRORS);
  }
}

export function logSceneErrorSummary(): void {
  if (collectedErrors.length === 0) {
    console.log('✅ [SceneErrors] No scene errors recorded');
    return;
  }

  console.group(`🚨 [SceneErrors] ${collectedErrors.length} scene error(s) occurred`);

  const byType = collectedErrors.reduce((acc, err) => {
    acc[err.sceneType] = (acc[err.sceneType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.table(byType);

  collectedErrors.forEach((err, i) => {
    console.group(`Error ${i + 1}: ${err.sceneType} (${err.sceneId})`);
    console.error('Message:', err.error.message);
    console.log('Scene data:', err.sceneData);
    console.groupEnd();
  });

  console.groupEnd();
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

interface SceneErrorBoundaryProps {
  children: ReactNode;
  sceneId?: string;
  sceneType?: string;
  sceneData?: Record<string, unknown>;
  fallback?: ReactNode;
  onError?: (error: SceneError) => void;
  showDetails?: boolean;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

const MAX_RETRIES = 1;

export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SceneErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { sceneId, sceneType, sceneData, onError } = this.props;
    const { retryCount } = this.state;

    // Create error record
    const sceneError: SceneError = {
      sceneId: sceneId || 'unknown',
      sceneType: sceneType || 'unknown',
      error,
      errorInfo,
      sceneData,
      timestamp: Date.now(),
      componentStack: errorInfo.componentStack ?? undefined,
    };

    // Add to global collection (with deduplication and size limit)
    addSceneError(sceneError);

    // Log the error with context
    console.group(`🚨 [SceneErrorBoundary] Error in scene "${sceneId || 'unknown'}" (type: ${sceneType || 'unknown'})`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    if (sceneData) {
      console.group('📋 Scene Data (for debugging):');
      try {
        console.log(JSON.stringify(sceneData, null, 2));
      } catch {
        console.log('Unable to stringify scene data:', sceneData);
      }
      console.groupEnd();
    }

    console.log('Component Stack:', errorInfo.componentStack);
    console.log(`Retry count: ${retryCount}/${MAX_RETRIES}`);
    console.groupEnd();

    // Call optional error handler
    if (onError) {
      onError(sceneError);
    }

    this.setState({ errorInfo });

    // Attempt retry if under limit
    if (retryCount < MAX_RETRIES) {
      console.log(`[SceneErrorBoundary] Attempting retry ${retryCount + 1}/${MAX_RETRIES}...`);
      this.retryTimeoutId = setTimeout(() => {
        this.retryTimeoutId = null;
        this.setState((prev) => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: prev.retryCount + 1,
        }));
      }, 100);
    }
  }

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, sceneId, sceneType, sceneData, fallback, showDetails } = this.props;

    if (hasError && retryCount >= MAX_RETRIES) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error placeholder
      return (
        <AbsoluteFill
          style={{
            backgroundColor: '#1a1a2e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <div
            style={{
              padding: '30px 50px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 16,
              border: '2px solid rgba(239, 68, 68, 0.3)',
              maxWidth: 800,
              textAlign: 'center',
            }}
          >
            {/* Error icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <span style={{ fontSize: 30 }}>⚠️</span>
            </div>

            {/* Error title */}
            <h3
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#EF4444',
                margin: '0 0 12px',
              }}
            >
              Scene Render Error
            </h3>

            {/* Scene info */}
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '0 0 16px',
              }}
            >
              {sceneType && `Type: ${sceneType}`}
              {sceneId && sceneType && ' | '}
              {sceneId && `ID: ${sceneId}`}
            </p>

            {/* Error message */}
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error?.message || 'Unknown error occurred'}
            </p>

            {/* Dev mode: Show scene data */}
            {showDetails && sceneData && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 8,
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: 'rgba(255, 255, 255, 0.4)',
                    margin: '0 0 8px',
                  }}
                >
                  Scene Data (dev mode):
                </p>
                <pre
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9,
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {(() => {
                    try {
                      const json = JSON.stringify(sceneData, null, 2);
                      return json.length > 1000 ? json.slice(0, 1000) + '...' : json;
                    } catch {
                      return '[Unable to stringify scene data]';
                    }
                  })()}
                </pre>
              </div>
            )}
          </div>
        </AbsoluteFill>
      );
    }

    return children;
  }
}

/**
 * HOC to wrap a scene component with error boundary
 */
export function withSceneErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  getSceneInfo?: (props: P) => { sceneId?: string; sceneType?: string; sceneData?: Record<string, unknown> }
) {
  const WithErrorBoundary: React.FC<P> = (props) => {
    const sceneInfo = getSceneInfo ? getSceneInfo(props) : {};

    return (
      <SceneErrorBoundary {...sceneInfo}>
        <WrappedComponent {...props} />
      </SceneErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `WithSceneErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
}

/**
 * Functional component version for wrapping children
 */
export const SceneErrorWrapper: React.FC<{
  children: ReactNode;
  sceneId?: string;
  sceneType?: string;
  sceneData?: Record<string, unknown>;
  showDetails?: boolean;
}> = ({ children, sceneId, sceneType, sceneData, showDetails }) => {
  return (
    <SceneErrorBoundary
      sceneId={sceneId}
      sceneType={sceneType}
      sceneData={sceneData}
      showDetails={showDetails}
    >
      {children}
    </SceneErrorBoundary>
  );
};

export default SceneErrorBoundary;
