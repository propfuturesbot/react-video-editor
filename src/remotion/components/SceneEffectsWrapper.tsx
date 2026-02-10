/**
 * SceneEffectsWrapper - Applies visual styling effects to scenes
 *
 * Handles:
 * - Camera animations (zoom_in, zoom_out, pan_left, pan_right, focus_pull)
 * - Background effects (glow, grid, particles, orbs)
 * - Emotional effects (eureka_moment, success_celebration, etc.)
 * - Annotation overlays
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

// =============================================================================
// TYPES
// =============================================================================

export interface CameraAnimation {
  type: "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "focus_pull";
  startScale?: number;
  endScale?: number;
  start_scale?: number; // snake_case alias
  end_scale?: number;
  distance?: number;
  durationFrames?: number;
  duration_frames?: number;
}

export interface SceneEffectsProps {
  children: React.ReactNode;
  /** Camera animation config */
  cameraAnimation?: CameraAnimation;
  camera_animation?: CameraAnimation; // snake_case alias
  /** Background effects to apply */
  backgroundEffects?: string[];
  background_effects?: string[]; // snake_case alias
  /** Emotional emphasis effect */
  emotionalEffect?: string;
  emotional_effect?: string; // snake_case alias
  /** Annotation effects */
  annotations?: string[];
  /** Scene duration in frames */
  durationInFrames: number;
}

// =============================================================================
// CAMERA ANIMATION COMPONENT
// =============================================================================

const CameraAnimationWrapper: React.FC<{
  children: React.ReactNode;
  animation: CameraAnimation;
  durationInFrames: number;
}> = ({ children, animation, durationInFrames }) => {
  const frame = useCurrentFrame();

  // Normalize snake_case to camelCase
  const startScale = animation.startScale ?? animation.start_scale ?? 1.0;
  const endScale = animation.endScale ?? animation.end_scale ?? 1.0;
  const animDuration =
    animation.durationFrames ?? animation.duration_frames ?? 30;
  const distance = animation.distance ?? 50;

  // Calculate animation progress
  const progress = interpolate(frame, [0, animDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  let transform = "";

  switch (animation.type) {
    case "zoom_in":
      transform = `scale(${interpolate(progress, [0, 1], [startScale, endScale])})`;
      break;
    case "zoom_out":
      transform = `scale(${interpolate(progress, [0, 1], [endScale, startScale])})`;
      break;
    case "pan_left":
      transform = `translateX(${interpolate(progress, [0, 1], [0, -distance])}px)`;
      break;
    case "pan_right":
      transform = `translateX(${interpolate(progress, [0, 1], [0, distance])}px)`;
      break;
    case "focus_pull": {
      // Zoom in then out for emphasis
      const focusProgress = interpolate(
        frame,
        [0, animDuration / 2, animDuration],
        [1.0, 1.15, 1.0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      transform = `scale(${focusProgress})`;
      break;
    }
    default:
      transform = "";
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

// =============================================================================
// BACKGROUND EFFECTS
// =============================================================================

const GlowBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.02) * 0.1 + 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, ${pulse}) 0%, transparent 60%)`,
        pointerEvents: "none",
      }}
    />
  );
};

const GridBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
      }}
    />
  );
};

const AnimatedOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const y1 = Math.sin(frame * 0.015) * 50;
  const y2 = Math.cos(frame * 0.012) * 40;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* Primary orb */}
      <div
        style={{
          position: "absolute",
          left: "20%",
          top: `calc(30% + ${y1}px)`,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Secondary orb */}
      <div
        style={{
          position: "absolute",
          right: "15%",
          top: `calc(50% + ${y2}px)`,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  // Generate deterministic particle positions
  const particles = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: ((i * 137.508) % 100) + "%",
      baseY: (i * 73) % 100,
      speed: 0.3 + (i % 5) * 0.1,
      size: 2 + (i % 3),
      opacity: 0.2 + (i % 4) * 0.1,
    }));
  }, []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => {
        const y = (p.baseY + frame * p.speed) % 110 - 5;
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${p.opacity})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const NoiseOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        opacity: 0.03,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }}
    />
  );
};

const BackgroundEffect: React.FC<{ effect: string }> = ({ effect }) => {
  switch (effect) {
    case "glow_background":
      return <GlowBackground />;
    case "grid_background":
      return <GridBackground />;
    case "animated_orbs":
      return <AnimatedOrbs />;
    case "particles":
      return <Particles />;
    case "noise_overlay":
      return <NoiseOverlay />;
    default:
      return null;
  }
};

// =============================================================================
// EMOTIONAL EFFECTS
// =============================================================================

const EurekaEffect: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (progress === 0) return null;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 60,
      }}
    >
      <div
        style={{
          fontSize: 60,
          opacity: interpolate(progress, [0, 0.5, 1], [0, 1, 0.8]),
          transform: `scale(${interpolate(progress, [0, 0.3, 1], [0.5, 1.2, 1])})`,
        }}
      >
        💡
      </div>
    </AbsoluteFill>
  );
};

const SuccessCelebration: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const endFrame = Math.min(45, durationInFrames);
  const progress = interpolate(frame, [0, endFrame], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (progress === 0) return null;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 80,
          opacity: interpolate(progress, [0, 0.3, 0.8, 1], [0, 1, 1, 0.5]),
          transform: `scale(${interpolate(progress, [0, 0.2, 1], [0.3, 1.3, 1])})`,
        }}
      >
        ✨
      </div>
    </AbsoluteFill>
  );
};

const ProgressMomentum: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "-100%",
          top: "50%",
          width: "300%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.5) 50%, transparent 100%)",
          transform: `translateX(${(frame * 2) % 200}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const EmotionalEffect: React.FC<{
  effect: string;
  durationInFrames: number;
}> = ({ effect, durationInFrames }) => {
  switch (effect) {
    case "eureka_moment":
      return <EurekaEffect durationInFrames={durationInFrames} />;
    case "success_celebration":
      return <SuccessCelebration durationInFrames={durationInFrames} />;
    case "progress_momentum":
      return <ProgressMomentum />;
    default:
      return null;
  }
};

// =============================================================================
// ANNOTATIONS
// =============================================================================

const HighlightBeam: React.FC = () => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [0, 60], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${beam}%`,
          maxWidth: 800,
          height: 4,
          background:
            "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)",
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

const AnnotationOverlay: React.FC<{ annotation: string }> = ({
  annotation,
}) => {
  switch (annotation) {
    case "highlight_beam":
      return <HighlightBeam />;
    default:
      return null;
  }
};

// =============================================================================
// MAIN WRAPPER COMPONENT
// =============================================================================

export const SceneEffectsWrapper: React.FC<SceneEffectsProps> = ({
  children,
  cameraAnimation,
  camera_animation,
  backgroundEffects,
  background_effects,
  emotionalEffect,
  emotional_effect,
  annotations,
  durationInFrames,
}) => {
  // Normalize snake_case to camelCase
  const camera = cameraAnimation || camera_animation;
  const bgEffects = backgroundEffects || background_effects || [];
  const emotion = emotionalEffect || emotional_effect;
  const annots = annotations || [];

  // Wrap content with camera animation if present
  let content = <>{children}</>;

  if (camera) {
    content = (
      <CameraAnimationWrapper
        animation={camera}
        durationInFrames={durationInFrames}
      >
        {content}
      </CameraAnimationWrapper>
    );
  }

  return (
    <AbsoluteFill>
      {/* Background effects layer */}
      {bgEffects.map((effect, i) => (
        <BackgroundEffect key={`bg-${effect}-${i}`} effect={effect} />
      ))}

      {/* Main scene content */}
      {content}

      {/* Emotional effects layer */}
      {emotion && (
        <EmotionalEffect effect={emotion} durationInFrames={durationInFrames} />
      )}

      {/* Annotations layer */}
      {annots.map((annot, i) => (
        <AnnotationOverlay key={`annot-${annot}-${i}`} annotation={annot} />
      ))}
    </AbsoluteFill>
  );
};

export default SceneEffectsWrapper;
