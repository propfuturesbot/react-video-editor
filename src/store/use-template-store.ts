import { create } from 'zustand';
import type { TemplateVideoScript, TemplateScene } from '@/remotion/types';

interface AudioTrack {
  sceneId: string;
  audioUrl: string;
  startFrame: number;
  durationFrames: number;
}

interface TemplateStore {
  templateScript: TemplateVideoScript | null;
  setTemplateScript: (script: TemplateVideoScript | null) => void;

  // Scene operations (video track)
  updateSceneOrder: (sceneIds: string[]) => void;
  updateSceneTiming: (sceneId: string, startFrame: number, endFrame: number) => void;
  deleteScene: (sceneId: string) => void;

  // Audio track operations
  updateAudioTiming: (audioId: string, startFrame: number, durationFrames: number) => void;
  deleteAudio: (audioId: string) => void;
  addAudio: (audioTrack: AudioTrack) => void;

  // Computed
  getTotalFrames: () => number;
  getFps: () => number;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templateScript: null,

  setTemplateScript: (script) => set({ templateScript: script }),

  updateSceneOrder: (sceneIds) => {
    const script = get().templateScript;
    if (!script) return;

    const sceneMap = new Map(script.scenes.map(s => [s.id, s]));
    const reorderedScenes = sceneIds
      .map(id => sceneMap.get(id))
      .filter(Boolean) as TemplateScene[];

    // Recalculate frame positions based on new order
    let currentFrame = 0;
    reorderedScenes.forEach(scene => {
      const duration = scene.endFrame - scene.startFrame;
      scene.startFrame = currentFrame;
      scene.endFrame = currentFrame + duration;
      currentFrame += duration;
    });

    set({
      templateScript: {
        ...script,
        scenes: reorderedScenes,
      }
    });
  },

  updateSceneTiming: (sceneId, startFrame, endFrame) => {
    const script = get().templateScript;
    if (!script) return;

    set({
      templateScript: {
        ...script,
        scenes: script.scenes.map(s =>
          s.id === sceneId
            ? { ...s, startFrame: Math.round(startFrame), endFrame: Math.round(endFrame) }
            : s
        ),
      }
    });
  },

  deleteScene: (sceneId) => {
    const script = get().templateScript;
    if (!script) return;

    const updatedScenes = script.scenes.filter(s => s.id !== sceneId);

    // Recalculate frame positions
    let currentFrame = 0;
    updatedScenes.forEach(scene => {
      const duration = scene.endFrame - scene.startFrame;
      scene.startFrame = currentFrame;
      scene.endFrame = currentFrame + duration;
      currentFrame += duration;
    });

    set({
      templateScript: {
        ...script,
        scenes: updatedScenes,
      }
    });
  },

  // Audio track operations
  updateAudioTiming: (audioId, startFrame, durationFrames) => {
    const script = get().templateScript;
    if (!script) return;

    set({
      templateScript: {
        ...script,
        audioTracks: (script.audioTracks || []).map(a =>
          a.sceneId === audioId
            ? { ...a, startFrame: Math.round(startFrame), durationFrames: Math.round(durationFrames) }
            : a
        ),
      }
    });
  },

  deleteAudio: (audioId) => {
    const script = get().templateScript;
    if (!script) return;

    set({
      templateScript: {
        ...script,
        audioTracks: (script.audioTracks || []).filter(a => a.sceneId !== audioId),
      }
    });
  },

  addAudio: (audioTrack) => {
    const script = get().templateScript;
    if (!script) return;

    set({
      templateScript: {
        ...script,
        audioTracks: [...(script.audioTracks || []), audioTrack],
      }
    });
  },

  getTotalFrames: () => {
    const script = get().templateScript;
    if (!script || script.scenes.length === 0) return 1;
    return Math.max(...script.scenes.map(s => s.endFrame));
  },

  getFps: () => {
    const script = get().templateScript;
    return script?.config?.fps || 30;
  },
}));
