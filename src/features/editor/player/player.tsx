import { useEffect, useRef, useMemo } from "react";
import Composition from "./composition";
import { Player as RemotionPlayer, PlayerRef } from "@remotion/player";
import useStore from "../store/use-store";
import { useTemplateStore } from "@/store/use-template-store";
import { TemplateVideo } from "@/remotion/TemplateVideo";

const Player = () => {
  const playerRef = useRef<PlayerRef>(null);
  const { setPlayerRef, duration, fps, size, background } = useStore();
  const { templateScript, getTotalFrames, getFps } = useTemplateStore();

  useEffect(() => {
    setPlayerRef(playerRef as React.RefObject<PlayerRef>);
  }, [setPlayerRef]);

  // Memoize inputProps to prevent unnecessary re-renders of TemplateVideo
  const inputProps = useMemo(() => {
    if (!templateScript) return null;
    return { script: templateScript };
  }, [templateScript]);

  // If we have a TemplateVideoScript, render it with Remotion's TemplateVideo component
  if (templateScript && inputProps) {
    const totalFrames = getTotalFrames();
    const templateFps = getFps();

    return (
      <RemotionPlayer
        ref={playerRef}
        component={TemplateVideo}
        inputProps={inputProps}
        durationInFrames={totalFrames || 1}
        compositionWidth={templateScript.config.width}
        compositionHeight={templateScript.config.height}
        fps={templateFps}
        className="h-full w-full"
        overflowVisible
        // Audio is handled inside TemplateVideo via <Audio> components
      />
    );
  }

  // Fallback to track-based composition (for non-template projects)
  return (
    <RemotionPlayer
      ref={playerRef}
      component={Composition}
      durationInFrames={Math.round((duration / 1000) * fps) || 1}
      compositionWidth={size.width}
      compositionHeight={size.height}
      className={`h-full w-full bg-[${background.value}]`}
      fps={30}
      overflowVisible
    />
  );
};
export default Player;
