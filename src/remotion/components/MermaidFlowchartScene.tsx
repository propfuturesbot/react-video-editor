import React, { useEffect, useState, useId, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate, spring } from 'remotion';
import mermaid from 'mermaid';
import { ThemeColors } from '../types';
import { defaultTheme, hexToRgb } from '../styles/theme';
import { SceneContainer } from './Background';
import { SceneTitle } from './Typography';

// ============================================
// MERMAID FLOWCHART SCENE
// Renders mermaid code to SVG with auto-pan
// for complex flowcharts and gradient styling
// ============================================

interface MermaidFlowchartSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  mermaidCode: string;
  theme?: ThemeColors;
}

// Vibrant color palette for flowchart nodes
const GRADIENT_COLORS = {
  purple: { start: '#8B5CF6', end: '#6366F1' },
  cyan: { start: '#06B6D4', end: '#0891B2' },
  pink: { start: '#EC4899', end: '#DB2777' },
  green: { start: '#10B981', end: '#059669' },
  orange: { start: '#F97316', end: '#EA580C' },
  blue: { start: '#3B82F6', end: '#2563EB' },
  red: { start: '#EF4444', end: '#DC2626' },
  yellow: { start: '#EAB308', end: '#CA8A04' },
};

export const MermaidFlowchartScene: React.FC<MermaidFlowchartSceneProps> = ({
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
  const [handle] = useState(() => delayRender('Rendering Mermaid flowchart SVG'));
  const [svgDimensions, setSvgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Generate gradient defs for SVG injection
  const gradientDefs = useMemo(() => {
    return `
      <defs>
        ${Object.entries(GRADIENT_COLORS).map(([name, colors]) => `
          <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
          </linearGradient>
        `).join('')}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
    `;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderMermaid = async () => {
      try {
        // Force re-initialization with vibrant theme
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: 'transparent',
            // Vibrant primary colors
            primaryColor: '#8B5CF6',
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#A78BFA',
            // Secondary colors
            secondaryColor: '#06B6D4',
            secondaryTextColor: '#FFFFFF',
            secondaryBorderColor: '#22D3EE',
            // Tertiary
            tertiaryColor: '#EC4899',
            tertiaryTextColor: '#FFFFFF',
            tertiaryBorderColor: '#F472B6',
            // Lines and text
            lineColor: '#94A3B8',
            textColor: '#FFFFFF',
            // Fonts
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '16px',
            // Node styling
            nodeBorder: '#A78BFA',
            mainBkg: '#8B5CF6',
            nodeTextColor: '#FFFFFF',
            // Edge labels
            edgeLabelBackground: 'rgba(30, 30, 50, 0.9)',
            // Cluster/subgraph styling
            clusterBkg: 'rgba(139, 92, 246, 0.15)',
            clusterBorder: '#A78BFA',
            // Additional styling
            titleColor: '#FFFFFF',
            actorBorder: '#A78BFA',
            actorBkg: '#8B5CF6',
            actorTextColor: '#FFFFFF',
            actorLineColor: '#94A3B8',
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 15,
            nodeSpacing: 60,
            rankSpacing: 70,
            useMaxWidth: false,
            defaultRenderer: 'dagre-wrapper',
          },
        });

        const mermaidId = `mermaid_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(mermaidId, mermaidCode);

        // Inject gradient definitions and enhance SVG
        let enhancedSvg = svg;

        // Add gradient defs after opening svg tag
        enhancedSvg = enhancedSvg.replace(/<svg([^>]*)>/, `<svg$1>${gradientDefs}`);

        // Apply styling to nodes - make them more vibrant
        enhancedSvg = enhancedSvg
          // Style node rectangles with gradients
          .replace(/class="node default/g, 'class="node default" filter="url(#shadow)"')
          // Make text more readable
          .replace(/<text([^>]*class="[^"]*nodeLabel[^"]*")/g, '<text$1 style="font-weight:600;font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,0.5)"')
          // Style cluster/subgraph backgrounds
          .replace(/class="cluster-label"/g, 'class="cluster-label" style="font-weight:700;font-size:16px;fill:#FFFFFF"')
          // Add glow to edges
          .replace(/class="flowchart-link/g, 'class="flowchart-link" style="stroke-width:2"');

        if (!cancelled) {
          setSvgContent(enhancedSvg);
          continueRender(handle);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render flowchart');
          continueRender(handle);
        }
      }
    };

    renderMermaid();

    return () => {
      cancelled = true;
    };
  }, [mermaidCode, gradientDefs, uniqueId, handle]);

  // Animation: fade in the SVG container
  const svgOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Auto-pan configuration
  const CONTAINER_W = 1600;
  const CONTAINER_H = 750;
  const INTRO_END = 35;

  // Calculate camera state for auto-pan
  const cameraState = useMemo(() => {
    if (!svgDimensions || !durationInFrames) {
      return { scale: 1, x: 0, y: 0 };
    }

    const { width: svgW, height: svgH } = svgDimensions;
    const fitScale = Math.min(CONTAINER_W / svgW, CONTAINER_H / svgH);

    // Determine if we need auto-pan (chart too dense when fit to screen)
    // If fitScale < 0.5, the chart is too big and text will be unreadable
    const needsAutoPan = fitScale < 0.55;

    if (!needsAutoPan) {
      // Simple case: chart fits fine, just scale to fit
      return { scale: fitScale, x: 0, y: 0 };
    }

    // Auto-pan logic for large charts
    const isHorizontal = svgW > svgH * 1.3;
    const panAxis = isHorizontal ? 'horizontal' : 'vertical';

    // Calculate zoom level to make text readable (target ~0.7-0.8 effective scale)
    const targetReadableScale = 0.75;
    const zoomScale = targetReadableScale / fitScale;
    const effectiveZoom = Math.min(Math.max(zoomScale, 1.5), 3.0);

    // Time segments
    const OVERVIEW_DURATION = Math.round(2.0 * fps); // 2 seconds overview
    const OUTRO_DURATION = Math.round(1.5 * fps);    // 1.5 seconds outro
    const panStartFrame = INTRO_END + OVERVIEW_DURATION;
    const panEndFrame = durationInFrames - OUTRO_DURATION;
    const panDuration = panEndFrame - panStartFrame;

    if (panDuration < fps * 2) {
      // Not enough time for panning, just show overview
      return { scale: fitScale, x: 0, y: 0 };
    }

    // Calculate number of sections to pan through
    const contentSpan = panAxis === 'vertical' ? svgH : svgW;
    const viewportSpan = (panAxis === 'vertical' ? CONTAINER_H : CONTAINER_W) / effectiveZoom;
    const numSections = Math.max(3, Math.ceil(contentSpan / (viewportSpan * 0.7)));

    // Calculate max pan distance (how far we can pan from center)
    const maxPanDistance = (contentSpan * fitScale * effectiveZoom - (panAxis === 'vertical' ? CONTAINER_H : CONTAINER_W)) / 2;

    // Determine current phase based on frame
    if (frame < panStartFrame) {
      // Overview phase - show entire chart
      return { scale: fitScale, x: 0, y: 0 };
    } else if (frame >= panEndFrame) {
      // Outro phase - back to overview from bottom position
      const outroProgress = spring({
        frame: frame - panEndFrame,
        fps,
        config: { damping: 15, stiffness: 100, mass: 1 },
        durationInFrames: OUTRO_DURATION,
      });
      const prevScale = fitScale * effectiveZoom;
      // Animate from bottom (positive pan) back to center
      const lastPanValue = panAxis === 'vertical' ? maxPanDistance : maxPanDistance;
      return {
        scale: interpolate(outroProgress, [0, 1], [prevScale, fitScale]),
        x: panAxis === 'horizontal' ? interpolate(outroProgress, [0, 1], [lastPanValue, 0]) : 0,
        y: panAxis === 'vertical' ? interpolate(outroProgress, [0, 1], [lastPanValue, 0]) : 0,
      };
    } else {
      // Panning phase - START FROM TOP, GO TO BOTTOM
      const panProgress = (frame - panStartFrame) / panDuration;
      // Clamp to prevent off-by-one when panProgress === 1.0
      const sectionIndex = Math.min(Math.floor(panProgress * numSections), numSections - 1);
      const sectionProgress = (panProgress * numSections) % 1;

      // Calculate pan position for current section
      // Progress 0 = top (negative pan), Progress 1 = bottom (positive pan)
      const sectionFraction = sectionIndex / Math.max(numSections - 1, 1);
      const nextSectionFraction = Math.min((sectionIndex + 1) / Math.max(numSections - 1, 1), 1);

      // Smooth transition between sections
      const smoothProgress = spring({
        frame: Math.floor(sectionProgress * (panDuration / numSections)),
        fps,
        config: { damping: 20, stiffness: 80, mass: 1 },
        durationInFrames: Math.floor(panDuration / numSections),
      });

      // TOP = negative pan value, BOTTOM = positive pan value
      // Start at -maxPanDistance (top), end at +maxPanDistance (bottom)
      const currentPan = interpolate(sectionFraction, [0, 1], [-maxPanDistance, maxPanDistance]);
      const nextPan = interpolate(nextSectionFraction, [0, 1], [-maxPanDistance, maxPanDistance]);
      const panValue = interpolate(smoothProgress, [0, 1], [currentPan, nextPan]);

      // Zoom in during first transition
      const zoomInProgress = spring({
        frame: frame - panStartFrame,
        fps,
        config: { damping: 15, stiffness: 100, mass: 1 },
        durationInFrames: Math.round(fps * 0.8),
      });
      const currentScale = interpolate(zoomInProgress, [0, 1], [fitScale, fitScale * effectiveZoom]);

      // For vertical charts: negative Y = show top, positive Y = show bottom
      // For horizontal charts: negative X = show left, positive X = show right
      return {
        scale: currentScale,
        x: panAxis === 'horizontal' ? -panValue : 0,
        y: panAxis === 'vertical' ? -panValue : 0,
      };
    }
  }, [svgDimensions, frame, fps, durationInFrames]);

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
          maxWidth: CONTAINER_W,
          height: CONTAINER_H,
          marginTop: 20,
          opacity: svgOpacity,
          overflow: 'hidden',
          position: 'relative',
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
              Flowchart Definition
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
              width: svgDimensions ? svgDimensions.width : '100%',
              height: svgDimensions ? svgDimensions.height : '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${cameraState.scale}) translate(${cameraState.x}px, ${cameraState.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
            }}
            ref={(el) => {
              if (!el) return;
              const svg = el.querySelector('svg');
              if (svg) {
                // Capture natural dimensions
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

                // Set dimensions if not already set
                if (naturalW > 0 && naturalH > 0 && !svgDimensions) {
                  setSvgDimensions({ width: naturalW, height: naturalH });
                }

                // Set viewBox if missing
                if (!svg.getAttribute('viewBox') && rawW && rawH) {
                  svg.setAttribute('viewBox', `0 0 ${rawW} ${rawH}`);
                }
              }
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </div>
    </SceneContainer>
  );
};

export default MermaidFlowchartScene;
