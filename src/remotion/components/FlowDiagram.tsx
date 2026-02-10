import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeColors, DiagramNode, DiagramConnection } from '../types';
import { defaultTheme, hexToRgb, getGlow } from '../styles/theme';
import { fadeIn, getStaggerDelay } from '../utils/animations';
import { renderIcon } from '../utils/lucideIconMap';

// ============================================
// FLOW DIAGRAM
// ============================================

interface FlowDiagramProps {
  nodes: DiagramNode[];
  connections?: DiagramConnection[];
  theme?: ThemeColors;
  baseDelay?: number;
  nodeStagger?: number;
  connectionDelay?: number;
  style?: React.CSSProperties;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  nodes,
  connections = [],
  theme = defaultTheme,
  baseDelay = 0,
  nodeStagger = 12,
  connectionDelay = 8,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const getNodeColor = (variant?: string) => {
    switch (variant) {
      case 'primary': return theme.primary;
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      default: return theme.secondary;
    }
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Connections (SVG) */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {connections.map((conn, index) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);

          if (!fromNode || !toNode) return null;

          const connDelay = baseDelay + nodes.length * nodeStagger + index * connectionDelay;
          const opacity = fadeIn({ frame, start: connDelay, duration: 15 });

          // Calculate line positions (center of nodes)
          const x1 = fromNode.x + 75; // Assuming 150px node width
          const y1 = fromNode.y + 50; // Assuming 100px node height
          const x2 = toNode.x + 75;
          const y2 = toNode.y + 50;

          return (
            <g key={`${conn.from}-${conn.to}`} opacity={opacity}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={theme.primary}
                strokeWidth={3}
                strokeDasharray="10 5"
                opacity={0.5}
              />
              {/* Arrow head */}
              <polygon
                points={`${x2},${y2} ${x2-10},${y2-5} ${x2-10},${y2+5}`}
                fill={theme.primary}
                transform={`rotate(${Math.atan2(y2-y1, x2-x1) * 180 / Math.PI}, ${x2}, ${y2})`}
              />
              {/* Label */}
              {conn.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 12}
                  textAnchor="middle"
                  fill={theme.textMuted}
                  fontSize={14}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, index) => {
        const nodeDelay = baseDelay + getStaggerDelay(index, node.delay || 0, nodeStagger);
        const opacity = fadeIn({ frame, start: nodeDelay, duration: 15 });
        const color = getNodeColor(node.variant);

        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: 150,
              minHeight: 100,
              background: `rgba(${hexToRgb(color)}, 0.1)`,
              border: `2px solid ${color}`,
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              opacity,
              boxShadow: `0 0 28px rgba(${hexToRgb(color)}, 0.25)`,
            }}
          >
            {node.icon && (
              <div style={{ fontSize: 34, marginBottom: 10 }}>{node.icon}</div>
            )}
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 500,
                color,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {node.label}
            </div>
            {node.description && (
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: theme.textMuted,
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                {node.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// HORIZONTAL FLOW (Simple left-to-right)
// ============================================

interface HorizontalFlowProps {
  steps: Array<{
    icon: string;
    label: string;
    description?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning';
  }>;
  theme?: ThemeColors;
  baseDelay?: number;
  stagger?: number;
  showArrows?: boolean;
}

export const HorizontalFlow: React.FC<HorizontalFlowProps> = ({
  steps,
  theme = defaultTheme,
  baseDelay = 0,
  stagger = 15,
  showArrows = true,
}) => {
  const frame = useCurrentFrame();

  const getColor = (variant?: string) => {
    switch (variant) {
      case 'primary': return theme.primary;
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      default: return theme.secondary;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        flexWrap: 'wrap',
      }}
    >
      {steps.map((step, index) => {
        const stepDelay = baseDelay + index * stagger;
        const opacity = fadeIn({ frame, start: stepDelay, duration: 15 });
        const arrowOpacity = fadeIn({ frame, start: stepDelay + stagger / 2, duration: 10 });
        const color = getColor(step.variant);

        return (
          <React.Fragment key={index}>
            {/* Step box */}
            <div
              style={{
                opacity,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 24,
                  background: `rgba(${hexToRgb(color)}, 0.1)`,
                  border: `2px solid rgba(${hexToRgb(color)}, 0.4)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  boxShadow: `0 0 36px rgba(${hexToRgb(color)}, 0.2)`,
                }}
              >
                {renderIcon(step.icon || 'box', 44, color)}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  color: theme.textMuted,
                  textAlign: 'center',
                  maxWidth: 120,
                }}
              >
                {step.label}
              </div>
            </div>

            {/* Arrow */}
            {showArrows && index < steps.length - 1 && (
              <div
                style={{
                  opacity: arrowOpacity,
                  fontSize: 34,
                  color: theme.primary,
                }}
              >
                →
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// VERTICAL STEP LIST
// ============================================

interface VerticalStepsProps {
  steps: Array<{
    number?: number;
    title: string;
    description: string;
    icon?: string;
  }>;
  theme?: ThemeColors;
  baseDelay?: number;
  stagger?: number;
}

export const VerticalSteps: React.FC<VerticalStepsProps> = ({
  steps,
  theme = defaultTheme,
  baseDelay = 0,
  stagger = 12,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {steps.map((step, index) => {
        const stepDelay = baseDelay + index * stagger;
        const opacity = fadeIn({ frame, start: stepDelay, duration: 15 });

        return (
          <div
            key={index}
            style={{
              opacity,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 20,
              padding: 24,
              background: `rgba(${hexToRgb(theme.primary)}, 0.05)`,
              border: `1px solid rgba(${hexToRgb(theme.primary)}, 0.2)`,
              borderRadius: 14,
            }}
          >
            {/* Number/Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Poppins', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {step.icon ? renderIcon(step.icon, 22, '#fff') : (step.number || index + 1)}
            </div>

            {/* Content */}
            <div>
              <h4
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: theme.text,
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                {step.title}
              </h4>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: theme.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
