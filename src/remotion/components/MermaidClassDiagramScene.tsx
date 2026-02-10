import React, { useEffect, useState, useId, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate } from 'remotion';
import mermaid from 'mermaid';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb } from '../styles/theme';
import { SceneContainer } from './Background';
import { SceneTitle } from './Typography';
import { useCameraState } from '../premium/camera/CameraController';
import type { CameraKeyframe } from '../premium/types';

// ============================================
// MERMAID CLASS DIAGRAM SCENE
// Renders mermaid classDiagram code to SVG
// for UML class diagrams, design patterns, etc.
// ============================================

interface MermaidClassDiagramSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  mermaidCode: string;
  theme?: ThemeColors;
}

// Track initialized render contexts by theme to avoid redundant Mermaid
// initialization calls. Note: This Set grows with unique theme combinations.
const initializedContexts = new Set<string>();

export const MermaidClassDiagramScene: React.FC<MermaidClassDiagramSceneProps> = ({
  badge,
  title,
  subtitle,
  mermaidCode,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const uniqueId = useId().replace(/:/g, '_');

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handle] = useState(() => delayRender('Rendering Mermaid class diagram SVG'));
  const [svgDimensions, setSvgDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderMermaid = async () => {
      try {
        // Initialize mermaid with dark theme optimized for class diagrams
        // Use context-specific key to handle concurrent renders safely
        // Include all theme colors used in initialization to ensure re-init on changes
        const contextKey = `mermaid-class-${theme.primary}-${theme.background}-${theme.text}-${theme.secondary}-${theme.textMuted}`;
        if (!initializedContexts.has(contextKey)) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              darkMode: true,
              background: theme.background,
              primaryColor: theme.primary,
              primaryTextColor: theme.text,
              primaryBorderColor: theme.primary,
              secondaryColor: theme.secondary,
              secondaryTextColor: theme.text,
              secondaryBorderColor: theme.secondary,
              tertiaryColor: `rgba(${hexToRgb(theme.primary)}, 0.1)`,
              lineColor: theme.textMuted,
              fontFamily: "'JetBrains Mono', 'Inter', monospace",
              fontSize: '14px',
              // Class diagram specific
              classText: theme.text,
              nodeTextColor: theme.text,
            },
            class: {
              htmlLabels: true,
              padding: 20,
              textHeight: 24,
            },
          });
          // Add to set after successful initialization
          initializedContexts.add(contextKey);
        }

        const mermaidId = `mermaid_class_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(mermaidId, mermaidCode);

        if (!cancelled) {
          setSvgContent(svg);
          continueRender(handle);
        }
      } catch (err) {
        console.error('Mermaid class diagram render error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render class diagram');
          continueRender(handle);
        }
      }
    };

    renderMermaid();

    return () => {
      cancelled = true;
    };
  }, []);

  // Animation: fade in the SVG container
  const svgOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const svgScale = interpolate(frame, [15, 35], [0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Auto-pan configuration for complex class diagrams
  const CONTAINER_W = 1600;
  const CONTAINER_H = 720;
  const MIN_SCALE_THRESHOLD = 0.78;
  const INTRO_END = 35;

  const autoPanKeyframes = useMemo<CameraKeyframe[]>(() => {
    if (!svgDimensions || !durationInFrames) return [];

    const { width: svgW, height: svgH } = svgDimensions;
    const fitScale = Math.min(CONTAINER_W / svgW, CONTAINER_H / svgH);

    // Chart fits fine — no pan needed
    if (fitScale >= MIN_SCALE_THRESHOLD) return [];

    // Class diagrams are typically horizontal, but detect layout
    const isWider = svgW > svgH * 1.5;
    const panAxis: 'vertical' | 'horizontal' = isWider ? 'horizontal' : 'vertical';

    // Calculate zoom level
    const zoomFactor = Math.min(1.0 / fitScale, 2.5);
    const effectiveZoom = Math.max(zoomFactor, 1.3);

    // Calculate number of sections
    const span = panAxis === 'vertical' ? CONTAINER_H : CONTAINER_W;
    const viewportSpan = span / effectiveZoom;
    const stepSize = viewportSpan * 0.85;
    const numSections = Math.max(2, Math.ceil(span / stepSize));

    // Time distribution
    const OVERVIEW_HOLD = Math.round(1.5 * fps);
    const OUTRO_HOLD = Math.round(1.0 * fps);
    const panStart = INTRO_END + OVERVIEW_HOLD;
    const panEnd = durationInFrames - OUTRO_HOLD;

    if (panEnd <= panStart + 60) return [];

    const framesPerSection = Math.floor((panEnd - panStart) / numSections);
    const maxPan = (span * (effectiveZoom - 1)) / 2;

    const keyframes: CameraKeyframe[] = [];

    // Overview hold
    keyframes.push({ frame: 0, x: 0, y: 0, scale: 1, rotation: 0 });
    keyframes.push({ frame: panStart, x: 0, y: 0, scale: 1, rotation: 0 });

    // Pan through sections
    for (let i = 0; i < numSections; i++) {
      const f = panStart + i * framesPerSection + 1;
      const progress = numSections === 1 ? 0.5 : i / (numSections - 1);
      const offset = -maxPan + progress * 2 * maxPan;
      keyframes.push({
        frame: f,
        x: panAxis === 'horizontal' ? -offset : 0,
        y: panAxis === 'vertical' ? -offset : 0,
        scale: effectiveZoom,
        rotation: 0,
      });
    }

    // Return to overview
    keyframes.push({ frame: panEnd, x: 0, y: 0, scale: 1, rotation: 0 });
    keyframes.push({ frame: durationInFrames, x: 0, y: 0, scale: 1, rotation: 0 });

    return keyframes;
  }, [svgDimensions, fps, durationInFrames]);

  const cameraState = useCameraState(autoPanKeyframes, 25);
  const isAutoPanning = autoPanKeyframes.length > 0;

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1600,
          marginTop: 20,
          opacity: svgOpacity,
          transform: `scale(${svgScale})`,
          overflow: 'hidden',
        }}
      >
        {error ? (
          <div
            style={{
              background: `rgba(${hexToRgb(theme.error)}, 0.1)`,
              border: `1px solid ${theme.error}`,
              borderRadius: 12,
              padding: 40,
              maxWidth: 800,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                color: theme.textMuted,
                marginBottom: 16,
              }}
            >
              Class Diagram Definition
            </div>
            <pre
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: theme.text,
                whiteSpace: 'pre-wrap',
                textAlign: 'left',
                lineHeight: 1.6,
              }}
            >
              {mermaidCode}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: `drop-shadow(0 0 20px rgba(${hexToRgb(theme.primary)}, 0.3))`,
              transform: isAutoPanning
                ? `scale(${cameraState.scale}) translate(${cameraState.x}px, ${cameraState.y}px)`
                : undefined,
              transformOrigin: 'center center',
            }}
            ref={(el) => {
              if (!el) return;
              const svg = el.querySelector('svg');
              if (svg) {
                const rawW = parseFloat(svg.getAttribute('width') || '0');
                const rawH = parseFloat(svg.getAttribute('height') || '0');
                const viewBox = svg.getAttribute('viewBox');

                let naturalW = rawW;
                let naturalH = rawH;
                if (viewBox) {
                  const parts = viewBox.split(/\s+|,/).map(Number);
                  if (parts.length === 4) {
                    naturalW = parts[2];
                    naturalH = parts[3];
                  }
                }

                if (naturalW > 0 && naturalH > 0 && !svgDimensions) {
                  setSvgDimensions({ width: naturalW, height: naturalH });
                }

                if (!svg.getAttribute('viewBox') && rawW && rawH) {
                  svg.setAttribute('viewBox', `0 0 ${rawW} ${rawH}`);
                }
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.style.maxWidth = '100%';
                svg.style.maxHeight = '100%';
                svg.style.objectFit = 'contain';
              }
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </div>
    </SceneContainer>
  );
};

export default MermaidClassDiagramScene;
