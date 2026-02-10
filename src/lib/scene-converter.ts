/**
 * Scene Converter Utility
 * Converts between CourseForge scene format and Editor timeline format
 */

// CourseForge scene types (matching your backend)
export interface CourseForgeScene {
  id: string;
  scene_type: string;
  title?: string;
  narration_text?: string;
  visual_prompt?: string;
  visual_url?: string;
  duration_seconds?: number;
  order_index: number;
}

export interface CourseForgeAsset {
  sceneId: string;
  imageUrl: string;
  audioUrl: string;
  duration: number; // in seconds
}

// Editor timeline types
export interface EditorTrackItem {
  id: string;
  type: "image" | "audio" | "video" | "caption" | "text";
  name: string;
  display: { from: number; to: number };
  duration: number;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EditorTrack {
  id: string;
  type: string;
  items: string[];
}

export interface EditorData {
  id: string;
  fps: number;
  size: { width: number; height: number };
  tracks: EditorTrack[];
  trackItemsMap: Record<string, EditorTrackItem>;
  trackItemIds: string[];
}

/**
 * Convert CourseForge scenes to Editor timeline format
 */
export function scenesToEditorFormat(
  scenes: CourseForgeScene[],
  assets: CourseForgeAsset[]
): EditorData {
  let currentTime = 0;
  const trackItemsMap: Record<string, EditorTrackItem> = {};
  const imageItems: string[] = [];
  const audioItems: string[] = [];
  const trackItemIds: string[] = [];

  // Sort scenes by order_index
  const sortedScenes = [...scenes].sort((a, b) => a.order_index - b.order_index);

  sortedScenes.forEach((scene, index) => {
    const asset = assets.find((a) => a.sceneId === scene.id);
    if (!asset) {
      console.warn(`No asset found for scene ${scene.id}`);
      return;
    }

    const durationMs = (asset.duration || scene.duration_seconds || 5) * 1000;

    // Image/video track item
    const imageId = `image-${scene.id}`;
    imageItems.push(imageId);
    trackItemIds.push(imageId);
    trackItemsMap[imageId] = {
      id: imageId,
      type: "image",
      name: scene.title || `Scene ${index + 1}`,
      display: { from: currentTime, to: currentTime + durationMs },
      duration: durationMs,
      details: {
        src: asset.imageUrl,
        width: 1920,
        height: 1080,
      },
      metadata: {
        sceneId: scene.id,
        sceneType: scene.scene_type,
        originalScene: scene, // Preserve original for export
      },
    };

    // Audio track item
    if (asset.audioUrl) {
      const audioId = `audio-${scene.id}`;
      audioItems.push(audioId);
      trackItemIds.push(audioId);
      trackItemsMap[audioId] = {
        id: audioId,
        type: "audio",
        name: `Narration ${index + 1}`,
        display: { from: currentTime, to: currentTime + durationMs },
        duration: durationMs,
        details: {
          src: asset.audioUrl,
          volume: 100,
        },
        metadata: {
          sceneId: scene.id,
        },
      };
    }

    currentTime += durationMs;
  });

  return {
    id: `project-${Date.now()}`,
    fps: 30,
    size: { width: 1920, height: 1080 },
    tracks: [
      { id: "video-track", type: "video", items: imageItems },
      { id: "audio-track", type: "audio", items: audioItems },
    ],
    trackItemsMap,
    trackItemIds,
  };
}

/**
 * Convert Editor timeline format back to CourseForge scenes
 */
export function editorToScenes(editorData: EditorData): CourseForgeScene[] {
  const scenes: CourseForgeScene[] = [];

  // Get video track items in order
  const videoTrack = editorData.tracks.find((t) => t.type === "video");
  if (!videoTrack) return scenes;

  // Sort items by their start time
  const sortedItems = videoTrack.items
    .map((itemId) => editorData.trackItemsMap[itemId])
    .filter(Boolean)
    .sort((a, b) => a.display.from - b.display.from);

  sortedItems.forEach((item, index) => {
    if (!item.metadata?.originalScene) {
      console.warn(`No original scene data for item ${item.id}`);
      return;
    }

    const scene: CourseForgeScene = {
      ...item.metadata.originalScene,
      // Update duration based on editor changes
      duration_seconds: item.duration / 1000,
      // Update order based on current position
      order_index: index,
    };

    scenes.push(scene);
  });

  return scenes;
}

/**
 * Calculate total duration of timeline in seconds
 */
export function calculateTotalDuration(editorData: EditorData): number {
  let maxTime = 0;

  for (const item of Object.values(editorData.trackItemsMap)) {
    if (item.display.to > maxTime) {
      maxTime = item.display.to;
    }
  }

  return maxTime / 1000; // Convert to seconds
}

/**
 * Get scenes in their current timeline order
 */
export function getScenesInOrder(editorData: EditorData): string[] {
  const videoTrack = editorData.tracks.find((t) => t.type === "video");
  if (!videoTrack) return [];

  return videoTrack.items
    .map((itemId) => editorData.trackItemsMap[itemId])
    .filter(Boolean)
    .sort((a, b) => a.display.from - b.display.from)
    .map((item) => item.metadata?.sceneId)
    .filter(Boolean);
}
