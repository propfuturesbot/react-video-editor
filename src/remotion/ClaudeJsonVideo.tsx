/**
 * Claude JSON Video - Stub for browser preview
 * This component is for rendering Claude JSON output directly.
 * In the video editor preview, we redirect to TemplateVideo.
 */

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TemplateVideo } from './TemplateVideo';
import type { VideoScript, TemplateVideoScript } from './types';

interface ClaudeJsonVideoProps {
  script: VideoScript | TemplateVideoScript;
}

export const ClaudeJsonVideo: React.FC<ClaudeJsonVideoProps> = ({ script }) => {
  // In browser preview, delegate to TemplateVideo
  return <TemplateVideo script={script as any} />;
};

export default ClaudeJsonVideo;
