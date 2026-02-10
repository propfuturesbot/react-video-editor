// ============================================
// IDE CODE SCENE - MAIN ORCHESTRATOR COMPONENT
// ============================================
// This scene provides:
// - Zoom-in animation from small to full size
// - Typewriter effect with blinking cursor
// - Laser pointer with pulsing glow
// - External annotation panel with dashed connection lines
// - Auto-scrolling for long code
// - Multi-language syntax highlighting

import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { IDECodeSceneProps, PositionedAnnotation } from './types';
import { IDE_COLORS, TIMING, LAYOUT } from './constants';
import { fonts } from '../../fonts';
import IDEWindow from './IDEWindow';
import IntroScreen from './IntroScreen';
import AnnotationPanel from './AnnotationPanel';

// Canvas dimensions
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// Calculate laser position for an annotation based on line number
const calculateLaserPosition = (
  annotation: { line: number; keyword?: string },
  code: string,
  fontSize: number
): { x: number; y: number } => {
  const lines = code.split('\n');
  const targetLine = lines[annotation.line - 1] || '';

  // Y position based on line number
  const y = (annotation.line - 0.5) * LAYOUT.LINE_HEIGHT + 16;

  // X position - try to find the keyword, otherwise center of line
  let x = 100;
  if (annotation.keyword) {
    const keywordIndex = targetLine.indexOf(annotation.keyword);
    if (keywordIndex >= 0) {
      // Approximate character width for monospace font
      const charWidth = fontSize * 0.6;
      x = 16 + (keywordIndex + annotation.keyword.length / 2) * charWidth;
    }
  } else {
    // Point to middle of non-whitespace content
    const trimmedStart = targetLine.search(/\S/);
    const contentLength = targetLine.trim().length;
    if (trimmedStart >= 0) {
      const charWidth = fontSize * 0.6;
      x = 16 + (trimmedStart + contentLength / 2) * charWidth;
    }
  }

  return { x: Math.min(x, LAYOUT.CODE_AREA_MAX_X), y };
};

export const IDECodeScene: React.FC<IDECodeSceneProps> = ({
  code,
  language,
  filename,
  showIntro = false,
  introTitle,
  introSubtitle,
  annotations = [],
  visibleLines = LAYOUT.DEFAULT_VISIBLE_LINES,
  fontSize = LAYOUT.DEFAULT_FONT_SIZE,
  showLineNumbers = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Pre-compute positioned annotations with laser positions
  const positionedAnnotations: PositionedAnnotation[] = useMemo(
    () =>
      annotations.map((ann) => ({
        ...ann,
        position: calculateLaserPosition(ann, code, fontSize),
      })),
    [annotations, code, fontSize]
  );

  // Timeline calculations
  const INTRO_END = showIntro ? TIMING.INTRO_DURATION : 0;
  const ZOOM_START = showIntro ? TIMING.ZOOM_START : 0;
  const ZOOM_END = showIntro ? TIMING.ZOOM_END : 30;
  const TYPING_START = ZOOM_END + TIMING.TYPING_START_OFFSET;

  // Calculate when typing finishes
  const typingDuration = Math.ceil(code.length / TIMING.TYPING_SPEED);
  const ANNOTATION_START = TYPING_START + typingDuration + 30;

  // Intro progress (0-1 during intro phase)
  const introProgress = interpolate(frame, [0, INTRO_END], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  // Zoom progress
  const zoomProgress = interpolate(frame, [ZOOM_START, ZOOM_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoomScale = interpolate(
    zoomProgress,
    [0, 1],
    [TIMING.ZOOM_INITIAL_SCALE, TIMING.ZOOM_FINAL_SCALE]
  );

  // IDE opacity (fade in)
  const ideOpacity = spring({
    frame: frame - ZOOM_START,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Typing progress
  const typingProgress = Math.max(0, frame - TYPING_START) * TIMING.TYPING_SPEED;
  const typedCharCount = Math.min(Math.floor(typingProgress), code.length);

  // Current line for auto-scroll
  const typedCode = code.slice(0, typedCharCount);
  const currentLine = typedCode.split('\n').length;

  // Auto-scroll calculation
  const scrollThreshold = Math.floor(visibleLines * TIMING.SCROLL_THRESHOLD_PERCENT);
  const targetScrollLine = Math.max(0, currentLine - scrollThreshold);
  const scrollY = spring({
    frame: frame - TYPING_START,
    fps,
    from: 0,
    to: targetScrollLine * LAYOUT.LINE_HEIGHT,
    config: { damping: TIMING.SCROLL_DAMPING, stiffness: 100 },
  });

  // Annotation phase calculations
  const isAnnotating = frame >= ANNOTATION_START && positionedAnnotations.length > 0;
  const annotationFrame = Math.max(0, frame - ANNOTATION_START);

  // Calculate total cycle duration
  const totalAnnotationCycle =
    positionedAnnotations.length * TIMING.ANNOTATION_DURATION + TIMING.ANNOTATION_CYCLE_PAUSE;

  let currentAnnotationIndex = -1;
  let showAnnotation = false;
  let laserPosition = { x: 0, y: 0 };

  if (isAnnotating && positionedAnnotations.length > 0) {
    // Loop through annotations
    const cycleFrame = annotationFrame % totalAnnotationCycle;

    if (cycleFrame < positionedAnnotations.length * TIMING.ANNOTATION_DURATION) {
      currentAnnotationIndex = Math.floor(cycleFrame / TIMING.ANNOTATION_DURATION);
      const withinAnnotation = cycleFrame % TIMING.ANNOTATION_DURATION;

      // Show annotation box after delay, hide before end
      showAnnotation =
        withinAnnotation >= TIMING.ANNOTATION_DELAY &&
        withinAnnotation < TIMING.ANNOTATION_DURATION - TIMING.ANNOTATION_FADE_OUT;

      if (
        currentAnnotationIndex >= 0 &&
        currentAnnotationIndex < positionedAnnotations.length
      ) {
        laserPosition = positionedAnnotations[currentAnnotationIndex].position;
      }
    }
  }

  // Current annotation object
  const currentAnnotation =
    currentAnnotationIndex >= 0 && currentAnnotationIndex < positionedAnnotations.length
      ? positionedAnnotations[currentAnnotationIndex]
      : null;

  // Calculate blur during zoom
  const blurAmount = zoomScale < 0.5 ? (0.5 - zoomScale) * 8 : 0;

  // ============================================
  // LAYOUT CALCULATIONS FOR SIDE-BY-SIDE VIEW
  // ============================================

  // Total width of IDE + gap + annotation panel
  const totalContentWidth =
    LAYOUT.IDE_WIDTH + LAYOUT.ANNOTATION_GAP + LAYOUT.EXTERNAL_ANNOTATION_WIDTH;

  // Max visible code height
  const maxCodeHeight = visibleLines * LAYOUT.LINE_HEIGHT;

  // Check if laser is within visible code area
  const laserYInCodeArea = laserPosition.y - scrollY;
  const isLaserVisible = laserYInCodeArea >= 0 && laserYInCodeArea <= maxCodeHeight;

  // Calculate the center position of the combined content
  // Since we're using flexbox centering, calculate offsets from center
  const ideHalfWidth = LAYOUT.IDE_WIDTH / 2;
  const annotationHalfWidth = LAYOUT.EXTERNAL_ANNOTATION_WIDTH / 2;

  // IDE window right edge (from center)
  const ideRightEdge = CANVAS_WIDTH / 2 - LAYOUT.ANNOTATION_GAP / 2 - annotationHalfWidth + ideHalfWidth;

  // Annotation panel left edge (from center)
  const annotationPanelLeftEdge = CANVAS_WIDTH / 2 + LAYOUT.ANNOTATION_GAP / 2 + ideHalfWidth - annotationHalfWidth;

  // Calculate screen-space coordinates for the dashed connection line
  // The laser is inside the code area, which is offset by gutter width + padding
  const codeAreaLeftOffset = LAYOUT.GUTTER_WIDTH + 16; // gutter + padding

  // IDE window top (centered vertically)
  const ideTopOffset = (CANVAS_HEIGHT - (visibleLines * LAYOUT.LINE_HEIGHT + 74 + 28)) / 2; // 74 = title+tab, 28 = status bar
  const topBarHeight = 36 + 38; // title bar + tab bar heights

  // Laser screen X position (IDE left edge + gutter + padding + laser.x)
  const ideLeftEdge = (CANVAS_WIDTH - LAYOUT.IDE_WIDTH - LAYOUT.ANNOTATION_GAP - LAYOUT.EXTERNAL_ANNOTATION_WIDTH) / 2;
  const laserScreenX = ideLeftEdge + codeAreaLeftOffset + laserPosition.x;

  // Laser screen Y position (IDE top + title/tab bars + code area offset + laser.y - scroll)
  const codeAreaTop = ideTopOffset + topBarHeight + 16; // 16 = padding
  const laserScreenY = codeAreaTop + laserYInCodeArea;

  // Annotation panel connection point (left edge)
  const annotationPanelX = ideLeftEdge + LAYOUT.IDE_WIDTH + LAYOUT.ANNOTATION_GAP;

  return (
    <AbsoluteFill
      style={{
        background: IDE_COLORS.bgVoid,
        fontFamily: fonts.jetbrains,
      }}
    >
      {/* Subtle radial gradient background */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #0d0d0d 70%)',
          opacity: 0.3,
        }}
      />

      {/* Intro screen */}
      {showIntro && frame < INTRO_END + 30 && (
        <IntroScreen
          title={introTitle || filename}
          subtitle={introSubtitle}
          progress={introProgress}
        />
      )}

      {/* Main content container */}
      {frame >= ZOOM_START && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Side-by-side container for IDE + Annotation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: LAYOUT.ANNOTATION_GAP,
            }}
          >
            {/* IDE Window */}
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                opacity: ideOpacity,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
              }}
            >
              <IDEWindow
                code={code}
                language={language}
                filename={filename}
                typedCharCount={frame >= TYPING_START ? typedCharCount : 0}
                scrollY={Math.max(0, scrollY)}
                visibleLines={visibleLines}
                fontSize={fontSize}
                showLineNumbers={showLineNumbers}
                laserPosition={laserPosition}
                showLaser={currentAnnotationIndex >= 0 && isLaserVisible}
                highlightLine={isLaserVisible ? currentAnnotation?.line : undefined}
                highlightColor={currentAnnotation?.color}
              />
            </div>

            {/* External Annotation Panel */}
            {isAnnotating && (
              <div
                style={{
                  alignSelf: 'center',
                  opacity: zoomScale >= 1 ? 1 : 0,
                }}
              >
                <AnnotationPanel
                  annotation={currentAnnotation}
                  visible={showAnnotation}
                />
              </div>
            )}
          </div>

          {/* Global dashed connection line (SVG at canvas level) */}
          {/* Only show when laser is visible in code area */}
          {showAnnotation && currentAnnotation && zoomScale >= 1 && isLaserVisible && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: 100,
              }}
            >
              <line
                x1={laserScreenX}
                y1={laserScreenY}
                x2={annotationPanelX}
                y2={laserScreenY}
                stroke={currentAnnotation.color}
                strokeWidth="2"
                strokeDasharray="8,4"
                strokeOpacity="0.8"
                style={{
                  strokeDashoffset: -(frame * 2) % 12,
                }}
              />
            </svg>
          )}
        </AbsoluteFill>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${IDE_COLORS.textPrimary}, #FF6B6B)`,
            width: `${(frame / durationInFrames) * 100}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default IDECodeScene;
