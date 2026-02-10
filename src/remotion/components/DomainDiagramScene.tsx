/**
 * DOMAIN DIAGRAM SCENE - Stub for browser preview
 * The full implementation requires component registry from backend.
 * In the browser preview, we show a placeholder.
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneTitle } from './Typography';
import { Badge } from './Cards';

interface DomainDiagramSceneProps {
  badge?: string;
  title: string;
  subtitle?: string;
  domain: string;
  domainComponents: any[];
  domainConnections: any[];
  domainClusters?: any[];
  theme: any;
}

export const DomainDiagramScene: React.FC<DomainDiagramSceneProps> = ({
  badge,
  title,
  subtitle,
  domain,
  domainComponents = [],
  domainConnections = [],
  domainClusters = [],
  theme,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {badge && <Badge theme={theme}>{badge}</Badge>}
        <SceneTitle title={title} theme={theme} />
        {subtitle && (
          <div style={{ color: theme.textMuted, fontSize: '28px' }}>{subtitle}</div>
        )}
      </div>

      {/* Placeholder for domain diagram */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        {/* Show component count */}
        <div
          style={{
            textAlign: 'center',
            color: theme.textMuted,
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px', color: theme.primary }}>
            {domain || 'system-design'}
          </div>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>
            {domainComponents.length} components
          </div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>
            {domainConnections.length} connections
          </div>
          <div style={{ fontSize: '14px', opacity: 0.5, marginTop: '16px' }}>
            Full preview available in rendered video
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default DomainDiagramScene;
