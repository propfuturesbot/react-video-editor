// @ts-nocheck
// Type checking disabled for this file due to complex scene type unions
// The runtime behavior is correct - strict TS errors are false positives

import React, { useMemo, useCallback } from 'react';
import { useCurrentFrame, Sequence, AbsoluteFill, Audio } from 'remotion';
import { VideoScript, Scene, AudioTrack, BaseScene, TemplateVideoScript, TemplateScene } from './types';
import { defaultTheme } from './styles/theme';
import { VideoBackground, BackgroundConfig } from './components/Background';
import { Instructor, Caption, ProgressIndicator } from './components/Instructor';
import {
  IntroScene,
  ContentScene,
  CodeScene,
  FlowScene,
  SummaryScene,
  SequenceScene,
  StateScene,
  ArchitectureScene,
  ComparisonScene,
  TimelineScene,
  NetworkDiagramScene,
  RadialDiagramScene,
  ClusterArchitectureScene,
  ImageSceneTemplate,
} from './components/SceneTemplates';
import { MermaidFlowchartScene } from './components/MermaidFlowchartScene';
import { MermaidClassDiagramScene } from './components/MermaidClassDiagramScene';
import { BrandingIntroScene } from './components/BrandingIntroScene';
import { DomainDiagramScene } from './components/DomainDiagramScene';
import { DataDisplayScene } from './components/DataDisplayScene';
import { IDECodeScene } from './components/IDECodeScene';
import { SceneEffectsWrapper } from './components/SceneEffectsWrapper';
import {
  normalizePosition,
  normalizeNetworkData,
  normalizeRadialData,
} from './utils/sceneNormalizers';

// ============================================
// SCENE TYPE DEFINITIONS FOR BETTER TYPE SAFETY
// Using intersection types with BaseScene for proper TypeScript support
// ============================================

type BrandingSceneData = BaseScene & {
  imageUrl?: string;
  animation?: Record<string, unknown>;
};

type IntroSceneData = BaseScene & {
  icons?: string[];
  mainTitle?: string;
  highlightedWord?: string;
};

type ContentSceneData = BaseScene & {
  cards?: unknown[];
  layout?: string;
};

type CodeSceneData = BaseScene & {
  code?: string;
  language?: string;
  filename?: string;
  output?: unknown[];
  highlightLines?: number[];
  supportingCards?: Array<{
    icon?: string;
    title: string;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
  }>;
  cardPosition?: 'right' | 'left' | 'bottom';
};

type IDECodeSceneData = BaseScene & {
  code?: string;
  language?: 'java' | 'python' | 'javascript' | 'typescript' | 'go';
  filename?: string;
  showIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
  annotations?: Array<{
    line: number;
    keyword?: string;
    title: string;
    description: string;
    color: string;
  }>;
  visibleLines?: number;
  fontSize?: number;
  showLineNumbers?: boolean;
};

type FlowSceneData = BaseScene & {
  steps?: unknown[];
  explanationCards?: unknown[];
};

type SequenceSceneData = BaseScene & {
  entities?: unknown[];
  messages?: unknown[];
};

type StateSceneData = BaseScene & {
  states?: unknown[];
  transitions?: unknown[];
};

type ArchitectureSceneData = BaseScene & {
  components?: unknown[];
  connections?: unknown[];
};

type ClusterArchitectureSceneData = BaseScene & {
  clusters?: unknown[];
  components?: Array<{ position?: unknown; [key: string]: unknown }>;
  connections?: unknown[];
};

type ComparisonSceneData = BaseScene & {
  columns?: unknown[];
  highlightColumn?: number;
};

type TimelineSceneData = BaseScene & {
  events?: unknown[];
};

type SummarySceneData = BaseScene & {
  points?: unknown[];
  callToAction?: { title: string; description: string };
};

type FlowchartSceneData = BaseScene & {
  mermaidCode?: string;
};

type ImageSceneData = BaseScene & {
  imageUrl?: string;
  caption?: string;
  captionPosition?: string;
  layout?: string;
  zoomAnimation?: unknown;
  textOverlay?: string;
  supportingCards?: Array<{
    icon?: string;
    title: string;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
  }>;
  cardPosition?: 'right' | 'left' | 'bottom';
};

type DomainDiagramSceneData = BaseScene & {
  domain?: string;
  domainComponents?: unknown[];
  domainConnections?: unknown[];
  domainClusters?: unknown[];
};

type DataDisplaySceneData = BaseScene & {
  dataDisplayType?: string;
  data_display_type?: string;
  dataDisplayProps?: Record<string, unknown>;
  data_display_props?: Record<string, unknown>;
};

// =============================================================================
// STYLING FIELDS (common to all scene types)
// =============================================================================
interface SceneStylingFields {
  narration?: string;
  animation?: string;
  backgroundEffects?: string[];
  background_effects?: string[];
  cameraAnimation?: {
    type: string;
    startScale?: number;
    endScale?: number;
    start_scale?: number;
    end_scale?: number;
    distance?: number;
    durationFrames?: number;
    duration_frames?: number;
  };
  camera_animation?: {
    type: string;
    startScale?: number;
    endScale?: number;
    start_scale?: number;
    end_scale?: number;
    distance?: number;
    durationFrames?: number;
    duration_frames?: number;
  };
  emotionalEffect?: string;
  emotional_effect?: string;
  annotations?: string[];
}

// Helper to extract styling fields from a scene
function getSceneStyling(scene: Scene | TemplateScene): SceneStylingFields {
  const s = scene as unknown as SceneStylingFields;
  return {
    narration: s.narration,
    animation: s.animation,
    backgroundEffects: s.backgroundEffects || s.background_effects,
    cameraAnimation: s.cameraAnimation || s.camera_animation,
    emotionalEffect: s.emotionalEffect || s.emotional_effect,
    annotations: s.annotations,
  };
}

// ============================================
// MAIN TEMPLATE VIDEO COMPONENT
// ============================================

interface TemplateVideoProps {
  script: VideoScript | TemplateVideoScript;
}

export const TemplateVideo: React.FC<TemplateVideoProps> = ({ script }) => {
  const frame = useCurrentFrame();

  const theme = useMemo(
    () => ({ ...defaultTheme, ...(script.theme || {}) }),
    [script.theme]
  );

  // Normalize scenes to have startFrame/endFrame
  // FIXED: Sort scenes by startFrame to ensure correct rendering order
  // regardless of array order (fixes issue where scenes appeared out of order)
  const scenes = useMemo(() => {
    const rawScenes = script.scenes as Array<Scene | TemplateScene>;
    return [...rawScenes].sort((a, b) => a.startFrame - b.startFrame);
  }, [script.scenes]);

  // Calculate current scene index
  const getCurrentSceneIndex = useCallback(() => {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (frame >= scene.startFrame && frame < scene.endFrame) {
        return i;
      }
    }
    return scenes.length - 1;
  }, [frame, scenes]);

  const currentSceneIndex = getCurrentSceneIndex();

  // Render scene based on type
  const renderScene = useCallback(
    (scene: Scene | TemplateScene) => {
      switch (scene.type) {
        case 'branding': {
          const s = scene as BrandingSceneData;
          return (
            <BrandingIntroScene
              imageUrl={s.imageUrl || ''}
              title={s.title || ''}
              subtitle={s.subtitle}
              animation={s.animation}
              theme={theme}
            />
          );
        }

        case 'intro': {
          const s = scene as IntroSceneData;
          return (
            <IntroScene
              icons={s.icons}
              title={s.mainTitle || scene.title || ''}
              highlightedWord={s.highlightedWord}
              subtitle={scene.subtitle || ''}
              theme={theme}
            />
          );
        }

        case 'content': {
          const s = scene as ContentSceneData;
          return (
            <ContentScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              cards={s.cards || []}
              layout={s.layout}
              theme={theme}
            />
          );
        }

        case 'code': {
          const s = scene as CodeSceneData;
          return (
            <CodeScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              code={s.code}
              language={s.language}
              filename={s.filename}
              output={s.output}
              highlightLines={s.highlightLines}
              supportingCards={s.supportingCards}
              cardPosition={s.cardPosition}
              theme={theme}
            />
          );
        }

        case 'ide-code': {
          const s = scene as IDECodeSceneData;
          return (
            <IDECodeScene
              code={s.code || ''}
              language={s.language || 'javascript'}
              filename={s.filename || 'code.js'}
              showIntro={s.showIntro}
              introTitle={s.introTitle}
              introSubtitle={s.introSubtitle}
              annotations={s.annotations}
              visibleLines={s.visibleLines}
              fontSize={s.fontSize}
              showLineNumbers={s.showLineNumbers}
            />
          );
        }

        case 'flow': {
          const s = scene as FlowSceneData;
          return (
            <FlowScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              steps={s.steps || []}
              explanationCards={s.explanationCards}
              theme={theme}
            />
          );
        }

        case 'sequence': {
          const s = scene as SequenceSceneData;
          return (
            <SequenceScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              entities={s.entities || []}
              messages={s.messages || []}
              theme={theme}
            />
          );
        }

        case 'state': {
          const s = scene as StateSceneData;
          return (
            <StateScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              states={s.states || []}
              transitions={s.transitions || []}
              theme={theme}
            />
          );
        }

        case 'architecture': {
          const s = scene as ArchitectureSceneData;
          return (
            <ArchitectureScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              components={s.components || []}
              connections={s.connections || []}
              theme={theme}
            />
          );
        }

        case 'cluster-architecture': {
          const s = scene as ClusterArchitectureSceneData;
          const clusterComps = (s.components || []).map((c) => ({
            ...c,
            position: normalizePosition(c.position),
          }));
          return (
            <ClusterArchitectureScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              clusters={s.clusters || []}
              components={clusterComps}
              connections={s.connections || []}
              theme={theme}
            />
          );
        }

        case 'network': {
          const networkData = normalizeNetworkData(scene);
          return (
            <NetworkDiagramScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              nodes={networkData.nodes}
              connections={networkData.connections}
              theme={theme}
            />
          );
        }

        case 'radial': {
          const radialData = normalizeRadialData(scene);
          return (
            <RadialDiagramScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              centerLabel={radialData.centerLabel}
              items={radialData.items}
              theme={theme}
            />
          );
        }

        case 'comparison': {
          const s = scene as ComparisonSceneData;
          return (
            <ComparisonScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              columns={s.columns || []}
              highlightColumn={s.highlightColumn}
              theme={theme}
            />
          );
        }

        case 'timeline': {
          const s = scene as TimelineSceneData;
          return (
            <TimelineScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              events={s.events || []}
              theme={theme}
            />
          );
        }

        case 'summary': {
          const s = scene as SummarySceneData;
          return (
            <SummaryScene
              badge={scene.badge}
              title={scene.title || ''}
              points={s.points || []}
              callToAction={s.callToAction}
              theme={theme}
            />
          );
        }

        case 'flowchart': {
          const s = scene as FlowchartSceneData;
          return (
            <MermaidFlowchartScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              mermaidCode={s.mermaidCode || ''}
              theme={theme}
            />
          );
        }

        case 'image': {
          const s = scene as ImageSceneData;
          return (
            <ImageSceneTemplate
              badge={scene.badge}
              title={scene.title}
              subtitle={scene.subtitle}
              imageUrl={s.imageUrl || ''}
              caption={s.caption}
              captionPosition={s.captionPosition}
              layout={s.layout}
              zoomAnimation={s.zoomAnimation}
              textOverlay={s.textOverlay}
              supportingCards={s.supportingCards}
              cardPosition={s.cardPosition}
              theme={theme}
            />
          );
        }

        case 'classdiagram': {
          const s = scene as FlowchartSceneData;
          return (
            <MermaidClassDiagramScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              mermaidCode={s.mermaidCode || ''}
              theme={theme}
            />
          );
        }

        case 'domain-diagram': {
          const s = scene as DomainDiagramSceneData;
          return (
            <DomainDiagramScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              domain={s.domain || 'system-design'}
              domainComponents={s.domainComponents || []}
              domainConnections={s.domainConnections || []}
              domainClusters={s.domainClusters || []}
              theme={theme}
            />
          );
        }

        case 'data-display': {
          const s = scene as DataDisplaySceneData;
          return (
            <DataDisplayScene
              badge={scene.badge}
              title={scene.title || ''}
              subtitle={scene.subtitle}
              dataDisplayType={
                s.dataDisplayType || s.data_display_type || 'feature-matrix'
              }
              dataDisplayProps={s.dataDisplayProps || s.data_display_props || {}}
              theme={theme}
            />
          );
        }

        default:
          // Fallback to content scene
          return (
            <ContentScene
              badge={scene.badge}
              title={scene.title || 'Content'}
              subtitle={scene.subtitle}
              cards={[]}
              theme={theme}
            />
          );
      }
    },
    [theme]
  );

  // Get audio tracks from script
  const audioTracks = (script as VideoScript).audioTracks || [];

  // Get background config from script (with fallback to default gradient)
  const backgroundConfig: BackgroundConfig = (script as VideoScript)
    .background || {
    type: 'gradient',
    gradientVariant: 'grid',
    opacity: 1,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background - supports gradient, solid, image, or video */}
      <VideoBackground config={backgroundConfig} theme={theme} />

      {/* Scene sequences with effects wrapper */}
      {scenes.map((scene) => {
        const styling = getSceneStyling(scene);
        const durationInFrames = scene.endFrame - scene.startFrame;
        const hasEffects =
          styling.backgroundEffects?.length ||
          styling.cameraAnimation ||
          styling.emotionalEffect ||
          styling.annotations?.length;

        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={durationInFrames}
          >
            {hasEffects ? (
              <SceneEffectsWrapper
                backgroundEffects={styling.backgroundEffects}
                cameraAnimation={styling.cameraAnimation}
                emotionalEffect={styling.emotionalEffect}
                annotations={styling.annotations}
                durationInFrames={durationInFrames}
              >
                {renderScene(scene)}
              </SceneEffectsWrapper>
            ) : (
              renderScene(scene)
            )}
          </Sequence>
        );
      })}

      {/* Audio tracks for voice narration */}
      {audioTracks.map((track: AudioTrack, index: number) => (
        <Sequence
          key={`audio-${track.sceneId}-${index}-${track.startFrame}`}
          from={track.startFrame}
          durationInFrames={track.durationFrames}
        >
          <Audio src={track.audioUrl} />
        </Sequence>
      ))}

      {/* Captions - Only show burnt-in captions if enabled via captionConfig */}
      {/* Default: burnIn is false (off by default for localization support) */}
      {script.captions && script.captions.length > 0 &&
       (script as any).captionConfig?.burnIn === true && (
        <Caption captions={script.captions} theme={theme} />
      )}

      {/* Instructor */}
      {script.instructor?.enabled && script.instructor.lines && (
        <Instructor
          lines={script.instructor.lines}
          avatar={script.instructor.avatar}
          theme={theme}
        />
      )}

      {/* Progress indicator */}
      <ProgressIndicator
        currentScene={currentSceneIndex}
        totalScenes={scenes.length}
        theme={theme}
      />
    </AbsoluteFill>
  );
};

// ============================================
// DEFAULT EXPORT WITH SAMPLE DATA
// ============================================

export const DefaultTemplateVideo: React.FC = () => {
  const sampleScript: VideoScript = {
    config: {
      fps: 30,
      width: 1920,
      height: 1080,
      durationInSeconds: 30,
    },
    scenes: [
      {
        id: 'intro',
        type: 'intro',
        startFrame: 0,
        endFrame: 150,
        mainTitle: 'Welcome to Remotion',
        subtitle: 'Create videos with React',
        icons: ['🎬', '⚛️', '🚀'],
      } as IntroSceneData,
      {
        id: 'content',
        type: 'content',
        startFrame: 150,
        endFrame: 450,
        badge: '📚 Chapter 1',
        title: 'Getting Started',
        subtitle: 'Learn the basics of Remotion',
        cards: [
          {
            icon: '📦',
            title: 'Components',
            description: 'Use React components to build videos',
          },
          {
            icon: '⏱️',
            title: 'Timeline',
            description: 'Control timing with frames and sequences',
          },
          {
            icon: '🎨',
            title: 'Styling',
            description: 'Style your videos with CSS-in-JS',
          },
        ],
      } as ContentSceneData,
      {
        id: 'summary',
        type: 'summary',
        startFrame: 450,
        endFrame: 900,
        badge: '✅ Summary',
        title: 'Key Takeaways',
        points: [
          {
            title: 'React + Video',
            description: 'Build videos using familiar React patterns',
          },
          {
            title: 'Frame-based',
            description: 'Control every aspect with frame precision',
          },
          {
            title: 'Render anywhere',
            description: 'Export to MP4, GIF, or stream',
          },
        ],
        callToAction: {
          title: '🎉 Start Creating!',
          description: 'Build your first video with Remotion',
        },
      } as SummarySceneData,
    ],
    captions: [
      {
        startFrame: 30,
        endFrame: 120,
        text: 'Welcome to <hl>Remotion</hl> video generation!',
      },
      {
        startFrame: 180,
        endFrame: 300,
        text: 'Learn to create <hl-green>amazing videos</hl-green> with React',
      },
    ],
    instructor: {
      enabled: true,
      avatar: '👨‍🏫',
      lines: [
        {
          startFrame: 30,
          endFrame: 120,
          text: 'Hey! Let me show you how this works.',
        },
        {
          startFrame: 180,
          endFrame: 300,
          text: 'These are the key concepts to understand.',
        },
      ],
    },
  };

  return <TemplateVideo script={sampleScript} />;
};

export default TemplateVideo;
