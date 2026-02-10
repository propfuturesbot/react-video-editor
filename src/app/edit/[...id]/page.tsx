"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor from "@/features/editor";
import { dispatch } from "@designcombo/events";
import { DESIGN_LOAD } from "@designcombo/state";
import useStore from "@/features/editor/store/use-store";
import { useTemplateStore } from "@/store/use-template-store";

// Allowed parent origins for postMessage
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.NEXT_PUBLIC_COURSEFORGE_URL || "",
].filter(Boolean);

interface ProjectData {
  id: string;
  name: string;
  fps: number;
  size: { width: number; height: number };
  tracks: any[];
  trackItemsMap: Record<string, any>;
  trackItemIds: string[];
  version: number;
  updated_at: string;
  templateScript?: any; // Raw TemplateVideoScript for Remotion preview
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface ParentMessage {
  type: string;
  token?: string;
  jobId?: string;
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="text-4xl">Error</div>
        <h2 className="text-xl font-semibold text-foreground">Failed to load project</h2>
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Get project ID from route params
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Auth token - can come from URL or postMessage
  const urlToken = searchParams.get("token");
  const [token, setToken] = useState<string | null>(urlToken);
  const [version, setVersion] = useState<number>(1);

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we're in an iframe
  const isInIframe = typeof window !== "undefined" && window.parent !== window;

  // Store a ref to the save promise resolver for handling SAVE_REQUEST
  const saveResolverRef = useRef<(() => void) | null>(null);

  // Signal to parent that editor is ready
  useEffect(() => {
    if (isInIframe) {
      window.parent.postMessage({ type: "EDITOR_READY" }, "*");
    }
  }, [isInIframe]);

  // Handle messages from parent
  useEffect(() => {
    if (!isInIframe) return;

    const handleMessage = async (event: MessageEvent<ParentMessage>) => {
      // Validate origin
      if (!ALLOWED_ORIGINS.some((origin) => event.origin.startsWith(origin))) {
        console.warn("Ignoring message from unknown origin:", event.origin);
        return;
      }

      switch (event.data.type) {
        case "AUTH":
          // Receive auth token from parent
          if (event.data.token) {
            setToken(event.data.token);
            // Load project data after receiving token
            await loadProject(event.data.token, event.data.jobId || projectId);
          }
          break;

        case "SAVE_REQUEST":
          // Parent is requesting a save (before export)
          try {
            await saveTimeline();
            window.parent.postMessage(
              { type: "SAVE_COMPLETE", version },
              event.origin
            );
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Save failed";
            const errorCode = errorMessage.includes("conflict") ? 409 : 500;
            window.parent.postMessage(
              { type: "SAVE_ERROR", code: errorCode, message: errorMessage },
              event.origin
            );
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isInIframe, projectId, version]);

  // Load project from API
  const loadProject = async (authToken: string, jobId?: string) => {
    const id = jobId || projectId;
    if (!id) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load project (${response.status})`);
      }

      const data: ProjectData = await response.json();
      setProjectData(data);
      setVersion(data.version || 1);

      // Load data into the editor
      if (data) {
        dispatch(DESIGN_LOAD, {
          payload: {
            id: data.id,
            fps: data.fps || 30,
            size: data.size || { width: 1920, height: 1080 },
            tracks: data.tracks || [],
            trackItemsMap: data.trackItemsMap || {},
            trackItemIds: data.trackItemIds || [],
            transitionsMap: {},
            transitionIds: [],
          },
        });

        // Load template script for Remotion preview rendering
        if (data.templateScript) {
          useTemplateStore.getState().setTemplateScript(data.templateScript);
        }
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Initial load with URL token (non-iframe mode or direct access)
  useEffect(() => {
    if (urlToken && !isInIframe) {
      loadProject(urlToken);
    } else if (!isInIframe && !urlToken) {
      setError("Authentication token is required. Please open this page from CourseForge.");
      setLoading(false);
    }
    // In iframe mode, we wait for AUTH message
  }, [urlToken, isInIframe, projectId]);

  // Save timeline to CourseForge
  const saveTimeline = async () => {
    if (!projectId || !token) {
      throw new Error("Cannot save: missing project ID or token");
    }

    // Get current editor state
    const editorState = useStore.getState();

    const timelineData = {
      tracks: editorState.tracks || [],
      trackItemsMap: editorState.trackItemsMap || {},
      trackItemIds: editorState.trackItemIds || [],
      fps: editorState.fps || 30,
      version: version,
    };

    const response = await fetch(`/api/project/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(timelineData),
    });

    if (response.status === 409) {
      const errorData = await response.json();
      throw new Error(`Version conflict: ${errorData.detail?.message || "Please refresh"}`);
    }

    if (!response.ok) {
      throw new Error("Failed to save timeline");
    }

    const result = await response.json();
    const newVersion = result.version || version + 1;
    setVersion(newVersion);

    // Notify parent (if opened as popup) or via broadcast
    if (window.opener) {
      window.opener.postMessage({ type: "EDITOR_SAVED", projectId }, "*");
    }

    // BroadcastChannel for same-origin tabs
    try {
      const channel = new BroadcastChannel("courseforge-editor");
      channel.postMessage({ type: "EDITOR_SAVED", projectId });
      channel.close();
    } catch {
      // BroadcastChannel not supported
    }

    return newVersion;
  };

  // Auto-save with debounce (every 30 seconds of inactivity)
  useEffect(() => {
    if (!token || !projectId) return;

    let timeout: NodeJS.Timeout;
    const autoSave = async () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        try {
          const newVersion = await saveTimeline();
          // Notify parent of version update (silent save)
          if (isInIframe) {
            window.parent.postMessage({ type: "VERSION_UPDATE", version: newVersion }, "*");
          }
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }, 30000);
    };

    const unsubscribe = useStore.subscribe(autoSave);
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [token, projectId, version, isInIframe]);

  // Handle render/export (for standalone mode)
  const handleExport = async (exportData: any) => {
    if (!projectId || !token) return;

    try {
      // First save the timeline
      await saveTimeline();

      // Then trigger render
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...exportData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start render");
      }

      const result = await response.json();

      // Notify parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "RENDER_STARTED", projectId, jobId: result.id },
          "*"
        );
      }

      try {
        const channel = new BroadcastChannel("courseforge-editor");
        channel.postMessage({ type: "RENDER_STARTED", projectId, jobId: result.id });
        channel.close();
      } catch {
        // BroadcastChannel not supported
      }

      return result;
    } catch (err) {
      console.error("Error starting render:", err);
      throw err;
    }
  };

  // In iframe mode without token, show loading while waiting for AUTH message
  if (isInIframe && !token) {
    return <LoadingScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={() => token && loadProject(token)} />;
  }

  // Pass whether we're in iframe to the editor so it can hide export button
  return <Editor id={projectId} isEmbedded={isInIframe} />;
}
