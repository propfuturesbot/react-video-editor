// ============================================
// STATE TRANSITION - Nodes with animated transitions
// ============================================

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { StateTransitionProps } from './types';
import { DATA_DISPLAY_COLORS, hexToRgb, FONTS } from './constants';
import { renderIcon } from '../../utils/lucideIconMap';

export const StateTransition: React.FC<StateTransitionProps> = ({
  title,
  states,
  transitions,
  currentState,
  width = 700,
  height = 400,
  x,
  y,
  animateIn = true,
  animationDelay = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Container animation
  const containerOpacity = animateIn
    ? interpolate(
        frame,
        [animationDelay, animationDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Position styles
  const positionStyles: React.CSSProperties =
    x !== undefined && y !== undefined
      ? { position: 'absolute', left: x - width / 2, top: y }
      : {};

  // Calculate state positions in a horizontal line
  const stateRadius = 40;
  const spacing = (width - 80) / Math.max(states.length - 1, 1);
  const stateY = (height - (title ? 80 : 40)) / 2 + (title ? 60 : 20);

  const getStatePosition = (stateId: string): { x: number; y: number } => {
    const index = states.findIndex((s) => s.id === stateId);
    return {
      x: 40 + index * spacing,
      y: stateY,
    };
  };

  // Get state by ID
  const getState = (id: string) => states.find((s) => s.id === id);

  // Render transitions
  const renderTransitions = () => {
    return transitions.map((trans, i) => {
      const fromPos = getStatePosition(trans.from);
      const toPos = getStatePosition(trans.to);
      const fromState = getState(trans.from);
      const toState = getState(trans.to);

      const transDelay = animationDelay + 20 + i * 5;
      const transProgress = interpolate(
        frame,
        [transDelay, transDelay + 20],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const color = fromState?.color || DATA_DISPLAY_COLORS.cyan;

      // Self-loop
      if (trans.from === trans.to) {
        const loopRadius = 25;
        return (
          <g key={`trans-${i}`} opacity={transProgress}>
            <path
              d={`M ${fromPos.x} ${fromPos.y - stateRadius}
                  C ${fromPos.x - loopRadius * 2} ${fromPos.y - stateRadius - loopRadius * 2},
                    ${fromPos.x + loopRadius * 2} ${fromPos.y - stateRadius - loopRadius * 2},
                    ${fromPos.x} ${fromPos.y - stateRadius}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="6 3"
            />
            {trans.label && (
              <text
                x={fromPos.x}
                y={fromPos.y - stateRadius - loopRadius * 2 - 10}
                textAnchor="middle"
                fill={DATA_DISPLAY_COLORS.textMuted}
                fontSize={11}
                fontFamily={FONTS.body}
              >
                {trans.label}
              </text>
            )}
          </g>
        );
      }

      // Curved arrow
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Start and end points adjusted for node radius
      const startX = fromPos.x + stateRadius * Math.cos(angle);
      const startY = fromPos.y + stateRadius * Math.sin(angle);
      const endX = toPos.x - stateRadius * Math.cos(angle);
      const endY = toPos.y - stateRadius * Math.sin(angle);

      // Control point for curve (slight arc)
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - 30;

      // Arrow
      const arrowSize = 8;
      const arrowAngle = Math.atan2(endY - midY, endX - midX);

      return (
        <g key={`trans-${i}`} opacity={transProgress}>
          <path
            d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={dist}
            strokeDashoffset={dist * (1 - transProgress)}
          />
          {/* Arrow head */}
          <polygon
            points={`
              ${endX},${endY}
              ${endX - arrowSize * Math.cos(arrowAngle - 0.4)},${endY - arrowSize * Math.sin(arrowAngle - 0.4)}
              ${endX - arrowSize * Math.cos(arrowAngle + 0.4)},${endY - arrowSize * Math.sin(arrowAngle + 0.4)}
            `}
            fill={color}
          />
          {/* Label */}
          {trans.label && (
            <text
              x={midX}
              y={midY - 8}
              textAnchor="middle"
              fill={DATA_DISPLAY_COLORS.textMuted}
              fontSize={11}
              fontFamily={FONTS.body}
            >
              {trans.label}
            </text>
          )}
        </g>
      );
    });
  };

  // Render states
  const renderStates = () => {
    return states.map((state, i) => {
      const pos = getStatePosition(state.id);
      const stateDelay = animationDelay + 10 + i * 8;
      const stateSpring = spring({
        frame: Math.max(0, frame - stateDelay),
        fps,
        config: { damping: 12, mass: 0.5, stiffness: 100 },
      });

      const stateOpacity = interpolate(
        frame,
        [stateDelay, stateDelay + 15],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

      const stateScale = interpolate(stateSpring, [0, 1], [0.5, 1]);

      const isCurrent = currentState === state.id;
      const color = state.color || DATA_DISPLAY_COLORS.cyan;
      const rgb = hexToRgb(color);

      return (
        <g key={state.id}>
          {/* Initial state indicator */}
          {state.isInitial && (
            <g opacity={stateOpacity}>
              <line
                x1={pos.x - stateRadius - 30}
                y1={pos.y}
                x2={pos.x - stateRadius - 5}
                y2={pos.y}
                stroke={color}
                strokeWidth={2}
              />
              <polygon
                points={`
                  ${pos.x - stateRadius - 5},${pos.y}
                  ${pos.x - stateRadius - 12},${pos.y - 5}
                  ${pos.x - stateRadius - 12},${pos.y + 5}
                `}
                fill={color}
              />
            </g>
          )}

          {/* State circle */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={stateRadius * stateScale}
            fill={isCurrent
              ? `rgba(${rgb}, 0.3)`
              : `rgba(${rgb}, 0.1)`}
            stroke={color}
            strokeWidth={isCurrent ? 3 : 2}
            opacity={stateOpacity}
            filter={isCurrent ? `drop-shadow(0 0 15px rgba(${rgb}, 0.5))` : undefined}
          />

          {/* Final state double circle */}
          {state.isFinal && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={(stateRadius - 6) * stateScale}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={stateOpacity}
            />
          )}

          {/* Label */}
          <text
            x={pos.x}
            y={pos.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isCurrent ? color : DATA_DISPLAY_COLORS.text}
            fontSize={13}
            fontFamily={FONTS.heading}
            fontWeight={600}
            opacity={stateOpacity}
          >
            {state.label}
          </text>
        </g>
      );
    });
  };

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        opacity: containerOpacity,
        ...positionStyles,
        ...style,
      }}
    >
      {/* Title */}
      {title && (
        <h2
          style={{
            fontFamily: FONTS.heading,
            fontSize: 24,
            fontWeight: 700,
            color: DATA_DISPLAY_COLORS.text,
            margin: 0,
            marginBottom: 20,
            textAlign: 'center',
            opacity: interpolate(
              frame,
              [animationDelay, animationDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}
        >
          {title}
        </h2>
      )}

      {/* SVG */}
      <svg width={width} height={height - (title ? 60 : 0)} style={{ overflow: 'visible' }}>
        {renderTransitions()}
        {renderStates()}
      </svg>
    </div>
  );
};

export default StateTransition;
