import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring } from 'remotion';
import { ThemeColors, FlowStep, DiagramComponent, DiagramCluster, LabeledConnection as LabeledConnectionType, RadialItem, RadialCenterLabel, SupportingCard } from '../types';
import { SplitLayoutWrapper } from './SplitLayoutWrapper';
import { defaultTheme, hexToRgb, neonColors, getNeonBoxShadow, getGlassBackground } from '../styles/theme';
import { SceneContainer, Background } from './Background';
import { Title, Subtitle, SceneTitle, Highlight } from './Typography';
import { GlowBox, ContentCard, FeatureCard, Badge } from './Cards';
import { CodeBlock, CodeOutput } from './CodeBlock';
import { HorizontalFlow, VerticalSteps } from './FlowDiagram';
import { AnimatedElement, StaggeredList } from './AnimatedElement';
import { LabeledConnectionSVG, ConnectionCanvas } from './LabeledConnection';
import { animateIn, fadeIn } from '../utils/animations';
import { renderIcon } from '../utils/lucideIconMap';
import {
  getContentMaxWidth,
  getContentCardStyles,
  getComparisonMaxWidth,
  getComparisonColumnWidth,
  getComparisonStyles,
  getTimelineMaxWidth,
  getTimelineStyles,
  getClusterCanvasSize,
  getClusterComponentStyles,
  getNetworkCanvasSize,
  getNetworkNodeSize,
  getNetworkStyles,
  getRadialCanvasSize,
  getRadialRadius,
  getRadialStyles,
  getStateCanvasSize,
  getStateCircleRadius,
  getStateStyles,
  getSequenceCanvasSize,
  getSequenceStyles,
  getArchitectureMaxWidth,
  getArchitectureStyles,
  getFlowStyles,
  getIntroStyles,
  getSummaryStyles,
  getCodeSceneMaxWidth,
  getCodeStyles,
} from '../utils/layoutScaling';

// ============================================
// INTRO SCENE TEMPLATE
// ============================================

interface IntroSceneProps {
  icons?: string[];
  title: string;
  highlightedWord?: string;
  subtitle: string;
  theme?: ThemeColors;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  icons = ['📦', '⚡', '🚀'],
  title,
  highlightedWord,
  subtitle,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const introStyles = getIntroStyles(icons.length);

  // Parse title to apply highlight
  const renderTitle = () => {
    if (!highlightedWord) return title;

    const parts = title.split(highlightedWord);
    return (
      <>
        {parts[0]}
        <span style={{ color: theme.primary }}>{highlightedWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <SceneContainer theme={theme}>
      {/* Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: introStyles.gap, marginBottom: 36 }}>
        {icons.map((icon, index) => {
          const iconAnim = animateIn({
            frame,
            fps,
            start: 5 + index * 8,
            type: 'spring',
          });

          return (
            <React.Fragment key={index}>
              <div
                style={{
                  width: introStyles.iconBoxSize,
                  height: introStyles.iconBoxSize,
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  opacity: iconAnim.opacity,
                  transform: iconAnim.transform,
                  boxShadow: `0 12px 48px rgba(${hexToRgb(theme.primary)}, 0.35)`,
                }}
              >
                {renderIcon(icon, introStyles.iconSize, '#fff')}
              </div>
              {index < icons.length - 1 && (
                <AnimatedElement delay={10 + index * 8} type="fade">
                  <span style={{ fontSize: introStyles.arrowSize, color: theme.primary }}>→</span>
                </AnimatedElement>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Title */}
      <Title size="xl" delay={30} theme={theme}>
        {renderTitle()}
      </Title>

      {/* Subtitle */}
      <Subtitle delay={45} theme={theme} style={{ marginTop: 20 }}>
        {subtitle}
      </Subtitle>
    </SceneContainer>
  );
};

// ============================================
// CONTENT SCENE TEMPLATE (Futuristic Cards)
// ============================================

interface ContentSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  cards: Array<{
    icon?: string;
    title: string;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  }>;
  layout?: 'grid' | 'list';
  theme?: ThemeColors;
}

export const ContentScene: React.FC<ContentSceneProps> = ({
  badge,
  title,
  subtitle,
  cards,
  layout = 'grid',
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on card count
  const contentMaxWidth = getContentMaxWidth({ cardCount: cards.length, layout });
  const cardStyles = getContentCardStyles(cards.length);

  // Neon colors for cards
  const cardColors = [
    neonColors.purple,
    neonColors.orange,
    neonColors.cyan,
    neonColors.green,
    neonColors.pink,
    neonColors.yellow,
  ];

  const variantColors = {
    default: neonColors.purple,
    success: neonColors.green,
    warning: neonColors.orange,
    error: neonColors.red,
    info: neonColors.cyan,
  };

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'grid'
            ? `repeat(${Math.min(cards.length, 4)}, 1fr)`
            : '1fr',
          gap: cardStyles.gap,
          maxWidth: contentMaxWidth,
          width: '100%',
        }}
      >
        {cards.map((card, index) => {
          const color = card.variant ? variantColors[card.variant] : cardColors[index % cardColors.length];

          const cardProgress = spring({
            frame: frame - (35 + index * 10),
            fps,
            config: { damping: 14, stiffness: 90, mass: 0.5 },
          });
          const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);
          const cardY = interpolate(cardProgress, [0, 1], [40, 0]);

          return (
            <div
              key={index}
              style={{
                background: getGlassBackground(color, 0.08),
                borderRadius: 18,
                border: `1px solid ${color}40`,
                borderLeft: `4px solid ${color}`,
                padding: `${cardStyles.padding}px ${cardStyles.padding + 4}px`,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                boxShadow: `0 6px 36px rgba(${hexToRgb(color)}, 0.18)`,
              }}
            >
              {/* Icon */}
              {card.icon && (
                <div style={{
                  width: cardStyles.iconBoxSize,
                  height: cardStyles.iconBoxSize,
                  borderRadius: 14,
                  background: getGlassBackground(color, 0.25),
                  border: `1px solid ${color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  marginBottom: 18,
                  boxShadow: `0 0 24px rgba(${hexToRgb(color)}, 0.25)`,
                }}>
                  {renderIcon(card.icon, cardStyles.iconSize, color)}
                </div>
              )}

              {/* Title */}
              <h4 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: cardStyles.titleFontSize,
                fontWeight: 700,
                color: theme.text,
                marginBottom: 10,
                margin: 0,
              }}>
                {card.title}
              </h4>

              {/* Description */}
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: cardStyles.descFontSize,
                color: theme.textMuted,
                lineHeight: 1.6,
                margin: 0,
                marginTop: 10,
              }}>
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// CODE SCENE TEMPLATE
// ============================================

interface CodeSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  code: string;
  language: 'python' | 'javascript' | 'typescript' | 'json' | 'bash';
  filename?: string;
  output?: Array<{
    text: string;
    type?: 'normal' | 'success' | 'error';
    delay: number;
  }>;
  highlightLines?: number[];
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';
  theme?: ThemeColors;
}

export const CodeScene: React.FC<CodeSceneProps> = ({
  badge,
  title,
  subtitle,
  code,
  language,
  filename,
  output,
  highlightLines,
  supportingCards,
  cardPosition = 'right',
  theme = defaultTheme,
}) => {
  const hasOutput = output && output.length > 0;
  const hasSupportingCards = supportingCards && supportingCards.length > 0;
  const codeLineCount = code ? code.split('\n').length : 0;

  // Use dynamic layout scaling based on content
  // When supporting cards are present, use more of the screen width
  const containerMaxWidth = hasSupportingCards ? 1600 : getCodeSceneMaxWidth(hasOutput);
  const codeStyles = getCodeStyles(hasOutput, codeLineCount);

  // Primary content width when supporting cards are present
  const primaryWidthPercent = hasSupportingCards ? (hasOutput ? 65 : 60) : 100;

  const codeContent = (
    <div
      style={{
        display: 'flex',
        gap: codeStyles.gap,
        alignItems: 'flex-start',
        flexWrap: hasSupportingCards ? 'nowrap' : 'wrap',
        justifyContent: 'center',
      }}
    >
      {/* Code block - uses full width for readability */}
      <div style={{
        flex: hasOutput ? '1 1 auto' : '1 1 auto',
        maxWidth: hasSupportingCards ? '100%' : codeStyles.codeBlockMaxWidth,
        minWidth: hasSupportingCards ? 400 : (hasOutput ? 500 : 600),
      }}>
        <CodeBlock
          code={code}
          language={language}
          filename={filename}
          theme={theme}
          delay={30}
          highlightLines={highlightLines}
        />
      </div>

      {/* Output panel */}
      {hasOutput && (
        <div style={{
          flex: '0 0 auto',
          maxWidth: hasSupportingCards ? 320 : codeStyles.outputMaxWidth,
          minWidth: 280,
        }}>
          <CodeOutput
            lines={output}
            theme={theme}
            baseDelay={60}
          />
        </div>
      )}
    </div>
  );

  return (
    <SceneContainer theme={theme} centered={false}>
      <div style={{ width: '100%', maxWidth: containerMaxWidth, margin: '0 auto' }}>
        <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

        <SplitLayoutWrapper
          supportingCards={supportingCards}
          cardPosition={cardPosition}
          theme={theme}
          primaryWidthPercent={primaryWidthPercent}
        >
          {codeContent}
        </SplitLayoutWrapper>
      </div>
    </SceneContainer>
  );
};

// ============================================
// FLOW SCENE TEMPLATE
// ============================================

interface FlowSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  steps: Array<{
    icon: string;
    label: string;
    description?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning';
  }>;
  explanationCards?: Array<{
    title: string;
    description: string;
  }>;
  theme?: ThemeColors;
}

export const FlowScene: React.FC<FlowSceneProps> = ({
  badge,
  title,
  subtitle,
  steps,
  explanationCards,
  theme = defaultTheme,
}) => {
  // Get dynamic sizing based on step count
  const flowStyles = getFlowStyles(steps.length);
  const explanationCardCount = explanationCards?.length || 0;
  // Use wider layout for more cards
  const explanationMaxWidth = explanationCardCount <= 2 ? 900 : explanationCardCount <= 3 ? 1200 : 1400;

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      {/* Flow diagram */}
      <HorizontalFlow
        steps={steps}
        theme={theme}
        baseDelay={40}
        stagger={15}
      />

      {/* Explanation cards */}
      {explanationCards && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${explanationCardCount <= 2 ? 280 : 220}px, 1fr))`,
            gap: flowStyles.gap,
            maxWidth: explanationMaxWidth,
            width: '100%',
            marginTop: 50,
          }}
        >
          {explanationCards.map((card, index) => (
            <AnimatedElement
              key={index}
              delay={80 + index * 10}
              type="slide-up"
            >
              <GlowBox padding={18} color={theme.primary}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: theme.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {index + 1}
                </div>
                <h4
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {card.title}
                </h4>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: theme.textMuted,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </GlowBox>
            </AnimatedElement>
          ))}
        </div>
      )}
    </SceneContainer>
  );
};

// ============================================
// SEQUENCE DIAGRAM SCENE TEMPLATE (Futuristic Neon)
// ============================================

interface SequenceEntity {
  id: string;
  label: string;
  icon?: string;
}

interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  type?: 'request' | 'response' | 'async' | 'error';
}

interface SequenceSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  entities: SequenceEntity[];
  messages: SequenceMessage[];
  theme?: ThemeColors;
}

export const SequenceScene: React.FC<SequenceSceneProps> = ({
  badge,
  title,
  subtitle,
  entities,
  messages,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on content
  const canvasSize = getSequenceCanvasSize(entities.length, messages.length);
  const seqStyles = getSequenceStyles(entities.length);

  // Neon colors for entities
  const entityColors = [
    neonColors.purple,
    neonColors.orange,
    neonColors.cyan,
    neonColors.green,
    neonColors.pink,
    neonColors.yellow,
  ];

  const messageTypeColors = {
    request: neonColors.cyan,
    response: neonColors.green,
    async: neonColors.orange,
    error: neonColors.red,
  };

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: canvasSize.width,
        height: canvasSize.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Entity headers */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: seqStyles.entityGap,
          marginBottom: 44,
        }}>
          {entities.map((entity, index) => {
            const color = entityColors[index % entityColors.length];
            const animProgress = spring({
              frame: frame - (20 + index * 8),
              fps,
              config: { damping: 12, stiffness: 100, mass: 0.5 },
            });
            const scale = interpolate(animProgress, [0, 1], [0.5, 1]);
            const opacity = interpolate(animProgress, [0, 1], [0, 1]);

            return (
              <div
                key={entity.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                {/* Icon box with neon glow */}
                <div style={{
                  width: seqStyles.entityBoxSize,
                  height: seqStyles.entityBoxSize,
                  borderRadius: 18,
                  background: getGlassBackground(color, 0.15),
                  border: `2px solid ${color}`,
                  boxShadow: getNeonBoxShadow(color, 0.4),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                }}>
                  {renderIcon(entity.icon || 'box', seqStyles.entityIconSize, color)}
                </div>
                {/* Label */}
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: seqStyles.entityLabelFontSize,
                  fontWeight: 600,
                  color: color,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  {entity.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lifelines and Messages */}
        <div style={{ position: 'relative', flex: 1, width: '100%', maxWidth: canvasSize.width - 200 }}>
          {/* Vertical lifelines */}
          {entities.map((entity, index) => {
            const color = entityColors[index % entityColors.length];
            const xPercent = (index / (entities.length - 1 || 1)) * 100;
            const lineOpacity = interpolate(frame, [30, 50], [0, 0.6], { extrapolateRight: 'clamp' });

            return (
              <div
                key={`lifeline-${entity.id}`}
                style={{
                  position: 'absolute',
                  left: `${xPercent}%`,
                  top: 0,
                  bottom: 0,
                  width: seqStyles.lifelineWidth,
                  background: `linear-gradient(to bottom, ${color}80, ${color}20)`,
                  opacity: lineOpacity,
                  transform: 'translateX(-50%)',
                }}
              />
            );
          })}

          {/* Animated messages */}
          {messages.map((msg, index) => {
            const msgStartFrame = 60 + index * 30;
            const msgColor = messageTypeColors[msg.type || 'request'];
            const fromIdx = entities.findIndex(e => e.id === msg.from);
            const toIdx = entities.findIndex(e => e.id === msg.to);
            const fromX = (fromIdx / (entities.length - 1 || 1)) * 100;
            const toX = (toIdx / (entities.length - 1 || 1)) * 100;
            const isLeftToRight = toIdx > fromIdx;
            const yPos = 20 + index * 75;

            // Animation progress for this message
            const progress = interpolate(
              frame,
              [msgStartFrame, msgStartFrame + 20],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            // Animate the line drawing
            const lineProgress = interpolate(
              frame,
              [msgStartFrame, msgStartFrame + 15],
              [0, 100],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            // Pulse animation for the traveling dot
            const dotProgress = interpolate(
              frame,
              [msgStartFrame + 5, msgStartFrame + 20],
              [0, 100],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const labelOpacity = interpolate(
              frame,
              [msgStartFrame + 10, msgStartFrame + 18],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            if (progress === 0) return null;

            const leftX = Math.min(fromX, toX);
            const rightX = Math.max(fromX, toX);

            return (
              <div
                key={`msg-${index}`}
                style={{
                  position: 'absolute',
                  left: `${leftX}%`,
                  width: `${rightX - leftX}%`,
                  top: yPos,
                }}
              >
                {/* Animated dashed line */}
                <div style={{
                  height: 2,
                  background: `linear-gradient(${isLeftToRight ? 'to right' : 'to left'}, ${msgColor}, ${msgColor}80)`,
                  position: 'relative',
                  clipPath: `inset(0 ${100 - lineProgress}% 0 0)`,
                }}>
                  {/* Animated traveling dot */}
                  {dotProgress > 0 && dotProgress < 100 && (
                    <div style={{
                      position: 'absolute',
                      left: isLeftToRight ? `${dotProgress}%` : `${100 - dotProgress}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: msgColor,
                      boxShadow: `0 0 10px ${msgColor}, 0 0 20px ${msgColor}`,
                    }} />
                  )}

                  {/* Arrow head */}
                  {lineProgress >= 95 && (
                    <div style={{
                      position: 'absolute',
                      [isLeftToRight ? 'right' : 'left']: -2,
                      top: -5,
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      [isLeftToRight ? 'borderLeft' : 'borderRight']: `10px solid ${msgColor}`,
                      filter: `drop-shadow(0 0 4px ${msgColor})`,
                    }} />
                  )}
                </div>

                {/* Label with neon effect */}
                <div style={{
                  position: 'absolute',
                  top: -30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: getGlassBackground(msgColor, 0.2),
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: seqStyles.messageLabelFontSize,
                  fontWeight: 500,
                  color: msgColor,
                  whiteSpace: 'nowrap',
                  border: `1px solid ${msgColor}60`,
                  boxShadow: `0 0 18px rgba(${hexToRgb(msgColor)}, 0.35)`,
                  opacity: labelOpacity,
                }}>
                  {msg.type === 'response' ? '← ' : '→ '}{msg.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ============================================
// STATE DIAGRAM SCENE TEMPLATE
// ============================================

interface State {
  id: string;
  label: string;
  isInitial?: boolean;
  isFinal?: boolean;
  color?: string;
  description?: string;
}

interface Transition {
  from: string;
  to: string;
  label: string;
  condition?: string;
  action?: string;
}

interface StateSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  states: State[];
  transitions: Transition[];
  theme?: ThemeColors;
}

export const StateScene: React.FC<StateSceneProps> = ({
  badge,
  title,
  subtitle,
  states,
  transitions,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on state count
  const canvasSize = getStateCanvasSize(states.length);
  const CANVAS_W = canvasSize.width;
  const CANVAS_H = canvasSize.height;
  const CIRCLE_R = getStateCircleRadius(states.length);
  const stateStyles = getStateStyles();

  // Position states hierarchically based on transitions
  const getStatePositions = (): Record<string, { x: number; y: number }> => {
    const positions: Record<string, { x: number; y: number }> = {};
    const total = states.length;

    if (total <= 1) {
      states.forEach((s) => {
        positions[s.id] = { x: CANVAS_W / 2, y: CANVAS_H / 2 };
      });
      return positions;
    }

    // Build adjacency for topological ordering
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    states.forEach((s) => {
      outgoing.set(s.id, []);
      incoming.set(s.id, []);
    });
    transitions.forEach((t) => {
      outgoing.get(t.from)?.push(t.to);
      incoming.get(t.from); // ensure key
      incoming.get(t.to)?.push(t.from);
    });

    // BFS layering from initial states (or first state)
    const initialIds = states.filter((s) => s.isInitial).map((s) => s.id);
    const startIds = initialIds.length > 0 ? initialIds : [states[0].id];

    const layers: string[][] = [];
    const visited = new Set<string>();
    let queue = [...startIds];
    queue.forEach((id) => visited.add(id));

    while (queue.length > 0) {
      layers.push([...queue]);
      const nextQueue: string[] = [];
      for (const id of queue) {
        for (const targetId of outgoing.get(id) || []) {
          if (!visited.has(targetId)) {
            visited.add(targetId);
            nextQueue.push(targetId);
          }
        }
      }
      queue = nextQueue;
    }

    // Add any unvisited states to the last layer
    states.forEach((s) => {
      if (!visited.has(s.id)) {
        if (layers.length === 0) layers.push([]);
        layers[layers.length - 1].push(s.id);
      }
    });

    const numLayers = layers.length;
    const paddingX = 140;
    const paddingY = 80;
    const usableW = CANVAS_W - paddingX * 2;
    const usableH = CANVAS_H - paddingY * 2;

    layers.forEach((layer, layerIdx) => {
      const x = numLayers === 1
        ? CANVAS_W / 2
        : paddingX + (layerIdx / (numLayers - 1)) * usableW;
      const count = layer.length;
      layer.forEach((id, i) => {
        const y = count === 1
          ? CANVAS_H / 2
          : paddingY + (i / (count - 1)) * usableH;
        positions[id] = { x, y };
      });
    });

    return positions;
  };

  const positions = getStatePositions();

  // Compute arrow path from one circle edge to another
  const getArrowPath = (fromId: string, toId: string): { path: string; labelPos: { x: number; y: number }; angle: number } => {
    const from = positions[fromId] || { x: 0, y: 0 };
    const to = positions[toId] || { x: 0, y: 0 };

    if (fromId === toId) {
      // Self-loop
      const loopR = 30;
      return {
        path: `M ${from.x} ${from.y - CIRCLE_R} C ${from.x - loopR * 2} ${from.y - CIRCLE_R - loopR * 2.5} ${from.x + loopR * 2} ${from.y - CIRCLE_R - loopR * 2.5} ${from.x} ${from.y - CIRCLE_R}`,
        labelPos: { x: from.x, y: from.y - CIRCLE_R - loopR * 2 },
        angle: 0,
      };
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    const startX = from.x + nx * (CIRCLE_R + 4);
    const startY = from.y + ny * (CIRCLE_R + 4);
    const endX = to.x - nx * (CIRCLE_R + 10);
    const endY = to.y - ny * (CIRCLE_R + 10);
    const angle = Math.atan2(dy, dx);

    // Check if there's a reverse transition (bidirectional) — if so, curve
    const hasReverse = transitions.some((t) => t.from === toId && t.to === fromId);
    if (hasReverse) {
      const perpX = -ny * 40;
      const perpY = nx * 40;
      const cx = (startX + endX) / 2 + perpX;
      const cy = (startY + endY) / 2 + perpY;
      return {
        path: `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`,
        labelPos: { x: cx, y: cy },
        angle,
      };
    }

    return {
      path: `M ${startX} ${startY} L ${endX} ${endY}`,
      labelPos: { x: (startX + endX) / 2, y: (startY + endY) / 2 - 14 },
      angle,
    };
  };

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        marginTop: 10,
      }}>
        {/* SVG layer for arrows */}
        <svg
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <marker
              id="state-arrowhead"
              markerWidth="10"
              markerHeight="8"
              refX="9"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill={theme.primary} />
            </marker>
          </defs>
          {transitions.map((trans, index) => {
            const { path } = getArrowPath(trans.from, trans.to);
            const startFrame = 45 + states.length * 12 + index * 12;
            const drawProgress = interpolate(
              frame,
              [startFrame, startFrame + 25],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const arrowOpacity = fadeIn({ frame, start: startFrame, duration: 10 });

            return (
              <g key={`arrow-${index}`} opacity={arrowOpacity}>
                <path
                  d={path}
                  fill="none"
                  stroke={`rgba(${hexToRgb(theme.primary)}, 0.3)`}
                  strokeWidth={stateStyles.strokeWidth}
                  strokeDasharray="8 5"
                />
                <path
                  d={path}
                  fill="none"
                  stroke={theme.primary}
                  strokeWidth={stateStyles.strokeWidth}
                  markerEnd="url(#state-arrowhead)"
                  strokeDasharray="1000"
                  strokeDashoffset={1000 * (1 - drawProgress)}
                />
              </g>
            );
          })}
        </svg>

        {/* Transition labels */}
        {transitions.map((trans, index) => {
          const { labelPos } = getArrowPath(trans.from, trans.to);
          const startFrame = 55 + states.length * 12 + index * 12;
          const labelOpacity = fadeIn({ frame, start: startFrame, duration: 15 });

          return (
            <div
              key={`label-${index}`}
              style={{
                position: 'absolute',
                left: labelPos.x,
                top: labelPos.y,
                transform: 'translate(-50%, -50%)',
                opacity: labelOpacity,
                padding: '5px 12px',
                background: theme.surface,
                borderRadius: 8,
                border: `1px solid ${theme.primary}40`,
                whiteSpace: 'nowrap',
                zIndex: 5,
              }}
            >
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: stateStyles.transitionLabelFontSize,
                color: theme.primary,
              }}>
                {trans.label}
              </span>
            </div>
          );
        })}

        {/* State circles */}
        {states.map((state, index) => {
          const pos = positions[state.id];
          if (!pos) return null;
          const anim = animateIn({ frame, fps, start: 20 + index * 12, type: 'spring' });
          const isSpecial = state.isInitial || state.isFinal;
          const stateColor = state.color || (state.isInitial ? theme.primary : state.isFinal ? theme.success : theme.secondary);
          const rgbColor = hexToRgb(stateColor);

          return (
            <div
              key={state.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: `translate(-50%, -50%) ${anim.transform}`,
                opacity: anim.opacity,
                zIndex: 10,
              }}
            >
              {/* Initial state entry arrow */}
              {state.isInitial && (
                <div style={{
                  position: 'absolute',
                  left: -(CIRCLE_R + 30),
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 2,
                  background: theme.primary,
                }}>
                  <div style={{
                    position: 'absolute',
                    right: -2,
                    top: -4,
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: `8px solid ${theme.primary}`,
                  }} />
                </div>
              )}

              {/* Outer ring for final states */}
              {state.isFinal && (
                <div style={{
                  position: 'absolute',
                  width: CIRCLE_R * 2 + 12,
                  height: CIRCLE_R * 2 + 12,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: `2px solid ${theme.success}`,
                  pointerEvents: 'none',
                }} />
              )}

              {/* Main circle */}
              <div style={{
                width: CIRCLE_R * 2,
                height: CIRCLE_R * 2,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSpecial
                  ? `linear-gradient(135deg, ${stateColor}, ${stateColor}B0)`
                  : `rgba(${rgbColor}, 0.12)`,
                border: `${stateStyles.strokeWidth}px solid ${stateColor}${isSpecial ? '' : '60'}`,
                boxShadow: isSpecial
                  ? `0 0 30px rgba(${rgbColor}, 0.45), 0 0 60px rgba(${rgbColor}, 0.18)`
                  : `0 0 20px rgba(${rgbColor}, 0.12)`,
                textAlign: 'center',
                padding: 10,
              }}>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: state.label.length > 12 ? stateStyles.smallLabelFontSize : stateStyles.labelFontSize,
                  fontWeight: 600,
                  color: isSpecial ? '#fff' : theme.text,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}>
                  {state.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// ARCHITECTURE DIAGRAM SCENE TEMPLATE (Futuristic Neon)
// ============================================

interface Component {
  id: string;
  label: string;
  icon?: string;
  layer: 'client' | 'server' | 'database' | 'external';
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface ArchitectureSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  components: Component[];
  connections: Connection[];
  theme?: ThemeColors;
}

export const ArchitectureScene: React.FC<ArchitectureSceneProps> = ({
  badge,
  title,
  subtitle,
  components,
  connections,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on component count
  const layers = ['client', 'server', 'database', 'external'] as const;
  const componentsByLayer = layers.map(layer =>
    components.filter(c => c.layer === layer)
  ).filter(l => l.length > 0);

  const archMaxWidth = getArchitectureMaxWidth(componentsByLayer.length);
  const archStyles = getArchitectureStyles(components.length);

  // Neon colors for layers
  const layerColors = {
    client: neonColors.purple,
    server: neonColors.cyan,
    database: neonColors.green,
    external: neonColors.orange,
  };

  const layerLabels = {
    client: '🏠 Your System',
    server: '⚙️ Backend Services',
    database: '🗄️ Data Layer',
    external: '🌐 External Services',
  };

  return (
    <SceneContainer theme={theme} centered={false} padding={40}>
      {/* Title at the top */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: archStyles.layerGap,
        width: '100%',
        maxWidth: archMaxWidth,
        margin: '0 auto',
        position: 'relative',
      }}>
        {componentsByLayer.map((layerComponents, layerIdx) => {
          const layer = layerComponents[0]?.layer;
          const color = layerColors[layer];

          const layerProgress = spring({
            frame: frame - (25 + layerIdx * 15),
            fps,
            config: { damping: 14, stiffness: 80 },
          });
          const layerOpacity = interpolate(layerProgress, [0, 1], [0, 1]);
          const layerY = interpolate(layerProgress, [0, 1], [30, 0]);

          return (
            <div
              key={layer}
              style={{
                opacity: layerOpacity,
                transform: `translateY(${layerY}px)`,
              }}
            >
              {/* Dashed border container like in screenshot */}
              <div style={{
                padding: 24,
                borderRadius: 20,
                border: `2px dashed ${color}60`,
                background: getGlassBackground(color, 0.05),
                position: 'relative',
              }}>
                {/* Layer label */}
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: 24,
                  background: theme.background,
                  padding: '4px 16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: color,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  {layerLabels[layer]}
                </div>

                {/* Components in layer */}
                <div style={{
                  display: 'flex',
                  gap: 24,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  paddingTop: 8,
                }}>
                  {layerComponents.map((comp, compIdx) => {
                    const compProgress = spring({
                      frame: frame - (40 + layerIdx * 15 + compIdx * 8),
                      fps,
                      config: { damping: 12, stiffness: 100, mass: 0.5 },
                    });
                    const compScale = interpolate(compProgress, [0, 1], [0.7, 1]);
                    const compOpacity = interpolate(compProgress, [0, 1], [0, 1]);

                    return (
                      <div
                        key={comp.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 12,
                          opacity: compOpacity,
                          transform: `scale(${compScale})`,
                        }}
                      >
                        {/* Icon box with neon glow */}
                        <div style={{
                          width: archStyles.iconBoxSize,
                          height: archStyles.iconBoxSize,
                          borderRadius: 18,
                          background: getGlassBackground(color, 0.2),
                          border: `2px solid ${color}`,
                          boxShadow: getNeonBoxShadow(color, 0.35),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 38,
                        }}>
                          {renderIcon(comp.icon || 'box', archStyles.iconSize, color)}
                        </div>
                        {/* Label */}
                        <span style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: archStyles.labelFontSize,
                          fontWeight: 600,
                          color: color,
                          textAlign: 'center',
                          maxWidth: 120,
                        }}>
                          {comp.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Animated connection arrow to next layer */}
              {layerIdx < componentsByLayer.length - 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px 0',
                }}>
                  {(() => {
                    const arrowProgress = interpolate(
                      frame,
                      [60 + layerIdx * 20, 80 + layerIdx * 20],
                      [0, 1],
                      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );
                    return (
                      <div style={{
                        width: 3,
                        height: archStyles.arrowHeight,
                        background: `linear-gradient(to bottom, ${color}, ${layerColors[componentsByLayer[layerIdx + 1]?.[0]?.layer] || color})`,
                        opacity: arrowProgress,
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: -7,
                          left: -6,
                          width: 0,
                          height: 0,
                          borderLeft: '7px solid transparent',
                          borderRight: '7px solid transparent',
                          borderTop: `12px solid ${layerColors[componentsByLayer[layerIdx + 1]?.[0]?.layer] || color}`,
                          filter: `drop-shadow(0 0 5px ${color})`,
                        }} />
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// COMPARISON SCENE TEMPLATE
// ============================================

interface ComparisonColumn {
  header: string;
  items: string[];
}

interface ComparisonSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  columns: ComparisonColumn[];
  highlightColumn?: number;
  theme?: ThemeColors;
}

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({
  badge,
  title,
  subtitle,
  columns,
  highlightColumn = -1,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on column count
  const compMaxWidth = getComparisonMaxWidth(columns.length);
  const columnWidth = getComparisonColumnWidth(columns.length);
  const compStyles = getComparisonStyles(columns.length);

  const maxItems = Math.max(...columns.map(c => c.items.length));

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div style={{
        display: 'flex',
        gap: compStyles.gap,
        width: '100%',
        maxWidth: compMaxWidth,
        justifyContent: 'center',
      }}>
        {columns.map((column, colIdx) => {
          const isHighlighted = colIdx === highlightColumn;
          const colAnim = animateIn({
            frame, fps,
            start: 30 + colIdx * 15,
            type: colIdx === 0 ? 'slide-right' : 'slide-left'
          });

          return (
            <div
              key={colIdx}
              style={{
                flex: 1,
                maxWidth: columnWidth,
                opacity: colAnim.opacity,
                transform: colAnim.transform,
              }}
            >
              {/* Header */}
              <div style={{
                padding: compStyles.headerPadding,
                background: isHighlighted
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                  : theme.cardBg,
                borderRadius: '14px 14px 0 0',
                border: `2px solid ${isHighlighted ? theme.primary : theme.primary}40`,
                borderBottom: 'none',
                textAlign: 'center',
              }}>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: compStyles.headerFontSize,
                  fontWeight: 700,
                  color: isHighlighted ? '#fff' : theme.text,
                }}>
                  {column.header}
                </span>
              </div>

              {/* Items */}
              <div style={{
                background: theme.cardBg,
                borderRadius: '0 0 14px 14px',
                border: `2px solid ${isHighlighted ? theme.primary : theme.primary}40`,
                borderTop: 'none',
                overflow: 'hidden',
              }}>
                {column.items.map((item, itemIdx) => {
                  const itemAnim = animateIn({
                    frame, fps,
                    start: 50 + colIdx * 15 + itemIdx * 8,
                    type: 'fade',
                  });

                  return (
                    <div
                      key={itemIdx}
                      style={{
                        padding: compStyles.itemPadding,
                        borderBottom: itemIdx < column.items.length - 1
                          ? `1px solid ${theme.primary}20`
                          : 'none',
                        opacity: itemAnim.opacity,
                        background: isHighlighted ? `${theme.primary}10` : 'transparent',
                      }}
                    >
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: compStyles.itemFontSize,
                        color: theme.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                        <span style={{ color: isHighlighted ? theme.primary : theme.success, fontSize: compStyles.itemFontSize + 2 }}>
                          {isHighlighted ? '★' : '•'}
                        </span>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// TIMELINE SCENE TEMPLATE
// ============================================

interface TimelineEvent {
  label: string;
  description: string;
  icon?: string;
}

interface TimelineSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  events: TimelineEvent[];
  theme?: ThemeColors;
}

export const TimelineScene: React.FC<TimelineSceneProps> = ({
  badge,
  title,
  subtitle,
  events,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic sizing based on event count
  const timelineMaxWidth = getTimelineMaxWidth(events.length);
  const tlStyles = getTimelineStyles(events.length);

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: timelineMaxWidth,
        padding: '50px 0',
      }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 50,
          right: 50,
          height: tlStyles.lineHeight,
          background: `linear-gradient(to right, ${theme.primary}60, ${theme.secondary}60)`,
          borderRadius: 3,
          opacity: fadeIn({ frame, start: 20, duration: 15 }),
        }} />

        {/* Events */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          padding: '0 28px',
        }}>
          {events.map((event, index) => {
            const eventAnim = animateIn({
              frame, fps,
              start: 35 + index * 20,
              type: 'spring',
            });
            const isTop = index % 2 === 0;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                  opacity: eventAnim.opacity,
                  transform: eventAnim.transform,
                }}
              >
                {/* Card (alternating top/bottom) */}
                <div style={{
                  order: isTop ? 0 : 2,
                  padding: '20px 24px',
                  background: theme.cardBg,
                  borderRadius: 14,
                  border: `2px solid ${theme.primary}40`,
                  textAlign: 'center',
                  maxWidth: tlStyles.cardWidth,
                  boxShadow: `0 6px 24px ${theme.primary}25`,
                }}>
                  {event.icon && (
                    <div style={{ fontSize: tlStyles.iconSize, marginBottom: 10 }}>{renderIcon(event.icon, tlStyles.iconSize - 4, theme.primary)}</div>
                  )}
                  <h4 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: tlStyles.labelFontSize,
                    fontWeight: 700,
                    color: theme.primary,
                    marginBottom: 6,
                  }}>
                    {event.label}
                  </h4>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: tlStyles.descFontSize,
                    color: theme.textMuted,
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {event.description}
                  </p>
                </div>

                {/* Connector line */}
                <div style={{
                  order: 1,
                  width: 3,
                  height: tlStyles.connectorHeight,
                  background: theme.primary,
                }} />

                {/* Node on timeline */}
                <div style={{
                  order: isTop ? 2 : 0,
                  width: tlStyles.nodeSize,
                  height: tlStyles.nodeSize,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: `4px solid ${theme.background}`,
                  boxShadow: `0 0 0 4px ${theme.primary}40`,
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </SceneContainer>
  );
};

// ============================================
// SUMMARY SCENE TEMPLATE
// ============================================

interface SummarySceneProps {
  badge?: string;
  title: string;
  points: Array<{
    title: string;
    description: string;
  }>;
  callToAction?: {
    title: string;
    description: string;
  };
  theme?: ThemeColors;
}

export const SummaryScene: React.FC<SummarySceneProps> = ({
  badge,
  title,
  points,
  callToAction,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  // Use dynamic sizing based on point count
  const summaryStyles = getSummaryStyles(points.length);

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} theme={theme} />

      {/* Summary points */}
      <div style={{ maxWidth: summaryStyles.maxWidth, width: '100%', marginBottom: 48 }}>
        <VerticalSteps
          steps={points.map((p, i) => ({
            number: i + 1,
            title: p.title,
            description: p.description,
          }))}
          theme={theme}
          baseDelay={30}
          stagger={15}
        />
      </div>

      {/* CTA */}
      {callToAction && (
        <AnimatedElement delay={30 + points.length * 15 + 20} type="scale">
          <GlowBox
            color={theme.success}
            padding={36}
            style={{ textAlign: 'center', maxWidth: summaryStyles.ctaBoxWidth }}
          >
            <h3
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: summaryStyles.titleFontSize,
                fontWeight: 700,
                color: theme.text,
                marginBottom: 12,
              }}
            >
              {callToAction.title}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: summaryStyles.descFontSize,
                color: theme.textMuted,
                margin: 0,
              }}
            >
              {callToAction.description}
            </p>
          </GlowBox>
        </AnimatedElement>
      )}
    </SceneContainer>
  );
};

// ============================================
// CLUSTER ARCHITECTURE SCENE TEMPLATE
// For grouped architecture diagrams with zones
// ============================================

interface ClusterArchitectureSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  clusters: DiagramCluster[];
  components: DiagramComponent[];
  connections: LabeledConnectionType[];
  theme?: ThemeColors;
}

export const ClusterArchitectureScene: React.FC<ClusterArchitectureSceneProps> = ({
  badge,
  title,
  subtitle,
  clusters,
  components,
  connections,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic canvas dimensions based on content
  const canvasSize = getClusterCanvasSize(components.length, clusters.length);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  // Get component color based on its color prop or index
  const getComponentColor = (comp: DiagramComponent, index: number) => {
    if (comp.color) return comp.color;
    const colors = [neonColors.purple, neonColors.cyan, neonColors.green, neonColors.orange, neonColors.pink];
    return colors[index % colors.length];
  };

  // Get cluster color
  const getClusterColor = (cluster: DiagramCluster, index: number) => {
    if (cluster.color) return cluster.color;
    const colors = [neonColors.purple, neonColors.cyan, neonColors.green, neonColors.orange];
    return colors[index % colors.length];
  };

  // Get component size in pixels using layoutScaling utilities
  const getComponentSize = (size?: 'sm' | 'md' | 'lg' | 'xl') => {
    const styles = getClusterComponentStyles(size);
    return { box: styles.box, font: styles.iconSize + 4 };
  };

  // Build component position lookup for connections
  const componentPositions = components.reduce((acc, comp) => {
    acc[comp.id] = {
      x: (comp.position.x / 100) * canvasWidth,
      y: (comp.position.y / 100) * canvasHeight,
    };
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  return (
    <SceneContainer theme={theme}>
      <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />

      <div style={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
      }}>
        {/* Clusters (zones) */}
        {clusters.map((cluster, clusterIdx) => {
          const color = getClusterColor(cluster, clusterIdx);
          const clusterProgress = spring({
            frame: frame - (20 + clusterIdx * 12),
            fps,
            config: { damping: 14, stiffness: 80 },
          });
          const clusterOpacity = interpolate(clusterProgress, [0, 1], [0, 1]);
          const clusterScale = interpolate(clusterProgress, [0, 1], [0.95, 1]);

          const clusterStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${cluster.position.x}%`,
            top: `${cluster.position.y}%`,
            width: `${cluster.size.width}%`,
            height: `${cluster.size.height}%`,
            borderRadius: 20,
            border: cluster.variant === 'dashed' || !cluster.variant
              ? `2px dashed ${color}60`
              : cluster.variant === 'outline'
              ? `2px solid ${color}60`
              : `1px solid ${color}40`,
            background: cluster.variant === 'glass' || !cluster.variant
              ? getGlassBackground(color, 0.05)
              : 'transparent',
            opacity: clusterOpacity,
            transform: `scale(${clusterScale})`,
            transformOrigin: 'top left',
          };

          return (
            <div key={cluster.id} style={clusterStyle}>
              {/* Cluster label */}
              <div style={{
                position: 'absolute',
                top: -12,
                left: 20,
                background: theme.background,
                padding: '4px 14px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: color,
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {cluster.labelIcon && <span>{cluster.labelIcon}</span>}
                {cluster.label}
              </div>
            </div>
          );
        })}

        {/* SVG layer for connections */}
        <ConnectionCanvas width={canvasWidth} height={canvasHeight}>
          {connections.map((conn, connIdx) => {
            const fromPos = componentPositions[conn.from];
            const toPos = componentPositions[conn.to];
            if (!fromPos || !toPos) return null;

            return (
              <LabeledConnectionSVG
                key={conn.id || `conn-${connIdx}`}
                from={fromPos}
                to={toPos}
                label={conn.label}
                labelPosition={conn.labelPosition}
                type={conn.type}
                bidirectional={conn.bidirectional}
                animated={conn.animated !== false}
                color={conn.color || neonColors.cyan}
                curved={conn.curved}
                delayFrames={60 + connIdx * 15}
                strokeWidth={3}
              />
            );
          })}
        </ConnectionCanvas>

        {/* Components */}
        {components.map((comp, compIdx) => {
          const color = getComponentColor(comp, compIdx);
          const sizes = getComponentSize(comp.size);
          const compProgress = spring({
            frame: frame - (35 + compIdx * 8),
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.5 },
          });
          const compScale = interpolate(compProgress, [0, 1], [0.7, 1]);
          const compOpacity = interpolate(compProgress, [0, 1], [0, 1]);

          return (
            <div
              key={comp.id}
              style={{
                position: 'absolute',
                left: `${comp.position.x}%`,
                top: `${comp.position.y}%`,
                transform: `translate(-50%, -50%) scale(${compScale})`,
                opacity: compOpacity,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* Icon box */}
              <div style={{
                width: sizes.box,
                height: sizes.box,
                borderRadius: 16,
                background: getGlassBackground(color, 0.2),
                border: `2px solid ${color}`,
                boxShadow: getNeonBoxShadow(color, 0.35),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: sizes.font,
              }}>
                {renderIcon(comp.icon || 'box', sizes.font - 6, color)}
              </div>
              {/* Label */}
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: getClusterComponentStyles(comp.size).fontSize,
                fontWeight: 600,
                color: color,
                textAlign: 'center',
                maxWidth: 120,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {comp.label}
              </span>
              {/* Sublabel */}
              {comp.sublabel && (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: theme.textMuted,
                  textAlign: 'center',
                  maxWidth: 120,
                }}>
                  {comp.sublabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// NETWORK DIAGRAM SCENE TEMPLATE
// For network topology and service diagrams
// ============================================

interface NetworkDiagramSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  nodes: DiagramComponent[];
  connections: LabeledConnectionType[];
  theme?: ThemeColors;
}

export const NetworkDiagramScene: React.FC<NetworkDiagramSceneProps> = ({
  badge,
  title,
  subtitle,
  nodes,
  connections,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic canvas dimensions based on node count
  const canvasSize = getNetworkCanvasSize(nodes.length);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const netStyles = getNetworkStyles();

  // Get node color
  const getNodeColor = (node: DiagramComponent, index: number) => {
    if (node.color) return node.color;
    const colors = [neonColors.purple, neonColors.cyan, neonColors.green, neonColors.orange, neonColors.pink, neonColors.yellow];
    return colors[index % colors.length];
  };

  // Get node size as wider rectangles using layoutScaling utilities
  const getNodeSizeLocal = (size?: 'sm' | 'md' | 'lg' | 'xl') => {
    return getNetworkNodeSize(size);
  };

  // Build node position lookup for connections
  const nodePositions = nodes.reduce((acc, node) => {
    acc[node.id] = {
      x: (node.position.x / 100) * canvasWidth,
      y: (node.position.y / 100) * canvasHeight,
    };
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  return (
    <SceneContainer theme={theme} centered={false} padding={40}>
      {/* Title at the top with minimal spacing */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />
      </div>

      {/* Diagram canvas - centered horizontally with more vertical space */}
      <div style={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
        margin: '0 auto',
      }}>
        {/* SVG layer for connections */}
        <ConnectionCanvas width={canvasWidth} height={canvasHeight}>
          {connections.map((conn, connIdx) => {
            const fromPos = nodePositions[conn.from];
            const toPos = nodePositions[conn.to];
            if (!fromPos || !toPos) return null;

            return (
              <LabeledConnectionSVG
                key={conn.id || `conn-${connIdx}`}
                from={fromPos}
                to={toPos}
                label={conn.label}
                labelPosition={conn.labelPosition}
                type={conn.type}
                bidirectional={conn.bidirectional}
                animated={conn.animated !== false}
                color={conn.color || neonColors.cyan}
                curved={conn.curved}
                delayFrames={50 + connIdx * 12}
                strokeWidth={netStyles.strokeWidth}
              />
            );
          })}
        </ConnectionCanvas>

        {/* Nodes */}
        {nodes.map((node, nodeIdx) => {
          const color = getNodeColor(node, nodeIdx);
          const sizes = getNodeSizeLocal(node.size);
          const isHighlight = 'highlight' in node && !!node.highlight;
          const nodeProgress = spring({
            frame: frame - (25 + nodeIdx * 8),
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.5 },
          });
          const nodeScale = interpolate(nodeProgress, [0, 1], [0.6, 1]);
          const nodeOpacity = interpolate(nodeProgress, [0, 1], [0, 1]);

          const bgGradient = isHighlight
            ? `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.7), rgba(${hexToRgb(color)}, 0.45))`
            : `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.25), rgba(${hexToRgb(color)}, 0.1))`;
          const textColor = isHighlight ? '#fff' : color;
          const glowIntensity = isHighlight ? 0.6 : 0.35;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                transform: `translate(-50%, -50%) scale(${nodeScale})`,
                opacity: nodeOpacity,
                zIndex: 10,
              }}
            >
              {/* Rectangular card node */}
              <div style={{
                width: sizes.width,
                height: sizes.height,
                borderRadius: 16,
                background: bgGradient,
                border: `2px solid rgba(${hexToRgb(color)}, 0.6)`,
                boxShadow: getNeonBoxShadow(color, glowIntensity),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: '0 18px',
              }}>
                {/* Icon */}
                <div style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {renderIcon(node.icon || 'box', sizes.iconSize, textColor)}
                </div>
                {/* Label + Sublabel */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  minWidth: 0,
                }}>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: netStyles.labelFontSize,
                    fontWeight: 600,
                    color: textColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {node.label}
                  </span>
                  {node.sublabel && (
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: netStyles.sublabelFontSize,
                      color: isHighlight ? 'rgba(255,255,255,0.75)' : theme.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {node.sublabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// RADIAL DIAGRAM SCENE TEMPLATE
// For center-spoke concept diagrams
// ============================================

interface RadialDiagramSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centerLabel: RadialCenterLabel;
  items: RadialItem[];
  theme?: ThemeColors;
}

export const RadialDiagramScene: React.FC<RadialDiagramSceneProps> = ({
  badge,
  title,
  subtitle,
  centerLabel,
  items,
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Get dynamic layout parameters based on item count
  const canvasSize = getRadialCanvasSize(items.length);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = getRadialRadius(items.length);
  const radialStyles = getRadialStyles(items.length);

  // Get item color
  const getItemColor = (item: RadialItem, index: number) => {
    if (item.color) return item.color;
    const colors = [neonColors.purple, neonColors.cyan, neonColors.green, neonColors.orange, neonColors.pink, neonColors.yellow];
    return colors[index % colors.length];
  };

  // Calculate item positions in a circle
  const getItemPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  // Center animation
  const centerProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });
  const centerScale = interpolate(centerProgress, [0, 1], [0.5, 1]);
  const centerOpacity = interpolate(centerProgress, [0, 1], [0, 1]);

  const centerColor = centerLabel.color || neonColors.purple;

  return (
    <SceneContainer theme={theme} centered={false} padding={40}>
      {/* Title at the top */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <SceneTitle badge={badge} title={title} subtitle={subtitle} theme={theme} />
      </div>

      <div style={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
        margin: '0 auto',
      }}>
        {/* SVG layer for radial connections */}
        <ConnectionCanvas width={canvasWidth} height={canvasHeight}>
          {items.map((item, index) => {
            const pos = getItemPosition(index, items.length);
            const color = getItemColor(item, index);
            const connectionDelay = 40 + index * 10;

            return (
              <LabeledConnectionSVG
                key={`radial-${index}`}
                from={{ x: centerX, y: centerY }}
                to={pos}
                color={color}
                type="solid"
                animated={true}
                delayFrames={connectionDelay}
                strokeWidth={radialStyles.connectionWidth}
              />
            );
          })}
        </ConnectionCanvas>

        {/* Center component */}
        <div
          style={{
            position: 'absolute',
            left: centerX,
            top: centerY,
            transform: `translate(-50%, -50%) scale(${centerScale})`,
            opacity: centerOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            zIndex: 20,
          }}
        >
          {/* Center icon box (larger) */}
          <div style={{
            width: radialStyles.centerBoxSize,
            height: radialStyles.centerBoxSize,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${centerColor}, ${centerColor}80)`,
            border: `3px solid ${centerColor}`,
            boxShadow: `0 0 50px ${centerColor}60, 0 0 100px ${centerColor}30, inset 0 0 24px rgba(255,255,255,0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
          }}>
            {renderIcon(centerLabel.icon || 'zap', radialStyles.centerIconSize, '#fff')}
          </div>
          {/* Center label */}
          <div style={{
            background: getGlassBackground(centerColor, 0.2),
            border: `2px solid ${centerColor}`,
            borderRadius: 14,
            padding: '12px 24px',
            boxShadow: `0 0 24px ${centerColor}45`,
          }}>
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              textShadow: `0 0 12px ${centerColor}`,
            }}>
              {centerLabel.label}
            </span>
          </div>
        </div>

        {/* Radial items */}
        {items.map((item, index) => {
          const pos = getItemPosition(index, items.length);
          const color = getItemColor(item, index);
          const itemProgress = spring({
            frame: frame - (50 + index * 12),
            fps,
            config: { damping: 12, stiffness: 90, mass: 0.6 },
          });
          const itemScale = interpolate(itemProgress, [0, 1], [0.5, 1]);
          const itemOpacity = interpolate(itemProgress, [0, 1], [0, 1]);

          return (
            <div
              key={`item-${index}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: `translate(-50%, -50%) scale(${itemScale})`,
                opacity: itemOpacity,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                zIndex: 10,
              }}
            >
              {/* Item icon box */}
              <div style={{
                width: radialStyles.itemBoxSize,
                height: radialStyles.itemBoxSize,
                borderRadius: 18,
                background: getGlassBackground(color, 0.15),
                border: `2px solid ${color}`,
                boxShadow: getNeonBoxShadow(color, 0.4),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
              }}>
                {renderIcon(item.icon || 'box', radialStyles.itemIconSize, color)}
              </div>
              {/* Item label */}
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: radialStyles.itemLabelFontSize,
                fontWeight: 600,
                color: color,
                textAlign: 'center',
                maxWidth: 110,
              }}>
                {item.label}
              </span>
              {/* Item description */}
              {item.description && (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: theme.textMuted,
                  textAlign: 'center',
                  maxWidth: 120,
                  lineHeight: 1.4,
                }}>
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};

// ============================================
// IMAGE SCENE TEMPLATE
// ============================================

interface ImageSceneProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  caption?: string;
  captionPosition?: 'bottom' | 'overlay' | 'none';
  layout?: 'full' | 'centered' | 'left-with-text' | 'right-with-text';
  zoomAnimation?: {
    enabled: boolean;
    startScale?: number;
    endScale?: number;
  };
  textOverlay?: string;
  supportingCards?: SupportingCard[];
  cardPosition?: 'right' | 'left' | 'bottom';
  theme?: ThemeColors;
}

export const ImageSceneTemplate: React.FC<ImageSceneProps> = ({
  badge,
  title,
  subtitle,
  imageUrl,
  caption,
  captionPosition = 'bottom',
  layout = 'centered',
  zoomAnimation,
  textOverlay,
  supportingCards,
  cardPosition = 'right',
  theme = defaultTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hasSupportingCards = supportingCards && supportingCards.length > 0;

  // Calculate animation progress for Ken Burns effect
  const animationProgress = interpolate(
    frame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Ken Burns zoom effect
  const startScale = zoomAnimation?.startScale ?? 1.0;
  const endScale = zoomAnimation?.endScale ?? 1.15;
  const imageScale = zoomAnimation?.enabled
    ? interpolate(animationProgress, [0, 1], [startScale, endScale])
    : 1;

  // Fade in animation
  const fadeInProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const imageOpacity = interpolate(fadeInProgress, [0, 1], [0, 1]);

  // Caption animation
  const captionProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const captionOpacity = interpolate(captionProgress, [0, 1], [0, 1]);
  const captionY = interpolate(captionProgress, [0, 1], [20, 0]);

  // Determine image container styles based on layout
  const getLayoutStyles = () => {
    // When supporting cards are present, constrain image size more
    if (hasSupportingCards) {
      return {
        maxWidth: '100%',
        maxHeight: '70%',
        objectFit: 'contain' as const,
      };
    }
    switch (layout) {
      case 'full':
        return {
          width: '100%',
          height: '100%',
          objectFit: 'cover' as const,
        };
      case 'centered':
        return {
          maxWidth: '85%',
          maxHeight: '75%',
          objectFit: 'contain' as const,
        };
      case 'left-with-text':
      case 'right-with-text':
        return {
          width: '55%',
          maxHeight: '80%',
          objectFit: 'contain' as const,
        };
      default:
        return {
          maxWidth: '85%',
          maxHeight: '75%',
          objectFit: 'contain' as const,
        };
    }
  };

  const layoutStyles = getLayoutStyles();
  const isTextLayout = layout === 'left-with-text' || layout === 'right-with-text';

  // Image content component
  const imageContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'right-with-text' ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isTextLayout ? 40 : 0,
        width: '100%',
        height: hasSupportingCards ? 'auto' : (title ? 'calc(100% - 120px)' : '100%'),
        position: 'relative',
      }}
    >
      {/* Image container with Ken Burns effect */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: hasSupportingCards ? '100%' : (isTextLayout ? '55%' : '100%'),
          height: hasSupportingCards ? 'auto' : '100%',
          overflow: 'hidden',
          borderRadius: layout === 'full' ? 0 : 20,
          opacity: imageOpacity,
        }}
      >
        <img
          src={imageUrl}
          alt={caption || 'Scene image'}
          style={{
            ...layoutStyles,
            transform: `scale(${imageScale})`,
            transition: 'transform 0.1s ease-out',
            borderRadius: layout === 'full' ? 0 : 16,
            boxShadow: layout !== 'full' ? getNeonBoxShadow(neonColors.purple, 0.3) : 'none',
          }}
        />

        {/* Overlay caption */}
        {caption && captionPosition === 'overlay' && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '30px 40px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              opacity: captionOpacity,
              transform: `translateY(${captionY}px)`,
            }}
          >
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 22,
                fontWeight: 500,
                color: '#fff',
                textAlign: 'center',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {caption}
            </p>
          </div>
        )}
      </div>

      {/* Text overlay for side layouts - only when no supporting cards */}
      {!hasSupportingCards && isTextLayout && textOverlay && (
        <div
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 20,
            opacity: captionOpacity,
            transform: `translateY(${captionY}px)`,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20,
              lineHeight: 1.6,
              color: theme.text,
              margin: 0,
            }}
          >
            {textOverlay}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <SceneContainer theme={theme}>
      {/* Title section if provided */}
      {(badge || title) && (
        <div style={{ marginBottom: 20 }}>
          <SceneTitle badge={badge} title={title || ''} subtitle={subtitle} theme={theme} />
        </div>
      )}

      {/* Main content area - with optional split layout */}
      <SplitLayoutWrapper
        supportingCards={supportingCards}
        cardPosition={cardPosition}
        theme={theme}
        primaryWidthPercent={60}
      >
        {imageContent}
      </SplitLayoutWrapper>

      {/* Bottom caption - only when no supporting cards (cards replace captions) */}
      {!hasSupportingCards && caption && captionPosition === 'bottom' && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: captionOpacity,
            transform: `translateY(${captionY}px)`,
          }}
        >
          <div
            style={{
              padding: '16px 32px',
              background: getGlassBackground(neonColors.purple, 0.15),
              border: `1px solid ${neonColors.purple}40`,
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
            }}
          >
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 18,
                fontWeight: 500,
                color: theme.text,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {caption}
            </p>
          </div>
        </div>
      )}
    </SceneContainer>
  );
};
